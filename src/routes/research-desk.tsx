import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { ResearchDesk } from "@/components/research/ResearchDesk";
export const Route = createFileRoute("/research-desk")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Research Desk — Watchlists, Notes & Portfolio Imports | DeepScreen" },
      { name: "robots", content: "noindex,follow" },
      {
        name: "description",
        content:
          "Organize personal investment research, source documents and manually entered holdings with local backups and CSV exports.",
      },
    ],
  }),
  component: () => (
    <Shell>
      <ResearchDesk />
    </Shell>
  ),
});
