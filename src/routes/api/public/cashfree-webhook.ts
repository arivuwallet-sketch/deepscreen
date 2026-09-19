import { createFileRoute } from "@tanstack/react-router";

import { consumeRateLimit, isFreshWebhookTimestamp, isValidOrderId, requestClientKey, WEBHOOK_MAX_BODY_BYTES } from "@/lib/security";

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
        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(contentLength) && contentLength > WEBHOOK_MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        const raw = await request.text();
        if (new TextEncoder().encode(raw).byteLength > WEBHOOK_MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        const signature = request.headers.get("x-webhook-signature");
        const timestamp = request.headers.get("x-webhook-timestamp");
        if (!signature || !timestamp) return new Response("Missing signature", { status: 401 });
        if (!isFreshWebhookTimestamp(timestamp)) return new Response("Stale webhook", { status: 401 });

        const rate = consumeRateLimit(
          "cashfree:webhook:" + requestClientKey(request),
          30,
          60_000,
        );
        if (!rate.allowed) {
          return new Response("Too many webhook requests", {
            status: 429,
            headers: { "Retry-After": String(rate.retryAfterSeconds) },
          });
        }

        const { getCashfreeConfig, verifyWebhookSignature } = await import(
          "@/lib/billing/cashfree.server"
        );
        const cfg = getCashfreeConfig();
        if (!cfg) return new Response("Not configured", { status: 503 });

        const valid = await verifyWebhookSignature(cfg.secretKey, timestamp, raw, signature);
        if (!valid) return new Response("Invalid signature", { status: 401 });

        let payload: CashfreeOrderWebhook;
        try {
          payload = JSON.parse(raw) as CashfreeOrderWebhook;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const orderId = payload.data?.order?.order_id ?? null;
        if (!orderId || !isValidOrderId(orderId)) return new Response("ok");

        // Never trust the event name — re-read the order from Cashfree.
        const { fetchOrder } = await import("@/lib/billing/cashfree.server");
        let remote;
        try {
          remote = await fetchOrder(cfg, orderId);
        } catch (e) {
          console.error("Cashfree order lookup failed", e);
          return new Response("Lookup failed", { status: 500 });
        }
        if (remote.orderId !== orderId) return new Response("ok");
        if (remote.status !== "PAID") return new Response("ok");

        const { getAdmin, activatePaymentOrder } = await import("@/lib/billing/activate.server");
        const admin = await getAdmin();
        const { data: order, error: orderError } = await admin
          .from("payment_orders")
          .select("user_id, tier, status, amount, currency")
          .eq("link_id", orderId)
          .maybeSingle();
        if (orderError) {
          console.error("[cashfree-webhook] order lookup failed", orderError);
          return new Response("Lookup failed", { status: 500 });
        }
        if (!order) return new Response("ok");
        if (order.status === "paid") return new Response("ok");

        const remoteAmountCents = Math.round(remote.amount * 100);
        const localAmountCents = Math.round(Number(order.amount) * 100);
        if (
          order.currency !== "INR" ||
          remote.currency !== "INR" ||
          !Number.isFinite(remoteAmountCents) ||
          remoteAmountCents < localAmountCents
        ) {
          await admin.from("payment_orders").update({ status: "underpaid" }).eq("link_id", orderId).eq("status", "created");
          return new Response("ok");
        }

        const activated = await activatePaymentOrder(admin, orderId);
        if (!activated.ok) {
          console.error("[cashfree-webhook] activation rejected", activated.error);
          return new Response("Activation failed", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
