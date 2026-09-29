import { createServerFn } from "@tanstack/react-start";
import { createSnapshotLoader } from "./snapshot-cache";
export type { StockSnapshot } from "./snapshot-cache";

// Bound the whole SSR data load, including sequential provider fallbacks.
// Client hooks retain their normal refresh/retry behaviour after hydration.
const loadSnapshot = createSnapshotLoader({
  quote: async (key, signal) => {
    const { fetchChartQuote, yahooSymbol } = await import("./yahoo.server");
    return fetchChartQuote(yahooSymbol(key.exchange, key.symbol), signal);
  },
  fundamentals: async (key, signal) => {
    const { fetchFundamentals, yahooSymbol } = await import("./yahoo.server");
    return fetchFundamentals(yahooSymbol(key.exchange, key.symbol), signal);
  },
  screener: async (key, signal) => {
    const { fetchScreenerRatios } = await import("./screener.server");
    return fetchScreenerRatios(key.symbol, key.name, null, signal);
  },
});

export const getStockSnapshot = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string; name?: string }) => d)
  .handler(({ data }) => loadSnapshot(data));
