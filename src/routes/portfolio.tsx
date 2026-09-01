import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Shell } from "@/components/ds/Shell";
import { quoteKey, useLiveFundamentalsBatch, useLiveQuotes } from "@/hooks/useLiveQuotes";
import { useWatchlist } from "@/hooks/useWatchlist";
import { formatPrice } from "@/lib/deepscreen/format";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { holdingPlan } from "@/lib/deepscreen/horizon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio Health & Risk Matrix — DeepScreen" },
      {
        name: "description",
        content:
          "Weighted P/E, PEG, leverage risk and sector diversification for every stock on your DeepScreen watchlist, computed from live market data.",
      },
      { property: "og:title", content: "Portfolio Health & Risk Matrix — DeepScreen" },
      {
        property: "og:description",
        content:
          "See concentration, valuation and risk across your tracked holdings with live fundamentals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { stocks, loading, signedIn } = useWatchlist();
  const keys = useMemo(() => stocks.map((s) => ({ exchange: s.exchange, symbol: s.symbol })), [stocks]);
  const { data: quotes } = useLiveQuotes(keys);
  const { data: funds } = useLiveFundamentalsBatch(keys);

  const rows = useMemo(
    () =>
      stocks.map((s) => {
        const k = quoteKey(s);
        const { stock } = mergeLiveStock(s, quotes?.[k], funds?.[k]);
        return { stock, analysis: analyze(stock), plan: holdingPlan(stock) };
      }),
    [stocks, quotes, funds],
  );

  const totals = useMemo(() => {
    if (!rows.length) return null;
    const weights = rows.map((r) => Math.max(r.stock.marketCap, 0.01));
    const sum = weights.reduce((a, b) => a + b, 0);
    const w = (pick: (r: (typeof rows)[number]) => number) =>
      rows.reduce((a, r, i) => a + pick(r) * (weights[i]! / sum), 0);
    const sectors = new Map<string, number>();
    rows.forEach((r, i) => {
      sectors.set(r.stock.sector, (sectors.get(r.stock.sector) ?? 0) + (weights[i]! / sum) * 100);
    });
    return {
      pe: w((r) => r.stock.fundamentals.pe),
      peg: w((r) => r.stock.fundamentals.peg),
      de: w((r) => r.stock.fundamentals.debtToEquity),
      score: w((r) => r.analysis.score),
      yield: w((r) => r.stock.fundamentals.dividendYield),
      growth: w((r) => r.stock.fundamentals.growth),
      sectors: [...sectors.entries()].sort((a, b) => b[1] - a[1]),
      alerts: rows.filter((r) => r.plan.alert === "trim" || r.plan.alert === "exit").length,
    };
  }, [rows]);

  const riskLabel = (v: number) => (v < 0.5 ? "Low" : v < 1.2 ? "Moderate" : v < 2 ? "Elevated" : "High");

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Portfolio health & risk matrix</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Cap-weighted valuation, leverage and sector concentration across every stock you track,
          recomputed from live prices and fundamentals.
        </p>

        {!signedIn && !loading ? (
          <EmptyCard>
            <Link to="/auth" className="text-primary underline">
              Sign in
            </Link>{" "}
            and star stocks to build your portfolio matrix.
          </EmptyCard>
        ) : null}

        {signedIn && !loading && rows.length === 0 ? (
          <EmptyCard>
            Your watchlist is empty — open any stock page and tap the star to add it here.
          </EmptyCard>
        ) : null}

        {totals ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Stat label="Holdings" value={String(rows.length)} />
              <Stat label="Weighted P/E" value={totals.pe.toFixed(2)} />
              <Stat label="Weighted PEG" value={totals.peg.toFixed(2)} />
              <Stat label="Weighted D/E" value={`${totals.de.toFixed(2)} · ${riskLabel(totals.de)}`} />
              <Stat label="Avg deep score" value={totals.score.toFixed(0)} />
              <Stat label="Action alerts" value={String(totals.alerts)} />
            </div>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-panel text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Stock</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">P/E</th>
                      <th className="px-3 py-2 text-right">PEG</th>
                      <th className="px-3 py-2 text-right">D/E</th>
                      <th className="px-3 py-2 text-right">Score</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ stock, analysis, plan }) => (
                      <tr key={quoteKey(stock)} className="border-t border-border">
                        <td className="px-3 py-2">
                          <Link
                            to="/stock/$exchange/$symbol"
                            params={{ exchange: stock.exchange, symbol: stock.symbol }}
                            className="font-semibold hover:text-primary"
                          >
                            {stock.symbol}
                          </Link>
                          <div className="truncate text-xs text-muted-foreground">{stock.sector}</div>
                        </td>
                        <td className="num px-3 py-2 text-right">{formatPrice(stock.price, stock.exchange)}</td>
                        <td className="num px-3 py-2 text-right">{stock.fundamentals.pe.toFixed(1)}</td>
                        <td className="num px-3 py-2 text-right">{stock.fundamentals.peg.toFixed(2)}</td>
                        <td className="num px-3 py-2 text-right">{stock.fundamentals.debtToEquity.toFixed(2)}</td>
                        <td className="num px-3 py-2 text-right">
                          <span className={cn("rounded px-2 py-0.5 text-xs", verdictClass(analysis.verdict))}>
                            {analysis.score}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs capitalize text-muted-foreground">{plan.alertLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <aside className="rounded-lg border border-border p-4">
                <h2 className="text-sm font-semibold">Sector diversification</h2>
                <div className="mt-3 space-y-2">
                  {totals.sectors.map(([sector, pct]) => (
                    <div key={sector}>
                      <div className="flex justify-between text-xs">
                        <span className="truncate">{sector}</span>
                        <span className="num text-muted-foreground">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded bg-accent">
                        <div
                          className={cn("h-1.5 rounded", pct > 40 ? "bg-warn" : "bg-primary")}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {totals.sectors[0] && totals.sectors[0][1] > 40
                    ? `Concentration risk: ${totals.sectors[0][1].toFixed(0)}% of weight sits in ${totals.sectors[0][0]}.`
                    : "Weight is reasonably spread across sectors."}
                </p>
              </aside>
            </section>
          </>
        ) : null}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="num mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
