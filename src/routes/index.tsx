import { HOME_ANSWERS } from "@/lib/discovery/answers";
import { AnswerList } from "@/components/ds/AnswerList";
import { faqNode, ORGANIZATION_ID } from "@/lib/seo/discovery";
import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe2, LineChart, ShieldCheck } from "lucide-react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { GUIDES } from "@/lib/deepscreen/guides";

import { SearchBar } from "@/components/ds/SearchBar";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { EconomicCalendar } from "@/components/ds/EconomicCalendar";
import { StockTable } from "@/components/ds/StockTable";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { NewsletterForm } from "@/components/ds/NewsletterForm";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "DeepScreen — Global Stock Screener & Fundamental Analysis" },
      {
        name: "description",
        content:
          "Screen stocks across NSE, BSE, NYSE, Nasdaq and LSE. Explore company fundamentals, valuation ratios, market news and a transparent scoring methodology.",
      },
      {
        property: "og:title",
        content: "DeepScreen — Global Stock Screener & Fundamental Analysis",
      },
      {
        property: "og:description",
        content:
          "Explore supported Indian, US and UK stocks, available fundamental ratios and a transparent 13-factor methodology.",
      },
      { property: "og:url", content: "https://deepscreen.online/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "DeepScreen — Global Stock Screener & Fundamental Analysis",
      },
      {
        name: "twitter:description",
        content:
          "Research Indian, US and UK stocks with exchange directories, fundamental ratios and valuation guides.",
      },
      {
        name: "keywords",
        content:
          "global stock screener, fundamental analysis, Indian stock screener, US stock screener, UK stock screener, NSE, BSE, NYSE, Nasdaq, LSE",
      },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            faqNode("/", HOME_ANSWERS),
            {
              "@type": "WebApplication",
              "@id": "https://deepscreen.online/#application",
              name: "DeepScreen",
              url: "https://deepscreen.online/",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web browser",
              publisher: { "@id": ORGANIZATION_ID },
              description:
                "Stock screening and fundamental research across supported NSE, BSE, NYSE, Nasdaq and LSE listings.",
            },
          ],
        }),
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
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">
            Research across India, the US and the UK
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Global stock screening across five exchanges.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            DeepScreen is a stock screener and fundamental analysis platform. Its 13-factor
            valuation and quality model covers P/E, PEG, P/S, P/B, EV/Revenue, EV/EBITDA, ROE, ROA,
            ROCE, leverage, payout and operating leverage — across Indian, US and UK markets, then
            pairs it with live news and macro events.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar />
          </div>
          <div className="num mt-6 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" /> {EXCHANGES.length} exchanges
            </span>
            <span className="flex items-center gap-2">
              <LineChart className="size-4 text-primary" /> {STOCKS.length.toLocaleString()}{" "}
              listings in the directory
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
          <AnswerList answers={HOME_ANSWERS} />
          <a href="/answers" className="mt-4 inline-block text-sm text-primary hover:underline">
            More stock screening answers →
          </a>
        </section>
        <section className="rounded-lg border border-border bg-panel p-6 sm:p-8">
          <h2 className="text-lg font-semibold">DeepScreen research updates</h2>
          <p className="mb-4 mt-2 max-w-2xl text-sm text-muted-foreground">
            Get occasional market guides, methodology updates and new screener tools. No trading
            tips or spam.
          </p>
          <a
            href="/research-checklist"
            className="mb-4 inline-block text-sm text-primary hover:underline"
          >
            Start with the free stock research checklist →
          </a>
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
