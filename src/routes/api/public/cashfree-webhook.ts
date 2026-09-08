import { createFileRoute } from "@tanstack/react-router";

import type { Tier } from "@/hooks/useSubscription";

export const Route = createFileRoute("/api/public/cashfree-webhook")({
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

        let payload: {
          type?: string;
          data?: { order?: { order_tags?: Record<string, string> } | null; link?: { link_id?: string } };
        };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        if (!payload.type || !payload.type.startsWith("PAYMENT_SUCCESS")) {
          return new Response("ok");
        }

        const linkId =
          payload.data?.link?.link_id ?? payload.data?.order?.order_tags?.["link_id"] ?? null;
        if (!linkId) return new Response("ok");

        const { getAdmin, grantSubscription } = await import("@/lib/billing/activate.server");
        const admin = await getAdmin();
        const { data: order } = await admin
          .from("payment_orders")
          .select("user_id, tier, status")
          .eq("link_id", linkId)
          .maybeSingle();
        if (!order || order.status === "paid") return new Response("ok");

        const granted = await grantSubscription(admin, order.user_id, order.tier as Tier);
        if (!granted.ok) return new Response("Activation failed", { status: 500 });
        await admin.from("payment_orders").update({ status: "paid" }).eq("link_id", linkId);
        return new Response("ok");
      },
    },
  },
});
