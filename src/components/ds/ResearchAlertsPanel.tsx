import type { Analysis } from "@/lib/deepscreen/metrics";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";
import { buildResearchSignals } from "@/lib/deepscreen/research-signals";
import { cn } from "@/lib/utils";

export function ResearchAlertsPanel({
  stock,
  analysis,
  liveFundamentals,
}: {
  stock: Stock;
  analysis: Analysis;
  liveFundamentals?: LiveFundamentals | null;
}) {
  const signals = buildResearchSignals(stock, analysis, liveFundamentals);

  return (
    <section className="mt-4 rounded-lg border border-border bg-panel p-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide">Current research alerts</h2>
        <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
          Threshold-based research checks from the latest available fundamentals. These are on-page
          signals, not push notifications or predictions.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className={cn(
              "rounded border p-3",
              signal.tone === "attention" && "border-bear/30 bg-bear/5",
              signal.tone === "context" && "border-warn/30 bg-warn/5",
              signal.tone === "positive" && "border-bull/30 bg-bull/5",
            )}
          >
            <div className="text-xs font-semibold">{signal.title}</div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{signal.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Signals are intended to highlight questions for research, not replace company filings or
        independent review.
      </p>
    </section>
  );
}
