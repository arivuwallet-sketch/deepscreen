import type { AnyRouter } from "@tanstack/react-router";

import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  type SitemapEntry,
} from "@/lib/sitemap";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { GUIDES } from "@/lib/deepscreen/guides";
import { SECTORS, STOCKS, stocksByExchange } from "@/lib/deepscreen/stocks";
import {
  COMPARISONS,
  RANKINGS,
  RATIOS,
  STOCK_COMPARISONS,
  STRATEGY_GUIDES,
} from "@/lib/seo/content";

// Large sites index better when the sitemap is split into a sitemap index with
// smaller, topic-scoped child sitemaps. Search Console then reports coverage per
// section instead of lumping every URL into one 13k-entry file.
export const STOCK_CHUNK_SIZE = 2000;

const SAFE_SITEMAP_PATH = /^\/[A-Za-z0-9\-._~/]*$/;

/** Renders a <sitemapindex> pointing at the child sitemaps. */
export function sitemapIndexXML(baseURL: string, paths: string[]): string {
  const origin = new URL(baseURL);
  if (
    !/^https?:$/.test(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error("The sitemap base URL must be the public site origin");
  }
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!,
    );
  const seen = new Set<string>();
  const items: string[] = [];
  for (const path of paths) {
    if (!SAFE_SITEMAP_PATH.test(path)) throw new Error("Invalid sitemap path");
    const url = new URL(path, origin);
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    items.push(`<sitemap><loc>${escape(url.href)}</loc></sitemap>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.join("")}</sitemapindex>`;
}

function collect(
  router: AnyRouter,
  routeId: string,
  to: string,
  paramsList: Array<Record<string, string>>,
): SitemapEntry[] {
  if (!isSitemapRouteIncluded(router.routesById[routeId])) return [];
  const entries: SitemapEntry[] = [];
  for (const params of paramsList) {
    const location = router.buildLocation({ to, params, search: () => ({}), hash: "" } as never);
    const path = sitemapPathForLocation(router, location, routeId);
    if (path) entries.push({ path });
  }
  return entries;
}

function sectorParams(): Array<Record<string, string>> {
  const params: Array<Record<string, string>> = [];
  for (const exchange of EXCHANGES) {
    for (const sector of SECTORS) {
      if (!stocksByExchange(exchange.code).some((stock) => stock.sector === sector)) continue;
      params.push({ exchange: exchange.code, sector: sector.toLowerCase().replaceAll(" ", "-") });
    }
  }
  return params;
}

/** Ordered map of sitemap section name -> entries. Empty sections are dropped. */
export function buildSitemapSections(router: AnyRouter): Map<string, SitemapEntry[]> {
  const sections = new Map<string, SitemapEntry[]>();

  const core = sitemapStaticPaths(router).map((path) => ({ path }));
  const markets = [
    ...collect(
      router,
      "/exchange/$code",
      "/exchange/$code",
      EXCHANGES.map((exchange) => ({ code: exchange.code })),
    ),
    ...collect(router, "/sector/$exchange/$sector", "/sector/$exchange/$sector", sectorParams()),
  ];
  const learn = [
    ...collect(
      router,
      "/learn/$slug",
      "/learn/$slug",
      [...GUIDES, ...RATIOS].map((item) => ({ slug: item.slug })),
    ),
    ...collect(
      router,
      "/best/$slug",
      "/best/$slug",
      RANKINGS.map((item) => ({ slug: item.slug })),
    ),
    ...collect(
      router,
      "/compare/$slug",
      "/compare/$slug",
      [...COMPARISONS, ...STOCK_COMPARISONS].map((item) => ({ slug: item.slug })),
    ),
    ...collect(
      router,
      "/options/$slug",
      "/options/$slug",
      STRATEGY_GUIDES.map((item) => ({ slug: item.slug })),
    ),
  ];

  const stocks = collect(
    router,
    "/stock/$exchange/$symbol",
    "/stock/$exchange/$symbol",
    STOCKS.map((stock) => ({ exchange: stock.exchange, symbol: stock.symbol })),
  );

  if (core.length) sections.set("core", core);
  if (markets.length) sections.set("markets", markets);
  if (learn.length) sections.set("learn", learn);
  for (let index = 0; index * STOCK_CHUNK_SIZE < stocks.length; index += 1) {
    sections.set(
      `stocks-${index + 1}`,
      stocks.slice(index * STOCK_CHUNK_SIZE, (index + 1) * STOCK_CHUNK_SIZE),
    );
  }

  return sections;
}
