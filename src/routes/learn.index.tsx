import { createFileRoute, Link } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { GUIDES } from "@/lib/deepscreen/guides";
import { learnKeywords, metaKeywords, screenerKeywords } from "@/lib/seo/keywords";
import { RATIOS } from "@/lib/seo/content";

const URL = "https://deepscreen.online/learn";

export const Route = createFileRoute("/learn/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Learn the Markets — Investing & Trading Guides — DeepScreen" },
      {
        name: "description",
        content:
          "Plain-English answers on stock screening, NSE vs BSE, candlestick charts, P/E ratios, IPO applications, options, dividends and portfolio building.",
      },
      { property: "og:title", content: "Investing & Trading Guides — DeepScreen" },
      {
        property: "og:description",
        content:
          "Straight answers to the questions investors actually ask, across Indian, US and UK markets.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "keywords", content: metaKeywords(learnKeywords, screenerKeywords) },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "DeepScreen market guides",
          itemListElement: GUIDES.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: g.h1,
            url: `https://deepscreen.online/learn/${g.slug}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://deepscreen.online/" },
            { "@type": "ListItem", position: 2, name: "Learn", item: URL },
          ],
        }),
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Learn the markets</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Direct answers to the questions investors actually search for — how screening works, how
          Indian, US and UK exchanges differ, how to read a chart, and how to size a portfolio. No
          jargon, no signals, no hype.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              to="/learn/$slug"
              params={{ slug: g.slug }}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <h2 className="text-base font-semibold text-foreground">{g.h1}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {g.topics.slice(0, 4).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
        <section className="mt-10"><h2 className="text-lg font-semibold">Fundamental ratio glossary</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{RATIOS.map(r => <Link key={r.slug} to="/learn/$slug" params={{ slug: r.slug }} className="rounded-lg border border-border bg-card p-4 hover:border-primary"><h3 className="font-semibold">{r.shortName}</h3><p className="mt-2 text-sm text-muted-foreground">{r.answer}</p></Link>)}</div></section>

        <TopicIndex
          title="Every topic covered on DeepScreen"
          intro="Browse the subject index and jump straight to the tool that answers it."
          inContainer
        />
      </div>
    </Shell>
  );
}
