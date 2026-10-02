import type { Investment, InvestmentType } from "@/lib/deepscreen/investments";

export interface InvestmentFaqItem {
  id: string;
  type: InvestmentType | "ALL";
  question: string;
  answer: string;
}

export const INVESTMENT_FAQS: readonly InvestmentFaqItem[] = [
  {
    id: "mutual-fund-etf-reit-difference",
    type: "ALL",
    question: "What is the difference between a mutual fund, an ETF and a REIT?",
    answer: "A mutual fund pools investor money into a managed portfolio and is normally bought or redeemed at a calculated NAV. An ETF is also a pooled portfolio, but its units trade on an exchange during market hours, so the market price can differ from NAV. A REIT is a listed real-estate trust that owns or finances income-producing property. Compare fund process and costs for mutual funds, basket tracking and trading quality for ETFs, and property cash flow, leases, leverage and valuation for REITs.",
  },
  {
    id: "how-deepscreen-analyzes-investments",
    type: "ALL",
    question: "How does DeepScreen analyze mutual funds, ETFs and REITs?",
    answer: "DeepScreen uses a different framework for each investment type instead of applying company-only stock ratios to everything. Mutual funds are reviewed through process, rolling performance, risk-adjusted measures, portfolio construction, people and cost. ETFs are reviewed as baskets using holdings, valuation, concentration, tracking, liquidity and trading costs. REITs are reviewed as property operating businesses using occupancy and lease quality where available, cash flow, leverage, distribution coverage and property valuation measures.",
  },
  {
    id: "mutual-fund-definition",
    type: "FUND",
    question: "What is a mutual fund and how does it work?",
    answer: "A mutual fund pools money from many investors and invests it according to a stated objective, such as equity, debt, hybrid or index investing. Investors own units of the scheme rather than the underlying securities directly. The value of each unit is represented by the scheme's net asset value, or NAV. When comparing funds, look beyond the latest return and examine the mandate, benchmark, portfolio, fees, manager record and downside behaviour over complete market cycles.",
  },
  {
    id: "mutual-fund-nav",
    type: "FUND",
    question: "What is mutual fund NAV?",
    answer: "NAV, or net asset value, is the per-unit value of a mutual fund after valuing its assets and subtracting liabilities and expenses. For ordinary open-ended mutual funds it is calculated periodically rather than traded continuously like a stock price. A higher NAV does not by itself mean a fund is expensive or better; performance, portfolio quality, costs and the number of units outstanding matter more than the absolute NAV number.",
  },
  {
    id: "direct-vs-regular",
    type: "FUND",
    question: "What is the difference between Direct and Regular mutual fund plans in India?",
    answer: "Direct and Regular plans belong to the same underlying scheme and generally hold the same portfolio under the same fund manager, but their expense ratios differ. A Direct plan does not include distributor commission in the same way a Regular plan does, so its ongoing expense ratio is normally lower. Because expenses are deducted from scheme assets, the two plans have separate NAVs and their returns can diverge over time. Compare like-for-like options before judging performance.",
  },
  {
    id: "mutual-fund-expense-ratio",
    type: "FUND",
    question: "What is a mutual fund expense ratio or TER?",
    answer: "The total expense ratio, or TER, is the recurring cost charged to a mutual fund scheme for management and operating expenses. It is expressed as a percentage of assets and is reflected in the fund's NAV. Small fee differences can compound over long holding periods, but the lowest TER is not automatically the best fund; compare cost together with mandate, benchmark-relative results, portfolio risk, manager process and consistency.",
  },
  {
    id: "mutual-fund-performance",
    type: "FUND",
    question: "How should I compare mutual fund performance?",
    answer: "Compare a fund with an appropriate benchmark and comparable funds over multiple periods instead of relying on one strong calendar year. Useful checks include 3-, 5- and 10-year annualized returns where history exists, rolling returns, maximum drawdown, volatility and risk-adjusted measures such as Sharpe and Sortino. Also confirm whether the current manager was responsible for the historical record and whether the fund's style has materially changed.",
  },
  {
    id: "mutual-fund-risk",
    type: "FUND",
    question: "What risks should I check before choosing a mutual fund?",
    answer: "Start with the fund's stated objective and riskometer, then examine concentration, sector or credit exposure, portfolio turnover, drawdown, volatility and liquidity of the underlying assets. For active funds, review manager tenure and style drift. For passive funds, tracking error and tracking difference are important. Past returns do not guarantee future returns, so a fund should be evaluated against its objective, risk profile and costs rather than its recent ranking alone.",
  },
  {
    id: "etf-definition",
    type: "ETF",
    question: "What is an ETF?",
    answer: "An exchange-traded fund, or ETF, is a pooled investment portfolio whose units trade on a stock exchange during market hours. Many ETFs track an index, sector, commodity or rules-based strategy, while some are actively managed. Because ETF units trade in the market, investors should evaluate both the underlying portfolio and the trading experience: holdings, index methodology, expense ratio, tracking quality, bid-ask spread, volume and premium or discount to NAV.",
  },
  {
    id: "etf-vs-mutual-fund",
    type: "ETF",
    question: "ETF vs mutual fund: what is the main difference?",
    answer: "Both can provide diversified exposure, but the transaction mechanism is different. A traditional mutual fund is normally purchased or redeemed with the fund at a calculated NAV, while an ETF trades on an exchange at market prices throughout the trading session. That means ETF investors must consider spreads, market liquidity and premium or discount to NAV in addition to the fund's expense ratio and portfolio. Mutual fund investors should pay particular attention to plan costs, loads and the scheme's process.",
  },
  {
    id: "tracking-error-difference",
    type: "ETF",
    question: "What are tracking error and tracking difference in an ETF?",
    answer: "Tracking difference is the gap between an ETF's return and the return of the benchmark it is designed to follow over a period. Tracking error measures how variable that return gap is over time. Expense ratio, trading costs, cash holdings, index rebalancing and replication choices can all affect tracking. For an index ETF, consistently small tracking difference and tracking error can be more informative than looking at the expense ratio alone.",
  },
  {
    id: "etf-premium-discount",
    type: "ETF",
    question: "Why can an ETF trade above or below its NAV?",
    answer: "ETF units trade in the secondary market, so their market price is set by buyers and sellers while NAV reflects the value of the underlying portfolio. When market demand, liquidity, trading hours or the pricing of underlying securities differ, the ETF may trade at a premium or discount to NAV. Large or persistent gaps deserve attention because the investor may be paying more than the underlying basket is worth or selling for less.",
  },
  {
    id: "etf-liquidity-spread",
    type: "ETF",
    question: "How do volume and bid-ask spread affect ETF investors?",
    answer: "Trading volume shows how much an ETF changes hands, while the bid-ask spread is the gap between the best quoted buying and selling prices. A wider spread increases the friction of entering or exiting a position even when the published expense ratio is low. For execution quality, look at normal trading volume, spread behaviour during liquid market hours, assets under management and whether the underlying securities themselves are liquid.",
  },
  {
    id: "etf-holdings-concentration",
    type: "ETF",
    question: "How should I analyze ETF holdings and concentration?",
    answer: "Treat the ETF as one large basket. Check the index or strategy it follows, the weight of its top holdings, sector concentration and whether a small number of securities drive most of the risk. Then review weighted portfolio valuation and quality measures such as P/E, P/B, earnings growth, ROE and leverage when those metrics are meaningful for the holdings. A diversified-looking ETF name can still hide significant concentration.",
  },
  {
    id: "reit-definition",
    type: "REIT",
    question: "What is a REIT?",
    answer: "A real estate investment trust, or REIT, is an investment vehicle that gives investors economic exposure to income-producing real estate without requiring direct ownership of each property. Listed REIT units trade on an exchange. Their economics are driven by the underlying properties, rental income, occupancy, lease terms, financing costs, development and acquisitions, so REIT analysis should focus on property cash flow and balance-sheet strength rather than treating the trust like an ordinary industrial company.",
  },
  {
    id: "reit-analysis",
    type: "REIT",
    question: "What are the most important metrics for analyzing a REIT?",
    answer: "Key operating measures include occupancy, WALE or weighted average lease expiry, tenant concentration, rent growth and same-property NOI. Cash-flow analysis should focus on REIT-specific distributable cash flow such as AFFO in markets where it is reported, or NDCF for Indian REITs. Balance-sheet checks include LTV, debt to EBITDA, interest coverage, debt maturities and fixed versus floating debt. Valuation can include price to AFFO, NAV discount or premium, implied cap rate and distribution yield.",
  },
  {
    id: "reit-occupancy-wale",
    type: "REIT",
    question: "Why do occupancy and WALE matter for REITs?",
    answer: "Occupancy indicates how much of a REIT's rentable property is currently leased. WALE, or weighted average lease expiry, estimates the average remaining lease term after weighting leases by a relevant measure such as rent or area. High occupancy and a well-staggered lease profile can support cash-flow visibility, while heavy near-term expiries or dependence on a few tenants can increase renewal and vacancy risk. These measures should be read together with tenant quality and rental terms.",
  },
  {
    id: "reit-ndcf-affo",
    type: "REIT",
    question: "What are NDCF and AFFO, and why are they useful for REIT analysis?",
    answer: "Ordinary accounting earnings can be distorted for property businesses by depreciation, asset sales and non-cash items. REIT investors therefore often use cash-flow measures designed for property operations. AFFO is commonly used in several international REIT markets, while Indian REIT disclosures focus on net distributable cash flow, or NDCF. The exact definition can differ by market and issuer, so compare the reported calculation with operating cash flow and the distribution actually paid.",
  },
  {
    id: "indian-reit-distribution",
    type: "REIT",
    question: "How much of its cash flow must an Indian REIT distribute?",
    answer: "Under India's SEBI REIT framework, at least 90% of the REIT's net distributable cash flows must be distributed to unit holders, subject to the applicable regulations and distribution mechanics. That requirement does not make a high distribution yield automatically attractive. Investors should still check whether NDCF is sustainable, whether debt is rising, how much capital expenditure is required and whether property occupancy and lease quality can support future distributions.",
  },
  {
    id: "reit-nav-cap-rate",
    type: "REIT",
    question: "How do NAV and cap rate help value a REIT?",
    answer: "REIT NAV estimates the value of the underlying property portfolio after accounting for debt and other relevant assets or liabilities. Comparing the unit price with NAV can show whether the market is pricing the REIT at a premium or discount to estimated asset value. Cap rate relates property income to property value and can help compare the implied valuation with private-market real estate. Both measures depend heavily on property valuations, NOI assumptions and the date of the inputs.",
  },
] as const;

export const INVESTMENT_SOURCE_LINKS = [
  { label: "SEBI Investor — mutual funds, ETFs and REITs", href: "https://investor.sebi.gov.in/securities-howtoinvest.html" },
  { label: "AMFI — Direct vs Regular plans", href: "https://www.amfiindia.com/investor/knowledge-center-info?zoneName=DirectPlan" },
  { label: "AMFI — expense ratio / TER", href: "https://www.amfiindia.com/investor/knowledge-center-info?zoneName=expenseRatio" },
  { label: "Investor.gov — mutual funds", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs/mutual-funds" },
  { label: "Investor.gov — ETFs", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2" },
  { label: "SEBI Investor — understanding REITs and InvITs", href: "https://investor.sebi.gov.in/understanding_reit_invit.html" },
  { label: "SEBI — REIT Regulations (amended 18 Apr 2026)", href: "https://www.sebi.gov.in/legal/regulations/apr-2026/securities-and-exchange-board-of-india-real-estate-investment-trusts-regulations-2014-last-amended-on-april-18-2026-_101013.html" },
] as const;

export function faqForType(type: InvestmentType): InvestmentFaqItem[] {
  return INVESTMENT_FAQS.filter((faq) => faq.type === "ALL" || faq.type === type);
}

export function investmentDetailFaq(item: Investment): InvestmentFaqItem[] {
  const name = item.name.trim() || item.code;
  const code = item.code;

  if (item.type === "FUND") {
    return [
      { id: "what-is-this-fund", type: "FUND", question: "What is " + name + " (" + code + ")?", answer: name + " is listed by DeepScreen as an Indian mutual fund scheme. Its NAV is a dated per-unit scheme value rather than an exchange-traded stock price. Use the scheme's stated category, benchmark, plan type, portfolio, manager record, risk measures and costs together when researching it." },
      { id: "how-analyze-this-fund", type: "FUND", question: "How should I analyze " + name + "?", answer: "Start with " + name + "'s objective and benchmark, then compare multi-year and rolling returns, drawdowns, volatility and risk-adjusted measures with relevant peers. Review portfolio concentration, manager tenure, TER, turnover and exit load where disclosed. For Indian schemes, compare Direct and Regular plans like-for-like because their expenses and NAVs can differ." },
      { id: "nav-meaning", type: "FUND", question: "What does the NAV of " + name + " mean?", answer: "The NAV is the per-unit value of " + name + "'s underlying assets after liabilities and scheme expenses. It is useful for valuing transactions and calculating returns, but the absolute NAV level does not tell you whether the fund is cheap or expensive. Evaluate the portfolio, performance, risk and cost instead of comparing funds only by NAV." },
      { id: "costs", type: "FUND", question: "What costs should I check for " + name + "?", answer: "Check the current total expense ratio, whether the listing is a Direct or Regular plan, portfolio turnover and any applicable exit load. Costs reduce investor returns over time, so compare the correct plan and option rather than relying on a scheme name alone." },
      { id: "buy-question", type: "FUND", question: "Is " + name + " a good mutual fund to invest in?", answer: "DeepScreen does not make a personalized investment recommendation. Whether " + name + " is suitable depends on the scheme mandate, risk, cost, portfolio, time horizon and how it fits an investor's broader financial situation. Use the analysis as research input and verify the latest scheme documents before making a decision." },
    ];
  }

  if (item.type === "ETF") {
    return [
      { id: "what-is-this-etf", type: "ETF", question: "What is " + name + " (" + code + ")?", answer: name + " is listed by DeepScreen as an exchange-traded fund. An ETF represents a portfolio of underlying assets while its units trade on an exchange during market hours. Research the fund's benchmark or strategy, holdings, concentration, costs, tracking quality and trading liquidity rather than evaluating it as a single operating company." },
      { id: "how-analyze-this-etf", type: "ETF", question: "How should I analyze " + name + "?", answer: "Analyze " + name + " as a basket. Check what index or strategy it follows, the weight of its largest holdings and sectors, portfolio valuation and quality where meaningful, historical drawdown and volatility, expense ratio, tracking difference, tracking error, bid-ask spread, AUM, volume and premium or discount to NAV." },
      { id: "premium-discount", type: "ETF", question: "Why can " + code + " trade at a premium or discount to NAV?", answer: code + "'s exchange price is set by buyers and sellers while NAV reflects the value of the underlying portfolio. Differences in liquidity, trading hours, market stress or the pricing of underlying assets can create a premium or discount. Large or persistent gaps can increase the effective cost of trading the ETF." },
      { id: "tracking", type: "ETF", question: "What tracking metrics matter for " + name + "?", answer: "For a benchmark-tracking ETF, compare both tracking difference and tracking error. Tracking difference shows how far the fund's return has lagged or exceeded its benchmark over a period, while tracking error measures how variable that gap has been. Fees, cash holdings, rebalancing and implementation costs can affect both." },
      { id: "buy-question", type: "ETF", question: "Is " + name + " a good ETF to buy?", answer: "DeepScreen does not provide a personalized buy recommendation. Assess whether " + name + "'s benchmark or strategy, concentration, costs, tracking, liquidity and risk fit the exposure you are researching, and verify the issuer's latest factsheet and prospectus before making an investment decision." },
    ];
  }

  return [
    { id: "what-is-this-reit", type: "REIT", question: "What is " + name + " (" + code + ")?", answer: name + " is listed by DeepScreen as a real estate investment trust. REIT units provide exposure to income-producing property through a listed vehicle. The main research questions concern property quality, occupancy, leases, tenant concentration, NOI or distributable cash flow, leverage, distributions and property valuation." },
    { id: "how-analyze-this-reit", type: "REIT", question: "How should I analyze " + name + "?", answer: "Review " + name + "'s occupancy, WALE, tenant concentration, property mix and rent growth first. Then examine NOI and REIT-specific cash flow such as AFFO or NDCF where reported, distribution coverage, LTV or debt to EBITDA, interest coverage, debt maturities and fixed versus floating debt. Finally compare the market price with NAV and implied property cap rates where reliable inputs exist." },
    { id: "cashflow", type: "REIT", question: "Why are AFFO or NDCF important for " + name + "?", answer: "Property accounting earnings can include depreciation and other items that do not directly describe distributable operating cash. REIT-specific measures such as AFFO or NDCF can therefore provide a clearer view of cash available to support distributions, but definitions differ by market and issuer. Always reconcile the reported measure with operating cash flow, debt and actual distributions." },
    { id: "occupancy-wale", type: "REIT", question: "What do occupancy and WALE tell me about " + name + "?", answer: "Occupancy shows how much of the portfolio is leased, while WALE summarizes the weighted remaining lease term. Together with tenant quality and concentration, they help indicate cash-flow visibility and near-term renewal risk. A strong headline occupancy rate can still hide risk if a large share of rent expires soon or depends on a small number of tenants." },
    { id: "buy-question", type: "REIT", question: "Is " + name + " a good REIT to invest in?", answer: "DeepScreen does not make a personalized investment recommendation. Evaluate " + name + "'s property quality, lease profile, cash-flow coverage, leverage, refinancing risk, distribution sustainability and valuation, and confirm current REIT filings before deciding whether the exposure fits your own objectives and risk tolerance." },
  ];
}
