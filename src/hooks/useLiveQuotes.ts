import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  getAaaBondYield,
  getLiveFundamentals,
  getLiveFundamentalsBatch,
  getLiveQuote,
  getLiveQuotes,
  getScreenerRatios,
} from "@/lib/market/market.functions";

export interface QuoteKey {
  exchange: string;
  symbol: string;
}

export const quoteKey = (k: QuoteKey) => `${k.exchange}:${k.symbol}`;

// The chart-quote endpoint is unauthenticated and cheap, so a screener page can
// keep prices live for a decently large visible slice.
const QUOTE_BATCH_LIMIT = 60;
// quoteSummary (fundamentals) needs a shared session/crumb and is heavier, so
// keep that batch smaller to stay gentle on Yahoo's free endpoint.
const FUNDAMENTALS_BATCH_LIMIT = 30;

/** Batch live quotes for a list of rows. Refreshes every 15s. */
export function useLiveQuotes(keys: QuoteKey[]) {
  const fetchQuotes = useServerFn(getLiveQuotes);
  const slice = keys.slice(0, QUOTE_BATCH_LIMIT);
  const idKey = slice.map(quoteKey).join(",");

  return useQuery({
    queryKey: ["live-quotes", idKey],
    queryFn: () => fetchQuotes({ data: { keys: slice } }),
    enabled: slice.length > 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

/** Single live quote, refreshed every 10s. */
export function useLiveQuote(exchange: string, symbol: string) {
  const fetchQuote = useServerFn(getLiveQuote);
  return useQuery({
    queryKey: ["live-quote", exchange, symbol],
    queryFn: () => fetchQuote({ data: { exchange, symbol } }),
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

/** Batch live fundamentals (P/E, PEG, ROE, margins, etc.) for visible rows. */
export function useLiveFundamentalsBatch(keys: QuoteKey[]) {
  const fetchBatch = useServerFn(getLiveFundamentalsBatch);
  const slice = keys.slice(0, FUNDAMENTALS_BATCH_LIMIT);
  const idKey = slice.map(quoteKey).join(",");

  return useQuery({
    queryKey: ["live-fundamentals-batch", idKey],
    queryFn: () => fetchBatch({ data: { keys: slice } }),
    enabled: slice.length > 0,
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

/** Single-stock live fundamentals, refreshed every 30s. */
export function useLiveFundamentals(exchange: string, symbol: string) {
  const fetchFundamentals = useServerFn(getLiveFundamentals);
  return useQuery({
    queryKey: ["live-fundamentals", exchange, symbol],
    queryFn: () => fetchFundamentals({ data: { exchange, symbol } }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
}

/** Live AAA corporate bond yield for the Graham Formula's "Y" — changes slowly, so this rarely needs to refetch. */
export function useAaaYield() {
  const fetchYield = useServerFn(getAaaBondYield);
  return useQuery({
    queryKey: ["aaa-bond-yield"],
    queryFn: () => fetchYield(),
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Screener.in ratios for NSE/BSE stocks — scoped to the stock detail page
 * only (never batched across a table) to keep request volume against their
 * site low. Long stale time since these barely move intraday.
 */
export function useScreenerRatios(exchange: string, symbol: string) {
  const fetchRatios = useServerFn(getScreenerRatios);
  return useQuery({
    queryKey: ["screener-ratios", exchange, symbol],
    queryFn: () => fetchRatios({ data: { exchange, symbol } }),
    enabled: exchange === "NSE" || exchange === "BSE",
    staleTime: 20 * 60_000,
  });
}
