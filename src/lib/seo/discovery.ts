import {
  buildBreadcrumbSchema,
  buildGraph,
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
  jsonLd,
} from "./json-ld";
import { DEEPSCREEN_ENTITY_DESCRIPTION, DEEPSCREEN_NAME, DEEPSCREEN_TITLE } from "./brand";
export const ORIGIN = "https://deepscreen.online";
export const ORGANIZATION_ID = `${ORIGIN}/#organization`;
export const WEBSITE_ID = `${ORIGIN}/#website`;
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: DEEPSCREEN_NAME,
      url: `${ORIGIN}/`,
      alternateName: ["DeepScreen Global Stock Screener", DEEPSCREEN_TITLE],
      description: DEEPSCREEN_ENTITY_DESCRIPTION,
      email: "deepscreen.online@outlook.com",
      areaServed: ["IN", "US", "GB"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "deepscreen.online@outlook.com",
        availableLanguage: "en",
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: DEEPSCREEN_NAME,
      url: `${ORIGIN}/`,
      inLanguage: "en",
      publisher: { "@id": ORGANIZATION_ID },
      alternateName: ["DeepScreen Global Stock Screener", DEEPSCREEN_TITLE],
      description: DEEPSCREEN_ENTITY_DESCRIPTION,
    },
  ],
};
type Answer = { id: string; question: string; answer: string };
export function faqNode(path: string, answers: readonly Answer[]) {
  return {
    "@type": "FAQPage",
    "@id": `${ORIGIN}${path}#webpage`,
    url: `${ORIGIN}${path}`,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntity: answers.map((a) => ({
      "@type": "Question",
      "@id": `${ORIGIN}${path}#${a.id}`,
      name: a.question,
      acceptedAnswer: { "@type": "Answer", text: a.answer },
    })),
  };
}
export function resourceHead(
  path: string,
  title: string,
  description: string,
  keywords: string[],
  answers?: readonly Answer[],
) {
  const url = `${ORIGIN}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "keywords", content: keywords.join(", ") },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: DEEPSCREEN_NAME },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "describedby", href: `${ORIGIN}/llms.txt` },
      { rel: "alternate", type: "text/plain", href: `${ORIGIN}/faq-index.txt` },
      { rel: "help", href: `${ORIGIN}/answers` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildOrganizationSchema(),
            buildWebSiteSchema(),
            answers
              ? {
                  ...faqNode(path, answers),
                  name: title,
                  description,
                  breadcrumb: { "@id": `${url}#breadcrumbs` },
                }
              : {
                  ...buildWebPageSchema({ name: title, description, url }),
                  "@id": `${url}#webpage`,
                  inLanguage: "en",
                  breadcrumb: { "@id": `${url}#breadcrumbs` },
                },
            buildBreadcrumbSchema([
              { name: DEEPSCREEN_NAME, url: `${ORIGIN}/` },
              { name: title.split(" | ")[0] ?? title, url },
            ]),
          ),
        ),
      },
    ],
  };
}
