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
    const keys = data.keys.slice(0, 100);
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
    const keys = data.keys.slice(0, 100);
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
// The primary source is now TradingView's public economic-calendar endpoint,
// which — unlike ForexFactory's weekly JSON/XML feed — publishes the ACTUAL
// released figure alongside forecast and previous. FF stays as a fallback for
// when TV is unreachable, but FF alone can never fill the "Actual" column.
// A short 60s cache keeps releases appearing within a minute of publication
// while still collapsing every visitor onto one upstream request.
const CACHE_TTL_MS = 30_000;
const FF_FALLBACK_CACHE_TTL_MS = 5 * 60_000;
let calendarCache: { data: LiveEvent[]; fetchedAt: number } | null = null;
let forexFactoryCache: { data: LiveEvent[]; fetchedAt: number } | null = null;
let inFlight: Promise<LiveEvent[]> | null = null;
let forexFactoryInFlight: Promise<LiveEvent[]> | null = null;

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: "USD",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  GB: "GBP",
  JP: "JPY",
  IN: "INR",
  CN: "CNY",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  CH: "CHF",
  SG: "SGD",
  HK: "HKD",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  EU: "🇪🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  GB: "🇬🇧",
  JP: "🇯🇵",
  IN: "🇮🇳",
  CN: "🇨🇳",
  AU: "🇦🇺",
  NZ: "🇳🇿",
  CA: "🇨🇦",
  CH: "🇨🇭",
  SG: "🇸🇬",
  HK: "🇭🇰",
  BR: "🇧🇷",
  KR: "🇰🇷",
  MX: "🇲🇽",
  ZA: "🇿🇦",
  RU: "🇷🇺",
  TR: "🇹🇷",
};

/** Renders a TradingView numeric release with its unit/scale, e.g. 2.5% or $1.2B. */
function formatEventValue(
  value: number | string | null | undefined,
  unit: string | null | undefined,
  scale: string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "—";

  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) {
    return String(value).trim() || "—";
  }

  const n =
    Math.abs(numeric) >= 1000
      ? numeric.toLocaleString("en-US")
      : String(Number(numeric.toFixed(2)));
  const tail = `${n}${scale ?? ""}`;
  if (!unit) return tail;
  if (unit === "%") return `${tail}%`;
  return /^[$€¥£]$/.test(unit) ? `${unit}${tail}` : `${tail} ${unit}`;
}

interface TvEvent {
  id: string;
  title: string;
  country: string;
  currency?: string | null;
  period?: string | null;
  importance: number;
  date: string;
  unit?: string | null;
  scale?: string | null;
  actual?: number | string | null;
  forecast?: number | string | null;
  previous?: number | string | null;
}

/** TradingView economic calendar — the only free source here that carries actuals. */
async function fetchTradingViewCalendar(): Promise<LiveEvent[] | null> {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 2);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 9);

  const url =
    `https://economic-calendar.tradingview.com/events?from=${from.toISOString()}&to=${to.toISOString()}` +
    `&countries=US,EU,DE,FR,IT,ES,GB,JP,IN,CN,AU,NZ,CA,CH,HK,SG,BR,KR,MX,ZA,TR`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DeepScreen Market Research)",
        Origin: "https://www.tradingview.com",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { status?: string; result?: TvEvent[] };
    const rows = json.result;
    if (!Array.isArray(rows) || rows.length === 0) return null;

    return rows.map((e) => {
      const d = new Date(e.date);
      const currency = e.currency || CURRENCY_BY_COUNTRY[e.country] || e.country;
      return {
        id: `tv-${e.id}`,
        title: e.period ? `${e.title} (${e.period})` : e.title,
        currency,
        flag: COUNTRY_FLAGS[e.country] ?? FLAGS[currency] ?? "🏳️",
        impact: e.importance >= 1 ? "high" : e.importance === 0 ? "medium" : "low",
        actual: formatEventValue(e.actual, e.unit, e.scale),
        forecast: formatEventValue(e.forecast, e.unit, e.scale),
        previous: formatEventValue(e.previous, e.unit, e.scale),
        dateIso: d.toISOString(),
        dayKey: d.toISOString().slice(0, 10),
      } satisfies LiveEvent;
    });
  } catch {
    return null;
  }
}

function normalizeEventTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, "and")
    .replace(/\byoy\b/g, "y/y")
    .replace(/\byear over year\b/g, "y/y")
    .replace(/\byear\/year\b/g, "y/y")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isMissingValue(value: string): boolean {
  return !value || value.trim() === "—" || value.trim() === "-" || value.trim().toLowerCase() === "null";
}

function needsActualFallback(event: LiveEvent): boolean {
  return (
    isMissingValue(event.actual) &&
    new Date(event.dateIso).getTime() <= Date.now() + 10 * 60_000
  );
}

function mergeCalendarActuals(tv: LiveEvent[], fallback: LiveEvent[]): LiveEvent[] {
  if (fallback.length === 0) return tv;

  const fallbackRows = fallback.filter((e) => !isMissingValue(e.actual));
  return tv.map((event) => {
    if (!needsActualFallback(event)) return event;

    const eventTs = Date.parse(event.dateIso);
    const title = normalizeEventTitle(event.title);

    let best: LiveEvent | null = null;
    let bestDiff = Number.POSITIVE_INFINITY;

    for (const candidate of fallbackRows) {
      if (candidate.currency !== event.currency) continue;
      if (normalizeEventTitle(candidate.title) !== title) continue;

      const diff = Math.abs(Date.parse(candidate.dateIso) - eventTs);
      if (diff <= 45 * 60_000 && diff < bestDiff) {
        best = candidate;
        bestDiff = diff;
      }
    }

    if (!best) return event;
    return {
      ...event,
      actual: best.actual,
      forecast: isMissingValue(event.forecast) ? best.forecast : event.forecast,
      previous: isMissingValue(event.previous) ? best.previous : event.previous,
    };
  });
}

async function getCachedForexFactoryCalendar(): Promise<LiveEvent[]> {
  const fresh =
    forexFactoryCache &&
    Date.now() - forexFactoryCache.fetchedAt < FF_FALLBACK_CACHE_TTL_MS;
  if (fresh) return forexFactoryCache!.data;

  if (!forexFactoryInFlight) {
    forexFactoryInFlight = fetchForexFactoryCalendar()
      .then((data) => {
        forexFactoryCache = { data, fetchedAt: Date.now() };
        return data;
      })
      .catch(() => forexFactoryCache?.data ?? [])
      .finally(() => {
        forexFactoryInFlight = null;
      });
  }

  return forexFactoryInFlight;
}

async function fetchAndBuildCalendar(): Promise<LiveEvent[]> {
  const tv = await fetchTradingViewCalendar();

  if (tv && tv.length > 0) {
    const needsFallback = tv.some(needsActualFallback);
    if (needsFallback) {
      const fallback = await getCachedForexFactoryCalendar();
      return mergeCalendarActuals(tv, fallback);
    }
    return tv;
  }

  return getCachedForexFactoryCalendar();
}

async function fetchForexFactoryCalendar(): Promise<LiveEvent[]> {
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

export interface LiveNewsResult {
  items: FeedItem[];
  fetchedAt: number;
  stale: boolean;
  providerCount: number;
}

const NEWS_CACHE_TTL_MS = 2 * 60_000;
const newsMemoryCache = new Map<string, { data: LiveNewsResult; fetchedAt: number }>();
const newsInFlight = new Map<string, Promise<LiveNewsResult>>();

function newsKey(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 240);
}

// Never surface stale cached/provider headlines as "latest" news. A provider
// can legally return old stories for thinly-covered companies, so publication
// time is validated independently of the cache fetch time.
const MAX_NEWS_AGE_MS = 30 * 24 * 60 * 60_000;

function filterRecentNews(items: FeedItem[]): FeedItem[] {
  const cutoff = Date.now() - MAX_NEWS_AGE_MS;
  return items.filter((item) => {
    const published = Date.parse(item.publishedAt);
    return Number.isFinite(published) && published >= cutoff && published <= Date.now() + 10 * 60_000;
  });
}

/**
 * Build conservative fallback searches for company queries.
 * Google/Bing/Yahoo can all interpret quoted OR queries differently, and some
 * tickers with punctuation are especially easy to miss. We only split queries
 * that contain two quoted terms (the stock page's "company" OR "ticker" form).
 * Never broadens arbitrary workplace/general-news queries.
 */
function newsQueryVariants(query: string): string[] {
  const safe = query.trim().replace(/\s+/g, " ").slice(0, 240);
  if (!safe) return [];

  // Google News understands the "when:" freshness operator. Put a fresh
  // search first so active companies return current stories instead of an
  // old but highly-ranked evergreen result.
  const fresh = safe.includes("when:") ? safe : `${safe} when:30d`;
  const variants = [fresh, safe];
  const quoted = [...safe.matchAll(/"([^"]+)"/g)]
    .map((match) => match[1]?.trim())
    .filter((term): term is string => Boolean(term))
    .slice(0, 3);

  if (quoted.length >= 2) {
    variants.push(...quoted);
    const relaxed = safe.replace(/"/g, "").replace(/\s+\bOR\b\s+/gi, " ").trim();
    if (relaxed) variants.push(relaxed);
  }

  return [...new Set(variants)].slice(0, 4);
}

export const getNewsFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { query: string; limit?: number }) => d)
  .handler(async ({ data }): Promise<LiveNewsResult> => {
    const { dedupe, refreshAges } = await import("@/lib/rss.server");
    const limit = Math.min(Math.max(data.limit ?? 14, 1), 30);
    const key = newsKey(data.query);
    if (!key) return { items: [], fetchedAt: Date.now(), stale: false, providerCount: 0 };

    const memory = newsMemoryCache.get(key);
    if (memory && Date.now() - memory.fetchedAt < NEWS_CACHE_TTL_MS) {
      return { ...memory.data, items: refreshAges(memory.data.items) };
    }

    const existing = newsInFlight.get(key);
    if (existing) return existing;

    const requestPromise = (async (): Promise<LiveNewsResult> => {
      const { fetchFeed, fetchYahooNews, googleNewsFeed, bingNewsFeed } = await import("@/lib/rss.server");
      const { readNewsCache, writeNewsCache } = await import("./news-cache.server");
      const persisted = await readNewsCache(key);
      if (persisted && Date.now() - persisted.fetchedAt < NEWS_CACHE_TTL_MS) {
        const recentPersisted = filterRecentNews(refreshAges(persisted.items));
        const result = {
          items: recentPersisted.slice(0, limit),
          fetchedAt: persisted.fetchedAt,
          stale: false,
          providerCount: 0,
        };
        newsMemoryCache.set(key, { data: result, fetchedAt: Date.now() });
        return result;
      }

      const queries = newsQueryVariants(data.query);
      const allItems = [];
      const providerNames = new Set<string>();

      const fetchVariant = async (query: string) => {
        const [google, bing, yahoo] = await Promise.all([
          fetchFeed(googleNewsFeed(query), "Google News", "market", limit),
          fetchFeed(bingNewsFeed(query), "Bing News", "market", limit),
          fetchYahooNews(query, limit),
        ]);
        if (google.length > 0) providerNames.add("Google News");
        if (bing.length > 0) providerNames.add("Bing News");
        if (yahoo.length > 0) providerNames.add("Yahoo Finance");
        return [...google, ...bing, ...yahoo];
      };

      // Try the exact query first. Only when every provider is empty do we
      // fan out to conservative company-name/ticker fallbacks. This keeps the
      // normal path fast while making provider-specific misses much harder.
      const exactItems = queries.length > 0 ? await fetchVariant(queries[0]!) : [];
      allItems.push(...exactItems);

      if (exactItems.length === 0 && queries.length > 1) {
        const fallbackItems = await Promise.all(queries.slice(1).map(fetchVariant));
        fallbackItems.forEach((items) => allItems.push(...items));
      }

      const items = filterRecentNews(dedupe(allItems))
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
        .slice(0, limit);

      if (items.length > 0) {
        const fetchedAt = Date.now();
        const result = {
          items: refreshAges(items),
          fetchedAt,
          stale: false,
          providerCount: providerNames.size,
        };
        newsMemoryCache.set(key, { data: result, fetchedAt });
        await writeNewsCache(key, items, fetchedAt);
        return result;
      }

      if (persisted) {
        const recentPersisted = filterRecentNews(refreshAges(persisted.items)).slice(0, limit);
        if (recentPersisted.length > 0) {
          console.warn(`[news] providers empty for ${key}; serving recent last-good cache`);
          const result = {
            items: recentPersisted,
            fetchedAt: persisted.fetchedAt,
            stale: true,
            providerCount: 0,
          };
          newsMemoryCache.set(key, { data: result, fetchedAt: Date.now() });
          return result;
        }
      }

      console.error(`[news] providers empty and no cache exists for ${key}`);
      return { items: [], fetchedAt: Date.now(), stale: true, providerCount: 0 };
    })().finally(() => newsInFlight.delete(key));

    newsInFlight.set(key, requestPromise);
    return requestPromise;
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
    fetchedAt: Date.now(),    slug: ratios.resolvedSlug ?? knownSlug ?? null,
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

/** Live IPO pipeline across NSE, BSE, NYSE, NASDAQ and LSE. */
export const getLiveIpos = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchLiveIpos } = await import("./ipo.server");
  return fetchLiveIpos();
});