import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chartResult,
  parseHistory,
  parseCommodityQuote,
  commodityAnalysis,
} from "../src/lib/market/commodity-analysis.ts";
const now = Date.UTC(2026, 9, 4);
const quoteResult = {
  meta: {
    symbol: "GC=F",
    regularMarketPrice: 110,
    regularMarketTime: now / 1000 - 86400,
    previousClose: 100,
    chartPreviousClose: 90,
    currency: "USD",
    regularMarketDayHigh: 112,
    regularMarketDayLow: 97,
    regularMarketVolume: 0,
  },
};

test("one-session change and as-of use provider fields, never fetch time or invented zeroes", () => {
  const q = parseCommodityQuote("GC=F", quoteResult, [], now)!;
  assert.equal(q.changePct, 10);
  assert.equal(q.asOf, new Date(now - 86400000).toISOString());
  assert.equal(q.volume, 0);
  const missing = parseCommodityQuote(
    "GC=F",
    { meta: { regularMarketPrice: 110, regularMarketTime: now / 1000 } },
    [],
    now,
  )!;
  assert.equal(missing.changePct, null);
  assert.equal(missing.volume, null);
  assert.equal(missing.dayHigh, null);
  assert.equal(parseCommodityQuote("GC=F", { meta: { regularMarketPrice: 110 } }, [], now), null);
  assert.equal(
    parseCommodityQuote(
      "GC=F",
      { meta: { regularMarketPrice: 110, regularMarketTime: now / 1000 + 9999 } },
      [],
      now,
    ),
    null,
  );
});
test("invalid symbols and malformed history cannot create fabricated bars", () => {
  assert.equal(chartResult({ chart: { result: [quoteResult] } }, "CL=F"), null);
  assert.equal(
    chartResult({ chart: { error: { code: "Not Found" }, result: [quoteResult] } }, "GC=F"),
    null,
  );
  const bars = parseHistory(
    {
      timestamp: [10, 20, 20, 30, 40, now / 1000 + 9999],
      indicators: { quote: [{ close: [100, null, 102, "103", Infinity, 105] }] },
    },
    now,
  );
  assert.deepEqual(bars, [
    { time: 10, close: 100 },
    { time: 20, close: 102 },
  ]);
  assert.deepEqual(parseHistory({ timestamp: [10], indicators: { quote: [] } }, now), []);
});
test("averages, observation returns and Wilder RSI match known sequences", () => {
  const rising = Array.from({ length: 60 }, (_, i) => ({ time: i + 1, close: i + 1 }));
  const a = commodityAnalysis(rising);
  assert.equal(a.sma20, 50.5);
  assert.equal(a.sma50, 35.5);
  assert.equal(a.change20, 50);
  assert.equal(a.rsi, 100);
  assert.equal(a.trend, "Upward alignment");
  assert.equal(commodityAnalysis(rising.map((b) => ({ ...b, close: 100 - b.close }))).rsi, 0);
  assert.equal(commodityAnalysis(rising.map((b) => ({ ...b, close: 10 }))).rsi, 50);
  const short = commodityAnalysis(rising.slice(0, 4));
  assert.equal(short.sma20, null);
  assert.equal(short.rsi, null);
  assert.equal(short.change5, null);
  assert.equal(short.trend, "Insufficient history");
});
test("negative futures prices remain valid but a zero or negative return baseline is not misleadingly scored", () => {
  const q = parseCommodityQuote(
    "CL=F",
    { meta: { regularMarketPrice: -5, regularMarketTime: now / 1000, previousClose: 10 } },
    [],
    now,
  )!;
  assert.equal(q.price, -5);
  assert.equal(q.changePct, -150);
  assert.equal(
    parseCommodityQuote(
      "CL=F",
      { meta: { regularMarketPrice: 5, regularMarketTime: now / 1000, previousClose: 0 } },
      [],
      now,
    )!.changePct,
    null,
  );
});

test('Wilder smoothing differs from simply recomputing a rolling gain/loss average', () => {
  const closes = [10, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18];
  const result = commodityAnalysis(closes.map((close, i) => ({ time: i + 1, close })));
  assert.ok(Math.abs(result.rsi! - 197 / 288 * 100) < 1e-10);
});
