import { useMemo, useState } from "react";
import { cleanHistory, historySummary, type PricePoint } from "@/lib/market/history-analysis";
const fmt = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v);
export function HistoryChart({ points, label }: { points: PricePoint[]; label: string }) {
  const [range, setRange] = useState(365);
  const [selected, setSelected] = useState<number | null>(null);
  const all = useMemo(() => cleanHistory(points), [points]);
  const last = all.at(-1);
  const shown = all.filter((p) => !range || p.at >= (last?.at ?? 0) - range * 86400000);
  if (shown.length < 2)
    return (
      <p className="mt-5 text-sm text-muted-foreground">
        Historical observations are currently unavailable.
      </p>
    );
  const min = Math.min(...shown.map((p) => p.value)),
    max = Math.max(...shown.map((p) => p.value));
  const x = (i: number) => 10 + (i / (shown.length - 1)) * 780;
  const y = (v: number) => 190 - ((v - min) / (max - min || 1)) * 170;
  const index = Math.min(selected ?? shown.length - 1, shown.length - 1),
    point = shown[index]!;
  const summary = historySummary(shown);
  return (
    <section className="mt-6 rounded-xl border border-border bg-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{label}</h3>
        <div className="flex gap-2">
          {[
            [90, "3M"],
            [365, "1Y"],
            [1096, "3Y"],
            [0, "All"],
          ].map(([n, text]) => (
            <button
              type="button"
              key={n}
              aria-pressed={range === n}
              onClick={() => {
                setRange(Number(n));
                setSelected(null);
              }}
              className={`rounded border border-border px-3 py-2 text-xs ${range === n ? "bg-primary text-primary-foreground" : ""}`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-sm">
        {new Date(point.at).toISOString().slice(0, 10)} · {fmt(point.value)}
      </p>
      <svg viewBox="0 0 800 210" role="img" aria-label={label} className="mt-3 w-full text-primary">
        <title>{label}</title>
        {[20, 105, 190].map((v) => (
          <line key={v} x1="10" x2="790" y1={v} y2={v} stroke="currentColor" opacity=".12" />
        ))}
        <path
          d={shown
            .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(p.value).toFixed(2)}`)
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx={x(index)} cy={y(point.value)} r="4" fill="currentColor" />
      </svg>
      <div className="flex justify-between gap-3 text-xs text-muted-foreground">
        <span>Low {fmt(min)}</span>
        <span>High {fmt(max)}</span>
      </div>
      <label className="mt-3 block text-xs text-muted-foreground">
        Inspect history
        <input
          aria-label="Inspect history"
          type="range"
          min="0"
          max={shown.length - 1}
          value={index}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <p>
          Period change <strong className="block">{summary.change?.toFixed(2)}%</strong>
        </p>
        <p>
          Observed drawdown <strong className="block">{summary.drawdown?.toFixed(2)}%</strong>
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {shown.length} observations · {new Date(shown[0]!.at).toISOString().slice(0, 10)} to{" "}
        {new Date(last!.at).toISOString().slice(0, 10)}. Calculated over displayed observations;
        missing dates are not interpolated. Latest bar may be incomplete.
      </p>
    </section>
  );
}
