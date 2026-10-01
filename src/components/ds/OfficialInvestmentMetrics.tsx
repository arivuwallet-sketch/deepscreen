import { useInvestmentAnalysis } from "@/hooks/useInvestmentAnalysis";
import type { Investment } from "@/lib/deepscreen/investments";

function pct(value: number | null | undefined, digits = 2) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? null
    : `${value.toLocaleString("en-IN", { maximumFractionDigits: digits })}%`;
}

function number(value: number | null | undefined, digits = 2) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? null
    : value.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

function Metric({ label, value, note }: { label: string; value: string | null; note?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-border bg-card/35 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
      {note ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function OfficialInvestmentMetrics({ item }: { item: Investment }) {
  const { data } = useInvestmentAnalysis(item);
  if (!data || item.type === "REIT") return null;

  if (item.type === "FUND") {
    const official = data.officialFund;
    if (!official) return null;
    const hasMetrics = [
      official.terPct,
      official.trackingErrorPct,
      official.trackingDifferencePct,
      official.benchmark,
      official.aumCrore,
      official.standardDeviationPct,
      official.beta,
      official.sharpe,
      official.informationRatio,
      official.riskometer,
    ].some((value) => value !== null);
    if (!hasMetrics) return null;

    return (
      <section className="mt-10 rounded-xl border border-primary/20 bg-primary/[0.035] p-5 sm:p-6" aria-labelledby="official-fund-metrics">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Official fund disclosures</p>
            <h2 id="official-fund-metrics" className="mt-2 text-xl font-bold">AMFI cost, benchmark and risk data</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              DeepScreen matches this scheme against AMFI's TER, tracking, fund-performance and risk-parameter disclosures. Values are shown only when the scheme match is strong enough.
            </p>
          </div>
          {official.sourceDate ? <span className="text-xs text-muted-foreground">AMFI reference: {official.sourceDate}</span> : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Metric label="Total expense ratio" value={pct(official.terPct)} note="Official AMFI TER disclosure where matched." />
          <Metric label="Benchmark" value={official.benchmark} />
          <Metric label="AUM" value={official.aumCrore === null ? null : `₹${number(official.aumCrore)} Cr`} />
          <Metric label="Tracking error" value={pct(official.trackingErrorPct)} />
          <Metric label="Tracking difference" value={pct(official.trackingDifferencePct)} />
          <Metric label="Standard deviation" value={pct(official.standardDeviationPct)} />
          <Metric label="Beta" value={number(official.beta)} />
          <Metric label="Sharpe ratio" value={number(official.sharpe)} />
          <Metric label="Information ratio" value={number(official.informationRatio)} />
          <Metric label="Riskometer" value={official.riskometer} />
        </div>
      </section>
    );
  }

  const profile = data.fundProfile;
  if (!profile) return null;
  const values = [
    profile.managerName,
    profile.managerStartDate,
    profile.inceptionDate,
    profile.alpha3Year,
    profile.sharpe3Year,
    profile.stdDev3Year,
    profile.rSquared3Year,
    profile.treynor3Year,
  ];
  if (!values.some((value) => value !== null)) return null;

  return (
    <section className="mt-10 rounded-xl border border-primary/20 bg-primary/[0.035] p-5 sm:p-6" aria-labelledby="provider-etf-metrics">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Additional fund statistics</p>
      <h2 id="provider-etf-metrics" className="mt-2 text-xl font-bold">ETF management and 3-year risk statistics</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Supplemental fund-management and risk fields are taken from the live fund-profile provider when it publishes them for this ETF.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Manager" value={profile.managerName} />
        <Metric label="Manager start" value={profile.managerStartDate} />
        <Metric label="Fund inception" value={profile.inceptionDate} />
        <Metric label="3Y alpha" value={number(profile.alpha3Year)} />
        <Metric label="3Y Sharpe" value={number(profile.sharpe3Year)} />
        <Metric label="3Y standard deviation" value={pct(profile.stdDev3Year)} />
        <Metric label="3Y R-squared" value={number(profile.rSquared3Year)} />
        <Metric label="3Y Treynor" value={number(profile.treynor3Year)} />
      </div>
    </section>
  );
}
