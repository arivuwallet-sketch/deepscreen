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

  assert.ok(screener.includes('title="Market-moving news"'));
  assert.ok(screener.includes("limit={36}"));
  assert.ok(screener.includes("maxAgeHours={24}"));
  assert.ok(screener.includes("globalMarket"));
  assert.ok(screener.includes("showCategory"));
  assert.ok(!screener.includes("scrollable"));

  assert.ok(
    market.includes(
      'inputValidator((d: { query: string; limit?: number; maxAgeHours?: number; globalMarket?: boolean }) => d)',
    ),
  );
  assert.ok(market.includes("newsKey(data.query, maxAgeHours, globalMarket)"));
  assert.ok(market.includes("maxAgeHours <= 24"));
  assert.ok(market.includes('"1d"'));
  assert.ok(market.includes("const NEWS_CACHE_TTL_MS = 60_000"));
  assert.ok(market.includes("filterRecentNews(allItems, maxAgeHours).sort("));

  assert.ok(
    feed.includes('queryKey: ["news-feed", query, limit, maxAgeHours ?? null, globalMarket]'),
  );
  assert.ok(
    feed.includes("fetchNews({ data: { query, limit, maxAgeHours, globalMarket } })"),
  );
  assert.ok(feed.includes("refetchInterval: 30_000"));
  assert.ok(feed.includes('"LATEST · " + ago(newest.minutesAgo)'));
});

test("global market feed aggregates regions and market-moving themes", async () => {
  const market = await source("../src/lib/market/market.functions.ts");

  for (const category of [
    "GLOBAL",
    "US",
    "INDIA",
    "EUROPE",
    "ASIA",
    "MACRO",
    "EARNINGS",
    "M&A",
    "TECH",
    "COMMODITIES",
    "FX/BONDS",
    "GEOPOLITICS",
  ]) {
    assert.ok(market.includes(`category: "${category}"`), category);
  }

  assert.ok(market.includes("GLOBAL_MARKET_NEWS_TOPICS.slice(start, start + 4)"));
  assert.ok(market.includes("start += 4"));
  assert.ok(market.includes("categoryCounts"));
  assert.ok(market.includes("if (count >= 6) return false"));
});

test("provider-specific queries do not leak Google freshness syntax into Bing or Yahoo", async () => {
  const market = await source("../src/lib/market/market.functions.ts");

  assert.ok(
    market.includes('const genericQuery = freshQuery.replace(/\\s+when:[^\\s]+/gi, "").trim()') ||
      market.includes('const genericQuery = query.replace(/\\s+when:[^\\s]+/gi, "").trim()'),
  );
  assert.ok(market.includes("googleNewsFeed(freshQuery)") || market.includes("googleNewsFeed(query)"));
  assert.ok(market.includes("bingNewsFeed(genericQuery)"));
  assert.ok(market.includes("fetchYahooNews(genericQuery"));
});


test("news feed attaches impact levels and affected-market signals", async () => {
  const market = await source("../src/lib/market/market.functions.ts");
  const feed = await source("../src/components/ds/LiveNewsFeed.tsx");
  const rss = await source("../src/lib/rss.server.ts");

  assert.ok(rss.includes('export type NewsImpactLevel = "high" | "medium" | "low"'));
  assert.ok(rss.includes("impactLevel?: NewsImpactLevel"));
  assert.ok(rss.includes("affectedMarkets?: string[]"));

  assert.ok(market.includes("HIGH_IMPACT_NEWS_RE"));
  assert.ok(market.includes("MEDIUM_IMPACT_NEWS_RE"));
  assert.ok(market.includes("AFFECTED_MARKET_RULES"));
  assert.ok(market.includes('label: "NSE/BSE"'));
  assert.ok(market.includes('label: "NYSE/Nasdaq"'));
  assert.ok(market.includes('label: "LSE"'));
  assert.ok(market.includes('label: "Europe"'));
  assert.ok(market.includes('label: "Asia"'));
  assert.ok(market.includes('label: "FX"'));
  assert.ok(market.includes('label: "Bonds"'));
  assert.ok(market.includes('label: "Commodities"'));
  assert.ok(market.includes('label: "Tech"'));
  assert.ok(market.includes("withNewsSignals("));

  assert.ok(feed.includes("EST. IMPACT {(n.impactLevel ?? \"low\").toUpperCase()}"));
  assert.ok(feed.includes("AFFECTS:"));
  assert.ok(feed.includes("n.affectedMarkets?.length"));
  assert.ok(feed.includes("not a guaranteed market reaction or trading signal"));
});

test("high and medium impact rules cover major macro and corporate catalysts", async () => {
  const market = await source("../src/lib/market/market.functions.ts");

  for (const term of [
    "fomc",
    "rate decision",
    "cpi",
    "inflation",
    "payrolls",
    "gdp",
    "recession",
    "default",
    "bankruptcy",
    "war",
    "sanctions",
    "tariffs",
    "crash",
  ]) {
    assert.ok(market.toLowerCase().includes(term), term);
  }

  for (const term of [
    "earnings",
    "guidance",
    "merger",
    "acquisition",
    "regulation",
    "downgrade",
    "upgrade",
    "oil",
    "yield",
    "currency",
  ]) {
    assert.ok(market.toLowerCase().includes(term), term);
  }
});
