import { investmentQuoteCode } from "../src/lib/deepscreen/investment-symbol.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanHistory,
  historySummary,
  realizedVolatility,
} from "../src/lib/market/history-analysis.ts";
import {
  parseOptionsContext,
  fetchOptionsContext,
} from "../src/lib/market/options-context.server.ts";
test("history removes invalid observations and computes observed peak drawdown", () => {
  const p = [
    { at: 3, value: 90 },
    { at: 1, value: 100 },
    { at: 2, value: 120 },
    { at: 4, value: NaN },
    { at: 1, value: 100 },
  ];
  assert.equal(cleanHistory(p).length, 3);
  assert.deepEqual(historySummary(p), { count: 3, change: -9.999999999999998, drawdown: -25 });
  assert.equal(historySummary([]).change, null);
});
test("realized volatility uses sample variance, not price dispersion", () => {
  const returns = [0.01, -0.02, 0.03];
  let price = 100;
  const p = [{ at: 0, value: price }];
  returns.forEach((r, i) => {
    price *= Math.exp(r);
    p.push({ at: i + 1, value: price });
  });
  const mean = returns.reduce((a, b) => a + b) / 3,
    expected = Math.sqrt((returns.reduce((s, r) => s + (r - mean) ** 2, 0) / 2) * 252) * 100;
  assert.ok(Math.abs(realizedVolatility(p, 3)! - expected) < 1e-9);
  assert.equal(realizedVolatility(p, 20), null);
});
test("options parser preserves source times, rejects wrong symbols and scales pence", () => {
  const now = Date.UTC(2026, 9, 4),
    time = now / 1000 - 86400;
  const result = {
    meta: { symbol: "TEST.L", currency: "GBp", regularMarketPrice: 250, regularMarketTime: time },
    timestamp: [time - 86400, time],
    indicators: { adjclose: [{ adjclose: [200, 250] }] },
  };
  const d = parseOptionsContext({ chart: { result: [result] } }, "TEST.L", now);
  assert.equal(d.price, 2.5);
  assert.equal(d.points[0]?.value, 2);
  assert.equal(d.currency, "GBP");
  assert.equal(d.asOf, new Date(time * 1000).toISOString());
  assert.equal(d.volatility20, null);
  assert.equal(parseOptionsContext({ chart: { result: [result] } }, "OTHER", now).error, true);
  assert.equal(parseOptionsContext(null, "TEST.L", now).price, null);
});
test("options endpoint validates inputs before issuing requests", async () => {
  await assert.rejects(fetchOptionsContext("INVALID", "TEST"));
  await assert.rejects(fetchOptionsContext("NSE", "../../bad"));
});
test("failed provider does not invent spot prices and duplicate requests share cache", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("{}", { status: 503 });
  };
  try {
    const [a, b] = await Promise.all([
      fetchOptionsContext("NASDAQ", "FAILTEST"),
      fetchOptionsContext("NASDAQ", "FAILTEST"),
    ]);
    assert.equal(a.price, null);
    assert.equal(a.error, true);
    assert.deepEqual(a, b);
    assert.equal(calls, 2);
    await fetchOptionsContext("NASDAQ", "FAILTEST");
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test("REIT quote codes use verified RR listings without changing stock symbols",()=>{assert.equal(investmentQuoteCode("NSE","REIT","EMBASSY"),"EMBASSY-RR");assert.equal(investmentQuoteCode("NSE","ETF","NIFTYBEES"),"NIFTYBEES");assert.equal(investmentQuoteCode("NYSE","REIT","O"),"O");});
