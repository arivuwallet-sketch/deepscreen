import { featuredInvestment } from "@/lib/deepscreen/investment-featured";
import { getInvestmentAnalysis } from "@/lib/market/investment-analysis.functions";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentTopicGuide } from "@/components/ds/InvestmentTopicGuide";
import { LiveNewsFeed } from "@/components/ds/LiveNewsFeed";
import { faqForType } from "@/lib/seo/investment-faq";
import { metaKeywords, mutualFundKeywords } from "@/lib/seo/keywords";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "Mutual Fund Analysis India: NAV, TER, Returns & Risk | DeepScreen";
const description = "Learn how to analyze mutual funds using NAV history, rolling returns, benchmark performance, drawdown, risk-adjusted metrics, portfolio structure, manager tenure, TER and exit load.";
const url = "https://deepscreen.online/mutual-funds";
const faqs = faqForType("FUND");

export const Route = createFileRoute("/mutual-funds")({
  staticData: { sitemap: true },
  loader: () => getInvestmentAnalysis({data: featuredInvestment("FUND")}).catch(() => null),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: metaKeywords(mutualFundKeywords) },
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
          { name: "Mutual fund analysis", url },
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
      <InvestmentTopicGuide type="FUND" initialData={Route.useLoaderData()} />
      <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        <LiveNewsFeed
          query="mutual funds India AMFI SIP"
          title="Latest mutual fund news"
          limit={30}
          maxAgeHours={24}
          mode="mutual-fund"
          showCategory
        />
        <p className="mt-3 text-xs text-muted-foreground">
          The feed combines multiple topic searches and providers, keeps only verified publication
          times from the last 24 hours, and checks for newer headlines every 30 seconds while open.
        </p>
      </div>
    </Shell>
  );
}
