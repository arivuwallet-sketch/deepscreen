import { createServerFn } from "@tanstack/react-start";
import type { InvestmentType } from "@/lib/deepscreen/investments";

export const getInvestmentAnalysis = createServerFn({ method: "GET" })
  .inputValidator((data: { market: string; type: InvestmentType; code: string; name: string }) => data)
  .handler(async ({ data }) => {
    const { fetchEnhancedInvestmentAnalysis } = await import("./investment-analysis.enriched.server");
    return fetchEnhancedInvestmentAnalysis(data);
  });
