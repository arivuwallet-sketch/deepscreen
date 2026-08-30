import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Shell } from "@/components/ds/Shell";
import { PaywallGate } from "@/components/ds/PaywallGate";
import { CryptoChart } from "@/components/ds/CryptoChart";
import { SmcSignalCard } from "@/components/ds/SmcSignalCard";
import { useCryptoCandles, useCryptoTickers } from "@/hooks/useCrypto";
import { formatCompact, formatUsd, INTERVALS, type Interval } from "@/lib/crypto/binance";
import { analyzeSmc } from "@/lib/crypto/smc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crypto")({
  head: () => ({
    meta: [
      { title: "Crypto SMC Signals | DeepScreen" },
      {
        name: "description",
        content:
          "Live Binance market data with smart-money-concept structure, order blocks, fair value gaps and confluence-scored buy/sell signals.",
      },
    ],
  }),
  component: CryptoPage,
});

const DEFAULT_SYMBOL = "BTCUSDT";

function CryptoPage() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [timeframe, setTimeframe] = useState<Interval>("1h");
  const { data: tickers, isLoading: tickersLoading } = useCryptoTickers();
  const { data: candles, isLoading: candlesLoading } = useCryptoCandles(symbol, timeframe);

  const smc = useMemo(
    () => (candles && candles.length > 50 ? analyzeSmc(candles) : null),
    [candles],
  );
  const topTickers = useMemo(() => (tickers ?? []).slice(0, 20), [tickers]);
  const activeTicker = tickers?.find((t) => t.symbol === symbol);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header>
          <p className="num text-xs uppercase tracking-[0.25em] text-primary">Crypto</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Smart Money Concepts signals</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Live Binance data — market structure, order blocks, fair value gaps, liquidity sweeps
            and volume-profile POC, scored into a confluence signal only when all 5 confluences
            agree.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-lg border border-border bg-panel">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Top pairs by volume
              </h2>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {tickersLoading ? (
                <p className="p-4 text-xs text-muted-foreground">Loading tickers…</p>
              ) : (
                topTickers.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => setSymbol(t.symbol)}
                    className={cn(
                      "num flex w-full items-center justify-between border-b border-border/50 px-4 py-2 text-left text-xs transition-colors last:border-0 hover:bg-accent/50",
                      symbol === t.symbol && "bg-accent",
                    )}
                  >
                    <span className="font-semibold">
                      {t.base}
                      <span className="text-muted-foreground">/{t.quote}</span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span>${formatUsd(t.price)}</span>
                      <span className={t.changePct >= 0 ? "text-bull" : "text-bear"}>
                        {t.changePct >= 0 ? "+" : ""}
                        {t.changePct.toFixed(2)}%
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="num text-xl font-bold">
                  {symbol}
                  {activeTicker ? (
                    <span
                      className={cn(
                        "num ml-3 text-sm font-medium",
                        activeTicker.changePct >= 0 ? "text-bull" : "text-bear",
                      )}
                    >
                      ${formatUsd(activeTicker.price)} ({activeTicker.changePct >= 0 ? "+" : ""}
                      {activeTicker.changePct.toFixed(2)}%)
                    </span>
                  ) : null}
                </h2>
                {activeTicker ? (
                  <p className="num mt-1 text-xs text-muted-foreground">
                    24h vol {formatCompact(activeTicker.quoteVolume)} {activeTicker.quote} · high $
                    {formatUsd(activeTicker.high)} · low ${formatUsd(activeTicker.low)}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-1">
                {INTERVALS.map((iv) => (
                  <button
                    key={iv}
                    type="button"
                    onClick={() => setTimeframe(iv)}
                    className={cn(
                      "num rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      timeframe === iv
                        ? "bg-primary text-primary-foreground"
                        : "bg-panel text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {iv}
                  </button>
                ))}
              </div>
            </div>

            <PaywallGate
              feature="Crypto SMC confirmed signals"
              className="mt-4"
              minHeight="min-h-[420px]"
            >
              <div className="rounded-lg border border-border bg-panel p-3">
                {candlesLoading || !candles ? (
                  <div className="flex h-[380px] items-center justify-center text-xs text-muted-foreground">
                    Loading chart…
                  </div>
                ) : (
                  <CryptoChart candles={candles} smc={smc} />
                )}
              </div>
              <div className="mt-4">
                {smc ? (
                  <SmcSignalCard smc={smc} symbol={symbol} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Not enough candle history yet to compute a signal for this pair/interval.
                  </p>
                )}
              </div>
            </PaywallGate>
          </div>
        </section>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Market data via Binance's public data mirror. Signals require every one of 5 confluences
          (structure, EMA trend, order block/FVG, liquidity sweep, volume-profile POC) to agree —
          analytical model output, not investment advice.
        </p>
      </div>
    </Shell>
  );
}
