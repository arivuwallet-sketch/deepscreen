import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Droplets, Flame, Gem, Zap } from "lucide-react";
import { Shell } from "@/components/ds/Shell";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { getCommodityQuotes } from "@/lib/market/commodity-quotes.functions";

const URL = "https://deepscreen.online/commodities";
const title = "Commodity Prices: Gold, Silver, Crude Oil, Gas & Copper | DeepScreen";
const description = "Follow gold, silver, crude oil, natural gas and copper futures, and understand what global commodity prices mean for Indian investors.";
const commodities = [
  { symbol: "GC=F", name: "Gold", contract: "COMEX gold futures", unit: "troy ounce", icon: Gem, context: "Gold is often sensitive to real interest rates, the US dollar and demand for a store of value. A dollar-denominated futures quote is not the same as an Indian retail gold rate." },
  { symbol: "SI=F", name: "Silver", contract: "COMEX silver futures", unit: "troy ounce", icon: Gem, context: "Silver combines precious-metal demand with industrial use in electronics and solar equipment. It can move more sharply than gold." },
  { symbol: "CL=F", name: "Crude oil", contract: "WTI crude futures", unit: "barrel", icon: Droplets, context: "WTI tracks a US crude benchmark. Indian import costs also depend on other crude grades, shipping and the rupee–dollar exchange rate." },
  { symbol: "NG=F", name: "Natural gas", contract: "Henry Hub natural gas futures", unit: "MMBtu", icon: Flame, context: "Henry Hub is a US benchmark. Weather, storage, production and regional infrastructure can make local gas prices diverge." },
  { symbol: "HG=F", name: "Copper", contract: "COMEX copper futures", unit: "pound", icon: Zap, context: "Copper reflects electrical infrastructure and construction demand, but mine supply, inventories and currency also shape its price." },
] as const;

const quotesQuery = queryOptions({
  queryKey: ["commodity-futures-quotes"],
  queryFn: () => getCommodityQuotes(),
  staleTime: 3 * 60_000,
  retry: 1,
});

export const Route = createFileRoute("/commodities")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(quotesQuery).catch(() => ({})),
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: CommoditiesPage,
  errorComponent: () => <Shell><div className="mx-auto max-w-5xl px-5 py-16"><h1 className="text-3xl font-bold">Commodities</h1><p className="mt-4 text-muted-foreground">Prices could not be loaded right now. Please try again shortly.</p></div></Shell>,
});

function CommoditiesPage() {
  const { data: quotes } = useSuspenseQuery(quotesQuery);
  return <Shell>
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">DeepScreen</Link> / Markets / Commodities</nav>
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase text-primary">Markets / 01</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Commodities</h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">Gold, silver, energy and industrial metals move for different reasons. Compare global futures benchmarks, then read beyond the price before drawing a conclusion about an Indian stock or local commodity market.</p>
      </div>

      <div className="mt-10 overflow-hidden border-y border-border">
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(100px,150px)_minmax(85px,130px)] gap-4 border-b border-border py-3 font-mono text-[11px] uppercase text-muted-foreground sm:grid">
          <span>Futures benchmark</span><span className="text-right">Latest</span><span className="text-right">Day change</span>
        </div>
        {commodities.map((item) => {
          const q = quotes[item.symbol];
          const Icon = item.icon;
          return <div key={item.symbol} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 py-5 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(100px,150px)_minmax(85px,130px)] sm:gap-4">
            <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded border border-border bg-panel text-primary"><Icon size={19}/></span><div><h2 className="font-semibold">{item.name}</h2><p className="text-xs text-muted-foreground">{item.contract} · per {item.unit}</p></div></div>
            <div className="text-right font-mono text-sm font-semibold">{q ? new Intl.NumberFormat("en-US", { style: "currency", currency: q.currency || "USD", maximumFractionDigits: 2 }).format(q.price) : "—"}</div>
            <div className={`col-span-2 text-right font-mono text-xs sm:col-span-1 ${q ? q.changePct > 0 ? "text-bull" : q.changePct < 0 ? "text-bear" : "text-muted-foreground" : "text-muted-foreground"}`}>{q ? `${q.changePct > 0 ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}</div>
          </div>;
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Yahoo Finance futures chart quotes. Prices may be delayed and contracts roll; the displayed values are global benchmark futures, not Indian spot, MCX, jewellery or pump prices. A dash means the source returned no current quote. Check the contract and quote date before using any figure.</p>

      <div className="mt-14">
        <LiveNewsFeed query="gold OR silver OR crude oil OR natural gas OR copper commodities when:7d" title="Commodities news" limit={12} />
        <p className="mt-3 text-xs text-muted-foreground">Headlines refresh every minute while this page is open. Publication times come from news providers and may lag events.</p>
      </div>

      <div className="mt-14 grid gap-10 border-t border-border pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div><p className="font-mono text-xs uppercase text-primary">Reading the market</p><h2 className="mt-3 text-2xl font-semibold">A benchmark is not a bill.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The price you pay or receive can differ because of currency, taxes, transport, contract month, location and retail margins.</p></div>
        <div className="grid gap-6 sm:grid-cols-2">{commodities.map((item) => <article key={item.symbol} className="border-l border-border pl-4"><h3 className="font-semibold">{item.name}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.context}</p></article>)}</div>
      </div>
      <div className="mt-14 flex flex-wrap gap-6 border-t border-border pt-8 text-sm"><Link to="/gift-nifty" className="inline-flex items-center gap-2 text-primary hover:underline">Gift Nifty <ArrowRight size={16}/></Link><Link to="/calendar" className="inline-flex items-center gap-2 text-primary hover:underline">Economic calendar <ArrowUpRight size={16}/></Link></div>
    </div>
  </Shell>;
}