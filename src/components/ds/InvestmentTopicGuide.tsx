import { Link } from "@tanstack/react-router";
import { InvestmentFaqSection } from "@/components/ds/InvestmentFaqSection";
import { INVESTMENT_SOURCE_LINKS, faqForType } from "@/lib/seo/investment-faq";
import type { InvestmentType } from "@/lib/deepscreen/investments";

type Topic = {
  kicker: string;
  title: string;
  intro: string;
  checklistTitle: string;
  checklist: readonly { title: string; text: string }[];
};

const TOPICS: Record<InvestmentType, Topic> = {
  FUND: {
    kicker: "Mutual fund research",
    title: "How to analyze a mutual fund",
    intro:
      "Mutual funds should be analyzed as managed portfolios, not as individual companies. Start with the scheme mandate and benchmark, then judge consistency, downside behaviour, portfolio construction, people and the costs that compound against investor returns.",
    checklistTitle: "Mutual fund analysis checklist",
    checklist: [
      { title: "Process and style", text: "Check the stated category, benchmark and investing style. Compare the current portfolio with that mandate and watch for style drift." },
      { title: "Performance consistency", text: "Use multi-year and rolling returns against an appropriate benchmark and category rather than relying on the best single calendar year." },
      { title: "Risk-adjusted quality", text: "Review drawdown, volatility, Sharpe, Sortino, beta, alpha and upside/downside capture when reliable comparable data exists." },
      { title: "Portfolio construction", text: "Check portfolio valuation, number of holdings, top-10 concentration, cash and how different the portfolio is from its benchmark." },
      { title: "People and capacity", text: "Verify manager tenure, whether the current manager owns the historical record and whether rapid AUM growth could constrain the strategy." },
      { title: "Cost", text: "Compare TER, turnover and exit load. In India, compare the correct Direct and Regular plans because their ongoing costs and NAVs differ." },
    ],
  },
  ETF: {
    kicker: "ETF research",
    title: "How to analyze an ETF",
    intro:
      "An ETF is a tradable basket. The analysis therefore has two layers: what the portfolio owns and how efficiently the fund tracks and trades. Low fees matter, but concentration, tracking and execution costs can matter just as much.",
    checklistTitle: "ETF analysis checklist",
    checklist: [
      { title: "Basket and methodology", text: "Identify the benchmark or strategy, index methodology and whether the portfolio uses physical or synthetic replication when the issuer discloses it." },
      { title: "Holding quality and growth", text: "Review weighted portfolio quality such as ROE, earnings growth and leverage when those measures are meaningful for the underlying assets." },
      { title: "Valuation", text: "Compare portfolio P/E, P/B and earnings yield with similar indices and, where available, the ETF or index's own history." },
      { title: "Concentration and market risk", text: "Check top-10 weight, sector concentration, volatility and three- to five-year maximum drawdown." },
      { title: "Tracking", text: "Use tracking difference and tracking error to judge how closely a benchmark ETF has actually followed its target." },
      { title: "Trading cost and liquidity", text: "Check expense ratio together with bid-ask spread, premium or discount to NAV, AUM and trading volume." },
    ],
  },
  REIT: {
    kicker: "REIT research",
    title: "How to analyze a REIT",
    intro:
      "A REIT is a property operating business packaged in a listed trust. Its economics come from occupancy, leases, rental growth, distributable cash flow, leverage and property values, so ordinary company P/E alone is not enough.",
    checklistTitle: "REIT analysis checklist",
    checklist: [
      { title: "Asset quality", text: "Review occupancy, WALE, tenant concentration and credit quality, location and property type." },
      { title: "Growth", text: "Track same-property NOI growth, rent escalators, development pipeline and whether acquisitions are accretive relative to the cost of capital." },
      { title: "Cash flow", text: "Use REIT-specific distributable cash-flow measures such as AFFO or, for Indian REITs, NDCF, and compare distributions with sustainable cash generation." },
      { title: "Balance sheet", text: "Check LTV or debt to EBITDA, interest coverage, debt maturities and the fixed-versus-floating debt mix." },
      { title: "Valuation", text: "Compare price to AFFO where applicable, discount or premium to NAV, implied cap rate and distribution yield using compatible reporting dates." },
      { title: "Governance", text: "Review sponsor quality, related-party transactions and the history and pricing of equity raises." },
    ],
  },
};

export function InvestmentTopicGuide({ type }: { type: InvestmentType }) {
  const topic = TOPICS[type];
  const faqs = faqForType(type);
  const typeName = type === "FUND" ? "mutual funds" : type === "ETF" ? "ETFs" : "REITs";

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{topic.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold">{topic.title}</h1>
        <p className="mt-4 max-w-4xl text-base leading-7 text-muted-foreground">{topic.intro}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link to="/investments" className="text-primary hover:underline">Browse {typeName}</Link>
          <a href="/data-sources" className="text-primary hover:underline">Data sources</a>
          <a href="/methodology" className="text-primary hover:underline">DeepScreen methodology</a>
        </div>
      </header>

      <section className="mt-10 border-t border-border pt-8" aria-labelledby="investment-topic-checklist">
        <h2 id="investment-topic-checklist" className="text-2xl font-bold">{topic.checklistTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {topic.checklist.map((item, index) => (
            <section key={item.title} className="rounded-xl border border-border bg-card/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </section>
          ))}
        </div>
      </section>

      <InvestmentFaqSection
        faqs={faqs}
        title={type === "FUND" ? "Mutual fund FAQ" : type === "ETF" ? "ETF FAQ" : "REIT FAQ"}
        description={"Plain-English answers to common " + typeName + " research questions. The visible answers below are also the source for the page's structured FAQ data."}
      />

      <section className="mt-10 rounded-xl border border-border bg-panel p-5" aria-labelledby="topic-primary-sources">
        <h2 id="topic-primary-sources" className="font-semibold">Primary educational sources</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These explanations use regulator and investor-education material. For a specific fund or REIT, verify the latest issuer factsheet, prospectus, exchange filing or scheme document because product facts change over time.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {INVESTMENT_SOURCE_LINKS.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
