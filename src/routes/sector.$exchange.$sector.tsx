import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/ds/Shell";
import { StockTable } from "@/components/ds/StockTable";
import { getExchange } from "@/lib/deepscreen/exchanges";
import { SECTORS, stocksByExchange } from "@/lib/deepscreen/stocks";
import { analyze } from "@/lib/deepscreen/metrics";
import { DIRECTORY_PAGE_SIZE } from "@/lib/seo/directory";
import {
  exchangeKeywords,
  metaKeywords,
  screenerKeywords,
  stocksKeywords,
} from "@/lib/seo/keywords";
const BASE = "https://deepscreen.online";
export const Route = createFileRoute("/sector/$exchange/$sector")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const exchange = getExchange(params.exchange);
    const sector = SECTORS.find(
      (s) => s.toLowerCase().replaceAll(" ", "-") === params.sector.toLowerCase(),
    );
    if (!exchange || !sector) throw notFound();
    const stocks = stocksByExchange(exchange.code)
      .filter((s) => s.sector === sector)
      .sort((a, b) => analyze(b).score - analyze(a).score);
    if (!stocks.length) throw notFound();
    return { exchange, sector, stocks };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { exchange, sector, stocks } = loaderData;
    const url = `${BASE}/sector/${exchange.code}/${sector.toLowerCase().replaceAll(" ", "-")}`;
    const title = `${exchange.code} ${sector} Stocks — Rankings & Ratios | DeepScreen`;
    const description = `Browse ${stocks.length} ${exchange.code} listings in DeepScreen’s ${sector} directory group. Explore company research, ratio explanations and classification limitations.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: metaKeywords(
            [
              `${exchange.code} ${sector} stocks`,
              `best ${sector} stocks`,
              `${sector} stock screener`,
              `${sector} stock comparison`,
            ],
            exchangeKeywords[exchange.code] ?? [],
            stocksKeywords,
            screenerKeywords,
          ),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
              {
                "@type": "ListItem",
                position: 2,
                name: exchange.code,
                item: `${BASE}/exchange/${exchange.code}`,
              },
              { "@type": "ListItem", position: 3, name: sector, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: SectorPage,
});
function SectorPage() {
  const { exchange, sector, stocks } = Route.useLoaderData();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(stocks.length / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * DIRECTORY_PAGE_SIZE;
  const visibleStocks = stocks.slice(start, start + DIRECTORY_PAGE_SIZE);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> {" / "}
          <Link to="/exchange/$code" params={{ code: exchange.code }}>
            {exchange.code}
          </Link>{" "}
          {" / "}
          {sector}
        </nav>
        <h1 className="mt-4 text-3xl font-bold">
          {exchange.code} {sector} stocks
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Browse {stocks.length} {exchange.code} listings grouped under {sector}. Directory sector
          labels can be inferred and initial rankings use modeled inputs. Verify each company’s
          business profile and reported figures before treating it as a sector peer.
        </p>
        <div className="mt-8">
          <StockTable stocks={visibleStocks} />
        </div>
        {pageCount > 1 ? (
          <nav
            className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm"
            aria-label={`${sector} stock pages`}
          >
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="num text-xs text-muted-foreground" aria-live="polite">
              Showing {start + 1}–{Math.min(start + DIRECTORY_PAGE_SIZE, stocks.length)} of {stocks.length}
              {` · Page ${safePage} of ${pageCount}`}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
    </Shell>
  );
}
