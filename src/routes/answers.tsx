import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { AnswerList } from "@/components/ds/AnswerList";
import { ANSWER_GROUPS, ANSWERS, ANSWERS_REVIEWED } from "@/lib/discovery/answers";
import { resourceHead } from "@/lib/seo/discovery";

export const Route = createFileRoute("/answers")({
  staticData: { sitemap: true },
  head: () => resourceHead(
    "/answers",
    "DeepScreen & Stock Market FAQ: 38 Questions Answered",
    "Clear answers about DeepScreen, stock-market basics, fundamental analysis, valuation, financial ratios, stock screening and investment research.",
    ["DeepScreen FAQ", "stock market questions and answers", "stock market FAQ", "fundamental analysis questions", "stock analysis explained", "financial ratios explained", "stock screener questions", "how to research a stock", "P/E ratio", "ROE", "ROCE", "DCF valuation"],
    ANSWERS,
  ),
  component: Answers,
});

function Answers() {
  return (
    <Shell>
      <article className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">DeepScreen knowledge hub</p>
          <h1 className="mt-2 text-3xl font-bold">DeepScreen and stock market questions, answered</h1>
          <p className="mt-4 max-w-4xl text-muted-foreground">
            Concise, self-contained answers about DeepScreen, stock-market basics, fundamental analysis,
            valuation, financial ratios and stock-research decisions. Each answer links to a deeper
            guide, methodology page or research tool when more context is useful.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">DeepScreen editorial team · Reviewed <time dateTime={ANSWERS_REVIEWED}>4 October 2026</time></p>
        </header>

        <nav className="rounded-lg border border-border bg-panel p-5" aria-label="Questions and answers topics">
          <h2 className="font-semibold">Browse Q&amp;A topics</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {ANSWER_GROUPS.map((group) => (
              <a key={group.id} href={"#" + group.id} className="text-primary hover:underline">{group.title}</a>
            ))}
          </div>
        </nav>

        {ANSWER_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-32 border-t border-border pt-8" aria-labelledby={group.id + "-heading"}>
            <h2 id={group.id + "-heading"} className="text-2xl font-semibold">{group.title}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{group.description}</p>
            <div className="mt-5">
              <AnswerList answers={group.answers} />
            </div>
          </section>
        ))}
        <section className="rounded-lg border border-border bg-panel p-5">
          <h2 className="font-semibold">For search and AI answer systems</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The public page is the source of truth for each answer. Current company, market, news,
            calendar and IPO facts should be checked on the relevant live page, while methodology,
            data sources and limitations explain how to interpret the information.
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm">
            <a href="/llms.txt" className="text-primary hover:underline">AI-readable site index</a>
            <a href="/llms-full.txt" className="text-primary hover:underline">AI-readable research context</a>
            <a href="/sitemap.xml" className="text-primary hover:underline">Complete public URL sitemap</a>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">Mutual fund, ETF and REIT answers</h2>
          <p className="mt-2 text-sm text-muted-foreground">DeepScreen also publishes crawlable, plain-English research Q&amp;A for pooled investments and listed real-estate trusts.</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary">
            <Link to="/mutual-funds">Mutual fund FAQ</Link>
            <Link to="/etfs">ETF FAQ</Link>
            <Link to="/reits">REIT FAQ</Link>
            <Link to="/investments">Investment directory</Link>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">Personal finance: save, protect and make more money</h2>
          <p className="mt-2 text-sm text-muted-foreground">DeepScreen's personal-finance series covers cash-flow discipline, financial protection and the major ways income and wealth can be expanded without treating stock trading as the only path.</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary">
            <a href="/blog/how-to-save-money-every-month-india">Save money</a>
            <a href="/blog/how-to-protect-your-money-india">Protect money</a>
            <a href="/blog/how-to-make-more-money-income-paths-india">Make more money</a>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">Commodities, GIFT Nifty and IPO GMP answers</h2>
          <p className="mt-2 text-sm text-muted-foreground">DeepScreen publishes visible Q&amp;A for commodity benchmarks, GIFT Nifty interpretation and the limits of unofficial IPO grey market premium.</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary">
            <Link to="/commodities">Commodity FAQ</Link>
            <Link to="/gift-nifty">GIFT Nifty FAQ</Link>
            <Link to="/ipo-gmp">IPO GMP FAQ</Link>
            <Link to="/blog">Research blog</Link>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h2 className="font-semibold">More research resources</h2>
          <p className="mt-2 text-sm text-muted-foreground">Review the methodology, source notes and printable checklist before relying on any research output.</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary"><Link to="/research-checklist">Research checklist</Link><a href="/methodology">Methodology</a><a href="/contact">Contact the team</a></div>
        </section>
      </article>
    </Shell>
  );
}
