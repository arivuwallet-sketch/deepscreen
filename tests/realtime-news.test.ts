import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("market-moving news is constrained to genuinely recent publication times", async () => {
  const screener = await source("../src/routes/screener.tsx");
  const market = await source("../src/lib/market/market.functions.ts");
  const feed = await source("../src/components/ds/LiveNewsFeed.tsx");

  assert.ok(screener.includes('<LiveNewsFeed query="stock market" title="Market-moving news" limit={12} maxAgeHours={24} />'));
  assert.ok(market.includes('inputValidator((d: { query: string; limit?: number; maxAgeHours?: number }) => d)'));
  assert.ok(market.includes("const key = newsKey(data.query, maxAgeHours)"));
  assert.ok(market.includes("maxAgeHours <= 24"));
  assert.ok(market.includes('"1d"'));
  assert.ok(market.includes("filterRecentNews(allItems, maxAgeHours).sort("));
  assert.ok(market.includes("const exactRecent = filterRecentNews(exactItems, maxAgeHours)"));
  assert.ok(market.includes("const NEWS_CACHE_TTL_MS = 60_000"));

  assert.ok(feed.includes('queryKey: ["news-feed", query, limit, maxAgeHours ?? null]'));
  assert.ok(feed.includes("fetchNews({ data: { query, limit, maxAgeHours } })"));
  assert.ok(feed.includes("refetchInterval: 30_000"));
  assert.ok(feed.includes('"LATEST · " + ago(newest.minutesAgo)'));
});

test("provider-specific queries do not leak Google freshness syntax into Bing or Yahoo", async () => {
  const market = await source("../src/lib/market/market.functions.ts");

  assert.ok(market.includes('const genericQuery = query.replace(/\\s+when:[^\\s]+/gi, "").trim()'));
  assert.ok(market.includes("googleNewsFeed(query)"));
  assert.ok(market.includes("bingNewsFeed(genericQuery)"));
  assert.ok(market.includes("fetchYahooNews(genericQuery, upstreamLimit)"));
});
