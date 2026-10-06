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

  assert.ok(market.includes("mode?: NewsFeedMode"));
  assert.ok(market.includes("entityName?: string"));
  assert.ok(market.includes("entityCode?: string"));
  assert.ok(market.includes("newsKey(data.query, maxAgeHours, scope)"));
  assert.ok(market.includes("maxAgeHours <= 24"));
  assert.ok(market.includes('"1d"'));
  assert.ok(market.includes("const NEWS_CACHE_TTL_MS = 20_000"));
  assert.ok(market.includes("filterRecentNews(allItems, maxAgeHours).sort("));

  assert.ok(feed.includes('"news-feed"'));
  assert.ok(feed.includes("mode"));
  assert.ok(feed.includes("entityName"));
  assert.ok(feed.includes("entityCode"));
  assert.ok(feed.includes("exchange"));
  assert.ok(feed.includes("market"));
  assert.ok(feed.includes("refetchInterval: 20_000"));
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

  assert.ok(market.includes('mode === "global-market"'));
  assert.ok(market.includes("topics.slice(batchStart, batchStart + 4)"));
  assert.ok(market.includes("batchStart += 4"));
  assert.ok(market.includes("categoryCounts"));
  assert.ok(market.includes('const categoryCap = mode === "global-market" ? 6 : 8'));
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


test("stock commodity ETF mutual-fund and REIT news use widened scoped feeds", async () => {
  const topics = await source("../src/lib/market/news-topics.ts");
  const stock = await source("../src/routes/stock.$exchange.$symbol.tsx");
  const commodities = await source("../src/routes/commodities.tsx");
  const investment = await source("../src/routes/investment.$market.$type.$code.tsx");
  const funds = await source("../src/routes/mutual-funds.tsx");
  const etfs = await source("../src/routes/etfs.tsx");
  const reits = await source("../src/routes/reits.tsx");
  const exchange = await source("../src/routes/exchange.$code.tsx");

  for (const mode of ["company", "commodities", "etf", "mutual-fund", "reit"]) {
    assert.ok(topics.includes(`"${mode}"`), mode);
  }

  for (const category of [
    "COMPANY",
    "EARNINGS",
    "FILINGS",
    "ANALYSTS",
    "CORPORATE",
    "CAPITAL",
    "MANAGEMENT",
    "INDUSTRY",
    "GOLD",
    "SILVER",
    "OIL",
    "NAT GAS",
    "COPPER",
    "PRECIOUS",
    "ENERGY",
    "METALS",
    "MF FLOWS",
    "MF NFO",
    "MF RULES",
    "MF MANAGERS",
    "ETF FLOWS",
    "ETF LAUNCH",
    "ETF INDEX",
    "ETF THEMES",
    "REIT MARKET",
    "REIT DISTRIBUTION",
    "REIT CAPITAL",
  ]) {
    assert.ok(topics.includes(`category: "${category}"`), category);
  }

  assert.ok(stock.includes('mode="company"'));
  assert.ok(stock.includes("maxAgeHours={24}"));
  assert.ok(stock.includes("limit={30}"));
  assert.ok(stock.includes("entityName={stock.name}"));
  assert.ok(stock.includes("entityCode={stock.symbol}"));
  assert.ok(stock.includes("exchange={stock.exchange}"));

  assert.ok(commodities.includes('mode="commodities"'));
  assert.ok(commodities.includes("limit={40}"));
  assert.ok(commodities.includes("maxAgeHours={24}"));

  assert.ok(investment.includes('"mutual-fund"'));
  assert.ok(investment.includes('"etf"'));
  assert.ok(investment.includes('"reit"'));
  assert.ok(investment.includes("entityName={item.name}"));
  assert.ok(investment.includes("entityCode={item.code}"));
  assert.ok(investment.includes("maxAgeHours={24}"));

  assert.ok(funds.includes('mode="mutual-fund"'));
  assert.ok(etfs.includes('mode="etf"'));
  assert.ok(reits.includes('mode="reit"'));
  assert.ok(exchange.includes("maxAgeHours={24}"));
  assert.ok(exchange.includes("limit={30}"));
  for (const hub of [funds, etfs, reits]) {
    assert.ok(hub.includes("limit={40}"));
    assert.ok(hub.includes("maxAgeHours={24}"));
    assert.ok(hub.includes("showCategory"));
  }
});

test("scoped news uses all three providers and preserves affected-market context", async () => {
  const market = await source("../src/lib/market/market.functions.ts");
  const topics = await source("../src/lib/market/news-topics.ts");

  assert.ok(market.includes('fetchFeed(googleNewsFeed(freshQuery)'));
  assert.ok(market.includes('fetchFeed(bingNewsFeed(genericQuery)'));
  assert.ok(market.includes('includeYahoo ? fetchYahooNews(genericQuery'));
  assert.ok(market.includes('mode === "global-market"'));
  assert.ok(market.includes(': true;'));
  assert.ok(market.includes("topic.affectedMarkets ?? []"));
  assert.ok(market.includes('mode !== "generic"'));

  assert.ok(topics.includes('"Mutual Funds"'));
  assert.ok(topics.includes('"ETFs"'));
  assert.ok(topics.includes('"REITs"'));
  assert.ok(topics.includes('"Commodities"'));
  assert.ok(topics.includes('"NSE/BSE"'));
  assert.ok(topics.includes('"NYSE/Nasdaq"'));
  assert.ok(topics.includes('"LSE"'));
});


test("widened scoped news keeps every provider and deduplicates syndicated variants", async () => {
  const market = await source("../src/lib/market/market.functions.ts");
  const rss = await source("../src/lib/rss.server.ts");
  const feed = await source("../src/components/ds/LiveNewsFeed.tsx");
  const investment = await source("../src/routes/investment.$market.$type.$code.tsx");

  assert.ok(market.includes("Math.min(20, Math.ceil(limit * 0.7))"));
  assert.ok(market.includes('const batchSize = mode === "global-market" ? 4 : 3'));
  assert.ok(market.includes('const categoryCap = mode === "global-market" ? 6 : 10'));
  assert.ok(feed.includes("refetchInterval: 20_000"));
  assert.ok(feed.includes("staleTime: 7_500"));
  assert.ok(investment.includes("limit={30}"));

  assert.ok(rss.includes("function newsFingerprint"));
  assert.ok(rss.includes(".slice(0, 14)"));
  assert.ok(rss.includes("seen.has(key)"));
});

test("investment market aliases map to the correct affected exchange groups", async () => {
  const topics = await source("../src/lib/market/news-topics.ts");

  assert.ok(topics.includes('["NSE", "BSE", "IN", "INDIA"]'));
  assert.ok(topics.includes('["NYSE", "NASDAQ", "US", "USA", "UNITED STATES"]'));
  assert.ok(topics.includes('["LSE", "UK", "GB", "UNITED KINGDOM"]'));
});
