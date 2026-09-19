import { buildArticleSchema, buildBreadcrumbSchema, buildCorporationSchema, buildFAQSchema, buildGraph, jsonLd } from "@/lib/seo/json-ld";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { learnKeywords, metaKeywords, stocksKeywords } from "@/lib/seo/keywords";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { DcfCalculator } from "@/components/ds/DcfCalculator";
import { GrahamCalculator } from "@/components/ds/GrahamCalculator";
import { PaywallGate, ProMetricValue } from "@/components/ds/PaywallGate";
import { useSubscription } from "@/hooks/useSubscription";
import {
  quoteKey,
  useLiveFundamentals,
  useLiveFundamentalsBatch,
  useLiveQuote,
  useLiveQuotes,
  useScreenerRatios,
  useScreenerRatiosBatch,
} from "@/hooks/useLiveQuotes";
import { HoldingPlanCard } from "@/components/ds/HoldingPlanCard";
import { PeerAnalysisPanel, type PeerRow } from "@/components/ds/PeerAnalysisPanel";
import {
  ForensicPanel,
  SecretTipsPanel,
  VisionCard,
} from "@/components/ds/GodsEyePanels";
import { buildIntel } from "@/lib/deepscreen/intel";
import { getIndexMemberships } from "@/lib/deepscreen/indices";
import { ScoreBar } from "@/components/ds/StockTable";
import { findStock, stocksByExchange } from "@/lib/deepscreen/stocks";
import { getStockSnapshot, type StockSnapshot } from "@/lib/market/snapshot.functions";
import { analyze, verdictClass } from "@/lib/deepscreen/metrics";
import { METRIC_KEY_TO_FIELD, mergeLiveStock } from "@/lib/deepscreen/live-merge";
import {
  CAP_LABEL,
  formatCap,
  formatPrice,
  formatVolume,
  newsSearchQuery,
} from "@/lib/deepscreen/format";
import { cn } from "@/lib/utils";
import { stockFaqs, stockSummary } from "@/lib/deepscreen/narrative";
import { StockSignupPrompt } from "@/components/ds/StockSignupPrompt";
import { WatchlistButton } from "@/components/ds/WatchlistButton";
import { FundamentalSnapshotPanel } from "@/components/ds/FundamentalSnapshotPanel";
import { ScoreExplanationPanel } from "@/components/ds/ScoreExplanationPanel";
import { ResearchAlertsPanel } from "@/components/ds/ResearchAlertsPanel";
import { ScoreChangePanel } from "@/components/ds/ScoreChangePanel";


function peerExchangeCodesFor(exchange: string): string[] {
  if (exchange === "NSE" || exchange === "BSE") return ["NSE", "BSE"];
  if (exchange === "NYSE" || exchange === "NASDAQ") return ["NYSE", "NASDAQ"];
  return ["LSE"];
}

export const Route = createFileRoute("/stock/$exchange/$symbol")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const stock = findStock(params.exchange, params.symbol);
    if (!stock) throw notFound();
    // Server-rendered snapshot: real price, ratios, forensics, score and
    // verdict are in the first HTML byte for crawlers, before any client JS.
    let snapshot: StockSnapshot = {
      quote: null,
      fundamentals: null,
      screener: null,
      fetchedAt: Date.now(),
      degraded: true,
    };
    try {
      snapshot = await getStockSnapshot({
        data: { exchange: stock.exchange, symbol: stock.symbol, name: stock.name },
      });
    } catch (error) {
      console.error(`[stock-route] snapshot unavailable for ${stock.exchange}:${stock.symbol}`, error);
    }
    return { stock, snapshot };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Stock not found | DeepScreen" }, { name: "robots", content: "noindex" }],
      };
    }

    const base = loaderData.stock;
    const { stock: s, sources } = mergeLiveStock(
      base,
      loaderData.snapshot.quote,
      loaderData.snapshot.fundamentals,
      loaderData.snapshot.screener,
    );
    const title = `${s.symbol} — ${s.name} Fundamental Analysis | DeepScreen`;
    const description = `Research ${s.name} (${s.exchange}: ${s.symbol}): available financial ratios, valuation, company news and data limitations on DeepScreen.`;
    const peerNames = peerExchangeCodesFor(s.exchange)
      .flatMap((exchange) => stocksByExchange(exchange))
      .filter((peer) => peer.symbol !== s.symbol && peer.sector === s.sector)
      .sort((a, b) => Math.abs(Math.log(Math.max(a.marketCap, 0.001) / Math.max(s.marketCap, 0.001))) - Math.abs(Math.log(Math.max(b.marketCap, 0.001) / Math.max(s.marketCap, 0.001))))
      .slice(0, 5)
      .map((peer) => peer.symbol + " (" + peer.name + ")");
    const faqs = stockFaqs(s, sources, loaderData.snapshot.fundamentals, peerNames);
    const url = `https://deepscreen.online/stock/${s.exchange}/${s.symbol}`;
    const schemaAnalysis = Object.values(sources).some((value) => value === "live")
      ? analyze(s)
      : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: metaKeywords(
            [
              `${s.name} stock`,
              `${s.symbol} share price`,
              `${s.symbol} stock analysis`,
              `${s.symbol} fundamentals`,
              `${s.symbol} valuation`,
              `${s.symbol} financials`,
              `${s.symbol} news`,
              `${s.exchange} ${s.symbol}`,
            ],
            stocksKeywords,
            learnKeywords,
          ),
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: jsonLd(
            buildGraph(
              buildBreadcrumbSchema([
                { name: "Home", url: "https://deepscreen.online/" },
                {
                  name: s.exchange,
                  url: `https://deepscreen.online/exchange/${s.exchange}`,
                },
                { name: s.symbol, url },
              ]),
              buildArticleSchema({
                headline: title,
                description,
                url,
                about: buildCorporationSchema({
                  symbol: s.symbol,
                  exchange: s.exchange,
                  companyName: s.name,
                  sector: s.sector,
                  score: schemaAnalysis?.score,
                  verdict: schemaAnalysis?.verdict,
                }),
              }),
              buildFAQSchema(
                faqs.map((faq) => ({
                  question: faq.q,
                  answer: faq.a,
                })),
              ),
            ),
          ),
        },
      ],
    };
  },
  component: StockPage,
});

const bandClass: Record<string, string> = {
  good: "border-bull/40 bg-bull/5",
  fair: "border-warn/30 bg-warn/5",
  poor: "border-bear/40 bg-bear/5",
};

const bandText: Record<string, string> = {
  good: "text-bull",
  fair: "text-warn",
  poor: "text-bear",
};

function StockPage() {
  const { stock, snapshot } = Route.useLoaderData();
  const { isPro } = useSubscription();
  const { data: quote, dataUpdatedAt } = useLiveQuote(stock.exchange, stock.symbol, {
    data: snapshot.quote,
    at: snapshot.fetchedAt,
  });
  const { data: liveFundamentals, dataUpdatedAt: fundUpdatedAt } = useLiveFundamentals(
    stock.exchange,
    stock.symbol,
    { data: snapshot.fundamentals, at: snapshot.fetchedAt },
  );
  const { data: screenerRatios, dataUpdatedAt: screenerUpdatedAt } = useScreenerRatios(
    stock.exchange,
    stock.symbol,
    stock.name,
    { data: snapshot.screener, at: snapshot.fetchedAt },
  );
  const { stock: live, sources } = mergeLiveStock(stock, quote, liveFundamentals, screenerRatios);
  const a = analyze(live);
  const f = live.fundamentals;
  const price = live.price;
  const changePct = live.changePct;
  const hasLiveFundamentals = Object.values(sources).some((v) => v === "live");
  const isIndianExchange = stock.exchange === "NSE" || stock.exchange === "BSE";
  const intel = buildIntel({
    stock: live,
    live: liveFundamentals ?? null,
    screener: screenerRatios ?? null,
    quote: quote ?? null,
  });

  const peerExchangeCodes = peerExchangeCodesFor(stock.exchange);

  const peerPool = useMemo(
    () =>
      peerExchangeCodes
        .flatMap((exchange) => stocksByExchange(exchange))
        .filter((candidate) => candidate.symbol !== stock.symbol && candidate.sector === live.sector)
      .sort((a, b) =>
        Math.abs(Math.log(Math.max(a.marketCap, 0.001) / Math.max(live.marketCap, 0.001))) -
        Math.abs(Math.log(Math.max(b.marketCap, 0.001) / Math.max(live.marketCap, 0.001))),
      )
      .slice(0, 40),
    [stock.symbol, live.sector],
  );
  const peerKeys = useMemo(
    () => peerPool.map((candidate) => ({ exchange: candidate.exchange, symbol: candidate.symbol, name: candidate.name })),
    [peerPool],
  );
  const { data: peerQuotes } = useLiveQuotes(peerKeys);
  const { data: peerFundamentals, dataUpdatedAt: peerFundamentalsUpdatedAt } = useLiveFundamentalsBatch(peerKeys);
  const { data: peerScreener, dataUpdatedAt: peerScreenerUpdatedAt } = useScreenerRatiosBatch(peerKeys);
  const peerIndustry = liveFundamentals?.industry?.trim() || null;

  const peerRows = useMemo<PeerRow[]>(() => {
    const targetCap = Math.max(live.marketCap, 0.001);
    const mapped = peerPool
      .map((candidate) => {
        const key = quoteKey(candidate);
        const candidateFundamentals = peerFundamentals?.[key];
        const candidateScreener = peerScreener?.[key];
        const candidateQuote = peerQuotes?.[key];
        const hasLiveData = Boolean(candidateFundamentals || candidateScreener);
        if (!hasLiveData) return null;

        const merged = mergeLiveStock(
          candidate,
          candidateQuote,
          candidateFundamentals,
          candidateScreener,
        );
        const industry = candidateFundamentals?.industry?.trim() || null;
        const exactIndustry = Boolean(
          peerIndustry &&
            industry &&
            industry.toLocaleLowerCase() === peerIndustry.toLocaleLowerCase(),
        );
        const cap = Math.max(merged.stock.marketCap, 0.001);
        const capDistance = Math.abs(Math.log(cap / targetCap));
        const sameExchange = merged.stock.exchange === stock.exchange ? 0 : 1;
        return {
          stock: merged.stock,
          analysis: analyze(merged.stock),
          industry,
          exactIndustry,
          sortKey: (exactIndustry ? 0 : 1) * 100 + capDistance * 10 + sameExchange,
        };
      })
      .filter((row): row is PeerRow & { sortKey: number } => Boolean(row))
      .sort((a, b) => a.sortKey - b.sortKey);

    const exact = mapped.filter((row) => row.exactIndustry).slice(0, 5);
    return (exact.length >= 3 ? exact : mapped.slice(0, 5)).map(({ sortKey: _sortKey, ...row }) => row);
  }, [
    peerPool,
    peerFundamentals,
    peerQuotes,
    peerScreener,
    peerIndustry,
    peerFundamentalsUpdatedAt,
    peerScreenerUpdatedAt,
    live.marketCap,
    stock.exchange,
  ]);

  if (!hasLiveFundamentals) {
    return <Shell><article className="mx-auto max-w-4xl px-4 py-10">
      <nav aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/exchange/$code" params={{ code: stock.exchange }}>{stock.exchange}</Link> / {stock.symbol}</nav>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{stock.symbol} — {stock.name}</h1>
        <WatchlistButton stock={live} />
      </div>
      <p className="mt-5 text-muted-foreground">{stockSummary(stock)}</p>
      {quote && <p className="mt-5 text-xl">Latest available price: {formatPrice(quote.price, stock.exchange)}</p>}
      <section className="mt-6 rounded-lg border border-border p-5">
        <h2 className="font-semibold">Financial data currently unavailable</h2>
        <p className="mt-3 text-sm text-muted-foreground">Provider fundamentals have not loaded. Scores, valuation targets and financial ratios are withheld here rather than filled with simulated values. Try again later and check company filings.</p>
        <Link to="/methodology" className="mt-3 inline-block text-primary">How the research model works</Link>
      </section>
      <section className="mt-6"><h2 className="text-lg font-semibold">Research questions</h2><dl className="mt-4 space-y-4">{stockFaqs(
        live,
        sources,
        liveFundamentals,
        peerExchangeCodesFor(live.exchange)
          .flatMap((exchange) => stocksByExchange(exchange))
          .filter((peer) => peer.symbol !== live.symbol && peer.sector === live.sector)
          .sort((a, b) => Math.abs(Math.log(Math.max(a.marketCap, 0.001) / Math.max(live.marketCap, 0.001))) - Math.abs(Math.log(Math.max(b.marketCap, 0.001) / Math.max(live.marketCap, 0.001))))
          .slice(0, 5)
          .map((peer) => peer.symbol + " (" + peer.name + ")"),
      ).map(faq => <div key={faq.q}><dt className="font-medium">{faq.q}</dt><dd className="mt-1 text-sm text-muted-foreground">{faq.a}</dd></div>)}</dl></section>
      <TopicIndex ids={["stocks", "learn"]} inContainer />
    </article></Shell>;
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <nav className="num text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          /{" "}
          <Link
            to="/exchange/$code"
            params={{ code: stock.exchange }}
            className="hover:text-foreground"
          >
            {stock.exchange}
          </Link>{" "}
          / {stock.symbol}
        </nav>

        <header className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
             <h1 className="num text-3xl font-bold tracking-tight">
               {stock.symbol} — {stock.name}
             </h1>
            <p className="num mt-2 text-xs text-muted-foreground">
              {stock.exchange} · {stock.sector} · {CAP_LABEL[stock.cap]} · Mkt cap{" "}
              {formatCap(live.marketCap, stock.exchange)} · Vol {formatVolume(live.volume)}
            </p>
          </div>
          <div className="text-right">
            <p className="num text-3xl font-bold">{quote ? formatPrice(price, stock.exchange) : "Price unavailable"}</p>
            <p
              className={cn("num text-sm font-medium", changePct >= 0 ? "text-bull" : "text-bear")}
            >
              {quote ? `${changePct >= 0 ? "▲ +" : "▼ "}${changePct.toFixed(2)}% today` : ""}
            </p>
            <p className="num mt-1 text-[11px] text-muted-foreground">
              {quote
                ? `Live · ${quote.marketState || "market"} · updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
                : "Fetching live price…"}
            </p>
            <div className="mt-3 flex justify-end">
              <WatchlistButton stock={live} />
            </div>
            {quote ? (
              <p className="num mt-0.5 text-[11px] text-muted-foreground">
                Day {formatPrice(quote.dayLow, stock.exchange)}–
                {formatPrice(quote.dayHigh, stock.exchange)} · 52w{" "}
                {formatPrice(quote.fiftyTwoWeekLow, stock.exchange)}–
                {formatPrice(quote.fiftyTwoWeekHigh, stock.exchange)}
              </p>
            ) : null}
          </div>
        </header>

        
        <p className="mt-4 max-w-5xl text-sm leading-relaxed text-muted-foreground">
          {stockSummary(live)}
        </p>

        {(() => {
          const memberships = getIndexMemberships(stock.exchange, stock.symbol);
          if (memberships.length === 0) return null;
          return (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="num text-[11px] uppercase tracking-wide text-muted-foreground">
                🏛️ Member of:
              </span>
              {memberships.map((idx) => (
                <span
                  key={idx.id}
                  title={idx.blurb}
                  className="num rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                >
                  {idx.name}
                </span>
              ))}
            </div>
          );
        })()}

        <section className="mt-5 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
            <div className="min-w-0">
              <div className="card-hover h-full rounded-lg border border-border bg-panel p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    DeepScreen verdict
                  </h2>
                  <span
                    className={cn(
                      "num rounded border px-3 py-1 text-sm font-semibold",
                      verdictClass(a.verdict),
                    )}
                  >
                    {a.verdict}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <span className="num text-5xl font-bold">{a.score}</span>
                  <div className="flex-1">
                    <ScoreBar score={a.score} />
                    <p className="num mt-1 text-xs text-muted-foreground">
                      Weighted 13-factor score / 100
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.summary}</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="card-hover rounded-lg border border-bull/30 bg-panel p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-bull">
                  Strengths
                </h3>
                <ul className="num mt-2 space-y-1.5 text-xs text-muted-foreground">
                  {a.strengths.length > 0 ? (
                    a.strengths.map((s) => <li key={s}>+ {s}</li>)
                  ) : (
                    <li>No standout strengths in the model.</li>
                  )}
                </ul>
              </div>
              <div className="card-hover rounded-lg border border-bear/30 bg-panel p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-bear">Risks</h3>
                <ul className="num mt-2 space-y-1.5 text-xs text-muted-foreground">
                  {a.risks.length > 0 ? (
                    a.risks.map((s) => <li key={s}>− {s}</li>)
                  ) : (
                    <li>No red flags triggered.</li>
                  )}
                </ul>
              </div>
            </div>
        </section>

        <ScoreExplanationPanel analysis={a} />

        <ScoreChangePanel
          exchange={stock.exchange}
          symbol={stock.symbol}
          analysis={a}
          liveFundamentals={liveFundamentals}
        />

        <FundamentalSnapshotPanel
          stock={live}
          liveFundamentals={liveFundamentals}
          sources={sources}
          updatedAt={Math.max(fundUpdatedAt, screenerUpdatedAt)}
        />

        <ResearchAlertsPanel
          stock={live}
          analysis={a}
          liveFundamentals={liveFundamentals}
        />

                <PeerAnalysisPanel
          stock={live}
          analysis={a}
          peers={peerRows}
          targetIndustry={peerIndustry}
          dataUpdatedAt={Math.max(peerFundamentalsUpdatedAt, peerScreenerUpdatedAt)}
        />

        <PaywallGate
          feature="Vision &amp; Utility score and Secret Tips badges"
          className="mt-6"
          minHeight="min-h-[260px]"
        >
          <VisionCard intel={intel} />
        </PaywallGate>

        <PaywallGate
          feature="DeepScreen Secret Tips, traps & X-Ray analysis"
          className="mt-4"
          minHeight="min-h-[420px]"
        >
          <SecretTipsPanel intel={intel} />
        </PaywallGate>

        <section className="mt-6 space-y-3">
          <ForensicPanel intel={intel} locked={!isPro} />
        </section>

        <PaywallGate
          feature="Target price, trim level & stop-loss"
          className="mt-6"
          minHeight="min-h-[220px]"
        >
          <HoldingPlanCard stock={live} />
        </PaywallGate>

        <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
              Fundamental breakdown{" "}
              <span className="font-normal normal-case text-muted-foreground">
                — core ratios are free · EV/Revenue, PEG, EV/EBITDA and LT D/E are Pro-only{" "}
                {hasLiveFundamentals
                  ? isIndianExchange && screenerRatios
                    ? `Screener.in filing ratios + live market data, updated ${new Date(Math.max(fundUpdatedAt, screenerUpdatedAt)).toLocaleTimeString()}`
                    : `live via Yahoo Finance, updated ${new Date(fundUpdatedAt).toLocaleTimeString()}`
                  : "fetching live data — showing modeled estimates for now"}
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {a.metrics.map((m, i) => {
                const isLive = sources[METRIC_KEY_TO_FIELD[m.key]!] === "live";
                return (
                  <div
                    key={m.key}
                    title={isPro ? m.tooltip : "Unlock contextual insights with DeepScreen Pro"}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className={cn(
                      "card-hover animate-fade-in-up cursor-help rounded-lg border p-4",
                      bandClass[m.band],
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="num text-xs uppercase text-muted-foreground">{m.label}</p>
                      <span
                        className={cn(
                          "num rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase transition-colors",
                          isLive ? "bg-bull/15 text-bull" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isLive
                          ? isIndianExchange && screenerRatios
                            ? "Screener"
                            : "Live"
                          : "Modeled"}
                      </span>
                    </div>
                    <p className="num mt-1 text-2xl font-bold">
                      {["peg", "evRevenue", "evEbitda", "ltde"].includes(m.key) ? (
                        <ProMetricValue value={m.display} />
                      ) : (
                        m.display
                      )}
                    </p>
                    <p className={cn("mt-1 text-xs", bandText[m.band])}>
                      {["peg", "evRevenue", "evEbitda", "ltde"].includes(m.key) ? "Advanced ratio · DeepScreen Pro" : m.reading}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-700 ease-out",
                          m.band === "good" ? "bg-bull" : m.band === "fair" ? "bg-warn" : "bg-bear",
                        )}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                      {["peg", "evRevenue", "evEbitda", "ltde"].includes(m.key) ? (
                        <ProMetricValue value={<span>Advanced ratio — unlock with Pro</span>} />
                      ) : (
                        m.tooltip
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

        <PaywallGate
          feature="DCF & Graham intrinsic value calculators"
          className="mt-8"
          minHeight="min-h-[360px]"
        >
          <section className="space-y-6">
            <DcfCalculator stock={live} />
            <GrahamCalculator stock={live} />
          </section>
        </PaywallGate>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Company financials</h2>
            <dl className="num mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">EPS (TTM)</dt>
              <dd className="text-right">{formatPrice(live.epsTtm, stock.exchange)}</dd>
              <dt className="text-muted-foreground">Revenue (TTM)</dt>
              <dd className="text-right">{formatCap(live.revenue, stock.exchange)}</dd>
              <dt className="text-muted-foreground">Net margin</dt>
              <dd className="text-right">{f.netMargin}%</dd>
              <dt className="text-muted-foreground">EBITDA margin</dt>
              <dd className="text-right">{f.ebitdaMargin}%</dd>
              <dt className="text-muted-foreground">Earnings growth</dt>
              <dd className="text-right">{f.growth}%</dd>
              <dt className="text-muted-foreground">Dividend yield</dt>
              <dd className="text-right">{f.dividendYield}%</dd>
              <dt className="text-muted-foreground">Payout ratio</dt>
              <dd className="text-right">{f.payoutRatio}%</dd>
              <dt className="text-muted-foreground">Debt / equity</dt>
              <dd className="text-right">{f.debtToEquity}x</dd>
            </dl>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {hasLiveFundamentals
                ? "Figures use live Yahoo Finance data where available; any field Yahoo doesn't report falls back to the DeepScreen model."
                : "Live data hasn't loaded yet — figures shown are DeepScreen's modeled estimates."}
            </p>
          </div>
          <LiveNewsFeed
            query={newsSearchQuery(stock.name, stock.symbol)}
            title={`${stock.symbol} live news`}
            limit={10}
          />
        </section>
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Frequently asked questions about {stock.symbol}</h2>
          <dl className="mt-5 space-y-5">
            {stockFaqs(live, sources).map((faq) => (
              <div key={faq.q}>
                <dt className="text-sm font-semibold">{faq.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
        <StockSignupPrompt />
      </div>
      <TopicIndex ids={["stocks"]} title={"Stock research topics"} />
    </Shell>
  );
}
