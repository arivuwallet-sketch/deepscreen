import { createFileRoute } from "@tanstack/react-router";
import { INVESTMENT_BLOG_POSTS } from "@/lib/content/investment-blog";
import { LEGACY_BLOGS } from "@/lib/discovery/knowledge-index";

const ORIGIN = "https://deepscreen.online";
const FEED_URL = ORIGIN + "/blog/feed.xml";

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[
        character
      ]!,
  );
}

function rfc822(date: string): string {
  return new Date(date + "T00:00:00Z").toUTCString();
}

function feedXml(): string {
  const posts = [...INVESTMENT_BLOG_POSTS]
    .sort((a, b) => b.published.localeCompare(a.published))
    .map(
      (post) =>
        "<item>" +
        "<title>" + escapeXml(post.h1) + "</title>" +
        "<link>" + ORIGIN + "/blog/" + encodeURIComponent(post.slug) + "</link>" +
        "<guid isPermaLink=\"true\">" + ORIGIN + "/blog/" + encodeURIComponent(post.slug) + "</guid>" +
        "<description>" + escapeXml(post.description) + "</description>" +
        "<pubDate>" + rfc822(post.published) + "</pubDate>" +
        "<category>" + escapeXml(post.category) + "</category>" +
        "</item>",
    );

  const legacy = LEGACY_BLOGS.map(
    (post) =>
      "<item>" +
      "<title>" + escapeXml(post.title) + "</title>" +
      "<link>" + ORIGIN + post.href + "</link>" +
      "<guid isPermaLink=\"true\">" + ORIGIN + post.href + "</guid>" +
      "<description>Source-backed 2026 retail-investing statistics and market-participation research.</description>" +
      "<pubDate>" + rfc822("2026-09-25") + "</pubDate>" +
      "<category>Market research</category>" +
      "</item>",
  );

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
    "<channel>" +
    "<title>DeepScreen Research</title>" +
    "<link>" + ORIGIN + "/blog</link>" +
    "<description>DeepScreen market, investing and personal-finance research.</description>" +
    "<language>en-IN</language>" +
    '<atom:link href="' + FEED_URL + '" rel="self" type="application/rss+xml" />' +
    posts.concat(legacy).join("") +
    "</channel></rss>"
  );
}

export const Route = createFileRoute("/blog/feed.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      ANY: () =>
        new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }),
      GET: () =>
        new Response(feedXml(), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
          },
        }),
    },
  },
});
