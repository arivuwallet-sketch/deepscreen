import { analyze } from "./metrics";
import type { Stock } from "./types";

export function stockSummary(stock: Stock): string {
  const a = analyze(stock);
  const f = stock.fundamentals;
  return `${stock.name} (${stock.exchange}: ${stock.symbol}) has a DeepScreen score of ${a.score}/100 and a ${a.verdict} model verdict. Its P/E is ${f.pe.toFixed(1)}x, PEG is ${f.peg.toFixed(2)}, ROCE is ${f.roce.toFixed(1)}%, and debt-to-equity is ${f.debtToEquity.toFixed(2)}x. Compare these figures with close ${stock.sector} peers and review current filings before making an investment decision.`;
}

export function stockFaqs(stock: Stock) {
  const a = analyze(stock);
  const f = stock.fundamentals;
  return [
    { q: `What is the DeepScreen score for ${stock.name}?`, a: `${stock.name} currently scores ${a.score}/100 in the DeepScreen 13-factor quality-and-value model, producing a ${a.verdict} model verdict.` },
    { q: `What is ${stock.symbol}'s P/E ratio?`, a: `${stock.symbol}'s current modeled P/E is ${f.pe.toFixed(1)}x. Compare it with ${stock.sector} peers and the company's historical range.` },
    { q: `Is ${stock.name} financially efficient?`, a: `${stock.name} reports modeled ROE of ${f.roe.toFixed(1)}% and ROCE of ${f.roce.toFixed(1)}%. ROCE includes both debt and equity capital, so reading both gives better context.` },
    { q: `How much debt does ${stock.name} have?`, a: `Its modeled debt-to-equity ratio is ${f.debtToEquity.toFixed(2)}x and long-term debt-to-equity is ${f.longTermDebtToEquity.toFixed(2)}x.` },
    { q: `Is ${stock.symbol} a buy?`, a: `DeepScreen provides analytical model output, not a recommendation. Use the score as a research shortlist and verify valuation, risks, filings and suitability independently.` },
  ];
}
