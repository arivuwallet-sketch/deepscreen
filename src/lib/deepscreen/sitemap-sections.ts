import { DIRECTORY_PAGE_SIZE, exchangePath } from "@/lib/seo/directory";
import type { AnyRouter } from "@tanstack/react-router";

import {
  isSitemapRouteIncluded,
  sitemapStaticPaths,
  type SitemapEntry,
} from "@/lib/sitemap";
import { EXCHANGES } from "@/lib/deepscreen/exchanges";
import { GUIDES } from "@/lib/deepscreen/guides";
import { INVESTMENTS } from "@/lib/deepscreen/investments";
import { SECTORS, STOCKS, stocksByExchange } from "@/lib/deepscreen/stocks";
import { STOCK_FILTER_PRESETS } from "@/lib/deepscreen/stock-filter-presets";
import {
  COMPARISONS,
  RANKINGS,
  RATIOS,
  ratioGuideSlug,
  STOCK_COMPARISONS,
  STRATEGY_GUIDES,
} from "@/lib/seo/content";

// Topic-scoped child sitemaps keep individual responses small and make
// coverage easier to diagnose. Sitemap inclusion does not guarantee indexing.
export const STOCK_CHUNK_SIZE = 2000;
export const INVESTMENT_CHUNK_SIZE = 2000;

const SAFE_SITEMAP_PATH = /^\/[A-Za-z0-9\-._~/=%&'()]*$/;

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
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[
          character
        ]!,
    );

  const seen = new Set<string>();
  const items: string[] = [];

  for (const path of paths) {
    if (!SAFE_SITEMAP_PATH.test(path)) throw new Error("Invalid sitemap path");
    const url = new URL(path, origin);
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    items.push("<sitemap><loc>" + escape(url.href) + "</loc></sitemap>");
  }

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    items.join("") +
    "</sitemapindex>"
  );
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function interpolatePath(template: string, params: Record<string, string>): string {
  return template.replace(/\$([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) throw new Error("Missing sitemap parameter: " + key);
    return encodePathSegment(value);
  });
}

/**
 * Dynamic route expansion does not need route matching for every URL. Matching
 * 13k+ locations against the router on every sitemap request was needlessly
 * expensive and could cause fetch failures on edge/serverless runtimes.
 *
 * We still verify that the route itself is intentionally included in the sitemap.
 */
function collectDynamic(
  router: AnyRouter,
  routeId: string,
  template: string,
  paramsList: Array<Record<string, string>>,
): SitemapEntry[] {
  if (!isSitemapRouteIncluded(router.routesById[routeId])) return [];

  return paramsList.map((params) => ({
    path: interpolatePath(template, params),
  }));
}

function sectorParams(): Array<Record<string, string>> {
  const params: Array<Record<string, string>> = [];

  for (const exchange of EXCHANGES) {
    for (const sector of SECTORS) {
      if (!stocksByExchange(exchange.code).some((stock) => stock.sector === sector)) continue;
      params.push({
        exchange: exchange.code,
        sector: sector.toLowerCase().replaceAll(" ", "-"),
      });
    }
  }

  return params;
}

/** Returns the stable list of child sitemap names without building all URLs. */
export function sitemapSectionNames(): string[] {
  const names = ["core", "markets", "learn", "filters", "directories"];

  for (let index = 0; index * INVESTMENT_CHUNK_SIZE < INVESTMENTS.length; index += 1) {
    names.push("investments-" + (index + 1));
  }

  for (let index = 0; index * STOCK_CHUNK_SIZE < STOCKS.length; index += 1) {
    names.push("stocks-" + (index + 1));
  }

  return names;
}

let cachedSections: Map<string, SitemapEntry[]> | undefined;

/** Ordered map of sitemap section name -> entries. */
export function buildSitemapSections(router: AnyRouter): Map<string, SitemapEntry[]> {
  if (cachedSections) return cachedSections;

  const sections = new Map<string, SitemapEntry[]>();

  const core = sitemapStaticPaths(router).map((path) => ({ path }));

  const markets = [
    ...collectDynamic(
      router,
      "/exchange/$code",
      "/exchange/$code",
      EXCHANGES.map((exchange) => ({ code: exchange.code })),
    ),
    ...collectDynamic(
      router,
      "/sector/$exchange/$sector",
      "/sector/$exchange/$sector",
      sectorParams(),
    ),
  ];

  const directories = isSitemapRouteIncluded(router.routesById["/exchange/$code"])
    ? EXCHANGES.flatMap((exchange) => {
        const pages = Math.ceil(stocksByExchange(exchange.code).length / DIRECTORY_PAGE_SIZE);
        return Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({
          path: exchangePath(exchange.code, index + 2),
        }));
      })
    : [];

  const learn = [
    ...collectDynamic(
      router,
      "/learn/$slug",
      "/learn/$slug",
      [...new Set([...GUIDES.map((item) => item.slug), ...RATIOS.map((item) => ratioGuideSlug(item.slug))])].map((slug) => ({ slug })),
    ),
    ...collectDynamic(
      router,
      "/best/$slug",
      "/best/$slug",
      RANKINGS.map((item) => ({ slug: item.slug })),
    ),
    ...collectDynamic(
      router,
      "/compare/$slug",
      "/compare/$slug",
      [...COMPARISONS, ...STOCK_COMPARISONS].map((item) => ({ slug: item.slug })),
    ),
    ...collectDynamic(
      router,
      "/options/$slug",
      "/options/$slug",
      STRATEGY_GUIDES.map((item) => ({ slug: item.slug })),
    ),
  ];

  // Every public stock-filter URL is discoverable. Data-backed pages show
  // matching companies; reference pages explain the category and required
  // evidence without fabricating membership.
  const filters = collectDynamic(
    router,
    "/stock-filters/$slug",
    "/stock-filters/$slug",
    STOCK_FILTER_PRESETS.map((preset) => ({ slug: preset.id })),
  );

  const stocks = collectDynamic(
    router,
    "/stock/$exchange/$symbol",
    "/stock/$exchange/$symbol",
    STOCKS.map((stock) => ({
      exchange: stock.exchange,
      symbol: stock.symbol,
    })),
  );

  const investments = collectDynamic(
    router,
    "/investment/$market/$type/$code",
    "/investment/$market/$type/$code",
    INVESTMENTS.map((investment) => ({
      market: investment.market,
      type: investment.type,
      code: investment.code,
    })),
  );

  if (core.length) sections.set("core", core);
  if (markets.length) sections.set("markets", markets);
  if (learn.length) sections.set("learn", learn);
  if (filters.length) sections.set("filters", filters);
  if (directories.length) sections.set("directories", directories);

  for (let index = 0; index * INVESTMENT_CHUNK_SIZE < investments.length; index += 1) {
    sections.set(
      "investments-" + (index + 1),
      investments.slice(index * INVESTMENT_CHUNK_SIZE, (index + 1) * INVESTMENT_CHUNK_SIZE),
    );
  }

  for (let index = 0; index * STOCK_CHUNK_SIZE < stocks.length; index += 1) {
    sections.set(
      "stocks-" + (index + 1),
      stocks.slice(index * STOCK_CHUNK_SIZE, (index + 1) * STOCK_CHUNK_SIZE),
    );
  }

  cachedSections = sections;
  return sections;
}
