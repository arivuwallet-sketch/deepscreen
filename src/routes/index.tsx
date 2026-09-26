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
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { NewsletterForm } from "@/components/ds/NewsletterForm";
import { MarketMovers } from "@/components/ds/MarketMovers";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "DeepScreen — Beginner Stock Research & Fundamental Analysis" },
      {
        name: "description",
        content:
          "Beginner-first stock research across NSE, BSE, NYSE, Nasdaq and LSE. DeepScreen explains ratios, highlights potential traps and combines fundamental analysis with market context.",
      },
      { property: "og:title", content: "DeepScreen — Beginner Stock Research & Fundamental Analysis" },
      {
        property: "og:description",
        content:
          "Understand stocks before you trust the numbers: beginner-friendly ratio explanations, trap checks, 13-factor analysis and company research across India, the US and the UK.",
      },
      { property: "og:url", content: "https://deepscreen.online/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DeepScreen — Beginner Stock Research & Fundamental Analysis" },
      {
        name: "twitter:description",
        content:
          "Beginner-first stock research across NSE, BSE, NYSE, Nasdaq and LSE, with ratio explanations, potential-trap checks, fundamental scoring and company research.",
      },
      { name: "keywords", content: metaKeywords(screenerKeywords, stocksKeywords, learnKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildWebApplicationSchema({
              name: "DeepScreen Stock Research",
              url: "https://deepscreen.online/",
              description:
                "Beginner-first multi-exchange stock research platform that explains financial ratios, highlights potential accounting and valuation traps, and uses a documented 13-factor fundamental model for Indian, US and UK listings.",
              featureList: [
                "13-factor fundamental scoring",
                "Cap-based screening across NSE, BSE, NYSE, Nasdaq and LSE",
                "DCF and Graham intrinsic-value models",
                "Live IPO calendar",
                "Earnings and dividend calendar",
                "Options Greeks and strategy payoffs",
              ],
            }),
            buildFAQSchema([
              {
                question: "What is DeepScreen?",
                answer:
                  "DeepScreen is a stock screener that scores listed companies on NSE, BSE, NYSE, Nasdaq and LSE using a 13-factor valuation and quality model.",
              },
              {
                question: "Which markets does DeepScreen cover?",
                answer:
                  "Indian markets through the NSE and BSE, US markets through the NYSE and Nasdaq, and UK markets through the LSE.",
              },
              {
                question: "Can I use DeepScreen for free?",
                answer:
                  "Yes. Search, raw fundamental ratios, the IPO pipeline, news and the economic calendar are free. The full verdict, valuation models and alerts are part of Pro.",
              },
              {
                question: "Is DeepScreen investment advice?",
                answer:
                  "No. DeepScreen publishes analytical model output for research and education only, not personalized investment advice.",
              },
            ]),
          ),
        ),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const top = [...STOCKS].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10);
  const liveMoverUniverse = EXCHANGES.flatMap((exchange) =>
    STOCKS
      .filter((stock) => stock.exchange === exchange.code)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 20),
  );

  return (
    <Shell>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">God-mode screening</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Understand stocks before you trust the numbers.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            DeepScreen is a beginner-first stock research and fundamental-analysis platform. It explains what ratios mean, highlights potential traps and tells you what to investigate next. Its 13-factor model covers P/E, PEG, P/S, P/B, EV/Revenue, EV/EBITDA, ROE, ROA, ROCE, leverage, payout and operating leverage — across
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

        <MarketMovers stocks={liveMoverUniverse} title="Live global market movers" />

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Explore company research
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
                 exchanges — NSE, BSE, NYSE, Nasdaq and LSE — using a 13-factor valuation and
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
