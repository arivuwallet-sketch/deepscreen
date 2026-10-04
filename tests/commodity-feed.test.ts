import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchCommoditySnapshot } from "../src/lib/market/commodity-feed.server.ts";

test("feed deduplicates requests, retains dated quotes during failures, and expires them", async () => {
  const originalFetch = globalThis.fetch,
    originalNow = Date.now;
  let now = Date.UTC(2026, 9, 4),
    requests = 0,
    fail = false;
  Date.now = () => now;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requests++;
    if (fail) return new Response("{}", { status: 503 });
    const url = new URL(String(input));
    const symbol = decodeURIComponent(url.pathname.split("/").at(-1)!);
    const daily = url.searchParams.get("interval") === "1d";
    return Response.json({
      chart: {
        result: [
          {
            meta: {
              symbol,
              regularMarketPrice: 110,
              regularMarketTime: now / 1000 - 100,
              previousClose: 100,
              currency: "USD",
            },
            ...(daily
              ? {
                  timestamp: [now / 1000 - 86400, now / 1000 - 100],
                  indicators: { quote: [{ close: [100, 110] }] },
                }
              : {}),
          },
        ],
        error: null,
      },
    });
  }) as typeof fetch;
  try {
    const [a, b] = await Promise.all([fetchCommoditySnapshot(), fetchCommoditySnapshot()]);
    assert.equal(a, b);
    assert.equal(requests, 10);
    assert.equal(Object.keys(a.quotes).length, 5);
    await fetchCommoditySnapshot();
    assert.equal(requests, 10);
    now += 61000;
    const refreshed = await fetchCommoditySnapshot();
    assert.equal(requests, 15, "history is reused for 15 minutes");
    const timestamp = refreshed.quotes["GC=F"]!.asOf;
    now += 61000;
    fail = true;
    const stale = await fetchCommoditySnapshot();
    assert.equal(stale.quotes["GC=F"]!.asOf, timestamp, "failed refresh never changes market time");
    assert.equal(stale.quotes["GC=F"]!.cached, true);
    assert.equal(stale.unavailable.length, 5);
    now += 8 * 86400000;
    const expired = await fetchCommoditySnapshot();
    assert.deepEqual(expired.quotes, {});
    assert.equal(expired.unavailable.length, 5);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});
