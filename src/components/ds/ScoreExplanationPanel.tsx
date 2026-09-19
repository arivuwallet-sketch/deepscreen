import type { Analysis } from "@/lib/deepscreen/metrics";
import { ANALYSIS_WEIGHTS } from "@/lib/deepscreen/metrics";

function fmtScore(value: number): string {
  return value.toFixed(0);
}

export function ScoreExplanationPanel({ analysis }: { analysis: Analysis }) {
  const totalWeight = analysis.metrics.reduce(
    (sum, metric) => sum + (ANALYSIS_WEIGHTS[metric.key] ?? 1),
    0,
  );

  const ranked = analysis.metrics
    .map((metric) => ({
      ...metric,
      weight: ANALYSIS_WEIGHTS[metric.key] ?? 1,
      contribution: (metric.score * (ANALYSIS_WEIGHTS[metric.key] ?? 1)) / totalWeight,
    }))
    .sort((a, b) => b.score - a.score);

  const strongest = ranked.slice(0, 4);
  const weakest = [...ranked].reverse().slice(0, 4);

  return (
    <section className="mt-4 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Why this score?</h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            The {analysis.score}/100 score is a weighted average of 13 fundamental factors.
            This panel shows which factor scores contribute most to the current model result.
          </p>
        </div>
        <div className="num rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          Model explanation
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <DriverColumn title="Highest-scoring factors" items={strongest} />
        <DriverColumn title="Lowest-scoring factors" items={weakest} />
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Factor scores are model outputs, not forecasts. A high or low factor score describes
        how that metric is treated by the DeepScreen rules; review the underlying value and
        its source before drawing a broader conclusion.
      </p>
    </section>
  );
}

function DriverColumn({
  title,
  items,
}: {
  title: string;
  items: Array<Analysis["metrics"][number] & { weight: number; contribution: number }>;
}) {
  return (
    <div className="rounded border border-border p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.key}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium">{item.label}</span>
              <span className="num text-xs text-muted-foreground">
                {fmtScore(item.score)}/100 · {item.weight.toFixed(1)}× weight
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: String(Math.min(100, Math.max(0, item.score))) + "%" }}
              />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {item.reading}. Weighted contribution: {item.contribution.toFixed(1)} points.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
