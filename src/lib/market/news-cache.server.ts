import type { FeedItem } from "@/lib/rss.server";

export interface CachedNewsFeed {
  items: FeedItem[];
  fetchedAt: number;
}

function isFeedItem(value: unknown): value is FeedItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FeedItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.link === "string" &&
    typeof item.source === "string" &&
    typeof item.publishedAt === "string" &&
    typeof item.category === "string"
  );
}

export async function readNewsCache(queryKey: string): Promise<CachedNewsFeed | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("news_feed_cache")
      .select("items,fetched_at")
      .eq("query_key", queryKey)
      .maybeSingle();
    if (error) throw error;
    if (!data || !Array.isArray(data.items)) return null;
    const items = data.items.filter(isFeedItem);
    if (items.length === 0) return null;
    return { items, fetchedAt: new Date(data.fetched_at).getTime() };
  } catch (error) {
    console.error("[news-cache] read failed", error);
    return null;
  }
}

export async function writeNewsCache(
  queryKey: string,
  items: FeedItem[],
  fetchedAt: number,
): Promise<void> {
  if (items.length === 0) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("news_feed_cache").upsert(
      {
        query_key: queryKey,
        items: items as unknown as import("@/integrations/supabase/types").Json,
        fetched_at: new Date(fetchedAt).toISOString(),
      },
      { onConflict: "query_key" },
    );
    if (error) throw error;
  } catch (error) {
    console.error("[news-cache] write failed", error);
  }
}