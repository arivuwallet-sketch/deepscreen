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
 * Creates a Cashfree payment-gateway order for a plan. The price and duration
 * come from this server's PLANS list — never from the client — and the plan is
 * only granted once Cashfree confirms the payment (webhook or confirmCheckout).
 */
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { tier: Tier; accessToken: string; origin: string; phone: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; orderId: string; paymentSessionId: string } | Fail> => {
      const plan = PLANS.find((p) => p.tier === data.tier);
      if (!plan) return { ok: false, error: "Unknown plan." };
      if (!/^https?:\/\//.test(data.origin)) return { ok: false, error: "Bad origin." };
      if (!/^[6-9]\d{9}$/.test(data.phone)) {
        return { ok: false, error: "Enter a valid 10-digit Indian mobile number." };
      }

      const user = await verifyUser(data.accessToken);
      if (!user) return { ok: false, error: "Not signed in — please sign in again." };

      const { getCashfreeConfig, createOrder } = await import("./cashfree.server");
      const cfg = getCashfreeConfig();
      if (!cfg) {
        return {
          ok: false,
          error: "Payments are not configured yet — the Cashfree keys are missing.",
        };
      }

      const orderId = `ds_${data.tier}_${user.id.slice(0, 8)}_${Date.now()}`;
      try {
        const order = await createOrder(cfg, {
          orderId,
          amount: plan.price,
          currency: "INR",
          note: `DeepScreen Pro — ${plan.name}`,
          customerId: user.id,
          email: user.email ?? "customer@deepscreen.app",
          phone: data.phone,
          returnUrl: `${data.origin}/pricing?cf_order_id=${orderId}`,
          notifyUrl: `${data.origin}/api/public/cashfree-webhook`,
          tags: { user_id: user.id, tier: plan.tier },
        });

        const { getAdmin } = await import("./activate.server");
        const admin = await getAdmin();
        await admin.from("payment_orders").insert({
          link_id: order.orderId,
          user_id: user.id,
          tier: plan.tier,
          amount: plan.price,
          currency: "INR",
          status: "created",
        });

        return { ok: true, orderId: order.orderId, paymentSessionId: order.paymentSessionId };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Could not start checkout." };
      }
    },
  );

/** Called when the user returns from Cashfree: re-checks the order server-side. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { orderId: string; accessToken: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; paid: boolean; status: string } | Fail> => {
    const user = await verifyUser(data.accessToken);
    if (!user) return { ok: false, error: "Not signed in — please sign in again." };

    const { getCashfreeConfig, fetchOrder } = await import("./cashfree.server");
    const cfg = getCashfreeConfig();
    if (!cfg) return { ok: false, error: "Payments are not configured yet." };

    try {
      const remote = await fetchOrder(cfg, data.orderId);
      const { getAdmin, grantSubscription } = await import("./activate.server");
      const admin = await getAdmin();

      const { data: order } = await admin
        .from("payment_orders")
        .select("user_id, tier, status, amount, currency")
        .eq("link_id", data.orderId)
        .maybeSingle();

      if (!order || order.user_id !== user.id) {
        return { ok: false, error: "Order not found for this account." };
      }
      if (remote.status !== "PAID") {
        await admin
          .from("payment_orders")
          .update({ status: remote.status.toLowerCase() })
          .eq("link_id", data.orderId);
        return { ok: true, paid: false, status: remote.status };
      }
      if (order.status === "paid") return { ok: true, paid: true, status: "PAID" };
      if (
        order.currency !== "INR" ||
        remote.currency !== "INR" ||
        remote.amount + 0.01 < Number(order.amount)
      ) {
        await admin
          .from("payment_orders")
          .update({ status: "underpaid" })
          .eq("link_id", data.orderId);
        return { ok: true, paid: false, status: "PARTIALLY_PAID" };
      }

      const granted = await grantSubscription(admin, order.user_id, order.tier as Tier);
      if (!granted.ok) return granted;
      await admin.from("payment_orders").update({ status: "paid" }).eq("link_id", data.orderId);
      return { ok: true, paid: true, status: "PAID" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not verify payment." };
    }
  });
