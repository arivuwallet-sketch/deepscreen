import { OptionsMarketContext, useOptionsContext } from "@/components/research/OptionsMarketContext";
import { jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { PaywallGate } from "@/components/ds/PaywallGate";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { metaKeywords, optionsKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { formatPrice } from "@/lib/deepscreen/format";
import { searchStocks, findStock } from "@/lib/deepscreen/stocks";
import { buildStrategies, type StrategyResult } from "@/lib/options/greeks";
import { cn } from "@/lib/utils";
import type { Stock } from "@/lib/deepscreen/types";
import { STRATEGY_GUIDES } from "@/lib/seo/content";

export const Route = createFileRoute("/options/")({
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
      { name: "twitter:title", content: "Options Strategy Lab — Greeks & 12 Strategies | DeepScreen" },
      { name: "twitter:description", content: "Compare options Greeks, breakevens and multi-leg strategy payoffs." },
      { name: "keywords", content: metaKeywords(optionsKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/options" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
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
  const [manualSpot, setManualSpot] = useState("");
  const [dividendPct, setDividendPct] = useState(0);
  const [ratePct, setRatePct] = useState(6.5);
  const [days, setDays] = useState(30);
  const [outlook, setOutlook] = useState<"all" | StrategyResult["outlook"]>("all");

  const matches = useMemo(() => (query.length >= 2 ? searchStocks(query, 6) : []), [query]);
  const { data: marketData } = useOptionsContext(picked.exchange, picked.symbol);
  const enteredSpot = Number(manualSpot);
  const spot = manualSpot.trim() ? (Number.isFinite(enteredSpot) && enteredSpot > 0 ? enteredSpot : 0) : marketData?.price ?? 0;

  const strategies = useMemo(
    () =>
      spot > 0 ? buildStrategies({
        spot,
        vol: volPct / 100,
        rate: ratePct / 100,
        days,
        dividendYield: dividendPct / 100,
      }) : [],
    [spot, volPct, ratePct, days, dividendPct],
  );
  const shown = strategies.filter((s) => outlook === "all" || s.outlook === outlook);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Options strategy calculator: payoffs and Greeks</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Black-Scholes-Merton pricing with dividend yield, exact Greeks per leg, payoff scan and
          lognormal probability of profit — compare 12 theoretical strategies. The calculator uses a dated provider spot quote or your explicitly entered scenario price, with user-selected volatility, rate, dividend yield and expiry assumptions. Premiums are calculated estimates, not executable option-chain quotes.
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
                        setManualSpot("");
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
              {manualSpot.trim() ? "Scenario spot" : "Provider spot"} {spot > 0 ? formatPrice(spot, picked.exchange) : "Unavailable"} · {picked.exchange}
            </div>
          </div>
          <SliderField label="Assumed volatility" value={volPct} min={5} max={120} step={1} suffix="%" onChange={setVolPct} />
          <SliderField label="Risk-free rate" value={ratePct} min={0} max={15} step={0.1} suffix="%" onChange={setRatePct} />
          <SliderField label="Days to expiry" value={days} min={1} max={365} step={1} suffix="d" onChange={setDays} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Optional scenario spot (leave blank for provider price)<input type="number" min="0.0001" step="any" value={manualSpot} onChange={e=>setManualSpot(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm" placeholder="Use provider quote" /></label><SliderField label="Assumed dividend yield" value={dividendPct} min={0} max={20} step={0.1} suffix="%" onChange={setDividendPct}/></div>
        <OptionsMarketContext market={picked.exchange} code={picked.symbol} days={days} assumedVol={volPct} onUseVol={setVolPct}/>
        {spot <= 0 && <p role="status" className="my-4 rounded-lg border border-border p-4 text-sm">Waiting for a verified spot quote. Enter a scenario price to run the model while the provider is unavailable.</p>}
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

        <PaywallGate
          strict
          feature="Options Strategy Lab payoff analytics"
          className="mt-6"
          minHeight="min-h-[520px]"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {shown.map((s) => (
              <StrategyCard key={s.key} s={s} exchange={picked.exchange} spot={spot} />
            ))}
          </div>
        </PaywallGate>
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Options strategy guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STRATEGY_GUIDES.map((strategy) => (
              <Link key={strategy.slug} to="/options/$slug" params={{ slug: strategy.slug }} className="rounded-lg border border-border bg-panel p-4 hover:border-primary">
                <h3 className="font-semibold">{strategy.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{strategy.outlook} · {strategy.risk}</p>
              </Link>
            ))}
          </div>
        </section>
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
        aria-label={label}
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
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="spot" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => v.toFixed(0)} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={44} tickFormatter={(v: number) => v.toFixed(0)} />
            <Tooltip
              formatter={(v: number) => [v.toFixed(2), "P&L"]}
              labelFormatter={(v: number) => `Spot ${v.toFixed(2)}`}
              contentStyle={{ fontSize: 12, background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
              itemStyle={{ color: "var(--primary)" }}
            />
            <ReferenceLine y={0} stroke="currentColor" opacity={0.4} />
            <ReferenceLine x={spot} stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="var(--primary)"
              fillOpacity={0.18}
            />
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
