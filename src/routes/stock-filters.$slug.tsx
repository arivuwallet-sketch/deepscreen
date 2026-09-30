import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { StockTable } from "@/components/ds/StockTable";
import { STOCKS } from "@/lib/deepscreen/stocks";
import {
  STOCK_FILTER_PRESETS,
  filterStocksByPreset,
  findStockFilterPreset,
} from "@/lib/deepscreen/stock-filter-presets";
import { jsonLd } from "@/lib/seo/json-ld";
import { metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";

const BASE = "https://deepscreen.online";
const INITIAL_LIMIT = 200;

export const Route = createFileRoute("/stock-filters/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const preset = findStockFilterPreset(params.slug);
    if (!preset) throw notFound();
    return {
      preset: {
        id: preset.id,
        label: preset.label,
        group: preset.group,
        status: preset.status,
        description: preset.description,
        missingData: preset.missingData ?? null,
      },
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const preset = loaderData.preset;
    const url = `${BASE}/stock-filters/${preset.id}`;
    const live = preset.status === "available";
    const title = `${preset.label} — Stock Filter | DeepScreen`;
    const description = live
      ? `${preset.label}: screen DeepScreen's NSE, BSE, NYSE, Nasdaq and LSE directory using a transparent data-backed rule. Review matching companies and verify provider-backed figures on each stock page.`
      : `${preset.label}: DeepScreen documents this filter category and the additional verified data required before companies can be classified reliably.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(!live ? [{ name: "robots", content: "noindex,follow" }] : []),
        {
          name: "keywords",
          content: metaKeywords(
            [
              preset.label,
              `${preset.label} screener`,
              `${preset.label} filter`,
              `${preset.label} list`,
              "stock screener filters",
            ],
            stocksKeywords,
            screenerKeywords,
          ),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: live
        ? [
            {
              type: "application/ld+json",
              children: jsonLd({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: preset.label,
                description,
                url,
                isPartOf: { "@type": "WebSite", name: "DeepScreen", url: BASE },
              }),
            },
          ]
        : [],
    };
  },
  component: StockFilterPage,
});

function StockFilterPage() {
  const { preset: loaded } = Route.useLoaderData();
  const preset = findStockFilterPreset(loaded.id);
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  if (!preset) return null;

  const matches = useMemo(() => {
    if (preset.status !== "available") return [];
    return filterStocksByPreset(STOCKS, preset).sort(
      (a, b) =>
        b.marketCap - a.marketCap ||
        a.name.localeCompare(b.name) ||
        a.symbol.localeCompare(b.symbol),
    );
  }, [preset]);

  const related = STOCK_FILTER_PRESETS.filter(
    (item) => item.id !== preset.id && item.group === preset.group,
  ).slice(0, 12);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> {" / "}
          <Link to="/stock-filters">Stock filters</Link> {" / "}
          {preset.label}
        </nav>

        <header className="mt-5 max-w-4xl">
          <p className="num text-xs uppercase tracking-[0.2em] text-primary">{preset.group}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{preset.label}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {preset.description}
          </p>
        </header>

        {preset.status === "available" ? (
          <>
            <section className="mt-6 rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground">
              <p>
                <strong>Filter status:</strong> Live and data-backed from DeepScreen's existing
                directory fields. {matches.length.toLocaleString()} of {STOCKS.length.toLocaleString()}{" "}
                covered companies currently match this rule.
              </p>
              <p className="mt-2">
                Directory values can be modeled or inferred. Open a company page to check available
                provider-backed values and source context before using the screen for research.
              </p>
            </section>

            <section className="mt-8" aria-labelledby="matching-stocks-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="matching-stocks-heading" className="text-xl font-semibold">
                    Stocks matching {preset.label}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ordered by modeled directory market capitalisation for browsing, not as an
                    investment ranking.
                  </p>
                </div>
                <span className="num text-xs text-muted-foreground">
                  {matches.length.toLocaleString()} matches
                </span>
              </div>

              {matches.length ? (
                <>
                  <StockTable stocks={matches.slice(0, limit)} />
                  {matches.length > limit && (
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLimit((value) => value + 200)}
                        className="rounded border border-border px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        Load 200 more
                      </button>
                      <span className="num text-xs text-muted-foreground">
                        showing {Math.min(limit, matches.length).toLocaleString()} of{" "}
                        {matches.length.toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
                  No companies currently match this filter rule.
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-xl border border-border bg-panel p-5">
            <p className="num text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Reference category · awaiting verified data
            </p>
            <h2 className="mt-3 text-lg font-semibold">Why no stocks are assigned yet</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {preset.missingData ??
                "DeepScreen does not currently have a sufficiently reliable field for this category across the full supported universe."}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              The URL exists so the filter library is complete and shareable, but this page is
              excluded from search indexing until DeepScreen can classify companies without guessing.
            </p>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Related {preset.group} filters</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to="/stock-filters/$slug"
                  params={{ slug: item.id }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <Link to="/stock-filters" className="text-sm font-medium text-primary hover:underline">
            Browse all stock filters
          </Link>
        </div>
      </div>
    </Shell>
  );
}
