import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { knowledgeGroups } from "@/lib/discovery/knowledge-index";
import { LEGACY_BLOGS } from "@/lib/discovery/legacy-blog";
import { INVESTMENT_BLOG_POSTS } from "@/lib/content/investment-blog";
import {
  buildBreadcrumbSchema,
  buildGraph,
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
  jsonLd,
} from "@/lib/seo/json-ld";

const URL = "https://deepscreen.online/knowledge";
const title = "DeepScreen Knowledge Index — FAQ, Q&A & Research Blog";
const description =
  "Browse DeepScreen's public FAQ, Q&A, financial education and research-blog knowledge index. Every link points to visible, crawlable source content.";

export const Route = createFileRoute("/knowledge")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "describedby", href: "https://deepscreen.online/faq-index.txt" },
      { rel: "alternate", type: "text/plain", href: "https://deepscreen.online/faq-index.txt" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildOrganizationSchema(),
            buildWebSiteSchema(),
            buildWebPageSchema({ name: title, description, url: URL }),
            buildBreadcrumbSchema([
              { name: "DeepScreen", url: "https://deepscreen.online/" },
              { name: "Knowledge index", url: URL },
            ]),
          ),
        ),
      },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const groups = knowledgeGroups();
  const totalQuestions = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <Shell>
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Public knowledge directory
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            DeepScreen FAQ, Q&amp;A and research index
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This directory links to the visible HTML source for DeepScreen&apos;s canonical
            questions, FAQs and research articles. It is designed for people, search engines and AI
            retrieval systems. Current company and market facts should still be checked on the
            linked live page.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <span>{totalQuestions.toLocaleString()} indexed questions</span>
            <span>{INVESTMENT_BLOG_POSTS.length + LEGACY_BLOGS.length} research articles</span>
            <a href="/faq-index.txt" className="text-primary hover:underline">
              Plain-text index
            </a>
            <a href="/sitemap.xml" className="text-primary hover:underline">
              XML sitemap
            </a>
          </div>
        </header>

        <section className="mt-10 rounded-xl border border-border bg-panel p-5">
          <h2 className="text-xl font-semibold">Research blogs</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Public, indexable articles with visible source-backed copy and FAQ sections where
            applicable.
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {INVESTMENT_BLOG_POSTS.map((post) => (
              <li key={post.slug} className="rounded-lg border border-border bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {post.category}
                </p>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="mt-2 block font-semibold leading-snug hover:text-primary"
                >
                  {post.h1}
                </Link>
              </li>
            ))}
            {LEGACY_BLOGS.map((post) => (
              <li key={post.href} className="rounded-lg border border-border bg-card/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Market research
                </p>
                <a href={post.href} className="mt-2 block font-semibold leading-snug hover:text-primary">
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {groups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="mt-10 scroll-mt-36 border-t border-border pt-8"
            aria-labelledby={group.id + "-heading"}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id={group.id + "-heading"} className="text-2xl font-semibold">
                  {group.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {group.description}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {group.entries.length} questions
              </span>
            </div>
            <ul className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">
              {group.entries.map((entry) => (
                <li key={entry.href + entry.question}>
                  <a
                    href={entry.href}
                    className="block rounded-lg border border-border bg-card/20 px-4 py-3 text-sm leading-6 transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {entry.question}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="font-semibold">Dynamic company and investment questions</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            DeepScreen also publishes visible research questions on every public stock detail page
            and supported mutual-fund, ETF and REIT detail page. Those URLs are enumerated in the
            XML sitemap so crawlers can discover the complete dynamic set without duplicating
            thousands of links on this page.
          </p>
          <a href="/sitemap.xml" className="mt-3 inline-block text-sm text-primary hover:underline">
            Open the complete public sitemap →
          </a>
        </section>
      </article>
    </Shell>
  );
}
