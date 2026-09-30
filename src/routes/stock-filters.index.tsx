import { createFileRoute, Link } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { StockFilterDirectory } from "@/components/ds/StockFilterDirectory";
import { STOCK_FILTER_PRESETS } from "@/lib/deepscreen/stock-filter-presets";
import { jsonLd } from "@/lib/seo/json-ld";
import { metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";

const BASE = "https://deepscreen.online";
const URL = `${BASE}/stock-filters`;

export const Route = createFileRoute("/stock-filters/")({
  staticData: { sitemap: true },
  head: () => {
    const title = "Stock Filters & Screener Categories | DeepScreen";
    const description = `Browse ${STOCK_FILTER_PRESETS.length.toLocaleString()} live stock-screening categories across value, growth, income, quality, momentum, valuation, dividends, financial strength, market-cap, sectors and indices.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: metaKeywords(
            [
              "stock filters",
              "stock screener filters",
              "stock screener categories",
              "value stocks filter",
              "growth stocks filter",
              "dividend stocks filter",
              "quality stocks filter",
              "momentum stocks filter",
              "fundamental stock filters",
            ],
            screenerKeywords,
            stocksKeywords,
          ),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: URL },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "DeepScreen Stock Filters",
            description,
            url: URL,
            numberOfItems: STOCK_FILTER_PRESETS.length,
          }),
        },
      ],
    };
  },
  component: StockFiltersIndexPage,
});

function StockFiltersIndexPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> {" / "} Stock filters
        </nav>

        <header className="mt-5 max-w-4xl">
          <p className="num text-xs uppercase tracking-[0.2em] text-primary">DeepScreen filter library</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Stock filters and screener categories
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explore {STOCK_FILTER_PRESETS.length.toLocaleString()} dedicated, data-backed stock-filter
            pages for value, growth, income, quality, momentum, valuation, financial strength,
            dividends, market-cap, indices, sectors and more. Each category has a stable shareable URL.
          </p>
          <p className="mt-3 rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            <strong>Every published filter has a working classification rule.</strong>{" "}
            Categories that require unavailable ownership, technical, historical, event or other
            unsupported data are not included in the public filter catalog.
          </p>
        </header>

        <div className="mt-8">
          <StockFilterDirectory />
        </div>
      </div>
    </Shell>
  );
}
