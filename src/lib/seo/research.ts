import type { RatioDefinition } from "./content";

/** The same answers feed visible content and structured data. */
export function ratioFaqs(ratio: RatioDefinition) {
  return [
    { q: `What is ${ratio.shortName}?`, a: ratio.answer },
    { q: `How is ${ratio.shortName} calculated?`, a: ratio.formula },
    { q: `What should investors watch for with ${ratio.shortName}?`, a: ratio.cautions.join(" ") },
  ];
}

export const RATIO_EXAMPLES: Record<string, string> = {
  "pe-ratio":
    "A share price of 200 and annual earnings per share of 10 give a P/E of 20x. Use the same currency and distinguish trailing earnings from forecasts.",
  "peg-ratio":
    "A P/E of 20 and annual earnings growth of 10% give a PEG of 2. Enter growth as 10, not 0.10. This calculation assumes positive, meaningful earnings and growth.",
  "price-to-sales-ratio":
    "A market value of 600 million divided by annual revenue of 300 million gives P/S of 2x. Two companies at 2x can have very different profit margins.",
  "price-to-book-ratio":
    "A share price of 60 divided by book value per share of 30 gives P/B of 2x. Check whether the recorded assets need impairment.",
  "ev-to-revenue":
    "Enterprise value of 900 million divided by annual revenue of 300 million gives EV/Revenue of 3x. Both inputs must use the same currency and unit.",
  "ev-to-ebitda":
    "Enterprise value of 900 million divided by positive annual EBITDA of 100 million gives EV/EBITDA of 9x. Negative EBITDA does not produce an interpretable cheapness multiple.",
  "return-on-equity":
    "Annual net income of 20 million divided by average equity of 100 million gives ROE of 20%. Review leverage before interpreting that return as business quality.",
  "return-on-assets":
    "Annual net income of 20 million divided by average assets of 400 million gives ROA of 5%. Compare similar businesses and reporting periods.",
  "return-on-capital-employed":
    "Operating profit of 30 million divided by capital employed of 200 million gives ROCE of 15%. Keep the capital-employed definition consistent across comparisons.",
  "debt-to-equity-ratio":
    "Interest-bearing debt of 60 million divided by equity of 100 million gives debt-to-equity of 0.6x. A liabilities-to-equity calculation uses a different numerator and must be labeled separately.",
  "long-term-debt-to-equity":
    "Long-term debt of 40 million divided by equity of 100 million gives 0.4x. Short-term borrowing remains outside this calculation.",
  "dividend-payout-ratio":
    "Annual dividends of 30 million divided by annual net income of 100 million give a payout ratio of 30%. This does not establish whether cash flow supports the distribution.",
  "operating-leverage":
    "If revenue rises 5% and operating profit rises 15% over the same period, operating leverage is 3x. Near-zero or negative base-period profit can distort this measure.",
  "piotroski-f-score":
    "If seven of the nine accounting tests pass and the other two fail, the score is 7/9. If a required input is missing, report incomplete coverage instead of counting an assumed pass or fail.",
  "altman-z-score":
    "First identify the model version and company type, then collect every required statement input for the same period. A result from a different version should not be compared with the original public-manufacturer thresholds.",
  "beneish-m-score":
    "Collect the required current-year and prior-year figures before calculating the accounting indices. An unusual receivables trend is a reason to inspect the filings; it is not evidence of manipulation on its own.",
};

export type ResearchLink = { to: string; label: string; description: string };
const ratios = {
  to: "/ratios",
  label: "Financial ratio formulas and limitations",
  description: "Understand the measures before comparing company figures.",
};
const methodology = {
  to: "/methodology",
  label: "How the 13-factor model works",
  description: "Review the scoring inputs, assumptions and limitations.",
};
const sources = {
  to: "/data-sources",
  label: "Market data sources and coverage",
  description: "Distinguish provider snapshots from modeled inputs.",
};
const checklist = {
  to: "/research-checklist",
  label: "Company research checklist",
  description: "Work through business quality, cash flow, debt and valuation.",
};
const screener = {
  to: "/screener",
  label: "Explore the global stock screener",
  description: "Browse supported Indian, US and UK listings.",
};
const options = {
  to: "/options",
  label: "Options payoff and Greeks calculator",
  description: "Explore how price, volatility and time affect a strategy.",
};
const dividend = {
  to: "/learn/dividend-investing-guide",
  label: "Dividend yield, payout and ex-dates",
  description: "Learn what each dividend measure tells you.",
};

/** Bounded, task-specific navigation; never a list of search phrase variants. */
export function researchLinks(path: string): ResearchLink[] {
  if (/^\/(auth|portfolio|pricing|checkout)(\/|$)/.test(path)) return [];
  let links: ResearchLink[];
  if (path === "/chart-reader" || path === "/trading")
    links = [
      {
        to: "/chart-reader",
        label: "Open DeepChart technical analysis",
        description: "Read price structure, momentum, volatility, liquidity and higher-timeframe context.",
      },
      {
        to: "/trading",
        label: "Trading, crypto and forex Q&A",
        description: "Understand instrument mechanics and risk before acting on a signal.",
      },
      {
        to: "/learn/how-to-read-candlestick-charts",
        label: "How to read candlestick charts",
        description: "Start with open, high, low, close, bodies, wicks and price structure.",
      },
      {
        to: "/calendar",
        label: "Economic calendar",
        description: "Check scheduled events that can rapidly change volatility.",
      },
    ];
  else if (path.startsWith("/stock/")) links = [ratios, checklist, sources];
  else if (/^\/(exchange|sector|best)(\/|$)/.test(path)) links = [methodology, ratios, sources];
  else if (path.startsWith("/options"))
    links = [
      options,
      {
        to: "/learn/options-trading-basics",
        label: "Calls, puts, premiums and expiry",
        description: "Start with the mechanics and risks of options contracts.",
      },
      sources,
    ];
  else if (path === "/calendar") links = [dividend, sources, checklist];
  else if (path === "/ipo")
    links = [
      {
        to: "/learn/how-to-apply-for-an-ipo-in-india",
        label: "Indian IPO application guide",
        description: "Understand the application and allotment process.",
      },
      checklist,
      sources,
    ];
  else if (path.startsWith("/compare")) links = [ratios, methodology, screener];
  else if (path.startsWith("/learn") || path === "/ratios") links = [ratios, screener, checklist];
  else if (/^\/(pricing|terms|privacy|refund-policy|contact)$/.test(path))
    links = [
      {
        to: "/pricing",
        label: "Plans and feature access",
        description: "Check the current plan details before subscribing.",
      },
      {
        to: "/contact",
        label: "Contact DeepScreen support",
        description: "Ask about your account, access or subscription.",
      },
      {
        to: "/terms",
        label: "Terms of service",
        description: "Read the conditions for using DeepScreen.",
      },
    ];
  else links = [screener, methodology, sources];
  return links.filter((link) => link.to !== path);
}
