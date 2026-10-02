import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/ds/Shell";
import { Button } from "@/components/ui/button";
import { INVESTMENTS, type InvestmentType } from "@/lib/deepscreen/investments";
import { quoteKey, useLiveQuotes } from "@/hooks/useLiveQuotes";
import { formatPrice } from "@/lib/deepscreen/format";
import { InvestmentFaqSection } from "@/components/ds/InvestmentFaqSection";
import { INVESTMENT_FAQS, INVESTMENT_SOURCE_LINKS } from "@/lib/seo/investment-faq";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const title = "Mutual Fund, ETF & REIT Analysis | DeepScreen";
const description = "Research mutual funds, ETFs and REITs with type-specific analysis. Compare NAV, fees, tracking, holdings, risk, REIT cash flow and valuation across supported markets.";
const canonical = "https://deepscreen.online/investments";
const PAGE_SIZE = 50;

export const Route = createFileRoute("/investments")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "keywords", content: "mutual fund analysis, ETF analysis, REIT analysis, mutual fund NAV, expense ratio, TER, direct vs regular mutual fund, ETF tracking error, tracking difference, ETF premium discount NAV, ETF holdings, REIT occupancy, WALE, AFFO, NDCF, REIT LTV, REIT NAV" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical }, { rel: "describedby", href: "https://deepscreen.online/llms.txt" }],
    scripts: [{
      type: "application/ld+json",
      children: jsonLd(buildGraph(
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema({ name: title, description, url: canonical }),
        buildBreadcrumbSchema([
          { name: "DeepScreen", url: "https://deepscreen.online/" },
          { name: "Mutual funds, ETFs & REITs", url: canonical },
        ]),
        buildFAQSchema(INVESTMENT_FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))),
      )),
    }],
  }),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const [type, setType] = useState<InvestmentType | "ALL">("ALL");
  const [market, setMarket] = useState("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVESTMENTS.filter((item) => (type === "ALL" || item.type === type) && (market === "ALL" || item.market === market) && (!q || item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)));
  }, [type, market, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const keys = rows.filter((item) => item.type !== "FUND").map((item) => ({ exchange: item.market, symbol: item.code }));
  const { data: quotes } = useLiveQuotes(keys);
  const change = (action: () => void) => { action(); setPage(1); };
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase text-primary">Investment directory</p>
        <h1 className="mt-2 text-3xl font-bold">Mutual funds, ETFs & REITs</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{INVESTMENTS.length.toLocaleString()} listings across India and the US, plus identified London REITs. Mutual fund NAVs are from AMFI; exchange-traded prices appear when a live quote is available. DeepScreen analyzes each product with the framework that fits it: mutual-fund process and costs, ETF basket quality and tracking, and REIT property cash flow and leverage. These investments are not assessed with the company stock score.</p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <Link to="/mutual-funds" className="rounded-lg border border-border bg-card/30 p-4 transition-colors hover:border-primary/40"><h2 className="font-semibold">Mutual fund analysis</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Compare NAV history, rolling returns, drawdown, benchmark-relative performance, risk measures, portfolio structure, manager evidence and TER. Indian Direct and Regular plans are treated separately when the scheme data identifies them.</p><span className="mt-3 inline-block text-sm text-primary">Read mutual fund Q&amp;A →</span></Link>
          <Link to="/etfs" className="rounded-lg border border-border bg-card/30 p-4 transition-colors hover:border-primary/40"><h2 className="font-semibold">ETF analysis</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Analyze the basket, not just the ticker: holdings, concentration, portfolio valuation, drawdown, volatility, expense ratio, tracking quality, liquidity, spread and premium or discount to NAV where data is available.</p><span className="mt-3 inline-block text-sm text-primary">Read ETF Q&amp;A →</span></Link>
          <Link to="/reits" className="rounded-lg border border-border bg-card/30 p-4 transition-colors hover:border-primary/40"><h2 className="font-semibold">REIT analysis</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Focus on property economics: occupancy and WALE where disclosed, tenant concentration, NOI or distributable cash flow, leverage, debt maturity, distribution coverage, NAV and cap-rate valuation.</p><span className="mt-3 inline-block text-sm text-primary">Read REIT Q&amp;A →</span></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="col-span-2 min-w-0 text-xs text-muted-foreground sm:col-span-1">Search name or symbol
            <input aria-label="Search investments" className="mt-1 block h-10 w-full rounded border border-border bg-panel px-3 text-sm text-foreground outline-none focus:border-primary" value={query} onChange={(e) => change(() => setQuery(e.target.value))} placeholder="Scheme, ETF or REIT" />
          </label>
          <label className="min-w-0 text-xs text-muted-foreground">Type
            <select aria-label="Investment type" className="mt-1 block h-10 w-full rounded border border-border bg-panel px-3 text-sm text-foreground" value={type} onChange={(e) => change(() => setType(e.target.value as InvestmentType | "ALL"))}>
              <option value="ALL">All types</option><option value="FUND">Mutual funds</option><option value="ETF">ETFs</option><option value="REIT">REITs</option>
            </select>
          </label>
          <label className="min-w-0 text-xs text-muted-foreground">Market
            <select aria-label="Market" className="mt-1 block h-10 w-full rounded border border-border bg-panel px-3 text-sm text-foreground" value={market} onChange={(e) => change(() => setMarket(e.target.value))}>
              <option value="ALL">All markets</option>{["IN", "NSE", "BSE", "NYSE", "NASDAQ", "US", "LSE"].map((m) => <option key={m} value={m}>{m === "IN" ? "India · AMFI" : m === "US" ? "US · Cboe" : m}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">{filtered.length.toLocaleString()} results · page {currentPage} of {totalPages}</p>
        <div className="mt-3 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-3">Code</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Market</th><th className="px-3 py-3 text-right">NAV / price</th></tr></thead>
            <tbody>{rows.map((item) => { const quote = quotes?.[quoteKey({ exchange: item.market, symbol: item.code })]; return <tr key={`${item.market}:${item.type}:${item.code}`} className="border-b border-border/50 hover:bg-accent/40">
              <td className="px-3 py-3 font-mono font-semibold text-primary"><Link to="/investment/$market/$type/$code" params={item}>{item.code}</Link></td>
              <td className="px-3 py-3"><Link to="/investment/$market/$type/$code" params={item}>{item.name}</Link></td>
              <td className="px-3 py-3 text-muted-foreground">{item.type === "FUND" ? "Mutual fund" : item.type}</td>
              <td className="px-3 py-3 text-muted-foreground">{item.market}</td>
              <td className="px-3 py-3 text-right font-mono">{item.type === "FUND" && item.nav !== null ? `₹${item.nav.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : quote ? formatPrice(quote.price, item.market) : "—"}</td>
            </tr>; })}</tbody>
          </table>
          {rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No investments match your search.</p>}
        </div>
        <div className="mt-5 flex items-center justify-end gap-3"><Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span><Button variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button></div>
        <InvestmentFaqSection faqs={INVESTMENT_FAQS} title="Mutual fund, ETF and REIT questions answered" description="Concise answers to common research questions about NAV, TER, Direct vs Regular plans, ETF tracking and liquidity, REIT occupancy, WALE, NDCF, AFFO, leverage and valuation." />
        <section className="mt-10 rounded-lg border border-border bg-panel p-5" aria-labelledby="investment-faq-sources"><h2 id="investment-faq-sources" className="font-semibold">Primary educational sources</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">DeepScreen writes these explanations from primary regulator and investor-education material, then applies its own research framework. Product-specific facts should still be checked against the latest issuer or scheme disclosure.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">{INVESTMENT_SOURCE_LINKS.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{source.label}</a>)}</div></section>
        <p className="mt-8 text-xs text-muted-foreground">Source: AMFI scheme NAV snapshot (30 Sep 2026), Nasdaq Trader directory (1 Oct 2026), and exchange listings. Directory coverage is not a guarantee of every active listing. NAVs are dated, not live trading prices. Quotes depend on provider availability.</p>
      </div>
    </Shell>
  );
}
