import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus, Radio } from "lucide-react";

import { useMarketMovers } from "@/hooks/useMarketMovers";
import { quoteKey } from "@/hooks/useLiveQuotes";
import { formatPrice, formatVolume } from "@/lib/deepscreen/format";
import { analyze } from "@/lib/deepscreen/metrics";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveQuote } from "@/lib/market/yahoo.server";
import { cn } from "@/lib/utils";

type MarketMoversProps = {
  stocks: Stock[];
  title?: string;
  exchangeLabel?: string;
};

type Row = {
  stock: Stock;
  quote: LiveQuote;
  score: number;
};

function shortName(name: string) {
  return name.length > 28 ? `${name.slice(0, 27)}…` : name;
}

function marketStateLabel(state: string) {
  switch (state.toUpperCase()) {
    case "REGULAR":
      return "LIVE";
    case "PRE":
    case "PREPRE":
      return "PRE";
    case "POST":
    case "POSTPOST":
      return "AFTER";
    case "CLOSED":
      return "CLOSED";
    default:
      return "LATEST";
  }
}

function MoverList({
  title,
  rows,
  tone,
  empty,
}: {
  title: string;
  rows: Row[];
  tone: "up" | "down" | "neutral";
  empty: string;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
        {tone === "up" ? (
          <ArrowUp className="size-4 text-bull" />
        ) : tone === "down" ? (
          <ArrowDown className="size-4 text-bear" />
        ) : (
          <Minus className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="mt-3 divide-y divide-border">
        {rows.length > 0 ? (
          rows.map(({ stock, quote, score }) => (
            <Link
              key={`${stock.exchange}-${stock.symbol}`}
              to="/stock/$exchange/$symbol"
              params={{ exchange: stock.exchange, symbol: stock.symbol }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 transition-colors hover:bg-accent/40"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="num shrink-0 text-sm font-semibold text-primary">{stock.symbol}</span>
                  <span className="truncate text-xs text-muted-foreground">{shortName(stock.name)}</span>
                </div>
                <p className="num mt-1 text-[10px] text-muted-foreground">
                  {stock.exchange} · {formatPrice(quote.price, stock.exchange)} · Vol {formatVolume(quote.volume)}
                  {score >= 0 ? ` · Score ${score}` : ""}
                </p>
              </div>
              <div className="num text-right">
                <p className={cn("text-sm font-semibold", quote.changePct >= 0 ? "text-bull" : "text-bear")}>
                  {quote.changePct >= 0 ? "+" : ""}{quote.changePct.toFixed(2)}%
                </p>
                <p className="text-[10px] text-muted-foreground">{marketStateLabel(quote.marketState)}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="py-5 text-xs text-muted-foreground">{empty}</p>
        )}
      </div>
    </section>
  );
}

export function MarketMovers({ stocks, title = "Live market movers", exchangeLabel }: MarketMoversProps) {
  const exchanges = useMemo(
    () => Array.from(new Set(stocks.map((stock) => stock.exchange))).sort(),
    [stocks],
  );
  const stockByKey = useMemo(
    () => new Map(stocks.map((stock) => [quoteKey(stock), stock] as const)),
    [stocks],
  );
  const { data: snapshot, isFetching } = useMarketMovers(exchanges);

  const rows = useMemo<Row[]>(() => {
    if (!snapshot) return [];
    const unique = new Map<string, Row>();

    for (const mover of [...snapshot.gainers, ...snapshot.losers]) {
      const key = quoteKey(mover);
      const stock = stockByKey.get(key);
      if (!stock || !Number.isFinite(mover.quote.changePct)) continue;

      const merged = mergeLiveStock(stock, mover.quote, null, null).stock;
      unique.set(key, {
        stock,
        quote: mover.quote,
        score: analyze(merged).score,
      });
    }

    return [...unique.values()];
  }, [snapshot, stockByKey]);

  const performers = rows
    .filter((row) => row.quote.changePct > 0)
    .slice()
    .sort((a, b) => b.score - a.score || b.quote.changePct - a.quote.changePct)
    .slice(0, 8);

  const gainers = rows
    .filter((row) => row.quote.changePct > 0)
    .slice()
    .sort((a, b) => b.quote.changePct - a.quote.changePct)
    .slice(0, 8);

  const losers = rows
    .filter((row) => row.quote.changePct < 0)
    .slice()
    .sort((a, b) => a.quote.changePct - b.quote.changePct)
    .slice(0, 8);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {exchangeLabel ? `${exchangeLabel} · ` : ""}
            Provider-ranked equity movers refresh every 15 seconds. Closed markets show the latest session.
          </p>
        </div>
        <span className="num inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Radio className={cn("size-3", isFetching ? "animate-pulse text-primary" : "text-bull")} />
          {snapshot?.fetchedAt
            ? `Updated ${new Date(snapshot.fetchedAt).toLocaleTimeString()}`
            : "Loading live movers…"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <MoverList title="Top performers" rows={performers} tone="neutral" empty="Waiting for provider-ranked movers…" />
        <MoverList title="Market gainers" rows={gainers} tone="up" empty="No positive movers in the latest provider window." />
        <MoverList title="Market losers" rows={losers} tone="down" empty="No negative movers in the latest provider window." />
      </div>
    </section>
  );
}
