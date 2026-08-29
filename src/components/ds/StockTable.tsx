import { Link } from "@tanstack/react-router";

import { quoteKey, useLiveQuotes } from "@/hooks/useLiveQuotes";

import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
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
  const { data: live } = useLiveQuotes(
    stocks.map((s) => ({ exchange: s.exchange, symbol: s.symbol })),
  );

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
            const a = analyze(s);
            const q = live?.[quoteKey(s)];
            const price = q?.price ?? s.price;
            const changePct = q?.changePct ?? s.changePct;
            const volume = q?.volume || s.volume;
            return (
              <tr key={`${s.exchange}-${s.symbol}`} className="group hover:bg-accent/40">
                <td className="num px-4 py-2.5 font-semibold text-primary">
                  <Link to="/stock/$exchange/$symbol" params={{ exchange: s.exchange, symbol: s.symbol }}>
                    {s.symbol}
                  </Link>
                </td>
                <td className="max-w-[220px] truncate px-2 py-2.5">
                  <Link to="/stock/$exchange/$symbol" params={{ exchange: s.exchange, symbol: s.symbol }}>
                    {s.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{s.sector}</span>
                </td>
                <td className="num px-2 py-2.5 text-right">{formatPrice(price, s.exchange)}</td>
                <td
                  className={cn(
                    "num px-2 py-2.5 text-right font-medium",
                    changePct >= 0 ? "text-bull" : "text-bear",
                  )}
                >
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </td>
                <td className="num px-2 py-2.5 text-right">{formatCap(s.marketCap, s.exchange)}</td>
                <td className="num px-2 py-2.5 text-right">{s.fundamentals.pe.toFixed(1)}</td>
                <td className="num px-2 py-2.5 text-right">{s.fundamentals.peg.toFixed(2)}</td>
                <td className="num px-2 py-2.5 text-right">{s.fundamentals.roce.toFixed(1)}%</td>
                <td className="num px-2 py-2.5 text-right text-muted-foreground">
                  {formatVolume(volume)}
                </td>
                <td className="px-2 py-2.5">
                  <ScoreBar score={a.score} />
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "num rounded border px-2 py-0.5 text-[11px] font-semibold",
                      verdictClass(a.verdict),
                    )}
                  >
                    {a.verdict}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
