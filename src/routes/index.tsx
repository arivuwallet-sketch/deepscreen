import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";
import { buildGraph, buildWebApplicationSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "DeepScreen — See the Signal. Beyond the Noise.";
const description =
  "Explore global stocks with DeepScreen: five exchanges, a 13-factor fundamental model, DCF and Graham valuation, company research, market news, IPOs and options strategy tools.";
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://deepscreen.online/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "https://deepscreen.online/" }],
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
          ),
        ),
      },
    ],
  }),
  component: LandingPage,
});
