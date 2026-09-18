import { createFileRoute } from "@tanstack/react-router";
import { referenceResponse } from "@/lib/discovery/api";
export const Route = createFileRoute("/api/v1/$resource")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      ANY: () =>
        new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }),
      GET: ({ params, request }) => referenceResponse(params.resource, request),
    },
  },
});
