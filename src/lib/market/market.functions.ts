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
    const y = yahooSymbol(data.exchange, data.symbol);
    const [fundamentals, wiki, news, workplaceNews] = await Promise.all([
      fetchFundamentals(y),
      fetchWikiSummary(data.name),
      fetchFeed(
        googleNewsFeed(`"${data.name}" OR ${data.symbol} stock results order institutional`),
        "Google News",
        "company",
        12,
      ),
      fetchFeed(
        googleNewsFeed(
          `"${data.name}" hiring OR layoffs OR employees OR workplace OR salary OR attrition`,
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

export const getEconomicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveEvent[]> => {
    try {
      const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
        headers: { "User-Agent": "DeepScreen Market Research" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return [];
      const raw = (await res.json()) as {
        title: string;
        country: string;
        date: string;
        impact: string;
        forecast: string;
        previous: string;
        actual?: string;
      }[];
      return raw.map((e, i) => {
        const d = new Date(e.date);
        const impact = e.impact?.toLowerCase();
        return {
          id: `ff-${i}`,
          title: e.title,
          currency: e.country,
          flag: FLAGS[e.country] ?? "🏳️",
          impact: impact === "high" ? "high" : impact === "medium" ? "medium" : "low",
          actual: e.actual || "—",
          forecast: e.forecast || "—",
          previous: e.previous || "—",
          dateIso: d.toISOString(),
          dayKey: d.toISOString().slice(0, 10),
        } satisfies LiveEvent;
      });
    } catch {
      return [];
    }
  },
);

export const getNewsFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { query: string; limit?: number }) => d)
  .handler(async ({ data }): Promise<FeedItem[]> => {
    const { fetchFeed, googleNewsFeed, dedupe } = await import("@/lib/rss.server");
    const items = await fetchFeed(
      googleNewsFeed(data.query),
      "Google News",
      "market",
      data.limit ?? 14,
    );
    return dedupe(items);
  });

export const getCryptoNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeedItem[]> => {
    const { fetchFeed, dedupe } = await import("@/lib/rss.server");
    const [a, b, c] = await Promise.all([
      fetchFeed("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk", "crypto", 10),
      fetchFeed("https://cointelegraph.com/rss", "Cointelegraph", "crypto", 10),
      fetchFeed(
        "https://news.google.com/rss/search?q=bitcoin+OR+ethereum+OR+crypto+market&hl=en-US&gl=US&ceid=US:en",
        "Google News",
        "crypto",
        10,
      ),
    ]);
    return dedupe([...a, ...b, ...c])
      .sort((x, y) => x.minutesAgo - y.minutesAgo)
      .slice(0, 18);
  },
);
