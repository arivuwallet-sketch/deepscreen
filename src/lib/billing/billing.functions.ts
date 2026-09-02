import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Tier } from "@/hooks/useSubscription";

type Caller = { ok: true; userId: string } | { ok: false; error: string };
type Admin = { ok: true; admin: SupabaseClient<Database> } | { ok: false; error: string };

/** Verifies who is actually calling — via Supabase's own auth server, never a client-supplied id. */
async function verifyCaller(accessToken: string): Promise<Caller> {
  const url = process.env["SUPABASE_URL"];
  const anonKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !anonKey) return { ok: false, error: "Server is misconfigured." };

  const verifier = createClient<Database>(url, anonKey);
  const { data: userData, error: userError } = await verifier.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return { ok: false, error: "Not signed in — please sign in again." };
  }
  return { ok: true, userId: userData.user.id };
}

async function getAdmin(): Promise<Admin> {
  try {
    const { createAdminClient } = await import("@/integrations/supabase/admin.server");
    return { ok: true, admin: createAdminClient() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Server is misconfigured." };
  }
}

export type ActivateResult = { ok: true } | { ok: false; error: string };

/**
 * Activates a subscription for whoever the access token actually belongs to
 * — never for whatever user id the client happens to send. The plan's price
 * and duration come from this server's own PLANS list, never the client,
 * and expiry is computed now rather than trusting a client-supplied date.
 *
 * IMPORTANT — this still activates the plan without collecting any payment.
 * No processor is connected (see the disclaimer on /pricing). What this DOES
 * close: since the subscriptions table's RLS only lets a user SELECT their
 * own row, there's no client-side path to self-grant a plan by calling
 * Supabase directly — every write goes through here, using the service-role
 * key. Once a real payment processor is wired in, point its webhook at this
 * same activation logic after a successful charge, instead of a button
 * calling it directly.
 */
export const activateSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: { tier: Tier; accessToken: string }) => d)
  .handler(async ({ data }): Promise<ActivateResult> => {
    const plan = PLANS.find((p) => p.tier === data.tier);
    if (!plan) return { ok: false, error: "Unknown plan." };

    const caller = await verifyCaller(data.accessToken);
    if (!caller.ok) return caller;

    const adminResult = await getAdmin();
    if (!adminResult.ok) return adminResult;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.days);

    const { error } = await adminResult.admin.from("subscriptions").upsert({
      user_id: caller.userId,
      tier: plan.tier,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export type PurchaseResult = { ok: true } | { ok: false; error: string };

/**
 * Records a ₹50 purchase of the Pine Script indicator for the verified
 * caller — same identity check and service-role write as
 * activateSubscription, and the same honest caveat: no payment processor is
 * connected, so this records a purchase without collecting real money.
 * Wire a real processor's webhook to this same logic once one exists.
 */
export const purchasePineScript = createServerFn({ method: "POST" })
  .inputValidator((d: { accessToken: string }) => d)
  .handler(async ({ data }): Promise<PurchaseResult> => {
    const caller = await verifyCaller(data.accessToken);
    if (!caller.ok) return caller;

    const adminResult = await getAdmin();
    if (!adminResult.ok) return adminResult;

    const { PINE_SCRIPT_PRODUCT, PINE_SCRIPT_PRICE_INR } =
      await import("@/lib/pine-scripts/pine-script.server");

    const { error } = await adminResult.admin.from("pine_script_purchases").upsert({
      user_id: caller.userId,
      product: PINE_SCRIPT_PRODUCT,
      amount_inr: PINE_SCRIPT_PRICE_INR,
      status: "active",
      purchased_at: new Date().toISOString(),
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export type DownloadResult =
  { ok: true; filename: string; content: string } | { ok: false; error: string };

/**
 * Serves the actual Pine Script source — but only after confirming, via a
 * server-side DB read using the service-role key, that this verified caller
 * has an active purchase row. The client's own belief about whether it has
 * "purchased" is never trusted here; the only thing gating the file content
 * is this server-side check, made fresh on every call.
 */
export const downloadPineScript = createServerFn({ method: "POST" })
  .inputValidator((d: { accessToken: string }) => d)
  .handler(async ({ data }): Promise<DownloadResult> => {
    const caller = await verifyCaller(data.accessToken);
    if (!caller.ok) return caller;

    const adminResult = await getAdmin();
    if (!adminResult.ok) return adminResult;

    const { data: row, error } = await adminResult.admin
      .from("pine_script_purchases")
      .select("status, download_count")
      .eq("user_id", caller.userId)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!row || row.status !== "active") {
      return { ok: false, error: "No active purchase found for your account." };
    }

    const { getPineScriptSource, PINE_SCRIPT_FILENAME } =
      await import("@/lib/pine-scripts/pine-script.server");

    // Best-effort download tracking — never blocks the actual download.
    void adminResult.admin
      .from("pine_script_purchases")
      .update({
        download_count: row.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("user_id", caller.userId);

    return { ok: true, filename: PINE_SCRIPT_FILENAME, content: getPineScriptSource() };
  });
