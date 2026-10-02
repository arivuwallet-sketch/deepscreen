import type { ReactNode } from "react";

import { useInvestmentAnalysis } from "@/hooks/useInvestmentAnalysis";
import type { Investment } from "@/lib/deepscreen/investments";
import type { EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";

type Metric = { label: string; value: ReactNode | null | undefined; note?: string | undefined };
type Section = { title: string; description: string; metrics: Metric[] };

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

function hasValue(value: ReactNode | null | undefined): boolean {
  return value !== null && value !== undefined && value !== "" && value !== false;
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  const available = metrics.filter((metric) => hasValue(metric.value));
  if (!available.length) return null;
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {available.map((metric) => (
        <div key={metric.label} className="rounded-lg border border-border bg-card/35 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</dt>
          <dd className="mt-2 text-base font-semibold text-foreground">{metric.value}</dd>
          {metric.note ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.note}</p> : null}
        </div>
      ))}
    </dl>
  );
}

function Sections({ sections }: { sections: Section[] }) {
  const available = sections.filter((section) => section.metrics.some((metric) => hasValue(metric.value)));
  return (
    <div className="mt-8 space-y-7">
      {available.map((section, index) => (
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

function etfSections(item: Investment, data: EnhancedInvestmentAnalysisData): Section[] {
  const fund = data.fundProfile;
  const official = data.officialFund;
  const quality = data.holdingQuality;
  const history = data.history;
  const market = data.marketSnapshot;
  const topSector = fund?.topSectors[0];
  const top3Sector = fund?.topSectors.slice(0, 3).reduce((sum, row) => sum + row.weightPct, 0) ?? 0;
  const earningsYield = fund?.portfolioPe && fund.portfolioPe > 0 ? 100 / fund.portfolioPe : null;
  return [
    {
      title: "Basket and structure",
      description: "What the ETF owns and how the reported portfolio is classified.",
      metrics: [
        { label: "Benchmark / index", value: official?.benchmark ?? fund?.category },
        { label: "Fund family", value: fund?.family },
        { label: "Provider listing name", value: market?.providerName, note: "Market listing label; not a verified fund-family disclosure." },
        { label: "Legal structure", value: fund?.legalType },
        { label: "Manager", value: fund?.managerName },
        { label: "Manager start", value: fund?.managerStartDate },
        { label: "Inception", value: official?.launchDate ?? fund?.inceptionDate },
        { label: "First recorded trade", value: market?.inceptionDate, note: "Provider's first available trade, not necessarily fund launch." },
      ],
    },
    {
      title: "Price history",
      description: `Returns and risk calculated from available adjusted-price history${data.historyVenue && data.historyVenue !== item.market ? ` (${data.historyVenue} cross-listing)` : ""}, not a benchmark comparison.`,
      metrics: [
        { label: "1Y return", value: pct(history?.return1yPct) },
        { label: "3Y annualized return", value: pct(history?.return3yAnnualizedPct) },
        { label: "5Y annualized return", value: pct(history?.return5yAnnualizedPct) },
        { label: "10Y annualized return", value: pct(history?.return10yAnnualizedPct) },
        { label: "3Y rolling median", value: pct(history?.rolling3yMedianPct) },
        { label: "5Y rolling median", value: pct(history?.rolling5yMedianPct) },
        { label: "52-week high", value: money(market?.fiftyTwoWeekHigh, market?.currency) },
        { label: "52-week low", value: money(market?.fiftyTwoWeekLow, market?.currency) },
      ],
    },
    {
      title: "Holding quality and valuation",
      description: "Weighted fundamentals are calculated only across holdings for which usable company fundamentals are available.",
      metrics: [
        { label: "Weighted ROE", value: pct(quality?.weightedRoePct), note: quality ? `${pct(quality.coveredWeightPct, 1)} of reported weight covered.` : undefined },
        { label: "Weighted earnings growth", value: pct(quality?.weightedEarningsGrowthPct) },
        { label: "Weighted debt / equity", value: number(quality?.weightedDebtToEquity) },
        { label: "Portfolio P/E", value: number(fund?.portfolioPe) },
        { label: "Portfolio P/B", value: number(fund?.portfolioPb) },
        { label: "Earnings yield", value: pct(earningsYield) },
      ],
    },
    {
      title: "Risk and concentration",
      description: "Portfolio concentration plus realized and provider-published risk statistics.",
      metrics: [
        { label: "Top-10 weight", value: pct(fund?.top10WeightPct, 1) },
        { label: "Largest sector", value: topSector ? `${topSector.name} · ${pct(topSector.weightPct, 1)}` : null },
        { label: "Top-3 sector weight", value: top3Sector > 0 ? pct(top3Sector, 1) : null },
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y max drawdown", value: pct(history?.maxDrawdown5yPct) },
        { label: "3Y volatility", value: pct(fund?.stdDev3Year ?? official?.standardDeviationPct ?? history?.volatility3yPct) },
        { label: "Beta", value: number(official?.beta ?? fund?.beta3Year) },
        { label: "Alpha", value: pct(official?.jensensAlphaPct ?? fund?.alpha3Year) },
        { label: "Sharpe", value: number(official?.sharpe ?? fund?.sharpe3Year) },
        { label: "Treynor", value: number(official?.treynor ?? fund?.treynor3Year) },
        { label: "R-squared", value: number(fund?.rSquared3Year) },
      ],
    },
    {
      title: "Cost and execution",
      description: "Ownership cost, tracking quality and exchange-trading friction where the source publishes them.",
      metrics: [
        { label: "Expense ratio / TER", value: pct(official?.terPct ?? fund?.expenseRatioPct) },
        { label: "Tracking error", value: pct(official?.trackingErrorPct, 4) },
        { label: "Tracking difference", value: pct(official?.trackingDifferencePct) },
        { label: "Bid / ask spread", value: pct(fund?.currentSpreadPct, 3) },
        { label: "Premium / discount to NAV", value: pct(fund?.premiumDiscountPct, 3) },
        { label: "AUM", value: official?.aumCrore !== null && official?.aumCrore !== undefined ? `₹${number(official.aumCrore)} Cr` : money(fund?.totalAssets, fund?.currency) },
        { label: "Average volume", value: compact(fund?.averageVolume) },
        { label: "Latest session volume", value: compact(market?.volume), note: "Not an average." },
      ],
    },
  ];
}

function fundSections(item: Investment, data: EnhancedInvestmentAnalysisData): Section[] {
  const fund = data.fundProfile;
  const meta = data.mutualFund;
  const official = data.officialFund;
  const history = data.history;
  return [
    {
      title: "Scheme and process",
      description: "Scheme identity, category, benchmark and plan structure from the available official and NAV sources.",
      metrics: [
        { label: "Fund house", value: meta?.fundHouse ?? fund?.family },
        { label: "Scheme type", value: meta?.schemeType ?? fund?.legalType },
        { label: "Category", value: meta?.schemeCategory ?? fund?.category },
        { label: "Benchmark", value: official?.benchmark },
        { label: "Riskometer", value: official?.riskometer },
        { label: "Plan", value: meta?.planType },
        { label: "Option", value: meta?.optionType },
        { label: "Launch date", value: official?.launchDate },
      ],
    },
    {
      title: "Performance",
      description: "AMFI-published performance is preferred where available; NAV-history calculations fill the remaining periods.",
      metrics: [
        { label: "1Y return", value: pct(official?.returns1yPct ?? history?.return1yPct) },
        { label: "3Y annualized return", value: pct(official?.returns3yPct ?? history?.return3yAnnualizedPct) },
        { label: "5Y annualized return", value: pct(official?.returns5yPct ?? history?.return5yAnnualizedPct) },
        { label: "10Y annualized return", value: pct(history?.return10yAnnualizedPct) },
        { label: "Benchmark 1Y", value: pct(official?.benchmarkReturns1yPct) },
        { label: "Benchmark 3Y", value: pct(official?.benchmarkReturns3yPct) },
        { label: "Benchmark 5Y", value: pct(official?.benchmarkReturns5yPct) },
        { label: "3Y rolling median", value: pct(history?.rolling3yMedianPct) },
        { label: "5Y rolling median", value: pct(history?.rolling5yMedianPct) },
      ],
    },
    {
      title: "Risk-adjusted quality",
      description: "Official AMFI risk parameters are used when AMFI publishes them for the matched category; otherwise realized NAV-history measures are shown.",
      metrics: [
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y max drawdown", value: pct(history?.maxDrawdown5yPct) },
        { label: "3Y volatility", value: pct(official?.standardDeviationPct ?? history?.volatility3yPct) },
        { label: "5Y volatility", value: pct(history?.volatility5yPct) },
        { label: "Beta", value: number(official?.beta ?? fund?.beta3Year) },
        { label: "Sharpe", value: number(official?.sharpe ?? fund?.sharpe3Year) },
        { label: "Treynor", value: number(official?.treynor ?? fund?.treynor3Year) },
        { label: "Jensen's alpha", value: pct(official?.jensensAlphaPct ?? fund?.alpha3Year) },
        { label: "Information ratio", value: number(official?.informationRatio) },
        { label: "Tracking error", value: pct(official?.trackingErrorPct, 4) },
        { label: "Tracking difference", value: pct(official?.trackingDifferencePct) },
      ],
    },
    {
      title: "Cost and capacity",
      description: "Plan costs, current size and entry/exit information where AMFI publishes it.",
      metrics: [
        { label: "TER / expense ratio", value: pct(official?.terPct ?? fund?.expenseRatioPct) },
        { label: "AUM", value: official?.aumCrore !== null && official?.aumCrore !== undefined ? `₹${number(official.aumCrore)} Cr` : money(fund?.totalAssets, fund?.currency) },
        { label: "Exit load", value: official?.exitLoad },
        { label: "Minimum investment", value: official?.minimumInvestment !== null && official?.minimumInvestment !== undefined ? `₹${number(official.minimumInvestment, 0)}` : null },
        { label: "Portfolio turnover", value: pct(fund?.turnoverPct) },
        { label: "Latest NAV", value: history?.latestValue !== undefined ? `₹${history.latestValue.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : item.nav !== null ? `₹${item.nav.toLocaleString("en-IN", { maximumFractionDigits: 4 })}` : null,
          note: history ? `NAV history date: ${history.endDate}` : `Directory snapshot: ${item.date || "date unavailable"}` },
      ],
    },
  ];
}

function reitSections(data: EnhancedInvestmentAnalysisData): Section[] {
  const reit = data.reit;
  const history = data.history;
  const netDebt = reit?.totalDebt !== null && reit?.totalDebt !== undefined ? reit.totalDebt - (reit.totalCash ?? 0) : null;
  return [
    {
      title: "Operating profile",
      description: "Property-business and growth fields available from the connected market fundamentals source.",
      metrics: [
        { label: "Property / industry", value: reit?.industry ?? reit?.sector },
        { label: "Country", value: reit?.country },
        { label: "Revenue growth", value: pct(reit?.revenueGrowthPct) },
        { label: "Earnings growth", value: pct(reit?.earningsGrowthPct) },
      ],
    },
    {
      title: "Cash flow and distributions",
      description: "Available cash-flow and distribution measures; company free cash flow is not treated as AFFO/NDCF.",
      metrics: [
        { label: "Operating cash flow", value: money(reit?.operatingCashflow, reit?.currency) },
        { label: "Free cash flow", value: money(reit?.freeCashflow, reit?.currency) },
        { label: "Payout ratio", value: pct(reit?.payoutRatioPct) },
        { label: "Distribution / dividend yield", value: pct(reit?.dividendYieldPct) },
      ],
    },
    {
      title: "Balance sheet and market risk",
      description: "Leverage and realized market-risk fields available from the connected sources.",
      metrics: [
        { label: "Debt / equity", value: number(reit?.debtToEquity) },
        { label: "Total debt", value: money(reit?.totalDebt, reit?.currency) },
        { label: "Net debt", value: money(netDebt, reit?.currency) },
        { label: "Debt / EBITDA", value: number(reit?.debtToEbitda) },
        { label: "Net debt / EBITDA", value: number(reit?.netDebtToEbitda) },
        { label: "3Y max drawdown", value: pct(history?.maxDrawdown3yPct) },
        { label: "5Y volatility", value: pct(history?.volatility5yPct) },
      ],
    },
    {
      title: "Valuation",
      description: "Market valuation context available without substituting company metrics for missing REIT-specific AFFO/NAV data.",
      metrics: [
        { label: "Dividend yield", value: pct(reit?.dividendYieldPct) },
        { label: "P/E (secondary)", value: number(reit?.pe) },
        { label: "P/B (secondary)", value: number(reit?.pb) },
        { label: "Market cap", value: money(reit?.marketCap, reit?.currency) },
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

export function InvestmentAnalysisAvailable({ item, initialData }: { item: Investment; initialData?: EnhancedInvestmentAnalysisData }) {
  const { data, isLoading, isError } = useInvestmentAnalysis(item, initialData);
  const sections = data
    ? item.type === "ETF"
      ? etfSections(item, data)
      : item.type === "FUND"
        ? fundSections(item, data)
        : reitSections(data)
    : [];
  const hasMetrics = sections.some((section) => section.metrics.some((metric) => hasValue(metric.value)));

  return (
    <section className="mt-12" aria-labelledby="investment-analysis-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">DeepScreen investment analysis</p>
          <h2 id="investment-analysis-heading" className="mt-2 text-2xl font-bold">
            {item.type === "ETF" ? "ETF basket analysis" : item.type === "FUND" ? "Mutual fund analysis" : "REIT operating-business analysis"}
          </h2>
        </div>
        {data?.fetchedAt ? <p className="text-xs text-muted-foreground">Refreshed {new Date(data.fetchedAt).toLocaleString()}</p> : null}
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-lg border border-border bg-card/30 p-5 text-sm text-muted-foreground">Loading verified investment data…</div>
      ) : isError || !data ? (
        <div className="mt-8 rounded-lg border border-border bg-card/30 p-5 text-sm text-muted-foreground">Investment analysis sources are temporarily unavailable.</div>
      ) : (
        <>
          <div className="mt-6 rounded-lg border border-border bg-card/30 p-4 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Sources used:</span>{" "}
            {data.sources.length ? data.sources.join(" · ") : "Price/NAV history only"}
            {data.history ? ` · ${data.historyVenue ?? "Market"} history ${data.history.startDate} to ${data.history.endDate}` : ""}
          </div>
          {hasMetrics ? (
            <Sections sections={sections} />
          ) : (
            <div className="mt-6 rounded-lg border border-border bg-card/30 p-5 text-sm leading-relaxed text-muted-foreground">
              No verified supplemental metrics were returned for this listing. Its directory NAV or market quote remains available above; DeepScreen will not substitute stock ratios or estimated fund data.
            </div>
          )}
          {item.type === "ETF" && !data.fundProfile?.holdings.length ? (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Holdings, fund fees, tracking and portfolio valuation are not supplied for this listing by the current sources. Price-history analysis remains available; bid / ask spread alone does not describe the fund's costs.
            </p>
          ) : null}
          {data.officialFund?.objective ? (
            <section className="mt-8 border-t border-border pt-7">
              <h3 className="text-lg font-semibold">Scheme objective</h3>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">{data.officialFund.objective}</p>
            </section>
          ) : null}
          {(item.type === "ETF" || item.type === "FUND") ? <TopHoldings data={data} /> : null}
        </>
      )}

      <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
        DeepScreen displays verified values returned by its current sources. Metrics without a verified value are omitted rather than shown as empty placeholder cards.
      </p>
    </section>
  );
}
