import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getLiveMarketMovers } from "@/lib/market/market-movers.functions";

export function useMarketMovers(exchanges: string[]) {
  const fetchMovers = useServerFn(getLiveMarketMovers);
  const normalized = Array.from(
    new Set(exchanges.map((exchange) => exchange.trim().toUpperCase()).filter(Boolean)),
  ).sort();
  const key = normalized.join(",");

  return useQuery({
    queryKey: ["live-market-movers", key],
    queryFn: () => fetchMovers({ data: { exchanges: normalized } }),
    enabled: normalized.length > 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}
