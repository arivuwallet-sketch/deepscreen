import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { RATIOS } from "@/lib/seo/content";

const URL = "https://deepscreen.online/ratios";
export const Route = createFileRoute("/ratios/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Stock Market Ratio Glossary | DeepScreen" },
    { name: "description", content: "Plain-English definitions, formulas and limitations for the 13 fundamental ratios used by DeepScreen." },
    { property: "og:title", content: "Stock Market Ratio Glossary | DeepScreen" },
    { property: "og:description", content: "Learn P/E, PEG, P/S, P/B, EV/EBITDA, ROE, ROA, ROCE, debt ratios and more." },
    { property: "og:type", content: "website" }, { property: "og:url", content: URL }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: URL }] }),
  component: RatioIndex,
});
function RatioIndex() { return <Shell><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">Stock market ratio glossary</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">Understand DeepScreen’s 13-factor model plus Piotroski, Altman and Beneish financial-health scores.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{RATIOS.map(r => <Link key={r.slug} to="/learn/$slug" params={{ slug: r.slug }} className="rounded-lg border border-border bg-panel p-5 hover:border-primary"><h2 className="font-semibold">{r.shortName} — {r.name}</h2><p className="mt-2 text-sm text-muted-foreground">{r.answer}</p></Link>)}</div></main></Shell>; }
