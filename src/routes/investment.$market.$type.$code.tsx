import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentAnalysisAvailable } from "@/components/ds/InvestmentAnalysisAvailable";
import { findInvestment } from "@/lib/deepscreen/investments";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { formatPrice } from "@/lib/deepscreen/format";
import { getInvestmentAnalysis } from "@/lib/market/investment-analysis.functions";

export const Route = createFileRoute("/investment/$market/$type/$code")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const item = findInvestment(params.market, params.type, params.code);
    if (!item) throw notFound();
    try {
      const analysis = await getInvestmentAnalysis({
        data: { market: item.market, type: item.type, code: item.code, name: item.name },
      });
      return { item, analysis };
    } catch {
      return { item, analysis: undefined };
    }
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    const title = item ? `${item.name} (${item.code}) | DeepScreen` : "Investment not found | DeepScreen";
    const description = loaderData
      ? item?.type === "ETF"
        ? `Analyze ${item.name} as an ETF basket: holdings quality, valuation, concentration, drawdown, volatility, costs and execution data where available.`
        : item?.type === "FUND"
          ? `Analyze ${item.name} as a mutual fund: process, rolling returns, downside risk, portfolio construction, people/capacity evidence and costs where available.`
          : `Analyze ${item?.name ?? "this REIT"} as a REIT operating business: asset quality, growth, cash flow, leverage, valuation and governance evidence where available.`
      : "Investment not found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        ...(!loaderData ? [{ name: "robots", content: "noindex" }] : []),
      ],
      ...(item
        ? {
            links: [
              {
                rel: "canonical",
                href: `https://deepscreen.online/investment/${encodeURIComponent(item.market)}/${encodeURIComponent(item.type)}/${encodeURIComponent(item.code)}`,
              },
            ],
          }
        : {}),
    };
  },
  component: InvestmentPage,
});

function InvestmentPage() {
  const { item, analysis } = Route.useLoaderData();
  const verifiedNav = item.type === "FUND" && analysis?.history &&
    (!item.date || !Number.isFinite(Date.parse(item.date)) || Date.parse(analysis.history.endDate) >= Date.parse(item.date))
    ? analysis.history : null;
  const { data: quote } = useLiveQuote(
    item.type === "FUND" ? "" : item.market,
    item.type === "FUND" ? "" : item.code,
  );

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
        <Link to="/investments" className="text-sm text-primary hover:underline">
          ← Investment directory
        </Link>
        <p className="mt-10 text-xs font-semibold uppercase text-primary">
          {item.market} / {item.type === "FUND" ? "Mutual fund" : item.type}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{item.name}</h1>
        <p className="mt-2 font-mono text-muted-foreground">{item.code}</p>

        <div className="mt-10 grid gap-6 border-y border-border py-7 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              {item.type === "FUND" ? "Net asset value" : "Market price"}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {item.type === "FUND"
                ? item.nav === null
                  ? "NAV pending"
                : `₹${(verifiedNav?.latestValue ?? item.nav).toLocaleString("en-IN", { maximumFractionDigits: 4 })}`
                : quote
                  ? formatPrice(quote.price, item.market)
                  : "Quote pending"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Source / date</p>
            <p className="mt-2 text-sm">
              {item.type === "FUND"
                ? verifiedNav
                  ? `MFAPI (AMFI-sourced NAV) · ${verifiedNav.endDate}`
                  : `AMFI directory snapshot · ${item.date || "date unavailable"}`
                : quote
                  ? `Yahoo Finance · ${new Date(quote.asOf).toLocaleString()}`
                  : "Exchange directory listing"}
            </p>
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          {item.type === "FUND"
            ? "Mutual fund NAV is a dated end-of-day scheme value, not an exchange-traded quote. Plans and payout options can have different NAVs."
            : "Exchange-traded prices may be delayed or unavailable from the quote provider."}{" "}
          Company P/E-based scores, DCF valuation and forensic analysis do not apply to this listing; the analysis below uses the framework appropriate to its investment type.
        </p>

        <InvestmentAnalysisAvailable item={item} {...(analysis ? { initialData: analysis } : {})} />
      </div>
    </Shell>
  );
}
