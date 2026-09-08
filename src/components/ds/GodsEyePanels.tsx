import type { Intel } from "@/lib/deepscreen/intel";
import { toneClass } from "@/lib/deepscreen/intel";
import { cn } from "@/lib/utils";

const fmt = (v: number | null, suffix = "") =>
  v === null ? "—" : `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;

export function VisionCard({ intel }: { intel: Intel }) {
  const v = intel.vision;
  const pct = Math.max(0, Math.min(100, v.score));
  const tone = pct >= 70 ? "text-bull" : pct >= 45 ? "text-warn" : "text-bear";
  const bar = pct >= 70 ? "bg-bull" : pct >= 45 ? "bg-warn" : "bg-bear";

  return (
    <div className="card-hover rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Vision &amp; utility score</h2>
        <span className="num rounded border border-border px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
          {v.horizonShort}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className={cn("num text-5xl font-bold", tone)}>{v.score}</span>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="num mt-1 text-xs text-muted-foreground">
            Long-horizon durability score / 100 · suggested hold {v.horizon}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.rationale}</p>
      <dl className="num mt-4 grid gap-y-1.5 text-xs sm:grid-cols-2">
        {v.parts.map((p) => (
          <div key={p.label} className="flex items-center justify-between gap-3 pr-4">
            <dt className="text-muted-foreground">{p.label}</dt>
            <dd>
              {p.points}/{p.max}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SecretTipsPanel({ intel }: { intel: Intel }) {
  return (
    <div className="card-hover rounded-lg border border-border bg-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide">Secret tips</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Pattern flags fired by the rule engine — hover a badge for the reasoning.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {intel.badges.length > 0 ? (
          intel.badges.map((b) => (
            <span
              key={b.id}
              title={b.tooltip}
              className={cn(
                "num cursor-help rounded border px-2.5 py-1 text-[11px] font-medium",
                toneClass[b.tone],
              )}
            >
              {b.label}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            No pattern rules triggered on the data available for this stock.
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreBlock({
  title,
  score,
}: {
  title: string;
  score: Intel["forensics"]["altman"];
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="num text-xs uppercase text-muted-foreground">{title}</p>
        <span
          className={cn(
            "num rounded border px-2 py-0.5 text-[10px] font-semibold uppercase",
            toneClass[score.tone],
          )}
        >
          {score.label}
        </span>
      </div>
      <p className="num mt-1 text-2xl font-bold">{score.value === null ? "—" : score.value}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{score.detail}</p>
    </div>
  );
}

export function ForensicPanel({ intel, locked = false }: { intel: Intel; locked?: boolean }) {
  const { piotroski, altman, beneish } = intel.forensics;
  return (
    <div className="card-hover rounded-lg border border-border bg-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide">God&apos;s Eye forensics</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Accounting quality and solvency screens. Anything that can&apos;t be computed from
        available filings data is left blank rather than estimated.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ScoreBlock title="Piotroski F-Score" score={piotroski} />
        <ScoreBlock title="Altman Z-Score" score={altman} />
        <ScoreBlock title="Beneish (earnings quality)" score={beneish} />
      </div>
      {piotroski.checks.length > 0 ? (
        <ul className="num mt-3 grid gap-1 text-[11px] sm:grid-cols-3">
          {piotroski.checks.map((c) => (
            <li key={c.label} className={c.pass ? "text-bull" : "text-muted-foreground"}>
              {c.pass ? "✓" : "×"} {c.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ExtendedRatiosPanel({ intel }: { intel: Intel }) {
  const r = intel.ratios;
  const d = intel.dupont;
  const rows: [string, string][] = [
    ["Operating margin (OPM)", fmt(r.operatingMargin, "%")],
    ["Net margin (NPM)", fmt(r.netMargin, "%")],
    ["Gross margin", fmt(r.grossMargin, "%")],
    ["Price / cash flow", fmt(r.priceToCashFlow, "x")],
    ["EV / EBITDA", fmt(r.evEbitda, "x")],
    ["Current ratio", fmt(r.currentRatio, "x")],
    ["Quick ratio", fmt(r.quickRatio, "x")],
    ["Interest coverage", fmt(r.interestCoverage, "x")],
    ["Asset turnover", fmt(r.assetTurnover, "x")],
    ["Inventory turnover", fmt(r.inventoryTurnover, "x")],
    ["Days sales of inventory", fmt(r.daysSalesInventory, " d")],
    ["Cash conversion (OCF / PAT)", fmt(r.cashConversion, "x")],
  ];

  return (
    <div className="card-hover rounded-lg border border-border bg-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide">Extended ratio set</h2>
      <dl className="num mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-border/50 pb-1">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded border border-border p-3">
        <p className="num text-xs uppercase text-muted-foreground">DuPont ROE breakdown</p>
        <p className="num mt-1 text-sm">
          {fmt(d.netMargin, "%")} margin × {fmt(d.assetTurnover, "x")} turnover ×{" "}
          {fmt(d.leverage, "x")} leverage = {fmt(d.impliedRoe, "%")} ROE
        </p>
        {d.model ? <p className="mt-1 text-[11px] text-muted-foreground">{d.model}</p> : null}
      </div>
    </div>
  );
}
