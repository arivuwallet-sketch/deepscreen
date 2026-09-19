import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { createAdminClient } from "@/integrations/supabase/admin.server";
import { consumeRateLimit, requestClientKey } from "@/lib/security";

const EMAIL_MAX_LENGTH = 254;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Newsletter writes stay server-side so the publishable Supabase key cannot
 * be used by bots to write directly to the table. TanStack's CSRF middleware
 * protects this server function against cross-site browser requests.
 */
export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const email = normalizeEmail(data.email);
    if (!email) return { ok: false, error: "Enter a valid email address." };

    const request = getRequest();
    const key = requestClientKey(request);
    const limit = consumeRateLimit("newsletter:ip:" + key, 3, 60 * 60_000);
    if (!limit.allowed) {
      return { ok: false, error: "Too many signup attempts. Please try again later." };
    }

    const emailLimit = consumeRateLimit("newsletter:email:" + email, 2, 60 * 60_000);
    if (!emailLimit.allowed) {
      return { ok: false, error: "Too many signup attempts. Please try again later." };
    }

    // Avoid storing arbitrary source text: source is deliberately fixed.
    const admin = createAdminClient();
    const { error } = await admin
      .from("newsletter_subscribers")
      .insert({ email, source: "website" });

    if (!error || error.code === "23505") return { ok: true };
    return { ok: false, error: "We could not record your request. Please try again later." };
  });

// Kept as a tiny pure helper for callers/tests that already use this module.
export async function requestNewsletterSubscription(
  email: string,
  insert: (row: { email: string; source: "website" }) => PromiseLike<{ error: { code?: string } | null }>,
): Promise<boolean> {
  try {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;
    const { error } = await insert({ email: normalized, source: "website" });
    return !error || error.code === "23505";
  } catch {
    return false;
  }
}
