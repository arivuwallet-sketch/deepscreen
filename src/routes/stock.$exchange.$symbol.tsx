import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { HoldingPlanCard } from "@/components/ds/HoldingPlanCard";
import { ScoreBar } from "@/components/ds/StockTable";
import { findStock } from "@/lib/deepscreen/stocks";
import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { CAP_LABEL, formatCap, formatPrice, formatVolume } from "@/lib/deepscreen/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stock/$exchange/$symbol")({
  loader: ({ params }) => {
    const stock = findStock(params.exchange, params.symbol);
    if (!stock) throw notFound();
    return { stock };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Stock not found | DeepScreen" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.stock;
    const title = `${s.symbol} — ${s.name} Fundamental Analysis | DeepScreen`;
    const description = `${s.name} (${s.exchange}: ${s.symbol}) full fundamental breakdown: P/E ${s.fundamentals.pe}, PEG ${s.fundamentals.peg}, ROCE ${s.fundamentals.roce}%, plus latest news.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: StockPage,
});

const bandClass: Record<string, string> = {
  good: "border-bull/40 bg-bull/5",
  fair: "border-warn/30 bg-warn/5",
  poor: "border-bear/40 bg-bear/5",
};

const bandText: Record<string, string> = {
  good: "text-bull",
  fair: "text-warn",
  poor: "text-bear",
};

function StockPage() {
  const { stock } = Route.useLoaderData();
  const a = analyze(stock);
  const f = stock.fundamentals;
  const { data: quote, dataUpdatedAt } = useLiveQuote(stock.exchange, stock.symbol);
  const price = quote?.price ?? stock.price;
  const changePct = quote?.changePct ?? stock.changePct;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="num text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          /{" "}
          <Link to="/exchange/$code" params={{ code: stock.exchange }} className="hover:text-foreground">
            {stock.exchange}
          </Link>{" "}
          / {stock.symbol}
        </nav>

        <header className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="num text-3xl font-bold tracking-tight">
              {stock.symbol}
              <span className="ml-3 text-base font-normal text-muted-foreground">{stock.name}</span>
            </h1>
            <p className="num mt-2 text-xs text-muted-foreground">
              {stock.exchange} · {stock.sector} · {CAP_LABEL[stock.cap]} · Mkt cap{" "}
              {formatCap(stock.marketCap, stock.exchange)} · Vol {formatVolume(stock.volume)}
            </p>
          </div>
          <div className="text-right">
            <p className="num text-3xl font-bold">{formatPrice(price, stock.exchange)}</p>
            <p className={cn("num text-sm font-medium", changePct >= 0 ? "text-bull" : "text-bear")}>
              {changePct >= 0 ? "▲ +" : "▼ "}
              {changePct.toFixed(2)}% today
            </p>
            <p className="num mt-1 text-[11px] text-muted-foreground">
              {quote
                ? `Live · ${quote.marketState || "market"} · updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
                : "Fetching live price…"}
            </p>
            {quote ? (
              <p className="num mt-0.5 text-[11px] text-muted-foreground">
                Day {formatPrice(quote.dayLow, stock.exchange)}–{formatPrice(quote.dayHigh, stock.exchange)} · 52w{" "}
                {formatPrice(quote.fiftyTwoWeekLow, stock.exchange)}–
                {formatPrice(quote.fiftyTwoWeekHigh, stock.exchange)}
              </p>
            ) : null}
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide">DeepScreen verdict</h2>
              <span
                className={cn("num rounded border px-3 py-1 text-sm font-semibold", verdictClass(a.verdict))}
              >
                {a.verdict}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="num text-5xl font-bold">{a.score}</span>
              <div className="flex-1">
                <ScoreBar score={a.score} />
                <p className="num mt-1 text-xs text-muted-foreground">Weighted 12-factor score / 100</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.summary}</p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-bull/30 bg-panel p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-bull">Strengths</h3>
              <ul className="num mt-2 space-y-1.5 text-xs text-muted-foreground">
                {a.strengths.length > 0 ? (
                  a.strengths.map((s) => <li key={s}>+ {s}</li>)
                ) : (
                  <li>No standout strengths in the model.</li>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-bear/30 bg-panel p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-bear">Risks</h3>
              <ul className="num mt-2 space-y-1.5 text-xs text-muted-foreground">
                {a.risks.length > 0 ? (
                  a.risks.map((s) => <li key={s}>− {s}</li>)
                ) : (
                  <li>No red flags triggered.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <HoldingPlanCard stock={stock} />

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Fundamental breakdown{" "}
            <span className="font-normal normal-case text-muted-foreground">
              — hover any card for what the ratio means
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {a.metrics.map((m) => (
              <div
                key={m.key}
                title={m.tooltip}
                className={cn("cursor-help rounded-lg border p-4", bandClass[m.band])}
              >
                <p className="num text-xs uppercase text-muted-foreground">{m.label}</p>
                <p className="num mt-1 text-2xl font-bold">{m.display}</p>
                <p className={cn("mt-1 text-xs", bandText[m.band])}>{m.reading}</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      m.band === "good" ? "bg-bull" : m.band === "fair" ? "bg-warn" : "bg-bear",
                    )}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{m.tooltip}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Company financials</h2>
            <dl className="num mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">EPS (TTM)</dt>
              <dd className="text-right">{formatPrice(stock.epsTtm, stock.exchange)}</dd>
              <dt className="text-muted-foreground">Revenue (TTM)</dt>
              <dd className="text-right">{formatCap(stock.revenue, stock.exchange)}</dd>
              <dt className="text-muted-foreground">Net margin</dt>
              <dd className="text-right">{f.netMargin}%</dd>
              <dt className="text-muted-foreground">EBITDA margin</dt>
              <dd className="text-right">{f.ebitdaMargin}%</dd>
              <dt className="text-muted-foreground">Earnings growth</dt>
              <dd className="text-right">{f.growth}%</dd>
              <dt className="text-muted-foreground">Dividend yield</dt>
              <dd className="text-right">{f.dividendYield}%</dd>
              <dt className="text-muted-foreground">Payout ratio</dt>
              <dd className="text-right">{f.payoutRatio}%</dd>
              <dt className="text-muted-foreground">Debt / equity</dt>
              <dd className="text-right">{f.debtToEquity}x</dd>
            </dl>
          </div>
          <LiveNewsFeed
            query={`"${stock.name}" OR ${stock.symbol} stock`}
            title={`${stock.symbol} live news`}
            limit={10}
          />
        </section>
      </div>
    </Shell>
  );
}
