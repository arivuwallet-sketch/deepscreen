import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Coins } from "lucide-react";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { calendarKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { useWatchlist } from "@/hooks/useWatchlist";
import { eventsFor, type CorporateEvent } from "@/lib/deepscreen/events";
import { formatPrice } from "@/lib/deepscreen/format";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Earnings & Dividend Calendar Planner | DeepScreen" },
      {
        name: "description",
        content:
          "Explore an illustrative earnings and dividend planner for your watchlist. Learn which event dates and figures to verify in official company announcements.",
      },
      { property: "og:title", content: "Earnings & Dividend Calendar Planner | DeepScreen" },
      {
        property: "og:description",
        content: "Explore an illustrative earnings and dividend planner for your watchlist. Learn which event dates and figures to verify in official company announcements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/calendar" },
      { name: "twitter:title", content: "Earnings & Dividend Calendar Planner | DeepScreen" },
      { name: "twitter:description", content: "Explore an illustrative earnings and dividend planner for your watchlist. Learn which event dates and figures to verify in official company announcements." },
      { name: "keywords", content: metaKeywords(calendarKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/calendar" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
            { "@type": "ListItem", position: 2, name: "Earnings & dividend calendar", item: "https://deepscreen.online/calendar" },
          ],
        }),
      },
    ],
  }),
  component: CalendarPage,
});

type Filter = "all" | "earnings" | "dividend";

function CalendarPage() {
  const { stocks, signedIn } = useWatchlist();
  const [filter, setFilter] = useState<Filter>("all");

  const universe = stocks.length ? stocks : STOCKS.slice(0, 40);
  const events = useMemo(
    () => eventsFor(universe).filter((e) => e.daysAway >= 0 && e.daysAway <= 120),
    [universe],
  );
  const shown = events.filter((e) => filter === "all" || e.kind === filter);

  const buckets: Array<[string, CorporateEvent[]]> = [
    ["This week", shown.filter((e) => e.daysAway <= 7)],
    ["Next 30 days", shown.filter((e) => e.daysAway > 7 && e.daysAway <= 30)],
    ["Later", shown.filter((e) => e.daysAway > 30)],
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Earnings & dividend calendar planner</h1>
        <p className="mt-4 rounded-lg border border-warn/40 bg-warn/5 p-4 text-sm"><strong>Illustrative schedule.</strong> Dates, EPS estimates and dividend amounts on this board are generated model examples, not confirmed company announcements. Verify earnings dates, ex-dividend dates and payouts with the company or exchange before using them.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {stocks.length
            ? `Illustrative events for the ${stocks.length} stocks on your watchlist.`
            : signedIn
              ? "Your watchlist is empty — showing the example default board."
              : "Showing the example default board. Sign in and star stocks to personalise it."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {(["all", "earnings", "dividend"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded border border-border px-3 py-1.5 capitalize transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-8">
          {buckets.map(([label, list]) => (
            <section key={label}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {label} <span className="num">({list.length})</span>
              </h2>
              {list.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {list.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded",
                          e.kind === "earnings" ? "bg-primary/15 text-primary" : "bg-bull/15 text-bull",
                        )}
                      >
                        {e.kind === "earnings" ? (
                          <CalendarDays className="size-4" />
                        ) : (
                          <Coins className="size-4" />
                        )}
                      </span>
                      <div className="min-w-40 flex-1">
                        <Link
                          to="/stock/$exchange/$symbol"
                          params={{ exchange: e.exchange, symbol: e.symbol }}
                          className="text-sm font-semibold hover:text-primary"
                        >
                          {e.symbol}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">{e.name}</div>
                      </div>
                      <div className="num text-xs text-muted-foreground">
                        {e.date} · in {e.daysAway}d
                      </div>
                      <div className="num min-w-48 text-right text-xs">
                        {e.kind === "earnings" ? (
                          <>
                            {e.quarter} · est EPS {e.estimatedEps?.toFixed(2)} vs {e.priorEps?.toFixed(2)}
                          </>
                        ) : (
                          <>
                            Ex {e.exDate} · pay {e.payDate} ·{" "}
                            {formatPrice(e.amountPerShare ?? 0, e.exchange)}/sh ({e.yieldPct?.toFixed(2)}%)
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
      <TopicIndex ids={["calendar"]} title={"Earnings, dividend and market calendar topics"} />
    </Shell>
  );
}
