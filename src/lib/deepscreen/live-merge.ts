import type { LiveFundamentals, LiveQuote } from "@/lib/market/yahoo.server";

import type { Fundamentals, Stock } from "./types";

/** Per-field provenance so the UI can be honest about what is real vs. modeled. */
export type FundamentalSources = Record<keyof Fundamentals, "live" | "model">;

const ALL_MODEL: FundamentalSources = {
  pe: "model",
  peg: "model",
  ps: "model",
  pb: "model",
  evRevenue: "model",
  evEbitda: "model",
  roe: "model",
  roa: "model",
  roce: "model",
  debtToEquity: "model",
  dividendYield: "model",
  payoutRatio: "model",
  operatingLeverage: "model",
  growth: "model",
  netMargin: "model",
  ebitdaMargin: "model",
};

/** Maps a metrics.ts MetricRead["key"] to the Fundamentals field it reads from. */
export const METRIC_KEY_TO_FIELD: Record<string, keyof Fundamentals> = {
  pe: "pe",
  peg: "peg",
  ps: "ps",
  pb: "pb",
  evRevenue: "evRevenue",
  evEbitda: "evEbitda",
  roe: "roe",
  roa: "roa",
  roce: "roce",
  de: "debtToEquity",
  payout: "payoutRatio",
  oplev: "operatingLeverage",
};

const round1 = (n: number) => Number(n.toFixed(1));
const round2 = (n: number) => Number(n.toFixed(2));

/**
 * Overlays live Yahoo fundamentals on top of the modeled seed fundamentals.
 *
 * The seed model (`buildFundamentals` in stocks.ts) isn't 16 independent random
 * numbers — most fields are DERIVED from a handful of drivers (P/E, net margin,
 * ROE, debt/equity, growth, payout ratio):
 *   ebitdaMargin = netMargin + gap        ps  = pe * netMargin / 100
 *   roa  = roe / (1 + debtToEquity)       roce = roa + gap
 *   pb   = pe * roe / 100                 evEbitda = pe * ratio
 *   evRevenue = evEbitda * ebitdaMargin/100
 *   dividendYield = payoutRatio/100 * 100/pe     peg = pe / growth
 *
 * Overlaying a live number onto ONE side of a relationship while leaving its
 * dependent on the OLD modeled seed produces combinations that are not
 * "estimates" but literally impossible — a 49% net margin next to a 43%
 * EBITDA margin, or a 0% payout ratio next to a 1.24% dividend yield (this is
 * exactly what happened for Palantir, which has never paid a dividend: its
 * live payout ratio of 0 got paired with the old modeled, nonzero yield).
 *
 * So after overlaying whatever Yahoo actually returns, every dependent field
 * that ISN'T independently live gets recomputed from the model's own formula,
 * fed with the current (possibly-live) driver values — instead of being left
 * on a value derived from an input that's since changed. ROCE and operating
 * leverage have no public Yahoo equivalent, so ROCE is always re-derived from
 * ROA this way, and operating leverage always stays modeled outright.
 */
export function mergeFundamentals(
  base: Fundamentals,
  live: LiveFundamentals | null | undefined,
): { fundamentals: Fundamentals; sources: FundamentalSources } {
  if (!live) return { fundamentals: base, sources: { ...ALL_MODEL } };

  const next: Fundamentals = { ...base };
  const sources: FundamentalSources = { ...ALL_MODEL };

  const set = (key: keyof Fundamentals, v: number | null | undefined) => {
    if (typeof v === "number" && Number.isFinite(v)) {
      next[key] = v;
      sources[key] = "live";
    }
  };

  // Drivers and any field Yahoo reports directly. P/E is excluded when
  // non-positive: a loss-making company (present on every exchange, not just
  // one) can have a negative or undefined trailing P/E, and since P/E is the
  // multiplier/divisor behind P/S, P/B, EV/EBITDA and PEG below, letting a
  // bad P/E through would corrupt every derived ratio for that stock rather
  // than just leaving P/E itself unavailable.
  set("pe", typeof live.pe === "number" && live.pe > 0 ? live.pe : null);
  set("roe", live.roe);
  set("roa", live.roa);
  set("debtToEquity", live.debtToEquity);
  set("netMargin", live.netMargin);
  set("ebitdaMargin", live.ebitdaMargin);
  set("growth", live.revenueGrowth ?? live.earningsGrowth);
  set("payoutRatio", live.payoutRatio);
  set("dividendYield", live.dividendYield);
  set("ps", live.ps);
  set("pb", live.pb);
  set("evEbitda", live.evEbitda);
  set("evRevenue", live.evRevenue);
  set("peg", live.peg);

  // --- Consistency repair pass: recompute anything not independently live -

  // EBITDA margin / net margin — mutually invertible; EBITDA margin is
  // always >= net margin (D&A/interest/tax only add back).
  if (sources.netMargin === "live" && sources.ebitdaMargin !== "live") {
    next.ebitdaMargin = round1(next.netMargin + Math.max(2, base.ebitdaMargin - base.netMargin));
  } else if (sources.ebitdaMargin === "live" && sources.netMargin !== "live") {
    next.netMargin = round1(next.ebitdaMargin - Math.max(2, base.ebitdaMargin - base.netMargin));
  }
  if (next.netMargin > next.ebitdaMargin) next.ebitdaMargin = round1(next.netMargin + 2);

  // P/S tracks P/E x net margin unless Yahoo gave P/S directly.
  if (sources.ps !== "live") next.ps = round2((next.pe * next.netMargin) / 100);

  // ROA tracks ROE and leverage unless Yahoo gave ROA directly.
  if (sources.roa !== "live") next.roa = round1(next.roe / (1 + next.debtToEquity + 0.35));

  // ROCE has no Yahoo field — always re-anchor to the current ROA.
  next.roce = round1(next.roa + Math.max(1.5, base.roce - base.roa));

  // P/B tracks P/E x ROE unless Yahoo gave P/B directly.
  if (sources.pb !== "live") next.pb = round2((next.pe * next.roe) / 100);

  // EV/EBITDA moves with P/E (same multiple family) unless given directly.
  if (sources.evEbitda !== "live" && base.pe > 0) {
    next.evEbitda = round1((next.pe / base.pe) * base.evEbitda);
  }

  // EV/Revenue = EV/EBITDA x EBITDA margin, unless given directly.
  if (sources.evRevenue !== "live") {
    next.evRevenue = round2((next.evEbitda * next.ebitdaMargin) / 100);
  }

  // Payout ratio <-> dividend yield: payoutRatio = dividendYield * P/E. A
  // live payout ratio of exactly 0 is a hard fact (no dividend paid, as with
  // Palantir) — handle it unconditionally, independent of P/E's sign.
  if (sources.payoutRatio === "live" && next.payoutRatio === 0) {
    next.dividendYield = 0;
  } else if (sources.dividendYield === "live" && next.dividendYield === 0) {
    next.payoutRatio = 0;
  } else if (sources.payoutRatio === "live" && sources.dividendYield !== "live" && next.pe > 0) {
    next.dividendYield = round2((next.payoutRatio / 100) * (100 / next.pe));
  } else if (sources.dividendYield === "live" && sources.payoutRatio !== "live") {
    next.payoutRatio = Math.round(Math.min(100, Math.max(0, next.dividendYield * next.pe)));
  }

  // PEG tracks growth unless Yahoo's own PEG is what we have.
  if (sources.peg !== "live") {
    next.peg = round2(next.pe / Math.max(next.growth, 1));
  } else if (sources.growth !== "live" && next.peg > 0) {
    next.growth = round1(next.pe / next.peg);
  }

  return { fundamentals: next, sources };
}

/**
 * Builds a display-ready Stock with live price/fundamentals layered over the
 * modeled seed data. Returns the original `stock` reference (unchanged) when
 * there is nothing live to merge, so callers that rely on reference-keyed
 * caching (see `analyze()`'s WeakMap) don't lose their cache for rows that
 * have no live data yet.
 */
export function mergeLiveStock(
  stock: Stock,
  quote: LiveQuote | null | undefined,
  fundamentals: LiveFundamentals | null | undefined,
): { stock: Stock; sources: FundamentalSources } {
  if (!quote && !fundamentals) {
    return { stock, sources: { ...ALL_MODEL } };
  }

  const { fundamentals: mergedFundamentals, sources } = mergeFundamentals(
    stock.fundamentals,
    fundamentals,
  );

  const price = quote?.price ?? stock.price;
  const changePct = quote?.changePct ?? stock.changePct;
  const volume = quote?.volume || stock.volume;
  // Yahoo returns marketCap/revenue in raw currency units; our internal model
  // keeps everything in local-currency billions, so convert on the way in.
  const marketCap =
    typeof fundamentals?.marketCap === "number" && fundamentals.marketCap > 0
      ? Number((fundamentals.marketCap / 1e9).toFixed(2))
      : stock.marketCap;
  const revenue =
    typeof fundamentals?.revenue === "number" && fundamentals.revenue > 0
      ? Number((fundamentals.revenue / 1e9).toFixed(2))
      : stock.revenue;
  const epsTtm =
    typeof fundamentals?.epsTtm === "number" && Number.isFinite(fundamentals.epsTtm)
      ? fundamentals.epsTtm
      : stock.epsTtm;

  return {
    stock: {
      ...stock,
      price,
      changePct,
      volume,
      marketCap,
      revenue,
      epsTtm,
      fundamentals: mergedFundamentals,
    },
    sources,
  };
}
