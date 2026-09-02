import { Link } from "@tanstack/react-router";

import { quoteKey, useLiveFundamentalsBatch, useLiveQuotes } from "@/hooks/useLiveQuotes";

import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import { formatCap, formatPrice, formatVolume } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

export function ScoreBar({ score }: { score: number }) {
  const tone = score >= 67 ? "bg-bull" : score >= 45 ? "bg-warn" : "bg-bear";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
      <span className="num text-xs font-semibold">{score}</span>
    </div>
  );
}

export function StockTable({ stocks }: { stocks: Stock[] }) {
  const keys = stocks.map((s) => ({ exchange: s.exchange, symbol: s.symbol }));
  const { data: live } = useLiveQuotes(keys);
  const { data: liveFundamentals, isFetching: fundamentalsLoading } =
    useLiveFundamentalsBatch(keys);

  if (stocks.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-panel p-8 text-center text-sm text-muted-foreground">
        No companies match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-panel">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="num border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Symbol</th>
            <th className="px-2 py-2.5 font-medium">Company</th>
            <th className="px-2 py-2.5 text-right font-medium">Price</th>
            <th className="px-2 py-2.5 text-right font-medium">Chg %</th>
            <th className="px-2 py-2.5 text-right font-medium">Mkt Cap</th>
            <th className="px-2 py-2.5 text-right font-medium">P/E</th>
            <th className="px-2 py-2.5 text-right font-medium">PEG</th>
            <th className="px-2 py-2.5 text-right font-medium">ROCE</th>
            <th className="px-2 py-2.5 text-right font-medium">Vol</th>
            <th className="px-2 py-2.5 font-medium">Score</th>
            <th className="px-4 py-2.5 font-medium">Verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stocks.map((s) => {
            const q = live?.[quoteKey(s)];
            const lf = liveFundamentals?.[quoteKey(s)];
            const { stock: merged, sources } = mergeLiveStock(s, q, lf);
            const a = analyze(merged);
            const isLive = sources.pe === "live";
            return (
              <tr key={`${s.exchange}-${s.symbol}`} className="group hover:bg-accent/40">
                <td className="num px-4 py-2.5 font-semibold text-primary">
                  <Link
                    to="/stock/$exchange/$symbol"
                    params={{ exchange: s.exchange, symbol: s.symbol }}
                  >
                    {s.symbol}
                  </Link>
                </td>
                <td className="max-w-[220px] truncate px-2 py-2.5">
                  <Link
                    to="/stock/$exchange/$symbol"
                    params={{ exchange: s.exchange, symbol: s.symbol }}
                  >
                    {s.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{s.sector}</span>
                </td>
                <td className="num px-2 py-2.5 text-right">
                  {formatPrice(merged.price, s.exchange)}
                  {q ? (
                    <span
                      className="ml-1 inline-block size-1.5 rounded-full bg-bull align-middle"
                      title="Live price"
                    />
                  ) : null}
                </td>
                <td
                  className={cn(
                    "num px-2 py-2.5 text-right font-medium",
                    merged.changePct >= 0 ? "text-bull" : "text-bear",
                  )}
                >
                  {merged.changePct >= 0 ? "+" : ""}
                  {merged.changePct.toFixed(2)}%
                </td>
                <td className="num px-2 py-2.5 text-right">
                  {formatCap(merged.marketCap, s.exchange)}
                </td>
                <td
                  className="num px-2 py-2.5 text-right"
                  title={isLive ? "Live" : "Modeled estimate"}
                >
                  {merged.fundamentals.pe.toFixed(1)}
                </td>
                <td
                  className="num px-2 py-2.5 text-right"
                  title={sources.peg === "live" ? "Live" : "Modeled estimate"}
                >
                  {merged.fundamentals.peg.toFixed(2)}
                </td>
                <td
                  className="num px-2 py-2.5 text-right"
                  title="Modeled estimate — Yahoo has no public ROCE field"
                >
                  {merged.fundamentals.roce.toFixed(1)}%
                </td>
                <td className="num px-2 py-2.5 text-right text-muted-foreground">
                  {formatVolume(merged.volume)}
                </td>
                <td className="px-2 py-2.5">
                  {lf ? (
                    <ScoreBar score={a.score} />
                  ) : (
                    <span
                      className="num text-xs text-muted-foreground"
                      title="Waiting for live fundamentals — score appears once real data lands, so it always matches the stock page."
                    >
                      {fundamentalsLoading ? "scoring…" : "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {lf ? (
                    <span
                      className={cn(
                        "num rounded border px-2 py-0.5 text-[11px] font-semibold",
                        verdictClass(a.verdict),
                      )}
                    >
                      {a.verdict}
                    </span>
                  ) : (
                    <span className="num text-xs text-muted-foreground">—</span>
                  )}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-bull align-middle" /> Live price
        for up to 60 rows here, refreshed every 15s. P/E and PEG are live (Yahoo Finance, refreshed
        ~45s
        {fundamentalsLoading ? ", updating…" : ""}) for the first {Math.min(40, stocks.length)} rows
        in this view; the rest show modeled estimates, as does ROCE everywhere — Yahoo has no public
        field for it. The score & verdict are only shown once live fundamentals for that row have
        loaded, so they always match the number on the stock page.
      </p>
    </div>
  );
}
