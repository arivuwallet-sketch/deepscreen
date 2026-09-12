export interface FeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  minutesAgo: number;
  category: string;
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (m) return decode(m[1] ?? "");
  const self = block.match(new RegExp(`<${name}[^>]*href="([^"]+)"`, "i"));
  return self ? decode(self[1] ?? "") : "";
}

/** Fetch and parse an RSS or Atom feed. Never throws — returns [] on failure. */
export async function fetchFeed(
  url: string,
  source: string,
  category: string,
  limit = 12,
): Promise<FeedItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        // SEC requires a descriptive UA; harmless elsewhere.
        "User-Agent": "DeepScreen Market Research (contact: research@deepscreen.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/(item|entry)>/gi) ?? [];
    const now = Date.now();
    const items: FeedItem[] = [];
    for (const [i, block] of blocks.slice(0, limit).entries()) {
      const title = tag(block, "title");
      if (!title) continue;
      const link = tag(block, "link");
      const dateStr = tag(block, "pubDate") || tag(block, "updated") || tag(block, "published");
      const ts = dateStr ? Date.parse(dateStr) : NaN;
      items.push({
        id: `${source}-${i}-${title.slice(0, 40)}`,
        title,
        link,
        source: tag(block, "source") || source,
        publishedAt: Number.isFinite(ts) ? new Date(ts).toISOString() : new Date().toISOString(),
        minutesAgo: Number.isFinite(ts) ? Math.max(0, Math.round((now - ts) / 60000)) : 0,
        category,
      });
    }
    return items;
  } catch {
    return [];
  }
}

export function googleNewsFeed(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

/**
 * Independent second source for the same query. Google News RSS is a
 * frequent target of anti-bot rate-limiting against cloud/datacenter IPs
 * (exactly what a server-hosted app calls from) — when that happens the
 * single-source version of this feed goes silently empty. Bing's is a
 * different provider with a different anti-bot posture, so the two rarely
 * fail at the same time.
 */
export function bingNewsFeed(query: string): string {
  return `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
}

interface YahooNewsResult {
  uuid?: string;
  title?: string;
  link?: string;
  publisher?: string;
  providerPublishTime?: number;
}

/** Independent JSON source used when RSS providers block production servers. */
export async function fetchYahooNews(query: string, limit = 12): Promise<FeedItem[]> {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=0&newsCount=${limit}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DeepScreen Market Research)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { news?: YahooNewsResult[] };
    const now = Date.now();
    return (body.news ?? []).flatMap((item, index) => {
      if (!item.title || !item.link) return [];
      const publishedMs = item.providerPublishTime
        ? item.providerPublishTime * 1000
        : now;
      return [{
        id: item.uuid ?? `Yahoo-${index}-${item.title.slice(0, 40)}`,
        title: item.title,
        link: item.link,
        source: item.publisher ?? "Yahoo Finance",
        publishedAt: new Date(publishedMs).toISOString(),
        minutesAgo: Math.max(0, Math.round((now - publishedMs) / 60000)),
        category: "market",
      }];
    });
  } catch (error) {
    console.warn("[news] Yahoo Finance request failed", error);
    return [];
  }
}

export function refreshAges(items: FeedItem[]): FeedItem[] {
  const now = Date.now();
  return items.map((item) => {
    const published = Date.parse(item.publishedAt);
    return {
      ...item,
      minutesAgo: Number.isFinite(published)
        ? Math.max(0, Math.round((now - published) / 60000))
        : item.minutesAgo,
    };
  });
}

export function dedupe(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = i.title.toLowerCase().slice(0, 70);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
