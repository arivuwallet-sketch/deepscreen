import { createFileRoute } from "@tanstack/react-router";

import { sitemapIndexXML, sitemapSectionNames } from "@/lib/deepscreen/sitemap-sections";

const BASE_URL = "https://deepscreen.online";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const paths = sitemapSectionNames().map((name) => "/sitemaps/" + name + ".xml");
          const xml = sitemapIndexXML(BASE_URL, paths);

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control":
                "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch (error) {
          console.error("[sitemap] index generation failed", error);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
