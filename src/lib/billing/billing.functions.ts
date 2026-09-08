import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Tier } from "@/hooks/useSubscription";

type Fail = { ok: false; error: string };

async function verifyUser(accessToken: string) {
  const url = process.env["SUPABASE_URL"];
  const anonKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !anonKey) return null;
  const verifier = createClient<Database>(url, anonKey);
  const { data, error } = await verifier.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Creates a Cashfree hosted checkout link for a plan. The price and duration
 * come from this server's PLANS list — never from the client — and the plan is
 * only granted once Cashfree confirms the payment (webhook or confirmCheckout).
 */
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { tier: Tier; accessToken: string; origin: string; phone?: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; url: string; linkId: string } | Fail> => {
    const plan = PLANS.find((p) => p.tier === data.tier);
    if (!plan) return { ok: false, error: "Unknown plan." };
    if (!/^https?:\/\//.test(data.origin)) return { ok: false, error: "Bad origin." };

    const user = await verifyUser(data.accessToken);
    if (!user) return { ok: false, error: "Not signed in — please sign in again." };

    const { getCashfreeConfig, createPaymentLink } = await import("./cashfree.server");
    const cfg = getCashfreeConfig();
    if (!cfg) {
      return {
        ok: false,
        error: "Payments are not configured yet — the Cashfree keys are missing.",
      };
    }

    const linkId = `ds_${data.tier}_${user.id.slice(0, 8)}_${Date.now()}`;
    try {
      const link = await createPaymentLink(cfg, {
        linkId,
        amount: plan.price,
        currency: "INR",
        purpose: `DeepScreen Pro — ${plan.name}`,
        customerId: user.id,
        email: user.email ?? "customer@deepscreen.app",
        phone: data.phone && /^\d{8,15}$/.test(data.phone) ? data.phone : "9999999999",
        returnUrl: `${data.origin}/pricing?cf_link_id={link_id}`,
        notes: {
          user_id: user.id,
          tier: plan.tier,
          notifyUrl: `${data.origin}/api/public/cashfree-webhook`,
        },
      });

      const { getAdmin } = await import("./activate.server");
      const admin = await getAdmin();
      await admin.from("payment_orders").insert({
        link_id: link.linkId,
        user_id: user.id,
        tier: plan.tier,
        amount: plan.price,
        currency: "INR",
        status: "created",
      });

      return { ok: true, url: link.linkUrl, linkId: link.linkId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not start checkout." };
    }
  });

/** Called when the user returns from Cashfree: re-checks status server-side. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { linkId: string; accessToken: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; paid: boolean; status: string } | Fail> => {
    const user = await verifyUser(data.accessToken);
    if (!user) return { ok: false, error: "Not signed in — please sign in again." };

    const { getCashfreeConfig, fetchPaymentLink } = await import("./cashfree.server");
    const cfg = getCashfreeConfig();
    if (!cfg) return { ok: false, error: "Payments are not configured yet." };

    try {
      const link = await fetchPaymentLink(cfg, data.linkId);
      const { getAdmin, grantSubscription } = await import("./activate.server");
      const admin = await getAdmin();

      const { data: order } = await admin
        .from("payment_orders")
        .select("user_id, tier, status")
        .eq("link_id", data.linkId)
        .maybeSingle();

      if (!order || order.user_id !== user.id) {
        return { ok: false, error: "Order not found for this account." };
      }
      if (link.status !== "PAID") {
        await admin
          .from("payment_orders")
          .update({ status: link.status.toLowerCase() })
          .eq("link_id", data.linkId);
        return { ok: true, paid: false, status: link.status };
      }
      if (order.status === "paid") return { ok: true, paid: true, status: "PAID" };

      const granted = await grantSubscription(admin, order.user_id, order.tier as Tier);
      if (!granted.ok) return granted;
      await admin.from("payment_orders").update({ status: "paid" }).eq("link_id", data.linkId);
      return { ok: true, paid: true, status: "PAID" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not verify payment." };
    }
  });
