import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Tier } from "@/hooks/useSubscription";

export async function getAdmin(): Promise<SupabaseClient<Database>> {
  const { createAdminClient } = await import("@/integrations/supabase/admin.server");
  return createAdminClient();
}

/** Grants (or extends) a paid plan. Only ever called after a verified payment. */
export async function grantSubscription(
  admin: SupabaseClient<Database>,
  userId: string,
  tier: Tier,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) return { ok: false, error: "Unknown plan." };

  const { data: existing } = await admin
    .from("subscriptions")
    .select("expires_at, status")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date();
  const base =
    existing && existing.status === "active" && new Date(existing.expires_at) > now
      ? new Date(existing.expires_at)
      : now;
  const expiresAt = new Date(base.getTime() + plan.days * 86_400_000);

  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    tier: plan.tier,
    status: "active",
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
