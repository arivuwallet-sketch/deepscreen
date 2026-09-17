/**
 * Cashfree Payment Gateway helpers (server-only).
 *
 * Uses the standard Orders API (PG API 2023-08-01). The server creates an
 * order, the browser opens Cashfree's gateway checkout with the returned
 * payment_session_id, and the server re-reads the order before granting Pro.
 */

export interface CashfreeConfig {
  appId: string;
  secretKey: string;
  base: string;
}

export function getCashfreeConfig(): CashfreeConfig | null {
  const appId = process.env["CASHFREE_APP_ID"];
  const secretKey = process.env["CASHFREE_SECRET_KEY"];
  if (!appId || !secretKey) return null;
  return { appId, secretKey, base: "https://api.cashfree.com/pg" };
}

function headers(cfg: CashfreeConfig): Record<string, string> {
  return {
    "x-client-id": cfg.appId,
    "x-client-secret": cfg.secretKey,
    "x-api-version": "2023-08-01",
    "content-type": "application/json",
  };
}

export interface CreatedOrder {
  orderId: string;
  paymentSessionId: string;
}

export async function createOrder(
  cfg: CashfreeConfig,
  input: {
    orderId: string;
    amount: number;
    currency: string;
    note: string;
    customerId: string;
    email: string;
    phone: string;
    returnUrl: string;
    notifyUrl: string;
    tags: Record<string, string>;
    expiryMinutes?: number;
  },
): Promise<CreatedOrder> {
  const expiry = new Date(Date.now() + (input.expiryMinutes ?? 30) * 60_000);
  const res = await fetch(`${cfg.base}/orders`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency,
      order_note: input.note,
      order_expiry_time: expiry.toISOString(),
      customer_details: {
        customer_id: input.customerId,
        customer_email: input.email,
        customer_phone: input.phone,
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
      order_tags: input.tags,
    }),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof json["message"] === "string" ? json["message"] : `Cashfree error ${res.status}`;
    throw new Error(message);
  }
  const sessionId = json["payment_session_id"];
  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("Cashfree did not return a checkout session.");
  }
  return { orderId: String(json["order_id"] ?? input.orderId), paymentSessionId: sessionId };
}

export interface OrderStatus {
  orderId: string;
  status: string; // PAID | ACTIVE | EXPIRED | TERMINATED
  amount: number;
  currency: string;
  tags: Record<string, string>;
}

export async function fetchOrder(cfg: CashfreeConfig, orderId: string): Promise<OrderStatus> {
  const res = await fetch(`${cfg.base}/orders/${encodeURIComponent(orderId)}`, {
    headers: headers(cfg),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof json["message"] === "string" ? json["message"] : `Cashfree error ${res.status}`;
    throw new Error(message);
  }
  return {
    orderId: String(json["order_id"] ?? orderId),
    status: String(json["order_status"] ?? "UNKNOWN"),
    amount: Number(json["order_amount"] ?? 0),
    currency: String(json["order_currency"] ?? ""),
    tags: (json["order_tags"] as Record<string, string> | undefined) ?? {},
  };
}

/** Cashfree webhook signature: base64(HMAC-SHA256(timestamp + rawBody, secretKey)). */
export async function verifyWebhookSignature(
  secretKey: string,
  timestamp: string,
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(timestamp + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
