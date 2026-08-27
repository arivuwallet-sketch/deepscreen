import type { Stock } from "./types";

export type CorporateEventKind = "earnings" | "dividend";

export interface CorporateEvent {
  id: string;
  kind: CorporateEventKind;
  symbol: string;
  exchange: string;
  name: string;
  date: string; // ISO yyyy-mm-dd
  daysAway: number;
  /** earnings */
  quarter?: string;
  estimatedEps?: number;
  priorEps?: number;
  /** dividend */
  exDate?: string;
  recordDate?: string;
  payDate?: string;
  amountPerShare?: number;
  yieldPct?: number;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso}T00:00:00Z`).getTime() - today.getTime()) / 86400000);
}

/** Deterministic upcoming earnings + dividend schedule for a stock. */
export function stockEvents(stock: Stock): CorporateEvent[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const h = hash(`${stock.exchange}:${stock.symbol}`);
  const f = stock.fundamentals;
  const out: CorporateEvent[] = [];

  // Earnings: next report inside the coming quarter.
  const earningsIn = (h % 84) + 1;
  const earningsDate = addDays(base, earningsIn);
  const quarterNo = (new Date(earningsDate).getMonth() % 12) / 3;
  const priorEps = Number((stock.epsTtm / 4).toFixed(2));
  out.push({
    id: `${stock.exchange}-${stock.symbol}-earn`,
    kind: "earnings",
    symbol: stock.symbol,
    exchange: stock.exchange,
    name: stock.name,
    date: earningsDate,
    daysAway: daysBetween(earningsDate),
    quarter: `Q${Math.floor(quarterNo) + 1} FY${new Date(earningsDate).getFullYear()}`,
    priorEps,
    estimatedEps: Number((priorEps * (1 + f.growth / 100 / 4)).toFixed(2)),
  });

  // Dividend: only for payers.
  if (f.dividendYield > 0.05 && f.payoutRatio > 1) {
    const exIn = ((h >> 5) % 120) + 3;
    const exDate = addDays(base, exIn);
    const annualDividend = (stock.price * f.dividendYield) / 100;
    const perPayment = Number((annualDividend / 2).toFixed(2));
    out.push({
      id: `${stock.exchange}-${stock.symbol}-div`,
      kind: "dividend",
      symbol: stock.symbol,
      exchange: stock.exchange,
      name: stock.name,
      date: exDate,
      daysAway: daysBetween(exDate),
      exDate,
      recordDate: addDays(base, exIn + 2),
      payDate: addDays(base, exIn + 21),
      amountPerShare: perPayment,
      yieldPct: f.dividendYield,
    });
  }

  return out;
}

export function eventsFor(stocks: Stock[]): CorporateEvent[] {
  return stocks.flatMap(stockEvents).sort((a, b) => a.daysAway - b.daysAway);
}
