import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import {
  quoteKey,
  useLiveFundamentalsBatch,
  useLiveQuotes,
  useScreenerRatiosBatch,
} from "@/hooks/useLiveQuotes";
import { useSubscription } from "@/hooks/useSubscription";

import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import { formatCap, formatPrice, formatVolume } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveFundamentals, LiveQuote } from "@/lib/market/yahoo.server";
import type { ScreenerRatios } from "@/lib/market/screener.server";
import { cn } from "@/lib/utils";

function ProLockChip() {
  return (
    <Link
      to="/pricing"
      title="Deep score & verdict are a DeepScreen Pro feature"
      className="num inline-flex items-center gap-1 rounded border border-dashed border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      <Lock className="size-3" /> Pro
    </Link>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const tone = score >= 67 ? "bg-bull" : score >= 45 ? "bg-warn" : "bg-bear";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="num text-xs font-semibold">{score}</span>
    </div>
  );
}

/** Briefly washes an element green/red when the value it's showing changes — so a live tick is noticed, not just silently different. */
function usePriceFlash(value: number) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(value > prevRef.current ? "up" : "down");
      prevRef.current = value;
      const t = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [value]);

  return flash;
}

function StockRow({
  stock,
  quote,
  fundamentals,
  screener,
  isPro,
  subLoading,
  delayMs,
}: {
  stock: Stock;
  quote: LiveQuote | null | undefined;
  fundamentals: LiveFundamentals | null | undefined;
  screener: ScreenerRatios | null | undefined;
  isPro: boolean;
  subLoading: boolean;
  delayMs: number;
}) {
  const { stock: merged, sources } = mergeLiveStock(stock, quote, fundamentals, screener);
  const a = analyze(merged);
  const isLive = sources.pe === "live";
  const priceFlash = usePriceFlash(merged.price);

  return (
    <tr
      className="group animate-fade-in hover:bg-accent/40"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <td className="num px-4 py-2.5 font-semibold text-primary">
        <Link
          to="/stock/$exchange/$symbol"
          params={{ exchange: stock.exchange, symbol: stock.symbol }}
        >
          {stock.symbol}
        </Link>
      </td>
      <td className="max-w-[220px] truncate px-2 py-2.5">
        <Link
          to="/stock/$exchange/$symbol"
          params={{ exchange: stock.exchange, symbol: stock.symbol }}
        >
          {stock.name}
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">{stock.sector}</span>
      </td>
      <td
        className={cn(
          "num rounded px-2 py-2.5 text-right transition-colors",
          priceFlash === "up" && "animate-flash-bull",
          priceFlash === "down" && "animate-flash-bear",
        )}
      >
        {formatPrice(merged.price, stock.exchange)}
        {quote ? (
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
      <td className="num px-2 py-2.5 text-right">{formatCap(merged.marketCap, stock.exchange)}</td>
      <td className="num px-2 py-2.5 text-right" title={isLive ? "Live" : "Modeled estimate"}>
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
        title={
          sources.roce === "live" ? "Live — screener.in" : "Modeled estimate"
        }
      >
        {merged.fundamentals.roce.toFixed(1)}%
      </td>
      <td className="num px-2 py-2.5 text-right text-muted-foreground">
        {formatVolume(merged.volume)}
      </td>
      <td className="px-2 py-2.5">
        {subLoading ? (
          <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
        ) : isPro ? (
          <ScoreBar score={a.score} />
        ) : (
          <ProLockChip />
        )}
      </td>
      <td className="px-4 py-2.5">
        {subLoading ? (
          <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted" />
        ) : isPro ? (
          <span
            className={cn(
              "num rounded border px-2 py-0.5 text-[11px] font-semibold transition-colors",
              verdictClass(a.verdict),
            )}
          >
            {a.verdict}
          </span>
        ) : (
          <ProLockChip />
        )}
      </td>
    </tr>
  );
}

export function StockTable({ stocks }: { stocks: Stock[] }) {
  const keys = stocks.map((s) => ({ exchange: s.exchange, symbol: s.symbol }));
  const { data: live } = useLiveQuotes(keys);
  const { data: liveFundamentals, isFetching: fundamentalsLoading } =
    useLiveFundamentalsBatch(keys);
  const { data: screenerRatios } = useScreenerRatiosBatch(keys);
  const { isPro, loading: subLoading } = useSubscription();

  if (stocks.length === 0) {
    return (
      <p className="animate-fade-in rounded-lg border border-border bg-panel p-8 text-center text-sm text-muted-foreground">
        No companies match these filters.
      </p>
    );
  }

  return (
    <div className="animate-fade-in-up overflow-x-auto rounded-lg border border-border bg-panel">
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
          {stocks.map((s, i) => (
            <StockRow
              key={`${s.exchange}-${s.symbol}`}
              stock={s}
              quote={live?.[quoteKey(s)]}
              fundamentals={liveFundamentals?.[quoteKey(s)]}
              screener={screenerRatios?.[quoteKey(s)]}
              isPro={isPro}
              subLoading={subLoading}
              delayMs={Math.min(i, 20) * 15}
            />
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-bull align-middle" /> Live price
        for up to 60 rows here, refreshed every 15s. P/E, PEG and ROCE come from screener.in for
        Indian stocks (refreshed ~60s) and Yahoo Finance elsewhere (refreshed ~45s
        {fundamentalsLoading ? ", updating…" : ""}) for the first {Math.min(30, stocks.length)} rows
        in this view; the rest show modeled estimates until they refresh in.
        {!subLoading && !isPro ? (
          <>
            {" "}
            Score & verdict are a{" "}
            <Link to="/pricing" className="text-primary hover:underline">
              DeepScreen Pro
            </Link>{" "}
            feature.
          </>
        ) : null}
      </p>
    </div>
  );
}
