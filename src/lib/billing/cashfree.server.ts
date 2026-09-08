/**
 * Cashfree Payment Gateway helpers (server-only).
 *
 * Uses hosted Payment Links (PG API 2023-08-01) so no client SDK is needed and
 * both Indian (UPI / netbanking / RuPay) and international card payments are
 * handled by Cashfree's hosted page.
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
  const env = (process.env["CASHFREE_ENV"] ?? "sandbox").toLowerCase();
  const base = env === "production" || env === "live"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
  return { appId, secretKey, base };
}

function headers(cfg: CashfreeConfig): Record<string, string> {
  return {
    "x-client-id": cfg.appId,
    "x-client-secret": cfg.secretKey,
    "x-api-version": "2023-08-01",
    "content-type": "application/json",
  };
}

export interface CreatedLink {
  linkId: string;
  linkUrl: string;
}

export async function createPaymentLink(
  cfg: CashfreeConfig,
  input: {
    linkId: string;
    amount: number;
    currency: string;
    purpose: string;
    customerId: string;
    email: string;
    phone: string;
    returnUrl: string;
    notes: Record<string, string>;
    expiryMinutes?: number;
  },
): Promise<CreatedLink> {
  const expiry = new Date(Date.now() + (input.expiryMinutes ?? 30) * 60_000);
  const res = await fetch(`${cfg.base}/links`, {
    method: "POST",
    headers: headers(cfg),
    body: JSON.stringify({
      link_id: input.linkId,
      link_amount: input.amount,
      link_currency: input.currency,
      link_purpose: input.purpose,
      link_partial_payments: false,
      link_expiry_time: expiry.toISOString(),
      customer_details: {
        customer_id: input.customerId,
        customer_email: input.email,
        customer_phone: input.phone,
      },
      link_meta: {
        return_url: input.returnUrl,
        notify_url: input.notes["notifyUrl"] ?? undefined,
      },
      link_notes: input.notes,
      link_notify: { send_email: false, send_sms: false },
    }),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof json["message"] === "string" ? json["message"] : `Cashfree error ${res.status}`;
    throw new Error(message);
  }
  return { linkId: String(json["link_id"]), linkUrl: String(json["link_url"]) };
}

export interface LinkStatus {
  linkId: string;
  status: string; // PAID | ACTIVE | EXPIRED | CANCELLED
  amountPaid: number;
  notes: Record<string, string>;
}

export async function fetchPaymentLink(cfg: CashfreeConfig, linkId: string): Promise<LinkStatus> {
  const res = await fetch(`${cfg.base}/links/${encodeURIComponent(linkId)}`, {
    headers: headers(cfg),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof json["message"] === "string" ? json["message"] : `Cashfree error ${res.status}`;
    throw new Error(message);
  }
  return {
    linkId: String(json["link_id"]),
    status: String(json["link_status"] ?? "UNKNOWN"),
    amountPaid: Number(json["link_amount_paid"] ?? 0),
    notes: (json["link_notes"] as Record<string, string> | undefined) ?? {},
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
