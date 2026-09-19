/**
 * Schema.org JSON-LD builders for DeepScreen.
 *
 * Keep structured data aligned with visible page content. Google Search can
 * process JavaScript-generated JSON-LD, but crawler capabilities vary across
 * search engines and AI services, so server-rendered/prerendered HTML is
 * preferable whenever the framework makes that practical.
 */

export type JsonLdNode = Record<string, unknown>;

export type ExchangeCode = "NSE" | "BSE" | "NYSE" | "NASDAQ" | "LSE";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface QA {
  question: string;
  answer: string;
}

export interface StockFacts {
  symbol: string;
  exchange: ExchangeCode;
  companyName: string;
  sector?: string;
  score?: number;
  verdict?: string;
}

export interface ArticleFacts {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
  about?: JsonLdNode;
}

export interface ExchangeFacts {
  code: ExchangeCode;
  url: string;
}

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
export const SITE_NAME = "DeepScreen";
export const LOGO_URL = `${SITE_URL}/logo.svg`;

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
    email: "deepscreen.online@outlook.com",
    areaServed: ["IN", "US", "GB"],
    description:
      "Stock screener and fundamental-analysis platform covering NSE, BSE, NYSE, Nasdaq and LSE listings.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "deepscreen.online@outlook.com",
      availableLanguage: ["en"],
    },
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
  };
}

export function buildWebApplicationSchema(app: WebApplicationFacts): JsonLdNode {
  return {
    "@type": "WebApplication",
    name: app.name,
    url: app.url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web browser",
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

export function buildCorporationSchema(stock: StockFacts): JsonLdNode {
  const additionalProperty: JsonLdNode[] = [];

  if (stock.score !== undefined) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "DeepScreen Score",
      value: stock.score,
      description:
        "DeepScreen's own 13-factor valuation and quality model score out of 100; it is model output, not a third-party rating or personalized investment recommendation.",
    });
  }

  if (stock.verdict) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "DeepScreen Verdict",
      value: stock.verdict,
      description: "DeepScreen's own analytical model output.",
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

export function buildArticleSchema(article: ArticleFacts): JsonLdNode {
  return {
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: article.url,
    mainEntityOfPage: article.url,
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(article.about ? { about: article.about } : {}),
    isAccessibleForFree: true,
  };
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
  };
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

export function buildGraph(...nodes: JsonLdNode[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

/**
 * Safely serialize JSON-LD for an inline script element. Replacing HTML
 * delimiters prevents a data value from prematurely closing the script tag.
 */
export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/** Backward-compatible alias used by existing routes. */
export const jsonLd = toJsonLdString;
