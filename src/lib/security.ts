export const PUBLIC_APP_ORIGIN = "https://deepscreen.online";

export const WEBHOOK_MAX_BODY_BYTES = 256 * 1024;
export const WEBHOOK_CLOCK_SKEW_MS = 5 * 60_000;

type RateBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateBucket>();
const MAX_BUCKETS = 10_000;

function pruneBuckets(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (!oldest) break;
    buckets.delete(oldest);
  }
}

/**
 * Process-local limiter. It is deliberately an additional control rather than
 * the only abuse barrier because horizontally scaled/serverless deployments
 * do not share memory between instances.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { allowed: boolean; retryAfterSeconds: number } {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    pruneBuckets(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function requestClientKey(request: Request): string {
  // Prefer infrastructure-populated headers. Never treat this value as an
  // authentication credential; it is only an abuse/rate-limit partition key.
  const raw =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return raw.replace(/[^\x21-\x7e]/g, "").slice(0, 128) || "unknown";
}

export function isValidOrderId(orderId: string): boolean {
  return /^ds_(weekly|monthly|annual)_[a-f0-9]{8}_\d{13}(?:_[a-f0-9]{8})?$/.test(orderId);
}

export function isFreshWebhookTimestamp(
  timestamp: string,
  now = Date.now(),
  maxSkewMs = WEBHOOK_CLOCK_SKEW_MS,
): boolean {
  if (!/^\d{10,13}$/.test(timestamp)) return false;
  const raw = Number(timestamp);
  if (!Number.isFinite(raw)) return false;
  const timestampMs = timestamp.length === 10 ? raw * 1000 : raw;
  return Math.abs(now - timestampMs) <= maxSkewMs;
}

export function isAllowedScreenerPath(pathname: string): boolean {
  return /^\/company\/[A-Za-z0-9._-]+(?:\/consolidated\/)?$/.test(pathname);
}

export function normalizeSymbol(value: string, max = 32): string | null {
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return null;
  if (!/^[A-Za-z0-9._&'()\- ]+$/.test(normalized)) return null;
  return normalized;
}

export function normalizeCompanyName(value: string, max = 160): string | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > max) return null;
  if (/[\u0000-\u001f\u007f]/.test(normalized)) return null;
  return normalized;
}
