export type IpoStatus = "upcoming" | "open" | "closed" | "listed";

export interface Ipo {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  bandLow: number;
  bandHigh: number;
  lotSize: number;
  issueSize: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
  registrar: string;
  note: string;
}

/**
 * Live IPO data is sourced by src/lib/market/ipo.server.ts.
 *
 * This module intentionally contains no hand-maintained IPO records. That
 * prevents stale or fabricated dates, prices and issue sizes from appearing
 * after the exchange feeds change.
 */
export const IPOS: Ipo[] = [];

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
  return ipoStatus(ipo) === "listed";
}
