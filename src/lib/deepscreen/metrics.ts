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
  if (value <= best) return 100;
  if (value >= worst) return 5;
  return Math.round(100 - ((value - best) / (worst - best)) * 95);
}

/** Higher is better between `worst` and `best`. */
function scoreHigh(value: number, worst: number, best: number): number {
  if (value >= best) return 100;
  if (value <= worst) return 5;
  return Math.round(5 + ((value - worst) / (best - worst)) * 95);
}

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


  const metrics: MetricRead[] = [
    {
      key: "pe",
      label: "P/E Ratio",
      value: f.pe,
      display: fmt(f.pe, "x", 1),
      score: scoreLow(f.pe, 12, 60),
      band: "fair",
      reading:
        f.pe > 40 ? "Expensive — priced for high growth" : f.pe < 15 ? "Cheap vs. earnings" : "Fairly priced",
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
      reading: f.peg < 1 ? "Undervalued vs. growth" : f.peg <= 1.5 ? "Fairly valued" : "Overvalued vs. growth",
      tooltip:
        "P/E divided by the earnings growth rate. Below 1 means the price has not caught up with the growth — the classic good deal.",
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
        "Price relative to revenue. Useful for loss-making or early-stage companies where P/E does not exist, but it ignores profitability.",
    },
    {
      key: "pb",
      label: "P/B Ratio",
      value: f.pb,
      display: fmt(f.pb, "x", 2),
      score: scoreLow(f.pb, 1, 10),
      band: "fair",
      reading: f.pb < 1 ? "Below book value" : f.pb < 3 ? "Reasonable" : "Premium to book",
      tooltip:
        "Price versus net asset value on the balance sheet. Most meaningful for banks and asset-heavy businesses.",
    },
    {
      key: "evRevenue",
      label: "EV/Revenue",
      value: f.evRevenue,
      display: fmt(f.evRevenue, "x", 2),
      score: scoreLow(f.evRevenue, 1, 10),
      band: "fair",
      reading: f.evRevenue < 2 ? "Low (value zone)" : f.evRevenue <= 5 ? "Moderate" : "High expectations",
      tooltip:
        "Enterprise value over revenue. Better than P/S because it includes debt and subtracts cash — a truer takeover price.",
    },
    {
      key: "evEbitda",
      label: "EV/EBITDA",
      value: f.evEbitda,
      display: fmt(f.evEbitda, "x", 1),
      score: scoreLow(f.evEbitda, 8, 30),
      band: "fair",
      reading: f.evEbitda < 10 ? "Attractive" : f.evEbitda <= 15 ? "Fair" : "Expensive",
      tooltip:
        "Strips out debt structure, tax and depreciation, so capital-intensive companies can be compared fairly. Under 10 is generally attractive.",
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
        "Return on shareholder equity. High ROE is great — unless it is manufactured by heavy debt, so always read it next to D/E and ROCE.",
    },
    {
      key: "roa",
      label: "ROA",
      value: f.roa,
      display: fmt(f.roa, "%", 1),
      score: scoreHigh(f.roa, 2, 18),
      band: "fair",
      reading: f.roa > 10 ? "Assets working hard" : f.roa > 5 ? "Adequate" : "Asset-heavy / inefficient",
      tooltip: "Profit generated per unit of total assets — how efficiently the whole business is run.",
    },
    {
      key: "roce",
      label: "ROCE",
      value: f.roce,
      display: fmt(f.roce, "%", 1),
      score: scoreHigh(f.roce, 6, 28),
      band: "fair",
      reading: f.roce > 20 ? "High-quality compounder" : f.roce > 12 ? "Solid" : "Below cost of capital risk",
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
      reading: f.debtToEquity < 0.5 ? "Conservative balance sheet" : f.debtToEquity < 1.2 ? "Manageable" : "Leveraged",
      tooltip: "Borrowed capital versus owners' capital. High leverage boosts ROE in good years and destroys it in bad ones.",
    },
    {
      key: "payout",
      label: "Payout Ratio",
      value: f.payoutRatio,
      display: fmt(f.payoutRatio, "%", 0),
      score: f.payoutRatio > 85 ? 25 : f.payoutRatio < 5 ? 55 : 85,
      band: "fair",
      reading:
        f.payoutRatio > 85
          ? "Unsustainably high payout"
          : f.payoutRatio < 5
            ? "Reinvesting everything"
            : "Balanced payout",
      tooltip:
        "Share of profit paid out as dividend. Very high payouts leave nothing to reinvest; very low ones suit growth companies.",
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
        "How much profit jumps for each 1% of extra sales. High leverage means explosive upside in a boom and sharp pain in a downturn.",
    },
  ].map((m) => ({ ...m, band: band(m.score) }));

  const weights: Record<string, number> = {
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
    payout: 0.5,
    oplev: 0.6,
  };

  const totalWeight = metrics.reduce((a, m) => a + (weights[m.key] ?? 1), 0);
  const score = Math.round(
    metrics.reduce((a, m) => a + m.score * (weights[m.key] ?? 1), 0) / totalWeight,
  );

  const verdict: Verdict =
    score >= 78 ? "Strong Buy" : score >= 64 ? "Buy" : score >= 48 ? "Hold" : score >= 34 ? "Caution" : "Avoid";

  const strengths = metrics
    .filter((m) => m.band === "good")
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((m) => `${m.label}: ${m.display} — ${m.reading.toLowerCase()}`);

  const risks = metrics
    .filter((m) => m.band === "poor")
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((m) => `${m.label}: ${m.display} — ${m.reading.toLowerCase()}`);

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
