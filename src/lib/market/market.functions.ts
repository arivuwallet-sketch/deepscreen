import { createServerFn } from "@tanstack/react-start";

import type { LiveFundamentals, LiveQuote } from "./yahoo.server";
import type { FeedItem } from "@/lib/rss.server";

export interface LiveEvent {
  id: string;
  title: string;
  currency: string;
  flag: string;
  impact: "high" | "medium" | "low";
  actual: string;
  forecast: string;
  previous: string;
  dateIso: string;
  dayKey: string;
}

export interface CompanyIntel {
  fundamentals: LiveFundamentals | null;
  wiki: string | null;
  news: FeedItem[];
  workplaceNews: FeedItem[];
}

export const getLiveQuote = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string }) => d)
  .handler(async ({ data }): Promise<LiveQuote | null> => {
    const { fetchChartQuote, yahooSymbol } = await import("./yahoo.server");
    return fetchChartQuote(yahooSymbol(data.exchange, data.symbol));
  });

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator((d: { keys: { exchange: string; symbol: string }[] }) => d)
  .handler(async ({ data }): Promise<Record<string, LiveQuote>> => {
    const { fetchChartQuote, yahooSymbol } = await import("./yahoo.server");
    const keys = data.keys.slice(0, 40);
    const out: Record<string, LiveQuote> = {};
    const chunk = 10;
    for (let i = 0; i < keys.length; i += chunk) {
      const part = keys.slice(i, i + chunk);
      const results = await Promise.all(
        part.map((k) => fetchChartQuote(yahooSymbol(k.exchange, k.symbol))),
      );
      part.forEach((k, idx) => {
        const q = results[idx];
        if (q) out[`${k.exchange}:${k.symbol}`] = q;
      });
    }
    return out;
  });

export const getLiveFundamentals = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string }) => d)
  .handler(async ({ data }): Promise<LiveFundamentals | null> => {
    const { fetchFundamentals, yahooSymbol } = await import("./yahoo.server");
    return fetchFundamentals(yahooSymbol(data.exchange, data.symbol));
  });

/**
 * Batched fundamentals for a list of rows (e.g. a visible page of a screener
 * table). Capped and chunked in small groups: unlike the chart-quote endpoint,
 * quoteSummary needs a shared session/crumb and is easy to rate-limit, so we
 * stay gentle rather than firing dozens of requests at once.
 */
export const getLiveFundamentalsBatch = createServerFn({ method: "POST" })
  .inputValidator((d: { keys: { exchange: string; symbol: string }[] }) => d)
  .handler(async ({ data }): Promise<Record<string, LiveFundamentals>> => {
    const { fetchFundamentals, yahooSymbol } = await import("./yahoo.server");
    const keys = data.keys.slice(0, 40);
    const out: Record<string, LiveFundamentals> = {};
    const chunk = 5;
    for (let i = 0; i < keys.length; i += chunk) {
      const part = keys.slice(i, i + chunk);
      const results = await Promise.all(
        part.map((k) => fetchFundamentals(yahooSymbol(k.exchange, k.symbol))),
      );
      part.forEach((k, idx) => {
        const f = results[idx];
        if (f) out[`${k.exchange}:${k.symbol}`] = f;
      });
    }
    return out;
  });

export const getCompanyIntel = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string; name: string }) => d)
  .handler(async ({ data }): Promise<CompanyIntel> => {
    const { fetchFundamentals, fetchWikiSummary, yahooSymbol } = await import("./yahoo.server");
    const { fetchFeed, googleNewsFeed, dedupe } = await import("@/lib/rss.server");
    const { cleanCompanyName } = await import("@/lib/deepscreen/format");
    const y = yahooSymbol(data.exchange, data.symbol);
    const cleanName = cleanCompanyName(data.name);
    const [fundamentals, wiki, news, workplaceNews] = await Promise.all([
      fetchFundamentals(y),
      fetchWikiSummary(data.name),
      fetchFeed(googleNewsFeed(`"${cleanName}" OR "${data.symbol}"`), "Google News", "company", 12),
      fetchFeed(
        googleNewsFeed(
          `"${cleanName}" hiring OR layoffs OR employees OR workplace OR salary OR attrition`,
        ),
        "Google News",
        "workplace",
        8,
      ),
    ]);
    return { fundamentals, wiki, news: dedupe(news), workplaceNews: dedupe(workplaceNews) };
  });

const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  INR: "🇮🇳",
  CNY: "🇨🇳",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  SGD: "🇸🇬",
  HKD: "🇭🇰",
  ALL: "🌐",
};

// ForexFactory rate-limits this exact feed to 2 requests per 5 minutes total
// (documented policy as of Aug 2024); exceeding it doesn't 429 — it silently
// returns an HTML "Request Denied" page in place of JSON. Every browser tab
// polling this server function independently would blow through that budget
// within a couple of minutes. So the fetch result is cached at module scope,
// shared across every incoming request regardless of how many users or tabs
// are asking — only ONE pair of upstream requests goes out per cache window,
// no matter the traffic. If a refresh fails, previously-cached data (even if
// stale) is served rather than surfacing an error, since calendar data
// barely changes minute to minute — an error page over slightly-stale data
// is a worse trade for the user.
const CACHE_TTL_MS = 5 * 60_000 + 30_000; // 5.5 min — under the 2-per-5-min budget with margin
let calendarCache: { data: LiveEvent[]; fetchedAt: number } | null = null;
let inFlight: Promise<LiveEvent[]> | null = null;

async function fetchAndBuildCalendar(): Promise<LiveEvent[]> {
  type RawEvent = {
    title: string;
    country: string;
    date: string;
    impact: string;
    forecast: string;
    previous: string;
    actual?: string;
  };

  const fetchWeek = async (url: string): Promise<RawEvent[] | null> => {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "DeepScreen Market Research" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return null;
      // A rate-limited response is still HTTP 200 but an HTML "Request
      // Denied" page, not JSON — .json() throws on it, caught below.
      return (await res.json()) as RawEvent[];
    } catch {
      return null;
    }
  };

  // "thisweek" alone misses events once the visible 3-day window (today +
  // the next 2 tabs) rolls into next week — which happens for the "Day 3"
  // tab every single week, and for "Tomorrow" too on a Saturday/Sunday.
  const [thisWeek, nextWeek] = await Promise.all([
    fetchWeek("https://nfs.faireconomy.media/ff_calendar_thisweek.json"),
    fetchWeek("https://nfs.faireconomy.media/ff_calendar_nextweek.json"),
  ]);

  if (thisWeek === null && nextWeek === null) {
    throw new Error("Economic calendar feed is currently unavailable.");
  }

  const raw = [...(thisWeek ?? []), ...(nextWeek ?? [])];
  return raw.map((e, i) => {
    const d = new Date(e.date);
    const impact = e.impact?.toLowerCase();
    return {
      id: `ff-${i}-${e.date}-${e.title}`,
      title: e.title,
      currency: e.country,
      flag: FLAGS[e.country] ?? "🏳️",
      impact: impact === "high" ? "high" : impact === "medium" ? "medium" : "low",
      actual: e.actual || "—",
      forecast: e.forecast || "—",
      previous: e.previous || "—",
      dateIso: d.toISOString(),
      // Kept for reference only — NOT used for "today" bucketing on the
      // client, since a UTC calendar day doesn't line up with the viewer's
      // local calendar day (see EconomicCalendar.tsx).
      dayKey: d.toISOString().slice(0, 10),
    } satisfies LiveEvent;
  });
}

export const getEconomicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveEvent[]> => {
    const fresh = calendarCache && Date.now() - calendarCache.fetchedAt < CACHE_TTL_MS;
    if (fresh) return calendarCache!.data;

    // Multiple requests arriving while the cache is cold/stale share a
    // single in-flight upstream fetch instead of each firing their own —
    // otherwise a burst of concurrent page loads would still multiply
    // requests against the rate limit.
    if (!inFlight) {
      inFlight = fetchAndBuildCalendar()
        .then((data) => {
          calendarCache = { data, fetchedAt: Date.now() };
          return data;
        })
        .catch((err: unknown) => {
          if (calendarCache) return calendarCache.data; // serve stale over erroring
          throw err instanceof Error
            ? err
            : new Error("Economic calendar feed is currently unavailable.");
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  },
);

export const getNewsFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { query: string; limit?: number }) => d)
  .handler(async ({ data }): Promise<FeedItem[]> => {
    const { fetchFeed, googleNewsFeed, bingNewsFeed, dedupe } = await import("@/lib/rss.server");
    const limit = data.limit ?? 14;
    // Two independent providers in parallel: if one is rate-limited or down
    // (Google News RSS in particular is a common target for anti-bot blocks
    // against server/cloud IPs), the feed still has the other rather than
    // going silently empty.
    const [google, bing] = await Promise.all([
      fetchFeed(googleNewsFeed(data.query), "Google News", "market", limit),
      fetchFeed(bingNewsFeed(data.query), "Bing News", "market", limit),
    ]);
    return dedupe([...google, ...bing])
      .sort((a, b) => a.minutesAgo - b.minutesAgo)
      .slice(0, limit);
  });




// --- AAA corporate bond yield (feeds the Graham Formula's "Y") -------------

let aaaYieldCache: { value: number; fetchedAt: number } | null = null;
const AAA_CACHE_TTL_MS = 12 * 60 * 60_000; // 12h — this moves slowly; no need to poll often

/**
 * Live Moody's Seasoned Aaa Corporate Bond Yield from FRED's public CSV
 * export (no API key required). Cached for 12h and, on any failure, falls
 * back to a stale cache or a sane hardcoded default rather than blocking the
 * Graham calculator on a single external feed — the same resilience pattern
 * used everywhere else live data feeds this app.
 */
export const getAaaBondYield = createServerFn({ method: "GET" }).handler(
  async (): Promise<number> => {
    if (aaaYieldCache && Date.now() - aaaYieldCache.fetchedAt < AAA_CACHE_TTL_MS) {
      return aaaYieldCache.value;
    }
    try {
      const res = await fetch("https://fred.stlouisfed.org/graph/fredgraph.csv?id=AAA", {
        headers: { "User-Agent": "DeepScreen Market Research" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("bad response");
      const csv = await res.text();
      const lines = csv.trim().split("\n").filter(Boolean);
      // Walk backwards for the most recent non-missing (".") observation.
      for (let i = lines.length - 1; i >= 1; i--) {
        const parts = lines[i]!.split(",");
        const val = Number(parts[1]);
        if (Number.isFinite(val) && val > 0 && val < 20) {
          aaaYieldCache = { value: val, fetchedAt: Date.now() };
          return val;
        }
      }
      throw new Error("no valid observation found");
    } catch {
      return aaaYieldCache?.value ?? 5.0;
    }
  },
);

// Screener.in's summary ratios are the authoritative source for Indian stocks
// (Yahoo's ROE/ROCE/D-E/PEG for NSE/BSE names are frequently wrong or
// missing). Two cache layers sit in front of it: a per-instance memory map for
// the hot path, and the shared `screener_ratios` table so a symbol fetched for
// one visitor is instantly available to everyone else (and survives restarts).
const SCREENER_CACHE_TTL_MS = 5 * 60_000;
// How many uncached symbols one batch round is allowed to resolve upstream,
// and how many of those may be in flight at once. Everything else is served
// from cache this round and warmed on a later refresh.
const SCREENER_WARM_LIMIT = 24;
const SCREENER_WARM_CONCURRENCY = 6;

type Ratios = import("./screener.server").ScreenerRatios;

const screenerCache = new Map<string, { data: Ratios; fetchedAt: number; slug: string | null }>();

const ck = (exchange: string, symbol: string) => `${exchange}:${symbol}`;
const isIndian = (exchange: string) => exchange === "NSE" || exchange === "BSE";

/** Resolve one symbol upstream and persist it to both cache layers. */
async function warmScreener(
  key: { exchange: string; symbol: string; name?: string },
  knownSlug: string | null,
): Promise<Ratios | null> {
  const { fetchScreenerRatios } = await import("./screener.server");
  const ratios = await fetchScreenerRatios(key.symbol, key.name, knownSlug);
  if (!ratios) return null;
  screenerCache.set(ck(key.exchange, key.symbol), {
    data: ratios,
    fetchedAt: Date.now(),
    slug: ratios.resolvedSlug ?? knownSlug ?? null,
  });
  return ratios;
}

export const getScreenerRatios = createServerFn({ method: "GET" })
  .inputValidator((d: { exchange: string; symbol: string; name?: string }) => d)
  .handler(async ({ data }): Promise<Ratios | null> => {
    if (!isIndian(data.exchange)) return null;
    const key = ck(data.exchange, data.symbol);

    const mem = screenerCache.get(key);
    if (mem && Date.now() - mem.fetchedAt < SCREENER_CACHE_TTL_MS) return mem.data;

    const { readScreenerCache, writeScreenerCache } = await import("./screener-cache.server");
    const db = (await readScreenerCache([data])).get(key);
    if (db) {
      screenerCache.set(key, { data: db.data, fetchedAt: db.fetchedAt, slug: db.resolvedSlug });
      if (Date.now() - db.fetchedAt < SCREENER_CACHE_TTL_MS) return db.data;
    }

    const slug = db?.resolvedSlug ?? mem?.slug ?? null;
    const fresh = await warmScreener(data, slug);
    if (fresh) {
      await writeScreenerCache([
        {
          exchange: data.exchange as "NSE" | "BSE",
          symbol: data.symbol,
          resolvedSlug: fresh.resolvedSlug ?? slug,
          data: fresh,
          fetchedAt: Date.now(),
        },
      ]);
      return fresh;
    }
    // Serve stale over nothing — same resilience pattern used elsewhere.
    return db?.data ?? mem?.data ?? null;
  });

/**
 * Batched screener.in ratios for a visible page of Indian rows. Cached symbols
 * (memory, then the shared table) return instantly; a bounded slice of the
 * uncached remainder is resolved upstream in parallel each round and written
 * back so subsequent views — for every user — are served straight from cache.
 */
export const getScreenerRatiosBatch = createServerFn({ method: "POST" })
  .inputValidator((d: { keys: { exchange: string; symbol: string; name?: string }[] }) => d)
  .handler(async ({ data }): Promise<Record<string, Ratios | null>> => {
    const indian = data.keys.filter((k) => isIndian(k.exchange));
    const out: Record<string, Ratios | null> = {};
    if (indian.length === 0) return out;

    const now = () => Date.now();
    const pending: typeof indian = [];

    for (const k of indian) {
      const mem = screenerCache.get(ck(k.exchange, k.symbol));
      if (mem && now() - mem.fetchedAt < SCREENER_CACHE_TTL_MS) {
        out[ck(k.exchange, k.symbol)] = mem.data;
      } else {
        pending.push(k);
      }
    }

    if (pending.length === 0) return out;

    const { readScreenerCache, writeScreenerCache } = await import("./screener-cache.server");
    const db = await readScreenerCache(pending);
    const toWarm: { key: (typeof pending)[number]; slug: string | null }[] = [];

    for (const k of pending) {
      const key = ck(k.exchange, k.symbol);
      const row = db.get(key);
      if (row) {
        screenerCache.set(key, {
          data: row.data,
          fetchedAt: row.fetchedAt,
          slug: row.resolvedSlug,
        });
        out[key] = row.data; // stale-but-real beats a Yahoo fallback
        if (now() - row.fetchedAt < SCREENER_CACHE_TTL_MS) continue;
      } else {
        out[key] = null;
      }
      toWarm.push({ key: k, slug: row?.resolvedSlug ?? null });
    }

    const queue = toWarm.slice(0, SCREENER_WARM_LIMIT);
    const written: import("./screener-cache.server").CachedScreenerRatio[] = [];
    let cursor = 0;

    await Promise.all(
      Array.from({ length: Math.min(SCREENER_WARM_CONCURRENCY, queue.length) }, async () => {
        while (cursor < queue.length) {
          const job = queue[cursor++]!;
          const ratios = await warmScreener(job.key, job.slug);
          if (!ratios) continue;
          const key = ck(job.key.exchange, job.key.symbol);
          out[key] = ratios;
          written.push({
            exchange: job.key.exchange as "NSE" | "BSE",
            symbol: job.key.symbol,
            resolvedSlug: ratios.resolvedSlug ?? job.slug,
            data: ratios,
            fetchedAt: Date.now(),
          });
        }
      }),
    );

    await writeScreenerCache(written);
    return out;
  });

/** Full live IPO pipeline across NSE, BSE, NYSE and NASDAQ. */
export const getLiveIpos = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchLiveIpos } = await import("./ipo.server");
  return fetchLiveIpos();
});
