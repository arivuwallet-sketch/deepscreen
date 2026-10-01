import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { findInvestment } from "@/lib/deepscreen/investments";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { formatPrice } from "@/lib/deepscreen/format";

export const Route = createFileRoute("/investment/$market/$type/$code")({
  staticData: { sitemap: false },
  loader: ({ params }) => {
    const item = findInvestment(params.market, params.type, params.code);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} (${loaderData.code}) | DeepScreen` : "Investment not found | DeepScreen";
    const description = loaderData ? `View ${loaderData.name}, a ${loaderData.type === "FUND" ? "mutual fund scheme" : loaderData.type} listing in ${loaderData.market}, with available NAV or market price and source details.` : "Investment not found.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }, ...(!loaderData ? [{ name: "robots", content: "noindex" }] : [])], ...(loaderData ? { links: [{ rel: "canonical", href: `https://deepscreen.online/investment/${encodeURIComponent(loaderData.market)}/${encodeURIComponent(loaderData.type)}/${encodeURIComponent(loaderData.code)}` }] } : {}) };
  },
  component: InvestmentPage,
});

function InvestmentPage() {
  const item = Route.useLoaderData();
  const { data: quote } = useLiveQuote(item.type === "FUND" ? "" : item.market, item.type === "FUND" ? "" : item.code);
  return <Shell><div className="mx-auto max-w-4xl px-4 py-9 sm:px-6">
    <Link to="/investments" className="text-sm text-primary hover:underline">← Investment directory</Link>
    <p className="mt-10 text-xs font-semibold uppercase text-primary">{item.market} / {item.type === "FUND" ? "Mutual fund" : item.type}</p>
    <h1 className="mt-2 text-3xl font-bold">{item.name}</h1>
    <p className="mt-2 font-mono text-muted-foreground">{item.code}</p>
    <div className="mt-10 grid gap-6 border-y border-border py-7 sm:grid-cols-2">
      <div><p className="text-xs uppercase text-muted-foreground">{item.type === "FUND" ? "Net asset value" : "Market price"}</p><p className="mt-2 text-3xl font-semibold">{item.type === "FUND" ? item.nav === null ? "Not available" : `₹${item.nav.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : quote ? formatPrice(quote.price, item.market) : "Quote unavailable"}</p></div>
      <div><p className="text-xs uppercase text-muted-foreground">Source / date</p><p className="mt-2 text-sm">{item.type === "FUND" ? `AMFI · ${item.date || "date unavailable"}` : quote ? `Yahoo Finance · ${new Date(quote.asOf).toLocaleString()}` : "Exchange directory listing · price not available"}</p></div>
    </div>
    <p className="mt-8 text-sm text-muted-foreground">{item.type === "FUND" ? "Mutual fund NAV is a dated end-of-day scheme value, not an exchange-traded quote. Plans and payout options can have different NAVs." : "Exchange-traded prices may be delayed or unavailable from the quote provider."} Company P/E-based scores, DCF valuation and forensic analysis do not apply to this listing.</p>
  </div></Shell>;
}
