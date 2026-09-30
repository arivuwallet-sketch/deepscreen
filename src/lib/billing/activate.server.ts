import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export async function getAdmin(): Promise<SupabaseClient<Database>> {
  const { createAdminClient } = await import("@/integrations/supabase/admin.server");
  return createAdminClient();
}

export type ActivationResult =
  | { ok: true; outcome: "activated" | "already_paid"; expiresAt: string | null }
  | { ok: false; error: string };

type ActivationRpcRow = {
  outcome: string;
  user_id: string;
  tier: string;
  expires_at: string | null;
};

/**
 * Atomically marks one verified Cashfree order as paid and grants its plan.
 * The database function locks the order row, so webhook delivery and browser
 * confirmation can race without ever extending the same payment twice.
 */
export async function activatePaidOrder(
  admin: SupabaseClient<Database>,
  orderId: string,
): Promise<ActivationResult> {
  // The checked-in generated Supabase types intentionally lag migrations.
  // Keep this one RPC typed locally until the next schema type regeneration.
  const rpc = admin.rpc as unknown as (
    fn: "activate_paid_order",
    args: { p_link_id: string },
  ) => PromiseLike<{
    data: ActivationRpcRow[] | null;
    error: { message: string } | null;
  }>;

  const { data, error } = await rpc("activate_paid_order", { p_link_id: orderId });
  if (error) return { ok: false, error: error.message };

  const result = Array.isArray(data) ? data[0] : null;
  if (!result) return { ok: false, error: "Payment order could not be activated." };
  if (result.outcome !== "activated" && result.outcome !== "already_paid") {
    return { ok: false, error: `Unexpected activation result: ${result.outcome}` };
  }

  return {
    ok: true,
    outcome: result.outcome,
    expiresAt: result.expires_at ?? null,
  };
}
