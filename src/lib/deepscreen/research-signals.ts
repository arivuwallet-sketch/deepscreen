import type { Analysis } from "@/lib/deepscreen/metrics";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";

export interface ResearchSignal {
  id: string;
  title: string;
  detail: string;
  tone: "attention" | "context" | "positive";
}

export function buildResearchSignals(
  stock: Stock,
  analysis: Analysis,
  liveFundamentals?: LiveFundamentals | null,
): ResearchSignal[] {
  const f = stock.fundamentals;
  const signals: ResearchSignal[] = [];

  if (liveFundamentals?.freeCashflow != null && liveFundamentals.freeCashflow < 0) {
    signals.push({
      id: "negative-fcf",
      title: "Free cash flow is negative",
      detail:
        "Latest provider free cash flow is " +
        liveFundamentals.freeCashflow.toLocaleString() +
        ". Review working capital, capex and operating cash generation.",
      tone: "attention",
    });
  }

  if (f.debtToEquity >= 1.2) {
    signals.push({
      id: "high-de",
      title: "Leverage deserves review",
      detail:
        "Debt/equity is " +
        f.debtToEquity.toFixed(2) +
        "x. Compare debt with cash generation, interest cost and peer leverage.",
      tone: "attention",
    });
  }

  if (f.roe > 20 && f.roa < 5) {
    signals.push({
      id: "roe-roa-gap",
      title: "ROE and ROA diverge materially",
      detail:
        "ROE is " +
        f.roe.toFixed(1) +
        "% while ROA is " +
        f.roa.toFixed(1) +
        "%. Check whether leverage is amplifying equity returns.",
      tone: "attention",
    });
  }

  if (f.payoutRatio > 100) {
    signals.push({
      id: "high-payout",
      title: "Payout ratio exceeds 100%",
      detail:
        "The model sees a " +
        f.payoutRatio.toFixed(0) +
        "% payout ratio. Check dividend funding against earnings and free cash flow.",
      tone: "attention",
    });
  }

  if (f.pe > 40 && f.growth < 10) {
    signals.push({
      id: "valuation-growth",
      title: "High P/E with lower reported growth",
      detail:
        "P/E is " +
        f.pe.toFixed(1) +
        "x versus growth of " +
        f.growth.toFixed(1) +
        "%. Compare the multiple with direct peers and sustainable growth assumptions.",
      tone: "context",
    });
  }

  if (
    liveFundamentals?.operatingCashflow != null &&
    liveFundamentals.operatingCashflow > 0 &&
    liveFundamentals.freeCashflow != null
  ) {
    const conversion = liveFundamentals.freeCashflow / liveFundamentals.operatingCashflow;
    if (conversion >= 0.8) {
      signals.push({
        id: "strong-fcf-conversion",
        title: "Cash conversion is currently solid",
        detail:
          "Free cash flow is " +
          (conversion * 100).toFixed(0) +
          "% of operating cash flow in the latest provider snapshot.",
        tone: "positive",
      });
    }
  }

  if (!signals.length) {
    const first = analysis.strengths[0] ?? "No threshold-based research flag is active.";
    signals.push({
      id: "no-threshold",
      title: "No threshold-based research flag",
      detail: first,
      tone: "positive",
    });
  }

  return signals.slice(0, 5);
}
