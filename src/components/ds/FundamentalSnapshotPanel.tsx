import type { FundamentalSources } from "@/lib/deepscreen/live-merge";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import { currencySymbol } from "@/lib/deepscreen/format";

function pct(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) + "%" : "Unavailable";
}

function multiple(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) + "x" : "Unavailable";
}

function money(value: number | null | undefined, exchange: string): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  const symbol = currencySymbol(exchange);
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return symbol + (value / 1_000_000_000_000).toFixed(2) + "T";
  if (abs >= 1_000_000_000) return symbol + (value / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return symbol + (value / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return symbol + (value / 1_000).toFixed(1) + "K";
  return symbol + value.toFixed(0);
}

export function FundamentalSnapshotPanel({
  stock,
  liveFundamentals,
  sources,
  updatedAt,
}: {
  stock: Stock;
  liveFundamentals: LiveFundamentals | null | undefined;
  sources: FundamentalSources;
  updatedAt: number;
}) {
  const f = stock.fundamentals;
  const liveRevenueGrowth = liveFundamentals?.revenueGrowth ?? null;
  const liveEarningsGrowth = liveFundamentals?.earningsGrowth ?? null;
  const growthSpread =
    liveRevenueGrowth !== null && liveEarningsGrowth !== null
      ? liveEarningsGrowth - liveRevenueGrowth
      : null;
  const operatingCashflow = liveFundamentals?.operatingCashflow ?? null;
  const freeCashflow = liveFundamentals?.freeCashflow ?? null;
  const fcfConversion =
    operatingCashflow !== null &&
    operatingCashflow > 0 &&
    freeCashflow !== null
      ? (freeCashflow / operatingCashflow) * 100
      : null;
  const cash = liveFundamentals?.totalCash ?? null;
  const debt = liveFundamentals?.totalDebt ?? null;
  const netDebt = cash !== null && debt !== null ? debt - cash : null;
  const isIndian = stock.exchange === "NSE" || stock.exchange === "BSE";

  const cards = [
    {
      label: "Revenue growth",
      value: pct(liveRevenueGrowth),
      detail: "Provider-reported period-over-period growth",
      live: liveRevenueGrowth !== null,
    },
    {
      label: "Earnings growth",
      value: pct(liveEarningsGrowth),
      detail: "Provider-reported period-over-period growth",
      live: liveEarningsGrowth !== null,
    },
    {
      label: "ROE",
      value: pct(f.roe),
      detail: "Return on equity",
      live: sources.roe === "live",
    },
    {
      label: "ROCE",
      value: pct(f.roce),
      detail: "Return on capital employed",
      live: sources.roce === "live",
    },
    {
      label: "Net margin",
      value: pct(f.netMargin),
      detail: "Net income as a share of revenue",
      live: sources.netMargin === "live",
    },
    {
      label: "D/E",
      value: multiple(f.debtToEquity),
      detail: "Debt relative to shareholder equity",
      live: sources.debtToEquity === "live",
    },
    {
      label: "Free cash flow",
      value: money(freeCashflow, stock.exchange),
      detail: fcfConversion === null ? "Latest provider figure" : fcfConversion.toFixed(0) + "% of operating cash flow",
      live: freeCashflow !== null,
    },
    {
      label: "Cash vs debt",
      value: netDebt === null ? "Unavailable" : netDebt <= 0 ? "Net cash" : money(netDebt, stock.exchange) + " net debt",
      detail: netDebt === null ? "Latest provider figures" : "Cash " + money(cash, stock.exchange) + " · Debt " + money(debt, stock.exchange),
      live: cash !== null && debt !== null,
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Live fundamentals snapshot</h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            Current operating, capital-efficiency and cash-flow metrics using the latest available provider data.
            {isIndian ? " Indian ratios are supplemented by Screener.in when available." : ""}
          </p>
        </div>
        <div className="text-right">
          <span className="num rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Live where available
          </span>
          <div className="mt-1 text-[9px] text-muted-foreground">
            Updated {new Date(updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{card.label}</span>
              <span
                className={
                  card.live
                    ? "rounded bg-bull/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-bull"
                    : "rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground"
                }
              >
                {card.live ? "Live" : "Modeled"}
              </span>
            </div>
            <div className="num mt-2 text-lg font-semibold">{card.value}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </div>

      {growthSpread !== null ? (
        <div className="mt-4 rounded border border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          Earnings growth is {growthSpread >= 0 ? growthSpread.toFixed(1) + " percentage points above" : Math.abs(growthSpread).toFixed(1) + " percentage points below"} revenue growth in the latest provider snapshot.
        </div>
      ) : null}

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Provider periods can differ by field. Growth figures are presented as reported by the upstream provider;
        they are not reconstructed from an expensive historical time series.
      </p>
    </section>
  );
}
