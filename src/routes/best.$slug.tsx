import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { StockTable } from "@/components/ds/StockTable";
import { STOCKS } from "@/lib/deepscreen/stocks";
import { findRanking } from "@/lib/seo/content";
import { resourceHead } from "@/lib/seo/discovery";
export const Route = createFileRoute("/best/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const ranking = findRanking(params.slug);
    if (!ranking) throw notFound();
    return { ranking };
  },
  head: ({ loaderData }) =>
    loaderData
      ? resourceHead(
          `/best/${loaderData.ranking.slug}`,
          `${loaderData.ranking.title} | DeepScreen`,
          loaderData.ranking.description,
          [loaderData.ranking.title, "fundamental research guide"],
        )
      : {},
  component: RankingPage,
});
function RankingPage() {
  const { ranking } = Route.useLoaderData();
  const universe =
    ranking.exchange === "US"
      ? STOCKS.filter((s) => s.exchange === "NYSE" || s.exchange === "NASDAQ")
      : ranking.exchange
        ? STOCKS.filter((s) => s.exchange === ranking.exchange)
        : STOCKS;
  const stocks = [...universe].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 25);
  return (
    <Shell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> / Screening guides
        </nav>
        <h1 className="text-3xl font-bold">{ranking.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{ranking.answer}</p>
        <section className="max-w-3xl rounded-lg border border-border bg-panel p-5">
          <h2 className="font-semibold">Build an evidence-based shortlist</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Record the source, period, currency and definition of every input. Confirm that selected
            companies satisfy your criteria using their filings. DeepScreen does not have complete
            comparable provider data to publish a verified ranking for this screen.
          </p>
          <a
            href="/research-checklist"
            className="mt-3 inline-block text-sm text-primary underline"
          >
            Use the fundamental research checklist
          </a>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Explore the directory</h2>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            An alphabetical sample of supported listings for further research. These companies have
            not been verified as matching this screen and are not ranked by the metric above.
          </p>
          <StockTable stocks={stocks} />
        </section>
        <p className="text-sm">
          <a href="/data-sources" className="text-primary underline">
            Data sources and limitations
          </a>{" "}
          ·{" "}
          <a href="/methodology" className="text-primary underline">
            Scoring methodology
          </a>
        </p>
      </div>
    </Shell>
  );
}
