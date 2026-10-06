export type NewsFeedMode =
  | "generic"
  | "company"
  | "commodities"
  | "etf"
  | "mutual-fund"
  | "reit";

export interface ScopedNewsTopic {
  category: string;
  query: string;
  affectedMarkets?: string[];
}

function clean(value: string | undefined, max = 120): string {
  return (value ?? "").replace(/["\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function exchangeMarket(exchange: string | undefined): string {
  const code = clean(exchange, 20).toUpperCase();
  if (["NSE", "BSE", "IN", "INDIA"].includes(code)) return "NSE/BSE";
  if (["NYSE", "NASDAQ", "US", "USA", "UNITED STATES"].includes(code)) return "NYSE/Nasdaq";
  if (["LSE", "UK", "GB", "UNITED KINGDOM"].includes(code)) return "LSE";
  return "Global Equities";
}

function productTerm(name?: string, code?: string): string {
  const n = clean(name);
  const c = clean(code, 40);
  if (n && c) return `"${n}" OR "${c}"`;
  if (n) return `"${n}"`;
  return c;
}

function cleanQuery(value: string | undefined, max = 220): string {
  return (value ?? "").replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function buildScopedNewsTopics(input: {
  mode: NewsFeedMode;
  query?: string;
  entityName?: string;
  entityCode?: string;
  exchange?: string;
  market?: string;
}): ScopedNewsTopic[] {
  const entity = productTerm(input.entityName, input.entityCode);
  const base = cleanQuery(input.query, 220);
  const market = exchangeMarket(input.exchange || input.market);

  if (input.mode === "company") {
    const company = base || entity;
    if (!company) return [];
    return [
      { category: "COMPANY", query: company, affectedMarkets: [market] },
      { category: "EARNINGS", query: `${company} earnings results guidance revenue profit margin`, affectedMarkets: [market] },
      { category: "FILINGS", query: `${company} filing exchange announcement disclosure SEC SEBI regulatory filing`, affectedMarkets: [market] },
      { category: "ANALYSTS", query: `${company} analyst upgrade downgrade target rating estimates`, affectedMarkets: [market] },
      { category: "CORPORATE", query: `${company} acquisition merger regulation lawsuit product contract order deal`, affectedMarkets: [market] },
      { category: "CAPITAL", query: `${company} dividend buyback share split bonus issue capital raise debt`, affectedMarkets: [market] },
      { category: "MANAGEMENT", query: `${company} CEO management board investor announcement leadership`, affectedMarkets: [market] },
      { category: "INDUSTRY", query: `${company} industry sector demand supply competition market`, affectedMarkets: [market] },
    ];
  }

  if (input.mode === "commodities") {
    return [
      { category: "GOLD", query: "gold bullion futures central banks dollar real yields ETF demand", affectedMarkets: ["Commodities"] },
      { category: "SILVER", query: "silver futures industrial demand precious metals solar supply", affectedMarkets: ["Commodities"] },
      { category: "OIL", query: "crude oil Brent WTI OPEC OPEC+ supply demand inventories", affectedMarkets: ["Commodities"] },
      { category: "NAT GAS", query: "natural gas LNG Henry Hub storage weather production demand", affectedMarkets: ["Commodities"] },
      { category: "COPPER", query: "copper futures China demand mining supply inventories smelters", affectedMarkets: ["Commodities"] },
      { category: "PRECIOUS", query: "precious metals gold silver platinum palladium markets", affectedMarkets: ["Commodities"] },
      { category: "ENERGY", query: "energy markets oil gas OPEC LNG refinery geopolitics", affectedMarkets: ["Commodities", "Global Equities"] },
      { category: "METALS", query: "industrial metals copper aluminum iron ore mining China demand", affectedMarkets: ["Commodities", "Asia"] },
      { category: "COMMODITY MACRO", query: "commodities dollar inflation interest rates geopolitics tariffs shipping", affectedMarkets: ["Commodities", "FX", "Bonds"] },
    ];
  }

  if (input.mode === "mutual-fund") {
    const topics: ScopedNewsTopic[] = [];
    if (entity) {
      topics.push(
        { category: "FUND", query: `${entity} mutual fund NAV portfolio holdings`, affectedMarkets: ["Mutual Funds", market] },
        { category: "FUND UPDATE", query: `${entity} fund manager scheme portfolio update`, affectedMarkets: ["Mutual Funds", market] },
      );
    }
    topics.push(
      { category: "MF FLOWS", query: "India mutual fund inflows outflows SIP AMFI AUM redemptions", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF NFO", query: "mutual fund NFO new fund offer launch India AMFI", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF RULES", query: "SEBI mutual fund regulation expense ratio fund rules disclosure", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF MANAGERS", query: "mutual fund manager portfolio change fund house India", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF MARKET", query: "mutual funds equity debt hybrid funds markets India yields", affectedMarkets: ["Mutual Funds", "NSE/BSE", "Bonds"] },
    );
    return topics;
  }

  if (input.mode === "etf") {
    const topics: ScopedNewsTopic[] = [];
    if (entity) {
      topics.push(
        { category: "ETF", query: `${entity} ETF holdings flows index`, affectedMarkets: ["ETFs", market] },
        { category: "ETF UPDATE", query: `${entity} ETF rebalance tracking expense`, affectedMarkets: ["ETFs", market] },
      );
    }
    topics.push(
      { category: "ETF FLOWS", query: "ETF inflows outflows exchange traded funds markets AUM", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF LAUNCH", query: "new ETF launch approval listing exchange traded fund", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF INDEX", query: "ETF index rebalancing passive funds index changes markets", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF THEMES", query: "sector thematic ETF technology AI gold bond energy flows", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF RULES", query: "ETF regulation fees liquidity tracking error spread premium discount", affectedMarkets: ["ETFs", "Global Equities"] },
    );
    return topics;
  }

  if (input.mode === "reit") {
    const topics: ScopedNewsTopic[] = [];
    if (entity) {
      topics.push(
        { category: "REIT", query: `${entity} REIT distribution occupancy leasing`, affectedMarkets: ["REITs", market] },
        { category: "REIT UPDATE", query: `${entity} REIT acquisition debt refinancing portfolio`, affectedMarkets: ["REITs", market] },
      );
    }
    topics.push(
      { category: "REIT MARKET", query: "REIT real estate investment trust market rates valuations", affectedMarkets: ["REITs", "Bonds"] },
      { category: "REIT DISTRIBUTION", query: "REIT distribution dividend payout AFFO NDCF", affectedMarkets: ["REITs"] },
      { category: "REAL ESTATE", query: "commercial real estate office retail data center logistics leasing REIT", affectedMarkets: ["REITs"] },
      { category: "REIT CAPITAL", query: "REIT acquisition sale refinancing debt maturity capital raise", affectedMarkets: ["REITs", "Bonds"] },
      { category: "REIT RATES", query: "REIT interest rates bond yields central bank distributions", affectedMarkets: ["REITs", "Bonds"] },
    );
    return topics;
  }

  return base ? [{ category: "market", query: base }] : [];
}
