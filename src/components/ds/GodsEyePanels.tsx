import type { Intel } from "@/lib/deepscreen/intel";
import { toneClass } from "@/lib/deepscreen/intel";
import { ProMetricValue } from "@/components/ds/PaywallGate";
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
  const x = intel.xray;
  const grouped = ([
    "Profitability",
    "Valuation",
    "Solvency",
    "Capital Allocation",
  ] as const).map((category) => ({
    category,
    cards: x.cards.filter((card) => card.category === category),
  }));

  const statusClass: Record<string, string> = {
    quality: "border-bull/40 bg-bull/10 text-bull",
    growth: "border-teal-400/40 bg-teal-500/10 text-teal-300",
    engineering: "border-orange-400/40 bg-orange-500/10 text-orange-300",
    destroyer: "border-bear/40 bg-bear/10 text-bear",
    trap: "border-indigo-400/40 bg-indigo-500/10 text-indigo-300",
    info: "border-border bg-muted/40 text-muted-foreground",
  };

  const warningClass: Record<string, string> = {
    bad: "border-bear/40 bg-bear/10 text-bear",
    warn: "border-warn/40 bg-warn/10 text-warn",
    trap: "border-indigo-400/40 bg-indigo-500/10 text-indigo-300",
    info: "border-border bg-muted/30 text-muted-foreground",
  };

  return (
    <section className="rounded-xl border border-border bg-panel p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide">DeepScreen Secret Tips</h2>
            {x.sectorLabel ? (
              <span className="num rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                {x.sectorLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            X-Ray classification engine: five forensic states, sector-aware overlays and ratio-level theses.
            Hover any badge for the plain-English reasoning.
          </p>
        </div>
        <span
          title={x.primary.tooltip}
          className={cn(
            "num cursor-help rounded-full border px-3 py-1.5 text-[11px] font-semibold",
            statusClass[x.primary.status],
          )}
        >
          {x.primary.label}
        </span>
      </div>

      {x.warnings.length > 0 ? (
        <div className="mt-4 space-y-2">
          {x.warnings.map((warning) => (
            <div
              key={warning.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs leading-relaxed",
                warningClass[warning.tone],
              )}
            >
              {warning.message}
            </div>
          ))}
        </div>
      ) : null}

      {(() => {
        const suppressed = new Set(["value-creator", "wealth-destroyer", "ev-rev", "ev-ebitda-good", "ev-ebitda-rich", "roe-trap", "pure-quality", "paper-profits"]);
        const uniqueFlags = intel.badges.filter((badge) => !suppressed.has(badge.id));
        if (uniqueFlags.length === 0) return null;
        return (
          <div className="mt-5 border-t border-border pt-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Additional pattern flags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {uniqueFlags.map((badge) => (
                <span key={badge.id} title={badge.tooltip} className={cn("num cursor-help rounded border px-2.5 py-1 text-[11px] font-medium", toneClass[badge.tone])}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        );
      })()}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {grouped.map(({ category, cards }) => (
          <div key={category} className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">{category}</h3>
              <span className="num text-[10px] text-muted-foreground">{cards.length} signals</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.id}
                  title={card.tooltip}
                  className="group rounded-lg border border-border bg-background/40 p-3 transition-colors hover:border-primary/30 hover:bg-accent/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {card.metric}
                      </p>
                      <p className="num mt-1 text-xl font-bold">{card.value}</p>
                    </div>
                    <span
                      className={cn(
                        "num shrink-0 rounded border px-2 py-1 text-[9px] font-semibold leading-tight",
                        statusClass[card.tone],
                      )}
                    >
                      {card.badge}
                    </span>
                  </div>
                  {card.sectorRelative ? (
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-primary">Sector Relative</p>
                  ) : null}
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground line-clamp-3">
                    {card.tooltip}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
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
        locked ? (
          <p className="mt-3 rounded border border-dashed border-border p-3 text-[11px] text-muted-foreground">
            Scores are free. The criteria-by-criteria breakdown — exactly which checks this
            company failed — is part of DeepScreen Pro.
          </p>
        ) : (
          <ul className="num mt-3 grid gap-1 text-[11px] sm:grid-cols-3">
            {piotroski.checks.map((c) => (
              <li key={c.label} className={c.pass ? "text-bull" : "text-muted-foreground"}>
                {c.pass ? "✓" : "×"} {c.label}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

export function ExtendedRatiosPanel({ intel }: { intel: Intel }) {
  const r = intel.ratios;
  const d = intel.dupont;
  const rows: [string, string, boolean][] = [
    ["Operating margin (OPM)", fmt(r.operatingMargin, "%"), false],
    ["Net margin (NPM)", fmt(r.netMargin, "%"), false],
    ["Gross margin", fmt(r.grossMargin, "%"), false],
    ["Price / cash flow", fmt(r.priceToCashFlow, "x"), false],
    ["EV / EBITDA", fmt(r.evEbitda, "x"), true],
    ["Current ratio", fmt(r.currentRatio, "x"), false],
    ["Quick ratio", fmt(r.quickRatio, "x"), false],
    ["Interest coverage", fmt(r.interestCoverage, "x"), false],
    ["Asset turnover", fmt(r.assetTurnover, "x"), false],
    ["Inventory turnover", fmt(r.inventoryTurnover, "x"), false],
    ["Days sales of inventory", fmt(r.daysSalesInventory, " d"), false],
    ["Cash conversion (OCF / PAT)", fmt(r.cashConversion, "x"), false],
  ];

  return (
    <div className="card-hover rounded-lg border border-border bg-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide">Extended ratio set</h2>
      <dl className="num mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value, locked]) => (
          <div key={label} className="flex items-center justify-between border-b border-border/50 pb-1">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{locked ? <ProMetricValue value={value} /> : value}</dd>
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
