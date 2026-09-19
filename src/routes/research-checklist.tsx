import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { resourceHead } from "@/lib/seo/discovery";

const STEPS = [
  ["Identify the security", "Record the company, ticker, exchange and share class. Confirm the currency and units."],
  ["Record your sources", "Save the filing URL, publication date and reporting period. Keep quote timestamps separate from reporting dates."],
  ["Understand the business", "Describe the products, customers, markets and major risks in your own words."],
  ["Reconcile earnings with cash", "Compare revenue, earnings and operating cash flow across consistent periods."],
  ["Check financing and capital returns", "Record debt, cash and capital employed. Flag missing definitions instead of filling them with assumptions."],
  ["Compare valuation consistently", "Use comparable sectors, periods, currencies and earnings definitions."],
  ["Challenge assumptions", "Write base and downside cases and identify the assumptions driving your conclusion."],
  ["Set a review trigger", "Record unanswered questions and the next filing or event to review."],
] as const;

export const Route = createFileRoute("/research-checklist")({
  staticData: { sitemap: true },
  head: () => resourceHead(
    "/research-checklist",
    "Fundamental Research Checklist | DeepScreen",
    "An eight-step checklist for documenting sources, cash flow, debt, valuation and assumptions during company research.",
    ["stock research checklist", "fundamental analysis checklist", "company research workflow"],
  ),
  component: Checklist,
});

function Checklist() {
  return (
    <Shell>
      <article className="research-checklist mx-auto max-w-4xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">Free research worksheet</p>
          <h1 className="mt-2 text-3xl font-bold">A fundamental research checklist</h1>
          <p className="mt-4 text-muted-foreground">Use this workflow alongside primary disclosures to document evidence and uncertainty.</p>
        </header>
        <ol className="space-y-4">{STEPS.map(([title, description], index) => <li key={title} className="break-inside-avoid rounded-lg border border-border bg-panel p-5"><h2 className="font-semibold">{index + 1}. {title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></li>)}</ol>
        <section><h2 className="text-xl font-semibold">Keep a research record</h2><p className="mt-3 text-sm text-muted-foreground">Company and exchange: __________ · Filing period: __________ · Source URL: __________ · Missing inputs: __________ · Next review: __________</p><p className="mt-4 text-sm"><a href="/methodology" className="text-primary underline">Read the methodology</a> · <a href="/data-sources" className="text-primary underline">Review source notes</a></p></section>
      </article>
    </Shell>
  );
}
