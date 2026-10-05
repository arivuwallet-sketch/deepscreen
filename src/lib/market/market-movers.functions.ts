import { createServerFn } from "@tanstack/react-start";

import type { LiveMarketMoversSnapshot } from "./market-movers.server";

export const getLiveMarketMovers = createServerFn({ method: "POST" })
  .inputValidator((data: { exchanges: string[] }) => data)
  .handler(async ({ data }): Promise<LiveMarketMoversSnapshot> => {
    const { fetchLiveMarketMovers } = await import("./market-movers.server");
    return fetchLiveMarketMovers(data.exchanges);
  });
