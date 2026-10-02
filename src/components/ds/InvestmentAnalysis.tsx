import type { ReactNode } from "react";

import { useInvestmentAnalysis } from "@/hooks/useInvestmentAnalysis";
import type { Investment } from "@/lib/deepscreen/investments";
import type { EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";

interface Metric {
  label: string;
  value: ReactNode | null;
  note?: string | undefined;
}

interface Section {
  title: string;
  description: string;
  metrics: Metric[];
}

const pct = (value: number | null | undefined, digits = 2) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? null
    : `${value.toLocaleString("en-IN", { maximumFractionDigits: digits })}%`;

const number = (value: number | null | undefined, digits = 2) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? null
    : value.toLocaleString("en-IN", { maximumFractionDigits: digits });

const compact = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? null
    : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value);

const money = (value: number | null | undefined, currency: string | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      // Fall through to compact formatting.
    }
  }
  return compact(value);
};

const unavailable = (why: string) => why;

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-lg border border-border bg-card/35 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</dt>
          <dd className="mt-2 text-base font-semibold text-foreground">
            {metric.value ?? <span className="font-normal text-muted-foreground">Not available</span>}
          </dd>
          {metric.note ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.note}</p> : null}
        </div>
      ))}
    </dl>
  );
}

function AnalysisSections({ sections }: { sections: Section[] }) {
  return (
    <div className="mt-8 space-y-7">
      {sections.map((section, index) => (
        <section key={section.title} className="border-t border-border pt-7">
          <div className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{section.description}</p>
            </div>
          </div>
          <MetricGrid metrics={section.metrics} />
        </section>
      ))}
    </div>
  );
}

function etfSections(data: EnhancedInvestmentAnalysisData): Section[] {
  const fund = data.fundProfile;
  const quality = data.holdingQuality;
  const history = data.history;
  const topSector = fund?.topSectors[0];
  const top3SectorWeight = fund?.topSectors.slice(0, 3).reduce((sum, sector) => sum + sector.weightPct, 0) ?? 0;
  const earningsYield = fund?.portfolioPe && fund.portfolioPe > 0 ? 100 / fund.portfolioPe : null;

  return [
    {
      title: "Business — what the basket actually owns",
      description: "Treat the ETF as a portfolio rather than a company. Verify the tracked index, methodology and replication method before relying on the rest of the numbers.",
      metrics: [
        { label: "Index / category", value: fund?.category ?? null, note: fund?.category ? "Provider classification; verify the exact tracked index in the issuer factsheet." : unavailable("The live fund feed did not identify the tracked index.") },
        { label: "Fund family", value: fund?.family ?? null },
        { label: "Legal structure", value: fund?.legalType ?? null },
        { label: "Manager", value: fund?.managerName ?? null },
        { label: "Manager start", value: fund?.managerStartDate ?? null },
        { label: "Fund inception", value: fund?.inceptionDate ?? null },
        { label: "Replication", value: null, note: unavailable("Physical vs synthetic replication requires the issuer prospectus/factsheet and is not inferred from the ticker.") },
      ],
    },
    {
      title: "Quality and growth — weighted holding fundamentals",
      description: "Top-holding fundamentals are weighted by reported ETF holding weight. Coverage is shown so a partial holding sample is never presented as the whole basket.",
      metrics: [
        { label: "Weighted ROE", value: pct(quality?.weightedRoePct), note: quality ? `Based on ${quality.holdingsAnalyzed} holdings covering ${pct(quality.coveredWeightPct, 1) ?? "an unknown share"}.` : undefined },
        { label: "Weighted earnings growth", value: pct(quality?.weightedEarningsGrowthPct) },
        { label: "Weighted debt / equity", value: number(quality?.weightedDebtToEquity) },
        { label: "Fundamental coverage", value: quality ? pct(quality.coveredWeightPct, 1) : null },
      ],
    },
    {
      title: "Valuation — price paid for the basket",
      description: "Portfolio valuation ratios are more useful for an equity ETF than applying a company DCF to the ETF itself.",
      metrics: [
        { label: "Portfolio P/E", value: number(fund?.portfolioPe) },
        { label: "Portfolio P/B", value: number(fund?.portfolioPb) },
        { label: "Earnings yield", value: pct(earningsYield), note: fund?.portfolioPe ? "Calculated as 1 ÷ portfolio P/E." : undefined },
        { label: "Own valuation history", value: null, note: unavailable("A verified historical portfolio P/E/P/B series is not available from the connected feed.") },
      ],
    },
    {
      title: "Risk — concentration, drawdown and risk-adjusted returns",
      description: "Concentration and realized market risk are shown separately, with provider-published fund statistics used when available.",
      metrics: [
        { label: "Top-10 weight", value: pct(fund?.top10WeightPct, 1) },
        { label: "Largest sector", value: topSector ? `${topSector.name} · ${pct(topSector.weightPct, 1)}` : null },
        { label: "Top-3 sector weight", value: top3SectorWeight > 0 ? pct(top3SectorWeight, 1) : null },
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y max drawdown", value: pct(history?.maxDrawdown5yPct) },
        { label: "3Y volatility", value: pct(fund?.stdDev3Year ?? history?.volatility3yPct), note: fund?.stdDev3Year !== null && fund?.stdDev3Year !== undefined ? "Provider-published 3-year standard deviation." : "Calculated from weekly price history." },
        { label: "3Y beta", value: number(fund?.beta3Year) },
        { label: "3Y alpha", value: number(fund?.alpha3Year) },
        { label: "3Y Sharpe", value: number(fund?.sharpe3Year) },
        { label: "3Y R-squared", value: number(fund?.rSquared3Year) },
        { label: "3Y Treynor", value: number(fund?.treynor3Year) },
      ],
    },
    {
      title: "Cost and execution — what ownership and trading really cost",
      description: "Expense ratio alone is not enough. Trading friction, NAV premium/discount, liquidity and tracking quality matter too.",
      metrics: [
        { label: "Expense ratio", value: pct(fund?.expenseRatioPct) },
        { label: "Tracking difference", value: null, note: unavailable("A verified benchmark total-return series or official tracking-difference disclosure is required for this ETF.") },
        { label: "Current bid/ask spread", value: pct(fund?.currentSpreadPct, 3), note: "Current indicative spread; not a median midday spread." },
        { label: "Median midday spread", value: null, note: unavailable("Requires intraday quote history across many sessions.") },
        { label: "Premium / discount to NAV", value: pct(fund?.premiumDiscountPct, 3) },
        { label: "AUM", value: money(fund?.totalAssets, fund?.currency) },
        { label: "Average volume", value: compact(fund?.averageVolume) },
      ],
    },
  ];
}

function mutualFundSections(item: Investment, data: EnhancedInvestmentAnalysisData): Section[] {
  const fund = data.fundProfile;
  const meta = data.mutualFund;
  const history = data.history;
  const official = data.officialFund;
  const directNote = meta?.planType === "Regular"
    ? "This is a Regular plan. Compare the equivalent Direct plan because distributor commission compounds against long-run returns."
    : meta?.planType === "Direct"
      ? "This is identified as a Direct plan."
      : "Plan type could not be determined confidently from the scheme name.";

  return [
    {
      title: "Process — is the portfolio following the stated style?",
      description: "The scheme category and plan identity establish what the fund says it is. Style drift still needs historical portfolio exposures, so it is not guessed from the name.",
      metrics: [
        { label: "Fund house", value: meta?.fundHouse ?? fund?.family ?? null },
        { label: "Scheme type", value: meta?.schemeType ?? fund?.legalType ?? null },
        { label: "Category / stated style", value: meta?.schemeCategory ?? fund?.category ?? null },
        { label: "Benchmark", value: official?.benchmark ?? null, note: official?.benchmark ? "AMFI fund-performance disclosure." : undefined },
        { label: "Riskometer", value: official?.riskometer ?? null, note: official?.riskometer ? "AMFI disclosure." : undefined },
        { label: "Plan", value: meta?.planType ?? "Unclear", note: directNote },
        { label: "Option", value: meta?.optionType ?? null },
        { label: "Style drift", value: null, note: unavailable("Requires historical portfolio exposures versus the stated mandate.") },
      ],
    },
    {
      title: "Performance — consistency over 3, 5 and 10 years",
      description: "Returns and rolling consistency use NAV history. Benchmark-relative return comparisons are only calculated when a verified benchmark return series is connected.",
      metrics: [
        { label: "1Y return", value: pct(history?.return1yPct) },
        { label: "3Y annualized return", value: pct(history?.return3yAnnualizedPct) },
        { label: "5Y annualized return", value: pct(history?.return5yAnnualizedPct) },
        { label: "10Y annualized return", value: pct(history?.return10yAnnualizedPct) },
        { label: "3Y rolling median", value: pct(history?.rolling3yMedianPct), note: history?.rolling3yPositivePct !== null && history?.rolling3yPositivePct !== undefined ? `${pct(history.rolling3yPositivePct, 1)} of sampled 3-year periods were positive.` : undefined },
        { label: "5Y rolling median", value: pct(history?.rolling5yMedianPct), note: history?.rolling5yPositivePct !== null && history?.rolling5yPositivePct !== undefined ? `${pct(history.rolling5yPositivePct, 1)} of sampled 5-year periods were positive.` : undefined },
        { label: "Tracking difference", value: pct(official?.trackingDifferencePct), note: official?.trackingDifferencePct !== null && official?.trackingDifferencePct !== undefined ? "Official AMFI tracking-difference disclosure." : unavailable("Only published for applicable passive schemes.") },
      ],
    },
    {
      title: "Risk-adjusted quality — returns in relation to downside",
      description: "AMFI risk disclosures are preferred where matched. Historical drawdown and volatility remain calculated from NAV history.",
      metrics: [
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y max drawdown", value: pct(history?.maxDrawdown5yPct) },
        { label: "3Y annualized volatility", value: pct(official?.standardDeviationPct ?? history?.volatility3yPct), note: official?.standardDeviationPct !== null && official?.standardDeviationPct !== undefined ? "Official AMFI risk-parameter disclosure." : undefined },
        { label: "5Y annualized volatility", value: pct(history?.volatility5yPct) },
        { label: "Beta", value: number(official?.beta ?? fund?.beta3Year), note: official?.beta !== null && official?.beta !== undefined ? "Official AMFI risk-parameter disclosure." : undefined },
        { label: "Sharpe ratio", value: number(official?.sharpe ?? fund?.sharpe3Year), note: official?.sharpe !== null && official?.sharpe !== undefined ? "Official AMFI risk-parameter disclosure." : undefined },
        { label: "Information ratio", value: number(official?.informationRatio), note: official?.informationRatio !== null && official?.informationRatio !== undefined ? "AMFI fund-performance disclosure." : undefined },
        { label: "Tracking error", value: pct(official?.trackingErrorPct), note: official?.trackingErrorPct !== null && official?.trackingErrorPct !== undefined ? "Official AMFI tracking-error disclosure." : unavailable("Only published for applicable passive schemes.") },
        { label: "Sortino / alpha / capture", value: null, note: unavailable("These need a verified benchmark and risk-free/minimum-return series on the same dates; DeepScreen does not invent them.") },
      ],
    },
    {
      title: "Portfolio — valuation, concentration and activeness",
      description: "Portfolio ratios explain what drives returns. Active share still needs complete fund and benchmark holdings.",
      metrics: [
        { label: "Portfolio P/E", value: number(fund?.portfolioPe) },
        { label: "Portfolio P/B", value: number(fund?.portfolioPb) },
        { label: "Number of holdings", value: fund?.holdingsCount ?? null },
        { label: "Top-10 weight", value: pct(fund?.top10WeightPct, 1) },
        { label: "Cash level", value: pct(fund?.cashPositionPct, 1) },
        { label: "Active share", value: null, note: unavailable("Requires complete fund and benchmark holdings for the same date.") },
      ],
    },
    {
      title: "People and capacity — who is running the process?",
      description: "A fund's historical return should not automatically be credited to a manager who was not running it at the time.",
      metrics: [
        { label: "Manager", value: fund?.managerName ?? null },
        { label: "Manager start", value: fund?.managerStartDate ?? null },
        { label: "AUM", value: official?.aumCrore !== null && official?.aumCrore !== undefined ? `₹${number(official.aumCrore)} Cr` : money(fund?.totalAssets, fund?.currency), note: official?.aumCrore !== null && official?.aumCrore !== undefined ? "AMFI fund-performance disclosure." : undefined },
        { label: "Capacity pressure", value: null, note: unavailable("Requires strategy-specific liquidity/capacity analysis and AUM history, not simply current AUM.") },
      ],
    },
    {
      title: "Cost — what the investor actually pays",
      description: "For Indian schemes, AMFI TER is used when the exact scheme can be matched. Direct and Regular plans remain separate cost comparisons.",
      metrics: [
        { label: "Expense ratio / TER", value: pct(official?.terPct ?? fund?.expenseRatioPct), note: official?.terPct !== null && official?.terPct !== undefined ? "Official AMFI TER disclosure." : undefined },
        { label: "Portfolio turnover", value: pct(fund?.turnoverPct) },
        { label: "Exit load", value: null, note: unavailable("Exit-load schedules vary by scheme and holding period and require the current scheme document.") },
        { label: "Plan-cost check", value: meta?.planType ?? null, note: directNote },
        { label: "Current NAV", value: item.nav !== null ? `₹${item.nav.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : fund?.navPrice ? number(fund.navPrice, 4) : null, note: item.date ? `Directory NAV date: ${item.date}.` : undefined },
      ],
    },
  ];
}

function reitSections(item: Investment, data: EnhancedInvestmentAnalysisData): Section[] {
  const reit = data.reit;
  const history = data.history;
  const indian = item.market === "NSE" || item.market === "BSE" || item.market === "IN";
  const netDebt = reit?.totalDebt !== null && reit?.totalDebt !== undefined ? reit.totalDebt - (reit.totalCash ?? 0) : null;

  return [
    {
      title: "Asset quality — durability of the property cash flows",
      description: "Occupancy, lease duration, tenant concentration and tenant credit are REIT operating metrics and must come from REIT disclosures rather than generic stock ratios.",
      metrics: [
        { label: "Property / industry type", value: reit?.industry ?? reit?.sector ?? null },
        { label: "Country", value: reit?.country ?? null },
        { label: "Occupancy", value: null, note: unavailable("Requires the latest REIT operating supplement/filing.") },
        { label: "WALE", value: null, note: unavailable("Requires lease disclosure from the REIT.") },
        { label: "Tenant concentration", value: null, note: unavailable("Requires the current tenant rent/revenue schedule.") },
        { label: "Tenant credit quality", value: null, note: unavailable("Requires tenant disclosures and credit information.") },
      ],
    },
    {
      title: "Growth — NOI, escalators and capital allocation",
      description: "REIT growth should come from property-level NOI, contractual rent growth, development and accretive acquisitions.",
      metrics: [
        { label: "Revenue growth", value: pct(reit?.revenueGrowthPct) },
        { label: "Earnings growth", value: pct(reit?.earningsGrowthPct) },
        { label: "Same-property NOI growth", value: null, note: unavailable("Requires comparable property disclosures.") },
        { label: "Built-in rent escalators", value: null, note: unavailable("Requires lease disclosures.") },
        { label: "Development pipeline", value: null, note: unavailable("Requires the latest investor presentation/filing.") },
        { label: "Acquisition yield vs cost of capital", value: null, note: unavailable("Needs disclosed acquisition cap rates and contemporaneous financing cost.") },
      ],
    },
    {
      title: "Cash flow — AFFO or NDCF before headline earnings",
      description: indian ? "For Indian REITs, NDCF per unit and distribution coverage are the primary cash-flow checks." : "For REITs, AFFO/FFO and distribution coverage are more useful than company-style EPS alone.",
      metrics: [
        { label: "Operating cash flow", value: money(reit?.operatingCashflow, reit?.currency) },
        { label: "Free cash flow", value: money(reit?.freeCashflow, reit?.currency), note: "Provider FCF is a cross-check; it is not automatically AFFO or NDCF." },
        { label: indian ? "NDCF per unit trend" : "AFFO per share trend", value: null, note: unavailable("Requires REIT-specific filing data and unit/share reconciliation.") },
        { label: "Payout ratio", value: pct(reit?.payoutRatioPct) },
        { label: "Distribution / dividend yield", value: pct(reit?.dividendYieldPct) },
      ],
    },
    {
      title: "Balance sheet — leverage, coverage and refinancing risk",
      description: "A REIT can look inexpensive while carrying refinancing risk, so leverage and debt structure are central to the analysis.",
      metrics: [
        { label: "Debt / equity", value: number(reit?.debtToEquity) },
        { label: "Total debt", value: money(reit?.totalDebt, reit?.currency) },
        { label: "Net debt", value: money(netDebt, reit?.currency) },
        { label: "Debt / EBITDA", value: number(reit?.debtToEbitda) },
        { label: "Net debt / EBITDA", value: number(reit?.netDebtToEbitda) },
        { label: "LTV", value: null, note: unavailable("Requires property/asset valuation data from REIT disclosures.") },
        { label: "Interest coverage", value: null, note: unavailable("Requires interest-expense data on a consistent REIT reporting basis.") },
        { label: "Maturity ladder", value: null, note: unavailable("Requires debt schedule disclosures.") },
        { label: "Fixed vs floating debt", value: null, note: unavailable("Requires debt-mix disclosures.") },
      ],
    },
    {
      title: "Valuation — cash-flow multiple, NAV and cap rate",
      description: "P/AFFO, NAV discount/premium and implied cap rate are the primary REIT valuation checks; generic P/E and P/B are secondary context.",
      metrics: [
        { label: "P / AFFO", value: null, note: unavailable("Requires verified AFFO per share/unit.") },
        { label: "Discount / premium to NAV", value: null, note: unavailable("Requires a current REIT NAV based on property values and net debt.") },
        { label: "Implied cap rate", value: null, note: unavailable("Requires NOI and enterprise/property value on compatible dates.") },
        { label: "Dividend yield", value: pct(reit?.dividendYieldPct), note: "A high yield is only useful if AFFO/NDCF covers it." },
        { label: "P/E (secondary)", value: number(reit?.pe) },
        { label: "P/B (secondary)", value: number(reit?.pb) },
        { label: "Market cap", value: money(reit?.marketCap, reit?.currency) },
      ],
    },
    {
      title: "Governance — sponsor alignment and capital issuance",
      description: "Sponsor quality and related-party discipline can change the value of an otherwise attractive property portfolio.",
      metrics: [
        { label: "Sponsor quality", value: null, note: unavailable("Requires sponsor history and operating-record review.") },
        { label: "Related-party transactions", value: null, note: unavailable("Requires filing-level related-party disclosure review.") },
        { label: "Equity raises at fair prices", value: null, note: unavailable("Requires historical issuance prices compared with NAV/market value at each raise.") },
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y annualized volatility", value: pct(history?.volatility5yPct) },
      ],
    },
  ];
}

function TopHoldings({ data }: { data: EnhancedInvestmentAnalysisData }) {
  const holdings = data.fundProfile?.holdings.slice(0, 10) ?? [];
  if (!holdings.length) return null;
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h3 className="text-lg font-semibold">Top reported holdings</h3>
      <p className="mt-1 text-sm text-muted-foreground">Provider-reported top holdings only; this is not treated as a complete portfolio when the provider exposes only a subset.</p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead className="border-b border-border bg-card/40 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Holding</th><th className="px-4 py-3">Symbol</th><th className="px-4 py-3 text-right">Weight</th></tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={`${holding.symbol}:${holding.name}`} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">{holding.name}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{holding.symbol || "—"}</td>
                <td className="px-4 py-3 text-right font-mono">{pct(holding.weightPct, 2) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function InvestmentAnalysis({ item }: { item: Investment }) {
  const { data, isLoading, isError } = useInvestmentAnalysis(item);

  return (
    <section className="mt-12" aria-labelledby="investment-analysis-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">DeepScreen investment analysis</p>
          <h2 id="investment-analysis-heading" className="mt-2 text-2xl font-bold">
            {item.type === "ETF" ? "ETF basket analysis" : item.type === "FUND" ? "Mutual fund analysis" : "REIT operating-business analysis"}
          </h2>
        </div>
        {data?.fetchedAt ? <p className="text-xs text-muted-foreground">Analysis refreshed {new Date(data.fetchedAt).toLocaleString()}</p> : null}
      </div>

      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        {item.type === "ETF"
          ? "This page analyzes the basket, concentration, valuation, realized risk and trading costs instead of applying a single-company score."
          : item.type === "FUND"
            ? "This page focuses on process, rolling performance, downside risk, portfolio construction, people/capacity evidence and cost rather than treating the scheme as a stock."
            : "This page treats the REIT as a property operating business, emphasizing leases, NOI/AFFO or NDCF, leverage, NAV/cap-rate valuation and sponsor governance."}
      </p>

      {isLoading ? (
        <div className="mt-8 rounded-lg border border-border bg-card/30 p-5 text-sm text-muted-foreground">Loading available investment-specific data…</div>
      ) : isError || !data ? (
        <div className="mt-8 rounded-lg border border-border bg-card/30 p-5 text-sm text-muted-foreground">Live analysis sources are temporarily unavailable. The listing and current NAV/quote above remain available.</div>
      ) : (
        <>
          <div className="mt-6 rounded-lg border border-border bg-card/30 p-4 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Sources used:</span>{" "}
            {data.sources.length ? data.sources.join(" · ") : "No supplemental analysis source returned data."}
            {data.history ? ` · History ${data.history.startDate} to ${data.history.endDate}` : ""}
          </div>
          <AnalysisSections sections={item.type === "ETF" ? etfSections(data) : item.type === "FUND" ? mutualFundSections(item, data) : reitSections(item, data)} />
          {(item.type === "ETF" || item.type === "FUND") ? <TopHoldings data={data} /> : null}
        </>
      )}

      <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
        Missing values are intentionally shown as unavailable. DeepScreen now prefers AMFI official TER/tracking/risk disclosures for Indian mutual funds and provider-published fund statistics for ETFs; filing-only REIT operating metrics remain blank until a current filing source can be verified.
      </p>
    </section>
  );
}
