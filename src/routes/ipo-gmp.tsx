import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Calculator, CircleHelp, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/ds/Shell";
import { MarketGuideFaqSection } from "@/components/ds/MarketGuideFaqSection";
import { Button } from "@/components/ui/button";
import { MARKET_GUIDE_SOURCES, marketGuideFaq } from "@/lib/seo/market-guide-faq";
import { buildBreadcrumbSchema, buildFAQSchema, buildGraph, buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema, jsonLd } from "@/lib/seo/json-ld";

const URL = "https://deepscreen.online/ipo-gmp";
const title = "IPO GMP Explained: Grey Market Premium & Calculation | DeepScreen";
const description = "Learn IPO GMP meaning, formula, negative GMP, GMP vs subscription, why grey market premium is unofficial, and how to research an IPO beyond listing-day hype.";
const faqs = marketGuideFaq("IPO_GMP");

export const Route = createFileRoute("/ipo-gmp")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { property: "og:url", content: URL },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: URL }, { rel: "describedby", href: "https://deepscreen.online/llms.txt" }],
  scripts: [{
    type: "application/ld+json",
    children: jsonLd(buildGraph(
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildWebPageSchema({ name: title, description, url: URL }),
      buildBreadcrumbSchema([
        { name: "DeepScreen", url: "https://deepscreen.online/" },
        { name: "IPO GMP", url: URL },
      ]),
      buildFAQSchema(faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))),
    )),
  }] }),
  component: IpoGmpPage,
});

function IpoGmpPage() {
  const [issue, setIssue] = useState("");
  const [premium, setPremium] = useState("");
  const issuePrice = issue.trim() ? Number(issue) : NaN;
  const gmp = premium.trim() ? Number(premium) : NaN;
  const valid = Number.isFinite(issuePrice) && issuePrice > 0 && Number.isFinite(gmp);
  const estimated = valid ? issuePrice + gmp : null;
  const percent = valid ? (gmp / issuePrice) * 100 : null;

  return <Shell><div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
    <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">DeepScreen</Link> / Markets / IPO GMP</nav>
    <div className="max-w-3xl"><p className="font-mono text-xs uppercase text-primary">Markets / 03</p><h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">IPO grey market premium</h1><p className="mt-5 text-base leading-relaxed text-muted-foreground">The grey market premium, or GMP, is an unofficial indication of what some participants may pay above an IPO’s issue price before listing. It is not published or guaranteed by the exchange.</p></div>

    <div className="mt-10 grid gap-0 border-y border-border md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="py-8 md:border-r md:border-border md:pr-10"><div className="flex items-center gap-2 text-primary"><Calculator size={20}/><span className="font-mono text-xs uppercase">Premium calculator</span></div><h2 className="mt-4 text-2xl font-semibold">Put the number in context.</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Enter an issue price and a premium you found elsewhere. The result is arithmetic, not a predicted listing price.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-1"><label className="text-sm font-medium">Issue price (₹)<input type="number" min="0.01" step="0.01" inputMode="decimal" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Enter issue price" className="mt-2 block w-full rounded border border-border bg-panel px-3 py-2 text-foreground outline-none focus:border-primary"/></label><label className="text-sm font-medium">Unofficial premium (₹)<input type="number" step="0.01" inputMode="decimal" value={premium} onChange={(e) => setPremium(e.target.value)} placeholder="Enter premium" className="mt-2 block w-full rounded border border-border bg-panel px-3 py-2 text-foreground outline-none focus:border-primary"/></label></div><Button type="button" variant="ghost" size="sm" className="mt-3 px-0 text-muted-foreground" onClick={() => { setIssue(""); setPremium(""); }}>Clear</Button></section>
      <div className="flex flex-col justify-center border-t border-border py-8 md:border-t-0 md:pl-10"><p className="font-mono text-xs uppercase text-muted-foreground">Issue price + unofficial premium</p><p aria-live="polite" className="mt-3 font-mono text-4xl font-semibold text-primary">{estimated === null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(estimated)}</p><p className="mt-3 text-sm text-muted-foreground">{percent === null ? "Enter both values to calculate the premium percentage." : `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}% of the issue price`}</p><p className="mt-6 border-l-2 border-warn pl-3 text-xs leading-relaxed text-muted-foreground">This figure is based solely on your inputs. Actual listing price may differ substantially, and unofficial premiums are unregulated and may be manipulated.</p></div>
    </div>

    <section className="mt-14 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"><div><CircleHelp className="text-primary" size={22}/><h2 className="mt-4 text-2xl font-semibold">How should you read GMP?</h2></div><div className="space-y-5 text-sm leading-relaxed text-muted-foreground"><p>The grey market is an informal, off-exchange market in applications or anticipated shares. A quoted premium is not an exchange trade, not a company valuation and not an assured profit for an applicant.</p><p>Premiums can change quickly as subscription demand, market sentiment and the listing date approach. Different sites or dealers can report different numbers because there is no single regulated consolidated feed.</p><p>An indicated gain can be wiped out by a lower actual listing price, transaction costs or a lack of allotment. Evaluate the prospectus, financials, use of proceeds, valuation and risks rather than treating GMP as an investment thesis.</p></div></section>
    <section className="mt-14 border-t border-border pt-10"><div className="flex items-center gap-2 text-warn"><ShieldAlert size={20}/><span className="font-mono text-xs uppercase">Before applying</span></div><div className="mt-6 grid gap-6 sm:grid-cols-3"><div className="border-l border-border pl-4"><h3 className="font-semibold">Read the offer document</h3><p className="mt-2 text-sm text-muted-foreground">Check revenue quality, debt, promoter holdings and where the proceeds go.</p></div><div className="border-l border-border pl-4"><h3 className="font-semibold">Check the issue terms</h3><p className="mt-2 text-sm text-muted-foreground">Compare the price band, lot size, opening and closing dates on official exchange filings.</p></div><div className="border-l border-border pl-4"><h3 className="font-semibold">Treat rumours as rumours</h3><p className="mt-2 text-sm text-muted-foreground">No unofficial premium can verify allotment, guarantee a listing gain or replace due diligence.</p></div></div></section>
    <p className="mt-10 text-xs text-muted-foreground">DeepScreen does not publish scraped or unverifiable current GMP quotes. Browse official offering information on the <Link to="/ipo" className="text-primary underline">IPO calendar <ArrowUpRight size={12} className="inline"/></Link>.</p>

    <section className="mt-14 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <p className="font-mono text-xs uppercase text-primary">DeepScreen research</p>
      <h2 className="mt-2 text-xl font-semibold">IPO GMP vs listing price: what the number can and cannot tell you</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Our deeper guide separates GMP sentiment from official demand, valuation and listing-price formation, then gives a six-check IPO research framework to use before treating an unofficial premium as meaningful.</p>
      <a href="/blog/ipo-gmp-vs-listing-price-reliability" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Read the IPO GMP reliability guide →</a>
    </section>

    <MarketGuideFaqSection
      faqs={faqs}
      title="IPO GMP questions answered"
      description="Direct answers on grey market premium meaning, formula, negative GMP, official versus unofficial data, subscription status and safer IPO research."
    />

    <section className="mt-10 rounded-xl border border-border bg-panel p-5" aria-labelledby="ipo-gmp-sources">
      <h2 id="ipo-gmp-sources" className="font-semibold">Official IPO research sources</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">GMP itself is not an official exchange series. Use SEBI and exchange material for the IPO's offer document, issue terms, book-building process and investor-protection information.</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {MARKET_GUIDE_SOURCES.IPO_GMP.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">{source.label}</a>)}
      </div>
    </section>

    <div className="mt-10 flex flex-wrap gap-6 border-t border-border pt-8 text-sm"><Link to="/ipo" className="inline-flex items-center gap-2 text-primary hover:underline">IPO calendar <ArrowRight size={16}/></Link><Link to="/gift-nifty" className="inline-flex items-center gap-2 text-primary hover:underline">GIFT Nifty <ArrowRight size={16}/></Link></div>
  </div></Shell>;
}