import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { COMPARISONS, STOCK_COMPARISONS } from "@/lib/seo/content";
import { resourceHead } from "@/lib/seo/discovery";

export const Route = createFileRoute("/compare/")({
  staticData: { sitemap: true },
  head: () => resourceHead("/compare", "Stock and Ratio Comparisons | DeepScreen", "Compare companies and understand the differences between financial ratios and research approaches.", ["stock comparisons", "financial ratio comparisons"]),
  component: ComparisonIndex,
});

function ComparisonIndex() {
  return <Shell><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold">Stock and ratio comparisons</h1>
    <p className="mt-3 text-muted-foreground">Compare company fundamentals and learn how different research measures fit together. Verify figures against company disclosures before making investment decisions.</p>
    <h2 className="mt-8 text-xl font-semibold">Company comparisons</h2>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{STOCK_COMPARISONS.map((item) => <li key={item.slug}><Link to="/compare/$slug" params={{ slug: item.slug }} className="block rounded-lg border border-border p-4 hover:border-primary">{item.left.symbol} ({item.left.exchange}) vs {item.right.symbol} ({item.right.exchange})</Link></li>)}</ul>
    <h2 className="mt-8 text-xl font-semibold">Ratios and research approaches</h2>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{COMPARISONS.map((item) => <li key={item.slug}><Link to="/compare/$slug" params={{ slug: item.slug }} className="block rounded-lg border border-border p-4 hover:border-primary"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p></Link></li>)}</ul>
  </main></Shell>;
}
