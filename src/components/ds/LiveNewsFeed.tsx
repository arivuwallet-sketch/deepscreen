import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";

import { getNewsFeed } from "@/lib/market/market.functions";
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
      {items.map((n, i) => (
        <li
          key={n.id}
          className="animate-fade-in-up px-4 py-3 transition-colors hover:bg-accent/30"
          style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
        >
          <a
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm leading-snug transition-colors hover:text-primary"
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
  const { data, isLoading, isFetching, dataUpdatedAt, refetch } = useQuery({
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
          <span className="size-1.5 animate-pulse rounded-full bg-bull" />
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "LIVE"}
          <button
            onClick={() => void refetch()}
            title="Refresh"
            className="rounded p-0.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
          </button>
        </span>
      </header>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading live headlines…</p>
      ) : (
        <FeedList items={data ?? []} empty="No headlines available right now." />
      )}
    </section>
  );
}
