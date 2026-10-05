import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path: string) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("screener mounts an infinite major-index tape for all five exchanges", async () => {
  const route = await source("../src/routes/screener.tsx");
  const defs = await source("../src/lib/market/market-indices.ts");
  const component = await source("../src/components/ds/MarketIndexMarquee.tsx");
  const css = await source("../src/components/ds/market-index-marquee.css");

  assert.ok(route.includes("<MarketIndexMarquee />"));

  for (const exchange of ["NSE", "BSE", "NYSE", "NASDAQ", "LSE"]) {
    assert.ok(defs.includes(`exchange: "${exchange}"`), exchange);
  }

  for (const symbol of [
    "^NSEI",
    "^NSEBANK",
    "^BSESN",
    "BSE-200.BO",
    "BSE-500.BO",
    "^NYA",
    "^GSPC",
    "^DJI",
    "^RUT",
    "^IXIC",
    "^NDX",
    "^FTSE",
    "^FTMC",
  ]) {
    assert.ok(defs.includes(`symbol: "${symbol}"`), symbol);
  }

  assert.ok(component.includes("refetchInterval: 10_000"));
  assert.ok(component.includes("<TapeSet items={data} />"));
  assert.ok(component.includes("<TapeSet items={data} hidden />"));
  assert.ok(component.includes("SOURCE MAY BE DELAYED"));
  assert.ok(css.includes("animation: ds-index-marquee 78s linear infinite"));
  assert.ok(css.includes("translate3d(-50%, 0, 0)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
});

test("index quotes use a shared short server cache instead of per-user upstream spam", async () => {
  const market = await source("../src/lib/market/market.functions.ts");

  assert.ok(market.includes("const INDEX_TAPE_CACHE_TTL_MS = 8_000"));
  assert.ok(market.includes("let indexTapeCache"));
  assert.ok(market.includes("let indexTapeInFlight"));
  assert.ok(market.includes("fetchChartQuote(index.symbol)"));
  assert.ok(market.includes("start += 5"));
});
