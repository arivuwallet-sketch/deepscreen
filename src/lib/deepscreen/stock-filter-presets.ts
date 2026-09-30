import { getIndexMemberships, isInIndex } from "./indices";
import { analyze } from "./metrics";
import { REQUESTED_STOCK_FILTER_LABELS } from "./stock-filter-labels";
import type { Stock } from "./types";

export type StockFilterStatus = "available" | "needs-data";
export interface StockFilterPreset {
  id: string;
  label: string;
  group: string;
  status: StockFilterStatus;
  description: string;
  missingData?: string;
  test?: (stock: Stock) => boolean;
}

type Rule = (stock: Stock) => boolean;
type RuleDef = { rule: Rule; description: string };

const slugify = (v: string) =>
  v.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const all = (...rules: Rule[]): Rule => (s) => rules.every((r) => r(s));
const any = (...rules: Rule[]): Rule => (s) => rules.some((r) => r(s));
const pe = (max: number, min = 0): Rule => (s) => s.fundamentals.pe > min && s.fundamentals.pe <= max;
const pb = (max: number): Rule => (s) => s.fundamentals.pb > 0 && s.fundamentals.pb <= max;
const peg = (max: number): Rule => (s) => s.fundamentals.peg > 0 && s.fundamentals.peg <= max;
const growth = (min: number): Rule => (s) => s.fundamentals.growth >= min;
const roe = (min: number): Rule => (s) => s.fundamentals.roe >= min;
const roa = (min: number): Rule => (s) => s.fundamentals.roa >= min;
const roce = (min: number): Rule => (s) => s.fundamentals.roce >= min;
const debtMax = (max: number): Rule => (s) => s.fundamentals.debtToEquity <= max;
const debtMin = (min: number): Rule => (s) => s.fundamentals.debtToEquity >= min;
const margin = (min: number): Rule => (s) => s.fundamentals.netMargin >= min;
const dividend = (min: number): Rule => (s) => s.fundamentals.dividendYield >= min;
const payout = (min: number, max: number): Rule => (s) =>
  s.fundamentals.payoutRatio >= min && s.fundamentals.payoutRatio <= max;
const scoreMin = (min: number): Rule => (s) => analyze(s).score >= min;
const cap = (tier: Stock["cap"]): Rule => (s) => s.cap === tier;
const exchange = (...codes: string[]): Rule => (s) => codes.includes(s.exchange);
const sector = (...names: string[]): Rule => (s) => names.includes(s.sector);
const changeMin = (min: number): Rule => (s) => s.changePct >= min;
const changeMax = (max: number): Rule => (s) => s.changePct <= max;
const volumeMin = (min: number): Rule => (s) => s.volume >= min;
const volumeMax = (max: number): Rule => (s) => s.volume <= max;

const value = all(pe(22), pb(4), peg(1.8));
const deepValue = all(pe(15), pb(2.5), debtMax(1.2));
const quality = all(roe(15), roce(15), debtMax(1), margin(8));
const growthRule = growth(15);
const highGrowth = growth(22);
const income = all(dividend(2), payout(5, 85));
const highDividend = all(dividend(3), payout(5, 90));
const momentum = changeMin(1.5);
const defensive = sector("Consumer Staples", "Healthcare", "Utilities");
const cyclical = sector("Consumer Discretionary", "Industrials", "Materials", "Energy", "Real Estate");
const compounder = all(quality, growth(12), scoreMin(60));
const potentialMultibagger = all(
  any(cap("small"), cap("mid")),
  growth(20),
  roe(15),
  roce(15),
  debtMax(0.8),
  pe(40),
  scoreMin(60),
);
const stable = all(
  any(cap("large"), cap("mid")),
  (s) => Math.abs(s.changePct) <= 1.5,
  debtMax(1),
  scoreMin(55),
);
const graham: Rule = (s) =>
  s.fundamentals.pe > 0 &&
  s.fundamentals.pb > 0 &&
  s.fundamentals.pe * s.fundamentals.pb <= 22.5 &&
  s.fundamentals.debtToEquity <= 1;
const garp = all(growth(12), pe(35), peg(1.5), debtMax(1.2));
const sustainableGrowth: Rule = (s) =>
  s.fundamentals.roe * Math.max(0, 1 - s.fundamentals.payoutRatio / 100) >= 10;
const highSustainableGrowth: Rule = (s) =>
  s.fundamentals.roe * Math.max(0, 1 - s.fundamentals.payoutRatio / 100) >= 15;
const penny: Rule = (s) =>
  s.exchange === "NSE" || s.exchange === "BSE"
    ? s.price > 0 && s.price < 20
    : s.exchange === "NYSE" || s.exchange === "NASDAQ"
      ? s.price > 0 && s.price < 5
      : s.exchange === "LSE"
        ? s.price > 0 && s.price < 100
        : false;
const blueChip: Rule = (s) =>
  s.cap === "large" &&
  ["NIFTY50", "SENSEX", "SP500", "NASDAQ100", "FTSE100"].some((id) =>
    isInIndex(s.exchange, s.symbol, id),
  );

const direct = new Map<string, RuleDef>([
  ["value stocks", { rule: value, description: "Positive P/E, P/B and PEG inside DeepScreen's value bands." }],
  ["undervalued stocks", { rule: value, description: "Modeled value screen using P/E, P/B and PEG." }],
  ["attractive valuation stocks", { rule: value, description: "Modeled value screen using P/E, P/B and PEG." }],
  ["deep value stocks", { rule: deepValue, description: "Stricter low-P/E, low-P/B and controlled-debt screen." }],
  ["cheap stocks", { rule: deepValue, description: "Stricter low-P/E, low-P/B and controlled-debt screen." }],
  ["bargain stocks", { rule: deepValue, description: "Stricter low-P/E, low-P/B and controlled-debt screen." }],
  ["discounted stocks", { rule: deepValue, description: "Stricter low-P/E, low-P/B and controlled-debt screen." }],
  ["growth stocks", { rule: growthRule, description: "Modeled growth of at least 15%." }],
  ["high growth stocks", { rule: highGrowth, description: "Modeled growth of at least 22%." }],
  ["fast growing stocks", { rule: highGrowth, description: "Modeled growth of at least 22%." }],
  ["quality stocks", { rule: quality, description: "ROE/ROCE at least 15%, controlled debt and positive margins." }],
  ["income stocks", { rule: income, description: "Dividend-yield and payout screen." }],
  ["dividend stocks", { rule: dividend(0.01), description: "Positive modeled dividend yield." }],
  ["high dividend yield stocks", { rule: highDividend, description: "Yield at least 3% with a bounded payout ratio." }],
  ["momentum stocks", { rule: momentum, description: "Current price change of at least +1.5%." }],
  ["strong momentum stocks", { rule: changeMin(3), description: "Current price change of at least +3%." }],
  ["blue chip stocks", { rule: blueChip, description: "Large-cap member of a flagship benchmark in DeepScreen's index map." }],
  ["penny stocks", { rule: penny, description: "Low nominal-price screen using market-specific thresholds." }],
  ["fundamentally strong stocks", { rule: scoreMin(65), description: "DeepScreen model score of at least 65." }],
  ["financially strong stocks", { rule: all(scoreMin(60), debtMax(1), roe(12), roce(12)), description: "Balanced score, leverage and return-on-capital screen." }],
  ["strong balance sheet stocks", { rule: all(debtMax(0.5), scoreMin(55)), description: "Low modeled leverage plus a non-weak score." }],
  ["fundamentally weak stocks", { rule: (s) => analyze(s).score < 40, description: "DeepScreen model score below 40." }],
  ["cyclical stocks", { rule: cyclical, description: "Companies in sectors commonly treated as cyclical." }],
  ["defensive stocks", { rule: defensive, description: "Consumer Staples, Healthcare and Utilities." }],
  ["recession resistant stocks", { rule: all(defensive, debtMax(1), margin(5)), description: "Defensive-sector heuristic with controlled leverage and positive margins." }],
  ["stable stocks", { rule: stable, description: "Large/mid cap, modest current move, controlled debt and adequate model score." }],
  ["mature companies", { rule: cap("large"), description: "Large-cap companies." }],
  ["established companies", { rule: cap("large"), description: "Large-cap companies." }],
  ["profitable companies", { rule: (s) => s.epsTtm > 0 && s.fundamentals.netMargin > 0, description: "Positive modeled EPS and net margin." }],
  ["profit making stocks", { rule: (s) => s.epsTtm > 0 && s.fundamentals.netMargin > 0, description: "Positive modeled EPS and net margin." }],
  ["loss making companies", { rule: (s) => s.epsTtm < 0 || s.fundamentals.netMargin < 0, description: "Negative modeled EPS or net margin." }],
  ["high earnings yield stocks", { rule: pe(20), description: "Positive P/E of 20 or below (~5%+ earnings yield)." }],
  ["graham value stocks", { rule: graham, description: "Classic Graham P/E × P/B threshold with controlled leverage." }],
  ["benjamin graham stocks", { rule: graham, description: "Classic Graham P/E × P/B threshold with controlled leverage." }],
  ["warren buffett style stocks", { rule: all(quality, margin(12), debtMax(0.7), scoreMin(65)), description: "Quality/profitability heuristic; not a claim of Buffett ownership." }],
  ["peter lynch style stocks", { rule: all(growth(12), pe(35), peg(1.5)), description: "Growth-at-a-reasonable-price heuristic." }],
  ["quality at reasonable price stocks", { rule: all(quality, value), description: "Quality plus moderate valuation." }],
  ["garp stocks", { rule: garp, description: "Growth at a reasonable price." }],
  ["growth at reasonable price stocks", { rule: garp, description: "Growth at a reasonable price." }],
  ["compounder stocks", { rule: compounder, description: "Quality + growth + score heuristic." }],
  ["wealth creator stocks", { rule: compounder, description: "Quality-growth heuristic; not a forecast." }],
  ["potential wealth creators", { rule: compounder, description: "Quality-growth heuristic; not a forecast." }],
  ["potential multibagger stocks", { rule: potentialMultibagger, description: "Small/mid-cap quality-growth heuristic; not a return prediction." }],
  ["multibagger candidates", { rule: potentialMultibagger, description: "Small/mid-cap quality-growth heuristic; not a return prediction." }],
  ["emerging multibagger stocks", { rule: potentialMultibagger, description: "Small/mid-cap quality-growth heuristic; not a return prediction." }],
  ["early stage growth stocks", { rule: all(cap("small"), highGrowth), description: "Small-cap plus high modeled growth." }],
  ["high volume stocks", { rule: volumeMin(5_000_000), description: "Current directory volume of at least 5 million shares." }],
  ["low volume stocks", { rule: volumeMax(250_000), description: "Current directory volume of 250,000 shares or less." }],
  ["high liquidity stocks", { rule: volumeMin(1_000_000), description: "Volume-based liquidity proxy of at least 1 million shares." }],
  ["low liquidity stocks", { rule: volumeMax(250_000), description: "Volume-based liquidity proxy of 250,000 shares or less." }],
  ["most active stocks", { rule: volumeMin(10_000_000), description: "High current share-volume screen." }],
  ["top gainers", { rule: changeMin(2), description: "Current price gain of at least 2%." }],
  ["price gainers", { rule: changeMin(0.01), description: "Positive current price change." }],
  ["top losers", { rule: changeMax(-2), description: "Current price decline of at least 2%." }],
  ["price losers", { rule: changeMax(-0.01), description: "Negative current price change." }],
  ["bullish stocks", { rule: changeMin(1), description: "Current price change of at least +1%." }],
  ["strong bullish stocks", { rule: changeMin(3), description: "Current price change of at least +3%." }],
  ["bearish stocks", { rule: changeMax(-1), description: "Current price change of at most -1%." }],
  ["strong bearish stocks", { rule: changeMax(-3), description: "Current price change of at most -3%." }],
  ["weak momentum stocks", { rule: (s) => Math.abs(s.changePct) <= 0.5, description: "Current price change within ±0.5%." }],
  ["sustainable dividend stocks", { rule: all(dividend(1), payout(15, 70), debtMax(1)), description: "Positive yield, moderate payout and controlled leverage." }],
  ["income generating stocks", { rule: income, description: "Dividend-yield and payout screen." }],
  ["passive income stocks", { rule: highDividend, description: "Higher-yield screen; not personalized income advice." }],
  ["defensive dividend stocks", { rule: all(defensive, income), description: "Defensive sectors plus dividend-income characteristics." }],
  ["high payout stocks", { rule: (s) => s.fundamentals.payoutRatio >= 60, description: "Payout ratio of at least 60%." }],
  ["low payout stocks", { rule: (s) => s.fundamentals.payoutRatio <= 30, description: "Payout ratio of 30% or less." }],
  ["high operating leverage stocks", { rule: (s) => s.fundamentals.operatingLeverage >= 2.2, description: "Operating leverage of at least 2.2." }],
  ["low operating leverage stocks", { rule: (s) => s.fundamentals.operatingLeverage <= 1.4, description: "Operating leverage of 1.4 or less." }],
  ["high financial leverage stocks", { rule: debtMin(1.2), description: "Debt-to-equity of at least 1.2." }],
  ["low financial leverage stocks", { rule: debtMax(0.5), description: "Debt-to-equity of 0.5 or less." }],
  ["debt free stocks", { rule: debtMax(0.05), description: "Debt-to-equity of 0.05 or less." }],
  ["zero debt companies", { rule: debtMax(0.05), description: "Debt-to-equity of 0.05 or less." }],
  ["low debt stocks", { rule: debtMax(0.5), description: "Debt-to-equity of 0.5 or less." }],
  ["high debt stocks", { rule: debtMin(1.2), description: "Debt-to-equity of at least 1.2." }],
  ["sustainable growth stocks", { rule: sustainableGrowth, description: "ROE × retention heuristic of at least 10%." }],
  ["high sustainable growth stocks", { rule: highSustainableGrowth, description: "ROE × retention heuristic of at least 15%." }],
  ["capital efficient stocks", { rule: all(roce(15), roa(8)), description: "ROCE at least 15% and ROA at least 8%." }],
  ["high roa stocks", { rule: roa(10), description: "ROA of at least 10%." }],
  ["high return on capital stocks", { rule: roce(15), description: "ROCE of at least 15%." }],
  ["high dividend payout stocks", { rule: (s) => s.fundamentals.payoutRatio >= 60, description: "Payout ratio of at least 60%." }],
  ["low payout growth stocks", { rule: all((s) => s.fundamentals.payoutRatio <= 40, growth(12)), description: "Lower payout plus modeled growth." }],
  ["low peg growth stocks", { rule: all(peg(1.2), growth(12)), description: "PEG up to 1.2 plus modeled growth." }],
  ["large cap stocks", { rule: cap("large"), description: "Large-cap tier." }],
  ["mid cap stocks", { rule: cap("mid"), description: "Mid-cap tier." }],
  ["small cap stocks", { rule: cap("small"), description: "Small-cap tier." }],
  ["emerging market stocks", { rule: exchange("NSE", "BSE"), description: "Indian listings in DeepScreen's supported emerging-market universe." }],
  ["developed market stocks", { rule: exchange("NYSE", "NASDAQ", "LSE"), description: "US and UK listings." }],
  ["indian stocks", { rule: exchange("NSE", "BSE"), description: "NSE and BSE listings." }],
  ["us stocks", { rule: exchange("NYSE", "NASDAQ"), description: "NYSE and Nasdaq listings." }],
  ["uk stocks", { rule: exchange("LSE"), description: "LSE listings." }],
  ["nse stocks", { rule: exchange("NSE"), description: "NSE listings." }],
  ["bse stocks", { rule: exchange("BSE"), description: "BSE listings." }],
  ["nyse stocks", { rule: exchange("NYSE"), description: "NYSE listings." }],
  ["nasdaq stocks", { rule: exchange("NASDAQ"), description: "Nasdaq listings." }],
  ["lse stocks", { rule: exchange("LSE"), description: "LSE listings." }],
  ["nifty 50 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NIFTY50"), description: "NIFTY 50 membership map." }],
  ["sensex stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "SENSEX"), description: "BSE SENSEX membership map." }],
  ["nifty next 50 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NIFTYNEXT50"), description: "NIFTY Next 50 membership map." }],
  ["nifty 100 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NIFTY100"), description: "NIFTY 100 membership map." }],
  ["nifty 200 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NIFTY200"), description: "NIFTY 200 membership map." }],
  ["nifty 500 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NIFTY500"), description: "NIFTY 500 membership map." }],
  ["s&p 500 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "SP500"), description: "S&P 500 membership map." }],
  ["nasdaq 100 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "NASDAQ100"), description: "Nasdaq 100 membership map." }],
  ["dow jones stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "DJIA"), description: "Dow Jones membership map." }],
  ["ftse 100 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "FTSE100"), description: "FTSE 100 membership map." }],
  ["ftse 250 stocks", { rule: (s) => isInIndex(s.exchange, s.symbol, "FTSE250"), description: "FTSE 250 membership map." }],
  ["index stocks", { rule: (s) => getIndexMemberships(s.exchange, s.symbol).length > 0, description: "Mapped to at least one supported index." }],
  ["technology stocks", { rule: sector("Information Technology"), description: "Information Technology sector." }],
  ["it stocks", { rule: sector("Information Technology"), description: "Information Technology sector." }],
  ["financial services stocks", { rule: sector("Financials"), description: "Financials sector." }],
  ["healthcare stocks", { rule: sector("Healthcare"), description: "Healthcare sector." }],
  ["consumer stocks", { rule: sector("Consumer Staples", "Consumer Discretionary"), description: "Consumer sectors." }],
  ["consumer discretionary stocks", { rule: sector("Consumer Discretionary"), description: "Consumer Discretionary sector." }],
  ["energy stocks", { rule: sector("Energy"), description: "Energy sector." }],
  ["utility stocks", { rule: sector("Utilities"), description: "Utilities sector." }],
  ["power stocks", { rule: sector("Utilities"), description: "Utilities sector proxy for power." }],
  ["industrial stocks", { rule: sector("Industrials"), description: "Industrials sector." }],
  ["real estate stocks", { rule: sector("Real Estate"), description: "Real Estate sector." }],
  ["global growth stocks", { rule: growthRule, description: "Growth screen across all supported exchanges." }],
  ["global dividend stocks", { rule: income, description: "Dividend-income screen across all supported exchanges." }],
  ["global value stocks", { rule: value, description: "Value screen across all supported exchanges." }],
  ["global compounders", { rule: compounder, description: "Compounder heuristic across all supported exchanges." }],
  ["high quality global stocks", { rule: quality, description: "Quality screen across all supported exchanges." }],
  ["high growth global stocks", { rule: highGrowth, description: "High-growth screen across all supported exchanges." }],
]);

const unsupportedPatterns: Array<[RegExp, string]> = [
  [/(consistent|turnaround|recovery|52 week|all time|new high|new low|oversold|overbought|uptrend|downtrend|sideways|reversal|crossover|rsi|macd|moving average|breakout|breakdown|relative strength|gap up|gap down|upper circuit|lower circuit|volatility|beta|outperform|underperform|re-rating|de-rating|fallen angel|beaten down|bottom fishing|record |highest ever|improving|declining|upgrade|downgrade|surprise|quarterly result|margin expansion|margin contraction|deleveraging|debt reduction|debt increasing|market share gain|market share loss)/i, "Needs historical price, benchmark or multi-period financial data."],
  [/(promoter|fii|dii|mutual fund|institutional|insider|retail favorite|smart money|operator|delivery|founder led|family owned|government owned|psu|private sector|mnc|conglomerate|holding company|public holding|free float|low float)/i, "Needs verified ownership/shareholding or insider data across the full universe."],
  [/(cash flow|fcf|cash rich|cash accumulation|net cash|asset light|asset heavy|capital intensive|capital intensity|capex|order book|working capital|cash conversion|receivable|inventory|asset turnover|net debt|interest coverage|accrual|accounting quality|share dilution|dilution)/i, "Needs provider-backed cash-flow, balance-sheet or capital-allocation fields across the full universe."],
  [/(special situation|event driven|restructuring|demerger|merger|acquisition target|buyback|bonus stocks|stock split|rights issue|corporate action|newly listed|ipo stocks|recently listed|post ipo|sme stocks|mainboard|high subscription ipo)/i, "Needs verified corporate-action or listing-event history."],
  [/(short interest|short squeeze|options active|f&o|futures stocks|options stocks|open interest|pcr|implied volatility|options volume|earnings options)/i, "Needs derivatives, short-interest or options-chain data."],
  [/(market leader|sector leader|industry leader|monopoly|duopoly|competitive advantage|moat|emerging leader|future leader|high potential|high conviction|hidden gem|hidden value|hidden multibagger|undiscovered|under researched|category leader|niche leader|export leaders|domestic leaders|global leader|market disruptor|innovation stocks|disruptive technology|next generation|theme based|strong management|efficient management|shareholder friendly|capital allocation|corporate governance|governance quality|long runway|scalable business|network effect|recurring revenue|subscription business|pricing power|brand power)/i, "Needs verified business-quality or competitive-position data."],
  [/(ai stocks|semiconductor|software stocks|saas|cloud stocks|cybersecurity|fintech|banking stocks|private bank|psu bank|nbfc|insurance stocks|asset management|brokerage|pharma stocks|hospital|diagnostic|biotech|fmcg|consumer durable|retail stocks|auto stocks|ev stocks|auto ancillary|tyre|battery|renewable energy|solar stocks|wind energy|green energy|oil and gas|coal stocks|metal stocks|steel stocks|aluminium|copper|gold stocks|mining|cement|infrastructure|construction|logistics|shipping|railway|defence|aerospace|telecom|media stocks|entertainment|gaming|travel|tourism|hotel|aviation|agriculture|fertilizer|chemical|textile|paper stocks|packaging|education|e-commerce|internet stocks|platform companies)/i, "Needs verified industry/theme classification beyond the broad sector field."],
  [/(export oriented|domestic consumption|rural theme|urban consumption|secular growth|structural growth|new economy|old economy|esg|green stocks|sustainable stocks|climate|export growth|import substitution|make in india|china plus one|production linked incentive|consumption theme|manufacturing stocks|capital goods|commodity|rate sensitive|interest rate|inflation|rate cut|rate hike|dollar beneficiary|rupee depreciation|rupee appreciation|export beneficiary|crude oil beneficiary|crude oil sensitive)/i, "Needs verified revenue exposure or macro-sensitivity data."],
  [/(piotroski|altman|beneish|roic|high eps|book value|earnings quality|quality earnings|asset efficient)/i, "Needs additional statement inputs not available for every directory stock."],
  [/(dividend growth|consistent dividend|regular dividend|monthly dividend|quarterly dividend|dividend aristocrat|dividend king)/i, "Needs multi-year dividend history or payment-frequency data."],
  [/(revenue growth|sales growth|ebitda growth)/i, "Needs the specific multi-period revenue/sales/EBITDA growth field; the directory only has modeled earnings growth."],
  [/(retirement|short term|medium term|swing trading|positional trading|intraday|long term investment|long term wealth|core portfolio|satellite portfolio|buy and hold|high conviction long term)/i, "Needs investor-horizon or historical-risk data; suitability is not inferred from static ratios."],
  [/(10x potential|5x potential|3x potential|future multibagger|high upside)/i, "Would imply a specific future-return forecast that the available data cannot establish."],
  [/(micro cap|nano cap|mega cap|negative debt|high risk|low risk|asset play|distressed|contrarian|recovery candidate|special opportunity|emerging champion|new age)/i, "Needs a more specific field or definition than the current directory provides."],
];

function groupFor(label: string): string {
  const l = label.toLowerCase();
  if (/(nse|bse|nyse|nasdaq|lse|nifty|sensex|s&p|dow jones|ftse|index|indian|us stocks|uk stocks|emerging market|developed market)/.test(l)) return "Markets & indices";
  if (/(technology|healthcare|consumer|energy|utility|industrial|real estate|bank|pharma|auto|metal|telecom|media|sector|theme|ai|software|green|defence|railway|chemical)/.test(l)) return "Sectors & themes";
  if (/(dividend|income|payout|passive)/.test(l)) return "Income & dividends";
  if (/(growth|multibagger|compounder|wealth|future|emerging)/.test(l)) return "Growth & compounders";
  if (/(value|pe |pb |peg|valuation|graham|garp|undervalued|overvalued|cheap|bargain|discount)/.test(l)) return "Valuation";
  if (/(roe|roce|roa|quality|margin|profit|fundamental|balance sheet|debt|leverage|capital efficient|financial health)/.test(l)) return "Quality & financial strength";
  if (/(momentum|bullish|bearish|volume|liquidity|gainer|loser|breakout|rsi|macd|crossover|trend|52 week|all time)/.test(l)) return "Momentum & trading";
  if (/(large cap|mid cap|small cap|micro cap|nano cap|mega cap|penny)/.test(l)) return "Size & price";
  if (/(promoter|fii|dii|institutional|insider|ownership|holding|float|governance)/.test(l)) return "Ownership & governance";
  if (/(ipo|buyback|split|bonus|merger|demerger|special situation|corporate action)/.test(l)) return "Corporate actions";
  if (/(risk|volatility|beta|defensive|cyclical|recession|stable)/.test(l)) return "Risk & style";
  return "Other screens";
}

function descriptorRules(label: string): Rule[] {
  const l = label.toLowerCase();
  const rules: Rule[] = [];
  if (/\bhigh roe\b/.test(l)) rules.push(roe(18));
  if (/\bhigh roce\b/.test(l)) rules.push(roce(18));
  if (/\bhigh roa\b/.test(l)) rules.push(roa(10));
  if (/\blow pe\b/.test(l) || /\blow valuation\b/.test(l)) rules.push(pe(20));
  if (/\bhigh pe\b/.test(l)) rules.push((s) => s.fundamentals.pe >= 40);
  if (/\blow pb\b/.test(l)) rules.push(pb(2));
  if (/\bhigh pb\b/.test(l)) rules.push((s) => s.fundamentals.pb >= 5);
  if (/\blow peg\b/.test(l)) rules.push(peg(1.2));
  if (/\bhigh growth\b/.test(l)) rules.push(highGrowth);
  else if (/\bgrowth\b/.test(l)) rules.push(growthRule);
  if (/\bhigh margin\b/.test(l) || /\bhigh profit\b/.test(l)) rules.push(margin(15));
  if (/\bdebt free\b/.test(l) || /\bzero debt\b/.test(l)) rules.push(debtMax(0.05));
  else if (/\blow debt\b/.test(l)) rules.push(debtMax(0.5));
  else if (/\bhigh debt\b/.test(l)) rules.push(debtMin(1.2));
  if (/\bhigh dividend yield\b/.test(l)) rules.push(highDividend);
  else if (/\bdividend\b/.test(l) || /\bincome\b/.test(l)) rules.push(income);
  if (/\bquality\b/.test(l)) rules.push(quality);
  if (/\bundervalued\b/.test(l) || /\bvalue\b/.test(l) || /\battractive valuation\b/.test(l) || /\bcheap\b/.test(l) || /\bbargain\b/.test(l) || /\bdiscounted\b/.test(l)) rules.push(value);
  if (/\bmomentum\b/.test(l)) rules.push(momentum);
  if (/\bcompounder\b/.test(l) || /\bwealth creator\b/.test(l)) rules.push(compounder);
  if (/\bdefensive\b/.test(l)) rules.push(defensive);
  if (/\bcyclical\b/.test(l)) rules.push(cyclical);
  if (/\bstable\b/.test(l)) rules.push(stable);
  if (/\bsmall cap\b/.test(l)) rules.push(cap("small"));
  if (/\bmid cap\b/.test(l)) rules.push(cap("mid"));
  if (/\blarge cap\b/.test(l)) rules.push(cap("large"));
  if (/\bfinancial health\b/.test(l)) rules.push(all(scoreMin(60), debtMax(1), roe(12), roce(12)));
  return rules;
}

function buildPreset(label: string): StockFilterPreset {
  const exact = direct.get(label.toLowerCase());
  if (exact) return { id: slugify(label), label, group: groupFor(label), status: "available", ...exact };

  const unsupported = unsupportedPatterns.find(([pattern]) => pattern.test(label));
  if (unsupported) {
    return {
      id: slugify(label),
      label,
      group: groupFor(label),
      status: "needs-data",
      description: "Listed for completeness but not classified from incomplete data.",
      missingData: unsupported[1],
    };
  }

  const rules = descriptorRules(label);
  if (rules.length) {
    return {
      id: slugify(label),
      label,
      group: groupFor(label),
      status: "available",
      description: "Combined screen using the supported descriptors in this filter name.",
      test: all(...rules),
    };
  }

  return {
    id: slugify(label),
    label,
    group: groupFor(label),
    status: "needs-data",
    description: "Listed for completeness but not classified from incomplete data.",
    missingData: "No defensible rule can be derived from the current directory fields.",
  };
}

export const STOCK_FILTER_PRESETS: StockFilterPreset[] = REQUESTED_STOCK_FILTER_LABELS.map(buildPreset);
const BY_ID = new Map(STOCK_FILTER_PRESETS.map((preset) => [preset.id, preset]));

export const findStockFilterPreset = (id: string | null | undefined) => (id ? BY_ID.get(id) : undefined);

export function stockMatchesPreset(stock: Stock, preset: StockFilterPreset | string): boolean {
  const resolved = typeof preset === "string" ? BY_ID.get(preset) : preset;
  return Boolean(resolved?.status === "available" && resolved.test?.(stock));
}

export function filterStocksByPreset(stocks: Stock[], preset: StockFilterPreset | string): Stock[] {
  const resolved = typeof preset === "string" ? BY_ID.get(preset) : preset;
  return resolved?.status === "available" && resolved.test ? stocks.filter(resolved.test) : [];
}

export function stockCategories(stock: Stock): StockFilterPreset[] {
  return STOCK_FILTER_PRESETS.filter((preset) => preset.status === "available" && preset.test?.(stock));
}
