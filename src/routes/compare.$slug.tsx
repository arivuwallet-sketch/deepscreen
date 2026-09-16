import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { analyze } from "@/lib/deepscreen/metrics";
import { findStock } from "@/lib/deepscreen/stocks";
import { findComparison, findStockComparison } from "@/lib/seo/content";
import { metaKeywords, screenerKeywords, stocksKeywords } from "@/lib/seo/keywords";

const BASE = "https://deepscreen.online";
export const Route = createFileRoute("/compare/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const comparison = findComparison(params.slug);
    const pair = findStockComparison(params.slug);
    if (!comparison && !pair) throw notFound();
    if (pair) {
      const left = findStock(pair.left.exchange, pair.left.symbol);
      const right = findStock(pair.right.exchange, pair.right.symbol);
      if (!left || !right) throw notFound();
      return { comparison: null, left, right };
    }
    return { comparison: comparison!, left: null, right: null };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const stockTitle = loaderData.left && loaderData.right ? `${loaderData.left.name} vs ${loaderData.right.name}: Fundamental Comparison` : null;
    const title = stockTitle ?? `${loaderData.comparison!.title}: Key Differences`;
    const description = loaderData.left && loaderData.right ? `Compare ${loaderData.left.symbol} and ${loaderData.right.symbol} by DeepScreen score, P/E, PEG, ROCE, growth and leverage.` : loaderData.comparison!.description;
    const url = `${BASE}/compare/${params.slug}`;
    return { meta: [{ title: `${title} | DeepScreen` }, { name: "description", content: description }, { name: "keywords", content: metaKeywords([title, `${title} comparison`, "compare stocks", "stock comparison", "fundamental comparison"], stocksKeywords, screenerKeywords) }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { property: "og:url", content: url }, { name: "twitter:card", content: "summary_large_image" }, { name: "twitter:title", content: title }, { name: "twitter:description", content: description }], links: [{ rel: "canonical", href: url }], scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Article", headline: title, description, datePublished: "2026-09-14", dateModified: "2026-09-14", mainEntityOfPage: url, author: { "@type": "Organization", name: "DeepScreen" } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` }, { "@type": "ListItem", position: 2, name: title, item: url }] }] }) }] };
  },
  component: ComparisonPage,
});

function ComparisonPage() {
  const { comparison: c, left, right } = Route.useLoaderData();
  if (left && right) {
    const la = analyze(left), ra = analyze(right);
    const rows = [["DeepScreen score", `${la.score}/100`, `${ra.score}/100`], ["Verdict", la.verdict, ra.verdict], ["P/E", `${left.fundamentals.pe}x`, `${right.fundamentals.pe}x`], ["PEG", `${left.fundamentals.peg}`, `${right.fundamentals.peg}`], ["ROCE", `${left.fundamentals.roce}%`, `${right.fundamentals.roce}%`], ["Revenue growth", `${left.fundamentals.growth}%`, `${right.fundamentals.growth}%`], ["Debt/equity", `${left.fundamentals.debtToEquity}x`, `${right.fundamentals.debtToEquity}x`]];
    return <Shell><article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><nav className="text-xs text-muted-foreground"><Link to="/">Home</Link> {" / "}Compare</nav><h1 className="mt-4 text-3xl font-bold">{left.name} vs {right.name}</h1><p className="mt-5 rounded-lg border border-border bg-panel p-5">DeepScreen compares {left.symbol} and {right.symbol} using the same fundamental-analysis framework. The table keeps core numbers open; review each company’s filings before deciding which business better fits your research.</p><p className="mt-3 text-xs text-muted-foreground"><time dateTime="2026-09-14">Last updated September 14, 2026</time></p><CompareTable headings={[left.symbol, right.symbol]} rows={rows}/></article></Shell>;
  }
  if (!c) return null;
  return <Shell><article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><nav className="text-xs text-muted-foreground"><Link to="/">Home</Link> {" / "}Compare</nav><h1 className="mt-4 text-3xl font-bold">{c.title}</h1><p className="mt-5 rounded-lg border border-border bg-panel p-5">{c.answer}</p><CompareTable headings={[c.left, c.right]} rows={c.rows}/></article></Shell>;
}

function CompareTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return <div className="mt-8 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[600px] text-sm"><thead className="bg-muted"><tr><th scope="col" className="p-4 text-left">Measure</th><th scope="col" className="p-4 text-left">{headings[0]}</th><th scope="col" className="p-4 text-left">{headings[1]}</th></tr></thead><tbody className="divide-y divide-border">{rows.map(row => <tr key={row[0]}><th scope="row" className="p-4 text-left font-medium">{row[0]}</th><td className="p-4 text-muted-foreground">{row[1]}</td><td className="p-4 text-muted-foreground">{row[2]}</td></tr>)}</tbody></table></div>;
}