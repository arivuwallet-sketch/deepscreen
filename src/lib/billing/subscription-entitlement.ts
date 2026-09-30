export type SubscriptionEntitlement = {
  status: string;
  expires_at: string;
};

export type PaidSubscriptionOrder = {
  tier: string;
  status: string;
  created_at: string;
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
 * Reconstruct the paid entitlement from immutable payment-order history.
 *
 * This deliberately does not trust subscriptions.expires_at when paid orders
 * exist. Older checkout code could process the same Cashfree order twice when
 * webhook and browser confirmation raced, which could over-extend that row.
 * Every distinct payment_orders row is unique by link_id, so each real paid
 * purchase contributes its duration exactly once here.
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
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  if (paid.length === 0) return null;

  let expiresMs = 0;
  let latestTier: PaidOrderEntitlement["tier"] = paid[0].tier;

  for (const order of paid) {
    const orderMs = Date.parse(order.created_at);
    const baseMs = Math.max(expiresMs, orderMs);
    expiresMs = baseMs + PLAN_DAYS[order.tier] * 86_400_000;
    latestTier = order.tier;
  }

  if (expiresMs <= nowMs) return null;

  return {
    tier: latestTier,
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
