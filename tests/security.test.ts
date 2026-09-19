import { test } from "node:test";
import assert from "node:assert/strict";

import {
  consumeRateLimit,
  isAllowedScreenerPath,
  isFreshWebhookTimestamp,
  isValidOrderId,
  normalizeCompanyName,
  normalizeSymbol,
} from "../src/lib/security.ts";
import { safeExternalHttpUrl } from "../src/lib/rss.server.ts";

test("order IDs are tightly scoped to DeepScreen-created orders", () => {
  assert.equal(isValidOrderId("ds_monthly_01234567_1760000000000"), true);
  assert.equal(isValidOrderId("ds_annual_01234567_1760000000000_abcdef12"), true);
  assert.equal(isValidOrderId("ds_monthly_attacker_1760000000000"), false);
  assert.equal(isValidOrderId("../../etc/passwd"), false);
});

test("webhook timestamps must be recent numeric epochs", () => {
  const now = 1_760_000_000_000;
  assert.equal(isFreshWebhookTimestamp(String(now), now), true);
  assert.equal(isFreshWebhookTimestamp(String(now - 6 * 60_000), now), false);
  assert.equal(isFreshWebhookTimestamp("not-a-timestamp", now), false);
});

test("market input normalization rejects control and oversized values", () => {
  assert.equal(normalizeSymbol("RELIANCE"), "RELIANCE");
  assert.equal(normalizeSymbol("A\nB"), null);
  assert.equal(normalizeSymbol("x".repeat(33)), null);
  assert.equal(normalizeCompanyName("  Example   PLC  "), "Example PLC");
  assert.equal(normalizeCompanyName("x".repeat(161)), null);
});

test("Screener URL allowlist blocks arbitrary paths", () => {
  assert.equal(isAllowedScreenerPath("/company/RELIANCE"), true);
  assert.equal(isAllowedScreenerPath("/company/RELIANCE/consolidated/"), true);
  assert.equal(isAllowedScreenerPath("/company/../../admin"), false);
  assert.equal(isAllowedScreenerPath("https://attacker.example/"), false);
});

test("news links allow only ordinary HTTP(S) URLs", () => {
  assert.equal(safeExternalHttpUrl("https://example.com/article"), "https://example.com/article");
  assert.equal(safeExternalHttpUrl("http://example.com/article"), "http://example.com/article");
  assert.equal(safeExternalHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalHttpUrl("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(safeExternalHttpUrl("https://user:pass@example.com"), null);
});

test("rate limiter blocks after its configured budget", () => {
  const now = 1_760_000_000_000;
  assert.deepEqual(consumeRateLimit("security-test", 2, 60_000, now).allowed, true);
  assert.deepEqual(consumeRateLimit("security-test", 2, 60_000, now + 1).allowed, true);
  assert.deepEqual(consumeRateLimit("security-test", 2, 60_000, now + 2).allowed, false);
});
