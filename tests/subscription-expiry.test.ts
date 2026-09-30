import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isSubscriptionActive,
  subscriptionExpiryDelay,
} from "../src/lib/billing/subscription-entitlement.ts";

test("subscription is active strictly before expiry", () => {
  const row = { status: "active", expires_at: "2026-09-24T10:00:00.000Z" };
  assert.equal(isSubscriptionActive(row, Date.parse("2026-09-24T09:59:59.999Z")), true);
});

test("subscription locks at the exact expiry instant", () => {
  const row = { status: "active", expires_at: "2026-09-24T10:00:00.000Z" };
  assert.equal(isSubscriptionActive(row, Date.parse("2026-09-24T10:00:00.000Z")), false);
  assert.equal(isSubscriptionActive(row, Date.parse("2026-09-24T10:00:00.001Z")), false);
});

test("cancelled and malformed subscriptions never unlock Pro", () => {
  assert.equal(
    isSubscriptionActive(
      { status: "cancelled", expires_at: "2099-01-01T00:00:00.000Z" },
      Date.parse("2026-09-30T00:00:00.000Z"),
    ),
    false,
  );
  assert.equal(isSubscriptionActive({ status: "active", expires_at: "bad-date" }), false);
});

test("expiry delay never becomes negative", () => {
  assert.equal(
    subscriptionExpiryDelay(
      "2026-09-24T10:00:00.000Z",
      Date.parse("2026-09-24T10:00:01.000Z"),
    ),
    0,
  );
});
