import { evEbitdaReading, evEbitdaTooltip, formatEvEbitda, isMeaningfulEvEbitda } from "./ev-ebitda";
import type { Stock } from "./types";

export type Verdict = "Strong Buy" | "Buy" | "Hold" | "Caution" | "Avoid";

export interface MetricRead {
  key: string;
  label: string;
  value: number;
  display: string;
  score: number; // 0-100
  band: "good" | "fair" | "poor";
  reading: string;
  tooltip: string;
}

export interface Analysis {
  score: number;
  verdict: Verdict;
  metrics: MetricRead[];
  strengths: string[];
  risks: string[];
  summary: string;
}

const fmt = (v: number, suffix = "", d = 2) => `${v.toFixed(d)}${suffix}`;

function band(score: number): MetricRead["band"] {
  return score >= 67 ? "good" : score >= 40 ? "fair" : "poor";
}

/** Lower is better between `best` and `worst`. */
function scoreLow(value: number, best: number, worst: number): number {
  if (!Number.isFinite(value)) return 40;
  if (value <= best) return 100;
  if (value >= worst) return 5;
  return Math.round(100 - ((value - best) / (worst - best)) * 95);
}

/** Higher is better between `worst` and `best`. */
function scoreHigh(value: number, worst: number, best: number): number {
  if (!Number.isFinite(value)) return 40;
  if (value >= best) return 100;
  if (value <= worst) return 5;
  return Math.round(5 + ((value - worst) / (best - worst)) * 95);
}

export const ANALYSIS_WEIGHTS: Record<string, number> = {
  pe: 1,
  peg: 1.6,
  ps: 0.7,
  pb: 0.7,
  evRevenue: 0.8,
  evEbitda: 1.2,
  roe: 1.3,
  roa: 0.9,
  roce: 1.6,
  de: 1.1,
  ltde: 0.8,
  payout: 0.5,
  oplev: 0.6,
};

const analysisCache = new WeakMap<Stock, Analysis>();

export function analyze(stock: Stock): Analysis {
  const cached = analysisCache.get(stock);
  if (cached) return cached;
  const result = computeAnalysis(stock);
  analysisCache.set(stock, result);
  return result;
}

function computeAnalysis(stock: Stock): Analysis {
  const f = stock.fundamentals;
  // Same light/heavy split the seed model itself uses (see buildFundamentals
  // in stocks.ts) — a services business's main "asset" is people, who don't
  // show up on the balance sheet, so P/B runs structurally high there
  // regardless of whether the stock is actually expensive.
  const isAssetLight =
    stock.sector === "Information Technology" ||
    stock.sector === "Communication Services" ||
    stock.sector === "Healthcare";

  const metrics: MetricRead[] = [
    {
      key: "pe",
      label: "P/E Ratio (TTM)",
      value: f.pe,
      display: fmt(f.pe, "x", 1),
      score: scoreLow(f.pe, 12, 60),
      band: "fair",
      reading:
        f.pe > 40
          ? "Expensive — priced for high growth"
          : f.pe < 15
            ? "Cheap vs. earnings"
            : "Fairly priced",
      tooltip:
        "Price divided by earnings per share: how much you pay today for ₹1/$1 of annual profit. Only compare within the same industry.",
    },
    {
      key: "peg",
      label: "PEG Ratio",
      value: f.peg,
      display: fmt(f.peg, "", 2),
      score: scoreLow(f.peg, 0.8, 3),
      band: "fair",
      reading:
        f.peg < 1
          ? "Undervalued vs. growth"
          : f.peg <= 1.5
            ? "Fairly valued"
            : "Overvalued vs. growth",
      tooltip:
        "P/E (TTM) divided by the annual earnings growth rate (%). Below 1 means the price has not caught up with the profit trajectory -- the classic good deal signal. Uses actual earnings growth (not revenue growth), sourced from Screener.in for Indian stocks and Yahoo for US/UK.",
    },
    {
      key: "ps",
      label: "P/S Ratio",
      value: f.ps,
      display: fmt(f.ps, "x", 2),
      score: scoreLow(f.ps, 1, 12),
      band: "fair",
      reading: f.ps < 2 ? "Modest sales multiple" : f.ps < 6 ? "Moderate" : "Rich sales multiple",
      tooltip:
        "Price relative to revenue. Sales are much harder to accounting-fudge than earnings, so this is a trustworthy number — and it's often the only usable multiple for loss-making or early-stage companies where P/E doesn't exist. But revenue without margin means nothing on its own: always read it alongside net margin.",
    },
    {
      key: "pb",
      label: "P/B Ratio",
      value: f.pb,
      display: fmt(f.pb, "x", 2),
      // Asset-light businesses carry value in people/IP, not on the balance
      // sheet, so P/B runs structurally high — penalize them less.
      score: isAssetLight ? scoreLow(f.pb, 2, 18) : scoreLow(f.pb, 1, 10),
      band: "fair",
      reading: isAssetLight
        ? f.pb < 3 ? "Low for an asset-light business" : f.pb <= 10 ? "Typical for the sector" : "Priced for exceptional growth"
        : f.pb < 1 ? "Below book value" : f.pb < 3 ? "Reasonable" : "Premium to book",
      tooltip: isAssetLight
        ? "Price versus net asset value. Asset-light businesses like this one carry most of their value in people and IP, not machinery or property, so P/B runs structurally high here — not a red flag by itself. Weigh P/E and ROE more heavily instead."
        : "Price versus net asset value on the balance sheet. Most meaningful for banks, NBFCs and asset-heavy businesses (manufacturing, real estate) where book value closely tracks real worth.",
    },
    {
      key: "evRevenue",
      label: "EV/Revenue",
      value: f.evRevenue,
      display: fmt(f.evRevenue, "x", 2),
      // "Cheap" and "expensive" here depend heavily on the business model:
      // asset-heavy, low-margin industries (manufacturing, steel, retail)
      // normally trade at 0.5-2x, stable-margin businesses (FMCG, pharma) at
      // 2-5x, and asset-light/high-growth ones (SaaS, cloud, AI) routinely
      // sit at 5-10x+ without being mispriced — so the same absolute number
      // needs a different bar depending on which of those this is.
      score: isAssetLight ? scoreLow(f.evRevenue, 4, 14) : scoreLow(f.evRevenue, 1, 6),
      band: "fair",
      reading: isAssetLight
        ? f.evRevenue < 4
          ? "Low for an asset-light business"
          : f.evRevenue <= 9
            ? "Typical for the sector"
            : "Priced for exceptional growth"
        : f.evRevenue < 2
          ? "Low (value zone)"
          : f.evRevenue <= 5
            ? "Moderate"
            : "High for an asset-heavy business",
      tooltip: isAssetLight
        ? "Enterprise value over revenue. Asset-light, high-growth sectors like this one normally trade at 5-10x+ revenue — that's the market pricing in margin expansion, not necessarily overpaying. Below ~4x is cheap for this kind of business; north of ~10x needs genuinely exceptional growth to justify. Read the trend against this company's own 5-year average rather than the absolute number alone."
        : "Enterprise value over revenue. Better than P/S because it includes debt and subtracts cash — a truer takeover price. Asset-heavy, lower-margin businesses (manufacturing, steel, retail) typically trade at 0.5-2x; stable-margin ones (FMCG, pharma) around 2-5x — above that is rich for this kind of business. Read the trend against this company's own 5-year average rather than the absolute number alone.",
    },
    {
      key: "evEbitda",
      label: "EV/EBITDA",
      value: f.evEbitda,
      display: formatEvEbitda(f.evEbitda, 1),
      // Non-positive EV/EBITDA is not a cheap multiple. It is normally caused
      // by negative EBITDA, or less commonly by negative enterprise value.
      // Keep it neutral in the score and show N/M instead of a misleading
      // negative number.
      score: isMeaningfulEvEbitda(f.evEbitda)
        ? isAssetLight
          ? scoreLow(f.evEbitda, 12, 40)
          : scoreLow(f.evEbitda, 8, 30)
        : 40,
      band: "fair",
      reading: evEbitdaReading(f.evEbitda, isAssetLight),
      tooltip: evEbitdaTooltip(f.evEbitda, isAssetLight),
    },
    {
      key: "roe",
      label: "ROE",
      value: f.roe,
      display: fmt(f.roe, "%", 1),
      score: scoreHigh(f.roe, 5, 30),
      band: "fair",
      reading: f.roe > 20 ? "Excellent shareholder returns" : f.roe > 12 ? "Healthy" : "Weak",
      tooltip:
        "Return on shareholder equity. High ROE is great — unless it is manufactured by heavy debt, so always read it next to ROA and D/E: high ROE with low ROA is the classic debt-trap pattern.",
    },
    {
      key: "roa",
      label: "ROA",
      value: f.roa,
      display: fmt(f.roa, "%", 1),
      // Asset-light businesses always show higher ROA because they carry
      // less on the balance sheet — raise the bar so they aren't all
      // automatically "excellent" compared to asset-heavy peers.
      score: isAssetLight ? scoreHigh(f.roa, 5, 28) : scoreHigh(f.roa, 2, 18),
      band: "fair",
      reading:
        isAssetLight
          ? f.roa > 15 ? "Strong for asset-light" : f.roa > 8 ? "Adequate" : "Low for the sector"
          : f.roa > 10 ? "Assets working hard" : f.roa > 5 ? "Adequate" : "Asset-heavy / inefficient",
      tooltip:
        "Net Income / Total Assets — how efficiently the whole business converts its asset base into profit. Computed as ROE / (1 + D/E) when live data is unavailable. Only compare within the same industry: asset-light businesses (IT, services) will always show a structurally higher ROA than asset-heavy ones (steel, airlines, utilities) simply because they carry far less on the balance sheet to begin with, not because they're better run.",
    },
    {
      key: "roce",
      label: "ROCE",
      value: f.roce,
      display: fmt(f.roce, "%", 1),
      score: scoreHigh(f.roce, 6, 28),
      band: "fair",
      reading:
        f.roce > 20
          ? "High-quality compounder"
          : f.roce > 12
            ? "Solid"
            : "Below cost of capital risk",
      tooltip:
        "Return on all capital employed (equity plus debt). The cleanest quality signal because debt cannot flatter it.",
    },
    {
      key: "de",
      label: "Debt / Equity",
      value: f.debtToEquity,
      display: fmt(f.debtToEquity, "x", 2),
      score: scoreLow(f.debtToEquity, 0.3, 2),
      band: "fair",
      reading:
        f.debtToEquity < 0.5
          ? "Conservative balance sheet"
          : f.debtToEquity < 1.2
            ? "Manageable"
            : "Leveraged",
      tooltip:
        "Total liabilities divided by shareholders' equity — the broadest leverage measure. High leverage boosts ROE in good years and destroys it in bad ones.",
    },
    {
      key: "ltde",
      label: "LT Debt / Equity",
      value: f.longTermDebtToEquity,
      display: fmt(f.longTermDebtToEquity, "x", 2),
      score: scoreLow(f.longTermDebtToEquity, 0.2, 1.5),
      band: "fair",
      reading:
        f.longTermDebtToEquity < 0.3
          ? "Very low structural debt"
          : f.longTermDebtToEquity < 0.8
            ? "Moderate long-term leverage"
            : "Heavy long-term obligations",
      tooltip:
        "Long-term debt divided by shareholders' equity. Excludes short-term operational liabilities like accounts payable — shows only the structural, long-term borrowing burden. A company can have a high total D/E from working-capital financing while its LT debt is modest, or vice versa.",
    },
    {
      key: "payout",
      label: "Payout Ratio",
      value: f.payoutRatio,
      display: fmt(f.payoutRatio, "%", 0),
      score:
        f.payoutRatio > 100
          ? 10
          : f.payoutRatio > 85
            ? 35
            : f.payoutRatio > 60
              ? 60
              : f.payoutRatio >= 30
                ? 95
                : f.payoutRatio >= 5
                  ? 82
                  : 75,
      band: "fair",
      reading:
        f.payoutRatio > 100
          ? "Red flag — paying out more than it earns"
          : f.payoutRatio > 85
            ? "High payout, little left to reinvest"
            : f.payoutRatio > 60
              ? "Mature, high-payout company"
              : f.payoutRatio >= 30
                ? "Ideal balance — sustainable with room to reinvest"
                : f.payoutRatio >= 5
                  ? "Growth company — reinvesting most profit"
                  : "Full reinvestment — no dividend",
      tooltip:
        "Share of profit paid out as dividend. Above 100% means the company is funding the dividend from debt or reserves, not profit — a genuine red flag, not just 'high'. 30–60% is the classic sustainable balance; well below that usually just means a growth company reinvesting rather than anything wrong.",
    },
    {
      key: "oplev",
      label: "Operating Leverage",
      value: f.operatingLeverage,
      display: fmt(f.operatingLeverage, "x", 2),
      score: f.operatingLeverage > 2.5 ? 45 : scoreHigh(f.operatingLeverage, 0.8, 2.2),
      band: "fair",
      reading:
        f.operatingLeverage > 2.5
          ? "Profits amplify — both ways"
          : f.operatingLeverage > 1.5
            ? "Good upside gearing"
            : "Low fixed-cost gearing",
      tooltip:
        "How much profit jumps for each 1% of extra sales — driven by how much of the cost base is fixed (rent, salaries) versus variable (raw materials). It's a double-edged sword: high fixed-cost businesses (manufacturing, airlines, software) see profit jump disproportionately as sales grow, but the same fixed costs turn a small sales dip into an outsized loss. That's also why these businesses tend to lead in a bull market and get hit hardest first when demand turns down.",
    },
  ].map((m) => ({ ...m, band: band(m.score) }));



  const totalWeight = metrics.reduce((a, m) => a + (ANALYSIS_WEIGHTS[m.key] ?? 1), 0);
  const score = Math.round(
    metrics.reduce((a, m) => a + m.score * (ANALYSIS_WEIGHTS[m.key] ?? 1), 0) / totalWeight,
  );

  const verdict: Verdict =
    score >= 78
      ? "Strong Buy"
      : score >= 64
        ? "Buy"
        : score >= 48
          ? "Hold"
          : score >= 34
            ? "Caution"
            : "Avoid";

  const line = (m: MetricRead) => `${m.label}: ${m.display} — ${m.reading.toLowerCase()}`;

  const byBest = [...metrics].sort((a, b) => b.score - a.score);
  const byWorst = [...metrics].sort((a, b) => a.score - b.score);

  // Always surface something: prefer clear good/poor bands, otherwise fall back to the
  // strongest / weakest factors so neither box is ever blank.
  const goodOnes = byBest.filter((m) => m.band === "good");
  const poorOnes = byWorst.filter((m) => m.band === "poor");

  const strengths = (goodOnes.length >= 2 ? goodOnes : byBest.filter((m) => m.score >= 55))
    .slice(0, 4)
    .map(line);
  const risks = (poorOnes.length >= 2 ? poorOnes : byWorst.filter((m) => m.score <= 65))
    .slice(0, 4)
    .map(line);

  if (strengths.length === 0) strengths.push(line(byBest[0]!));
  if (risks.length === 0) risks.push(line(byWorst[0]!));

  // Cross-metric checks: some of the most useful reads here come from
  // comparing two ratios against each other, not from either one alone —
  // exactly the "always check X alongside Y" pro-tips a ratio's tooltip
  // can't express by itself.

  // High ROE built on a thin asset base and heavy leverage is the classic
  // "debt trap" — the return looks great until the interest bill doesn't.
  if (f.roe > 20 && f.roa < 5) {
    risks.unshift(
      `Debt trap pattern: ROE ${f.roe.toFixed(1)}% looks strong but ROA is only ${f.roa.toFixed(1)}% — the return is coming from leverage, not genuine efficiency.`,
    );
  } else if (f.roe > 30 && f.debtToEquity > 1.5) {
    risks.unshift(
      `Very high ROE (${f.roe.toFixed(1)}%) alongside heavy leverage (D/E ${f.debtToEquity.toFixed(2)}x) — returns may be debt-amplified rather than purely operational.`,
    );
  }

  // ROE cannot be gamed by debt the way ROCE can be — both clearing a solid
  // bar together is a much stronger "quality compounder" signal than either
  // alone.
  if (f.roe >= 15 && f.roce >= 15) {
    strengths.unshift(
      `ROE and ROCE both above 15% (${f.roe.toFixed(1)}% / ${f.roce.toFixed(1)}%) — genuine capital efficiency, not just debt-flattered equity returns.`,
    );
  }

  strengths.splice(4);
  risks.splice(4);

  const summary = `${stock.name} scores ${score}/100 on the DeepScreen quality-and-value model. Growth is running near ${f.growth}% with a PEG of ${f.peg}, ROCE of ${f.roce}% and debt/equity at ${f.debtToEquity}x. ${
    verdict === "Strong Buy" || verdict === "Buy"
      ? "Valuation and capital efficiency line up favourably against sector norms."
      : verdict === "Hold"
        ? "Quality and price roughly offset each other; wait for a better entry or clearer growth."
        : "Valuation, leverage or returns are stretched relative to what the business currently earns."
  }`;

  return { score, verdict, metrics, strengths, risks, summary };
}

export function verdictClass(v: Verdict): string {
  switch (v) {
    case "Strong Buy":
      return "bg-bull/15 text-bull border-bull/40";
    case "Buy":
      return "bg-bull/10 text-bull border-bull/30";
    case "Hold":
      return "bg-neutralq/10 text-neutralq border-neutralq/30";
    case "Caution":
      return "bg-warn/10 text-warn border-warn/30";
    default:
      return "bg-bear/10 text-bear border-bear/30";
  }
}
