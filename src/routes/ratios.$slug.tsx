import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { findRatio } from "@/lib/seo/content";
import { learnKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";
const BASE = "https://deepscreen.online";
export const Route = createFileRoute("/ratios/$slug")({
  staticData: { sitemap: true }, loader: ({ params }) => { const ratio = findRatio(params.slug); if (!ratio) throw notFound(); return { ratio }; },
  head: ({ loaderData }) => { if (!loaderData) return {}; const r = loaderData.ratio; const url = `${BASE}/ratios/${r.slug}`; const title = `${r.shortName} (${r.name}) Explained | DeepScreen`; return { meta: [
    { title }, { name: "description", content: r.answer }, { name: "keywords", content: metaKeywords([r.name, r.shortName, `${r.shortName} formula`, `${r.shortName} stocks`], learnKeywords, screenerKeywords) },
    { property: "og:title", content: title }, { property: "og:description", content: r.answer }, { property: "og:type", content: "article" }, { property: "og:url", content: url }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: url }], scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: title, description: r.answer, author: { "@type": "Organization", name: "DeepScreen" }, mainEntityOfPage: url },
    { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: `What is ${r.shortName}?`, acceptedAnswer: { "@type": "Answer", text: r.answer } }, { "@type": "Question", name: `How is ${r.shortName} calculated?`, acceptedAnswer: { "@type": "Answer", text: r.formula } }] },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` }, { "@type": "ListItem", position: 2, name: "Ratio glossary", item: `${BASE}/ratios` }, { "@type": "ListItem", position: 3, name: r.shortName, item: url }] }
  ] }) }] }; }, component: RatioPage,
});
function RatioPage() { const { ratio: r } = Route.useLoaderData(); return <Shell><article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"><nav aria-label="Breadcrumb" className="text-xs text-muted-foreground"><Link to="/">Home</Link> {" / "}<Link to="/ratios">Ratios</Link> {" / "}{r.shortName}</nav><h1 className="mt-4 text-3xl font-bold">{r.shortName}: {r.name} explained</h1><p className="mt-5 rounded-lg border border-border bg-panel p-5 leading-relaxed">{r.answer}</p><section className="mt-8"><h2 className="text-lg font-semibold">Formula</h2><p className="num mt-3 rounded border border-border bg-muted p-4">{r.formula}</p></section><section className="mt-8"><h2 className="text-lg font-semibold">How to interpret {r.shortName}</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{r.interpretation.map(x => <li key={x}>• {x}</li>)}</ul></section><section className="mt-8"><h2 className="text-lg font-semibold">Limitations</h2><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{r.cautions.map(x => <li key={x}>• {x}</li>)}</ul></section><p className="mt-10 text-xs text-muted-foreground">Educational content only. Ratios are inputs to research, not investment recommendations.</p></article></Shell>; }
