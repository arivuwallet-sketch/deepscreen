import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { metaKeywords, optionsKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { formatPrice } from "@/lib/deepscreen/format";
import { searchStocks, findStock } from "@/lib/deepscreen/stocks";
import { buildStrategies, type StrategyResult } from "@/lib/options/greeks";
import { cn } from "@/lib/utils";
import type { Stock } from "@/lib/deepscreen/types";

export const Route = createFileRoute("/options")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Options Strategy Lab — Greeks & 12 Strategies | DeepScreen" },
      {
        name: "description",
        content:
          "Black-Scholes Greeks (delta, gamma, theta, vega, rho) and full payoff analytics for long calls, spreads, backspreads, strangles, collars, butterflies and straddles.",
      },
      { property: "og:title", content: "Options Strategy Lab — DeepScreen" },
      {
        property: "og:description",
        content:
          "Compare every options strategy side by side with exact Greeks, breakevens, max profit/loss and probability of profit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://deepscreen.online/options" },
      { name: "keywords", content: metaKeywords(optionsKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/options" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
            { "@type": "ListItem", position: 2, name: "Options strategy lab", item: "https://deepscreen.online/options" },
          ],
        }),
      },
    ],
  }),
  component: OptionsPage,
});

const OUTLOOK_CLASS: Record<StrategyResult["outlook"], string> = {
  bullish: "bg-bull/15 text-bull border-bull/40",
  bearish: "bg-bear/15 text-bear border-bear/40",
  neutral: "bg-neutralq/10 text-neutralq border-neutralq/30",
  volatility: "bg-warn/15 text-warn border-warn/40",
};

function OptionsPage() {
  const [query, setQuery] = useState("RELIANCE");
  const [picked, setPicked] = useState<Stock>(() => findStock("NSE", "RELIANCE") ?? searchStocks("A", 1)[0]!);
  const [volPct, setVolPct] = useState(28);
  const [ratePct, setRatePct] = useState(6.5);
  const [days, setDays] = useState(30);
  const [outlook, setOutlook] = useState<"all" | StrategyResult["outlook"]>("all");

  const matches = useMemo(() => (query.length >= 2 ? searchStocks(query, 6) : []), [query]);
  const { data: quote } = useLiveQuote(picked.exchange, picked.symbol);
  const spot = quote?.price ?? picked.price;

  const strategies = useMemo(
    () =>
      buildStrategies({
        spot,
        vol: volPct / 100,
        rate: ratePct / 100,
        days,
        dividendYield: picked.fundamentals.dividendYield / 100,
      }),
    [spot, volPct, ratePct, days, picked],
  );
  const shown = strategies.filter((s) => outlook === "all" || s.outlook === outlook);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Options strategy lab</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Black-Scholes-Merton pricing with dividend yield, exact Greeks per leg, payoff scan and
          lognormal probability of profit — all 12 strategies evaluated at once on the live spot.
        </p>

        <div className="mt-6 grid gap-4 rounded-lg border border-border p-4 md:grid-cols-4">
          <div className="relative md:col-span-1">
            <label className="text-xs uppercase text-muted-foreground">Underlying</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Search symbol"
            />
            {matches.length > 0 && query.toUpperCase() !== picked.symbol ? (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded border border-border bg-background shadow-lg">
                {matches.map((m) => (
                  <li key={`${m.exchange}:${m.symbol}`}>
                    <button
                      type="button"
                      onPointerDown={() => {
                        setPicked(m);
                        setQuery(m.symbol);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-accent"
                    >
                      <span className="font-semibold">{m.symbol}</span>{" "}
                      <span className="text-muted-foreground">
                        {m.exchange} · {m.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="num mt-2 text-xs text-muted-foreground">
              Spot {formatPrice(spot, picked.exchange)} · {picked.exchange}
            </div>
          </div>
          <SliderField label="Implied volatility" value={volPct} min={5} max={120} step={1} suffix="%" onChange={setVolPct} />
          <SliderField label="Risk-free rate" value={ratePct} min={0} max={15} step={0.1} suffix="%" onChange={setRatePct} />
          <SliderField label="Days to expiry" value={days} min={1} max={365} step={1} suffix="d" onChange={setDays} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {(["all", "bullish", "bearish", "neutral", "volatility"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutlook(o)}
              className={cn(
                "rounded border border-border px-3 py-1.5 capitalize transition-colors",
                outlook === o ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {shown.map((s) => (
            <StrategyCard key={s.key} s={s} exchange={picked.exchange} spot={spot} />
          ))}
        </div>
      </div>
      <TopicIndex ids={["options"]} title={"Options, futures and derivatives topics"} />
    </Shell>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs uppercase text-muted-foreground">{label}</label>
        <span className="num text-sm font-semibold">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-primary"
      />
    </div>
  );
}

function StrategyCard({ s, exchange, spot }: { s: StrategyResult; exchange: string; spot: number }) {
  return (
    <article className="rounded-lg border border-border p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{s.name}</h2>
        <span className={cn("rounded border px-2 py-0.5 text-[10px] uppercase", OUTLOOK_CLASS[s.outlook])}>
          {s.outlook}
        </span>
        <span className="num ml-auto text-xs text-muted-foreground">
          {s.netDebit >= 0 ? "Debit" : "Credit"} {Math.abs(s.netDebit).toFixed(2)}
        </span>
      </header>

      <ul className="num mt-2 space-y-0.5 text-xs text-muted-foreground">
        {s.legs.map((l, i) => (
          <li key={i}>{l.label} @ {l.premium.toFixed(2)}</li>
        ))}
      </ul>

      <div className="mt-3 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={s.payoff}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="spot" tick={{ fontSize: 10 }} tickFormatter={(v: number) => v.toFixed(0)} />
            <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={(v: number) => v.toFixed(0)} />
            <Tooltip
              formatter={(v: number) => [v.toFixed(2), "P&L"]}
              labelFormatter={(v: number) => `Spot ${v.toFixed(2)}`}
              contentStyle={{ fontSize: 12 }}
            />
            <ReferenceLine y={0} stroke="currentColor" opacity={0.4} />
            <ReferenceLine x={spot} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.18} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <Row label="Max profit" value={s.maxProfit === null ? "Unlimited" : s.maxProfit.toFixed(2)} />
        <Row label="Max loss" value={s.maxLoss === null ? "Unlimited" : s.maxLoss.toFixed(2)} />
        <Row label="POP" value={`${s.probProfit}%`} />
        <Row
          label="Breakevens"
          value={s.breakevens.length ? s.breakevens.map((b) => formatPrice(b, exchange)).join(", ") : "—"}
        />
        <Row label="Delta" value={s.greeks.delta.toFixed(3)} />
        <Row label="Gamma" value={s.greeks.gamma.toFixed(5)} />
        <Row label="Theta / day" value={s.greeks.theta.toFixed(3)} />
        <Row label="Vega" value={s.greeks.vega.toFixed(3)} />
        <Row label="Rho" value={s.greeks.rho.toFixed(3)} />
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">{s.bestWhen}</p>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase text-muted-foreground">{label}</dt>
      <dd className="num font-medium">{value}</dd>
    </div>
  );
}
