import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { buildSitemapSections, sitemapIndexXML } from "@/lib/deepscreen/sitemap-sections";

const BASE_URL = "https://deepscreen.online";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const sections = buildSitemapSections(router);

          if (sections.size === 0) {
            return new Response(
              "No pages are included in this sitemap. Check route decisions and ancestor exclusions.",
              { status: 404, headers: { "Cache-Control": "no-store" } },
            );
          }

          const xml = sitemapIndexXML(
            BASE_URL,
            [...sections.keys()].map((name) => `/sitemaps/${name}.xml`),
          );

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml",
              "Cache-Control": "public, max-age=3600",
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
