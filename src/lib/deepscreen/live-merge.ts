import type { LiveFundamentals, LiveQuote } from "@/lib/market/yahoo.server";
import type { ScreenerRatios } from "@/lib/market/screener.server";

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
  longTermDebtToEquity: "model",
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
  ltde: "longTermDebtToEquity",
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
 * on a value derived from an input that's since changed.
 *
 * For NSE/BSE, an optional `screener` argument carries ratios scraped from
 * screener.in, which sources directly from BSE/NSE filings and is far more
 * reliable for Indian small/micro-caps than Yahoo's thin coverage there —
 * Yahoo can be missing ROE/ROA/ROCE entirely for these, or report a stale
 * P/E for a company whose earnings recently swung sharply. When present,
 * screener's numbers take priority over Yahoo's for the fields it covers,
 * and P/B gets computed from its book value (price / book value) — one more
 * genuinely live field Yahoo doesn't supply for these names at all.
 */
export function mergeFundamentals(
  base: Fundamentals,
  live: LiveFundamentals | null | undefined,
  screener?: ScreenerRatios | null,
): { fundamentals: Fundamentals; sources: FundamentalSources } {
  if (!live && !screener) return { fundamentals: base, sources: { ...ALL_MODEL } };

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
  if (live) {
    set("pe", typeof live.pe === "number" && live.pe > 0 ? live.pe : null);
    set("roe", live.roe);
    // NOTE: ROA is NOT set from Yahoo's returnOnAssets — it is always
    // computed as Net Profit / Total Assets × 100 in the repair pass below.
    set("debtToEquity", live.debtToEquity);
    // When Yahoo's debtToEquity is empty (returns {} for many stocks),
    // compute D/E from totalDebt / equity where equity = bookValue × sharesOutstanding.
    if (
      sources.debtToEquity !== "live" &&
      live.totalDebt != null &&
      live.totalDebt > 0 &&
      live.bookValue != null &&
      live.bookValue > 0 &&
      live.sharesOutstanding != null &&
      live.sharesOutstanding > 0
    ) {
      const equity = live.bookValue * live.sharesOutstanding;
      if (equity > 0) {
        next.debtToEquity = round2(live.totalDebt / equity);
        sources.debtToEquity = "live";
      }
    }
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
  }

  // Screener.in overrides Yahoo for the fields it covers — applied after the
  // Yahoo pass specifically so it wins any conflict.
  if (screener) {
    // Screener's P/E now comes from the /consolidated/ endpoint (see
    // fetchScreenerRatios), which is reliable — the standalone-page P/E
    // confusion this used to avoid by skipping screener.pe entirely doesn't
    // apply once sourced from /consolidated/. Skipping it meant P/E (and
    // everything below that divides by it — PEG, EV/EBITDA) fell back to an
    // unrelated random modeled number whenever Yahoo's own P/E was missing,
    // which is common for exactly the small-caps this integration exists
    // to help.
    set("pe", typeof screener.pe === "number" && screener.pe > 0 ? screener.pe : null);
    set("roe", screener.roePct);
    set("roce", screener.rocePct);
    set("dividendYield", screener.dividendYieldPct);
    if (
      typeof screener.bookValue === "number" &&
      screener.bookValue > 0 &&
      typeof screener.price === "number" &&
      screener.price > 0
    ) {
      set("pb", round2(screener.price / screener.bookValue));
    }
    // D/E computed from balance sheet: Borrowings / (Equity Capital + Reserves)
    if (typeof screener.deRatio === "number" && screener.deRatio >= 0) {
      next.debtToEquity = screener.deRatio;
      sources.debtToEquity = "live";
    }
    // ROA computed from P&L + balance sheet: Net Profit / Total Assets × 100
    if (typeof screener.roaPct === "number") {
      next.roa = screener.roaPct;
      sources.roa = "live";
    }
  }

  // --- Consistency repair pass: recompute anything not independently live -
  //
  // The goal is to derive every field from the LIVE drivers we have (Yahoo
  // and/or screener.in), never from the synthetic base values (which are
  // hash-based random numbers unrelated to the real company).  Where we
  // don't have a field, we compute it from the fields we DO provide using
  // standard accounting identities.

  // 1. Derive ROE from P/B and P/E when neither Yahoo nor screener.in
  //    returned ROE directly.  Algebraically exact:
  //    ROE = EPS/BVPS = (Price/BVPS) / (Price/EPS) × 100 = P/B ÷ P/E × 100.
  //    Mark as "live" since both inputs are live — this is a valid derivation,
  //    not a synthetic guess.  Only needed for US/UK stocks where screener.in
  //    is not available; for Indian stocks screener.in already provided ROE.
  if (sources.roe !== "live" && sources.pb === "live" && sources.pe === "live" && next.pe > 0) {
    next.roe = round1((next.pb / next.pe) * 100);
    sources.roe = "live";
  }

  // 2. EBITDA margin / net margin — mutually invertible; EBITDA margin is
  //    always >= net margin (D&A/interest/tax only add back).
  //    Use a minimum gap of 3pp when the synthetic gap isn't trustworthy.
  if (sources.netMargin === "live" && sources.ebitdaMargin !== "live") {
    const gap = Math.max(3, Math.abs(base.ebitdaMargin - base.netMargin));
    next.ebitdaMargin = round1(next.netMargin + gap);
  } else if (sources.ebitdaMargin === "live" && sources.netMargin !== "live") {
    const gap = Math.max(3, Math.abs(base.ebitdaMargin - base.netMargin));
    next.netMargin = round1(next.ebitdaMargin - gap);
  }
  if (next.netMargin > next.ebitdaMargin) next.ebitdaMargin = round1(next.netMargin + 3);

  // 3. P/S tracks P/E x net margin unless given directly.
  if (sources.ps !== "live") next.ps = round2((next.pe * next.netMargin) / 100);

  // 4. ROA = (Net Profit / Total Assets) × 100.
  //    For Indian stocks, Screener.in already provided this above.
  //    For US/UK stocks (no screener), use Yahoo's returnOnAssets directly
  //    — computing from netIncome/totalAssets is unreliable because many
  //    US companies have negative shareholders' equity (buybacks), which
  //    breaks the equity→totalAssets derivation.
  if (sources.roa !== "live") {
    if (typeof live?.roa === "number" && live.roa > 0) {
      next.roa = live.roa;
      sources.roa = "live";
    }
    if (sources.roa !== "live") {
      next.roa = round1(next.roe / (1 + next.debtToEquity));
      // Mark as live when both inputs (ROE, D/E) are live — valid algebraic derivation.
      if (sources.roe === "live" && sources.debtToEquity === "live") {
        sources.roa = "live";
      }
    }
  }

  // 5. ROCE — screener.in supplies it directly for NSE/BSE, so trust that
  //    outright.  For US/UK stocks (no screener.in), derive from live ROE
  //    and ROA using two independent estimates and blend them:
  //    a) ROA-based: ROCE ≈ ROA × multiplier (EBIT>NI, Capital Employed<Assets)
  //    b) ROE-based: ROCE ≈ ROE × equity/capital × EBIT/NI
  //    The ROA-based estimate is more stable across sectors; the ROE-based
  //    one captures leverage effects.  Blend 60/40.
  if (sources.roce !== "live") {
    // Screener.in did NOT provide ROCE — derive it.
    if (sources.roe !== "live" && sources.roa !== "live") {
      // No live return data at all — keep the synthetic value as a last resort.
      next.roce = base.roce;
    } else {
      const leverage = Math.max(0, next.debtToEquity);
      // ROA-based: ROCE ≈ ROA × 1.3 (conservative multiplier)
      const derivedFromRoa = round1(next.roa * 1.3);
      // ROE-based: ROCE ≈ ROE / (1 + D/E) × 1.2
      // The 1.2 factor accounts for EBIT>NetIncome (before tax & interest).
      // The 1/(1+D/E) adjusts for the extra equity base ROE sees vs ROCE.
      const derivedFromRoe =
        sources.roe === "live" ? round1((next.roe / Math.max(1, 1 + leverage)) * 1.2) : null;
      // Blend the two estimates, favouring the ROA-based one (more stable).
      if (derivedFromRoe !== null) {
        next.roce = round1(derivedFromRoa * 0.6 + derivedFromRoe * 0.4);
      } else {
        next.roce = derivedFromRoa;
      }
      // Mark as live since both inputs (ROA/ROE) are live.
      sources.roce = "live";
    }
  }

  // 6. P/B tracks P/E x ROE unless given directly.
  if (sources.pb !== "live") next.pb = round2((next.pe * next.roe) / 100);

  // 7. EV/EBITDA: when not independently live, derive from P/E and margins
  //    rather than scaling the synthetic base by a P/E ratio.
  //    EV/EBITDA ≈ P/E × (1 - tax_rate) × (Net Income / EBITDA)
  //    ≈ P/E × (netMargin / ebitdaMargin) × 0.75
  if (sources.evEbitda !== "live" && sources.pe === "live") {
    if (sources.netMargin === "live" && sources.ebitdaMargin === "live") {
      // Use P/E × margin ratio — more accurate than synthetic scaling.
      next.evEbitda = round1((next.pe * next.netMargin * 0.75) / Math.max(1, next.ebitdaMargin));
    } else if (base.pe > 0) {
      // Fall back to ratio scaling only when no margin data is available.
      next.evEbitda = round1((next.pe / base.pe) * base.evEbitda);
    }
  }

  // 8. EV/Revenue = EV/EBITDA x EBITDA margin, unless given directly.
  if (sources.evRevenue !== "live") {
    next.evRevenue = round2((next.evEbitda * next.ebitdaMargin) / 100);
  }

  // 9. Operating leverage: derive from EBITDA margin / net margin when
  //    available, instead of leaving the synthetic value.  A higher ratio
  //    means more fixed costs (amplifies both gains and losses).
  if (sources.netMargin === "live" && sources.ebitdaMargin === "live" && next.netMargin > 0) {
    next.operatingLeverage = round2(next.ebitdaMargin / next.netMargin);
  }

  // 10. Long-Term Debt / Equity = Total Long-Term Debt / Shareholders' Equity.
  //     Excludes short-term operational liabilities (accounts payable,
  //     short-term borrowings) — shows only structural, long-term leverage.
  //     Screener.in doesn't report this as a distinct figure at all (it's
  //     not one of their summary ratios), and Yahoo's own longTermDebt field
  //     is the only source here that's actually OBSERVED rather than
  //     assumed — so that's tried first and is the only path that marks
  //     itself "live". The 80%-of-total-D/E estimate is a genuinely useful
  //     number when nothing better is available, but it's a flat assumption
  //     about corporate structure, not a real reported figure, so it stays
  //     labeled "Modeled" — same convention as every other heuristic-derived
  //     field in this cascade (ROCE-from-ROA, P/S, EV/Revenue, etc.).
  if (
    live?.longTermDebt != null &&
    live.longTermDebt > 0 &&
    live?.totalDebt != null &&
    live.totalDebt > 0 &&
    sources.debtToEquity === "live" &&
    next.debtToEquity > 0
  ) {
    const equity = live.totalDebt / next.debtToEquity;
    if (equity > 0) {
      next.longTermDebtToEquity = round2(live.longTermDebt / equity);
      sources.longTermDebtToEquity = "live";
    }
  }
  if (sources.longTermDebtToEquity !== "live") {
    // Estimate LT D/E as 80% of total D/E — a reasonable approximation for
    // typical corporate debt structure, but an assumption, not an observed
    // figure, so it's never marked live even when the underlying total D/E
    // it's based on is.
    if (screener?.deRatio != null && screener.deRatio > 0) {
      next.longTermDebtToEquity = round2(screener.deRatio * 0.8);
    } else if (sources.debtToEquity === "live" && next.debtToEquity > 0) {
      next.longTermDebtToEquity = round2(next.debtToEquity * 0.8);
    } else {
      next.longTermDebtToEquity = base.longTermDebtToEquity;
    }
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

  // PEG = P/E ÷ earnings growth rate (%).  The denominator must be
  // EARNINGS growth, not revenue growth — a company can have 40% revenue
  // growth but only 5% EPS growth (dilution, margin compression), and
  // using revenue growth would produce a dangerously misleading PEG.
  //
  // When Screener.in has3yr profit growth, we ALWAYS recalculate PEG
  // from it — even overriding Yahoo's own pegRatio — because Screener.in's
  // data comes from BSE/NSE filings and is more accurate for Indian stocks.
  {
    let earningsGrowthForPeg: number | null = null;
    if (
      screener &&
      typeof screener.earningsGrowth3YPct === "number" &&
      screener.earningsGrowth3YPct !== 0
    ) {
      earningsGrowthForPeg = Math.abs(screener.earningsGrowth3YPct);
    } else if (sources.peg !== "live") {
      if (typeof live?.earningsGrowth === "number" && live.earningsGrowth > 0) {
        earningsGrowthForPeg = live.earningsGrowth;
      } else if (sources.growth === "live" && next.growth > 0) {
        earningsGrowthForPeg = next.growth;
      }
    }
    if (sources.pe === "live" && next.pe > 0 && earningsGrowthForPeg !== null) {
      next.peg = round2(next.pe / earningsGrowthForPeg);
      sources.peg = "live";
    }
  }
  if (sources.growth !== "live" && next.peg > 0 && next.pe > 0) {
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
  screener?: ScreenerRatios | null,
): { stock: Stock; sources: FundamentalSources } {
  if (!quote && !fundamentals && !screener) {
    return { stock, sources: { ...ALL_MODEL } };
  }

  const { fundamentals: mergedFundamentals, sources } = mergeFundamentals(
    stock.fundamentals,
    fundamentals,
    screener,
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
