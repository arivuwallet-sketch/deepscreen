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

function Metric({ label, value, note }: { label: string; value: string | null; note?: string | undefined }) {
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

  const official = data.officialFund;
  const profile = data.fundProfile;
  const values = [
    official?.terPct,
    official?.trackingErrorPct,
    official?.trackingDifferencePct,
    official?.benchmark,
    official?.aumCrore,
    official?.standardDeviationPct,
    official?.beta,
    official?.sharpe,
    official?.treynor,
    official?.jensensAlphaPct,
    official?.informationRatio,
    official?.riskometer,
    official?.launchDate,
    official?.exitLoad,
    official?.minimumInvestment,
    official?.returns1yPct,
    official?.returns3yPct,
    official?.returns5yPct,
    profile?.managerName,
    profile?.managerStartDate,
    profile?.inceptionDate,
    profile?.alpha3Year,
    profile?.sharpe3Year,
    profile?.stdDev3Year,
    profile?.rSquared3Year,
    profile?.treynor3Year,
  ];
  if (!values.some((value) => value !== null && value !== undefined)) return null;

  const isEtf = item.type === "ETF";
  return (
    <section className="mt-10 rounded-xl border border-primary/20 bg-primary/[0.035] p-5 sm:p-6" aria-labelledby="official-investment-metrics">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {isEtf ? "ETF disclosures and fund statistics" : "Official fund disclosures"}
          </p>
          <h2 id="official-investment-metrics" className="mt-2 text-xl font-bold">
            {isEtf ? "Cost, benchmark, tracking and risk data" : "AMFI scheme, cost, benchmark and risk data"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Values below are shown only when DeepScreen can match them to the scheme from AMFI or the live fund-profile provider.
          </p>
        </div>
        {official?.sourceDate ? <span className="text-xs text-muted-foreground">AMFI reference: {official.sourceDate}</span> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Total expense ratio" value={pct(official?.terPct)} note={official?.terPct !== null && official?.terPct !== undefined ? "AMFI TER disclosure." : undefined} />
        <Metric label="Benchmark" value={official?.benchmark ?? null} />
        <Metric label="AUM" value={official?.aumCrore === null || official?.aumCrore === undefined ? null : `₹${number(official.aumCrore)} Cr`} />
        <Metric label="Tracking error" value={pct(official?.trackingErrorPct, 4)} />
        <Metric label="Tracking difference" value={pct(official?.trackingDifferencePct)} />
        <Metric label="Standard deviation" value={pct(official?.standardDeviationPct)} />
        <Metric label="Beta" value={number(official?.beta)} />
        <Metric label="Sharpe ratio" value={number(official?.sharpe)} />
        <Metric label="Treynor ratio" value={number(official?.treynor)} />
        <Metric label="Jensen's alpha" value={pct(official?.jensensAlphaPct)} />
        <Metric label="Information ratio" value={number(official?.informationRatio)} />
        <Metric label="Riskometer" value={official?.riskometer ?? null} />
        <Metric label="Launch / inception" value={official?.launchDate ?? profile?.inceptionDate ?? null} />
        <Metric label="Manager" value={profile?.managerName ?? null} />
        <Metric label="Manager start" value={profile?.managerStartDate ?? null} />
        <Metric label="Minimum investment" value={official?.minimumInvestment === null || official?.minimumInvestment === undefined ? null : `₹${number(official.minimumInvestment, 0)}`} />
        <Metric label="Exit load" value={official?.exitLoad ?? null} />
        <Metric label="1Y return" value={pct(official?.returns1yPct)} />
        <Metric label="3Y return" value={pct(official?.returns3yPct)} />
        <Metric label="5Y return" value={pct(official?.returns5yPct)} />
        <Metric label="Benchmark 1Y" value={pct(official?.benchmarkReturns1yPct)} />
        <Metric label="Benchmark 3Y" value={pct(official?.benchmarkReturns3yPct)} />
        <Metric label="Benchmark 5Y" value={pct(official?.benchmarkReturns5yPct)} />
        <Metric label="3Y alpha" value={number(profile?.alpha3Year)} />
        <Metric label="3Y Sharpe" value={number(profile?.sharpe3Year)} />
        <Metric label="3Y standard deviation" value={pct(profile?.stdDev3Year)} />
        <Metric label="3Y R-squared" value={number(profile?.rSquared3Year)} />
        <Metric label="3Y Treynor" value={number(profile?.treynor3Year)} />
      </div>

      {official?.objective ? (
        <div className="mt-5 rounded-lg border border-border bg-card/25 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scheme objective</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{official.objective}</p>
        </div>
      ) : null}
    </section>
  );
}
