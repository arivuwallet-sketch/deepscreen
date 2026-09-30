import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { buildSitemapSections } from "@/lib/deepscreen/sitemap-sections";
import { sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://deepscreen.online";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const sections = buildSitemapSections(router);
          const entries: SitemapEntry[] = [];

          for (const sectionEntries of sections.values()) {
            entries.push(...sectionEntries);
          }

          // DeepScreen currently has roughly 13k public indexable URLs, which is
          // comfortably below Google's 50,000-URL limit for a single sitemap.
          // Serving one flat sitemap avoids child-sitemap discovery lag/failures
          // and lets Search Console see the complete URL inventory in one fetch.
          const xml = sitemapXML(BASE_URL, entries);

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control":
                "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch (error) {
          console.error("[sitemap] generation failed", error);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});