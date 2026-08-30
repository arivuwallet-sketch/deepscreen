import { useQuery } from "@tanstack/react-query";

import { fetchCandles, fetchTickers, type Interval } from "@/lib/crypto/binance";

/** Binance's public data mirror is CORS-open and needs no key, so these call it directly from the browser. */
export function useCryptoTickers() {
  return useQuery({
    queryKey: ["crypto-tickers"],
    queryFn: fetchTickers,
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
}

export function useCryptoCandles(symbol: string, interval: Interval) {
  return useQuery({
    queryKey: ["crypto-candles", symbol, interval],
    queryFn: () => fetchCandles(symbol, interval, 300),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
