import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getLiveQuote, getLiveQuotes } from "@/lib/market/market.functions";

export interface QuoteKey {
  exchange: string;
  symbol: string;
}

export const quoteKey = (k: QuoteKey) => `${k.exchange}:${k.symbol}`;

/** Batch live quotes for a list of rows. Refreshes every 15s. */
export function useLiveQuotes(keys: QuoteKey[]) {
  const fetchQuotes = useServerFn(getLiveQuotes);
  const slice = keys.slice(0, 40);
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
