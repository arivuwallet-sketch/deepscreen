import { afterAll, beforeEach, expect, mock, test } from "bun:test";

const future = new Date(Date.now() + 86_400_000).toISOString();
let user: { id: string } | null = { id: "test-owner" };
let orders: unknown[] = [];
let subscription: unknown = { status: "active", expires_at: future, tier: "weekly" };
let readError: unknown = null;
let reads = 0;

mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: (table: string) => {
      reads += 1;
      const result = { data: table === "payment_orders" ? orders : subscription, error: readError };
      const chain = {
        select: () => chain, eq: () => chain, gt: () => chain,
        maybeSingle: async () => result,
        then: (resolve: (result: unknown) => unknown) => Promise.resolve(result).then(resolve),
      };
      return chain;
    },
  }),
}));

const { checkProRequest } = await import("../src/lib/billing/pro-access.server");
const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_PUBLISHABLE_KEY;
beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  user = { id: "test-owner" };
  orders = [];
  subscription = { status: "active", expires_at: future, tier: "weekly" };
  readError = null;
  reads = 0;
});
afterAll(() => {
  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
  else process.env.SUPABASE_PUBLISHABLE_KEY = originalKey;
});
const request = () => new Request("https://example.invalid/api/chat", { headers: { Authorization: "Bearer test-token" } });

test("anonymous requests are denied before data or AI use", async () => {
  expect((await checkProRequest(new Request("https://example.invalid/api/chat")))?.status).toBe(401);
  expect(reads).toBe(0);
});
test("unverified identity cannot read subscriptions", async () => {
  user = null;
  expect((await checkProRequest(request()))?.status).toBe(401);
  expect(reads).toBe(0);
});
test("free users cannot run AI", async () => {
  subscription = null;
  expect((await checkProRequest(request()))?.status).toBe(403);
});
test("paid active users are allowed", async () => {
  const paidAt = new Date().toISOString();
  orders = [{ tier: "weekly", status: "paid", created_at: paidAt, paid_at: paidAt, entitlement_expires_at: future }];
  expect(await checkProRequest(request())).toBeNull();
});
test("expired ledger overrides an overextended active row", async () => {
  orders = [{ tier: "weekly", status: "paid", created_at: "2020-01-01T00:00:00Z", paid_at: "2020-01-01T00:00:00Z" }];
  expect((await checkProRequest(request()))?.status).toBe(403);
});
test("database failures deny access rather than reviving old Pro", async () => {
  readError = { message: "Unavailable" };
  expect((await checkProRequest(request()))?.status).toBe(503);
});