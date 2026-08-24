import { analyze } from "./metrics";
import { stockNews } from "./news";
import type { Stock } from "./types";

export type AlertLevel = "accumulate" | "hold" | "trim" | "exit";

export interface HoldingPlan {
  /** Recommended holding window in months. */
  minMonths: number;
  maxMonths: number;
  horizonLabel: string;
  style: string;
  conviction: number;
  alert: AlertLevel;
  alertLabel: string;
  alertReason: string;
  targetPrice: number;
  stopLoss: number;
  trimAbove: number;
  reviewOn: string;
  newsBias: number;
  sellTriggers: string[];
  rationale: string;
}

const ALERT_LABEL: Record<AlertLevel, string> = {
  accumulate: "Accumulate / keep holding",
  hold: "Hold — no action today",
  trim: "Trim — book part profit",
  exit: "Sell alert — exit position",
};

export function alertClass(level: AlertLevel): string {
  switch (level) {
    case "accumulate":
      return "bg-bull/15 text-bull border-bull/40";
    case "hold":
      return "bg-neutralq/10 text-neutralq border-neutralq/30";
    case "trim":
      return "bg-warn/15 text-warn border-warn/40";
    default:
      return "bg-bear/15 text-bear border-bear/40";
  }
}

/** −1 (bearish) … +1 (bullish) news bias from the latest headlines, impact-weighted. */
export function newsBias(stock: Stock): number {
  const items = stockNews(stock, 6);
  let total = 0;
  let weight = 0;
  for (const n of items) {
    const w = n.impact === "high" ? 3 : n.impact === "medium" ? 2 : 1;
    const s = n.sentiment === "bullish" ? 1 : n.sentiment === "bearish" ? -1 : 0;
    const recency = n.minutesAgo < 240 ? 1.4 : n.minutesAgo < 1440 ? 1 : 0.6;
    total += s * w * recency;
    weight += w * recency;
  }
  return weight === 0 ? 0 : Number((total / weight).toFixed(2));
}

export function holdingPlan(stock: Stock): HoldingPlan {
  const a = analyze(stock);
  const f = stock.fundamentals;
  const bias = newsBias(stock);

  // Quality/compounding tilt lengthens the horizon; leverage and rich valuation shorten it.
  let months = 6;
  if (a.score >= 78) months += 24;
  else if (a.score >= 64) months += 14;
  else if (a.score >= 48) months += 6;

  if (f.roce >= 20) months += 8;
  if (f.growth >= 15) months += 6;
  if (f.peg <= 1) months += 6;
  if (f.debtToEquity > 1.2) months -= 6;
  if (f.pe > 45) months -= 5;
  if (stock.cap === "small") months -= 3;
  if (f.dividendYield >= 3) months += 4;

  const minMonths = Math.max(1, Math.round(months * 0.7));
  const maxMonths = Math.max(minMonths + 2, Math.round(months * 1.35));

  const style =
    maxMonths >= 36
      ? "Long-term compounder"
      : maxMonths >= 18
        ? "Core multi-year holding"
        : maxMonths >= 9
          ? "Medium-term position"
          : "Short-term / tactical trade";

  const horizonLabel =
    minMonths >= 12
      ? `${(minMonths / 12).toFixed(1)}–${(maxMonths / 12).toFixed(1)} years`
      : `${minMonths}–${maxMonths} months`;

  // Upside is driven by earnings growth and how cheap the PEG is, damped by leverage.
  const upside =
    (a.score - 50) / 180 + Math.min(f.growth, 35) / 140 + (f.peg < 1 ? 0.08 : f.peg > 2.5 ? -0.06 : 0) + bias * 0.04;
  const targetPrice = Number((stock.price * (1 + Math.max(-0.15, Math.min(0.85, upside)))).toFixed(2));
  const stopBand = stock.cap === "small" ? 0.82 : stock.cap === "mid" ? 0.86 : 0.9;
  const stopLoss = Number((stock.price * stopBand).toFixed(2));
  const trimAbove = Number((stock.price * (1 + Math.max(0.08, upside * 0.6))).toFixed(2));

  let alert: AlertLevel;
  let alertReason: string;
  if (a.score < 34 || (f.debtToEquity > 1.8 && a.score < 50) || (bias <= -0.5 && a.score < 48)) {
    alert = "exit";
    alertReason =
      bias <= -0.5
        ? "Weak fundamentals and negative news flow are pointing the same way — the model would step out rather than average down."
        : "Returns, leverage or valuation have broken the model's floor; the risk of holding now outweighs the upside.";
  } else if (a.score < 50 || f.pe > 55 || (bias < -0.2 && a.score < 64) || f.payoutRatio > 90) {
    alert = "trim";
    alertReason =
      "Valuation has run ahead of the earnings base or news flow has turned; taking part of the position off the table protects the gain.";
  } else if (a.score >= 70 && bias >= 0 && f.peg <= 1.6) {
    alert = "accumulate";
    alertReason =
      "Quality metrics, valuation and current news flow all line up — dips inside the holding window are buying opportunities.";
  } else {
    alert = "hold";
    alertReason = "Nothing in the fundamentals or today's headlines calls for action; let the thesis play out.";
  }

  const review = new Date();
  review.setMonth(review.getMonth() + (alert === "exit" ? 0 : alert === "trim" ? 1 : 3));
  const reviewOn = review.toISOString().slice(0, 10);

  const sellTriggers = [
    `Price closes below the ${stopLoss} stop level`,
    `ROCE falls under ${Math.max(8, Math.round(f.roce * 0.7))}% for two straight quarters`,
    `Debt/equity rises above ${(Math.max(0.6, f.debtToEquity) + 0.4).toFixed(2)}x`,
    `Earnings growth slips below ${Math.max(2, Math.round(f.growth * 0.5))}%`,
    `PEG expands past ${(Math.max(1.2, f.peg) + 0.8).toFixed(2)} without a growth upgrade`,
    `Price runs above ${targetPrice} ahead of the fundamentals`,
  ];

  const rationale = `${stock.name} scores ${a.score}/100 (${a.verdict}). With ROCE at ${f.roce}%, growth near ${f.growth}% and debt/equity at ${f.debtToEquity}x, the model suggests a ${style.toLowerCase()} of roughly ${horizonLabel}. Current news bias is ${
    bias > 0.15 ? "positive" : bias < -0.15 ? "negative" : "neutral"
  } (${bias >= 0 ? "+" : ""}${bias}). ${alertReason}`;

  return {
    minMonths,
    maxMonths,
    horizonLabel,
    style,
    conviction: a.score,
    alert,
    alertLabel: ALERT_LABEL[alert],
    alertReason,
    targetPrice,
    stopLoss,
    trimAbove,
    reviewOn,
    newsBias: bias,
    sellTriggers,
    rationale,
  };
}
