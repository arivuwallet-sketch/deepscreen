export type SubscriptionEntitlement = {
  status: string;
  expires_at: string;
};

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

export function subscriptionExpiryDelay(expiresAt: string, nowMs = Date.now()): number {
  const expiresMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresMs)) return 0;
  return Math.max(0, expiresMs - nowMs);
}

// Browsers clamp very large setTimeout values. Annual plans need to be
// re-armed in chunks until the exact expiry instant is reached.
export const MAX_EXPIRY_TIMER_MS = 2_000_000_000;
