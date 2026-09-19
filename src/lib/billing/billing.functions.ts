import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Tier } from "@/hooks/useSubscription";
import { getPhoneCountry, validatePhoneNumber } from "@/lib/billing/phone";
import { consumeRateLimit, isValidOrderId, PUBLIC_APP_ORIGIN } from "@/lib/security";

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
  .inputValidator((d: { tier: Tier; accessToken: string; countryIso2: string; phone: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; orderId: string; paymentSessionId: string } | Fail> => {
      const plan = PLANS.find((p) => p.tier === data.tier);
      if (!plan) return { ok: false, error: "Unknown plan." };

      const request = getRequest();
      const userRate = consumeRateLimit(
        "checkout:ip:" + request.headers.get("cf-connecting-ip")?.trim().slice(0, 128),
        8,
        10 * 60_000,
      );
      if (!userRate.allowed) return { ok: false, error: "Too many checkout attempts. Please try again later." };
      const country = getPhoneCountry(data.countryIso2);
      if (!country) {
        return { ok: false, error: "Select a valid country calling code." };
      }
      const phoneValidation = validatePhoneNumber(country.iso2, data.phone);
      if (!phoneValidation.valid) {
        return { ok: false, error: phoneValidation.error };
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

      const orderId = `ds_${data.tier}_${user.id.slice(0, 8)}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      if (!isValidOrderId(orderId)) return { ok: false, error: "Could not create a secure order." };

      const { getAdmin } = await import("./activate.server");
      const admin = await getAdmin();
      const localInsert = await admin.from("payment_orders").insert({
        link_id: orderId,
        user_id: user.id,
        tier: plan.tier,
        amount: plan.price,
        currency: "INR",
        status: "created",
      });
      if (localInsert.error) {
        console.error("[payment] local order insert failed", localInsert.error);
        return { ok: false, error: "Could not start checkout. Please try again." };
      }

      try {
        const order = await createOrder(cfg, {
          orderId,
          amount: plan.price,
          currency: "INR",
          note: `DeepScreen Pro — ${plan.name}`,
          customerId: user.id,
          email: user.email ?? "",
          phone: phoneValidation.e164,
          returnUrl: `${PUBLIC_APP_ORIGIN}/pricing?cf_order_id=${orderId}`,
          notifyUrl: `${PUBLIC_APP_ORIGIN}/api/public/cashfree-webhook`,
          tags: { user_id: user.id, tier: plan.tier },
        });

        if (order.orderId !== orderId) {
          await admin.from("payment_orders").update({ status: "failed" }).eq("link_id", orderId);
          console.error("[payment] Cashfree returned unexpected order id");
          return { ok: false, error: "Payment order verification failed." };
        }

        return { ok: true, orderId: order.orderId, paymentSessionId: order.paymentSessionId };
      } catch (e) {
        await admin.from("payment_orders").update({ status: "failed" }).eq("link_id", orderId);
        return { ok: false, error: e instanceof Error ? e.message : "Could not start checkout." };
      }
    },
  );

/** Called when the user returns from Cashfree: re-checks the order server-side. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { orderId: string; accessToken: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; paid: boolean; status: string } | Fail> => {
    if (!isValidOrderId(data.orderId)) return { ok: false, error: "Invalid order." };
    const request = getRequest();
    const rate = consumeRateLimit(
      "confirm:ip:" + request.headers.get("cf-connecting-ip")?.trim().slice(0, 128),
      20,
      10 * 60_000,
    );
    if (!rate.allowed) return { ok: false, error: "Too many verification attempts. Please try again later." };

    const user = await verifyUser(data.accessToken);
    if (!user) return { ok: false, error: "Not signed in — please sign in again." };

    const { getAdmin, activatePaymentOrder } = await import("./activate.server");
    const admin = await getAdmin();
    const { data: order, error: orderError } = await admin
      .from("payment_orders")
      .select("user_id, tier, status, amount, currency")
      .eq("link_id", data.orderId)
      .maybeSingle();

    if (orderError) return { ok: false, error: "Could not verify the order." };
    if (!order || order.user_id !== user.id) {
      return { ok: false, error: "Order not found for this account." };
    }
    if (order.status === "paid") return { ok: true, paid: true, status: "PAID" };
    if (order.status !== "created") return { ok: true, paid: false, status: order.status.toUpperCase() };

    const { getCashfreeConfig, fetchOrder } = await import("./cashfree.server");
    const cfg = getCashfreeConfig();
    if (!cfg) return { ok: false, error: "Payments are not configured yet." };

    try {
      const remote = await fetchOrder(cfg, data.orderId);
      if (remote.orderId !== data.orderId) return { ok: false, error: "Payment order verification failed." };
      if (remote.status !== "PAID") {
        await admin.from("payment_orders").update({ status: remote.status === "EXPIRED" ? "expired" : "failed" }).eq("link_id", data.orderId).eq("status", "created");
        return { ok: true, paid: false, status: remote.status };
      }
      const remoteAmountCents = Math.round(remote.amount * 100);
      const localAmountCents = Math.round(Number(order.amount) * 100);
      if (order.currency !== "INR" || remote.currency !== "INR" || !Number.isFinite(remoteAmountCents) || remoteAmountCents < localAmountCents) {
        await admin.from("payment_orders").update({ status: "underpaid" }).eq("link_id", data.orderId).eq("status", "created");
        return { ok: true, paid: false, status: "PARTIALLY_PAID" };
      }

      const activated = await activatePaymentOrder(admin, data.orderId);
      if (!activated.ok) return activated;
      return { ok: true, paid: true, status: "PAID" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not verify payment." };
    }
  });
