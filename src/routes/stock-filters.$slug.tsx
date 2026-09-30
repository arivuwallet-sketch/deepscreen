import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { StockTable } from "@/components/ds/StockTable";
import { STOCKS } from "@/lib/deepscreen/stocks";
import {
  STOCK_FILTER_PRESETS,
  filterStocksByPreset,
  findStockFilterPreset,
  type StockFilterPreset,
} from "@/lib/deepscreen/stock-filter-presets";
import { jsonLd } from "@/lib/seo/json-ld";
import { metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";

const BASE = "https://deepscreen.online";
const INITIAL_LIMIT = 200;
const ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

type FilterGuidance = {
  focus: string;
  steps: string[];
  caution: string;
};

const GROUP_GUIDANCE: Record<string, FilterGuidance> = {
  Valuation: {
    focus:
      "Valuation screens compare a company's market price with earnings, book value, sales, growth or other business fundamentals. A low multiple can reflect opportunity, weak fundamentals or cyclical peak earnings, so valuation should be read with quality and growth.",
    steps: [
      "Compare the same valuation measure with close sector peers using the same reporting period.",
      "Check whether earnings, book value or growth inputs are positive and economically meaningful.",
      "Review debt, margins and capital returns before treating a low multiple as inexpensive.",
    ],
    caution: "A valuation filter is a research shortlist, not proof that a stock is cheap or expensive.",
  },
  "Growth & compounders": {
    focus:
      "Growth and compounder screens look for companies showing stronger modeled growth together with selected quality or valuation characteristics. Sustainable compounding normally requires durable demand, reinvestment opportunities and disciplined capital allocation over several periods.",
    steps: [
      "Verify whether growth is organic, acquisition-driven or boosted by a weak comparison period.",
      "Compare revenue, profit, margins and capital returns across several reporting periods.",
      "Check valuation and balance-sheet risk so growth is not considered in isolation.",
    ],
    caution: "Recent growth does not establish future growth or a future multibagger return.",
  },
  "Income & dividends": {
    focus:
      "Income screens focus on dividend yield, payout characteristics and related financial strength. A high yield can rise because the share price falls, so dividend sustainability matters more than yield alone.",
    steps: [
      "Verify the latest declared dividend and the relevant ex-dividend or payment dates.",
      "Compare payout ratios with earnings, cash generation and reinvestment needs.",
      "Review leverage and several years of dividend history before judging reliability.",
    ],
    caution: "A current dividend yield is not a guarantee that future dividends will be maintained.",
  },
  "Quality & financial strength": {
    focus:
      "Quality and financial-strength screens combine profitability, returns on capital, leverage, margins or related balance-sheet measures. Strong ratios are most useful when they persist and are not created by excessive leverage or one-off gains.",
    steps: [
      "Compare ROE, ROA or ROCE with close peers and the company's own multi-year history.",
      "Review debt and interest obligations alongside profitability measures.",
      "Check cash conversion and accounting disclosures when the necessary statement data is available.",
    ],
    caution: "One strong accounting period does not establish durable business quality.",
  },
  "Momentum & trading": {
    focus:
      "Momentum and trading screens describe price, volume or trend conditions. These signals can change quickly and should be interpreted with the exact measurement period, liquidity and broader market context.",
    steps: [
      "Confirm the price and volume period used by the signal before comparing securities.",
      "Check liquidity, gaps and event risk that can distort short-term moves.",
      "Use risk controls appropriate to the time horizon rather than treating a signal as a forecast.",
    ],
    caution: "A technical or momentum condition describes market behavior; it does not predict the next price move.",
  },
  "Size & price": {
    focus:
      "Size and price screens group companies by market-cap tier or nominal share price. Market capitalization and share price answer different questions and should not be used as substitutes for business value or financial quality.",
    steps: [
      "Use market capitalization rather than share price to compare company size.",
      "Check liquidity and free float when researching smaller companies.",
      "Review fundamentals and valuation before drawing conclusions from a size bucket.",
    ],
    caution: "A low nominal share price does not by itself make a stock inexpensive.",
  },
  "Markets & indices": {
    focus:
      "Market and index screens organize securities by listing venue or benchmark membership. Index methodology, rebalances and cross-listings can change membership over time.",
    steps: [
      "Confirm the listing exchange and ticker before comparing companies.",
      "Check the benchmark provider's current constituent methodology for index-specific research.",
      "Compare companies within relevant sectors and currencies when using cross-market screens.",
    ],
    caution: "Index or exchange membership is descriptive and is not an investment recommendation.",
  },
  "Sectors & themes": {
    focus:
      "Sector and theme screens group companies by business activity or economic exposure. Broad sector labels are easier to verify consistently than narrow themes, which often require company-level revenue segmentation.",
    steps: [
      "Verify the company's actual products, customers and revenue mix before assigning a narrow theme.",
      "Compare companies with similar business models instead of relying only on a broad label.",
      "Review sector-specific risks, cyclicality and regulation.",
    ],
    caution: "A company can have exposure to several themes, and a label alone does not establish material revenue exposure.",
  },
  "Ownership & governance": {
    focus:
      "Ownership and governance screens depend on dated shareholding, promoter, institutional, insider or governance disclosures. Reliable classification requires current, source-backed ownership records rather than inference from price or fundamentals.",
    steps: [
      "Use the latest exchange, regulator or company shareholding disclosure.",
      "Compare the current period with prior filings before calling ownership increasing or decreasing.",
      "Separate disclosed holdings from interpretations about investor intent or management quality.",
    ],
    caution: "Ownership changes are date-specific and do not reveal why an investor bought or sold.",
  },
  "Corporate actions": {
    focus:
      "Corporate-action screens cover events such as buybacks, splits, bonuses, mergers, demergers, rights issues or listing events. These require verified event records, effective dates and terms.",
    steps: [
      "Confirm the event through exchange, regulator or official company announcements.",
      "Record announcement, record, ex-date and effective dates where relevant.",
      "Evaluate the economic terms rather than assuming the event itself creates value.",
    ],
    caution: "A corporate action can change share counts or structure without increasing underlying business value.",
  },
  "Risk & style": {
    focus:
      "Risk and style screens classify companies using volatility, leverage, business defensiveness or related characteristics. A complete risk assessment generally needs both financial and historical market data.",
    steps: [
      "Identify whether the screen measures business risk, balance-sheet risk or market-price risk.",
      "Use a sufficiently long and relevant historical period for volatility or beta measures.",
      "Stress-test leverage, margins and demand under weaker economic conditions.",
    ],
    caution: "Low historical volatility does not mean a security is low risk in every future market environment.",
  },
  "Other screens": {
    focus:
      "This screening category requires a clearly defined rule and consistent source data before company membership can be treated as reliable. DeepScreen separates available evidence from fields that are not yet verified across the full universe.",
    steps: [
      "Define the metric, time period and threshold before using the category.",
      "Verify the required data from primary filings or a documented market-data source.",
      "Avoid assigning companies when a required field is missing or ambiguous.",
    ],
    caution: "A screening label is only as reliable as its definition, source data and update period.",
  },
};

function guidanceFor(preset: Pick<StockFilterPreset, "group">): FilterGuidance {
  return GROUP_GUIDANCE[preset.group] ?? GROUP_GUIDANCE["Other screens"]!;
}

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
    const title = live
      ? `${preset.label} Screener & Stock List | DeepScreen`
      : `${preset.label}: Definition & Screening Method | DeepScreen`;
    const description = live
      ? `${preset.label}: screen DeepScreen's NSE, BSE, NYSE, Nasdaq and LSE directory using a transparent data-backed rule, with matching companies and research context.`
      : `${preset.label}: learn what this stock-screening category means, which verified data is required, how to research it and why DeepScreen does not invent unsupported memberships.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: ROBOTS },
        { name: "googlebot", content: ROBOTS },
        {
          name: "keywords",
          content: metaKeywords(
            [
              preset.label,
              `${preset.label} screener`,
              `${preset.label} filter`,
              `${preset.label} list`,
              `${preset.label} meaning`,
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
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": live ? "CollectionPage" : "WebPage",
                name: preset.label,
                description,
                url,
                isPartOf: { "@type": "WebSite", name: "DeepScreen", url: BASE },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Stock filters",
                    item: `${BASE}/stock-filters`,
                  },
                  { "@type": "ListItem", position: 3, name: preset.label, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: StockFilterPage,
});

function StockFilterPage() {
  const { preset: loaded } = Route.useLoaderData();
  const preset = findStockFilterPreset(loaded.id);
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  const matches = useMemo(() => {
    if (!preset || preset.status !== "available") return [];
    return filterStocksByPreset(STOCKS, preset).sort(
      (a, b) =>
        b.marketCap - a.marketCap ||
        a.name.localeCompare(b.name) ||
        a.symbol.localeCompare(b.symbol),
    );
  }, [preset]);

  if (!preset) return null;

  const guidance = guidanceFor(preset);
  const related = STOCK_FILTER_PRESETS.filter(
    (item) => item.id !== preset.id && item.group === preset.group,
  ).slice(0, 12);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
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

        <section className="mt-6 rounded-xl border border-border bg-panel p-5" aria-labelledby="filter-meaning">
          <h2 id="filter-meaning" className="text-lg font-semibold">
            What are {preset.label}?
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            {guidance.focus}
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            DeepScreen treats this as a research category, not an investment recommendation. The
            page states whether membership can be calculated from the currently available directory
            fields or whether additional verified data is required.
          </p>
        </section>

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
                  No companies currently match this filter rule. The page remains a valid research
                  reference and will continue to explain the screen even when the current match set is empty.
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-xl border border-border bg-panel p-5" aria-labelledby="required-data">
            <p className="num text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Reference category · additional verified data required
            </p>
            <h2 id="required-data" className="mt-3 text-lg font-semibold">
              Data required for reliable classification
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              {preset.missingData ??
                "DeepScreen does not currently have a sufficiently reliable field for this category across the full supported universe."}
            </p>
            <h3 className="mt-5 text-sm font-semibold">Why the stock list is intentionally blank</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Assigning companies without the required source data would turn a useful screening
              concept into a guessed classification. This page is therefore an indexable educational
              reference: it defines the category, documents the missing evidence and explains how to
              research the screen without fabricating stock memberships.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-border bg-card/30 p-5" aria-labelledby="research-this-filter">
          <h2 id="research-this-filter" className="text-lg font-semibold">
            How to research {preset.label}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {guidance.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <strong>Limitation:</strong> {guidance.caution}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link to="/methodology" className="text-primary hover:underline">
              DeepScreen methodology
            </Link>
            <Link to="/data-sources" className="text-primary hover:underline">
              Data sources and limitations
            </Link>
            <Link to="/research-checklist" className="text-primary hover:underline">
              Stock research checklist
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Related {preset.group} filters
            </h2>
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
