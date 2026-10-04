import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock3, Globe2, Scale } from "lucide-react";
import { Shell } from "@/components/ds/Shell";

const URL = "https://deepscreen.online/gift-nifty";
const title = "Gift Nifty: Meaning, Market Hours & How to Read It | DeepScreen";
const description = "Understand what Gift Nifty futures indicate before the Indian market opens, where they trade, their trading hours and why an overnight indication is not an NSE opening price.";

export const Route = createFileRoute("/gift-nifty")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { property: "og:url", content: URL },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: URL }] }),
  component: GiftNiftyPage,
});

function GiftNiftyPage() {
  return <Shell><div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
    <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">DeepScreen</Link> / Markets / Gift Nifty</nav>
    <div className="max-w-3xl"><p className="font-mono text-xs uppercase text-primary">Markets / 02</p><h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Gift Nifty</h1><p className="mt-5 text-base leading-relaxed text-muted-foreground">The overnight lens on India’s Nifty 50. Gift Nifty is a futures contract traded on NSE International Exchange at GIFT City, not the Nifty 50 spot index traded in Mumbai.</p></div>
    <div className="mt-10 grid gap-0 border-y border-border md:grid-cols-3">
      <div className="border-b border-border py-6 md:border-b-0 md:border-r md:pr-6"><Globe2 className="mb-4 text-primary" size={23}/><h2 className="font-semibold">Where it trades</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">NSE International Exchange (NSE IX), at GIFT City in Gujarat. It is a US-dollar-denominated Nifty-linked futures contract.</p></div>
      <div className="border-b border-border py-6 md:border-b-0 md:border-r md:px-6"><Clock3 className="mb-4 text-primary" size={23}/><h2 className="font-semibold">When it trades</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Extended weekday sessions cover much of the time outside regular NSE cash-market hours. Check the exchange calendar for holidays and session changes.</p></div>
      <div className="py-6 md:pl-6"><Scale className="mb-4 text-primary" size={23}/><h2 className="font-semibold">What it signals</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A market expectation for the Nifty at a point in time, not a guaranteed opening level or a prediction of the day’s close.</p></div>
    </div>
    <section className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"><div><p className="font-mono text-xs uppercase text-primary">The comparison</p><h2 className="mt-3 text-2xl font-semibold">Futures versus spot</h2></div><div className="space-y-5 text-sm leading-relaxed text-muted-foreground"><p>Gift Nifty tracks expectations for the underlying Nifty 50 but futures and spot prices need not match. The difference can reflect the cost of carrying a position, dividends expected before expiry, the contract’s maturity and liquidity.</p><p>A headline that says “Gift Nifty up 100 points” is incomplete without the reference price and contract month. Compare the same contract with its own prior close, rather than subtracting yesterday’s Nifty spot close and calling the result an opening gap.</p><p>Once India’s cash market opens, the actual Nifty 50 price is determined by trading in its constituent shares. Global news, currency moves and overnight US markets may all change the picture before the opening auction.</p></div></section>
    <section className="mt-14 border-t border-border pt-10"><p className="font-mono text-xs uppercase text-primary">Before the bell</p><h2 className="mt-3 text-2xl font-semibold">Three checks worth making</h2><ol className="mt-6 grid gap-6 sm:grid-cols-3"><li className="border-l border-border pl-4"><span className="font-mono text-xs text-primary">01 / CONTRACT</span><h3 className="mt-2 font-semibold">Check the expiry</h3><p className="mt-2 text-sm text-muted-foreground">Near-month and next-month contracts can trade at different levels. Look at the contract you are actually comparing.</p></li><li className="border-l border-border pl-4"><span className="font-mono text-xs text-primary">02 / TIME</span><h3 className="mt-2 font-semibold">Check the timestamp</h3><p className="mt-2 text-sm text-muted-foreground">A quote captured before major news may no longer represent the latest market expectation.</p></li><li className="border-l border-border pl-4"><span className="font-mono text-xs text-primary">03 / CONTEXT</span><h3 className="mt-2 font-semibold">Check the drivers</h3><p className="mt-2 text-sm text-muted-foreground">A futures move alone does not explain company fundamentals or how individual sectors will perform.</p></li></ol></section>
    <p className="mt-10 text-xs leading-relaxed text-muted-foreground">This page does not display a Gift Nifty price: a Nifty spot or other futures quote is not a substitute for an exchange-verified Gift Nifty contract. For current levels and contract specifications, consult <a href="https://www.nseix.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">NSE IX <ArrowUpRight className="inline" size={12}/></a> directly.</p>
    <div className="mt-10 flex flex-wrap gap-6 border-t border-border pt-8 text-sm"><Link to="/commodities" className="inline-flex items-center gap-2 text-primary hover:underline">Commodities <ArrowRight size={16}/></Link><Link to="/calendar" className="inline-flex items-center gap-2 text-primary hover:underline">Economic calendar <ArrowRight size={16}/></Link></div>
  </div></Shell>;
}