import { INVESTMENT_LISTINGS } from "./investment-listings";

export type InvestmentType = "FUND" | "ETF" | "REIT";
export interface Investment {
  market: string;
  type: InvestmentType;
  code: string;
  name: string;
  nav: number | null;
  date: string;
}

export const INVESTMENTS: Investment[] = INVESTMENT_LISTINGS.map(([market, type, code, name, nav, date]) => ({
  market, type: type as InvestmentType, code, name, nav: nav ? Number(nav) : null, date,
}));
const BY_KEY = new Map(INVESTMENTS.map((item) => [`${item.market}:${item.type}:${item.code}`, item]));

export function findInvestment(market: string, type: string, code: string): Investment | undefined {
  return BY_KEY.get(`${market.toUpperCase()}:${type.toUpperCase()}:${code.toUpperCase()}`);
}

export function searchInvestments(query: string, limit = 5): Investment[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const exact: Investment[] = [], starts: Investment[] = [], contains: Investment[] = [];
  for (const item of INVESTMENTS) {
    const code = item.code.toLowerCase(), name = item.name.toLowerCase();
    if (code === q) exact.push(item);
    else if (code.startsWith(q) || name.startsWith(q)) starts.push(item);
    else if (name.includes(q)) contains.push(item);
  }
  return [...exact, ...starts, ...contains].slice(0, limit);
}
