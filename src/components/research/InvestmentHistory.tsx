import { investmentQuoteCode } from "@/lib/deepscreen/investment-symbol";
import type { Investment } from "@/lib/deepscreen/investments";
import type { EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";
import { HistoryChart } from "./HistoryChart";
const value = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
export function InvestmentHistory({
  item,
  data,
}: {
  item: Investment;
  data: EnhancedInvestmentAnalysisData;
}) {
  const indianNav = item.type === "FUND" && item.market === "IN";
  const h = data.history,
    f = data.fundProfile,
    r = data.reit;
  const symbol =
    investmentQuoteCode(item.market, item.type, item.code) +
    (item.market === "NSE"
      ? ".NS"
      : item.market === "BSE"
        ? ".BO"
        : item.market === "LSE"
          ? ".L"
          : "");
  const source = indianNav
    ? `https://api.mfapi.in/mf/${encodeURIComponent(item.code)}`
    : `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`;
  const latest = indianNav ? h?.latestValue : data.marketSnapshot?.price;
  const currency = indianNav ? "INR" : data.marketSnapshot?.currency;
  const date = indianNav ? h?.endDate : data.marketSnapshot?.asOf;
  const aged = date ? Date.parse(data.fetchedAt) - Date.parse(date) > 7 * 86400000 : false;
  return (
    <div className="mt-6">
      <div className="rounded-xl border border-border bg-panel p-5">
        <p className="text-xs text-muted-foreground">
          {indianNav ? "Latest reported NAV" : "Latest provider market price"}
        </p>
        <p className="mt-2 font-mono text-2xl">
          {latest !== undefined && latest !== null
            ? `${currency ?? ""} ${value(latest)}`
            : "Unavailable"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Observation: {date?.replace("T", " ").slice(0, 19) ?? "Unavailable"}
          {date?.includes("T") ? " UTC" : ""} · {indianNav ? "End-of-day NAV" : "May be delayed"}
        </p>
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          View {indianNav ? "MFAPI NAV source" : "Yahoo Finance source"} ↗
        </a>
      </div>
      {aged && <p role="status" className="mt-3 rounded-lg border border-warn/30 p-3 text-sm">This observation is more than seven days old. Treat it as historical, not a current market quote.</p>}
      <HistoryChart
        points={data.historyPoints ?? []}
        label={
          indianNav
            ? "Scheme NAV history (INR)"
            : `${data.historyBasis === "adjusted" ? "Adjusted-price" : "Closing-price"} history${currency ? ` (${currency})` : ""}`
        }
      />
      <section className="mt-5 rounded-xl border border-border p-5 text-sm leading-relaxed">
        <h3 className="font-semibold">What the available data shows</h3>
        {h ? (
          <p className="mt-2">
            {h.return1yPct === null
              ? "A full one-year return is unavailable."
              : `The latest one-year historical return is ${h.return1yPct.toFixed(2)}%.`}{" "}
            {h.maxDrawdown3yPct === null
              ? ""
              : "The worst observed decline from a prior peak over the available trailing three-year window was " +
                h.maxDrawdown3yPct.toFixed(2) +
                "%."}{" "}
            History ends {h.endDate}; these observations are not a forecast.
          </p>
        ) : (
          <p className="mt-2">
            Historical performance cannot be assessed until sufficient provider observations are
            available.
          </p>
        )}
        {item.type === "FUND" && (
          <p className="mt-2">
            Reported plan: {data.mutualFund?.planType ?? "Unspecified"} ·{" "}
            {data.mutualFund?.optionType ?? "Unspecified"}. NAV comparisons must use the same plan
            and payout option. Distributions are not assumed to be reinvested in this NAV series.
          </p>
        )}
        {item.type === "ETF" && (
          <p className="mt-2">
            {f?.top10WeightPct != null
              ? `Reported top holdings account for ${f.top10WeightPct.toFixed(1)}% of assets. `
              : ""}
            {f?.expenseRatioPct != null
              ? `Reported annual expense ratio: ${f.expenseRatioPct.toFixed(2)}%. `
              : ""}
            Price returns alone do not measure tracking quality. A matching benchmark and aligned
            NAV dates are needed to assess tracking error and premium or discount.
          </p>
        )}
        {item.type === "REIT" && (
          <p className="mt-2">
            {r?.netDebtToEbitda != null
              ? `Reported net debt / EBITDA is ${r.netDebtToEbitda.toFixed(2)}×. `
              : ""}
            Review property cash flow, distribution coverage, occupancy and debt maturity together.
            Missing FFO, AFFO or NDCF figures cannot be inferred from share-price performance or
            ordinary company earnings.
          </p>
        )}
      </section>
    </div>
  );
}
