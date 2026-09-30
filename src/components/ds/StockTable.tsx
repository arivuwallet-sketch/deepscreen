import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  quoteKey,
  useLiveFundamentalsBatch,
  useLiveQuotes,
  useScreenerRatiosBatch,
} from "@/hooks/useLiveQuotes";

import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { mergeLiveStock } from "@/lib/deepscreen/live-merge";
import { formatCap, formatPrice, formatVolume } from "@/lib/deepscreen/format";
import type { Stock } from "@/lib/deepscreen/types";
import { liveMarketCapBillions, liveQuoteVolume } from "@/lib/market/live-equity-stats";
import type { LiveFundamentals, LiveQuote } from "@/lib/market/yahoo.server";
import type { ScreenerRatios } from "@/lib/market/screener.server";
import { cn } from "@/lib/utils";

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

function usePriceFlash(value: number) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(value > prevRef.current ? "up" : "down");
      prevRef.current = value;
      const timer = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(timer);
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
  delayMs,
}: {
  stock: Stock;
  quote: LiveQuote | null | undefined;
  fundamentals: LiveFundamentals | null | undefined;
  screener: ScreenerRatios | null | undefined;
  delayMs: number;
}) {
  const { stock: merged } = mergeLiveStock(stock, quote, fundamentals, screener);
  const analysis = analyze(merged);
  const priceFlash = usePriceFlash(merged.price);
  const marketCap = liveMarketCapBillions(quote, fundamentals);
  const volume = liveQuoteVolume(quote);

  return (
    <tr className="group animate-fade-in hover:bg-accent/40" style={{ animationDelay: `${delayMs}ms` }}>
      <td className="num px-4 py-2.5 font-semibold text-primary">
        <Link to="/stock/$exchange/$symbol" params={{ exchange: stock.exchange, symbol: stock.symbol }}>
          {stock.symbol}
        </Link>
      </td>
      <td className="max-w-[220px] truncate px-2 py-2.5">
        <Link to="/stock/$exchange/$symbol" params={{ exchange: stock.exchange, symbol: stock.symbol }}>
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
        {quote ? formatPrice(merged.price, stock.exchange) : "—"}
        {quote ? <span className="ml-1 inline-block size-1.5 rounded-full bg-bull align-middle" title="Latest provider quote" /> : null}
      </td>
      <td className={cn("num px-2 py-2.5 text-right font-medium", merged.changePct >= 0 ? "text-bull" : "text-bear")}>
        {quote ? `${merged.changePct >= 0 ? "+" : ""}${merged.changePct.toFixed(2)}%` : "—"}
      </td>
      <td className="num px-2 py-2.5 text-right">
        {marketCap.value !== null ? formatCap(marketCap.value, stock.exchange) : "—"}
        {marketCap.source !== "unavailable" ? (
          <span
            className="ml-1 inline-block size-1.5 rounded-full bg-bull align-middle"
            title={
              marketCap.source === "quote-derived"
                ? "Latest quote × reported shares outstanding"
                : "Latest available provider market cap"
            }
          />
        ) : null}
      </td>
      <td className="num px-2 py-2.5 text-right">{merged.fundamentals.pe.toFixed(1)}</td>
      <td className="num px-2 py-2.5 text-right">{merged.fundamentals.peg.toFixed(2)}</td>
      <td className="num px-2 py-2.5 text-right">{merged.fundamentals.roce.toFixed(1)}%</td>
      <td className="num px-2 py-2.5 text-right text-muted-foreground">
        {volume !== null ? formatVolume(volume) : "—"}
        {volume !== null ? (
          <span className="ml-1 inline-block size-1.5 rounded-full bg-bull align-middle" title="Latest provider volume" />
        ) : null}
      </td>
      <td className="px-2 py-2.5" title="Calculated from the available live and modeled fundamentals">
        <ScoreBar score={analysis.score} />
      </td>
      <td className="px-4 py-2.5">
        <span className={cn("num rounded border px-2 py-0.5 text-[11px] font-semibold transition-colors", verdictClass(analysis.verdict))}>
          {analysis.verdict}
        </span>
      </td>
    </tr>
  );
}

export function StockTable({ stocks }: { stocks: Stock[] }) {
  const keys = stocks.map((stock) => ({ exchange: stock.exchange, symbol: stock.symbol, name: stock.name }));
  const { data: live } = useLiveQuotes(keys);
  const { data: liveFundamentals, isFetching: fundamentalsLoading } = useLiveFundamentalsBatch(keys);
  const { data: screenerRatios } = useScreenerRatiosBatch(keys);

  if (stocks.length === 0) {
    return <p className="animate-fade-in rounded-lg border border-border bg-panel p-8 text-center text-sm text-muted-foreground">No companies match these filters.</p>;
  }

  return (
    <div className="animate-fade-in-up overflow-x-auto rounded-lg border border-border bg-panel">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="num border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">Symbol</th>
            <th scope="col" className="px-2 py-2.5 font-medium">Company</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">Price</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">Chg %</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">Mkt Cap</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">P/E</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">PEG</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">ROCE</th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium">Vol</th>
            <th scope="col" className="px-2 py-2.5 font-medium">Score</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stocks.map((stock, index) => (
            <StockRow
              key={`${stock.exchange}-${stock.symbol}`}
              stock={stock}
              quote={live?.[quoteKey(stock)]}
              fundamentals={liveFundamentals?.[quoteKey(stock)]}
              screener={screenerRatios?.[quoteKey(stock)]}
              delayMs={Math.min(index, 20) * 15}
            />
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-bull align-middle" /> Price, volume and quote-derived market cap refresh every 15s while upstream quote data is available. Market cap uses latest price × reported shares outstanding, with provider market cap as a fallback{fundamentalsLoading ? " (updating…)" : ""}. Exchange/provider data can be delayed, especially outside market hours. Scores and verdicts are unchanged.
      </p>
    </div>
  );
}
