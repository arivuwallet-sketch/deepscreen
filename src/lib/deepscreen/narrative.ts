import type { Stock } from "./types";
import type { FundamentalSources } from "./live-merge";

export function stockSummary(stock: Stock): string {
  return `Research ${stock.name} (${stock.exchange}: ${stock.symbol}) using available valuation, profitability and leverage data. Check each figure's source and compare reporting periods before drawing conclusions. Missing provider data must not be treated as a reported company fact.`;
}

export function stockFaqs(stock: Stock, sources?: FundamentalSources) {
  const f = stock.fundamentals;
  return [
    { q: `How does DeepScreen analyze ${stock.name}?`, a: "DeepScreen uses a 13-factor valuation and quality model. The methodology explains the factors and limitations; a model score is not an investment recommendation." },
    { q: `What is ${stock.symbol}'s P/E ratio?`, a: sources?.pe === "live" ? `The available provider data gives a P/E of ${f.pe.toFixed(1)}x. Check the reporting period and compare it with company filings and sector peers.` : "A provider-backed P/E ratio is currently unavailable. Do not substitute a simulated value for reported earnings data." },
    { q: `How should I assess ${stock.name}'s profitability?`, a: "Compare reported ROE and ROCE with close peers over several reporting periods. Check accounting policies, leverage and one-off items before interpreting the ratios." },
    { q: `How much debt does ${stock.name} have?`, a: sources?.debtToEquity === "live" ? `The available debt-to-equity ratio is ${f.debtToEquity.toFixed(2)}x. Verify the underlying balance sheet date and definition of debt.` : "A provider-backed debt-to-equity ratio is currently unavailable. Review the latest balance sheet rather than relying on a fallback estimate." },
    { q: `Is ${stock.symbol} a buy?`, a: "DeepScreen provides research tools, not a personalized recommendation. Verify valuation, risks, company filings and suitability independently." },
  ];
}
