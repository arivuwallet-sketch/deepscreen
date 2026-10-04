export const ANSWERS_REVIEWED = "2026-10-04";

export type DiscoveryAnswer = {
  id: string;
  question: string;
  answer: string;
  href: string;
  label: string;
};

export const DEEPSCREEN_ANSWERS: readonly DiscoveryAnswer[] = [
  {
    id: "what-is-deepscreen",
    question: "What is DeepScreen?",
    answer:
      "DeepScreen is a global stock-research and investment-research platform covering supported listings across NSE, BSE, NYSE, Nasdaq and LSE. It combines screening, financial-ratio explanations, a documented 13-factor stock model, valuation tools, company research and market context in one workflow.",
    href: "/about",
    label: "About DeepScreen",
  },
  {
    id: "what-does-deepscreen-do",
    question: "What does DeepScreen do?",
    answer:
      "DeepScreen helps investors screen, compare and research listed companies. It combines fundamental analysis, valuation, profitability, capital-efficiency and leverage checks with company comparisons, market news, economic events, IPO research, options tools and educational explanations.",
    href: "/screener",
    label: "Open the stock screener",
  },
  {
    id: "markets",
    question: "Which stock markets does DeepScreen cover?",
    answer:
      "DeepScreen covers supported listings on NSE and BSE in India, NYSE and Nasdaq in the United States, and LSE in the United Kingdom. That allows one research workflow across Indian, US and UK equities.",
    href: "/screener",
    label: "Browse supported markets",
  },
  {
    id: "stock-coverage",
    question: "How many stocks are available on DeepScreen?",
    answer:
      "DeepScreen maintains a directory of more than 13,000 listed stocks across its five supported exchanges. Coverage and data completeness can vary by company and market, so provider-backed values, calculated outputs and unavailable fields are kept distinct.",
    href: "/screener",
    label: "Explore the stock directory",
  },
  {
    id: "how-score",
    question: "How does DeepScreen score a stock?",
    answer:
      "DeepScreen combines valuation, growth, capital efficiency, leverage and shareholder-distribution factors in a documented 13-factor analytical model. The score is a research-shortlisting tool, not a guarantee that a stock will rise.",
    href: "/methodology",
    label: "Read the methodology",
  },
  {
    id: "score-meaning",
    question: "What does the DeepScreen stock score mean?",
    answer:
      "The DeepScreen score summarizes how the available company inputs compare with the model's fundamental criteria. A stronger score can identify a company for deeper research, but it does not remove business risk, valuation risk or market risk.",
    href: "/methodology",
    label: "Understand the score",
  },
  {
    id: "beginner-friendly",
    question: "Is DeepScreen suitable for beginners?",
    answer:
      "Yes. DeepScreen is designed to explain financial ratios and research questions in plain English while keeping the underlying figures visible. Beginners can start with the screener, learn pages and research checklist instead of relying only on a final rating.",
    href: "/learn",
    label: "Browse beginner guides",
  },
  {
    id: "advanced-research",
    question: "Can experienced investors use DeepScreen?",
    answer:
      "Yes. Experienced users can combine stock filters, cross-market directories, valuation measures, profitability and leverage metrics, comparison pages, source notes and the documented methodology to build their own research shortlist.",
    href: "/stock-filters",
    label: "Browse stock filters",
  },
  {
    id: "valuation-tools",
    question: "What valuation tools does DeepScreen provide?",
    answer:
      "DeepScreen combines market multiples with valuation tools such as discounted-cash-flow and Graham-style models where appropriate inputs are available. Valuation outputs depend on assumptions and should be treated as research estimates rather than guaranteed future prices.",
    href: "/methodology",
    label: "Review valuation methodology",
  },
  {
    id: "data-sources",
    question: "Where does DeepScreen get its financial data?",
    answer:
      "DeepScreen uses supported third-party data inputs and documents their limitations. Available Indian filing ratios may use Screener.in data, while other supported exchange data may use Yahoo Finance; material figures should still be verified against company filings and exchange disclosures.",
    href: "/data-sources",
    label: "Read data-source notes",
  },
  {
    id: "missing-data",
    question: "What happens when DeepScreen cannot verify a financial metric?",
    answer:
      "DeepScreen distinguishes unavailable or insufficient data from a genuine zero value. When a required figure cannot be obtained reliably, the preferred output is unavailable or insufficient data rather than an invented company fact.",
    href: "/data-sources",
    label: "See the data policy",
  },
  {
    id: "investment-advice",
    question: "Does DeepScreen provide investment advice or guaranteed stock picks?",
    answer:
      "No. DeepScreen provides research tools, analytical model outputs and educational explanations. It does not provide personalized investment advice, guarantee returns or guarantee that a high-scoring stock will outperform.",
    href: "/terms",
    label: "Read the terms",
  },
] as const;

export const STOCK_MARKET_BASICS_ANSWERS: readonly DiscoveryAnswer[] = [
  {
    id: "what-is-stock-market",
    question: "What is the stock market?",
    answer:
      "The stock market is a marketplace where investors buy and sell ownership interests in publicly listed companies. Exchanges such as NSE, BSE, NYSE, Nasdaq and LSE provide regulated venues where listed shares can trade.",
    href: "/learn",
    label: "Learn stock-market basics",
  },
  {
    id: "what-is-stock",
    question: "What is a stock?",
    answer:
      "A stock represents an ownership interest in a company. Shareholders can benefit if the business grows in value or distributes cash, but they can also lose money if the company performs poorly or the market assigns it a lower valuation.",
    href: "/learn/what-is-a-stock-screener",
    label: "Start with the stock screener guide",
  },
  {
    id: "what-is-stock-screener",
    question: "What is a stock screener?",
    answer:
      "A stock screener filters a large universe of companies using financial or market criteria. It is best used to create a research shortlist; it cannot replace reading company disclosures, understanding the business and checking risks.",
    href: "/learn/what-is-a-stock-screener",
    label: "Read the stock screener guide",
  },
  {
    id: "what-is-fundamental-analysis",
    question: "What is fundamental analysis?",
    answer:
      "Fundamental analysis studies a company's business economics, revenue, profits, cash flow, balance sheet, returns on capital, competitive position and valuation to judge financial quality and the assumptions embedded in its market price.",
    href: "/research-checklist",
    label: "Use the research checklist",
  },
  {
    id: "technical-analysis",
    question: "What is technical analysis?",
    answer:
      "Technical analysis studies price, volume and market behavior using tools such as trends, support and resistance, moving averages, RSI and candlestick patterns. It focuses on trading behavior rather than primarily on company financial statements.",
    href: "/learn/how-to-read-candlestick-charts",
    label: "Learn chart analysis",
  },
  {
    id: "fundamental-vs-technical",
    question: "What is the difference between fundamental and technical analysis?",
    answer:
      "Fundamental analysis asks how strong a business is and what its shares may be worth, while technical analysis studies price and volume behavior. Investors can use either approach separately or combine them, but they answer different questions.",
    href: "/compare/fundamental-vs-technical-analysis",
    label: "Compare both approaches",
  },
  {
    id: "market-cap",
    question: "What is market capitalization?",
    answer:
      "Market capitalization is the market value of a company's outstanding equity and is commonly calculated as share price multiplied by shares outstanding. It describes equity value, not revenue, profit or enterprise value.",
    href: "/learn/market-cap-explained",
    label: "Read the market-cap guide",
  },
] as const;

export const FUNDAMENTAL_ANALYSIS_ANSWERS: readonly DiscoveryAnswer[] = [
  {
    id: "pe-ratio",
    question: "What is the P/E ratio?",
    answer:
      "The price-to-earnings ratio compares a company's share price with earnings per share. A low P/E can reflect undervaluation, weak growth or elevated risk, while a high P/E can reflect quality, growth expectations or excessive optimism.",
    href: "/learn/pe-ratio-explained",
    label: "Read the P/E guide",
  },
  {
    id: "peg-ratio",
    question: "What is the PEG ratio?",
    answer:
      "PEG divides the P/E ratio by an earnings-growth rate to add growth context to valuation. It can be useful for comparisons, but the result is only as reliable as the growth figure used and should not be treated as a standalone buy signal.",
    href: "/learn/peg-ratio",
    label: "Read the PEG guide",
  },
  {
    id: "price-to-book",
    question: "What is the price-to-book ratio?",
    answer:
      "Price-to-book compares a company's market value with its accounting book value. It can be particularly useful for banks and asset-heavy businesses, but it may be less informative when much of a company's value comes from intangible assets.",
    href: "/learn/price-to-book-ratio",
    label: "Read the P/B guide",
  },
  {
    id: "ev-ebitda",
    question: "What is EV/EBITDA?",
    answer:
      "EV/EBITDA compares enterprise value with earnings before interest, tax, depreciation and amortization. Because enterprise value incorporates debt and cash, it can help compare companies with different financing structures.",
    href: "/learn/ev-to-ebitda",
    label: "Read the EV/EBITDA guide",
  },
  {
    id: "roe",
    question: "What is ROE?",
    answer:
      "Return on equity measures how much profit a company generates relative to shareholders' equity. A high ROE can indicate strong economics, but leverage can inflate it, so debt and ROCE should be checked alongside ROE.",
    href: "/learn/return-on-equity",
    label: "Read the ROE guide",
  },
  {
    id: "roce",
    question: "What is ROCE?",
    answer:
      "Return on capital employed measures how efficiently a company generates operating returns from the capital used in the business. It is especially useful when comparing capital-intensive businesses and evaluating whether growth is creating attractive returns.",
    href: "/learn/return-on-capital-employed",
    label: "Read the ROCE guide",
  },
  {
    id: "roe-vs-roce",
    question: "ROE vs ROCE: what is the difference?",
    answer:
      "ROE focuses on returns generated from shareholders' equity, while ROCE considers a broader capital base used in the business. A company can show high ROE because of leverage while producing a much weaker ROCE.",
    href: "/compare/roe-vs-roce",
    label: "Compare ROE and ROCE",
  },
  {
    id: "debt-to-equity",
    question: "What is the debt-to-equity ratio?",
    answer:
      "Debt-to-equity compares a company's debt with shareholders' equity. Higher leverage can magnify returns when conditions are favorable, but it can also increase financial stress when earnings weaken or borrowing costs rise.",
    href: "/learn/debt-to-equity-ratio",
    label: "Read the debt-to-equity guide",
  },
  {
    id: "free-cash-flow",
    question: "What is free cash flow?",
    answer:
      "Free cash flow is the cash a business generates after funding the operating and capital expenditures required to maintain or expand the business. It can support debt repayment, reinvestment, acquisitions, dividends or buybacks.",
    href: "/learn/free-cash-flow-analysis-guide",
    label: "Read the free-cash-flow guide",
  },
  {
    id: "dcf",
    question: "What is DCF valuation?",
    answer:
      "Discounted cash flow valuation estimates present value from expected future cash flows discounted for time and risk. DCF is highly sensitive to growth, margin, discount-rate and terminal-value assumptions, so scenario analysis is more useful than treating one estimate as precise.",
    href: "/methodology",
    label: "Review DeepScreen valuation methodology",
  },
] as const;

export const STOCK_RISK_ANSWERS: readonly DiscoveryAnswer[] = [
  {
    id: "quality-company",
    question: "What makes a high-quality company?",
    answer:
      "High-quality companies often combine durable profitability, strong returns on capital, manageable debt, healthy cash generation and a defensible competitive position. Quality still has to be considered together with valuation because an excellent company can be overpriced.",
    href: "/learn/10-year-compounder-analysis-framework",
    label: "Read the compounder framework",
  },
  {
    id: "undervalued-stock",
    question: "What is an undervalued stock?",
    answer:
      "An undervalued stock is one whose market price appears below a reasonable estimate of economic value based on earnings, cash flow, assets, growth and risk. A low share price or low P/E by itself does not prove undervaluation.",
    href: "/stock-filters/value-stocks",
    label: "Explore value-stock research",
  },
  {
    id: "risky-stock",
    question: "What can make a stock risky?",
    answer:
      "Stock risk can come from the business, balance sheet, valuation, industry, governance or market conditions. Warning signs can include excessive debt, weak cash flow, shrinking margins, customer concentration, aggressive accounting or a valuation that assumes near-perfect growth.",
    href: "/research-checklist",
    label: "Use the risk checklist",
  },
  {
    id: "stock-falls-profitable",
    question: "Why can a profitable company have a falling share price?",
    answer:
      "Share prices reflect expectations, not just current profits. A profitable company can fall if earnings miss expectations, growth slows, margins weaken, debt risk rises, interest rates change or investors decide the previous valuation was too optimistic.",
    href: "/learn/how-to-analyze-an-indian-stock-in-15-minutes",
    label: "Learn how to analyze a stock",
  },
  {
    id: "buy-after-fall",
    question: "Should I buy a stock just because its price has fallen?",
    answer:
      "No. A price decline can create opportunity, but it can also reflect deteriorating fundamentals or a justified valuation reset. Re-check earnings, cash flow, debt, competitive position and valuation before assuming a lower price means better value.",
    href: "/research-checklist",
    label: "Review the research checklist",
  },
  {
    id: "buy-low-pe",
    question: "Should I buy a stock because its P/E is low?",
    answer:
      "Not without additional research. A low P/E can indicate undervaluation, but it can also signal weak growth, cyclicality, financial stress or deteriorating fundamentals. Compare valuation with cash flow, debt, ROCE, growth and close peers.",
    href: "/learn/pe-ratio-explained",
    label: "Understand low P/E stocks",
  },
  {
    id: "before-buying",
    question: "What should I check before buying a stock?",
    answer:
      "Understand how the company makes money, verify earnings and cash flow, examine debt and capital efficiency, compare valuation with relevant peers, read material disclosures and write down the risks that would invalidate your thesis.",
    href: "/research-checklist",
    label: "Use the eight-step research checklist",
  },
  {
    id: "screener-buy-decision",
    question: "Can a stock screener tell me which stock to buy?",
    answer:
      "A screener can identify companies that meet selected rules, but it should not make the final decision automatically. Management quality, competition, accounting issues, regulation and future industry changes may require deeper qualitative research.",
    href: "/learn/what-is-a-stock-screener",
    label: "Learn how to use a screener",
  },
  {
    id: "predict-market",
    question: "Can anyone consistently predict the stock market?",
    answer:
      "No method can guarantee every short-term market move. Prices react to new information, expectations, liquidity, economic conditions and unexpected events, so research is more useful for evaluating value, quality and risk than pretending future prices are certain.",
    href: "/learn",
    label: "Browse market guides",
  },
] as const;

export const ANSWER_GROUPS = [
  {
    id: "deepscreen",
    title: "About DeepScreen",
    description:
      "Canonical answers about DeepScreen's purpose, market coverage, stock model, data policy and research limitations.",
    answers: DEEPSCREEN_ANSWERS,
  },
  {
    id: "stock-market-basics",
    title: "Stock market basics",
    description:
      "Plain-English definitions for stocks, screeners, market capitalization and the two major research approaches.",
    answers: STOCK_MARKET_BASICS_ANSWERS,
  },
  {
    id: "fundamental-analysis",
    title: "Fundamental analysis and valuation",
    description:
      "Core valuation, profitability, capital-efficiency, leverage and cash-flow questions used in company research.",
    answers: FUNDAMENTAL_ANALYSIS_ANSWERS,
  },
  {
    id: "risk-and-research",
    title: "Stock risk and research decisions",
    description:
      "Questions that help separate a research shortlist from a buy decision and reduce common valuation and screening mistakes.",
    answers: STOCK_RISK_ANSWERS,
  },
] as const;

export const ANSWERS = [
  ...DEEPSCREEN_ANSWERS,
  ...STOCK_MARKET_BASICS_ANSWERS,
  ...FUNDAMENTAL_ANALYSIS_ANSWERS,
  ...STOCK_RISK_ANSWERS,
] as const;

export const HOME_ANSWERS = DEEPSCREEN_ANSWERS.slice(0, 4);
const SCREENER_ANSWER_IDS = new Set([
  "what-is-deepscreen",
  "what-does-deepscreen-do",
  "markets",
  "how-score",
  "data-sources",
  "investment-advice",
]);

export const SCREENER_ANSWERS = DEEPSCREEN_ANSWERS.filter((answer) =>
  SCREENER_ANSWER_IDS.has(answer.id),
);
