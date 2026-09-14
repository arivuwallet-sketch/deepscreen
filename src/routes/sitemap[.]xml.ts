import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";
import { isSitemapRouteIncluded } from "@/lib/sitemap";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { GUIDES } from "@/lib/deepscreen/guides";
import { COMPARISONS, RANKINGS, RATIOS, STOCK_COMPARISONS, STRATEGY_GUIDES } from "@/lib/seo/content";
import { SECTORS, stocksByExchange } from "@/lib/deepscreen/stocks";

const BASE_URL = "https://deepscreen.online";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

          const exchangeRouteId = "/exchange/$code";
          if (isSitemapRouteIncluded(router.routesById[exchangeRouteId])) {
            for (const exchange of EXCHANGES) {
              const location = router.buildLocation({
                to: "/exchange/$code",
                params: { code: exchange.code },
                search: () => ({}),
                hash: "",
              });
              const path = sitemapPathForLocation(router, location, exchangeRouteId);
              if (path) entries.push({ path });
            }
          }

          const stockRouteId = "/stock/$exchange/$symbol";
          if (isSitemapRouteIncluded(router.routesById[stockRouteId])) {
            for (const stock of STOCKS) {
              const location = router.buildLocation({
                to: "/stock/$exchange/$symbol",
                params: { exchange: stock.exchange, symbol: stock.symbol },
                search: () => ({}),
                hash: "",
              });
              const path = sitemapPathForLocation(router, location, stockRouteId);
              if (path) entries.push({ path });
            }
          }

          const guideRouteId = "/learn/$slug";
          if (isSitemapRouteIncluded(router.routesById[guideRouteId])) {
            for (const guide of GUIDES) {
              const location = router.buildLocation({
                to: "/learn/$slug",
                params: { slug: guide.slug },
                search: () => ({}),
                hash: "",
              });
              const path = sitemapPathForLocation(router, location, guideRouteId);
              if (path) entries.push({ path });
            }
          }

          const dynamicCollections = [
            { routeId: "/best/$slug", to: "/best/$slug", values: RANKINGS.map((item) => ({ slug: item.slug })) },
            { routeId: "/compare/$slug", to: "/compare/$slug", values: [...COMPARISONS, ...STOCK_COMPARISONS].map((item) => ({ slug: item.slug })) },
            { routeId: "/options/$slug", to: "/options/$slug", values: STRATEGY_GUIDES.map((item) => ({ slug: item.slug })) },
          ] as const;
          for (const collection of dynamicCollections) {
            if (!isSitemapRouteIncluded(router.routesById[collection.routeId])) continue;
            for (const params of collection.values) {
              const location = router.buildLocation({ to: collection.to, params, search: () => ({}), hash: "" });
              const path = sitemapPathForLocation(router, location, collection.routeId);
              if (path) entries.push({ path });
            }
          }

          if (isSitemapRouteIncluded(router.routesById[guideRouteId])) {
            for (const ratio of RATIOS) {
              const location = router.buildLocation({ to: "/learn/$slug", params: { slug: ratio.slug }, search: () => ({}), hash: "" });
              const path = sitemapPathForLocation(router, location, guideRouteId);
              if (path) entries.push({ path });
            }
          }

          const sectorRouteId = "/sector/$exchange/$sector";
          if (isSitemapRouteIncluded(router.routesById[sectorRouteId])) {
            for (const exchange of EXCHANGES) {
              for (const sector of SECTORS) {
                if (!stocksByExchange(exchange.code).some((stock) => stock.sector === sector)) continue;
                const location = router.buildLocation({
                  to: "/sector/$exchange/$sector",
                  params: { exchange: exchange.code, sector: sector.toLowerCase().replaceAll(" ", "-") },
                  search: () => ({}), hash: "",
                });
                const path = sitemapPathForLocation(router, location, sectorRouteId);
                if (path) entries.push({ path });
              }
            }
          }

          if (entries.length === 0) {
            return new Response(
              "No pages are included in this sitemap. Check route decisions and ancestor exclusions.",
              { status: 404, headers: { "Cache-Control": "no-store" } },
            );
          }

          return new Response(sitemapXML(BASE_URL, entries), {
            headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
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
