export interface FeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  minutesAgo: number;
  category: string;
}

export function safeExternalHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (url.hostname.length > 253) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function readTextWithLimit(response: Response, maxBytes: number): Promise<string | null> {
  const declared = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!response.body) {
    const text = await response.text();
    return new TextEncoder().encode(text).byteLength <= maxBytes ? text : null;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let out = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      out += decoder.decode(value, { stream: true });
    }
    return out + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

const MAX_FEED_BYTES = 1_000_000;
const MAX_TITLE_LENGTH = 500;
const MAX_SOURCE_LENGTH = 160;
const MAX_LINK_LENGTH = 2048;
const ALLOWED_FEED_HOSTS = new Set([
  "news.google.com",
  "www.bing.com",
]);

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
    const feedUrl = safeExternalHttpUrl(url);
    if (!feedUrl) return [];
    const hostname = new URL(feedUrl).hostname.toLowerCase();
    if (!ALLOWED_FEED_HOSTS.has(hostname)) return [];
    const res = await fetch(feedUrl, {
      headers: {
        // SEC requires a descriptive UA; harmless elsewhere.
        "User-Agent": "DeepScreen Market Research (contact: research@deepscreen.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await readTextWithLimit(res, MAX_FEED_BYTES);
    if (xml === null) return [];
    const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/(item|entry)>/gi) ?? [];
    const now = Date.now();
    const items: FeedItem[] = [];
    for (const [i, block] of blocks.slice(0, limit).entries()) {
      const title = tag(block, "title").slice(0, MAX_TITLE_LENGTH);
      if (!title) continue;
      const link = tag(block, "link").slice(0, MAX_LINK_LENGTH);
      const safeLink = safeExternalHttpUrl(link);
      const dateStr = tag(block, "pubDate") || tag(block, "updated") || tag(block, "published");
      const ts = dateStr ? Date.parse(dateStr) : NaN;
      items.push({
        id: `${source}-${i}-${title.slice(0, 40)}`,
        title,
        link: safeLink ?? "",
        source: (tag(block, "source") || source).slice(0, MAX_SOURCE_LENGTH),
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
    const textBody = await readTextWithLimit(res, MAX_FEED_BYTES);
    if (textBody === null) return [];
    const body = JSON.parse(textBody) as { news?: YahooNewsResult[] };
    const now = Date.now();
    return (body.news ?? []).flatMap((item, index) => {
      if (!item.title || !item.link) return [];
      const safeLink = safeExternalHttpUrl(item.link);
      if (!safeLink) return [];
      const publishedMs = item.providerPublishTime
        ? item.providerPublishTime * 1000
        : now;
      return [{
        id: item.uuid ?? `Yahoo-${index}-${item.title.slice(0, 40)}`,
        title: item.title.slice(0, MAX_TITLE_LENGTH),
        link: safeLink,
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
