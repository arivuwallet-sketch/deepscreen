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
  const code = clean(exchange, 12).toUpperCase();
  if (code === "NSE" || code === "BSE") return "NSE/BSE";
  if (code === "NYSE" || code === "NASDAQ") return "NYSE/Nasdaq";
  if (code === "LSE") return "LSE";
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
      { category: "EARNINGS", query: `${company} earnings results guidance revenue profit`, affectedMarkets: [market] },
      { category: "ANALYSTS", query: `${company} analyst upgrade downgrade target rating`, affectedMarkets: [market] },
      { category: "CORPORATE", query: `${company} acquisition merger regulation lawsuit product contract order`, affectedMarkets: [market] },
      { category: "MANAGEMENT", query: `${company} CEO management board investor announcement`, affectedMarkets: [market] },
    ];
  }

  if (input.mode === "commodities") {
    return [
      { category: "GOLD", query: "gold bullion futures central banks dollar yields", affectedMarkets: ["Commodities"] },
      { category: "SILVER", query: "silver futures industrial demand precious metals", affectedMarkets: ["Commodities"] },
      { category: "OIL", query: "crude oil Brent WTI OPEC supply demand", affectedMarkets: ["Commodities"] },
      { category: "NAT GAS", query: "natural gas LNG Henry Hub supply demand", affectedMarkets: ["Commodities"] },
      { category: "COPPER", query: "copper futures China demand mining supply", affectedMarkets: ["Commodities"] },
      { category: "COMMODITY MACRO", query: "commodities dollar inflation interest rates geopolitics", affectedMarkets: ["Commodities", "FX", "Bonds"] },
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
      { category: "MF FLOWS", query: "India mutual fund inflows outflows SIP AMFI", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF RULES", query: "SEBI mutual fund regulation expense ratio fund rules", affectedMarkets: ["Mutual Funds", "NSE/BSE"] },
      { category: "MF MARKET", query: "mutual funds equity debt funds markets India", affectedMarkets: ["Mutual Funds", "NSE/BSE", "Bonds"] },
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
      { category: "ETF FLOWS", query: "ETF inflows outflows exchange traded funds markets", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF INDEX", query: "ETF index rebalancing passive funds markets", affectedMarkets: ["ETFs", "Global Equities"] },
      { category: "ETF RULES", query: "ETF regulation fees liquidity tracking error", affectedMarkets: ["ETFs", "Global Equities"] },
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
      { category: "REIT MARKET", query: "REIT real estate investment trust market rates", affectedMarkets: ["REITs", "Bonds"] },
      { category: "REAL ESTATE", query: "commercial real estate office retail property leasing REIT", affectedMarkets: ["REITs"] },
      { category: "REIT RATES", query: "REIT interest rates bond yields distributions", affectedMarkets: ["REITs", "Bonds"] },
    );
    return topics;
  }

  return base ? [{ category: "market", query: base }] : [];
}
