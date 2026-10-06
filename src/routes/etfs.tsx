import { featuredInvestment } from "@/lib/deepscreen/investment-featured";
import { getInvestmentAnalysis } from "@/lib/market/investment-analysis.functions";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentTopicGuide } from "@/components/ds/InvestmentTopicGuide";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { faqForType } from "@/lib/seo/investment-faq";
import { etfKeywords, metaKeywords } from "@/lib/seo/keywords";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "ETF Analysis India: Tracking Error, Fees & Holdings | DeepScreen";
const description = "Learn how to analyze ETFs using holdings, concentration, portfolio valuation, tracking error, tracking difference, expense ratio, bid-ask spread, AUM, volume and NAV premium or discount.";
const url = "https://deepscreen.online/etfs";
const faqs = faqForType("ETF");

export const Route = createFileRoute("/etfs")({
  staticData: { sitemap: true },
  loader: () => getInvestmentAnalysis({data: featuredInvestment("ETF")}).catch(() => null),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: metaKeywords(etfKeywords) },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "describedby", href: "https://deepscreen.online/llms.txt" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: jsonLd(buildGraph(
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema({ name: title, description, url }),
        buildBreadcrumbSchema([
          { name: "DeepScreen", url: "https://deepscreen.online/" },
          { name: "Investments", url: "https://deepscreen.online/investments" },
          { name: "ETF analysis", url },
        ]),
        buildFAQSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
      )),
    }],
  }),
  component: TopicPage,
});

function TopicPage() {
  return (
    <Shell>
      <InvestmentTopicGuide type="ETF" initialData={Route.useLoaderData()} />
      <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        <LiveNewsFeed
          query="ETF exchange traded funds markets"
          title="Latest ETF news"
          limit={40}
          maxAgeHours={24}
          mode="etf"
          showCategory
        />
        <p className="mt-3 text-xs text-muted-foreground">
          The feed combines multiple topic searches and providers, keeps only verified publication
          times from the last 24 hours, and checks for newer provider headlines every 20 seconds while open.
        </p>
      </div>
    </Shell>
  );
}
