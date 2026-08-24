import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { NewsFeed } from "@/components/ds/NewsFeed";
import { StockTable } from "@/components/ds/StockTable";
import { EXCHANGES, getExchange } from "@/lib/deepscreen/exchanges";
import { SECTORS, stocksByExchange } from "@/lib/deepscreen/stocks";
import { exchangeNews } from "@/lib/deepscreen/news";
import { analyze } from "@/lib/deepscreen/metrics";
import { CAP_LABEL } from "@/lib/deepscreen/format";
import type { CapTier } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exchange/$code")({
  loader: ({ params }) => {
    const exchange = getExchange(params.code);
    if (!exchange) throw notFound();
    return { exchange };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.exchange.name ?? "Exchange";
    const code = loaderData?.exchange.code ?? "";
    const title = `${code} Screener — ${name} | DeepScreen`;
    const description = `Screen ${name} (${code}) listings by large, mid and small cap with full fundamental scoring and the latest market news.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
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
  const [sort, setSort] = useState<SortKey>("score");
  const [limit, setLimit] = useState(100);


  const all = useMemo(() => stocksByExchange(exchange.code), [exchange.code]);

  const filtered = useMemo(() => {
    const rows = all
      .filter((s) => (caps.length === 0 ? true : caps.includes(s.cap)))
      .filter((s) => (sector === "all" ? true : s.sector === sector));
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
  }, [all, caps, sector, sort]);

  const toggleCap = (c: CapTier) =>
    setCaps((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

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

          <span className="num ml-auto text-xs text-muted-foreground">
            {filtered.length.toLocaleString()} / {all.length.toLocaleString()} companies
          </span>
        </div>

        <div className="mt-6">
          <StockTable stocks={filtered.slice(0, limit)} />
        </div>

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
          <NewsFeed items={exchangeNews(exchange.code, 8)} title={`${exchange.code} market news`} />
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
    </Shell>
  );
}
