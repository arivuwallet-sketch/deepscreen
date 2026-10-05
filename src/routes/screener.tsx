import { buildFAQSchema, buildGraph, buildWebApplicationSchema, jsonLd } from "@/lib/seo/json-ld";
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
import { StockCategoryScreener } from "@/components/ds/StockCategoryScreener";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { NewsletterForm } from "@/components/ds/NewsletterForm";
import { MarketMovers } from "@/components/ds/MarketMovers";
import { MarketIndexMarquee } from "@/components/ds/MarketIndexMarquee";
import { SCREENER_ANSWERS } from "@/lib/discovery/answers";

export const Route = createFileRoute("/screener")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Stock Screener for NSE, BSE, US & UK Markets | DeepScreen" },
      {
        name: "description",
        content:
          "DeepScreen is a global stock screener and investment research platform for NSE, BSE, NYSE, Nasdaq and LSE, combining fundamental analysis, valuation and market context.",
      },
      { property: "og:title", content: "Stock Screener for NSE, BSE, US & UK Markets | DeepScreen" },
      {
        property: "og:description",
        content:
          "Understand stocks before you trust the numbers: beginner-friendly ratio explanations, trap checks, 13-factor analysis and company research across India, the US and the UK.",
      },
      { property: "og:url", content: "https://deepscreen.online/screener" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Stock Screener for NSE, BSE, US & UK Markets | DeepScreen" },
      {
        name: "twitter:description",
        content:
          "Beginner-first stock research across NSE, BSE, NYSE, Nasdaq and LSE, with ratio explanations, potential-trap checks, fundamental scoring and company research.",
      },
      { name: "keywords", content: metaKeywords(screenerKeywords, stocksKeywords, learnKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/screener" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildWebApplicationSchema({
              name: "DeepScreen Stock Research",
              url: "https://deepscreen.online/screener",
              description:
                "Beginner-first multi-exchange stock research platform that explains financial ratios, highlights potential accounting and valuation traps, and uses a documented 13-factor fundamental model for Indian, US and UK listings.",
              featureList: [
                "13-factor fundamental scoring",
                "Cap-based screening across NSE, BSE, NYSE, Nasdaq and LSE",
                "DCF and Graham intrinsic-value models",
                "Live IPO calendar",
                "Illustrative earnings and dividend planner",
                "Options Greeks and strategy payoffs",
              ],
            }),
            buildFAQSchema(
              SCREENER_ANSWERS.map((answer) => ({
                question: answer.question,
                answer: answer.answer,
              })),
            ),
          ),
        ),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const top = [...STOCKS].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10);
  return (
    <Shell>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">God-mode screening</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Global stock screener and fundamental research
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            DeepScreen is a stock screener for NSE, BSE, NYSE, Nasdaq and LSE listings, with fundamental research for beginners. It explains what ratios mean, highlights potential traps and tells you what to investigate next. Its 13-factor model covers P/E, PEG, P/S, P/B, EV/Revenue, EV/EBITDA, ROE, ROA, ROCE, leverage, payout and operating leverage — across
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
              <LineChart className="size-4 text-primary" /> {STOCKS.length.toLocaleString()} listings in the directory
            </span>
            <span className="flex items-center gap-2">
             <ShieldCheck className="size-4 text-primary" /> 13-factor model
            </span>
          </div>
        </div>
      </section>

      <MarketIndexMarquee />

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
          <LiveNewsFeed
            query="global market news"
            title="Market-moving news"
            limit={36}
            maxAgeHours={24}
            globalMarket
            showCategory
          />
        </div>

        <MarketMovers stocks={STOCKS} title="Live global market movers" />

        <StockCategoryScreener stocks={STOCKS} />

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Explore company research
          </h2>
          <StockTable stocks={top} />
        </section>

        <section aria-labelledby="answers-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="answers-heading" className="text-sm font-semibold uppercase tracking-wide">
                Common questions about DeepScreen
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Canonical answers about the platform, supported markets, methodology, data and research limits.
              </p>
            </div>
            <Link to="/answers" className="text-sm text-primary hover:underline">Browse all stock-market Q&amp;A →</Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {SCREENER_ANSWERS.map((answer) => (
              <article key={answer.id} className="rounded-lg border border-border bg-panel p-4">
                <h3 className="text-sm font-semibold">{answer.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer.answer}</p>
                <a href={answer.href} className="mt-3 inline-block text-xs text-primary hover:underline">{answer.label} →</a>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-panel p-6 sm:p-8">
          <h2 className="text-lg font-semibold">DeepScreen research updates</h2>
          <p className="mb-4 mt-2 max-w-2xl text-sm text-muted-foreground">Get occasional market guides, methodology updates and new screener tools. No trading tips or spam.</p>
          <NewsletterForm />
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
        title="Explore stock research tools and guides"
        intro="Explore market screeners, valuation guides, options tools and economic events."
      />
    </Shell>
  );
}