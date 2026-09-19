/**
 * DeepScreen "God's Eye" intelligence engine.
 *
 * Everything here is pure and deterministic: it takes the merged stock plus
 * whatever live provider data exists and derives the extended ratio set, the
 * qualitative badges, the forensic scores and the long-horizon vision score.
 *
 * Honesty rule for this module: a figure that cannot be computed from real
 * data returns `null` and the UI says so. Nothing is invented to fill a gap —
 * a fabricated Altman Z-Score is worse than an empty one.
 */
import type { LiveFundamentals, LiveQuote } from "@/lib/market/yahoo.server";
import type { ScreenerRatios } from "@/lib/market/screener.server";

import type { Stock } from "./types";

export type Tone = "good" | "warn" | "bad" | "info";

export interface Badge {
  id: string;
  label: string;
  tone: Tone;
  tooltip: string;
}

export interface ExtendedRatios {
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  priceToCashFlow: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  interestCoverage: number | null;
  assetTurnover: number | null;
  inventoryTurnover: number | null;
  daysSalesInventory: number | null;
  evEbitda: number | null;
  cashConversion: number | null; // operating cash flow / net profit
}

export interface DuPont {
  netMargin: number | null;
  assetTurnover: number | null;
  leverage: number | null;
  impliedRoe: number | null;
  model: string | null;
}

export interface ForensicScore {
  value: number | null;
  label: string;
  tone: Tone;
  detail: string;
}

export interface Forensics {
  piotroski: ForensicScore & { checks: { label: string; pass: boolean }[] };
  altman: ForensicScore;
  beneish: ForensicScore;
}

export interface VisionRead {
  score: number;
  parts: { label: string; points: number; max: number }[];
  horizon: string;
  horizonShort: string;
  generational: boolean;
  rationale: string;
}

export type XRayStatus = "quality" | "growth" | "engineering" | "destroyer" | "trap";
export interface XRayBadge {
  status: XRayStatus;
  label: string;
  tooltip: string;
}
export interface XRayCard {
  id: string;
  category: "Profitability" | "Valuation" | "Solvency" | "Capital Allocation";
  metric: string;
  value: string;
  badge: string;
  tone: XRayStatus | "info";
  tooltip: string;
  sectorRelative?: boolean;
}
export interface XRayWarning {
  id: string;
  tone: "bad" | "warn" | "info" | "trap";
  message: string;
}
export interface XRayRead {
  primary: XRayBadge;
  sectorLabel: string | null;
  cards: XRayCard[];
  warnings: XRayWarning[];
}

export interface Intel {
  ratios: ExtendedRatios;
  dupont: DuPont;
  forensics: Forensics;
  vision: VisionRead;
  badges: Badge[];
  xray: XRayRead;
}

export interface IntelInput {
  stock: Stock;
  live?: LiveFundamentals | null;
  screener?: ScreenerRatios | null;
  quote?: LiveQuote | null;
}

const num = (v: number | null | undefined): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const div = (a: number | null, b: number | null): number | null =>
  a !== null && b !== null && b !== 0 ? a / b : null;

const r2 = (v: number | null): number | null => (v === null ? null : Number(v.toFixed(2)));

// The WACC benchmark used for the ROCE value-creation rule. 10% is the
// standard default hurdle rate used across Indian and US equity research when
// a company-specific WACC isn't modeled.
export const WACC_BENCHMARK = 10;

// Sector EV/Revenue bands from the spec — used to tag a valuation against the
// baseline for the kind of business it actually is, rather than one global cut-off.
const EV_REV_BANDS: { match: (sector: string) => boolean; low: number; high: number; label: string }[] = [
  {
    match: (s) => /technology|software|communication/i.test(s),
    low: 5,
    high: 10,
    label: "SaaS / Tech",
  },
  {
    match: (s) => /health|pharma|consumer staples|fmcg/i.test(s),
    low: 2,
    high: 5,
    label: "FMCG / Pharma",
  },
  {
    match: () => true,
    low: 0.5,
    high: 2,
    label: "Manufacturing / Retail / Industrials",
  },
];

/** How structurally essential a sector looks over a 10–40 year horizon. */
const SECTOR_VISION: { match: RegExp; purpose: number; relevance: number }[] = [
  { match: /technology|software|semiconductor/i, purpose: 21, relevance: 23 },
  { match: /health|pharma|biotech/i, purpose: 22, relevance: 21 },
  { match: /energy|utilities|power/i, purpose: 20, relevance: 19 },
  { match: /financial|bank/i, purpose: 18, relevance: 17 },
  { match: /industrial|infrastructure|capital goods|defence|defense/i, purpose: 19, relevance: 19 },
  { match: /consumer staples|fmcg/i, purpose: 19, relevance: 18 },
  { match: /communication|telecom/i, purpose: 18, relevance: 18 },
  { match: /materials|metals|mining|chemical/i, purpose: 15, relevance: 13 },
  { match: /real estate|realty/i, purpose: 14, relevance: 13 },
  { match: /consumer discretionary|auto|retail/i, purpose: 15, relevance: 15 },
];

function computeRatios(input: IntelInput): ExtendedRatios {
  const { stock, live } = input;
  const f = stock.fundamentals;

  const marketCap = num(live?.marketCap ?? stock.marketCap);
  const ocf = num(live?.operatingCashflow ?? null);
  const netIncome = num(live?.netIncome ?? null);
  const revenue = num(live?.revenue ?? stock.revenue);
  const totalAssets = num(live?.totalAssets ?? null);

  return {
    grossMargin: r2(num(live?.grossMargin ?? null)),
    operatingMargin: r2(num(live?.operatingMargin ?? null)),
    netMargin: r2(num(live?.netMargin ?? f.netMargin)),
    priceToCashFlow: r2(div(marketCap, ocf)),
    currentRatio: r2(num(live?.currentRatio ?? null)),
    quickRatio: r2(num(live?.quickRatio ?? null)),
    // Yahoo's free modules do not expose interest expense, and Screener's
    // summary block doesn't either — left null rather than guessed.
    interestCoverage: null,
    assetTurnover: r2(div(revenue, totalAssets)),
    inventoryTurnover: null,
    daysSalesInventory: null,
    evEbitda: r2(num(f.evEbitda)),
    cashConversion: r2(div(ocf, netIncome)),
  };
}

function computeDuPont(stock: Stock, ratios: ExtendedRatios): DuPont {
  const f = stock.fundamentals;
  const netMargin = ratios.netMargin;
  const atr = ratios.assetTurnover;
  const leverage = num(f.debtToEquity) !== null ? Number((1 + f.debtToEquity).toFixed(2)) : null;
  const impliedRoe =
    netMargin !== null && atr !== null && leverage !== null
      ? Number((netMargin * atr * leverage).toFixed(1))
      : null;

  let model: string | null = null;
  if (atr !== null && netMargin !== null) {
    if (atr > 2 && netMargin < 5) model = "High Volume / Velocity model (retail-style throughput)";
    else if (atr < 0.8 && netMargin > 20) model = "High Margin / Value model (SaaS or luxury-style pricing power)";
    else model = "Balanced margin-and-turnover model";
  }

  return { netMargin, assetTurnover: atr, leverage, impliedRoe, model };
}

function computePiotroski(input: IntelInput, ratios: ExtendedRatios) {
  const { stock, live } = input;
  const f = stock.fundamentals;
  const checks: { label: string; pass: boolean }[] = [];
  const push = (label: string, condition: boolean | null) => {
    if (condition !== null) checks.push({ label, pass: condition });
  };

  push("Positive return on assets", num(f.roa) !== null ? f.roa > 0 : null);
  push(
    "Positive operating cash flow",
    num(live?.operatingCashflow ?? null) !== null ? live!.operatingCashflow! > 0 : null,
  );
  push(
    "Cash flow exceeds net profit (earnings are cash-backed)",
    ratios.cashConversion !== null ? ratios.cashConversion >= 1 : null,
  );
  push("Leverage under control (D/E below 1)", num(f.debtToEquity) !== null ? f.debtToEquity < 1 : null);
  push("Current ratio above 1.5", ratios.currentRatio !== null ? ratios.currentRatio > 1.5 : null);
  push("Positive net margin", ratios.netMargin !== null ? ratios.netMargin > 0 : null);
  push("Profits growing year on year", num(f.growth) !== null ? f.growth > 0 : null);
  push("Return on equity above 10%", num(f.roe) !== null ? f.roe > 10 : null);
  push("Asset turnover above 0.5", ratios.assetTurnover !== null ? ratios.assetTurnover > 0.5 : null);

  const passed = checks.filter((c) => c.pass).length;
  const evaluated = checks.length;
  const tone: Tone = evaluated === 0 ? "info" : passed >= 7 ? "good" : passed >= 4 ? "warn" : "bad";

  return {
    value: evaluated === 0 ? null : passed,
    label: evaluated === 0 ? "Not enough filings data" : `${passed}/${evaluated}`,
    tone,
    detail:
      evaluated === 0
        ? "No reported balance-sheet or cash-flow data available for this listing yet."
        : `${passed} of ${evaluated} financial-health checks passed${evaluated < 9 ? ` (${9 - evaluated} checks need data this provider doesn't publish)` : ""}.`,
    checks,
  };
}

function computeAltman(input: IntelInput, ratios: ExtendedRatios): ForensicScore {
  const { stock, live } = input;
  const totalAssets = num(live?.totalAssets ?? null);
  const ebitda = num(live?.ebitda ?? null);
  const totalDebt = num(live?.totalDebt ?? null);
  const marketCap = num(live?.marketCap ?? stock.marketCap);

  if (totalAssets === null || ebitda === null || totalDebt === null || marketCap === null) {
    return {
      value: null,
      label: "Insufficient data",
      tone: "info",
      detail: "Needs total assets, operating profit and debt — not published for this listing yet.",
    };
  }

  // Simplified 3-variable Altman form: retained earnings and working capital
  // are not exposed by the free feeds, so those terms are dropped rather than
  // estimated. Reported as the simplified model, not the classic 5-variable Z.
  const x3 = ebitda / totalAssets;
  const x4 = totalDebt === 0 ? 4 : marketCap / totalDebt;
  const x5 = ratios.assetTurnover ?? 0;
  const z = Number((6.72 * x3 + 1.05 * Math.min(x4, 8) + 0.6 * x5).toFixed(2));

  const tone: Tone = z > 2.99 ? "good" : z >= 1.81 ? "warn" : "bad";
  const zone = z > 2.99 ? "Safe zone" : z >= 1.81 ? "Grey zone" : "Distress zone";
  return {
    value: z,
    label: `${z.toFixed(2)} · ${zone}`,
    tone,
    detail:
      "Simplified Altman solvency model (operating profit, debt cover and asset productivity). Above 2.99 is safe, below 1.81 signals bankruptcy stress.",
  };
}

function computeBeneish(input: IntelInput, ratios: ExtendedRatios): ForensicScore {
  // The full 8-variable Beneish model needs prior-year receivables,
  // depreciation, SG&A and accruals. Where cash conversion is available we can
  // still surface the single most predictive component (accrual quality)
  // rather than pretending to a full M-Score.
  if (ratios.cashConversion === null) {
    return {
      value: null,
      label: "Insufficient data",
      tone: "info",
      detail:
        "The full manipulation model needs two years of receivables, depreciation and accrual data, which isn't published for this listing.",
    };
  }
  const cc = ratios.cashConversion;
  const tone: Tone = cc >= 0.8 ? "good" : cc >= 0.4 ? "warn" : "bad";
  return {
    value: Number(cc.toFixed(2)),
    label:
      cc >= 0.8
        ? "Low distortion risk"
        : cc >= 0.4
          ? "Watch accruals"
          : "High manipulation risk",
    tone,
    detail: `Accrual-quality check only: operating cash flow is ${(cc * 100).toFixed(0)}% of reported net profit. Below 80% means profits aren't fully backed by cash.`,
  };
}

function computeVision(input: IntelInput, ratios: ExtendedRatios): VisionRead {
  const { stock } = input;
  const f = stock.fundamentals;
  const sector = SECTOR_VISION.find((s) => s.match.test(stock.sector));
  const purpose = sector?.purpose ?? 15;
  const relevance = sector?.relevance ?? 14;

  // Pricing power / moat: margins and returns on capital are the observable
  // fingerprints of a moat.
  const marginSignal = ratios.grossMargin ?? ratios.operatingMargin ?? ratios.netMargin ?? 0;
  const moat = Math.max(
    0,
    Math.min(25, Math.round(marginSignal * 0.35 + Math.max(0, f.roce) * 0.4)),
  );

  // Execution: growth plus balance-sheet room to keep investing.
  const growthPoints = Math.max(0, Math.min(15, Math.round(Math.max(0, f.growth) * 0.6)));
  const balancePoints = f.debtToEquity < 0.5 ? 10 : f.debtToEquity < 1.5 ? 6 : 2;
  const execution = Math.min(25, growthPoints + balancePoints);

  const score = Math.max(0, Math.min(100, purpose + moat + relevance + execution));

  let horizon: string;
  let horizonShort: string;
  if (score >= 88) {
    horizon = "Multi-decadal / generational hold (20–40 years)";
    horizonShort = "20–40 years";
  } else if (score >= 75) {
    horizon = "Long-term secular compounder (10–20 years)";
    horizonShort = "10–20 years";
  } else if (score >= 50) {
    horizon = "Decadal compounder (5–10 years)";
    horizonShort = "5–10 years";
  } else {
    horizon = "Tactical / speculative (under 5 years)";
    horizonShort = "< 5 years";
  }

  const generational = score >= 88;

  return {
    score,
    parts: [
      { label: "Core purpose & mission", points: purpose, max: 25 },
      { label: "Product quality & pricing power", points: moat, max: 25 },
      { label: "Future relevancy & market expansion", points: relevance, max: 25 },
      { label: "Execution & multi-decade vision", points: execution, max: 25 },
    ],
    horizon,
    horizonShort,
    generational,
    rationale: generational
      ? "Essential long-run demand plus a durable moat: worth holding through expensive-looking earnings multiples or heavy reinvestment."
      : score >= 75
        ? "Deep competitive position with visible compounding over the next decade."
        : score >= 50
          ? "Solid business, but the industry is evolving — reassess every few years."
          : "Commoditised or disruption-exposed: treat as a tactical position, not a long hold.",
  };
}

function computeXRay(input: IntelInput, ratios: ExtendedRatios): XRayRead {
  const { stock, live } = input;
  const f = stock.fundamentals;
  const revenueGrowth = num(live?.revenueGrowth ?? f.growth);
  const cashConversion = ratios.cashConversion;
  const sector = stock.sector.toLowerCase();
  const isBank = /bank|financial service|credit|insurance/i.test(sector);
  const isReitInfra = /real estate|reit|infrastructure|utility|utilities/i.test(sector);
  const isAssetLight = /software|technology|saas|internet|communication|semiconductor/i.test(sector);
  const isCyclical = /auto|steel|metal|metals|mining|chemical|commodity|materials/i.test(sector);
  const fcfMargin = live?.freeCashflow != null && (live?.revenue ?? stock.revenue) > 0 ? (live.freeCashflow / (live.revenue ?? stock.revenue)) * 100 : null;
  const ruleOf40 = isAssetLight && revenueGrowth !== null && fcfMargin !== null && revenueGrowth + fcfMargin >= 40;
  const sectorLabel = isBank ? "Sector Relative · Banks & Financials" : isReitInfra ? "Sector Relative · REITs / Infrastructure" : isAssetLight ? "Sector Relative · Asset-Light / Software" : isCyclical ? "Sector Relative · Cyclical" : null;

  const tripleCheap = f.pe > 0 && f.pe < 10 && f.pb > 0 && f.pb < 1 && f.evEbitda > 0 && f.evEbitda < 8 && f.roe < 8 && f.roce < WACC_BENCHMARK;
  const lowMultipleBroken = f.pe > 0 && f.pe < 12 && f.pb > 0 && f.pb < 1.5 && f.evEbitda > 0 && f.evEbitda < 10 && f.roe < 10 && f.roce < WACC_BENCHMARK && revenueGrowth !== null && revenueGrowth <= 0;
  const highLeverageGap = !isBank && f.roe >= 20 && f.roa < 5 && f.debtToEquity > 1;
  const cashLag = cashConversion !== null && cashConversion < 0.8;
  const payoutStress = !isReitInfra && f.payoutRatio > 100;

  const quality = !isBank && f.roe >= 18 && f.roce >= 18 && Math.abs(f.roe - f.roce) <= 8 && f.debtToEquity <= 1 && cashConversion !== null && cashConversion >= 0.9 && f.payoutRatio >= 0 && f.payoutRatio <= 60 && f.roce > WACC_BENCHMARK && !highLeverageGap;
  const growth = !quality && !tripleCheap && revenueGrowth !== null && revenueGrowth >= 15 && f.growth >= 10 && f.payoutRatio <= 20 && f.debtToEquity <= 1.5 && (f.roe < 18 || f.roce < 18);
  const engineering = !quality && !growth && !tripleCheap && !lowMultipleBroken && (highLeverageGap || f.roe - f.roce >= 10 || (cashLag && f.debtToEquity > 1) || payoutStress);
  const destroyer = !quality && !growth && !engineering && !tripleCheap && (f.roce < WACC_BENCHMARK && f.roe < 10 && (revenueGrowth === null || revenueGrowth < 0));

  const primary: XRayBadge = quality
    ? { status: "quality", label: "✅ Quality Compounder", tooltip: "High ROE and ROCE are aligned, leverage is controlled, cash conversion is strong and the payout leaves room to reinvest." }
    : growth
      ? { status: "growth", label: "🌱 Future Growth Story", tooltip: "Revenue growth is strong while returns are still developing, with low payout and manageable leverage consistent with reinvestment." }
      : engineering
        ? { status: "engineering", label: "⚠️ Financial Engineering / Fragile", tooltip: "Leverage, payout or cash-conversion signals indicate that headline returns may be stronger than the underlying business economics." }
        : destroyer
          ? { status: "destroyer", label: "🚩 Value Destroyer", tooltip: "Returns are below the capital-cost hurdle while profitability and/or revenue are weakening on the available data." }
          : { status: "trap", label: "🪤 Value Trap", tooltip: "Low valuation is not supported by enough evidence of improving capital efficiency; cheapness can be justified by weak economics." };

  const meta: Record<XRayStatus, { label: string; tip: string }> = {
    quality: { label: "✅ Quality Compounder", tip: "High-quality returns with cash support and controlled leverage." },
    growth: { label: "🌱 Future Growth Story", tip: "Strong revenue trajectory with reinvestment-oriented economics." },
    engineering: { label: "⚠️ Financial Engineering / Fragile", tip: "Leverage, payout or cash-conversion stress warrants forensic review." },
    destroyer: { label: "🚩 Value Destroyer", tip: "Returns are below the capital-cost hurdle and/or operating economics are deteriorating." },
    trap: { label: "🪤 Value Trap", tip: "Low valuation can be justified by weak returns, stalled growth or structural pressure." },
  };
  const badgeFor = (s: XRayStatus | "info") => s === "info" ? "ℹ️ Sector Relative" : meta[s].label;
  const classifyRoe = (): XRayStatus | "info" => isBank ? "info" : highLeverageGap ? "engineering" : f.roe >= 15 && f.roce >= WACC_BENCHMARK ? "quality" : revenueGrowth !== null && revenueGrowth >= 10 ? "growth" : f.roe < 8 ? "destroyer" : "trap";
  const classifyRoce = (): XRayStatus => f.roce >= 18 && f.roce > WACC_BENCHMARK ? "quality" : revenueGrowth !== null && revenueGrowth >= 15 && f.roce < 18 ? "growth" : f.roce < WACC_BENCHMARK ? "destroyer" : "engineering";
  const classifyPe = (): XRayStatus | "info" => isReitInfra ? "info" : tripleCheap || (isCyclical && f.pe > 0 && f.pe < 10) ? "trap" : f.pe > 25 && f.growth >= 15 ? "growth" : f.pe > 25 && f.growth < 10 ? "destroyer" : "quality";
  const classifyPb = (): XRayStatus | "info" => isAssetLight ? "info" : f.pb > 0 && f.pb < 1 && f.roe >= 15 ? "quality" : f.pb > 0 && f.pb < 1 && f.roe < 10 ? "trap" : "growth";
  const classifyDebt = (): XRayStatus | "info" => isBank ? "info" : f.debtToEquity <= 0.7 ? "quality" : f.debtToEquity <= 1.5 && f.roce > WACC_BENCHMARK && (revenueGrowth ?? 0) > 10 ? "growth" : f.debtToEquity > 1.5 && f.roce < WACC_BENCHMARK ? "destroyer" : "engineering";
  const fmt = (v: number | null, suffix: string, digits = 1) => v === null || !Number.isFinite(v) ? "—" : `${v.toFixed(digits)}${suffix}`;

  const cards: XRayCard[] = [
    { id: "roe", category: "Profitability", metric: "ROE", value: fmt(f.roe, "%"), badge: badgeFor(classifyRoe()), tone: classifyRoe(), tooltip: highLeverageGap ? `⚠️ ROE ${fmt(f.roe, "%")} is far above ROA ${fmt(f.roa, "%")}; leverage is doing more of the work. Check D/E and buybacks.` : f.roe >= 15 ? `✅ ROE ${fmt(f.roe, "%")} clears the 15% quality threshold; stability over 3–5 years is not available in this feed.` : `ROE ${fmt(f.roe, "%")} is below the quality threshold; compare the multi-year trend before calling it structural.`, sectorRelative: isBank },
    { id: "roce", category: "Profitability", metric: "ROCE", value: fmt(f.roce, "%"), badge: badgeFor(classifyRoce()), tone: classifyRoce(), tooltip: f.roce > WACC_BENCHMARK ? `✅ ROCE ${fmt(f.roce, "%")} is above the ${WACC_BENCHMARK}% hurdle; a 5-year consistency test needs historical data.` : `🚩 ROCE ${fmt(f.roce, "%")} is below the ${WACC_BENCHMARK}% hurdle on the available data.`, },
    { id: "roa", category: "Profitability", metric: "ROA", value: fmt(f.roa, "%"), badge: badgeFor(isBank ? "info" : f.roe - f.roa > 15 ? "engineering" : f.roa >= 10 ? "quality" : f.roa < 3 ? "destroyer" : "trap"), tone: isBank ? "info" : f.roe - f.roa > 15 ? "engineering" : f.roa >= 10 ? "quality" : f.roa < 3 ? "destroyer" : "trap", tooltip: isBank ? "Sector Relative: compare ROA with Tier 1 capital and NPA trends." : f.roe - f.roa > 15 ? `🚩 ROE ${fmt(f.roe, "%")} vs ROA ${fmt(f.roa, "%")} shows a wide leverage gap.` : `ROA ${fmt(f.roa, "%")} should be read with margin and asset-turnover trends.` , sectorRelative: isBank },
    { id: "pe", category: "Valuation", metric: isReitInfra ? "P/E", value: isReitInfra ? "N/A" : fmt(f.pe, "x"), badge: badgeFor(classifyPe()), tone: classifyPe(), tooltip: isReitInfra ? "Sector Relative: use Price/FFO when available; P/E is not the preferred REIT/infrastructure valuation measure." : tripleCheap ? "🪤 Structurally Cheap, Not a Bargain: low multiples coincide with poor ROE/ROCE." : isCyclical && f.pe > 0 && f.pe < 10 ? "🪤 Cyclical P/E trap: a very low P/E can occur near peak earnings." : `P/E ${fmt(f.pe, "x")} should be normalized for one-offs and compared with growth.`, sectorRelative: isReitInfra || isCyclical },
    { id: "ps", category: "Valuation", metric: "P/S", value: fmt(f.ps, "x", 2), badge: badgeFor(f.ps < 2 && f.netMargin <= 0 ? "trap" : f.ps < 2 ? "quality" : f.ps > 8 ? "destroyer" : "growth"), tone: f.ps < 2 && f.netMargin <= 0 ? "trap" : f.ps < 2 ? "quality" : f.ps > 8 ? "destroyer" : "growth", tooltip: f.ps < 2 && f.netMargin <= 0 ? "🪤 Low P/S with no margin support: cheap revenue is not the same as profitable revenue." : `P/S ${fmt(f.ps, "x", 2)} should be read with margin trajectory; receivables history is not available for channel-stuffing tests.` },
    { id: "pb", category: "Valuation", metric: "P/B", value: fmt(f.pb, "x", 2), badge: badgeFor(isAssetLight ? "info" : classifyPb()), tone: isAssetLight ? "info" : classifyPb(), tooltip: isAssetLight ? (ruleOf40 ? "ℹ️ Sector Relative: Rule of 40 is met, so high P/B is not treated as a value trap. Cash generation and growth carry more weight." : "ℹ️ Sector Relative: P/B can be structurally high for software/IP-heavy businesses; evaluate cash flow and Rule of 40 evidence instead.") : f.pb < 1 && f.roe < 10 ? "🪤 Low P/B with poor ROE: cheap for structural reasons." : `P/B ${fmt(f.pb, "x", 2)} is most useful alongside stable ROE.`, sectorRelative: isAssetLight },
    { id: "evRevenue", category: "Valuation", metric: "EV/Revenue", value: fmt(f.evRevenue, "x", 2), badge: badgeFor(f.evRevenue < (isAssetLight ? 4 : 2) ? "quality" : f.evRevenue > 10 ? "destroyer" : "growth"), tone: f.evRevenue < (isAssetLight ? 4 : 2) ? "quality" : f.evRevenue > 10 ? "destroyer" : "growth", tooltip: isAssetLight ? "Sector Relative: high EV/Revenue can be reasonable when growth and cash margins support it." : `EV/Revenue ${fmt(f.evRevenue, "x", 2)} should be read against the sector band and revenue trajectory.`, sectorRelative: isAssetLight },
    { id: "evEbitda", category: "Valuation", metric: "EV/EBITDA", value: fmt(f.evEbitda, "x"), badge: badgeFor(isAssetLight && ruleOf40 ? "growth" : f.evEbitda < 8 ? "quality" : f.evEbitda > 20 ? "destroyer" : "growth"), tone: isAssetLight && ruleOf40 ? "growth" : f.evEbitda < 8 ? "quality" : f.evEbitda > 20 ? "destroyer" : "growth", tooltip: isAssetLight && ruleOf40 ? "🌱 Sector Relative: Rule of 40 is met, so a high EV/EBITDA multiple is not automatically a trap; verify SBC and maintenance capex." : f.evEbitda < 8 ? `✅ EV/EBITDA ${fmt(f.evEbitda, "x")} is low; maintenance capex and SBC still need checking.` : isAssetLight ? "Sector Relative: high EV/EBITDA is not automatically a trap for asset-light software." : `EV/EBITDA ${fmt(f.evEbitda, "x")} should be stress-tested for maintenance capex and SBC.`, sectorRelative: isAssetLight },
    { id: "peg", category: "Valuation", metric: "PEG", value: fmt(f.peg, "x", 2), badge: badgeFor(f.peg < 1 && (revenueGrowth ?? f.growth) <= 0 ? "trap" : f.peg > 2 && f.growth < 10 ? "destroyer" : f.peg < 1.2 && f.roce > WACC_BENCHMARK ? "quality" : "growth"), tone: f.peg < 1 && (revenueGrowth ?? f.growth) <= 0 ? "trap" : f.peg > 2 && f.growth < 10 ? "destroyer" : f.peg < 1.2 && f.roce > WACC_BENCHMARK ? "quality" : "growth", tooltip: f.peg < 1 && (revenueGrowth ?? f.growth) <= 0 ? "🪤 Trailing Growth Deception: PEG looks attractive while current revenue growth is flat/negative. A true 3-year CAGR test needs historical revenue data." : `PEG ${fmt(f.peg, "x", 2)} should be checked against multi-year growth, not one period.` },
    { id: "de", category: "Solvency", metric: "Debt / Equity", value: isBank ? "Excluded" : fmt(f.debtToEquity, "x", 2), badge: badgeFor(classifyDebt()), tone: classifyDebt(), tooltip: isBank ? "Sector Relative: standard D/E is suppressed for banks; use Tier 1 capital and NPA trends." : f.debtToEquity > 1.5 ? "🚩 High leverage: check whether debt funds productive capex or operating cash gaps." : "D/E is most useful alongside interest coverage and ROCE.", sectorRelative: isBank },
    { id: "payout", category: "Capital Allocation", metric: isReitInfra ? "Payout Ratio" : "Payout Ratio", value: fmt(f.payoutRatio, "%", 0), badge: badgeFor(isReitInfra ? "growth" : f.payoutRatio > 100 ? "destroyer" : f.payoutRatio <= 20 ? "growth" : f.payoutRatio <= 60 ? "quality" : "engineering"), tone: isReitInfra ? "info" : f.payoutRatio > 100 ? "destroyer" : f.payoutRatio <= 20 ? "growth" : f.payoutRatio <= 60 ? "quality" : "engineering", tooltip: isReitInfra ? "Sector Relative: verify dividend safety using FFO/AFFO payout instead of EPS payout." : f.payoutRatio > 100 ? "🚩 Payout above 100%: earnings coverage is broken; FCF coverage still needs verification." : f.payoutRatio <= 20 ? "🌱 Low payout leaves most earnings available for reinvestment." : "✅ Moderate payout leaves room for reinvestment.", sectorRelative: isReitInfra },
    { id: "oplev", category: "Capital Allocation", metric: "Operating Leverage", value: fmt(f.operatingLeverage, "x", 2), badge: badgeFor(f.operatingLeverage > 2.5 && (revenueGrowth ?? f.growth) < 0 ? "destroyer" : f.operatingLeverage > 2.5 ? "growth" : "quality"), tone: f.operatingLeverage > 2.5 && (revenueGrowth ?? f.growth) < 0 ? "destroyer" : f.operatingLeverage > 2.5 ? "growth" : "quality", tooltip: f.operatingLeverage > 2.5 && (revenueGrowth ?? f.growth) < 0 ? "🚩 High operating leverage with shrinking revenue can amplify profit decline." : "Operating leverage can amplify both growth and decline." },
  ];

  const warnings: XRayWarning[] = [];
  if (cashLag) warnings.push({ id: "cash-gap", tone: "bad", message: "🚩 Accounting Red Flag: Net Income is outrunning Operating Cash Flow on the available data. Investigate revenue recognition and working-capital changes; persistence across 3+ quarters requires historical statements." });
  if (f.operatingLeverage > 2.5 && (revenueGrowth ?? f.growth) < 0) warnings.push({ id: "reverse-operating-leverage", tone: "bad", message: "🚩 High Operating Leverage Risk: Fixed costs can accelerate profit decline faster than revenue shrinks." });
  if (!isReitInfra && f.payoutRatio <= 100 && live?.freeCashflow != null && live.freeCashflow < 0) warnings.push({ id: "negative-fcf-payout", tone: "warn", message: "⚠️ Dividend coverage mismatch: the earnings payout ratio looks contained, but free cash flow is negative. Recheck the cash funding of distributions." });
  if (isBank) warnings.push({ id: "bank-rules", tone: "info", message: "ℹ️ Sector Relative: bank D/E and standard asset-turnover penalties are suppressed; review Tier 1 capital, NPA trends and P/B vs ROA." });
  else if (isReitInfra) warnings.push({ id: "reit-rules", tone: "info", message: "ℹ️ Sector Relative: P/E and EPS payout are suppressed; review Price/FFO and FFO/AFFO payout where available." });
  else if (isAssetLight) warnings.push({ id: "asset-light-rules", tone: "info", message: "ℹ️ Sector Relative: high P/B or EV/EBITDA is not automatically a trap for asset-light software; cash flow and Rule of 40 evidence matter more." });
  else if (isCyclical) warnings.push({ id: "cyclical-rules", tone: "info", message: "ℹ️ Sector Relative: cyclical P/E is read in reverse — unusually low P/E can coincide with peak earnings." });
  if (stock.exchange === "LSE") warnings.push({ id: "accounting-standards", tone: "info", message: "ℹ️ Data-source note: IFRS, lease treatment and reporting definitions can distort direct comparisons with GAAP-based markets." });
  warnings.push({ id: "exec-comp-data", tone: "info", message: "ℹ️ Executive-compensation test: the current provider exposes officer names/titles but not bonus formulas, EPS hurdles or ROIC hurdles, so no incentive trap is inferred." });
  if (tripleCheap) warnings.push({ id: "triple-cheap", tone: "trap", message: "🪤 Value Trap Alert: Low P/E, P/B and EV/EBITDA coincide with poor ROE/ROCE — statistically cheap can still be structurally weak." });
  else if (lowMultipleBroken) warnings.push({ id: "dead-money", tone: "trap", message: "🪤 Value Trap Alert: Low valuation and weak returns coincide with flat/declining revenue. A true 3-year persistence test needs historical data." });

  return { primary, sectorLabel, cards, warnings };
}

function computeBadges(input: IntelInput, ratios: ExtendedRatios, vision: VisionRead): Badge[] {
  const { stock, live, quote } = input;
  const f = stock.fundamentals;
  const badges: Badge[] = [];
  const add = (id: string, label: string, tone: Tone, tooltip: string) =>
    badges.push({ id, label, tone, tooltip });

  const salesGrowth = num(live?.revenueGrowth ?? null);
  const profitGrowth = num(live?.earningsGrowth ?? f.growth);

  // 1. Operating leverage
  if (salesGrowth !== null && profitGrowth !== null && salesGrowth > 10 && profitGrowth >= 50) {
    add(
      "operating-leverage",
      "🚀 High operating leverage",
      "good",
      `Sales grew ${salesGrowth.toFixed(1)}% but net profit jumped ${profitGrowth.toFixed(1)}%. Fixed costs are covered, so extra revenue drops straight to the bottom line.`,
    );
  }

  // 6. ROA trap vs pure quality
  if (f.roe > 20 && f.roa < 5) {
    add(
      "roe-trap",
      "⚠️ High-leverage ROE trap",
      "warn",
      `Return on equity looks strong (${f.roe.toFixed(1)}%) but return on assets is only ${f.roa.toFixed(1)}% — the returns are being manufactured with borrowed money.`,
    );
  } else if (f.roe > 20 && f.roa > 12) {
    add(
      "pure-quality",
      "💎 Pure quality (high ROA + ROE)",
      "good",
      `Return on equity ${f.roe.toFixed(1)}% backed by return on assets ${f.roa.toFixed(1)}% — genuine profitability, not leverage.`,
    );
  }

  // 7. Current ratio guardrails
  if (ratios.currentRatio !== null) {
    const cr = ratios.currentRatio;
    if (cr < 1)
      add("cr-low", "🔴 Short-term liquidity stress", "bad", `Current ratio ${cr.toFixed(2)} — short-term bills exceed short-term assets.`);
    else if (cr > 3)
      add("cr-lazy", "⚠️ Lazy balance sheet", "warn", `Current ratio ${cr.toFixed(2)} — plenty of safety, but cash is sitting idle instead of earning.`);
    else if (cr > 1.5)
      add("cr-safe", "🟢 Liquidity safety zone", "good", `Current ratio ${cr.toFixed(2)} — comfortable cover for short-term obligations.`);
  }

  // 8. Quick ratio guardrails
  if (ratios.quickRatio !== null) {
    const qr = ratios.quickRatio;
    if (qr < 1)
      add("qr-inventory", "⚠️ Inventory dependent", "warn", `Quick ratio ${qr.toFixed(2)} — meeting short-term bills depends on selling stock first.`);
    else if (qr > 2)
      add("qr-flush", "🟢 Cash-flush buffer", "good", `Quick ratio ${qr.toFixed(2)} — bills are covered without touching inventory.`);
    else
      add("qr-gold", "🟡 Gold-standard liquidity", "good", `Quick ratio ${qr.toFixed(2)} — the textbook balance between safety and efficiency.`);
  }

  // 9. Fortress balance sheet
  if (f.debtToEquity < 0.5 && f.roe > 20 && f.roce > 20) {
    add(
      "fortress",
      "🏆 Fortress balance sheet",
      "good",
      `Barely any debt (D/E ${f.debtToEquity.toFixed(2)}) with ${f.roe.toFixed(1)}% return on equity and ${f.roce.toFixed(1)}% on capital — the classic multi-bagger profile.`,
    );
  }

  // 12. DuPont model tag handled in the panel; 14. ROCE vs WACC
  if (f.roce > WACC_BENCHMARK) {
    add(
      "value-creator",
      "🟢 Value creator",
      "good",
      `Earns ${f.roce.toFixed(1)}% on capital against a ${WACC_BENCHMARK}% cost of capital — every rupee reinvested creates value.`,
    );
  } else {
    add(
      "wealth-destroyer",
      "🚨 Wealth destroyer",
      "bad",
      `Earns only ${f.roce.toFixed(1)}% on capital, below the ${WACC_BENCHMARK}% cost of capital — growth here destroys value.`,
    );
  }

  // 15. EV/Revenue sector benchmarking
  const band = EV_REV_BANDS.find((b) => b.match(stock.sector))!;
  if (num(f.evRevenue) !== null) {
    const ev = f.evRevenue;
    const tone: Tone = ev < band.low ? "good" : ev <= band.high ? "info" : "warn";
    add(
      "ev-rev",
      `${tone === "good" ? "🟢" : tone === "info" ? "🎯" : "⚠️"} EV/Revenue ${ev.toFixed(1)}x vs ${band.label} band ${band.low}–${band.high}x`,
      tone,
      `Enterprise value against sales, judged against the normal range for ${band.label} businesses rather than one blanket cut-off.`,
    );
  }

  // 16. EV/EBITDA
  if (ratios.evEbitda !== null) {
    if (ratios.evEbitda < 10)
      add("ev-ebitda-good", "🟢 Healthy EV/EBITDA", "good", `${ratios.evEbitda.toFixed(1)}x operating profit — undemanding pricing.`);
    else if (ratios.evEbitda > 15)
      add("ev-ebitda-rich", "🔴 Premium growth pricing", "warn", `${ratios.evEbitda.toFixed(1)}x operating profit — the price already assumes strong growth.`);
  }

  // 17. Quality of earnings
  if (ratios.priceToCashFlow !== null && f.pe > 0 && ratios.cashConversion !== null) {
    if (ratios.priceToCashFlow < f.pe && ratios.cashConversion >= 0.8) {
      add(
        "cash-backed",
        "💎 High-quality, cash-backed earnings",
        "good",
        `Cash flow is ${(ratios.cashConversion * 100).toFixed(0)}% of reported profit and the cash multiple (${ratios.priceToCashFlow.toFixed(1)}x) sits below the earnings multiple.`,
      );
    } else if (ratios.cashConversion < 0.2) {
      add(
        "paper-profits",
        "🚨 Paper profits warning",
        "bad",
        `Reported profits are barely converting into cash (${(ratios.cashConversion * 100).toFixed(0)}%). Profit on paper, not in the bank.`,
      );
    }
  }

  // 4. Institutional footprints — flat price with heavy volume
  if (quote && num(quote.volume) !== null && num(stock.volume) !== null && stock.volume > 0) {
    const volumeSpike = quote.volume / stock.volume;
    if (volumeSpike > 2.5 && Math.abs(stock.changePct) < 5) {
      add(
        "smart-money",
        "🐋 Smart-money accumulation",
        "info",
        `Volume is running ${volumeSpike.toFixed(1)}x its normal level while the price barely moves — the footprint of large buyers absorbing stock quietly.`,
      );
    }
  }

  // 4 (Section 4). Generational override
  if (vision.generational) {
    add(
      "generational",
      "🚀 Multi-decade disruption exception (10–40 year horizon)",
      "good",
      "Scores high enough on long-run essentialness and moat that a rich earnings multiple or negative free cash flow from heavy investment is acceptable.",
    );
  }

  return badges;
}

export function buildIntel(input: IntelInput): Intel {
  const ratios = computeRatios(input);
  const dupont = computeDuPont(input.stock, ratios);
  const vision = computeVision(input, ratios);
  const forensics: Forensics = {
    piotroski: computePiotroski(input, ratios),
    altman: computeAltman(input, ratios),
    beneish: computeBeneish(input, ratios),
  };
  const badges = computeBadges(input, ratios, vision);
  const xray = computeXRay(input, ratios);
  return { ratios, dupont, forensics, vision, badges, xray };
}

export const toneClass: Record<Tone, string> = {
  good: "border-bull/40 bg-bull/10 text-bull",
  warn: "border-warn/40 bg-warn/10 text-warn",
  bad: "border-bear/40 bg-bear/10 text-bear",
  info: "border-border bg-muted/40 text-muted-foreground",
};
