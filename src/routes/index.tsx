import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe2, LineChart, ShieldCheck } from "lucide-react";

import { Shell } from "@/components/ds/Shell";
import { SearchBar } from "@/components/ds/SearchBar";
import { NewsFeed } from "@/components/ds/NewsFeed";
import { EconomicCalendar } from "@/components/ds/EconomicCalendar";
import { StockTable } from "@/components/ds/StockTable";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { globalNews } from "@/lib/deepscreen/news";
import { analyze } from "@/lib/deepscreen/metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeepScreen — Global Stock Screener & Fundamental Analysis" },
      {
        name: "description",
        content:
          "Screen every listed company across NSE, BSE, NYSE, Nasdaq and LSE with deep fundamental scoring, live market news and an economic calendar.",
      },
      { property: "og:title", content: "DeepScreen — Global Stock Screener & Fundamental Analysis" },
      {
        property: "og:description",
        content:
          "Cap-based screening, 12-factor fundamental scoring, stock-level news and a live economic calendar for India, US and UK markets.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const news = globalNews(10);
  const top = [...STOCKS]
    .map((s) => ({ s, a: analyze(s) }))
    .sort((x, y) => y.a.score - x.a.score)
    .slice(0, 10)
    .map((x) => x.s);

  return (
    <Shell>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">God-mode screening</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Every listed company. Five exchanges. One verdict.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            DeepScreen runs a twelve-factor valuation and quality model — P/E, PEG, P/S, P/B,
            EV/Revenue, EV/EBITDA, ROE, ROA, ROCE, leverage, payout and operating leverage — across
            Indian, US and UK markets, then pairs it with live news and macro events.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar />
          </div>
          <div className="num mt-6 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" /> {EXCHANGES.length} exchanges
            </span>
            <span className="flex items-center gap-2">
              <LineChart className="size-4 text-primary" /> {STOCKS.length} companies scored
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> 12-factor model
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Select an exchange</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXCHANGES.map((e) => {
              const count = STOCKS.filter((s) => s.exchange === e.code).length;
              return (
                <Link
                  key={e.code}
                  to="/exchange/$code"
                  params={{ code: e.code }}
                  className="group rounded-lg border border-border bg-panel p-4 transition-colors hover:border-primary/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="num text-lg font-bold">
                        {e.flag} {e.code}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{e.name}</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="num mt-4 text-xs text-muted-foreground">
                    {count} companies · {e.currency} · {e.timezone}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <EconomicCalendar />
          <NewsFeed items={news} title="Market-moving news" />
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Highest-scoring companies globally
          </h2>
          <StockTable stocks={top} />
        </section>
      </div>
    </Shell>
  );
}
