import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe2, LineChart, ShieldCheck } from "lucide-react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { GUIDES } from "@/lib/deepscreen/guides";
import { learnKeywords, metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";
import { SearchBar } from "@/components/ds/SearchBar";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { EconomicCalendar } from "@/components/ds/EconomicCalendar";
import { StockTable } from "@/components/ds/StockTable";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { analyze } from "@/lib/deepscreen/metrics";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
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
      { property: "og:url", content: "https://deepscreen.online/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DeepScreen — Global Stock Screener & Fundamental Analysis" },
      {
        name: "twitter:description",
        content:
          "Screen NSE, BSE, NYSE, Nasdaq and LSE listings with 12-factor fundamental scoring, live news and an economic calendar.",
      },
      { name: "keywords", content: metaKeywords(screenerKeywords, stocksKeywords, learnKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "DeepScreen",
          url: "https://deepscreen.online/",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web browser",
          description:
            "Multi-exchange stock screener with a twelve-factor fundamental model for Indian, US and UK listings.",
          featureList: [
            "Twelve-factor fundamental scoring",
            "Cap-based screening across NSE, BSE, NYSE, Nasdaq and LSE",
            "DCF and Graham intrinsic-value models",
            "Live IPO calendar",
            "Earnings and dividend calendar",
            "Options Greeks and strategy payoffs",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
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
              <LineChart className="size-4 text-primary" /> {STOCKS.length.toLocaleString()} companies scored
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
          <LiveNewsFeed query="stock market" title="Market-moving news" limit={12} />
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Highest-scoring companies globally
          </h2>
          <StockTable stocks={top} />
        </section>

        <section aria-labelledby="answers-heading">
          <h2 id="answers-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Common questions about DeepScreen
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-panel p-4">
              <h3 className="text-sm font-semibold">What is DeepScreen?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                DeepScreen is a stock screener that scores listed companies on {EXCHANGES.length}{" "}
                exchanges — NSE, BSE, NYSE, Nasdaq and LSE — using a twelve-factor valuation and
                quality model covering P/E, PEG, P/S, P/B, EV/Revenue, EV/EBITDA, ROE, ROA, ROCE,
                leverage, payout and operating leverage.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-panel p-4">
              <h3 className="text-sm font-semibold">Which markets does it cover?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Indian markets through the{" "}
                <Link to="/exchange/$code" params={{ code: "NSE" }} className="text-primary hover:underline">
                  NSE
                </Link>{" "}
                and{" "}
                <Link to="/exchange/$code" params={{ code: "BSE" }} className="text-primary hover:underline">
                  BSE
                </Link>
                , US markets through the{" "}
                <Link to="/exchange/$code" params={{ code: "NYSE" }} className="text-primary hover:underline">
                  NYSE
                </Link>{" "}
                and{" "}
                <Link to="/exchange/$code" params={{ code: "NASDAQ" }} className="text-primary hover:underline">
                  Nasdaq
                </Link>
                , and UK markets through the{" "}
                <Link to="/exchange/$code" params={{ code: "LSE" }} className="text-primary hover:underline">
                  LSE
                </Link>
                .
              </p>
            </div>
            <div className="rounded-lg border border-border bg-panel p-4">
              <h3 className="text-sm font-semibold">Can I use it free?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes. Search, raw fundamental ratios, the IPO pipeline, news and the economic calendar
                are free. The full verdict, valuation models and alerts are part of Pro — see{" "}
                <Link to="/pricing" className="text-primary hover:underline">
                  pricing
                </Link>
                .
              </p>
            </div>
            <div className="rounded-lg border border-border bg-panel p-4">
              <h3 className="text-sm font-semibold">Is this investment advice?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No. DeepScreen publishes analytical model output for research and education only, not
                investment advice. Questions? Reach the team on the{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
      <section aria-labelledby="guides" className="mt-14 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 id="guides" className="text-lg font-semibold tracking-tight text-foreground">
            Market guides and answers
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Plain-English explainers on screening, valuation, charts, IPOs, options and portfolio
            construction across Indian, US and UK markets.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/learn/$slug"
                  params={{ slug: g.slug }}
                  className="block rounded-lg border border-border bg-card/40 px-4 py-3 text-sm text-primary transition-colors hover:bg-accent"
                >
                  {g.h1}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/learn"
            className="mt-6 inline-block text-xs font-medium text-primary hover:underline"
          >
            Browse all guides
          </Link>
        </div>
      </section>
      <TopicIndex
        title="Every stock-market topic DeepScreen covers"
        intro="Browse the search topics DeepScreen answers, from screening filters and stock fundamentals to IPOs, options, dividends and market-by-market coverage."
      />
    </Shell>
  );
}
