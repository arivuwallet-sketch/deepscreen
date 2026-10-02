import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { INVESTMENT_BLOG_POSTS } from "@/lib/content/investment-blog";
import { buildBreadcrumbSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "Investment Research: Mutual Funds, ETFs & REITs | DeepScreen";
const description = "DeepScreen research guides for mutual funds, ETFs and REITs, with primary sources, worked examples and practical analysis frameworks.";
const url = "https://deepscreen.online/blog";

export const Route = createFileRoute("/blog/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "describedby", href: "https://deepscreen.online/llms.txt" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: jsonLd(buildGraph(
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema({ name: title, description, url }),
        buildBreadcrumbSchema([
          { name: "DeepScreen", url: "https://deepscreen.online/" },
          { name: "Research blog", url },
        ]),
        {
          "@type": "ItemList",
          "@id": url + "#articles",
          name: "DeepScreen investment research articles",
          itemListElement: INVESTMENT_BLOG_POSTS.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: "https://deepscreen.online/blog/" + post.slug,
            name: post.h1,
          })),
        },
      )),
    }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">DeepScreen research</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Investment research blog</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Original, source-backed guides for mutual funds, ETFs and REITs. Each article answers the search question first, shows the calculation or framework behind it, states the limits, and links to primary sources.
          </p>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-3" aria-label="Investment research articles">
          {INVESTMENT_BLOG_POSTS.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-xl border border-border bg-card/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
              <h2 className="mt-3 text-xl font-semibold leading-snug">
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-primary">
                  {post.h1}
                </Link>
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <time dateTime={post.published}>2 Oct 2026</time>
                <span>{post.readingMinutes} min read</span>
              </div>
              <Link to="/blog/$slug" params={{ slug: post.slug }} className="mt-4 text-sm font-medium text-primary hover:underline">
                Read the guide →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-xl border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Explore the investment research tools</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The blog explains the concepts. DeepScreen's investment directory applies type-specific mutual-fund, ETF and REIT analysis to supported listings without forcing stock-only metrics onto pooled funds or property trusts.
          </p>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <Link to="/investments" className="text-primary hover:underline">Investment directory</Link>
            <Link to="/mutual-funds" className="text-primary hover:underline">Mutual fund analysis</Link>
            <Link to="/etfs" className="text-primary hover:underline">ETF analysis</Link>
            <Link to="/reits" className="text-primary hover:underline">REIT analysis</Link>
            <Link to="/data-sources" className="text-primary hover:underline">Data sources</Link>
          </div>
        </section>
      </main>
    </Shell>
  );
}
