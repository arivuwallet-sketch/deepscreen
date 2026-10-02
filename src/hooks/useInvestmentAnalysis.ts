import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { Investment } from "@/lib/deepscreen/investments";
import type { EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";
import { getInvestmentAnalysis } from "@/lib/market/investment-analysis.functions";

export function useInvestmentAnalysis(item: Investment, initialData?: EnhancedInvestmentAnalysisData) {
  const fetchAnalysis = useServerFn(getInvestmentAnalysis);
  return useQuery({
    queryKey: ["investment-analysis", item.market, item.type, item.code],
    queryFn: () =>
      fetchAnalysis({
        data: {
          market: item.market,
          type: item.type,
          code: item.code,
          name: item.name,
        },
      }),
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    initialData,
  });
}
