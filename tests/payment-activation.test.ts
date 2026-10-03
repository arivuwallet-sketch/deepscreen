import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";

import { activatePaidOrder } from "../src/lib/billing/activate.server.ts";

function clientReturning(body: unknown, status = 200) {
  const requests: { url: string; body: unknown }[] = [];
  const client = createClient("https://billing-test.supabase.co", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        requests.push({ url: String(input), body: JSON.parse(String(init?.body)) });
        return new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  return { client, requests };
}

for (const outcome of ["activated", "already_paid"] as const) {
  test(`real Supabase client activates a verified order: ${outcome}`, async () => {
    const expiresAt = "2026-10-10T10:00:00.000Z";
    const { client, requests } = clientReturning([
      { outcome, user_id: "test-user", tier: "weekly", expires_at: expiresAt },
    ]);
    const result = await activatePaidOrder(client, "ds_test_order");
    assert.deepEqual(result, { ok: true, outcome, expiresAt });
    assert.deepEqual(requests, [{
      url: "https://billing-test.supabase.co/rest/v1/rpc/activate_paid_order",
      body: { p_link_id: "ds_test_order" },
    }]);
  });
}

test("database activation errors do not report payment activation success", async () => {
  const { client } = clientReturning({ message: "Order missing", code: "P0001" }, 400);
  assert.deepEqual(await activatePaidOrder(client, "ds_missing"), {
    ok: false, error: "Order missing",
  });
});

test("empty activation responses do not unlock Pro", async () => {
  const { client } = clientReturning([]);
  assert.deepEqual(await activatePaidOrder(client, "ds_missing"), {
    ok: false, error: "Payment order could not be activated.",
  });
});
