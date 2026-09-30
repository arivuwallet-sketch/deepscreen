import assert from "node:assert/strict";
import { test } from "node:test";

import { liveMarketCapBillions, liveQuoteVolume } from "../src/lib/market/live-equity-stats.ts";

test("market cap follows every refreshed price once shares outstanding are known", () => {
  const fundamentals = { sharesOutstanding: 4_000_000_000, marketCap: 900_000_000_000 };

  const first = liveMarketCapBillions({ price: 250 }, fundamentals);
  const second = liveMarketCapBillions({ price: 252.5 }, fundamentals);

  assert.deepEqual(first, { value: 1000, source: "quote-derived" });
  assert.deepEqual(second, { value: 1010, source: "quote-derived" });
});

test("provider market cap is used until quote-derived market cap can be computed", () => {
  assert.deepEqual(
    liveMarketCapBillions(null, { sharesOutstanding: 4_000_000_000, marketCap: 900_000_000_000 }),
    { value: 900, source: "provider" },
  );

  assert.deepEqual(
    liveMarketCapBillions({ price: 250 }, { sharesOutstanding: null, marketCap: null }),
    { value: null, source: "unavailable" },
  );
});

test("a genuine zero-volume quote remains zero", () => {
  assert.equal(liveQuoteVolume({ volume: 0 }), 0);
  assert.equal(liveQuoteVolume({ volume: 123_456 }), 123_456);
  assert.equal(liveQuoteVolume(null), null);
  assert.equal(liveQuoteVolume({ volume: Number.NaN }), null);
});
