import { formatAgo } from "@/lib/deepscreen/format";
import type { NewsItem } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

const sentimentClass: Record<NewsItem["sentiment"], string> = {
  bullish: "text-bull",
  bearish: "text-bear",
  neutral: "text-neutralq",
};

const impactClass: Record<NewsItem["impact"], string> = {
  high: "bg-bear/15 text-bear",
  medium: "bg-warn/15 text-warn",
  low: "bg-muted text-muted-foreground",
};

export function NewsFeed({ items, title }: { items: NewsItem[]; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-panel">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
        <span className="num flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-bull" /> LIVE
        </span>
      </header>
      <ul className="divide-y divide-border">
        {items.map((n) => (
          <li key={n.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "num mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  impactClass[n.impact],
                )}
              >
                {n.impact}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug">{n.headline}</p>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {n.source} · {formatAgo(n.minutesAgo)} ·{" "}
                  <span className={sentimentClass[n.sentiment]}>{n.sentiment}</span> · {n.scope}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
