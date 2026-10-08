import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { entitlementFromPaidOrders, hasPaidOrderHistory, isSubscriptionActive } from "./subscription-entitlement";

/** Verify identity and read only caller-owned rows; never trust browser flags. */
export async function checkProRequest(request: Request): Promise<Response | null> {
  const token = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const deny = (message: string, status: number) => Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
  if (!token) return deny("Sign in with an active DeepScreen Pro plan to use AI chat.", 401);
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return deny("Pro access verification is temporarily unavailable.", 503);
  try {
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data: identity, error: authError } = await client.auth.getUser(token);
    if (authError || !identity.user) return deny("Please sign in again to use DeepScreen AI.", 401);
    const userId = identity.user.id;
    const [orders, subscription] = await Promise.all([
      client.from("payment_orders").select("tier,status,created_at,paid_at,entitlement_expires_at").eq("user_id", userId).eq("status", "paid"),
      client.from("subscriptions").select("tier,status,expires_at").eq("user_id", userId).eq("status", "active").gt("expires_at", new Date().toISOString()).maybeSingle(),
    ]);
    // Fail closed: a ledger outage must not revive stale subscription access.
    if (orders.error || subscription.error) return deny("Pro access could not be verified. Please retry shortly.", 503);
    const active = hasPaidOrderHistory(orders.data)
      ? entitlementFromPaidOrders(orders.data)
      : subscription.data;
    return isSubscriptionActive(active) ? null : deny("DeepScreen AI requires an active Pro plan. Choose a plan on the pricing page.", 403);
  } catch {
    return deny("Pro access could not be verified. Please retry shortly.", 503);
  }
}