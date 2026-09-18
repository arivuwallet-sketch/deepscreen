import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { resourceHead } from "@/lib/seo/discovery";
const STEPS = [
  [
    "Identify the security",
    "Record the company, ticker, exchange and share class. Confirm the currency and whether the quote is in whole currency units or minor units. Similar tickers can represent different securities.",
  ],
  [
    "Record your sources",
    "Save the annual report or regulatory filing URL, publication date and reporting period. Record a quote timestamp separately. A recent retrieval does not make an old reporting period current.",
  ],
  [
    "Understand the business",
    "Describe the products, customers, major markets and revenue drivers in your own words. Read management's risk discussion and identify what could invalidate your thesis.",
  ],
  [
    "Reconcile earnings with cash",
    "Review revenue, operating profit, net income and operating cash flow across consistent periods. Explain material differences using working capital, non-cash items and notes to the accounts.",
  ],
  [
    "Check financing and capital returns",
    "Record debt, cash, interest costs and capital employed. Compare ROE and ROCE with appropriate peers and prior periods. Flag missing definitions or inputs rather than replacing them with zero.",
  ],
  [
    "Compare valuation consistently",
    "Use comparable sectors, reporting periods and earnings definitions. Record whether ratios are trailing or forward-looking. Keep currencies consistent when comparing prices, market values and cash flows.",
  ],
  [
    "Challenge assumptions",
    "Write a base case and a downside case. Identify which growth, margin and valuation assumptions drive the result. A model output is only as dependable as its inputs and assumptions.",
  ],
  [
    "Set a review trigger",
    "Record unanswered questions and the next filing or event to review. Keep a decision log, including reasons to change your view. A research shortlist does not require a trade.",
  ],
];
export const Route = createFileRoute("/research-checklist")({
  staticData: { sitemap: true },
  head: () =>
    resourceHead(
      "/research-checklist",
      "Fundamental Stock Research Checklist | DeepScreen",
      "An eight-step checklist for stock research: verify filings, cash flow, debt, valuation, currencies and assumptions across Indian, US and UK markets.",
      ["stock research checklist", "fundamental analysis checklist", "cross-market stock analysis"],
    ),
  component: Checklist,
});
function Checklist() {
  return (
    <Shell>
      <article className="research-checklist mx-auto max-w-4xl space-y-8 px-4 py-10">
        <header>
          <p className="text-sm text-primary">Free research worksheet · No signup required</p>
          <h1 className="mt-2 text-3xl font-bold">A fundamental stock research checklist</h1>
          <p className="mt-4 text-muted-foreground">
            Use this workflow alongside a company's primary disclosures. It helps you document
            evidence and uncertainty before interpreting a score.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            DeepScreen editorial team · 18 September 2026
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-5 rounded-md border border-border px-4 py-2 text-sm print:hidden"
          >
            Print or save as PDF
          </button>
        </header>
        <ol className="space-y-4">
          {STEPS.map(([title, description], i) => (
            <li
              key={title}
              className="break-inside-avoid rounded-lg border border-border bg-panel p-5"
            >
              <h2 className="font-semibold">
                {i + 1}. {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
        <section>
          <h2 className="text-xl font-semibold">Keep a research record</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Company and exchange: __________ · Filing period: __________ · Source URL: __________ ·
            Quote timestamp and currency: __________ · Missing inputs: __________ · Next review:
            __________
          </p>
          <p className="mt-4 text-sm">
            For primary-document starting points, use our{" "}
            <a href="/data-sources" className="text-primary underline">
              data-source guide
            </a>
            . Learn how model inputs are used in the{" "}
            <a href="/methodology" className="text-primary underline">
              13-factor methodology
            </a>
            .
          </p>
        </section>

      </article>
    </Shell>
  );
}
