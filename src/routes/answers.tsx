import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { AnswerList } from "@/components/ds/AnswerList";
import { ANSWERS, ANSWERS_REVIEWED } from "@/lib/discovery/answers";
import { resourceHead } from "@/lib/seo/discovery";

export const Route = createFileRoute("/answers")({
  staticData: { sitemap: true },
  head: () => resourceHead(
    "/answers",
    "Stock Research Questions & Answers | DeepScreen",
    "Clear answers about stock research, fundamental analysis and DeepScreen market coverage.",
    ["stock research questions", "stock research", "fundamental analysis", "fundamental analysis answers", "how to research a stock", "stock analysis explained", "financial ratios explained", "stock screener", "DeepScreen FAQ"],
    ANSWERS,
  ),
  component: Answers,
});

function Answers() {
  return (
    <Shell>
      <article className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">Research help</p>
          <h1 className="mt-2 text-3xl font-bold">Stock research questions, answered</h1>
          <p className="mt-4 text-muted-foreground">Start with a concise answer, then follow the linked methodology or checklist.</p>
          <p className="mt-3 text-xs text-muted-foreground">DeepScreen editorial team · Reviewed <time dateTime={ANSWERS_REVIEWED}>18 September 2026</time></p>
        </header>
        <h2 className="text-xl font-semibold">Using DeepScreen and researching companies</h2>
        <AnswerList answers={ANSWERS} />
        <section className="rounded-lg border border-border bg-panel p-5">
          <h2 className="font-semibold">For search and AI answer systems</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The public page is the source of truth for each answer. Current company, market, news,
            calendar and IPO facts should be checked on the relevant live page, while methodology,
            data sources and limitations explain how to interpret the information.
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm">
            <Link to="/llms.txt" className="text-primary hover:underline">AI-readable site index</Link>
            <Link to="/llms-full.txt" className="text-primary hover:underline">AI-readable research context</Link>
            <Link to="/sitemap.xml" className="text-primary hover:underline">Complete public URL sitemap</Link>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">More research resources</h2>
          <p className="mt-2 text-sm text-muted-foreground">Review the methodology, source notes and printable checklist before relying on any research output.</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary"><a href="/research-checklist">Research checklist</a><a href="/methodology">Methodology</a><a href="/contact">Contact the team</a></div>
        </section>
      </article>
    </Shell>
  );
}
