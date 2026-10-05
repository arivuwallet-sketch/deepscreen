import { createFileRoute } from "@tanstack/react-router";
import { knowledgeText } from "@/lib/discovery/knowledge-index";

export const Route = createFileRoute("/faq-index.txt")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: () =>
        new Response(knowledgeText(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
          },
        }),
    },
  },
});
