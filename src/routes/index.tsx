import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { buildFAQSchema, buildGraph, buildWebApplicationSchema, jsonLd } from "@/lib/seo/json-ld";
import { LANDING_FAQS } from "@/lib/discovery/landing-faq";
import { metaKeywords, screenerKeywords, stocksKeywords, learnKeywords, optionsKeywords, calendarKeywords, ipoKeywords, portfolioKeywords, indiaKeywords, usKeywords, ukKeywords } from "@/lib/seo/keywords";
import { DEEPSCREEN_META_DESCRIPTION, DEEPSCREEN_TITLE } from "@/lib/seo/brand";

const title = DEEPSCREEN_TITLE;
const description = DEEPSCREEN_META_DESCRIPTION;
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "keywords", content: metaKeywords(screenerKeywords, stocksKeywords, learnKeywords, optionsKeywords, calendarKeywords, ipoKeywords, portfolioKeywords, indiaKeywords, usKeywords, ukKeywords) },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://deepscreen.online/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/" }, { rel: "describedby", href: "https://deepscreen.online/faq-index.txt" }, { rel: "help", href: "https://deepscreen.online/answers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildWebApplicationSchema({
              name: "DeepScreen",
              url: "https://deepscreen.online/",
              description,
              featureList: [
                "Five-exchange stock screening",
                "13-factor fundamental analysis",
                "DCF and Graham valuation tools",
                "Company research and peer comparisons",
                "Market news and economic calendar",
                "IPO research",
                "Options Greeks and strategy payoffs",
                "Watchlists and research guides",
              ],
            }),
            buildFAQSchema(
              LANDING_FAQS.map(([question, answer]) => ({ question, answer })),
            ),
          ),
        ),
      },
    ],
  }),
  component: LandingPage,
});
