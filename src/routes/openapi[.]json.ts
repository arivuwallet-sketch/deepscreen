import { createFileRoute } from "@tanstack/react-router";
import { OPENAPI } from "@/lib/discovery/api";
export const Route = createFileRoute("/openapi.json")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      ANY: () =>
        new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }),
      GET: () =>
        Response.json(OPENAPI, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "X-Robots-Tag": "noindex",
          },
        }),
    },
  },
});
