export type CapTier = "large" | "mid" | "small";

export interface Exchange {
  code: string;
  name: string;
  country: string;
  currency: string;
  symbol: string;
  timezone: string;
  flag: string;
  region: "India" | "United States" | "United Kingdom";
}

export interface Fundamentals {
  pe: number;
  peg: number;
  ps: number;
  pb: number;
  evRevenue: number;
  evEbitda: number;
  roe: number;
  roa: number;
  roce: number;
  debtToEquity: number;
  longTermDebtToEquity: number;
  dividendYield: number;
  payoutRatio: number;
  operatingLeverage: number;
  growth: number;
  netMargin: number;
  ebitdaMargin: number;
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  cap: CapTier;
  marketCap: number;
  price: number;
  changePct: number;
  volume: number;
  epsTtm: number;
  revenue: number;
  fundamentals: Fundamentals;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  minutesAgo: number;
  impact: "high" | "medium" | "low";
  sentiment: "bullish" | "bearish" | "neutral";
  scope: string;
}

export interface CalendarEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  currency: string;
  title: string;
  impact: "high" | "medium" | "low";
  actual: string;
  forecast: string;
  previous: string;
  dayOffset: number;
}
