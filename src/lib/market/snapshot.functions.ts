import { createServerFn } from "@tanstack/react-start";

import type { LiveFundamentals, LiveQuote } from "./yahoo.server";
import type { ScreenerRatios } from "./screener.server";

export interface StockSnapshot {
  quote: LiveQuote | null;
  fundamentals: LiveFundamentals | null;
  screener: ScreenerRatios | null;
  /** epoch ms the snapshot was computed */
  fetchedAt: number;
  /** true when upstream failed and a stale/empty snapshot is being served */
  degraded: boolean;
}

/**
 * Server-side snapshot cache so the very first HTML response (what crawlers
 * read) already carries real prices, ratios, score and verdict instead of
 * "Fetching…" placeholders. Revalidated every 3 minutes; stale data is served
 * rather than nothing if an upstream provider is down.
 */
const TTL_MS = 3 * 60_000;
const MAX_ENTRIES = 500;
const snapshots = new Map<string, StockSnapshot>();

const EMPTY: Omit<StockSnapshot, "fetchedAt"> = {
  quote: null,
  fundamentals: null,
  screener: null,
  degraded: true,
};

function remember(key: string, snap: StockSnapshot) {
  if (snapshots.size >= MAX_ENTRIES) {
    const oldest = snapshots.keys().next().value;
    if (oldest) snapshots.delete(oldest);
  }
  snapshots.set(key, snap);
}

async function compute(exchange: string, symbol: string, name?: string): Promise<StockSnapshot> {
  const { fetchChartQuote, fetchFundamentals, yahooSymbol } = await import("./yahoo.server");
  const y = yahooSymbol(exchange, symbol);
  const indian = exchange === "NSE" || exchange === "BSE";

  const [quote, fundamentals, screener] = await Promise.all([
    fetchChartQuote(y).catch((e: unknown) => {
      console.error(`[snapshot] quote failed ${exchange}:${symbol}`, e);
      return null;
    }),
    fetchFundamentals(y).catch((e: unknown) => {
      console.error(`[snapshot] fundamentals failed ${exchange}:${symbol}`, e);
      return null;
    }),
    indian
      ? import("./screener.server")
          .then((m) => m.fetchScreenerRatios(symbol, name, null))
          .catch((e: unknown) => {
            console.error(`[snapshot] screener failed ${exchange}:${symbol}`, e);
            return null;
          })
      : Promise.resolve(null),
  ]);

  return {
    quote,
    fundamentals,
    screener,
    fetchedAt: Date.now(),
    degraded: !quote && !fundamentals && !screener,
  };
}

export const getStockSnapshot = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string; name?: string }) => d)
  .handler(async ({ data }): Promise<StockSnapshot> => {
    const key = `${data.exchange}:${data.symbol}`;
    const cached = snapshots.get(key);
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached;

    try {
      const fresh = await compute(data.exchange, data.symbol, data.name);
      // Never overwrite a good snapshot with an empty one.
      if (fresh.degraded && cached) {
        console.warn(`[snapshot] serving stale snapshot for ${key}`);
        return { ...cached, degraded: true };
      }
      remember(key, fresh);
      return fresh;
    } catch (error) {
      console.error(`[snapshot] unexpected failure for ${key}`, error);
      if (cached) return { ...cached, degraded: true };
      return { ...EMPTY, fetchedAt: Date.now() };
    }
  });
