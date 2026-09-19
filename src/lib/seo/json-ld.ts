/**
 * json-ld.ts
 * Structured data (schema.org JSON-LD) builders for DeepScreen.
 *
 * READ THIS FIRST — the one thing that decides whether any of this matters:
 *
 * Googlebot executes JavaScript, so a <script type="application/ld+json">
 * rendered client-side (useEffect, react-helmet-async, whatever) reaches
 * Google fine. GPTBot, ClaudeBot and PerplexityBot do not execute
 * JavaScript as of mid-2026 — they read the raw HTML the server returns
 * and nothing else. If deepscreen.online ships as a client-rendered Vite/
 * React SPA, none of the JSON-LD below reaches ChatGPT, Claude or
 * Perplexity's crawlers unless it's baked into that first HTML response
 * (prerendering at build time, or SSR) rather than injected after hydration.
 *
 * Check this once, for real, before wiring anything in:
 *   curl -s https://deepscreen.online/stock/NASDAQ/FLWS | grep -c "1-800-FLOWERS"
 * A result of 0 means the raw HTML is an empty shell today — fix that first,
 * because perfect JSON-LD glued onto an invisible page is still invisible.
 *
 * Usage pattern: call one or more build*Schema() functions, combine them
 * with buildGraph(), then serialize with toJsonLdString() — never a bare
 * JSON.stringify — when writing into a <script> tag.
 */

// ---------------------------------------------------------------------------
// Shared types & constants
// ---------------------------------------------------------------------------

export type JsonLdNode = Record<string, unknown>;

export type ExchangeCode = "NSE" | "BSE" | "NYSE" | "NASDAQ" | "LSE";

/**
 * ISO 10383 Market Identifier Codes. schema.org's own guidance for
 * `tickerSymbol` recommends prefixing the raw ticker with the MIC of the
 * exchange it trades on, e.g. "XNAS FLWS" rather than just "FLWS".
 */
const EXCHANGE_MIC: Record<ExchangeCode, string> = {
  NSE: "XNSE",
  BSE: "XBOM",
  NYSE: "XNYS",
  NASDAQ: "XNAS",
  LSE: "XLON",
};

const EXCHANGE_FULL_NAME: Record<ExchangeCode, string> = {
  NSE: "National Stock Exchange of India",
  BSE: "BSE Ltd (Bombay Stock Exchange)",
  NYSE: "New York Stock Exchange",
  NASDAQ: "Nasdaq Stock Market",
  LSE: "London Stock Exchange",
};

export const SITE_URL = "https://deepscreen.online";
const SITE_NAME = "DeepScreen";
// Reused from the site's own og:image meta tag.
const LOGO_URL =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/lovp_1bxwyvrx5d8g39th060zayanwg/238b95339aa378e8d867ec5f57431dea_1789717752670.png";

// ---------------------------------------------------------------------------
// Organization & WebSite — emit once per page via buildGraph()
// ---------------------------------------------------------------------------

export function buildOrganizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    description:
      "Stock screener and fundamental-analysis platform covering NSE, BSE, NYSE, Nasdaq and LSE listings.",
    founder: {
      "@type": "Person",
      name: "Sooraj",
    },
    // Add once you have real public profile URLs (X/LinkedIn/GitHub/etc.) —
    // sameAs is one of the stronger signals for entity disambiguation:
    // sameAs: ["https://x.com/...", "https://linkedin.com/company/..."],
    //
    // Optional — a ContactPoint here makes this number more prominent in
    // search and AI answers (click-to-call, voice read-out) than the plain
    // footer text it already appears in on every page. It's already public,
    // this just raises its visibility — include only if that's wanted:
    // contactPoint: {
    //   "@type": "ContactPoint",
    //   telephone: "+91-72006-89491",
    //   contactType: "customer support",
    //   areaServed: ["IN", "US", "GB"],
    //   availableLanguage: ["en"],
    // },
  };
}

export function buildWebSiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    // Uncomment once a query-string-driven search page exists:
    // potentialAction: {
    //   "@type": "SearchAction",
    //   target: {
    //     "@type": "EntryPoint",
    //     urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    //   },
    //   "query-input": "required name=search_term_string",
    // },
  };
}

// ---------------------------------------------------------------------------
// Breadcrumbs — every non-homepage page should carry one
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildWebApplicationSchema(app: WebApplicationFacts): JsonLdNode {
  return {
    "@type": "WebApplication",
    name: app.name,
    url: app.url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web browser",
    publisher: { "@id": `${SITE_URL}/#organization` },
    description: app.description,
    ...(app.featureList?.length ? { featureList: app.featureList } : {}),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
// Note on Google rich results: FAQ rich results were fully retired in Google
// Search on 7 May 2026 (they'd already been restricted to gov/health sites
// since 2023) — this won't produce a visible dropdown in Google anymore, for
// anyone. FAQPage is still a valid schema.org type and worth keeping for
// semantic clarity, but the thing that actually earns an AI citation is the
// plain visible Q&A copy on the page, not the JSON-LD wrapper around it —
// so don't treat this as a substitute for writing the content well.

export interface QA {
  question: string;
  answer: string;
}

export function buildFAQSchema(qas: QA[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Corporation — the `about` entity on a stock page
// ---------------------------------------------------------------------------
// DeepScreen's Score and Verdict are deliberately NOT modelled as
// schema.org Rating/AggregateRating. Those types read semantically as a
// consensus rating or recommendation strength, which risks structured data
// implying exactly the "buy/sell signal" the site's own copy disclaims
// ("not a personalized recommendation"). additionalProperty/PropertyValue
// is schema.org's sanctioned escape hatch for a site-specific metric that
// doesn't map to an existing term — it carries the number without
// borrowing rating semantics that aren't intended.

export interface StockFacts {
  symbol: string;
  exchange: ExchangeCode;
  companyName: string;
  sector?: string;
  score?: number; // DeepScreen's own 0–100 model score
  verdict?: string; // e.g. "Hold"
}

export function buildCorporationSchema(stock: StockFacts): JsonLdNode {
  const additionalProperty: JsonLdNode[] = [];

  if (stock.score !== undefined) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "DeepScreen Score",
      value: stock.score,
      description:
        "DeepScreen's own 13-factor valuation and quality score out of 100 — a model output, not a third-party rating or investment recommendation.",
    });
  }
  if (stock.verdict) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "DeepScreen Verdict",
      value: stock.verdict,
    });
  }
  if (stock.sector) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Sector",
      value: stock.sector,
    });
  }

  return {
    "@type": "Corporation",
    name: stock.companyName,
    tickerSymbol: `${EXCHANGE_MIC[stock.exchange]} ${stock.symbol}`,
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };
}

// ---------------------------------------------------------------------------
// Article — Learn guides AND stock write-ups (the site's own og:type is
// "article" for both, so this mirrors that rather than inventing a type)
// ---------------------------------------------------------------------------

export interface ArticleFacts {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string;
  /** ISO 8601 date, e.g. "2026-09-11". Pull from real data — see note below. */
  datePublished?: string;
  dateModified?: string;
  about?: JsonLdNode;
}

export function buildArticleSchema(article: ArticleFacts): JsonLdNode {
  return {
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: article.url,
    mainEntityOfPage: article.url,
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    // Deliberately not defaulting either date from the other — a
    // "last updated" timestamp is not a publish date, and presenting one
    // as the other is inaccurate metadata (and can read as manipulative
    // to Google if dates appear to shift). Supply each independently, or
    // omit the one you don't actually know.
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(article.about ? { about: article.about } : {}),
    isAccessibleForFree: true,
  };
}

// ---------------------------------------------------------------------------
// Exchange listing / screener pages
// ---------------------------------------------------------------------------

export interface ExchangeFacts {
  code: ExchangeCode;
  url: string;
}

export function buildExchangeCollectionSchema(ex: ExchangeFacts): JsonLdNode {
  return {
    "@type": "CollectionPage",
    name: `${EXCHANGE_FULL_NAME[ex.code]} — DeepScreen screener`,
    url: ex.url,
    about: {
      "@type": "Thing",
      name: EXCHANGE_FULL_NAME[ex.code],
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    // Deliberately not enumerating every listed company here — that's a
    // paginated ItemList concern on the results themselves, not something
    // that belongs baked into the collection-level JSON-LD.
  };
}

// ---------------------------------------------------------------------------
// Generic fallback — About, Contact, Methodology, Pricing, Ratios, Options,
// Calendar, IPO, Portfolio, Answers, Research checklist, Data sources,
// Developers, Press: anything that's neither an Article nor an exchange page.
// ---------------------------------------------------------------------------

export interface WebPageFacts {
  name: string;
  description: string;
  url: string;
}

export interface WebApplicationFacts {
  name: string;
  url: string;
  description: string;
  featureList?: string[];
}

export function buildWebPageSchema(page: WebPageFacts): JsonLdNode {
  return {
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

// ---------------------------------------------------------------------------
// Combine + safely serialize
// ---------------------------------------------------------------------------

/** Wrap one or more schema nodes as a single JSON-LD graph for one <script> tag. */
export function buildGraph(...nodes: JsonLdNode[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

/**
 * JSON.stringify, escaping "<" so a value that happens to contain the
 * literal text "</script>" can never prematurely close the tag it's
 * embedded in. Always serialize through this — never a bare
 * JSON.stringify — for anything going into a <script> tag as a string.
 */
export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Backward-compatible alias used by existing routes. */
export const jsonLd = toJsonLdString;

// ---------------------------------------------------------------------------
// React wiring — adapt to however you already manage <head>. This file
// stays plain .ts (no JSX) so it can be imported from anywhere; the JSX
// itself lives in your page components.
// ---------------------------------------------------------------------------
//
// With react-helmet-async:
//
//   import { Helmet } from "react-helmet-async";
//   <Helmet>
//     <script type="application/ld+json">{toJsonLdString(graph)}</script>
//   </Helmet>
//
// Without a head-management library, a small component works too:
//
//   function JsonLd({ data }: { data: unknown }) {
//     return (
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: toJsonLdString(data) }}
//       />
//     );
//   }
//
// Either way, re-read the file header comment: this only exists once React
// mounts and runs client-side, which is fine for Google and invisible to
// GPTBot/ClaudeBot/PerplexityBot unless the route is prerendered or
// server-rendered.

// ---------------------------------------------------------------------------
// Example usage — reference only; wire real per-page data through these at
// your actual call sites and delete this block.
// ---------------------------------------------------------------------------

export function exampleUsage() {
  // Homepage
  const homepageGraph = buildGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildFAQSchema([
      {
        question: "What is DeepScreen?",
        answer:
          "DeepScreen is a stock screener that scores listed companies on 5 exchanges — NSE, BSE, NYSE, Nasdaq and LSE — using a 13-factor valuation and quality model covering P/E, PEG, P/S, P/B, EV/Revenue, EV/EBITDA, ROE, ROA, ROCE, leverage, payout and operating leverage.",
      },
      {
        question: "Which markets does it cover?",
        answer:
          "Indian markets through the NSE and BSE, US markets through the NYSE and Nasdaq, and UK markets through the LSE.",
      },
      {
        question: "Can I use it free?",
        answer:
          "Yes. Search, raw fundamental ratios, the IPO pipeline, news and the economic calendar are free. The full verdict, valuation models and alerts are part of Pro.",
      },
      {
        question: "Is this investment advice?",
        answer:
          "No. DeepScreen publishes analytical model output for research and education only, not investment advice.",
      },
    ])
  );

  // A stock page — /stock/NASDAQ/FLWS
  const flwsGraph = buildGraph(
    buildOrganizationSchema(),
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "NASDAQ", url: `${SITE_URL}/exchange/NASDAQ` },
      { name: "FLWS", url: `${SITE_URL}/stock/NASDAQ/FLWS` },
    ]),
    buildArticleSchema({
      headline: "FLWS — 1-800-FLOWERS.COM, Inc. Fundamental Analysis",
      description:
        "Research 1-800-FLOWERS.COM, Inc. (NASDAQ: FLWS): available financial ratios, valuation, company news and data limitations on DeepScreen.",
      url: `${SITE_URL}/stock/NASDAQ/FLWS`,
      about: buildCorporationSchema({
        symbol: "FLWS",
        exchange: "NASDAQ",
        companyName: "1-800-FLOWERS.COM, Inc.",
        sector: "Materials",
        score: 54,
        verdict: "Hold",
      }),
    }),
    buildFAQSchema([
      {
        question: "How does DeepScreen analyze 1-800-FLOWERS.COM, Inc.?",
        answer:
          "DeepScreen uses a 13-factor valuation and quality model. The methodology explains the factors and limitations; a model score is not an investment recommendation.",
      },
      {
        question: "What is FLWS's P/E ratio?",
        answer:
          "A provider-backed P/E ratio is currently unavailable. Do not substitute a simulated value for reported earnings data.",
      },
      {
        question: "How should I assess 1-800-FLOWERS.COM, Inc.'s profitability?",
        answer:
          "Compare reported ROE and ROCE with close peers over several reporting periods. Check accounting policies, leverage and one-off items before interpreting the ratios.",
      },
      {
        question: "How much debt does 1-800-FLOWERS.COM, Inc. have?",
        answer:
          "The available debt-to-equity ratio is 1.73x. Verify the underlying balance sheet date and definition of debt.",
      },
      {
        question: "Is FLWS a buy?",
        answer:
          "DeepScreen provides research tools, not a personalized recommendation. Verify valuation, risks, company filings and suitability independently.",
      },
    ])
  );

  // A Learn guide — /learn/pe-ratio-explained
  const peGuideGraph = buildGraph(
    buildOrganizationSchema(),
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Learn", url: `${SITE_URL}/learn` },
      {
        name: "P/E ratio explained",
        url: `${SITE_URL}/learn/pe-ratio-explained`,
      },
    ]),
    buildArticleSchema({
      headline: "P/E Ratio Explained: What It Measures and When It Misleads",
      description:
        "The price-to-earnings ratio tells you what the market pays per rupee of profit. Learn trailing vs forward P/E, sector norms, and when the ratio breaks.",
      url: `${SITE_URL}/learn/pe-ratio-explained`,
      dateModified: "2026-09-11", // the page's own "Last updated" line
    }),
    buildFAQSchema([
      {
        question: "What is a good P/E ratio?",
        answer:
          "There is no universal number. Judge it against the company's own history and its sector peers.",
      },
      {
        question: "Is a low P/E always better?",
        answer:
          "No. Low multiples often reflect declining earnings, high debt or governance concerns — the classic value trap.",
      },
      {
        question: "How do I calculate P/E?",
        answer:
          "Divide the current share price by earnings per share over the last twelve months.",
      },
    ])
  );

  return { homepageGraph, flwsGraph, peGuideGraph };
}
