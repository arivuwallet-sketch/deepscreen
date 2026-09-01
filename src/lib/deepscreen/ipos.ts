import { findStock } from "./stocks";

export type IpoStatus = "upcoming" | "open" | "closed" | "listed";

export interface Ipo {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  /** Price band in local currency. */
  bandLow: number;
  bandHigh: number;
  lotSize: number;
  /** Issue size in local-currency billions. */
  issueSize: number;
  openDate: string; // ISO
  closeDate: string;
  listingDate: string;
  registrar: string;
  note: string;
}

/**
 * Curated upcoming / recent issues across the five covered exchanges.
 * Dates are relative to a rolling window so the board always shows a live
 * pipeline; once `listingDate` has passed the issue is treated as listed and
 * folds into the screener automatically when the symbol exists there.
 */
const PIPELINE: Array<Omit<Ipo, "openDate" | "closeDate" | "listingDate"> & { offset: number }> = [
  {
    symbol: "TATACAP",
    name: "Tata Capital",
    exchange: "NSE",
    sector: "Financials",
    bandLow: 310,
    bandHigh: 326,
    lotSize: 46,
    issueSize: 155,
    registrar: "Link Intime",
    note: "Largest NBFC issue of the year; RBI upper-layer compliance listing.",
    offset: 3,
  },
  {
    symbol: "NSEINDIA",
    name: "National Stock Exchange of India",
    exchange: "BSE",
    sector: "Financials",
    bandLow: 1650,
    bandHigh: 1740,
    lotSize: 8,
    issueSize: 420,
    registrar: "KFin Technologies",
    note: "Offer-for-sale by legacy institutional holders; pending final approval.",
    offset: 12,
  },
  {
    symbol: "GROWWTECH",
    name: "Billionbrains Garage (Groww)",
    exchange: "NSE",
    sector: "Financials",
    bandLow: 95,
    bandHigh: 100,
    lotSize: 150,
    issueSize: 66,
    registrar: "KFin Technologies",
    note: "Discount-broking platform; fresh issue plus promoter OFS.",
    offset: -6,
  },
  {
    symbol: "IMAGIN",
    name: "Imagine Communications",
    exchange: "NASDAQ",
    sector: "Information Technology",
    bandLow: 22,
    bandHigh: 25,
    lotSize: 1,
    issueSize: 0.9,
    registrar: "Goldman Sachs (book-runner)",
    note: "Software infrastructure; targeting a mid-cap NASDAQ debut.",
    offset: 8,
  },
  {
    symbol: "MEDLINE",
    name: "Medline Industries",
    exchange: "NYSE",
    sector: "Healthcare",
    bandLow: 32,
    bandHigh: 36,
    lotSize: 1,
    issueSize: 5.2,
    registrar: "Morgan Stanley (book-runner)",
    note: "Medical supplies major; sponsor-backed exit, largest healthcare float of the cycle.",
    offset: 19,
  },
  {
    symbol: "SHEIN",
    name: "Shein Group",
    exchange: "LSE",
    sector: "Consumer Discretionary",
    bandLow: 380,
    bandHigh: 420,
    lotSize: 1,
    issueSize: 3.4,
    registrar: "JP Morgan (book-runner)",
    note: "Fast-fashion listing; FCA approval sought for a premium London segment float.",
    offset: 26,
  },
  {
    symbol: "MONZO",
    name: "Monzo Bank",
    exchange: "LSE",
    sector: "Financials",
    bandLow: 210,
    bandHigh: 235,
    lotSize: 1,
    issueSize: 1.1,
    registrar: "Numis (book-runner)",
    note: "Digital bank; first full-year profitability ahead of the float.",
    offset: 40,
  },
  {
    symbol: "CEREBRAS",
    name: "Cerebras Systems",
    exchange: "NASDAQ",
    sector: "Information Technology",
    bandLow: 46,
    bandHigh: 52,
    lotSize: 1,
    issueSize: 1.6,
    registrar: "Citigroup (book-runner)",
    note: "AI wafer-scale compute; heavily oversubscribed grey-market interest.",
    offset: -14,
  },
];

function iso(daysFromToday: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export const IPOS: Ipo[] = PIPELINE.map((p) => ({
  symbol: p.symbol,
  name: p.name,
  exchange: p.exchange,
  sector: p.sector,
  bandLow: p.bandLow,
  bandHigh: p.bandHigh,
  lotSize: p.lotSize,
  issueSize: p.issueSize,
  registrar: p.registrar,
  note: p.note,
  openDate: iso(p.offset),
  closeDate: iso(p.offset + 2),
  listingDate: iso(p.offset + 7),
})).sort((a, b) => a.openDate.localeCompare(b.openDate));

export function daysAway(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${isoDate}T00:00:00Z`).getTime() - today.getTime()) / 86400000);
}

export function ipoStatus(ipo: Ipo): IpoStatus {
  if (daysAway(ipo.listingDate) <= 0) return "listed";
  if (daysAway(ipo.closeDate) < 0) return "closed";
  if (daysAway(ipo.openDate) <= 0) return "open";
  return "upcoming";
}

/** True when the listed issue already exists in the screener universe. */
export function isTradable(ipo: Ipo): boolean {
  return ipoStatus(ipo) === "listed" && Boolean(findStock(ipo.exchange, ipo.symbol));
}
