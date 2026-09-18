export const ANSWERS_REVIEWED = "2026-09-18";
export const ANSWERS = [
  {
    id: "what-is-deepscreen",
    question: "What is DeepScreen?",
    answer:
      "DeepScreen is a stock screener and fundamental research platform for listings on NSE, BSE, NYSE, Nasdaq and LSE. Its 13-factor model examines valuation, profitability and leverage. A directory listing does not mean every financial input is available.",
    href: "/methodology",
    label: "Read the scoring methodology",
  },
  {
    id: "markets",
    question: "Which stock markets does DeepScreen cover?",
    answer:
      "DeepScreen's directory covers five exchanges: NSE and BSE in India, NYSE and Nasdaq in the United States, and LSE in the United Kingdom. Coverage is limited to the supported listings in each directory; it is not a complete worldwide securities database.",
    href: "/",
    label: "Browse the exchange directories",
  },
  {
    id: "free-access",
    question: "Can I use DeepScreen for free?",
    answer:
      "Company search, available raw fundamental ratios and educational guides can be accessed without a paid subscription. Some analysis tools and features require Pro. Check the pricing page for current plan details.",
    href: "/pricing",
    label: "Compare current plans",
  },
  {
    id: "investment-advice",
    question: "Does DeepScreen provide investment advice?",
    answer:
      "DeepScreen provides research tools and educational model output. A score, valuation estimate or screen is not a personalized recommendation, a forecast or a guarantee of returns. Verify material facts in company disclosures before making decisions.",
    href: "/terms",
    label: "Read the terms",
  },
  {
    id: "stock-screener",
    question: "What is a stock screener?",
    answer:
      "A stock screener narrows a company universe using criteria such as exchange, market capitalization or financial ratios. The result is a research shortlist. Review the underlying business, financial statements and data dates before drawing conclusions from a screen.",
    href: "/research-checklist",
    label: "Use the research checklist",
  },
  {
    id: "fundamental-analysis",
    question: "How do I start fundamental stock analysis?",
    answer:
      "Start with the business model and latest annual report. Compare revenue, earnings, cash flow, debt and capital returns over consistent periods. Then compare valuation with similar businesses and record the risks and assumptions behind your conclusion.",
    href: "/research-checklist",
    label: "Follow the research workflow",
  },
  {
    id: "incomplete-data",
    question: "How does DeepScreen handle missing financial data?",
    answer:
      "DeepScreen can keep scores and verdicts visible using modeled fallback inputs while provider fundamentals load. Model-dependent outputs are research estimates, and availability varies by input. Check source tooltips and verify material values in company filings.",
    href: "/data-sources",
    label: "Understand data availability",
  },
  {
    id: "freshness",
    question: "Are all DeepScreen numbers real time?",
    answer:
      "No. Quote and fundamental availability depend on the provider, reporting period and retrieval time. Some supplementary panels use illustrative model data. Do not cite illustrative values as reported company facts; verify the source and period of any number you use.",
    href: "/data-sources",
    label: "Review sources and limitations",
  },
  {
    id: "cross-market",
    question: "Can I compare Indian, US and UK stocks directly?",
    answer:
      "Use consistent reporting periods, currencies, units and accounting definitions before comparing companies across markets. Even a dimensionless ratio can be misleading across different sectors or reporting practices. Keep each listing's exchange and currency with your research notes.",
    href: "/research-checklist",
    label: "Check cross-market comparability",
  },
  {
    id: "agent-access",
    question: "Can an AI assistant access DeepScreen resources?",
    answer:
      "Yes. The public read-only API provides exchange metadata, educational metric definitions and these answers. The OpenAPI document describes the supported endpoints. This API does not provide live quotes, personal portfolios, trading or subscription access.",
    href: "/developers",
    label: "Read the public API documentation",
  },
] as const;
export const HOME_ANSWERS = ANSWERS.slice(0, 4);
