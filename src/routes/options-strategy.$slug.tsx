import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { findStrategyGuide } from "@/lib/seo/content";

export const Route = createFileRoute("/options-strategy/$slug")({
  staticData: { sitemap: false },
  beforeLoad: ({ params }) => {
    if (!findStrategyGuide(params.slug)) throw notFound();
    throw redirect({ to: "/options/$slug", params: { slug: params.slug }, statusCode: 301 });
  },
});
