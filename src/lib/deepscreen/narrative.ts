import type { Stock } from "./types";
import type { FundamentalSources } from "./live-merge";

const unavailable = (topic: string) =>
  `DeepScreen does not currently have a verified company-specific ${topic} field in the structured data for this page. That means the site should not invent an answer; the latest annual report, regulatory filings and official company disclosures should be used for this question.`;

const liveRatio = (
  sources: FundamentalSources | undefined,
  key: keyof FundamentalSources,
  value: number,
  suffix = "",
) =>
  sources?.[key] === "live" && Number.isFinite(value)
    ? `${value.toFixed(key === "pe" || key === "roe" || key === "roce" || key === "dividendYield" ? 1 : 2)}${suffix}`
    : null;

export function stockSummary(stock: Stock): string {
  return `Research ${stock.name} (${stock.exchange}: ${stock.symbol}) using available valuation, profitability and leverage data. Check each figure's source and compare reporting periods before drawing conclusions. Missing provider data must not be treated as a reported company fact.`;
}

export function stockFaqs(stock: Stock, sources?: FundamentalSources) {
  const f = stock.fundamentals;
  const pe = liveRatio(sources, "pe", f.pe, "x");
  const ps = liveRatio(sources, "ps", f.ps, "x");
  const roe = liveRatio(sources, "roe", f.roe, "%");
  const roce = liveRatio(sources, "roce", f.roce, "%");
  const de = liveRatio(sources, "debtToEquity", f.debtToEquity, "x");
  const growth = liveRatio(sources, "growth", f.growth, "%");
  const netMargin = liveRatio(sources, "netMargin", f.netMargin, "%");
  const dividendYield = liveRatio(sources, "dividendYield", f.dividendYield, "%");
  const payout = liveRatio(sources, "payoutRatio", f.payoutRatio, "%");

  return [
    {
      q: `How does DeepScreen analyze ${stock.name}?`,
      a: "DeepScreen uses a 13-factor valuation and quality model. The methodology explains the factors, inputs and limitations; model output is analytical research, not a personalized investment recommendation.",
    },
    {
      q: `What is ${stock.symbol}'s P/E ratio?`,
      a: pe
        ? `The latest provider-backed P/E available to DeepScreen is ${pe}. Check the reporting date and the company's latest earnings before comparing it with peers.`
        : "A provider-backed P/E ratio is currently unavailable. DeepScreen does not substitute a simulated number for missing reported earnings data.",
    },
    {
      q: `How should I assess ${stock.name}'s profitability?`,
      a: [
        roe ? `Current reported ROE is ${roe}` : "Reported ROE is not currently available",
        roce ? `and current reported ROCE is ${roce}` : "and reported ROCE is not currently available",
        ". For a reliable profitability assessment, compare several years of ROE/ROCE with close peers and investigate leverage, one-off gains/losses and accounting policy changes.",
      ].join(" "),
    },
    {
      q: `How much debt does ${stock.name} have?`,
      a: de
        ? `The latest provider-backed debt-to-equity ratio available to DeepScreen is ${de}. D/E alone does not show the full liquidity picture, so also review cash, maturities, interest expense and operating cash flow in the latest balance sheet and filings.`
        : unavailable("debt-to-equity and related leverage"),
    },
    {
      q: `Is ${stock.symbol} a buy?`,
      a: "DeepScreen provides research tools rather than a personalized recommendation. Review valuation, business quality, balance-sheet risk, disclosures and your own objectives before making an investment decision.",
    },

    {
      q: "How does the company make money?",
      a: unavailable("business-model and revenue-segment"),
    },
    {
      q: "What is the company's competitive advantage (economic moat)?",
      a: "A moat is company-specific and qualitative: look for durable cost advantages, scale, network effects, switching costs, brands, patents, licences or other structural barriers, and test whether those advantages show up in long-term margins and returns on capital. DeepScreen does not currently publish a verified moat classification for every stock page.",
    },
    {
      q: "Who are the main competitors, and how does the company differ from them?",
      a: `The current stock dataset does not contain a verified company-by-company competitor map for ${stock.name}. Competitors should be defined using the company's actual products, customers and geographic markets, then compared on growth, margins, returns on capital, leverage, valuation and market position.`,
    },
    {
      q: "Are its products or services in long-term demand?",
      a: `DeepScreen cannot establish long-term demand from a single market snapshot. For ${stock.name}, the defensible test is multi-year revenue/customer growth, retention or repeat demand where relevant, industry growth, pricing power, product replacement cycles and the risk of substitution or disruption.`,
    },
    {
      q: "Who are its primary customers (individuals, businesses, or government)?",
      a: unavailable("customer-mix and end-market concentration"),
    },
    {
      q: "Is the company consistently profitable, and is its revenue growing year-over-year?",
      a: [
        growth ? `The latest provider-backed revenue/earnings growth measure available to DeepScreen is ${growth}` : "A current growth measure is not available",
        netMargin ? `and the current reported net margin is ${netMargin}` : "and a current provider-backed net margin is not available",
        ". Consistent profitability and year-over-year growth require a multi-year income-statement series; one period is not enough to establish consistency.",
      ].join(" "),
    },
    {
      q: "Does the company generate positive, healthy free cash flow?",
      a: unavailable("free-cash-flow and cash-conversion"),
    },
    {
      q: "How high are the company's debt levels compared to its cash holdings and earnings?",
      a: de
        ? `DeepScreen currently has a provider-backed debt-to-equity ratio of ${de}, but the page does not have a verified cash balance and interest-coverage series sufficient to answer the full question. The correct assessment combines gross debt, cash, net debt, EBITDA/EBIT and interest expense over time.`
        : unavailable("debt, cash and interest-coverage"),
    },
    {
      q: "How will the company finance its future growth or expansion projects?",
      a: unavailable("management's forward financing plans and committed expansion funding"),
    },
    {
      q: "What is the company's historical Return on Equity (ROE) and Return on Capital Employed (ROCE)?",
      a: roe || roce
        ? `The current snapshot reports ${roe ? `ROE of ${roe}` : "no live ROE"}${roe && roce ? " and " : ""}${roce ? `ROCE of ${roce}` : "no live ROCE"}. DeepScreen does not currently store a complete historical time series for these ratios on every stock page, so historical consistency should be checked against annual filings.`
        : "A provider-backed current ROE/ROCE is unavailable. Historical ROE and ROCE should be taken from the company's annual filings rather than reconstructed from synthetic values.",
    },
    {
      q: "Who are the promoters or top executives running the company, and what is their track record?",
      a: unavailable("promoter, executive and leadership-track-record"),
    },
    {
      q: "Is a high percentage of the promoter's stake pledged as collateral for loans?",
      a: unavailable("promoter-pledge"),
    },
    {
      q: "Does management have a transparent and honest history of communication with shareholders?",
      a: "This cannot be established from a single structured metric. A responsible assessment requires checking earnings calls, shareholder letters, guidance versus delivered results, related-party disclosures, restatements and the clarity of risk disclosures over multiple reporting periods.",
    },
    {
      q: "Has the firm ever faced corporate governance issues, legal troubles, or accounting scandals?",
      a: `DeepScreen's structured stock data does not contain a complete, verified historical case register for ${stock.name}. Governance, litigation and accounting allegations should be checked against regulator filings, court records, audited reports and reputable reporting, with allegations clearly distinguished from established findings.`,
    },
    {
      q: "Is the current stock valuation (such as the P/E or P/S ratio) reasonable or overpriced?",
      a: [
        pe ? `The latest provider-backed P/E is ${pe}` : "A live provider-backed P/E is unavailable",
        ps ? `and P/S is ${ps}` : "and a live provider-backed P/S is unavailable",
        ". Those ratios are descriptive, not a verdict. Whether a valuation is justified depends on sustainable growth, margins, returns on capital, balance-sheet risk, cyclicality and comparable companies.",
      ].join(" "),
    },
    {
      q: "How does the company's valuation compare to its direct industry peers?",
      a: `DeepScreen provides valuation metrics for the company, but a direct-peer conclusion requires a defined peer set and the same reporting period. Compare P/E, P/S, EV/EBITDA and other relevant measures against close competitors rather than against the whole market.`,
    },
    {
      q: "What is the margin of safety if market conditions or the economy worsens?",
      a: "There is no single company-independent margin-of-safety percentage. A defensible estimate requires an explicit intrinsic-value method, downside assumptions for earnings/cash flow, balance-sheet liquidity and a conservative valuation multiple. Stress-test those assumptions rather than treating the current share price as the margin of safety.",
    },
    {
      q: "Does the company pay a reliable dividend, or does it aggressively buy back its own shares?",
      a: [
        dividendYield ? `The latest provider-backed dividend yield is ${dividendYield}` : "A current provider-backed dividend yield is unavailable",
        payout ? `and payout ratio is ${payout}` : "and a current provider-backed payout ratio is unavailable",
        ". DeepScreen's structured data does not provide a complete buyback history or a sufficiently long dividend track record for every stock, so reliability and repurchase intensity should be verified from company filings.",
      ].join(" "),
    },
  ];
}
