import type { Fundamentals } from "@/lib/deepscreen/types";

export type RatioDefinition = {
  slug: string; name: string; shortName: string; formula: string; answer: string;
  interpretation: string[]; cautions: string[]; field?: keyof Fundamentals;
};

export const RATIOS: RatioDefinition[] = [
  { slug: "pe-ratio", name: "Price-to-Earnings Ratio", shortName: "P/E", formula: "Share price ÷ earnings per share", field: "pe", answer: "P/E shows how much investors pay for one unit of annual earnings. Compare it with close sector peers and the company's own history, not with the whole market.", interpretation: ["A lower P/E can indicate cheaper earnings, slower expected growth, or higher risk.", "A higher P/E can reflect durable growth, quality, or excessive optimism."], cautions: ["P/E is not meaningful for loss-making companies.", "Cyclical companies can look cheapest near peak earnings."] },
  { slug: "peg-ratio", name: "Price/Earnings-to-Growth Ratio", shortName: "PEG", formula: "P/E ratio ÷ earnings growth rate", field: "peg", answer: "PEG relates a company's earnings multiple to its growth rate. A reading near 1 is often considered balanced, but growth quality and durability matter more than a single threshold.", interpretation: ["Below 1 can mean growth is inexpensive relative to the P/E.", "Above 2 can mean investors already price in strong growth."], cautions: ["Forecast growth can be wrong.", "Negative or unusually volatile growth makes PEG unreliable."] },
  { slug: "price-to-sales-ratio", name: "Price-to-Sales Ratio", shortName: "P/S", formula: "Market capitalisation ÷ annual revenue", field: "ps", answer: "P/S values a company against revenue and is useful when earnings are small or negative. It must be read with margins because sales without profit can destroy value.", interpretation: ["Compare P/S only among businesses with similar margins.", "A falling P/S can result from faster sales or a falling share price."], cautions: ["Revenue quality and recurring sales differ.", "P/S ignores debt and profitability."] },
  { slug: "price-to-book-ratio", name: "Price-to-Book Ratio", shortName: "P/B", formula: "Share price ÷ book value per share", field: "pb", answer: "P/B compares market value with accounting net assets. It is most useful for banks and asset-heavy companies and less useful for software or brands whose assets are not fully recorded.", interpretation: ["Below 1 means the market values equity below stated book value.", "A premium can be justified by high, durable returns on equity."], cautions: ["Book values can contain impaired or low-quality assets.", "Cross-sector comparisons are misleading."] },
  { slug: "ev-to-revenue", name: "Enterprise Value to Revenue", shortName: "EV/Revenue", formula: "Enterprise value ÷ annual revenue", field: "evRevenue", answer: "EV/Revenue values operations while accounting for debt and cash. It helps compare companies with different financing, especially before profits become stable.", interpretation: ["Lower multiples may signal value or weak margins.", "Higher multiples require growth and future margin expansion."], cautions: ["It ignores current profitability.", "Sector economics determine a sensible range."] },
  { slug: "ev-to-ebitda", name: "Enterprise Value to EBITDA", shortName: "EV/EBITDA", formula: "Enterprise value ÷ EBITDA", field: "evEbitda", answer: "EV/EBITDA compares the value of the whole business with operating earnings before interest, tax, depreciation and amortisation.", interpretation: ["Useful for comparing capital structures.", "Lower is generally cheaper when business quality is similar."], cautions: ["EBITDA is not cash flow.", "Capital-intensive companies may need large recurring investment."] },
  { slug: "return-on-equity", name: "Return on Equity", shortName: "ROE", formula: "Net income ÷ average shareholder equity", field: "roe", answer: "ROE measures profit generated from shareholder capital. High ROE is strongest when it is consistent and not created by excessive debt.", interpretation: ["Sustained ROE above sector norms can signal an economic moat.", "Read ROE beside debt-to-equity and return on assets."], cautions: ["Buybacks and leverage can inflate ROE.", "Negative equity makes the ratio misleading."] },
  { slug: "return-on-assets", name: "Return on Assets", shortName: "ROA", formula: "Net income ÷ average total assets", field: "roa", answer: "ROA measures how efficiently a company turns assets into profit. Asset-light and asset-heavy sectors naturally have different normal ranges.", interpretation: ["Rising ROA can show improving operating efficiency.", "Compare companies using similar business models."], cautions: ["Asset age and accounting policy affect the denominator.", "Banks require sector-specific interpretation."] },
  { slug: "return-on-capital-employed", name: "Return on Capital Employed", shortName: "ROCE", formula: "Operating profit ÷ capital employed", field: "roce", answer: "ROCE measures operating returns from both equity and debt capital. It is a useful quality signal for comparing companies with different leverage.", interpretation: ["ROCE consistently above the cost of capital indicates value creation.", "A multi-year trend matters more than one period."], cautions: ["One-off profits can distort a year.", "Definitions of capital employed vary by data source."] },
  { slug: "debt-to-equity-ratio", name: "Debt-to-Equity Ratio", shortName: "D/E", formula: "Total debt or liabilities ÷ shareholder equity", field: "debtToEquity", answer: "Debt-to-equity measures financial leverage. A lower value usually means a more conservative balance sheet, but normal leverage varies sharply by industry.", interpretation: ["Rising debt can increase both returns and downside risk.", "Judge debt alongside interest coverage and cash flow."], cautions: ["Banks use leverage as part of their business model.", "Lease accounting can change reported debt."] },
  { slug: "long-term-debt-to-equity", name: "Long-Term Debt to Equity", shortName: "LT D/E", formula: "Long-term debt ÷ shareholder equity", field: "longTermDebtToEquity", answer: "Long-term debt to equity isolates structural borrowing and helps show how much enduring leverage supports the business.", interpretation: ["A declining ratio can indicate balance-sheet repair.", "Stable cash-generating businesses can support more debt."], cautions: ["It excludes short-term obligations.", "Maturity schedules and interest rates still matter."] },
  { slug: "dividend-payout-ratio", name: "Dividend Payout Ratio", shortName: "Payout", formula: "Dividends ÷ net income", field: "payoutRatio", answer: "The payout ratio shows how much profit is distributed as dividends. A sustainable payout leaves enough cash to maintain the business and fund growth.", interpretation: ["A moderate payout can balance income and reinvestment.", "A ratio above 100% is usually unsustainable without reserves or debt."], cautions: ["Earnings can be more volatile than cash flow.", "REITs and similar structures use different benchmarks."] },
  { slug: "operating-leverage", name: "Operating Leverage", shortName: "Operating leverage", formula: "% change in operating profit ÷ % change in revenue", field: "operatingLeverage", answer: "Operating leverage shows how strongly operating profit responds to sales. High fixed costs can amplify both growth and downturns.", interpretation: ["High operating leverage benefits companies when sales rise.", "Low operating leverage can make earnings more resilient."], cautions: ["The ratio changes across the business cycle.", "A short measurement period can exaggerate the result."] },
  { slug: "piotroski-f-score", name: "Piotroski F-Score", shortName: "Piotroski F-Score", formula: "Nine binary profitability, leverage, liquidity and efficiency tests, summed from 0 to 9", answer: "The Piotroski F-Score is a nine-point financial-strength checklist. Higher scores indicate more positive accounting signals, while lower scores call for closer investigation.", interpretation: ["Scores of 7–9 are commonly treated as financially strong.", "Scores of 0–3 indicate several weak accounting signals."], cautions: ["It is a screening signal, not a valuation model.", "Missing statement fields should be reported as insufficient data, never estimated."] },
  { slug: "altman-z-score", name: "Altman Z-Score", shortName: "Altman Z-Score", formula: "1.2×working capital/assets + 1.4×retained earnings/assets + 3.3×EBIT/assets + 0.6×equity/liabilities + 1.0×sales/assets", answer: "The Altman Z-Score combines five balance-sheet and income-statement measures to estimate financial-distress risk. Higher readings generally indicate a wider safety margin.", interpretation: ["Above 3 is commonly considered the safer zone for the original public-manufacturer model.", "Below 1.8 is commonly considered a distress zone."], cautions: ["Thresholds vary by company type and model version.", "It should not be applied when required inputs are missing."] },
  { slug: "beneish-m-score", name: "Beneish M-Score", shortName: "Beneish M-Score", formula: "Weighted combination of eight year-over-year accounting indices", answer: "The Beneish M-Score screens for patterns associated with possible earnings manipulation. A concerning score is a prompt for deeper filing review, not proof of misconduct.", interpretation: ["Scores above the commonly used -1.78 threshold warrant closer review.", "The direction and movement of the eight component indices matter."], cautions: ["The model can produce false positives.", "Banks, insurers and missing historical inputs require special care."] },
];

export const findRatio = (slug: string) => RATIOS.find((ratio) => ratio.slug === slug);

export type Ranking = { slug: string; title: string; description: string; answer: string; sort: "score" | "roce" | "pe" | "dividendYield" | "growth"; exchange?: string };
export const RANKINGS: Ranking[] = [
  {
    slug: "best-fundamental-stocks",
    title: "Fundamental Stock Screening",
    description:
      "Learn how to evaluate stock fundamentals using valuation, profitability, growth and leverage together.",
    answer:
      "A fundamental screen is a starting point for research. Review available valuation, growth, capital returns and leverage inputs together, then verify the underlying statements. A complete model score requires complete, comparable inputs.",
    sort: "score",
  },
  {
    slug: "high-roce-stocks",
    title: "High ROCE Stock Screening",
    description:
      "How to research companies with strong return on capital employed and verify capital efficiency.",
    answer:
      "To research high ROCE, compare operating returns on capital over consistent periods within a sector. Check whether one-off profit, a small capital base or accounting differences explain the result. A single high ratio does not establish durable quality.",
    sort: "roce",
  },
  {
    slug: "low-pe-stocks",
    title: "Low P/E Stock Screening",
    description:
      "Learn how to research low price-to-earnings ratios and distinguish cheap earnings from value traps.",
    answer:
      "A low positive P/E can identify a valuation question, not an automatic bargain. Check the earnings period, cyclicality, exceptional items, debt and expectations before comparing close sector peers.",
    sort: "pe",
  },
  {
    slug: "high-dividend-stocks",
    title: "Dividend Stock Screening",
    description:
      "Research dividend yield alongside cash generation, payout ratios and balance-sheet strength.",
    answer:
      "Dividend yield relates annual dividends to share price. A high yield can reflect a falling price or an unsustainable payout. Verify the dividend period, cash generation and debt obligations before interpreting the ratio.",
    sort: "dividendYield",
  },
  {
    slug: "fast-growing-stocks",
    title: "Growth Stock Screening",
    description:
      "Evaluate earnings growth using comparable periods, business drivers, cash flow and valuation.",
    answer:
      "Growth screening starts with a consistent earnings definition and reporting period. Separate recurring operating progress from acquisitions, one-off items and a low comparison base. Compare the growth assumptions with the valuation being paid.",
    sort: "growth",
  },
  {
    slug: "high-roce-stocks-nse",
    title: "NSE High ROCE Screening Guide",
    description:
      "Research return on capital employed among NSE companies using consistent filing periods and accounting definitions.",
    answer:
      "For NSE company research, establish whether the inputs are consolidated or standalone and use the same basis across peers. Review multi-period operating profit and capital employed before treating a high ROCE reading as persistent.",
    sort: "roce",
    exchange: "NSE",
  },
  {
    slug: "undervalued-largecap-us",
    title: "US Large-Cap Valuation Research",
    description:
      "A guide to researching US large-cap valuation using filings, comparable earnings and financial risks.",
    answer:
      "To research potentially undervalued US large caps, first verify market capitalization and reporting currency. Review current SEC filings and compare valuation with growth, cash flow and leverage. A low multiple alone does not establish undervaluation.",
    sort: "pe",
    exchange: "US",
  },
  {
    slug: "highest-dividend-yield-lse",
    title: "LSE Dividend Research Guide",
    description:
      "Research LSE dividends using consistent quote units, payment currencies and payout periods.",
    answer:
      "When researching LSE dividends, check whether the quote is in pence or pounds and whether the dividend uses the same currency and unit. Verify the payment period, special dividends and cash coverage before comparing yields.",
    sort: "dividendYield",
    exchange: "LSE",
  },
];
export const findRanking = (slug: string) => RANKINGS.find((ranking) => ranking.slug === slug);

export type Comparison = { slug: string; title: string; description: string; answer: string; left: string; right: string; rows: [string, string, string][] };
export const COMPARISONS: Comparison[] = [
  { slug: "pe-vs-peg-ratio", title: "P/E vs PEG Ratio", description: "Compare P/E and PEG: what each valuation ratio measures, when each works, and where each can mislead.", answer: "P/E prices current earnings; PEG adjusts that multiple for earnings growth. Use P/E for stable peer comparisons and PEG when growth is positive and reasonably predictable.", left: "P/E", right: "PEG", rows: [["Measures", "Price per unit of earnings", "P/E relative to growth"], ["Best for", "Stable profitable peers", "Growing profitable companies"], ["Main weakness", "Ignores growth", "Depends on a reliable growth rate"], ["Avoid when", "Earnings are negative", "Growth is negative or volatile"]] },
  { slug: "roe-vs-roce", title: "ROE vs ROCE", description: "Understand the difference between return on equity and return on capital employed.", answer: "ROE measures returns on shareholder equity; ROCE measures operating returns on equity plus debt. Reading both helps reveal when leverage is flattering shareholder returns.", left: "ROE", right: "ROCE", rows: [["Capital base", "Shareholder equity", "Equity plus debt capital"], ["Profit measure", "Net income", "Operating profit"], ["Debt sensitivity", "Can be inflated by leverage", "Includes debt in capital"], ["Best use", "Shareholder return quality", "Business-wide capital efficiency"]] },
  { slug: "fundamental-vs-technical-analysis", title: "Fundamental vs Technical Analysis", description: "Compare company fundamentals with price-and-volume analysis for investing and trading.", answer: "Fundamental analysis asks what a business may be worth; technical analysis studies price, volume and trend. They answer different questions and can be used together.", left: "Fundamental", right: "Technical", rows: [["Primary data", "Financial statements and economics", "Price and volume"], ["Typical horizon", "Months to years", "Minutes to months"], ["Core question", "What is the business worth?", "What is the market doing?"], ["Main limitation", "Value may take time to emerge", "Signals can whipsaw in ranges"]] },
];
export const findComparison = (slug: string) => COMPARISONS.find((comparison) => comparison.slug === slug);

export type StockComparison = { slug: string; left: { exchange: string; symbol: string }; right: { exchange: string; symbol: string } };
export const STOCK_COMPARISONS: StockComparison[] = [
  { slug: "hdfc-bank-vs-icici-bank", left: { exchange: "NSE", symbol: "HDFCBANK" }, right: { exchange: "NSE", symbol: "ICICIBANK" } },
  { slug: "apple-vs-microsoft", left: { exchange: "NASDAQ", symbol: "AAPL" }, right: { exchange: "NASDAQ", symbol: "MSFT" } },
  { slug: "amazon-vs-tesla", left: { exchange: "NASDAQ", symbol: "AMZN" }, right: { exchange: "NASDAQ", symbol: "TSLA" } },
  { slug: "alphabet-vs-meta", left: { exchange: "NASDAQ", symbol: "GOOGL" }, right: { exchange: "NASDAQ", symbol: "META" } },
  { slug: "exxon-vs-chevron", left: { exchange: "NYSE", symbol: "XOM" }, right: { exchange: "NYSE", symbol: "CVX" } },
];
export const findStockComparison = (slug: string) => STOCK_COMPARISONS.find((comparison) => comparison.slug === slug);

export type StrategyGuide = { slug: string; name: string; outlook: string; description: string; answer: string; construction: string; risk: string; reward: string; breakeven: string };
export const STRATEGY_GUIDES: StrategyGuide[] = [
  { slug: "long-call", name: "Long Call", outlook: "Bullish", description: "Long call options strategy explained with risk, reward, breakeven and time-decay considerations.", answer: "A long call buys the right to purchase the underlying at the strike. Maximum loss is the premium; upside is theoretically unlimited.", construction: "Buy one call option.", risk: "Premium paid.", reward: "Theoretically unlimited above breakeven.", breakeven: "Strike plus premium at expiry." },
  { slug: "long-put", name: "Long Put", outlook: "Bearish", description: "Long put strategy explained, including downside protection, maximum loss and breakeven.", answer: "A long put gains as the underlying falls below the strike. It can express a bearish view or protect an existing holding.", construction: "Buy one put option.", risk: "Premium paid.", reward: "Substantial but capped when the underlying reaches zero.", breakeven: "Strike minus premium at expiry." },
  { slug: "bull-call-spread", name: "Bull Call Spread", outlook: "Moderately bullish", description: "Bull call spread explained with two calls, defined risk, capped reward and breakeven.", answer: "A bull call spread buys a call and sells a higher-strike call with the same expiry. The short call lowers cost and caps profit.", construction: "Buy a lower-strike call and sell a higher-strike call.", risk: "Net debit paid.", reward: "Strike width minus net debit.", breakeven: "Lower strike plus net debit." },
  { slug: "bear-put-spread", name: "Bear Put Spread", outlook: "Moderately bearish", description: "Bear put spread explained with defined risk, capped reward and expiry breakeven.", answer: "A bear put spread buys a put and sells a lower-strike put. It reduces premium cost in exchange for capped downside profit.", construction: "Buy a higher-strike put and sell a lower-strike put.", risk: "Net debit paid.", reward: "Strike width minus net debit.", breakeven: "Higher strike minus net debit." },
  { slug: "long-straddle", name: "Long Straddle", outlook: "High volatility", description: "Long straddle explained for event-driven moves, including two breakevens and time-decay risk.", answer: "A long straddle buys an at-the-money call and put. It profits from a sufficiently large move in either direction but loses from time decay if price stays near the strike.", construction: "Buy one call and one put at the same strike and expiry.", risk: "Total premiums paid.", reward: "Unlimited upside; substantial downside potential.", breakeven: "Strike plus or minus total premium." },
  { slug: "short-strangle", name: "Short Strangle", outlook: "Neutral", description: "Short strangle explained with premium income, two breakevens and unlimited tail risk.", answer: "A short strangle sells an out-of-the-money call and put. It benefits from time decay and a range-bound market but carries very large tail risk.", construction: "Sell an out-of-the-money call and put.", risk: "Unlimited on the upside and substantial on the downside.", reward: "Premium received.", breakeven: "Put strike minus credit and call strike plus credit." },
  { slug: "covered-call", name: "Covered Call", outlook: "Neutral to moderately bullish", description: "Covered call options strategy explained with income, capped upside and assignment risk.", answer: "A covered call holds shares and sells a call against them. The premium adds income, but gains above the strike are surrendered and the shares still carry downside risk.", construction: "Own 100 shares and sell one call option.", risk: "Nearly the full downside of the shares, reduced by premium received.", reward: "Premium plus gains up to the call strike.", breakeven: "Share purchase price minus premium received." },
  { slug: "iron-condor", name: "Iron Condor", outlook: "Neutral", description: "Iron condor strategy explained with four options, defined risk, capped reward and two breakevens.", answer: "An iron condor combines a bull put spread and bear call spread. It earns a limited credit when price stays between the short strikes, with defined losses outside the wings.", construction: "Sell an out-of-the-money put spread and call spread with the same expiry.", risk: "Spread width minus net credit.", reward: "Net credit received.", breakeven: "Short put minus credit and short call plus credit." },
];
export const findStrategyGuide = (slug: string) => STRATEGY_GUIDES.find((strategy) => strategy.slug === slug);
