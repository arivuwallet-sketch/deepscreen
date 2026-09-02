import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Tier } from "@/hooks/useSubscription";

export type ActivateResult = { ok: true } | { ok: false; error: string };

/**
 * Activates a subscription for whoever the access token actually belongs to
 * — never for whatever user id the client happens to send. The token is
 * verified against Supabase's own auth server (auth.getUser), which is what
 * actually establishes identity here; the plan's price and duration come
 * from this server's own PLANS list, never from the client, and expiry is
 * computed now rather than trusting a client-supplied date.
 *
 * IMPORTANT — this still activates the plan without collecting any payment.
 * No processor is connected (see the disclaimer on /pricing). What this DOES
 * close: since the subscriptions table's RLS now only lets a user SELECT
 * their own row, there is no longer a client-side path to self-grant a plan
 * by calling Supabase directly — every write has to come through here, using
 * the service-role key. Once a real payment processor (Stripe, Razorpay,
 * etc.) is wired in, point its webhook at this same activation logic after a
 * successful charge, instead of calling it directly from a button click.
 */
export const activateSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: { tier: Tier; accessToken: string }) => d)
  .handler(async ({ data }): Promise<ActivateResult> => {
    const plan = PLANS.find((p) => p.tier === data.tier);
    if (!plan) return { ok: false, error: "Unknown plan." };

    const url = process.env["SUPABASE_URL"];
    const anonKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !anonKey) return { ok: false, error: "Server is misconfigured." };

    const verifier = createClient<Database>(url, anonKey);
    const { data: userData, error: userError } = await verifier.auth.getUser(data.accessToken);
    if (userError || !userData.user) {
      return { ok: false, error: "Not signed in — please sign in again." };
    }

    let admin: SupabaseClient<Database>;
    try {
      const { createAdminClient } = await import("@/integrations/supabase/admin.server");
      admin = createAdminClient();
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Server is misconfigured." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.days);

    const { error } = await admin.from("subscriptions").upsert({
      user_id: userData.user.id,
      tier: plan.tier,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });
