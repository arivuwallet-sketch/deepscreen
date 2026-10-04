import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentAnalysisAvailable } from "@/components/ds/InvestmentAnalysisAvailable";
import { findInvestment } from "@/lib/deepscreen/investments";
import { useLiveQuote } from "@/hooks/useLiveQuotes";
import { formatPrice } from "@/lib/deepscreen/format";
import { getInvestmentAnalysis } from "@/lib/market/investment-analysis.functions";
import { InvestmentFaqSection } from "@/components/ds/InvestmentFaqSection";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { investmentDetailFaq } from "@/lib/seo/investment-faq";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

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
    const canonical = item ? `https://deepscreen.online/investment/${encodeURIComponent(item.market)}/${encodeURIComponent(item.type)}/${encodeURIComponent(item.code)}` : "";
    const faqs = item ? investmentDetailFaq(item) : [];
    const typeKeywords = item?.type === "FUND"
      ? "mutual fund analysis, mutual fund NAV, expense ratio, TER, direct vs regular plan, rolling returns, mutual fund risk"
      : item?.type === "ETF"
        ? "ETF analysis, ETF holdings, tracking error, tracking difference, ETF expense ratio, bid ask spread, premium discount NAV"
        : "REIT analysis, REIT occupancy, WALE, NDCF, AFFO, REIT LTV, REIT NAV, cap rate";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(item ? [{ name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" }] : []),
        ...(item ? [{ name: "keywords", content: `${item.name}, ${item.code}, ${typeKeywords}` }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        ...(!loaderData ? [{ name: "robots", content: "noindex" }] : []),
      ],
      ...(item
        ? {
            links: [{ rel: "canonical", href: canonical }, { rel: "describedby", href: "https://deepscreen.online/llms.txt" }],
            scripts: [{
              type: "application/ld+json",
              children: jsonLd(buildGraph(
                buildOrganizationSchema(),
                buildWebSiteSchema(),
                buildWebPageSchema({ name: title, description, url: canonical }),
                buildBreadcrumbSchema([
                  { name: "DeepScreen", url: "https://deepscreen.online/" },
                  { name: "Investments", url: "https://deepscreen.online/investments" },
                  { name: item.name, url: canonical },
                ]),
                buildFAQSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
              )),
            }],
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
                  : analysis?.marketSnapshot
                    ? formatPrice(analysis.marketSnapshot.price, item.market)
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
                  : analysis?.marketSnapshot
                    ? `Yahoo Finance chart · ${new Date(analysis.marketSnapshot.asOf).toLocaleString()}`
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
        <div className="mt-12">
          <LiveNewsFeed
            query={`"${item.name.replace(/"/g, "").slice(0, 110)}" when:1d`}
            title={`${item.type === "FUND" ? "Mutual fund" : item.type} news · ${item.code}`}
            limit={12}
            maxAgeHours={24}
          />
          <p className="mt-3 text-xs text-muted-foreground">Stories mentioning this investment are shown only when the provider supplies a publication time within the past 24 hours. Headlines refresh every minute while this page is open.</p>
        </div>
        <InvestmentFaqSection faqs={investmentDetailFaq(item)} title={`Questions about ${item.name}`} description={`Research answers for ${item.name} (${item.code}) using the analysis framework appropriate to a ${item.type === "FUND" ? "mutual fund" : item.type}.`} />
      </div>
    </Shell>
  );
}
