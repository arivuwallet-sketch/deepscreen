import { createFileRoute } from "@tanstack/react-router";

import type { Tier } from "@/hooks/useSubscription";

interface CashfreeOrderWebhook {
  type?: string;
  data?: {
    order?: { order_id?: string } | null;
    payment?: { payment_status?: string } | null;
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

        let payload: CashfreeOrderWebhook;
        try {
          payload = JSON.parse(raw) as CashfreeOrderWebhook;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const orderId = payload.data?.order?.order_id ?? null;
        if (!orderId) return new Response("ok");

        // Never trust the event name — re-read the order from Cashfree.
        const { fetchOrder } = await import("@/lib/billing/cashfree.server");
        let remote;
        try {
          remote = await fetchOrder(cfg, orderId);
        } catch (e) {
          console.error("Cashfree order lookup failed", e);
          return new Response("Lookup failed", { status: 500 });
        }
        if (remote.status !== "PAID") return new Response("ok");

        const { getAdmin, grantSubscription } = await import("@/lib/billing/activate.server");
        const admin = await getAdmin();
        const { data: order } = await admin
          .from("payment_orders")
          .select("user_id, tier, status, amount, currency")
          .eq("link_id", orderId)
          .maybeSingle();
        if (!order) return new Response("ok");
        if (order.status === "paid") return new Response("ok");

        if (
          order.currency !== "INR" ||
          remote.currency !== "INR" ||
          remote.amount + 0.01 < Number(order.amount)
        ) {
          await admin.from("payment_orders").update({ status: "underpaid" }).eq("link_id", orderId);
          return new Response("ok");
        }

        const granted = await grantSubscription(admin, order.user_id, order.tier as Tier);
        if (!granted.ok) return new Response("Activation failed", { status: 500 });
        await admin.from("payment_orders").update({ status: "paid" }).eq("link_id", orderId);
        return new Response("ok");
      },
    },
  },
});
