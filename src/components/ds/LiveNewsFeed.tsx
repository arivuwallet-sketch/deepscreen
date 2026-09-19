import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getNewsFeed, getYahooNewsFeed } from "@/lib/market/market.functions";
import type { FeedItem } from "@/lib/rss.server";
import { cn } from "@/lib/utils";

function ago(min: number): string {
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 1440)}d ago`;
}

export function FeedList({ items, empty }: { items: FeedItem[]; empty: string }) {
  if (items.length === 0) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((n) => (
        <li key={n.id} className="px-4 py-3">
          <a
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm leading-snug hover:text-primary"
          >
            {n.title}
          </a>
          <p className="num mt-1 text-xs text-muted-foreground">
            {n.source} · {ago(n.minutesAgo)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function LiveNewsFeed({
  query,
  title,
  limit = 12,
  className,
}: {
  query: string;
  title: string;
  limit?: number;
  className?: string;
}) {
  const fetchNews = useServerFn(getNewsFeed);
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["news-feed", query, limit],
    queryFn: () => fetchNews({ data: { query, limit } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  return (
    <section className={cn("rounded-lg border border-border bg-panel", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
        <span className="num flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", data?.stale ? "bg-warn" : "animate-pulse bg-bull")} />
          {data?.stale
            ? `LAST GOOD · ${new Date(data.fetchedAt).toLocaleTimeString()}`
            : dataUpdatedAt
              ? new Date(data?.fetchedAt ?? dataUpdatedAt).toLocaleTimeString()
              : "LIVE"}
        </span>
      </header>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading live headlines…</p>
      ) : (
        <FeedList items={data?.items ?? []} empty="No headlines available right now." />
      )}
    </section>
  );
}

export function YahooNewsFeed({
  query,
  title = "Yahoo Finance News",
  limit = 10,
  className,
}: {
  query: string;
  title?: string;
  limit?: number;
  className?: string;
}) {
  const fetchNews = useServerFn(getYahooNewsFeed);
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["yahoo-news-feed", query, limit],
    queryFn: () => fetchNews({ data: { query, limit } }),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  return (
    <section className={cn("rounded-lg border border-border bg-panel", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Yahoo Finance search feed · external publisher links
          </p>
        </div>
        <span className="num text-xs text-muted-foreground">
          {data?.stale
            ? "UNAVAILABLE"
            : data?.fetchedAt
              ? new Date(data.fetchedAt).toLocaleTimeString()
              : dataUpdatedAt
                ? new Date(dataUpdatedAt).toLocaleTimeString()
                : "LIVE"}
        </span>
      </header>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading Yahoo Finance headlines…</p>
      ) : (
        <FeedList items={data?.items ?? []} empty="No Yahoo Finance headlines available right now." />
      )}
    </section>
  );
}
