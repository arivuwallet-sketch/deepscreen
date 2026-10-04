import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Activity } from "lucide-react";
import { commodityAnalysis } from "@/lib/market/commodity-analysis";
import type { CommodityBar, CommoditySnapshot } from "@/lib/market/commodity-analysis";

export const COMMODITIES = [
  { symbol: "GC=F", name: "Gold", contract: "COMEX gold futures", unit: "troy ounce", decimals: 2 },
  {
    symbol: "SI=F",
    name: "Silver",
    contract: "COMEX silver futures",
    unit: "troy ounce",
    decimals: 3,
  },
  {
    symbol: "CL=F",
    name: "WTI crude oil",
    contract: "NYMEX WTI crude futures",
    unit: "barrel",
    decimals: 2,
  },
  {
    symbol: "NG=F",
    name: "Natural gas",
    contract: "Henry Hub natural gas futures",
    unit: "MMBtu",
    decimals: 3,
  },
  { symbol: "HG=F", name: "Copper", contract: "COMEX copper futures", unit: "pound", decimals: 4 },
] as const;
const percent = (value: number | null) =>
  value === null ? "Unavailable" : `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
const stamp = (value: string | null) =>
  value ? `${value.slice(0, 10)} ${value.slice(11, 16)} UTC` : "Unavailable";
const tone = (value: number | null) =>
  value === null || value === 0 ? "text-muted-foreground" : value > 0 ? "text-bull" : "text-bear";
const number = (value: number | null, decimals = 2) =>
  value === null
    ? "Unavailable"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(value);

function PriceHistory({
  bars,
  name,
  decimals,
}: {
  bars: CommodityBar[];
  name: string;
  decimals: number;
}) {
  const [period, setPeriod] = useState<"1M" | "3M">("3M");
  const [index, setIndex] = useState<number | null>(null);
  const shown = period === "1M" ? bars.slice(-22) : bars;
  if (shown.length < 2)
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
        Historical prices are unavailable. The chart will appear when the provider returns at least
        two observations.
      </p>
    );
  const prices = shown.map((bar) => bar.close);
  const min = Math.min(...prices),
    max = Math.max(...prices),
    pad = Math.max((max - min) * 0.12, Math.abs(max) * 0.001, 0.001);
  const low = min - pad,
    high = max + pad;
  const x = (i: number) => 68 + (i / (shown.length - 1)) * 716;
  const y = (price: number) => 18 + ((high - price) / (high - low)) * 180;
  const active = Math.min(index ?? shown.length - 1, shown.length - 1);
  const point = shown[active]!;
  const path = shown
    .map((bar, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(bar.close).toFixed(2)}`)
    .join(" ");
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Daily price history</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {new Date(point.time * 1000).toISOString().slice(0, 10)} ·{" "}
            {number(point.close, decimals)}
          </p>
        </div>
        <div className="flex gap-2">
          {(["1M", "3M"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              onClick={() => {
                setPeriod(value);
                setIndex(null);
              }}
              className={`rounded-lg border px-3 py-2 text-xs ${period === value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>Range low: {number(min, decimals)}</span>
        <span>Range high: {number(max, decimals)}</span>
      </div>
      <svg
        viewBox="0 0 800 235"
        className="w-full text-primary"
        role="img"
        aria-label={`${name} daily closing-price history. Use the slider below to inspect values.`}
      >
        <title>{`${name}: daily closing prices`}</title>
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1="68"
              x2="784"
              y1={18 + fraction * 180}
              y2={18 + fraction * 180}
              stroke="currentColor"
              opacity="0.12"
            />
          </g>
        ))}
        <path d={`${path} L784,198 L68,198 Z`} fill="currentColor" opacity="0.07" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line
          x1={x(active)}
          x2={x(active)}
          y1="18"
          y2="198"
          stroke="currentColor"
          strokeDasharray="4 4"
          opacity=".45"
        />
        <circle cx={x(active)} cy={y(point.close)} r="4" fill="currentColor" />
      </svg>
      <div className="flex justify-between gap-2 font-mono text-xs text-muted-foreground">
        <span>{new Date(shown[0]!.time * 1000).toISOString().slice(0, 10)}</span>
        <span>{new Date(shown.at(-1)!.time * 1000).toISOString().slice(0, 10)}</span>
      </div>
      <label className="mt-2 block text-xs text-muted-foreground">
        Inspect daily close
        <input
          aria-label={`${name}: inspect daily close`}
          type="range"
          min="0"
          max={shown.length - 1}
          value={active}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        {shown.length} provider observations. Latest daily bar may be incomplete; contract rolls can
        create price gaps.
      </p>
    </div>
  );
}

export function CommodityDashboard({
  data,
  refreshing,
  error,
  refresh,
}: {
  data: CommoditySnapshot;
  refreshing: boolean;
  error: boolean;
  refresh: () => void;
}) {
  const [symbol, setSymbol] = useState<string>("GC=F");
  const selected = COMMODITIES.find((item) => item.symbol === symbol) ?? COMMODITIES[0];
  const quote = data.quotes[selected.symbol];
  const analysis = commodityAnalysis(quote?.history ?? []);
  const now = Date.parse(data.checkedAt);
  const usable = COMMODITIES.filter((item) => data.quotes[item.symbol]);
  const changes = usable
    .map((item) => ({ ...item, quote: data.quotes[item.symbol]! }))
    .filter(
      (item) =>
        item.quote.changePct !== null &&
        !item.quote.cached &&
        now - Date.parse(item.quote.asOf) < 18 * 60 * 60_000,
    );
  const strongest = [...changes].sort((a, b) => b.quote.changePct! - a.quote.changePct!)[0];
  const weakest = [...changes].sort((a, b) => a.quote.changePct! - b.quote.changePct!)[0];
  const stale = quote ? now - Date.parse(quote.asOf) > 18 * 60 * 60_000 : false;
  return (
    <section className="mt-10" aria-label="Commodity market dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Activity size={18} className="text-primary" /> Futures market monitor
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Refreshes every 60 seconds while open · Checked {stamp(data.checkedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh quotes"}
        </button>
      </div>
      {(error || data.unavailable.length > 0) && (
        <p role="status" className="mt-4 rounded-lg border border-warn/30 bg-warn/5 p-4 text-sm">
          {usable.length
            ? "Some feeds could not refresh. Retained quotes keep their original market timestamps and are marked cached."
            : "The market-data provider is temporarily unavailable. Use Refresh quotes to retry; no sample prices are substituted."}
        </p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {COMMODITIES.map((item) => {
          const q = data.quotes[item.symbol];
          const old = q && now - Date.parse(q.asOf) > 18 * 60 * 60_000;
          return (
            <button
              key={item.symbol}
              type="button"
              aria-pressed={symbol === item.symbol}
              onClick={() => setSymbol(item.symbol)}
              className={`min-w-0 rounded-xl border p-4 text-left transition-colors ${symbol === item.symbol ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
            >
              <span className="text-sm font-semibold">{item.name}</span>
              <span className="mt-3 block font-mono text-xl font-semibold">
                {q ? number(q.price, item.decimals) : "Unavailable"}
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {q?.currency ?? "USD"} / {item.unit}
              </span>
              <span
                className={`mt-3 flex items-center gap-1 font-mono text-sm ${tone(q?.changePct ?? null)}`}
              >
                {q?.changePct !== null &&
                  q?.changePct !== undefined &&
                  (q.changePct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
                {percent(q?.changePct ?? null)}
              </span>
              <span className="mt-2 block text-[10px] text-muted-foreground">
                {q
                  ? `${q.cached ? "Cached · " : old ? "Older / last session · " : "Quote · "}${stamp(q.asOf)}`
                  : "Awaiting provider"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Source: Yahoo Finance. Quotes may be delayed. Changes compare with the provider’s previous
        session close. Global futures benchmarks are not Indian spot, MCX, jewellery or pump prices.
      </p>
      {strongest && weakest && changes.length > 1 && (
        <div className="mt-5 rounded-xl border border-border bg-panel p-4 text-sm">
          <strong>Latest-session comparison:</strong> {strongest.name} has the strongest available
          change ({percent(strongest.quote.changePct)}); {weakest.name} has the weakest (
          {percent(weakest.quote.changePct)}).{" "}
          {changes.filter((item) => item.quote.changePct! > 0).length} of {changes.length}{" "}
          comparable quotes are higher. Quotes may have different timestamps; this describes price
          movement, not its cause.
        </div>
      )}
      <div className="mt-7 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{selected.name} analysis</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected.contract} · {quote?.exchange || selected.symbol} ·{" "}
              {quote?.currency ?? "USD"} per {selected.unit}
            </p>
          </div>
          <a
            href={
              quote?.sourceUrl ??
              `https://finance.yahoo.com/quote/${encodeURIComponent(selected.symbol)}/`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View provider quote <ArrowUpRight size={15} />
          </a>
        </div>
        {quote ? (
          <>
            <p className="mt-3 text-xs text-muted-foreground">
              Market timestamp: {stamp(quote.asOf)}
              {quote.cached
                ? " · Cached after a failed refresh"
                : stale
                  ? " · Older quote / last available session; not a current tick"
                  : " · Provider snapshot; may be delayed"}
            </p>
            <dl className="my-6 grid grid-cols-2 gap-4 border-y border-border py-5 sm:grid-cols-4">
              {[
                ["Previous close", number(quote.previousClose, selected.decimals)],
                [
                  "Session low / high",
                  `${number(quote.dayLow, selected.decimals)} / ${number(quote.dayHigh, selected.decimals)}`,
                ],
                [
                  "Reported volume",
                  quote.volume === null
                    ? "Unavailable"
                    : new Intl.NumberFormat("en-US").format(quote.volume),
                ],
                [
                  "Price change",
                  quote.previousClose === null
                    ? "Unavailable"
                    : number(quote.price - quote.previousClose, selected.decimals),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-2 break-words font-mono text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <PriceHistory
              key={selected.symbol}
              bars={quote.history}
              name={selected.name}
              decimals={selected.decimals}
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                ["20-observation change", percent(analysis.change20)],
                ["5-observation change", percent(analysis.change5)],
                [
                  "RSI (14, Wilder)",
                  analysis.rsi === null ? "Insufficient history" : analysis.rsi.toFixed(1),
                ],
                ["20-day average", number(analysis.sma20, selected.decimals)],
                ["50-day average", number(analysis.sma50, selected.decimals)],
                ["Trend alignment", analysis.trend],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-panel p-4">
                  <h3 className="text-xs text-muted-foreground">{label}</h3>
                  <p className="mt-2 font-mono text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-primary/5 p-4 text-sm leading-relaxed">
              <h3 className="font-semibold">What the observed data says</h3>
              <p className="mt-2">
                {analysis.sma20 !== null && analysis.last !== null
                  ? `The latest daily bar is ${analysis.last > analysis.sma20 ? "above" : analysis.last < analysis.sma20 ? "below" : "at"} its 20-observation average. ${analysis.trend === "Upward alignment" ? "The daily close is above the 20-day average, which is above the 50-day average." : analysis.trend === "Downward alignment" ? "The daily close is below the 20-day average, which is below the 50-day average." : "The available moving averages do not confirm a consistent directional alignment."}`
                  : "More daily observations are needed before a moving-average trend can be calculated."}
              </p>
              {analysis.rsi !== null && (
                <p className="mt-2">
                  RSI is {analysis.rsi.toFixed(1)}:{" "}
                  {analysis.rsi >= 70
                    ? "momentum is in the commonly watched upper band; strong trends can remain there."
                    : analysis.rsi <= 30
                      ? "momentum is in the commonly watched lower band; weakness can persist."
                      : "momentum is between the commonly watched 30 and 70 levels."}{" "}
                  This is a descriptive indicator, not a forecast or a buy/sell instruction.
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Computed from {analysis.bars} provider daily bars; last history observation{" "}
                {stamp(quote.historyAsOf)}. Indicators use closing prices, which can differ from the
                quote above. Missing history is not estimated.
              </p>
            </div>
          </>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            No verified quote is available for {selected.name}. Select another benchmark or retry
            the feed.
          </p>
        )}
      </div>
    </section>
  );
}
