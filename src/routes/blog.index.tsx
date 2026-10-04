import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { INVESTMENT_BLOG_POSTS } from "@/lib/content/investment-blog";
import { buildBreadcrumbSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "Market, Investing & Personal Finance Blog | DeepScreen";
const description = "DeepScreen research on markets, investing and personal finance: saving money, protecting wealth, increasing income, funds, ETFs, REITs, commodities, GIFT Nifty and IPOs.";
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
          name: "DeepScreen market and investment research articles",
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">DeepScreen research</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Market, investing and personal finance research</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Original, source-backed guides for saving money, protecting wealth, increasing income, mutual funds, ETFs, REITs, commodities, GIFT Nifty and IPO research. Each article answers the search question first, shows the framework behind it, states the limits, and links to primary sources.
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
                <time dateTime={post.published}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(post.published + "T00:00:00Z"))}</time>
                <span>{post.readingMinutes} min read</span>
              </div>
              <Link to="/blog/$slug" params={{ slug: post.slug }} className="mt-4 text-sm font-medium text-primary hover:underline">
                Read the guide →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Today · 4 October 2026</p>
          <h2 className="mt-2 text-lg font-semibold">Personal finance: save it, protect it, then grow it</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Today's three-part series covers the full money cycle: creating surplus, protecting against financial shocks, and expanding income through work, business, real estate and financial assets.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/blog/how-to-save-money-every-month-india" className="text-primary hover:underline">How to save money every month</a>
            <a href="/blog/how-to-protect-your-money-india" className="text-primary hover:underline">How to protect your money</a>
            <a href="/blog/how-to-make-more-money-income-paths-india" className="text-primary hover:underline">How to make more money</a>
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Explore DeepScreen research tools and market guides</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The blog explains the concepts and decision frameworks. DeepScreen's live tools and market guides provide the current context for supported investments, commodity benchmarks, GIFT Nifty education and IPO research.
          </p>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <Link to="/investments" className="text-primary hover:underline">Investment directory</Link>
            <Link to="/mutual-funds" className="text-primary hover:underline">Mutual fund analysis</Link>
            <Link to="/etfs" className="text-primary hover:underline">ETF analysis</Link>
            <Link to="/reits" className="text-primary hover:underline">REIT analysis</Link>
            <Link to="/commodities" className="text-primary hover:underline">Commodities</Link>
            <Link to="/gift-nifty" className="text-primary hover:underline">GIFT Nifty</Link>
            <Link to="/ipo-gmp" className="text-primary hover:underline">IPO GMP</Link>
            <Link to="/data-sources" className="text-primary hover:underline">Data sources</Link>
          </div>
        </section>
      </div>
    </Shell>
  );
}
