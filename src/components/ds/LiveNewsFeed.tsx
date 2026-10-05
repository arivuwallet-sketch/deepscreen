import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getNewsFeed } from "@/lib/market/market.functions";
import type { FeedItem } from "@/lib/rss.server";
import { cn } from "@/lib/utils";

function impactClasses(level: FeedItem["impactLevel"]): string {
  if (level === "high") return "border-bear/35 bg-bear/10 text-bear";
  if (level === "medium") return "border-warn/35 bg-warn/10 text-warn";
  return "border-primary/25 bg-primary/5 text-primary";
}

function ago(min: number): string {
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 1440)}d ago`;
}

export function FeedList({
  items,
  empty,
  showCategory = false,
  scrollable = false,
}: {
  items: FeedItem[];
  empty: string;
  showCategory?: boolean;
  scrollable?: boolean;
}) {
  if (items.length === 0) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className={cn("divide-y divide-border", scrollable && "max-h-[720px] overflow-y-auto")}>
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
          <div className="num mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {showCategory && n.category && n.category !== "market" ? (
              <span className="rounded border border-primary/20 px-1.5 py-0.5 text-[9px] tracking-wide text-primary">
                {n.category}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide",
                impactClasses(n.impactLevel),
              )}
              title="Estimated impact from the headline and topic; not a guaranteed market reaction or trading signal."
            >
              EST. IMPACT {(n.impactLevel ?? "low").toUpperCase()}
            </span>
            <span>{n.source} · {ago(n.minutesAgo)}</span>
          </div>
          <div className="num mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="text-[9px] tracking-wide">AFFECTS:</span>
            {(n.affectedMarkets?.length ? n.affectedMarkets : ["Global Equities"]).map((market) => (
              <span
                key={market}
                className="rounded border border-border/80 bg-background/30 px-1.5 py-0.5 text-[9px] text-foreground/80"
              >
                {market}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LiveNewsFeed({
  query,
  title,
  limit = 12,
  maxAgeHours,
  globalMarket = false,
  showCategory = false,
  scrollable = false,
  className,
}: {
  query: string;
  title: string;
  limit?: number;
  maxAgeHours?: number;
  globalMarket?: boolean;
  showCategory?: boolean;
  scrollable?: boolean;
  className?: string;
}) {
  const fetchNews = useServerFn(getNewsFeed);
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["news-feed", query, limit, maxAgeHours ?? null, globalMarket],
    queryFn: () => fetchNews({ data: { query, limit, maxAgeHours, globalMarket } }),
    refetchInterval: 30_000,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const now = Date.now();
  const items = maxAgeHours === undefined
    ? data?.items ?? []
    : (data?.items ?? []).filter((item) => {
        const published = Date.parse(item.publishedAt);
        return Number.isFinite(published) && published <= now + 10 * 60_000 && published >= now - maxAgeHours * 60 * 60_000;
      });

  const newest = items[0];
  const checkedAt = new Date(data?.fetchedAt ?? dataUpdatedAt ?? Date.now()).toLocaleTimeString();

  return (
    <section className={cn("rounded-lg border border-border bg-panel", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
        <span
          className="num flex items-center gap-1.5 text-xs text-muted-foreground"
          title={dataUpdatedAt ? "Feed checked " + checkedAt : undefined}
        >
          <span className={cn("size-1.5 rounded-full", data?.stale || !items.length ? "bg-warn" : "animate-pulse bg-bull")} />
          {data?.stale
            ? newest
              ? "LAST GOOD · " + ago(newest.minutesAgo)
              : "LAST GOOD"
            : newest
              ? "LATEST · " + ago(newest.minutesAgo)
              : dataUpdatedAt
                ? "NO FRESH NEWS"
                : "UPDATING"}
        </span>
      </header>
      {isLoading ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading live headlines…</p>
      ) : (
        <FeedList
          items={items}
          showCategory={showCategory}
          scrollable={scrollable}
          empty={
            maxAgeHours === undefined
              ? "No headlines available right now."
              : `No verified publication times within the last ${maxAgeHours} hours.`
          }
        />
      )}
    </section>
  );
}

