import type { LiveFundamentals, LiveQuote } from "./yahoo.server";
import type { ScreenerRatios } from "./screener.server";

export interface StockSnapshot {
  quote: LiveQuote | null;
  fundamentals: LiveFundamentals | null;
  screener: ScreenerRatios | null;
  fetchedAt: number;
  degraded: boolean;
}

export interface SnapshotKey { exchange: string; symbol: string; name?: string }
type Providers = {
  [K in "quote" | "fundamentals" | "screener"]: (
    key: SnapshotKey, signal: AbortSignal,
  ) => Promise<StockSnapshot[K]>;
};

// Stop waiting even if a provider does not honour cancellation. Attach both
// handlers so a rejection after the deadline cannot become unhandled.
function withinBudget<T>(work: () => Promise<T>, signal: AbortSignal): Promise<T | null> {
  return new Promise((resolve) => {
    if (signal.aborted) { resolve(null); return; }
    const aborted = () => resolve(null);
    signal.addEventListener("abort", aborted, { once: true });
    Promise.resolve().then(work).then(
      (value) => { signal.removeEventListener("abort", aborted); resolve(value); },
      () => { signal.removeEventListener("abort", aborted); resolve(null); },
    );
  });
}

/** One bounded provider attempt per stock, shared by concurrent SSR requests. */
export function createSnapshotLoader(providers: Providers, options: {
  budgetMs?: number; ttlMs?: number; retryMs?: number; maxEntries?: number;
  now?: () => number;
} = {}) {
  const { budgetMs = 3000, ttlMs = 180_000, retryMs = 30_000, maxEntries = 500, now = Date.now } = options;
  const cache = new Map<string, { snapshot: StockSnapshot; checkedAt: number }>();
  const pending = new Map<string, Promise<StockSnapshot>>();

  return function load(key: SnapshotKey): Promise<StockSnapshot> {
    const id = `${key.exchange}:${key.symbol}`;
    const cached = cache.get(id);
    if (cached && now() - cached.checkedAt < (cached.snapshot.degraded ? retryMs : ttlMs)) {
      return Promise.resolve(cached.snapshot);
    }
    const existing = pending.get(id);
    if (existing) return existing;

    const request = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), budgetMs);
      const indian = key.exchange === "NSE" || key.exchange === "BSE";
      try {
        const [quote, fundamentals, screener] = await Promise.all([
          withinBudget(() => providers.quote(key, controller.signal), controller.signal),
          withinBudget(() => providers.fundamentals(key, controller.signal), controller.signal),
          indian ? withinBudget(() => providers.screener(key, controller.signal), controller.signal) : null,
        ]);
        const old = cached?.snapshot;
        const usesStale = (!quote && old?.quote) || (!fundamentals && old?.fundamentals) || (indian && !screener && old?.screener);
        const snapshot: StockSnapshot = {
          quote: quote ?? old?.quote ?? null,
          fundamentals: fundamentals ?? old?.fundamentals ?? null,
          screener: screener ?? old?.screener ?? null,
          // Keep stale timestamps honest so the client hooks refresh immediately.
          fetchedAt: usesStale && old ? old.fetchedAt : now(),
          degraded: !quote || !fundamentals || (indian && !screener),
        };
        cache.delete(id);
        if (cache.size >= maxEntries) cache.delete(cache.keys().next().value!);
        cache.set(id, { snapshot, checkedAt: now() });
        return snapshot;
      } finally {
        clearTimeout(timer);
        pending.delete(id);
      }
    })();
    pending.set(id, request);
    return request;
  };
}
