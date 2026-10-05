import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { InvestmentBlogArticle } from "@/components/ds/InvestmentBlogArticle";
import { findInvestmentBlogPost } from "@/lib/content/investment-blog";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

export const Route = createFileRoute("/blog/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    if (params.slug === "retail-investing-statistics-2026") {
      throw redirect({ href: "/blog/retail-investing-statistics-2026.html", statusCode: 308 });
    }
    const post = findInvestmentBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [
          { title: "Article not found | DeepScreen" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const canonical = "https://deepscreen.online/blog/" + post.slug;
    const article: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": canonical + "#article",
      headline: post.h1,
      description: post.description,
      url: canonical,
      mainEntityOfPage: canonical,
      datePublished: post.published,
      ...(post.updated !== post.published ? { dateModified: post.updated } : {}),
      author: {
        "@type": "Person",
        "@id": "https://deepscreen.online/#sooraj",
        name: "Sooraj",
        jobTitle: "Founder, DeepScreen",
        url: "https://deepscreen.online/about",
      },
      publisher: { "@id": "https://deepscreen.online/#organization" },
      isAccessibleForFree: true,
      inLanguage: "en",
      keywords: [post.primaryKeyword, ...post.secondaryKeywords],
      about: {
        "@type": "Thing",
        name: post.category,
      },
    };

    return {
      meta: [
        { title: post.title },
        { name: "description", content: post.description },
        { name: "author", content: "Sooraj" },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "article:published_time", content: post.published },
        ...(post.updated !== post.published ? [{ property: "article:modified_time", content: post.updated }] : []),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.description },
      ],
      links: [
        { rel: "canonical", href: canonical },
        { rel: "describedby", href: "https://deepscreen.online/llms.txt" },
        { rel: "alternate", type: "text/plain", href: "https://deepscreen.online/faq-index.txt", title: "DeepScreen knowledge index" },
      ],
      scripts: [{
        type: "application/ld+json",
        children: jsonLd(buildGraph(
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          article,
          buildBreadcrumbSchema([
            { name: "DeepScreen", url: "https://deepscreen.online/" },
            { name: "Research blog", url: "https://deepscreen.online/blog" },
            { name: post.h1, url: canonical },
          ]),
          buildFAQSchema(post.faqs.map((faq) => ({ question: faq.q, answer: faq.a }))),
        )),
      }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <Shell>
      <InvestmentBlogArticle post={post} />
    </Shell>
  );
}
