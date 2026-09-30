import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { StockTable } from "@/components/ds/StockTable";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { analyze } from "@/lib/deepscreen/metrics";
import { findRanking } from "@/lib/seo/content";
import {
  exchangeKeywords,
  metaKeywords,
  screenerKeywords,
  stocksKeywords,
} from "@/lib/seo/keywords";
const BASE = "https://deepscreen.online";
export const Route = createFileRoute("/best/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const ranking = findRanking(params.slug);
    if (!ranking) throw notFound();
    return { ranking };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const r = loaderData.ranking;
    const url = `${BASE}/best/${r.slug}`;
    const title = `${r.title} — Model Research Shortlist | DeepScreen`;
    const description = `${r.title}: explore a shortlist ordered by modeled directory inputs, learn the metric limitations and open company research pages to verify available provider data.`;
    return {
      meta: [
        { title: title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: metaKeywords(
            [
              r.title,
              `${r.title} ranking`,
              "best stocks by fundamentals",
              "fundamental stock rankings",
            ],
            r.exchange ? (exchangeKeywords[r.exchange] ?? []) : [],
            stocksKeywords,
            screenerKeywords,
          ),
        },
        { property: "og:title", content: r.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: r.title,
            description,
            url,
          }),
        },
      ],
    };
  },
  component: RankingPage,
});
function RankingPage() {
  const { ranking } = Route.useLoaderData();
  const universe =
    ranking.exchange === "US"
      ? STOCKS.filter((s) => s.exchange === "NYSE" || s.exchange === "NASDAQ")
      : ranking.exchange
        ? STOCKS.filter((s) => s.exchange === ranking.exchange)
        : STOCKS;
  const stocks = [...universe]
    .sort((a, b) =>
      ranking.sort === "score"
        ? analyze(b).score - analyze(a).score
        : ranking.sort === "pe"
          ? a.fundamentals.pe - b.fundamentals.pe
          : b.fundamentals[ranking.sort] - a.fundamentals[ranking.sort],
    )
    .slice(0, 25);
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> {" / "}Best stocks
        </nav>
        <h1 className="mt-4 text-3xl font-bold">{ranking.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {ranking.sort === "score"
            ? "Explore the 13-factor scoring framework through a company research shortlist. Review each input and its source before interpreting the model output."
            : ranking.sort === "roce"
              ? "Use return on capital employed to investigate operating profit relative to capital invested. Compare consistent definitions and several reporting periods."
              : ranking.sort === "pe"
                ? "Use price-to-earnings multiples to investigate valuation. A lower multiple can reflect weak growth, cyclicality or business risk; it does not establish undervaluation."
                : ranking.sort === "dividendYield"
                  ? "Compare dividend yield alongside payout ratios, cash flow and debt. A high yield can result from a falling share price and does not establish dividend safety."
                  : "Investigate earnings growth together with the base period, one-off items and cash conversion. A single growth rate does not establish a durable trend."}
        </p>
        <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <strong>How this shortlist is selected:</strong> Initial selection and ordering use
          DeepScreen’s modeled directory inputs. Provider updates in the table do not make this a
          verified market-wide ranking. Review source availability on each company page.
        </p>
        <div className="mt-8">
          <StockTable stocks={stocks} />
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Selection is model-based; individual table fields may update from available providers.
          This shortlist is not investment advice.
        </p>
      </div>
    </Shell>
  );
}
