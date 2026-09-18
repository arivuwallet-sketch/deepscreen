import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { findRatio } from "@/lib/seo/content";

export const Route = createFileRoute("/ratios/$slug")({
  staticData: { sitemap: false },
  beforeLoad: ({ params }) => {
    if (!findRatio(params.slug)) throw notFound();
    throw redirect({ to: "/learn/$slug", params: { slug: params.slug }, statusCode: 301 });
  },
});
