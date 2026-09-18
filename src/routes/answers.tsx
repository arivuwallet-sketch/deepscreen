import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { AnswerList } from "@/components/ds/AnswerList";
import { ANSWERS, ANSWERS_REVIEWED } from "@/lib/discovery/answers";
import { resourceHead } from "@/lib/seo/discovery";
export const Route = createFileRoute("/answers")({
  staticData: { sitemap: true },
  head: () =>
    resourceHead(
      "/answers",
      "Stock Screening Questions & Answers | DeepScreen",
      "Clear answers about stock screening, fundamental analysis, Indian, US and UK market coverage, data quality and DeepScreen's public API.",
      [
        "stock screening questions",
        "fundamental analysis answers",
        "global stock screener FAQ",
        "DeepScreen FAQ",
      ],
      ANSWERS,
    ),
  component: Answers,
});
function Answers() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">Research help</p>
          <h1 className="mt-2 text-3xl font-bold">Stock screening questions, answered</h1>
          <p className="mt-4 text-muted-foreground">
            Start with the answer, then follow the linked methodology, source notes or research
            checklist.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            DeepScreen editorial team · Reviewed{" "}
            <time dateTime={ANSWERS_REVIEWED}>18 September 2026</time>
          </p>
        </header>
        <h2 className="text-xl font-semibold">Using DeepScreen and researching stocks</h2>
        <AnswerList answers={ANSWERS} />
        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">Audio and machine-readable formats</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the same answers in a compatible speech synthesis tool, or retrieve them through our
            public reference API.
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary">
            <a href="/answers.ssml" download>
              Download SSML voice script
            </a>
            <a href="/developers">API documentation</a>
            <a href="/contact">Ask the team a question</a>
          </div>
        </section>
      </div>
    </Shell>
  );
}
