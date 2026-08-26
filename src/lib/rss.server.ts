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
export async function fetchFeed(url: string, source: string, category: string, limit = 12): Promise<FeedItem[]> {
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

export function dedupe(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = i.title.toLowerCase().slice(0, 70);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
