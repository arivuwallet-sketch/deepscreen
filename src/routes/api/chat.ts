import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleDeepScreenChat } = await import("@/lib/ai/deepscreen-chat.server");
        return handleDeepScreenChat(request);
      },
    },
  },
});