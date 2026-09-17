import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { sitemapXML } from "@/lib/sitemap";
import { buildSitemapSections } from "@/lib/deepscreen/sitemap-sections";

const BASE_URL = "https://deepscreen.online";

export const Route = createFileRoute("/sitemaps/$name.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const router = await getRouterInstance();
          const sections = buildSitemapSections(router);
          const entries = sections.get(params.name);

          if (!entries || entries.length === 0) {
            return new Response("Sitemap section not found", {
              status: 404,
              headers: { "Cache-Control": "no-store" },
            });
          }

          return new Response(sitemapXML(BASE_URL, entries), {
            headers: {
              "Content-Type": "application/xml",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (error) {
          console.error("[sitemap] section generation failed", error);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
