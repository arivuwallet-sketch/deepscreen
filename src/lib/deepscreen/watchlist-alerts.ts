import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import type { Stock } from "@/lib/deepscreen/types";
import type { Analysis } from "@/lib/deepscreen/metrics";

export interface AlertSnapshot {
  quarter: string;
  observedAt: number;
  pe: number | null;
  roce: number | null;
  totalDebt: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  freeCashflow: number | null;
  promoterPledgePct: number | null;
}

export interface WatchlistAlert {
  id: string;
  symbol: string;
  name: string;
  title: string;
  detail: string;
  tone: "attention" | "context" | "positive";
  available: boolean;
}

const PREFIX = "deepscreen:watchlist-alerts:v1:";
const QUARTERS = 20;

export function quarterKey(date = new Date()): string {
  return date.getFullYear() + "-Q" + (Math.floor(date.getMonth() / 3) + 1);
}

export function alertStorageKey(exchange: string, symbol: string): string {
  return PREFIX + exchange.toLowerCase() + ":" + symbol.toLowerCase();
}

export function readAlertHistory(exchange: string, symbol: string): AlertSnapshot[] {
  try {
    const raw = window.localStorage.getItem(alertStorageKey(exchange, symbol));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AlertSnapshot[];
    return Array.isArray(parsed) ? parsed.filter((row) => row && typeof row.quarter === "string") : [];
  } catch {
    return [];
  }
}

export function saveAlertSnapshot(exchange: string, symbol: string, snapshot: AlertSnapshot): AlertSnapshot[] {
  const history = readAlertHistory(exchange, symbol);
  const next = [...history.filter((row) => row.quarter !== snapshot.quarter), snapshot].slice(-QUARTERS);
  try {
    window.localStorage.setItem(alertStorageKey(exchange, symbol), JSON.stringify(next));
  } catch {
    // Continue without local persistence when browser storage is unavailable.
  }
  return next;
}

export function snapshotFrom(
  stock: Stock,
  analysis: Analysis,
  fundamentals?: LiveFundamentals | null,
  now = Date.now(),
): AlertSnapshot {
  return {
    quarter: quarterKey(new Date(now)),
    observedAt: now,
    pe: stock.fundamentals.pe ?? analysis.metrics.find((m) => m.key === "pe")?.value ?? null,
    roce: stock.fundamentals.roce ?? analysis.metrics.find((m) => m.key === "roce")?.value ?? null,
    totalDebt: fundamentals?.totalDebt ?? null,
    revenueGrowth: fundamentals?.revenueGrowth ?? null,
    earningsGrowth: fundamentals?.earningsGrowth ?? null,
    freeCashflow: fundamentals?.freeCashflow ?? null,
    // Screener.in does expose Pledged % in its screening universe, but the
    // current DeepScreen company feed does not yet provide it per symbol.
    promoterPledgePct: null,
  };
}

function pct(value: number | null): string {
  return value == null ? "—" : value.toFixed(1) + "%";
}

function debtValue(value: number | null): string {
  return value == null ? "—" : value.toLocaleString("en-US");
}

function changePct(now: number | null, then: number | null): number | null {
  if (now == null || then == null || then === 0) return null;
  return ((now - then) / Math.abs(then)) * 100;
}

function median(values: number[]): number | null {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 === 0
    ? (clean[middle - 1]! + clean[middle]!) / 2
    : clean[middle]!;
}

export function buildWatchlistAlerts(
  rows: Array<{
    stock: Stock;
    analysis: Analysis;
    fundamentals?: LiveFundamentals | null;
  }>,
  now = Date.now(),
): WatchlistAlert[] {
  const alerts: WatchlistAlert[] = [];

  for (const row of rows) {
    const { stock, analysis, fundamentals } = row;
    const history = readAlertHistory(stock.exchange, stock.symbol);
    const current = snapshotFrom(stock, analysis, fundamentals, now);
    const previous = history.filter((item) => item.quarter !== current.quarter).at(-1);

    // Store one baseline per quarter. Alerts are generated only when a new
    // quarterly observation appears, so a page refresh does not spam users.
    const sameQuarter = history.find((item) => item.quarter === current.quarter);
    if (!sameQuarter) {
      saveAlertSnapshot(stock.exchange, stock.symbol, current);
    }

    const isNewQuarter = !sameQuarter;
    const base = current;
    const comparison = isNewQuarter ? (previous ?? null) : null;

    if (comparison) {
      if (base.roce != null && base.roce < 15 && (comparison.roce == null || comparison.roce >= 15)) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":roce",
          symbol: stock.symbol,
          name: stock.name,
          title: "ROCE fell below 15%",
          detail: "ROCE moved from " + pct(comparison.roce) + " to " + pct(base.roce) + " versus the previous quarterly snapshot.",
          tone: "attention",
          available: true,
        });
      }

      const debtChange = changePct(base.totalDebt, comparison.totalDebt);
      if (debtChange != null && debtChange >= 32) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":debt",
          symbol: stock.symbol,
          name: stock.name,
          title: "Debt increased " + Math.round(debtChange) + "%",
          detail: "Reported total debt moved from " + debtValue(comparison.totalDebt) + " to " + debtValue(base.totalDebt) + " in the latest quarterly snapshot.",
          tone: "attention",
          available: true,
        });
      }

      const growthNow = base.revenueGrowth;
      const growthThen = comparison.revenueGrowth;
      const earningsNow = base.earningsGrowth;
      const earningsThen = comparison.earningsGrowth;
      if (
        (growthNow != null && growthThen != null && growthNow > growthThen) ||
        (earningsNow != null && earningsThen != null && earningsNow > earningsThen)
      ) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":growth",
          symbol: stock.symbol,
          name: stock.name,
          title: "Revenue or earnings growth accelerated",
          detail:
            "Revenue growth changed from " + pct(growthThen) + " to " + pct(growthNow) +
            (earningsNow != null && earningsThen != null
              ? "; earnings growth moved from " + pct(earningsThen) + " to " + pct(earningsNow) + "."
              : "."),
          tone: "positive",
          available: true,
        });
      }

      if (
        base.freeCashflow != null &&
        base.freeCashflow < 0 &&
        (comparison.freeCashflow == null || comparison.freeCashflow >= 0)
      ) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":fcf",
          symbol: stock.symbol,
          name: stock.name,
          title: "Free cash flow turned negative",
          detail: "Free cash flow moved from " + String(comparison.freeCashflow ?? "unavailable") + " to " + String(base.freeCashflow) + ".",
          tone: "attention",
          available: true,
        });
      }

      const pledgeChange = changePct(base.promoterPledgePct, comparison.promoterPledgePct);
      if (pledgeChange != null && pledgeChange > 0) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":pledge",
          symbol: stock.symbol,
          name: stock.name,
          title: "Promoter pledge increased",
          detail: "Promoter pledged shares increased from " + pct(comparison.promoterPledgePct) + " to " + pct(base.promoterPledgePct) + ".",
          tone: "attention",
          available: true,
        });
      }
    }

    // 5-year P/E median uses 20 quarterly observations gathered by
    // DeepScreen on this device. No paid historical market-data series is used.
    const peHistory = [...history, current]
      .map((item) => item.pe)
      .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
    if (isNewQuarter && peHistory.length >= QUARTERS && current.pe != null) {
      const peMedian = median(peHistory);
      if (peMedian != null && current.pe > peMedian) {
        alerts.push({
          id: stock.exchange + ":" + stock.symbol + ":pe5y",
          symbol: stock.symbol,
          name: stock.name,
          title: "P/E exceeded 5-year median",
          detail: "Current P/E is " + current.pe.toFixed(1) + "x versus a DeepScreen-observed 5-year quarterly median of " + peMedian.toFixed(1) + "x.",
          tone: "context",
          available: true,
        });
      }
    }
  }

  return alerts;
}

