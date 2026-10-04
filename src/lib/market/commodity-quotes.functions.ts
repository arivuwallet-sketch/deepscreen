import { createServerFn } from "@tanstack/react-start";
export type { CommodityQuote, CommoditySnapshot } from "./commodity-analysis";

export const getCommodityQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchCommoditySnapshot } = await import("./commodity-feed.server");
  return fetchCommoditySnapshot();
});
