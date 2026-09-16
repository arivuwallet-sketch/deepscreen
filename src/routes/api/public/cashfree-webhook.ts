import { createFileRoute } from "@tanstack/react-router";

import type { Tier } from "@/hooks/useSubscription";

interface CashfreeLinkWebhook {
  type?: string;
  data?: {
    link_id?: string;
    link_status?: string;
    link_currency?: string;
    link_amount_paid?: string | number;
    link_notes?: Record<string, string>;
    order?: { order_tags?: Record<string, string>; transaction_status?: string } | null;
    link?: { link_id?: string } | null;
  };
}

export const Route = createFileRoute("/api/public/cashfree-webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-webhook-signature");
        const timestamp = request.headers.get("x-webhook-timestamp");

        const { getCashfreeConfig, verifyWebhookSignature } = await import(
          "@/lib/billing/cashfree.server"
        );
        const cfg = getCashfreeConfig();
        if (!cfg) return new Response("Not configured", { status: 503 });
        if (!signature || !timestamp) return new Response("Missing signature", { status: 401 });

        const valid = await verifyWebhookSignature(cfg.secretKey, timestamp, raw, signature);
        if (!valid) return new Response("Invalid signature", { status: 401 });

        let payload: CashfreeLinkWebhook;
        try {
          payload = JSON.parse(raw) as CashfreeLinkWebhook;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        // Cashfree payment-link notifications arrive as PAYMENT_LINK_EVENT; older
        // PAYMENT_SUCCESS order events are still accepted for safety.
        const eventType = payload.type ?? "";
        const isLinkEvent = eventType === "PAYMENT_LINK_EVENT";
        const isOrderSuccess = eventType.startsWith("PAYMENT_SUCCESS");
        if (!isLinkEvent && !isOrderSuccess) return new Response("ok");

        const linkId =
          payload.data?.link_id ??
          payload.data?.link?.link_id ??
          payload.data?.order?.order_tags?.["link_id"] ??
          null;
        if (!linkId) return new Response("ok");

        // Never trust the event name alone — re-read the link from Cashfree.
        const { fetchPaymentLink } = await import("@/lib/billing/cashfree.server");
        let link;
        try {
          link = await fetchPaymentLink(cfg, linkId);
        } catch (e) {
          console.error("Cashfree link lookup failed", e);
          return new Response("Lookup failed", { status: 500 });
        }
        if (link.status !== "PAID") return new Response("ok");

        const { getAdmin, grantSubscription } = await import("@/lib/billing/activate.server");
        const admin = await getAdmin();
        const { data: order } = await admin
          .from("payment_orders")
          .select("user_id, tier, status, amount, currency")
          .eq("link_id", linkId)
          .maybeSingle();
        if (!order) return new Response("ok");
        if (order.status === "paid") return new Response("ok");

        if (order.currency !== "INR" || link.amountPaid + 0.01 < Number(order.amount)) {
          await admin.from("payment_orders").update({ status: "underpaid" }).eq("link_id", linkId);
          return new Response("ok");
        }

        const granted = await grantSubscription(admin, order.user_id, order.tier as Tier);
        if (!granted.ok) return new Response("Activation failed", { status: 500 });
        await admin.from("payment_orders").update({ status: "paid" }).eq("link_id", linkId);
        return new Response("ok");
      },
    },
  },
});
