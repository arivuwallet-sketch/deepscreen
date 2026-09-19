import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import type { Stock } from "./types";
import type { FundamentalSources } from "./live-merge";

const unavailable = (topic: string) =>
  `The current structured company profile does not contain a reliable company-specific ${topic} figure. The correct source for that fact is the latest annual report, exchange filing and official company disclosure; DeepScreen should not manufacture a number.`;

const liveRatio = (
  sources: FundamentalSources | undefined,
  key: keyof FundamentalSources,
  value: number,
  suffix = "",
) =>
  sources?.[key] === "live" && Number.isFinite(value)
    ? `${value.toFixed(
        key === "pe" || key === "roe" || key === "roce" || key === "dividendYield"
          ? 1
          : 2,
      )}${suffix}`
    : null;

const money = (value: number | null | undefined, currency: string | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const unit = currency === "INR" ? "₹" : currency === "GBP" ? "£" : "$";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return unit + (value / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return unit + (value / 1_000_000).toFixed(2) + "M";
  return unit + Math.round(value).toLocaleString("en-US");
};

function officerText(officers: LiveFundamentals["officers"] | undefined): string | null {
  if (!officers?.length) return null;
  const names = officers
    .slice(0, 5)
    .map((o) => (o.title ? `${o.name} (${o.title})` : o.name))
    .filter(Boolean);
  return names.length ? names.join("; ") : null;
}

function businessModelAnswer(stock: Stock, live?: LiveFundamentals | null): string {
  if (live?.summary) {
    return `${live.summary} This describes the company's disclosed business activity; for exact segment revenue, geography and customer concentration, use the latest annual report.`;
  }
  return `${stock.name} operates in the ${stock.sector} sector. The business-model answer should be anchored to its products/services, pricing model, operating segments and sources of revenue rather than inferred from its stock price or valuation ratios.`;
}

function longTermDemandAnswer(stock: Stock, live?: LiveFundamentals | null): string {
  const industry = live?.industry ?? stock.sector;
  return `${stock.name} is classified in ${industry}. Long-term demand is supported when the underlying industry, customer base and product/service use remain durable over multiple years. For ${stock.name}, test that through multi-year revenue and customer trends, retention/repeat purchases where applicable, pricing power, capacity utilisation and the risk of substitution or technological disruption.`;
}

function profitabilityAnswer(
  stock: Stock,
  sources: FundamentalSources | undefined,
  live?: LiveFundamentals | null,
): string {
  const growth = liveRatio(sources, "growth", stock.fundamentals.growth, "%");
  const roe = liveRatio(sources, "roe", stock.fundamentals.roe, "%");
  const roce = liveRatio(sources, "roce", stock.fundamentals.roce, "%");
  const margin = liveRatio(sources, "netMargin", stock.fundamentals.netMargin, "%");
  const bits = [
    growth ? `the latest growth measure is ${growth}` : null,
    margin ? `net margin is ${margin}` : null,
    roe ? `ROE is ${roe}` : null,
    roce ? `ROCE is ${roce}` : null,
  ].filter(Boolean);
  const headline = bits.length
    ? `For ${stock.name}, the latest provider-backed snapshot shows ${bits.join(", ")}.`
    : `For ${stock.name}, the current snapshot does not contain all of the reported profitability fields needed for a numerical conclusion.`;
  return `${headline} Consistent profitability and healthy year-over-year growth should be confirmed over several reporting periods, with earnings reconciled to operating cash flow and one-off items removed from the analysis.`;
}

export function stockSummary(stock: Stock): string {
  return `Research ${stock.name} (${stock.exchange}: ${stock.symbol}) using available valuation, profitability and leverage data. Check each figure's source and compare reporting periods before drawing conclusions. Missing provider data must not be treated as a reported company fact.`;
}

export function stockFaqs(
  stock: Stock,
  sources?: FundamentalSources,
  live?: LiveFundamentals | null,
  peerNames: string[] = [],
) {
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
  const fcf = money(live?.freeCashflow, live?.currency);
  const opCash = money(live?.operatingCashflow, live?.currency);
  const cash = money(live?.totalCash, live?.currency);
  const debt = money(live?.totalDebt, live?.currency);
  const netDebt =
    typeof live?.totalDebt === "number" && typeof live?.totalCash === "number"
      ? money(live.totalDebt - live.totalCash, live.currency)
      : null;
  const executives = officerText(live?.officers);

  return [
    {
      q: `How does DeepScreen analyze ${stock.name}?`,
      a: "DeepScreen uses a 13-factor valuation and quality model. The methodology explains the inputs, weighting and limitations; model output is analytical research, not a personalized investment recommendation.",
    },
    {
      q: `What is ${stock.symbol}'s P/E ratio?`,
      a: pe
        ? `The latest provider-backed P/E available to DeepScreen is ${pe}. Compare it with the company's own historical range, sustainable earnings growth and close industry peers, using the same reporting period.`
        : "A current provider-backed P/E is not available. The defensible approach is to calculate or verify it from the latest price and reported trailing earnings rather than substitute a synthetic figure.",
    },
    {
      q: `How should I assess ${stock.name}'s profitability?`,
      a: profitabilityAnswer(stock, sources, live),
    },
    {
      q: `How much debt does ${stock.name} have?`,
      a: de
        ? `The latest provider-backed debt-to-equity ratio is ${de}. ${debt ? `Total debt is approximately ${debt}` : "The current debt balance is not exposed in this snapshot"}${cash ? `, while cash is approximately ${cash}` : ""}. Assess leverage together with interest expense, maturities and operating cash flow.`
        : unavailable("debt-to-equity"),
    },
    {
      q: `Is ${stock.symbol} a buy?`,
      a: "DeepScreen provides research tools rather than a personalized recommendation. A decision should consider business quality, valuation, balance-sheet risk, disclosures, liquidity and your own objectives and risk tolerance.",
    },
    {
      q: "How does the company make money?",
      a: businessModelAnswer(stock, live),
    },
    {
      q: "What is the company's competitive advantage (economic moat)?",
      a: `${stock.name}'s potential moat should be evaluated from observable business economics: scale or cost advantages, network effects, switching costs, brand strength, patents or licences, distribution advantages and barriers to entry. The strongest evidence is a durable combination of pricing power, stable/growing margins and returns on capital over many years; a high ROE or ROCE alone does not prove a moat.`,
    },
    {
      q: "Who are the main competitors, and how does the company differ from them?",
      a: peerNames.length
        ? `Within DeepScreen's current ${stock.exchange} coverage, the closest same-sector listed peers include ${peerNames.join(", ")}. Treat these as a starting peer set rather than proof that each is a direct competitor; the direct comparison should use products, customers, geography, margins, growth, returns on capital and valuation.`
        : `${stock.name} should be compared with companies selling similar products or services to similar customers in the same geography. A direct-peer set is more informative than comparing against the entire ${stock.sector} sector.`,
    },
    {
      q: "Are its products or services in long-term demand?",
      a: longTermDemandAnswer(stock, live),
    },
    {
      q: "Who are its primary customers (individuals, businesses, or government)?",
      a: live?.summary
        ? `The provider's business profile describes ${stock.name}'s activities as follows: ${live.summary} Customer mix itself is not a stock-market ratio, so the primary customers should be confirmed from the company's segment, geographic and customer disclosures.`
        : `${stock.name} serves markets within the ${stock.sector} sector. Whether its primary customers are consumers, businesses or government depends on its disclosed end markets and contracts; use the company's segment and customer-concentration disclosures for the exact mix.`,
    },
    {
      q: "Is the company consistently profitable, and is its revenue growing year-over-year?",
      a: profitabilityAnswer(stock, sources, live),
    },
    {
      q: "Does the company generate positive, healthy free cash flow?",
      a: fcf
        ? `The latest provider snapshot reports free cash flow of approximately ${fcf}${opCash ? `, with operating cash flow of about ${opCash}` : ""}. Whether that cash flow is healthy depends on persistence, conversion of profit to cash, capital expenditure needs and working-capital movements; inspect multiple periods rather than one TTM figure.`
        : `Free cash flow should be assessed as operating cash flow minus capital expenditure and then tested for consistency across several periods. A positive single-period result is not enough to establish healthy cash generation.`,
    },
    {
      q: "How high are the company's debt levels compared to its cash holdings and earnings?",
      a: debt || cash || de
        ? `The current snapshot shows ${de ? `D/E of ${de}` : "a partial leverage picture"}${debt ? `, debt of roughly ${debt}` : ""}${cash ? `, cash of roughly ${cash}` : ""}${netDebt ? `, implying net debt of about ${netDebt}` : ""}. The full debt burden should be compared with EBITDA/EBIT, interest expense, maturities and recurring free cash flow.`
        : "Compare gross debt and cash first, then assess net debt relative to EBITDA/EBIT and interest coverage. This separates a highly leveraged balance sheet from a business that carries debt comfortably because cash generation is strong.",
    },
    {
      q: "How will the company finance its future growth or expansion projects?",
      a: cash || fcf
        ? `${stock.name} currently has ${cash ? `reported cash of about ${cash}` : "limited disclosed cash data"}${fcf ? ` and free cash flow of about ${fcf}` : ""}. Those internal resources can contribute to expansion, while additional funding can come from operating cash flow, debt, equity issuance, asset sales or project finance. The exact funding mix for a specific project must come from management's disclosed plans.`
        : "The normal financing options are internally generated cash, existing cash reserves, new debt, equity issuance, asset sales or project finance. The exact mix for a future project should be taken from management's announced capital-allocation and funding plans.",
    },
    {
      q: "What is the company's historical Return on Equity (ROE) and Return on Capital Employed (ROCE)?",
      a: roe || roce
        ? `The latest snapshot reports ${roe ? `ROE of ${roe}` : "no current live ROE"}${roe && roce ? " and " : ""}${roce ? `ROCE of ${roce}` : "no current live ROCE"}. Historical quality should be judged from a multi-year series and by checking whether returns remain above the company's cost of capital through different business conditions.`
        : "Historical ROE and ROCE should be taken from several annual reporting periods. The key question is whether returns remain durable rather than whether one year's ratio is high.",
    },
    {
      q: "Who are the promoters or top executives running the company, and what is their track record?",
      a: executives
        ? `The current provider profile lists these senior executives: ${executives}. Track record should be assessed through capital-allocation decisions, operating results, governance disclosures and execution against stated targets. For Indian companies, promoter identity and ownership should be checked against the latest exchange shareholding filing.`
        : `Leadership track record should be assessed from the current board/management disclosure, operating performance, capital allocation and delivery against stated goals. For Indian companies, promoter identity and ownership should be checked against the latest exchange shareholding filing.`,
    },
    {
      q: "Is a high percentage of the promoter's stake pledged as collateral for loans?",
      a: `Promoter pledge is a shareholding-disclosure item, not a normal valuation ratio. For an Indian company, check the latest exchange shareholding pattern and notes for pledged/encumbered promoter shares, and compare the percentage with prior quarters to identify changes. Do not infer pledge levels from debt-to-equity.`,
    },
    {
      q: "Does management have a transparent and honest history of communication with shareholders?",
      a: `The strongest evidence is consistency between what management says and what later appears in reported results: guidance versus delivery, explanations for misses, treatment of related parties, restatements, capital allocation and disclosure of material risks. A multi-year record is needed; tone alone is not a reliable measure of transparency.`,
    },
    {
      q: "Has the firm ever faced corporate governance issues, legal troubles, or accounting scandals?",
      a: `This question requires a dated event history. Review regulator orders, exchange notices, audited-report qualifications, court records and reputable reporting, and distinguish allegations or investigations from settlements and established findings. The absence of a warning label on a stock page is not proof that no historical event ever occurred.`,
    },
    {
      q: "Is the current stock valuation (such as the P/E or P/S ratio) reasonable or overpriced?",
      a: [
        pe ? `The latest provider-backed P/E is ${pe}` : "A live provider-backed P/E is not available",
        ps ? `and P/S is ${ps}` : "and P/S is not currently available",
        ". These are descriptive multiples, not conclusions by themselves. A defensible valuation assessment compares the multiple with sustainable growth, margins, ROE/ROCE, balance-sheet risk, cyclicality and direct peers.",
      ].join(" "),
    },
    {
      q: "How does the company's valuation compare to its direct industry peers?",
      a: peerNames.length
        ? `A practical peer set for ${stock.name} starts with ${peerNames.join(", ")}. Compare the same reporting-period P/E, P/S and EV/EBITDA, then adjust for growth, margin quality, leverage and business mix; a lower multiple is not automatically cheaper on an economic-value basis.`
        : `Build a direct peer set from companies with similar products, customers and geography. Then compare like-for-like valuation multiples, growth, margins, capital efficiency and leverage using the same reporting period.`,
    },
    {
      q: "What is the margin of safety if market conditions or the economy worsens?",
      a: "Margin of safety is created by buying with a gap between conservative intrinsic value and market price, then stress-testing the downside case. The relevant stress tests are lower revenue/earnings growth, lower margins, higher funding costs, weaker working capital and a lower terminal valuation. There is no universal fixed percentage that applies to every company.",
    },
    {
      q: "Does the company pay a reliable dividend, or does it aggressively buy back its own shares?",
      a: [
        dividendYield ? `The latest provider-backed dividend yield is ${dividendYield}` : "The current provider-backed dividend yield is not available",
        payout ? `and payout ratio is ${payout}` : "",
        ". Dividend reliability should be checked across several years and against free cash flow, while buyback intensity should be verified from share-count changes, treasury-share activity and cash-flow statements. A one-year yield cannot establish a durable shareholder-distribution policy.",
      ].filter(Boolean).join(" "),
    },
  ];
}
