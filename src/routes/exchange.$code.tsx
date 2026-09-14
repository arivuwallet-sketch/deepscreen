import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { StockTable } from "@/components/ds/StockTable";
import { EXCHANGES, getExchange } from "@/lib/deepscreen/exchanges";
import { indicesForExchange, isInIndex } from "@/lib/deepscreen/indices";
import { SECTORS, stocksByExchange } from "@/lib/deepscreen/stocks";
import { analyze } from "@/lib/deepscreen/metrics";
import { CAP_LABEL } from "@/lib/deepscreen/format";
import type { CapTier } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";
import { exchangeKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";

const TOPIC_BY_EXCHANGE: Record<string, string> = {
  NSE: "india",
  BSE: "india",
  NYSE: "us",
  NASDAQ: "us",
  LSE: "uk",
};

export const Route = createFileRoute("/exchange/$code")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const exchange = getExchange(params.code);
    if (!exchange) throw notFound();
    return { exchange };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.exchange.name ?? "Exchange";
    const code = loaderData?.exchange.code ?? "";
    const country = loaderData?.exchange.country ?? "";
    const currency = loaderData?.exchange.currency ?? "";
    const count = code ? stocksByExchange(code).length : 0;
    const title = `${code} Stock Screener — Screen All ${count} ${code} Companies by 13 Fundamental Ratios`;
    const description = `Screen ${count} ${name} (${code}) companies in ${country || "this market"} by market cap, sector, P/E, PEG, ROCE and a transparent 13-factor score with ${currency} prices.`;
    const url = `https://deepscreen.online/exchange/${code}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "keywords",
          content: metaKeywords(exchangeKeywords[code] ?? [], screenerKeywords),
        },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url,
            isPartOf: { "@type": "WebSite", name: "DeepScreen", url: "https://deepscreen.online" },
            ...(country
              ? { spatialCoverage: { "@type": "Country", name: country } }
              : {}),
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
                { "@type": "ListItem", position: 2, name: `${code} screener`, item: url },
              ],
            },
          }),
        },
      ],
    };
  },
  component: ExchangePage,
});

type SortKey = "score" | "marketCap" | "pe" | "peg" | "roce" | "changePct";

function ExchangePage() {
  const { exchange } = Route.useLoaderData();
  const [caps, setCaps] = useState<CapTier[]>([]);
  const [sector, setSector] = useState("all");
  const [indexIds, setIndexIds] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("score");
  const [limit, setLimit] = useState(100);


  const all = useMemo(() => stocksByExchange(exchange.code), [exchange.code]);
  const indicesHere = useMemo(() => indicesForExchange(exchange.code), [exchange.code]);

  const filtered = useMemo(() => {
    const rows = all
      .filter((s) => (caps.length === 0 ? true : caps.includes(s.cap)))
      .filter((s) => (sector === "all" ? true : s.sector === sector))
      .filter((s) =>
        indexIds.length === 0
          ? true
          : indexIds.every((id) => isInIndex(s.exchange, s.symbol, id)),
      );
    return rows.sort((a, b) => {
      switch (sort) {
        case "marketCap":
          return b.marketCap - a.marketCap;
        case "pe":
          return a.fundamentals.pe - b.fundamentals.pe;
        case "peg":
          return a.fundamentals.peg - b.fundamentals.peg;
        case "roce":
          return b.fundamentals.roce - a.fundamentals.roce;
        case "changePct":
          return b.changePct - a.changePct;
        default:
          return analyze(b).score - analyze(a).score;
      }
    });
  }, [all, caps, sector, indexIds, sort]);

  const toggleCap = (c: CapTier) =>
    setCaps((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const toggleIndex = (id: string) =>
    setIndexIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const sectorsHere = SECTORS.filter((sec) => all.some((s) => s.sector === sec));

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="border-b border-border pb-6">
          <p className="num text-xs uppercase tracking-[0.2em] text-primary">
            {exchange.country} · {exchange.currency} · {exchange.timezone}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {exchange.flag} {exchange.code} Screener
          </h1>
          <p className="mt-1 text-muted-foreground">{exchange.name}</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Compare every available {exchange.code} company by market capitalisation, sector,
            valuation, growth, capital efficiency and leverage. DeepScreen combines 13 fundamental
            ratios into one research score while keeping each underlying figure visible.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-panel p-3">
          <span className="num text-xs uppercase text-muted-foreground">Market cap</span>
          {(["large", "mid", "small"] as CapTier[]).map((c) => (
            <button
              key={c}
              onClick={() => toggleCap(c)}
              className={cn(
                "rounded border px-3 py-1.5 text-xs transition-colors",
                caps.includes(c)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {CAP_LABEL[c]}
            </button>
          ))}

          <span className="num ml-4 text-xs uppercase text-muted-foreground">Sector</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          >
            <option value="all">All sectors</option>
            {sectorsHere.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="num ml-4 text-xs uppercase text-muted-foreground">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          >
            <option value="score">DeepScreen score</option>
            <option value="marketCap">Market cap</option>
            <option value="pe">Lowest P/E</option>
            <option value="peg">Lowest PEG</option>
            <option value="roce">Highest ROCE</option>
            <option value="changePct">Top movers</option>
          </select>

          <span className="num ml-4 text-xs uppercase text-muted-foreground">Filter by Index</span>
          {indicesHere.map((idx) => (
            <button
              key={idx.id}
              title={idx.blurb}
              onClick={() => toggleIndex(idx.id)}
              className={cn(
                "rounded border px-3 py-1.5 text-xs transition-colors",
                indexIds.includes(idx.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {idx.name}
            </button>
          ))}

          <span className="num ml-auto text-xs text-muted-foreground">
            {filtered.length.toLocaleString()} / {all.length.toLocaleString()} companies
          </span>
        </div>

        <div className="mt-6">
          <StockTable stocks={filtered.slice(0, limit)} />
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Browse {exchange.code} sectors</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sectorsHere.map((item) => (
              <a key={item} href={`/sector/${exchange.code}/${item.toLowerCase().replaceAll(" ", "-")}`} className="rounded border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-foreground">
                {item} stocks
              </a>
            ))}
          </div>
        </section>

        {filtered.length > limit && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setLimit((n) => n + 200)}
              className="rounded border border-border px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              Load 200 more
            </button>
            <span className="num text-xs text-muted-foreground">
              showing {Math.min(limit, filtered.length).toLocaleString()} of{" "}
              {filtered.length.toLocaleString()}
            </span>
          </div>
        )}


        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <LiveNewsFeed
            query={`${exchange.code} ${exchange.country} stock market`}
            title={`${exchange.code} market news`}
            limit={12}
          />
          <section className="rounded-lg border border-border bg-panel p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Other exchanges</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {EXCHANGES.filter((e) => e.code !== exchange.code).map((e) => (
                <li key={e.code} className="num flex justify-between border-b border-border pb-2">
                  <span>
                    {e.flag} {e.code} — {e.name}
                  </span>
                  <span className="text-muted-foreground">{e.currency}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <TopicIndex
        ids={[TOPIC_BY_EXCHANGE[exchange.code] ?? "screener", "screener"]}
        title={`${exchange.code} search topics covered on DeepScreen`}
      />
    </Shell>
  );
}
