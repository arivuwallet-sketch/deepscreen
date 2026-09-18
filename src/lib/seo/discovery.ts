import { jsonLd } from "./json-ld";
export const ORIGIN = "https://deepscreen.online";
export const ORGANIZATION_ID = `${ORIGIN}/#organization`;
export const WEBSITE_ID = `${ORIGIN}/#website`;
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "DeepScreen",
      url: `${ORIGIN}/`,
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
      name: "DeepScreen",
      url: `${ORIGIN}/`,
      inLanguage: "en",
      publisher: { "@id": ORGANIZATION_ID },
      description:
        "Stock screening and fundamental research across supported Indian, US and UK listings.",
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
      { name: "keywords", content: keywords.join(", ") },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            answers
              ? {
                  ...faqNode(path, answers),
                  name: title,
                  description,
                  breadcrumb: { "@id": `${url}#breadcrumbs` },
                }
              : {
                  "@type": "WebPage",
                  "@id": `${url}#webpage`,
                  url,
                  name: title,
                  description,
                  inLanguage: "en",
                  isPartOf: { "@id": WEBSITE_ID },
                  publisher: { "@id": ORGANIZATION_ID },
                  breadcrumb: { "@id": `${url}#breadcrumbs` },
                },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumbs`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "DeepScreen", item: `${ORIGIN}/` },
                { "@type": "ListItem", position: 2, name: title.split(" | ")[0], item: url },
              ],
            },
          ],
        }),
      },
    ],
  };
}
