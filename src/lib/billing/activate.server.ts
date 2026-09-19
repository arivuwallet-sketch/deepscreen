import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export async function getAdmin(): Promise<SupabaseClient<Database>> {
  const { createAdminClient } = await import("@/integrations/supabase/admin.server");
  return createAdminClient();
}

/**
 * Atomically activates a locally recorded payment order. The database
 * function locks the order row and subscription row so repeated Cashfree
 * webhook deliveries or browser confirmations cannot extend the same payment
 * more than once.
 */
export async function activatePaymentOrder(
  admin: SupabaseClient<Database>,
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!/^ds_(weekly|monthly|annual)_[a-f0-9]{8}_\d{13}(?:_[a-f0-9]{8})?$/.test(orderId)) {
    return { ok: false, error: "Invalid order." };
  }

  const { data, error } = await admin.rpc("activate_payment_order", {
    p_link_id: orderId,
  });

  if (error) {
    console.error("[payment] atomic activation failed", error);
    return { ok: false, error: "Could not activate the payment." };
  }
  if (data !== true) {
    return { ok: false, error: "Payment order is not eligible for activation." };
  }
  return { ok: true };
}
