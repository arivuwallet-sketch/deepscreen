import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useMemo, useState } from "react";
import { Activity, Crosshair, ExternalLink, Layers3, Radio, Search } from "lucide-react";
import { getCandles, TIMEFRAMES, type Timeframe } from "@/lib/chart-reader/market.functions";
import { analyze, fmtPrice, trendBias, type Bias } from "@/lib/chart-reader/analysis";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaybookPanel } from "@/components/chart-reader/PlaybookPanel";
import { Shell } from "@/components/ds/Shell";
import { MarketEducationFaqSection } from "@/components/ds/MarketEducationFaqSection";
import { marketEducationFaq } from "@/lib/seo/market-education-faq";
import { deepChartKeywords, cryptoTradingKeywords, forexTradingKeywords, metaKeywords, tradingKeywords } from "@/lib/seo/keywords";
import { buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";
import "@/components/chart-reader/chart-reader.css";

const PriceChart = lazy(() =>
  import("@/components/chart-reader/PriceChart").then((m) => ({ default: m.PriceChart })),
);

const DEEPCHART_URL = "https://deepscreen.online/chart-reader";
const DEEPCHART_FAQS = marketEducationFaq("DEEPCHART");

export const Route = createFileRoute("/chart-reader")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Technical Analysis Charts for Stocks, Crypto & Forex | DeepChart" },
      {
        name: "description",
        content:
          "Analyze stocks, crypto, forex, indices and commodities with market structure, support and resistance, RSI, EMA, VWAP, Fibonacci, volume profile, liquidity and multi-timeframe context.",
      },
      { name: "keywords", content: metaKeywords(deepChartKeywords, tradingKeywords, cryptoTradingKeywords, forexTradingKeywords) },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:title", content: "Technical Analysis Charts for Stocks, Crypto & Forex | DeepChart" },
      {
        property: "og:description",
        content:
          "Technical setups, levels and trade-management context with the reasoning behind each reading.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: DEEPCHART_URL },
      { rel: "describedby", href: "https://deepscreen.online/faq-index.txt" },
      { rel: "help", href: "https://deepscreen.online/trading" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: jsonLd(buildGraph(
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema({
          name: "DeepChart — Technical Analysis for Stocks, Forex, Crypto & Commodities",
          description: "Explainable technical analysis using structure, momentum, volatility, liquidity, levels and multi-timeframe context.",
          url: DEEPCHART_URL,
        }),
        buildFAQSchema(DEEPCHART_FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))),
      )),
    }],
  }),
  component: Index,
});

const MARKETS: { group: string; items: [string, string][] }[] = [
  {
    group: "Crypto",
    items: [
      ["BTC-USD", "Bitcoin"],
      ["ETH-USD", "Ethereum"],
      ["SOL-USD", "Solana"],
      ["XRP-USD", "XRP"],
    ],
  },
  {
    group: "Forex",
    items: [
      ["EURUSD=X", "EUR/USD"],
      ["GBPUSD=X", "GBP/USD"],
      ["USDJPY=X", "USD/JPY"],
      ["USDINR=X", "USD/INR"],
    ],
  },
  {
    group: "Commodities",
    items: [
      ["GC=F", "Gold"],
      ["SI=F", "Silver"],
      ["CL=F", "Crude Oil"],
      ["NG=F", "Nat Gas"],
    ],
  },
  {
    group: "Stocks",
    items: [
      ["AAPL", "Apple"],
      ["NVDA", "Nvidia"],
      ["TSLA", "Tesla"],
      ["RELIANCE.NS", "Reliance"],
    ],
  },
  {
    group: "Indices",
    items: [
      ["^GSPC", "S&P 500"],
      ["^IXIC", "Nasdaq"],
      ["^NSEI", "Nifty 50"],
      ["^DJI", "Dow"],
    ],
  },
];
const HTF: Record<Timeframe, Timeframe | null> = {
  "1m": "15m",
  "5m": "1h",
  "15m": "4h",
  "1h": "1d",
  "4h": "1d",
  "1d": "1wk",
  "1wk": null,
};

function Index() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [tf, setTf] = useState<Timeframe>("1h");
  const [custom, setCustom] = useState("");
  const [group, setGroup] = useState("Crypto");
  const fetchCandles = useServerFn(getCandles);
  const refresh = tf === "1m" || tf === "5m" ? 10_000 : 20_000;

  const main = useQuery({
    queryKey: ["candles", symbol, tf],
    queryFn: () => fetchCandles({ data: { symbol, tf } }),
    refetchInterval: refresh,
    retry: 1,
  });
  const htfTf = HTF[tf];
  const htf = useQuery({
    queryKey: ["candles", symbol, htfTf],
    queryFn: () => fetchCandles({ data: { symbol, tf: htfTf! } }),
    enabled: !!htfTf,
    refetchInterval: 120_000,
    retry: 1,
  });

  const analysis = useMemo(() => {
    if (!main.data || main.data.candles.length < 60) return null;
    const hb: Bias | null = htf.data ? trendBias(htf.data.candles) : null;
    return analyze(main.data.candles, hb);
  }, [main.data, htf.data]);

  const last = main.data?.candles.at(-1);
  const prev = main.data?.candles.at(-2);
  const chg = last && prev ? ((last.close - prev.close) / prev.close) * 100 : 0;

  const groupItems = MARKETS.find((g) => g.group === group)?.items ?? [];
  const known = MARKETS.flatMap((g) => g.items).find(([s]) => s === symbol);

  return (
    <Shell>
      <div className="ds-chart-reader">
        <section className="ds-cr-intro ds-enter">
          <div className="ds-cr-intro-inner">
            <div className="ds-cr-intro-copy">
              <p className="ds-eyebrow">
                <span aria-hidden="true" />
                DeepChart / live technical workspace
              </p>
              <h1>
                DeepChart.
                <br />
                <span>Read the structure.</span>
              </h1>
              <p>
                A technical reading layer for stocks, indices, forex, crypto and commodities.
                DeepScreen combines market structure, momentum, liquidity, volatility and
                multi-timeframe context into one explainable workspace.
              </p>
            </div>
            <div className="ds-cr-intro-metrics" aria-label="DeepChart coverage">
              <div>
                <Activity size={16} />
                <span>5</span>
                <small>market groups</small>
              </div>
              <div>
                <Layers3 size={16} />
                <span>{TIMEFRAMES.length}</span>
                <small>timeframes</small>
              </div>
              <div>
                <Crosshair size={16} />
                <span>HTF</span>
                <small>confirmation</small>
              </div>
            </div>
          </div>
        </section>

        <div className="ds-cr-workspace">
          <section className="ds-cr-command-bar" aria-label="DeepChart controls">
            <div className="ds-cr-market-tabs" role="group" aria-label="Market groups">
              {MARKETS.map((market) => (
                <button
                  type="button"
                  key={market.group}
                  aria-pressed={group === market.group}
                  onClick={() => setGroup(market.group)}
                >
                  {market.group}
                </button>
              ))}
            </div>
            <form
              className="ds-cr-symbol-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (custom.trim()) setSymbol(custom.trim().toUpperCase());
              }}
            >
              <Search size={15} aria-hidden="true" />
              <input
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                placeholder="Search symbol — MSFT, TCS.NS, AUDUSD=X"
                aria-label="Search market symbol"
              />
              <button type="submit">Read chart</button>
            </form>
          </section>

          <div className="ds-cr-instrument-strip" aria-label={`${group} instruments`}>
            {groupItems.map(([itemSymbol, name]) => (
              <button
                type="button"
                key={itemSymbol}
                aria-pressed={symbol === itemSymbol}
                onClick={() => setSymbol(itemSymbol)}
              >
                <span>{name}</span>
                <small>{itemSymbol}</small>
              </button>
            ))}
          </div>

          <div className="ds-cr-layout">
            <section className="ds-cr-main-column">
              <div className="ds-cr-market-header">
                <div className="ds-cr-security">
                  <p className="ds-eyebrow">
                    <span aria-hidden="true" />
                    {main.data?.type ?? "Market"} · {symbol}
                  </p>
                  <h2>{known?.[1] ?? main.data?.name ?? symbol}</h2>
                </div>

                {last && (
                  <div className="ds-cr-quote">
                    <strong>{fmtPrice(last.close)}</strong>
                    <span
                      className={cn(
                        "ds-cr-change",
                        chg >= 0 ? "is-positive" : "is-negative",
                      )}
                    >
                      {chg >= 0 ? "▲ +" : "▼ "}
                      {chg.toFixed(2)}%
                    </span>
                    <small>{main.data?.currency}</small>
                  </div>
                )}

                <div className="ds-cr-market-tools">
                  <div className="ds-cr-live-status">
                    <Radio size={13} aria-hidden="true" />
                    <span>{main.isFetching ? "Refreshing" : "Live"}</span>
                    <small>{refresh / 1000}s</small>
                  </div>
                  <div className="ds-cr-timeframes" role="group" aria-label="Chart timeframe">
                    {TIMEFRAMES.map((timeframe) => (
                      <button
                        type="button"
                        key={timeframe}
                        aria-pressed={tf === timeframe}
                        onClick={() => setTf(timeframe)}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ds-cr-chart-frame">
                <div className="ds-cr-chart-topline">
                  <div>
                    <p>Technical canvas</p>
                    <span>
                      EMA 20 / 50 / 200 · VWAP · Supertrend · liquidity · S/R · trade levels
                    </span>
                  </div>
                  <span className="ds-cr-engine-badge">DeepChart engine</span>
                </div>
                <div className="ds-cr-chart-canvas">
                  {main.isError ? (
                    <div className="ds-cr-state is-error">
                      <Crosshair size={24} aria-hidden="true" />
                      <strong>Chart data unavailable</strong>
                      <span>{(main.error as Error).message}. Check the symbol and try again.</span>
                    </div>
                  ) : !analysis || !main.data ? (
                    <div className="ds-cr-state">
                      <span className="ds-cr-loader" aria-hidden="true" />
                      <strong>
                        {main.isLoading ? "Reading the market…" : "Not enough history to analyze."}
                      </strong>
                      <span>
                        DeepChart is preparing price structure, volatility and multi-timeframe context.
                      </span>
                    </div>
                  ) : (
                    <Suspense
                      fallback={
                        <div className="ds-cr-state">
                          <span className="ds-cr-loader" aria-hidden="true" />
                          <strong>Rendering chart…</strong>
                        </div>
                      }
                    >
                      <PriceChart candles={main.data.candles} analysis={analysis} />
                    </Suspense>
                  )}
                </div>
              </div>

              {analysis && <Details a={analysis} htf={htfTf} />}
            </section>

            <aside className="ds-cr-sidebar">
              {analysis ? (
                <TradeTicket a={analysis} />
              ) : (
                <div className="ds-cr-card p-6">
                  <p className="ds-eyebrow">
                    <span aria-hidden="true" />
                    Analysis pending
                  </p>
                  <h2 className="mt-3 text-xl font-medium">The trade context appears here.</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Once enough price history is available, DeepScreen will show confluence,
                    confidence, structure, levels and risk context.
                  </p>
                </div>
              )}

              <section className="ds-cr-card ds-cr-partner-card p-5" aria-labelledby="tradingview-partner-title">
                <p className="ds-eyebrow">
                  <span aria-hidden="true" />
                  TradingView partner
                </p>
                <h2 id="tradingview-partner-title" className="mt-3 text-lg font-semibold">
                  Continue your chart research on TradingView
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Open TradingView for additional chart layouts, drawing tools, indicators and market views.
                </p>
                <a
                  href="https://in.tradingview.com/?aff_id=1171851"
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="ds-cr-partner-cta"
                >
                  Open TradingView
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                <p className="ds-cr-partner-disclosure">
                  Affiliate disclosure: DeepScreen may earn a commission if you sign up through this link, at no extra cost to you.
                </p>
              </section>
            </aside>
          </div>

          <footer className="ds-cr-disclaimer">
            <span>Technical research, not investment advice.</span>
            No method is 100% accurate. Free market data may be delayed by the exchange or provider,
            and any position should be sized so a stop-out is affordable.
          </footer>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <section className="mt-10 rounded-xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Learn the process</p>
            <h2 className="mt-2 text-xl font-semibold">Use the chart with a risk framework</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              DeepChart explains the technical condition; the supporting guides explain how to interpret
              the setup, size risk, and account for crypto or forex instrument mechanics.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a href="/blog/deepchart-technical-analysis-guide" className="text-primary hover:underline">How to read a chart</a>
              <a href="/blog/trading-risk-management-position-sizing" className="text-primary hover:underline">Trading risk management</a>
              <a href="/blog/crypto-trading-guide-spot-futures-risk" className="text-primary hover:underline">Crypto trading guide</a>
              <a href="/blog/forex-trading-guide-pips-leverage-risk-india" className="text-primary hover:underline">Forex trading guide</a>
              <a href="/trading" className="text-primary hover:underline">Trading Q&amp;A hub</a>
            </div>
          </section>

          <MarketEducationFaqSection
            faqs={DEEPCHART_FAQS}
            title="DeepChart questions answered"
            description="How DeepChart works, which markets and timeframes it covers, how to use support and resistance, and why no technical signal is guaranteed."
          />
        </div>
      </div>
    </Shell>
  );
}

type A = ReturnType<typeof analyze>;

function TradeTicket({ a }: { a: A }) {
  const p = a.plan;
  const long = p.direction === "LONG";
  const tone = a.verdict.includes("BUY") ? "bull" : a.verdict.includes("SELL") ? "bear" : "neutral";
  const ladder = [
    { k: "TP3", v: p.tp3, r: p.rr[2], c: "text-bull" },
    { k: "TP2", v: p.tp2, r: p.rr[1], c: "text-bull" },
    { k: "TP1", v: p.tp1, r: p.rr[0], c: "text-bull" },
    { k: "Entry", v: p.entry, r: null, c: "text-primary", sub: p.entryType },
    ...(p.deepEntry != null
      ? [{ k: "Deep limit", v: p.deepEntry, r: null, c: "text-neutralq", sub: "golden pocket / OB" }]
      : []),
    { k: "Trail", v: p.trailingStop, r: null, c: "text-neutralq", sub: "live exit" },
    { k: "Stop", v: p.stop, r: null, c: "text-bear", sub: `${p.riskPct.toFixed(2)}% risk` },
  ].sort((x, y) => (long ? y.v - x.v : x.v - y.v));

  return (
    <>
      <div className="ds-cr-card overflow-hidden">
        <div
          className={cn(
            "h-1",
            tone === "bull" ? "bg-bull" : tone === "bear" ? "bg-bear" : "bg-primary",
          )}
        />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="ds-eyebrow">The verdict</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
                a.grade === "A+" || a.grade === "A"
                  ? "bg-primary text-primary-foreground"
                  : a.grade === "B"
                    ? "border border-primary/50 text-primary"
                    : "border border-border text-muted-foreground",
              )}
            >
              Grade {a.grade}
            </span>
          </div>
          <div
            className={cn(
              "mt-2 text-5xl font-medium leading-[0.95] tracking-[-0.045em]",
              tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-foreground",
            )}
          >
            {a.verdict.charAt(0) + a.verdict.slice(1).toLowerCase()}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <Stat k="Confluence" v={`${a.score > 0 ? "+" : ""}${a.score.toFixed(1)}`} />
            <Stat k="Confidence" v={`${a.confidence}%`} />
            <Stat
              k="Status"
              v={p.status === "ACTIVE SETUP" ? "Active" : p.status === "NO TRADE" ? "No trade" : "Wait"}
              cls={
                p.status === "ACTIVE SETUP"
                  ? "text-bull"
                  : p.status === "NO TRADE"
                    ? "text-bear"
                    : "text-primary"
              }
            />
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                a.score >= 0 ? "bg-bull" : "bg-bear",
              )}
              style={{ width: `${Math.min(100, a.confidence)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="ds-cr-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="ds-eyebrow">Trade ticket</span>
          <span
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[11px] font-bold",
              long ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear",
            )}
          >
            {long ? "▲ LONG" : "▼ SHORT"}
          </span>
        </div>
        <ol className="relative">
          <span className="absolute bottom-3 left-[5px] top-3 w-px bg-border" />
          {ladder.map((l) => (
            <li key={l.k} className="relative flex items-center gap-3 py-2">
              <span className={cn("relative z-10 h-[11px] w-[11px] rounded-full border-2 border-card bg-current", l.c)} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{l.k}</div>
                {(l.sub || l.r != null) && (
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {l.r != null ? `${l.r.toFixed(1)}R reward` : l.sub}
                  </div>
                )}
              </div>
              <div className={cn("font-mono text-base font-medium tabular-nums", l.c)}>
                {fmtPrice(l.v)}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-3 rounded-md bg-secondary px-3 py-2 font-mono text-[11px] text-muted-foreground">
          Entry zone {fmtPrice(p.entryZone[0])} – {fmtPrice(p.entryZone[1])}
        </div>
      </div>

      <div className="ds-cr-card p-5">
        <Tabs defaultValue="entry">
          <TabsList className="mb-3 grid h-auto w-full grid-cols-5 bg-secondary p-0.5">
            {[
              ["entry", "Entry"],
              ["stop", "Stop"],
              ["tp", "Targets"],
              ["exit", "Exit"],
              ["size", "Size"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="px-1 py-1 text-xs">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="entry"><Reasons items={p.entryReason} /></TabsContent>
          <TabsContent value="stop">
            <Reasons items={[p.stopReason]} />
            <p className="mt-3 border-l-2 border-bear pl-3 text-xs text-bear">{p.invalidation}</p>
          </TabsContent>
          <TabsContent value="tp"><Reasons items={p.tpReason} /></TabsContent>
          <TabsContent value="exit"><Reasons items={p.exitRules} /></TabsContent>
          <TabsContent value="size"><Reasons items={[p.sizingNote]} /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function Details({ a, htf }: { a: A; htf: Timeframe | null }) {
  const groups = [...new Set(a.factors.map((f) => f.group))];
  const ind: [string, string][] = [
    ["RSI 14", a.indicators.rsi.toFixed(1)],
    [
      "StochRSI",
      Number.isFinite(a.indicators.stochK)
        ? `${a.indicators.stochK.toFixed(0)} / ${a.indicators.stochD.toFixed(0)}`
        : "—",
    ],
    ["ADX 14", a.indicators.adx.toFixed(1)],
    ["CCI 20", Number.isFinite(a.indicators.cci) ? a.indicators.cci.toFixed(0) : "—"],
    [
      "MFI 14",
      a.indicators.mfi != null && Number.isFinite(a.indicators.mfi) ? a.indicators.mfi.toFixed(0) : "—",
    ],
    ["ATR 14", `${fmtPrice(a.atr)} · ${a.indicators.atrPct.toFixed(0)}%ile`],
    ["Regime", a.regime],
    ["Volatility", a.volRegime],
    [
      "Supertrend",
      `${a.indicators.supertrendDir === 1 ? "Up" : "Down"} · ${fmtPrice(a.indicators.supertrend)}`,
    ],
    ["VWAP", a.indicators.vwap != null ? fmtPrice(a.indicators.vwap) : "—"],
    ["Structure", a.structure],
    ["Location", `${a.premium.zone} · ${a.premium.pct.toFixed(0)}%`],
  ];
  return (
    <Tabs defaultValue="playbook" className="ds-cr-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-medium tracking-[-0.035em]">
          The reading{htf && <span className="text-muted-foreground"> · HTF {htf}</span>}
        </h2>
        <TabsList className="bg-secondary p-0.5">
          <TabsTrigger value="playbook" className="text-xs">Playbook</TabsTrigger>
          <TabsTrigger value="reading" className="text-xs">Analysis</TabsTrigger>
          <TabsTrigger value="indicators" className="text-xs">Indicators</TabsTrigger>
          <TabsTrigger value="levels" className="text-xs">Levels</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="playbook">
        <PlaybookPanel pb={a.playbook} />
      </TabsContent>

      <TabsContent value="reading">
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g}>
              <div className="ds-eyebrow mb-2 border-b border-border pb-2">{g}</div>
              <ul className="space-y-2.5">
                {a.factors
                  .filter((f) => f.group === g)
                  .map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 font-mono text-xs",
                          f.bias === "bull" ? "text-bull" : f.bias === "bear" ? "text-bear" : "text-muted-foreground",
                        )}
                      >
                        {f.bias === "bull" ? "▲" : f.bias === "bear" ? "▼" : "●"}
                      </span>
                      <div>
                        <span className="font-semibold">{f.label}</span>
                        <span className="text-muted-foreground"> — {f.detail}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="indicators">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {ind.map(([k, v]) => (
            <div key={k} className="bg-card p-4">
              <div className="ds-eyebrow">{k}</div>
              <div className="mt-1 font-mono text-base">{v}</div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="levels">
        <div className="grid gap-6 md:grid-cols-2">
          <LevelList
            title="Support & resistance"
            rows={[...a.levels]
              .sort((x, y) => y.price - x.price)
              .map((l) => ({
                k: l.kind === "support" ? "Support" : "Resistance",
                v: `${fmtPrice(l.price)}  ×${l.touches}`,
                c: l.kind === "support" ? "text-bull" : "text-bear",
              }))}
          />
          <LevelList
            title="Fibonacci retracement"
            rows={a.fib.map((f) => ({ k: String(f.level), v: fmtPrice(f.price), c: "text-foreground" }))}
          />
          {a.profile && (
            <LevelList
              title="Volume profile · 150 bars"
              rows={[
                { k: "Value area high", v: fmtPrice(a.profile.vah), c: "text-foreground" },
                { k: "Point of control", v: fmtPrice(a.profile.poc), c: "text-primary" },
                { k: "Value area low", v: fmtPrice(a.profile.val), c: "text-foreground" },
              ]}
            />
          )}
          {a.pools.length > 0 && (
            <LevelList
              title="Liquidity pools (resting stops)"
              rows={a.pools.map((pl) => ({
                k: pl.kind === "equal-highs" ? "Buy-side (BSL)" : "Sell-side (SSL)",
                v: `${fmtPrice(pl.price)}  ×${pl.touches}`,
                c: pl.kind === "equal-highs" ? "text-bull" : "text-bear",
              }))}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function LevelList({ title, rows }: { title: string; rows: { k: string; v: string; c: string }[] }) {
  return (
    <section>
      <div className="ds-eyebrow mb-2 border-b border-border pb-2">{title}</div>
      <ul>
        {rows.map((r, i) => (
          <li key={i} className="flex justify-between border-b border-border/50 py-1.5 text-sm last:border-0">
            <span className="text-muted-foreground">{r.k}</span>
            <span className={cn("whitespace-pre font-mono tabular-nums", r.c)}>{r.v}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ k, v, cls }: { k: string; v: string; cls?: string }) {
  return (
    <div>
      <div className="ds-eyebrow">{k}</div>
      <div className={cn("mt-0.5 font-mono text-lg font-medium", cls)}>{v}</div>
    </div>
  );
}

function Reasons({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((r, i) => (
        <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
          <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-foreground/90">{r}</span>
        </li>
      ))}
    </ol>
  );
}
