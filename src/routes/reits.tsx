import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentTopicGuide } from "@/components/ds/InvestmentTopicGuide";
import { faqForType } from "@/lib/seo/investment-faq";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "REIT Analysis: Occupancy, WALE, NDCF, AFFO & NAV | DeepScreen";
const description = "Learn how to analyze REITs using occupancy, WALE, tenant concentration, NOI, NDCF or AFFO, leverage, debt maturity, distribution coverage, NAV and cap rates.";
const url = "https://deepscreen.online/reits";
const faqs = faqForType("REIT");

export const Route = createFileRoute("/reits")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: "REIT analysis, REIT occupancy, WALE, NDCF, AFFO, REIT LTV, debt EBITDA, REIT NAV, cap rate, REIT distribution yield, tenant concentration" },
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
          { name: "REIT analysis", url },
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
      <InvestmentTopicGuide type="REIT" />
    </Shell>
  );
}
