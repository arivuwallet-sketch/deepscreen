import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Shell } from "@/components/ds/Shell";
import { TopicIndex } from "@/components/ds/TopicIndex";
import { GUIDES, findGuide } from "@/lib/deepscreen/guides";
import { metaKeywords, keywordGroups } from "@/lib/seo/keywords";

const BASE = "https://deepscreen.online";

function keywordsFor(groups: string[]) {
  return keywordGroups.filter((g) => groups.includes(g.id)).map((g) => g.keywords);
}

export const Route = createFileRoute("/learn/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const guide = findGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ params }) => {
    const guide = findGuide(params.slug);
    if (!guide) return {};
    const url = `${BASE}/learn/${guide.slug}`;
    return {
      meta: [
        { title: `${guide.title} — DeepScreen` },
        { name: "description", content: guide.description },
        { property: "og:title", content: guide.title },
        { property: "og:description", content: guide.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "keywords",
          content: metaKeywords(guide.topics, ...keywordsFor(guide.groups)),
        },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.h1,
            description: guide.description,
            dateModified: guide.updated,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "DeepScreen" },
            publisher: { "@type": "Organization", name: "DeepScreen", url: BASE },
            about: guide.topics,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
              { "@type": "ListItem", position: 2, name: "Learn", item: `${BASE}/learn` },
              { "@type": "ListItem", position: 3, name: guide.h1, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link to="/learn" className="hover:underline">
            Learn
          </Link>
        </nav>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">{guide.h1}</h1>
        <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
          {guide.answer}
        </p>

        {guide.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {guide.faqs.map((f) => (
              <div key={f.q}>
                <dt className="text-sm font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">Keep reading</h2>
          <ul className="mt-3 space-y-2">
            {related.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/learn/$slug"
                  params={{ slug: g.slug }}
                  className="text-sm text-primary hover:underline"
                >
                  {g.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <TopicIndex ids={guide.groups} title="Related topics" inContainer limit={30} />

        <p className="mt-10 text-xs text-muted-foreground">
          Educational content only. Nothing here is investment advice. Last updated {guide.updated}.
        </p>
      </article>
    </Shell>
  );
}
