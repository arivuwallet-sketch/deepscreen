import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/ds/Shell";
import { MarketEducationFaqSection } from "@/components/ds/MarketEducationFaqSection";
import { MARKET_EDUCATION_FAQS, marketEducationFaq } from "@/lib/seo/market-education-faq";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildGraph,
  buildOrganizationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
  jsonLd,
} from "@/lib/seo/json-ld";

const URL = "https://deepscreen.online/trading";
const title = "Trading, Crypto & Forex Guide — Risk, Charts & FAQs | DeepScreen";
const description =
  "Learn trading, crypto and forex with answer-first guides on risk management, position sizing, spot vs futures, leverage, liquidation, pips, spreads and chart analysis.";

const faqs = MARKET_EDUCATION_FAQS.filter((faq) => faq.topic !== "DEEPCHART");

const ARTICLES = [
  {
    category: "DeepChart",
    title: "How to read a trading chart with DeepChart",
    description: "Structure, trend, support/resistance, momentum, volatility and higher-timeframe confirmation.",
    href: "/blog/deepchart-technical-analysis-guide",
  },
  {
    category: "Trading",
    title: "Trading risk management: position sizing, stops and R-multiples",
    description: "Risk capital, invalidation, sizing, reward-to-risk, expectancy and leverage.",
    href: "/blog/trading-risk-management-position-sizing",
  },
  {
    category: "Crypto",
    title: "Crypto trading: spot, futures, perpetuals, custody and risk",
    description: "Instrument mechanics, liquidation, funding, custody, liquidity and platform risk.",
    href: "/blog/crypto-trading-guide-spot-futures-risk",
  },
  {
    category: "Forex",
    title: "Forex trading: pips, spreads, leverage and risk",
    description: "Currency-pair mechanics, macro drivers, technical analysis and India-specific RBI checks.",
    href: "/blog/forex-trading-guide-pips-leverage-risk-india",
  },
] as const;

export const Route = createFileRoute("/trading")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      {
        name: "keywords",
        content:
          "trading guide, trading for beginners, trading risk management, position sizing, crypto trading, spot vs futures crypto, forex trading, pips, forex leverage, DeepChart, technical analysis",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "describedby", href: "https://deepscreen.online/faq-index.txt" },
      { rel: "help", href: "https://deepscreen.online/knowledge" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: jsonLd(buildGraph(
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema({ name: title, description, url: URL }),
        buildBreadcrumbSchema([
          { name: "DeepScreen", url: "https://deepscreen.online/" },
          { name: "Trading education", url: URL },
        ]),
        buildFAQSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
      )),
    }],
  }),
  component: TradingHub,
});

function TradingHub() {
  const tradingFaqs = marketEducationFaq("TRADING");
  const cryptoFaqs = marketEducationFaq("CRYPTO");
  const forexFaqs = marketEducationFaq("FOREX");

  return (
    <Shell>
      <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Trading education</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Trading, crypto and forex — explain the risk before the signal
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This hub answers the questions that should come before any chart call: what instrument
            you are trading, how leverage and costs work, where the idea is invalid, and how much
            capital is actually at risk. Use DeepChart for technical context after those basics are clear.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link to="/chart-reader" className="text-primary hover:underline">Open DeepChart</Link>
            <Link to="/calendar" className="text-primary hover:underline">Economic calendar</Link>
            <Link to="/knowledge" className="text-primary hover:underline">Knowledge index</Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2" aria-label="Trading education guides">
          {ARTICLES.map((article) => (
            <a key={article.href} href={article.href} className="rounded-xl border border-border bg-card/30 p-5 transition-colors hover:border-primary/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{article.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.description}</p>
              <span className="mt-4 inline-block text-sm text-primary">Read guide →</span>
            </a>
          ))}
        </section>

        <section className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">DeepScreen principle</p>
          <h2 className="mt-2 text-lg font-semibold">A trade is a hypothesis, not a prediction</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Technical analysis can organize price, momentum, volatility and liquidity into a repeatable
            framework. It cannot guarantee the next move. The practical objective is to define the
            condition, invalidation and affordable loss before acting.
          </p>
        </section>

        <MarketEducationFaqSection
          faqs={tradingFaqs}
          title="Trading questions answered"
          description="Plain-English answers on trading, stops, position sizing, reward-to-risk and the limits of technical analysis."
        />
        <MarketEducationFaqSection
          faqs={cryptoFaqs}
          title="Crypto trading questions answered"
          description="Spot vs derivatives, leverage, liquidation, custody, volatility and how technical analysis fits into crypto research."
        />
        <MarketEducationFaqSection
          faqs={forexFaqs}
          title="Forex trading questions answered"
          description="Currency pairs, pips, spreads, leverage, macro drivers, chart analysis and RBI considerations for Indian residents."
        />

        <section className="mt-10 rounded-xl border border-border bg-panel p-5" aria-labelledby="trading-primary-sources">
          <h2 id="trading-primary-sources" className="font-semibold">Primary risk and regulatory references</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Product and platform rules can change. Verify current broker, exchange and regulator material before funding or trading an account.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="text-primary hover:underline" href="https://www.finra.org/investors/investing/investment-products/stocks/day-trading" target="_blank" rel="noreferrer">FINRA — Day Trading</a>
            <a className="text-primary hover:underline" href="https://www.investor.gov/additional-resources/spotlight/crypto-assets" target="_blank" rel="noreferrer">Investor.gov — Crypto Assets</a>
            <a className="text-primary hover:underline" href="https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html" target="_blank" rel="noreferrer">CFTC — Forex advisory</a>
            <a className="text-primary hover:underline" href="https://www.rbi.org.in/Scripts/FAQDisplay.aspx?Id=146" target="_blank" rel="noreferrer">RBI — Forex transactions FAQ</a>
          </div>
        </section>
      </article>
    </Shell>
  );
}
