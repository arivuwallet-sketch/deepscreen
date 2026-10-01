import assert from "node:assert/strict";
import { test } from "node:test";

import {
  entitlementFromPaidOrders,
  hasPaidOrderHistory,
} from "../src/lib/billing/subscription-entitlement.ts";

const day = 86_400_000;

test("one weekly payment expires exactly seven days after the paid order", () => {
  const started = Date.parse("2026-09-17T10:00:00.000Z");
  const orders = [
    { tier: "weekly", status: "paid", created_at: new Date(started).toISOString() },
  ];

  const beforeExpiry = entitlementFromPaidOrders(orders, started + 7 * day - 1);
  assert.equal(beforeExpiry?.tier, "weekly");
  assert.equal(beforeExpiry?.expires_at, "2026-09-24T10:00:00.000Z");

  assert.equal(entitlementFromPaidOrders(orders, started + 7 * day), null);
});

test("failed and merely-created checkout orders never grant access", () => {
  const orders = [
    { tier: "weekly", status: "created", created_at: "2026-09-17T10:00:00.000Z" },
    { tier: "monthly", status: "failed", created_at: "2026-09-18T10:00:00.000Z" },
  ];
  assert.equal(hasPaidOrderHistory(orders), false);
  assert.equal(entitlementFromPaidOrders(orders, Date.parse("2026-09-19T00:00:00Z")), null);
});

test("the latest purchase replaces an earlier entitlement instead of stacking it", () => {
  const orders = [
    { tier: "weekly", status: "paid", created_at: "2026-09-17T10:00:00.000Z" },
    { tier: "weekly", status: "paid", created_at: "2026-09-20T10:00:00.000Z" },
  ];
  assert.equal(hasPaidOrderHistory(orders), true);
  const row = entitlementFromPaidOrders(orders, Date.parse("2026-09-25T00:00:00Z"));
  assert.equal(row?.expires_at, "2026-09-27T10:00:00.000Z");
});

test("a recorded payment timestamp is the exact start of the plan", () => {
  const orders = [{
    tier: "weekly",
    status: "paid",
    created_at: "2026-09-17T09:00:00.000Z",
    paid_at: "2026-09-17T10:00:00.000Z",
    entitlement_expires_at: "2026-09-24T10:00:00.000Z",
  }];
  assert.equal(
    entitlementFromPaidOrders(orders, Date.parse("2026-09-24T09:59:59.999Z"))?.expires_at,
    "2026-09-24T10:00:00.000Z",
  );
  assert.equal(entitlementFromPaidOrders(orders, Date.parse("2026-09-24T10:00:00.000Z")), null);
});

test("an old over-extended subscription row cannot override an expired paid ledger", () => {
  const orders = [
    { tier: "weekly", status: "paid", created_at: "2026-09-17T10:00:00.000Z" },
  ];
  assert.equal(
    entitlementFromPaidOrders(orders, Date.parse("2026-09-30T00:00:00.000Z")),
    null,
  );
});
