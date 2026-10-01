export type SubscriptionEntitlement = {
  status: string;
  expires_at: string;
};

export type PaidSubscriptionOrder = {
  tier: string;
  status: string;
  created_at: string;
  paid_at?: string | null;
  entitlement_expires_at?: string | null;
};

export type PaidOrderEntitlement = SubscriptionEntitlement & {
  tier: "weekly" | "monthly" | "annual";
};

const PLAN_DAYS: Record<PaidOrderEntitlement["tier"], number> = {
  weekly: 7,
  monthly: 30,
  annual: 365,
};

function isPaidTier(tier: string): tier is PaidOrderEntitlement["tier"] {
  return tier === "weekly" || tier === "monthly" || tier === "annual";
}

/**
 * Entitlements are active only before their exact expiry instant.
 * Equality is expired: if now === expires_at, paid access is locked.
 */
export function isSubscriptionActive(
  row: SubscriptionEntitlement | null | undefined,
  nowMs = Date.now(),
): boolean {
  if (!row || row.status !== "active") return false;
  const expiresMs = Date.parse(row.expires_at);
  return Number.isFinite(expiresMs) && expiresMs > nowMs;
}

/** True when the account has at least one real paid Cashfree order. */
export function hasPaidOrderHistory(orders: PaidSubscriptionOrder[] | null | undefined): boolean {
  return Boolean(
    orders?.some(
      (order) =>
        order.status.toLowerCase() === "paid" &&
        isPaidTier(order.tier) &&
        Number.isFinite(Date.parse(order.created_at)),
    ),
  );
}

/**
 * Resolve access from the latest paid order. Every plan ends relative to that
 * purchase's payment timestamp; earlier orders never stack extra time onto it.
 */
export function entitlementFromPaidOrders(
  orders: PaidSubscriptionOrder[] | null | undefined,
  nowMs = Date.now(),
): PaidOrderEntitlement | null {
  const paid = (orders ?? [])
    .filter(
      (order): order is PaidSubscriptionOrder & { tier: PaidOrderEntitlement["tier"] } =>
        order.status.toLowerCase() === "paid" &&
        isPaidTier(order.tier) &&
        Number.isFinite(Date.parse(order.created_at)),
    )
    .slice()
    .sort((a, b) => {
      const aTime = Date.parse(a.paid_at ?? a.created_at);
      const bTime = Date.parse(b.paid_at ?? b.created_at);
      return bTime - aTime;
    });

  if (paid.length === 0) return null;
  const latest = paid[0];
  if (!latest) return null;
  const recordedExpiry = latest.entitlement_expires_at
    ? Date.parse(latest.entitlement_expires_at)
    : Number.NaN;
  const purchasedMs = Date.parse(latest.paid_at ?? latest.created_at);
  const expiresMs = Number.isFinite(recordedExpiry)
    ? recordedExpiry
    : purchasedMs + PLAN_DAYS[latest.tier] * 86_400_000;

  if (expiresMs <= nowMs) return null;

  return {
    tier: latest.tier,
    status: "active",
    expires_at: new Date(expiresMs).toISOString(),
  };
}

export function subscriptionExpiryDelay(expiresAt: string, nowMs = Date.now()): number {
  const expiresMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresMs)) return 0;
  return Math.max(0, expiresMs - nowMs);
}

// Browsers clamp very large setTimeout values. Annual plans need to be
// re-armed in chunks until the exact expiry instant is reached.
export const MAX_EXPIRY_TIMER_MS = 2_000_000_000;
