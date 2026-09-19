import { useEffect, useState } from "react";
import { ANALYSIS_WEIGHTS, type Analysis } from "@/lib/deepscreen/metrics";
import type { LiveFundamentals } from "@/lib/market/yahoo.server";

interface Snapshot {
  quarter: string;
  score: number;
  metrics: Record<string, number>;
  fundamentals: {
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    roe: number;
    roce: number;
    netMargin: number;
    debtToEquity: number;
    pe: number;
  };
}

interface StoredSnapshots {
  current?: Snapshot;
  previous?: Snapshot;
}

interface Category {
  id: "growth" | "profitability" | "balance" | "valuation";
  label: string;
  weightKeys: string[];
}

const CATEGORIES: Category[] = [
  { id: "growth", label: "Growth", weightKeys: ["peg", "oplev"] },
  { id: "profitability", label: "Profitability", weightKeys: ["roe", "roa", "roce", "payout"] },
  { id: "balance", label: "Balance Sheet", weightKeys: ["de", "ltde"] },
  {
    id: "valuation",
    label: "Valuation",
    weightKeys: ["pe", "ps", "pb", "evRevenue", "evEbitda"],
  },
];

function quarterKey(date = new Date()): string {
  return date.getFullYear() + "-Q" + (Math.floor(date.getMonth() / 3) + 1);
}

function snapshotFor(analysis: Analysis, liveFundamentals: LiveFundamentals | null | undefined): Snapshot {
  return {
    quarter: quarterKey(),
    score: analysis.score,
    metrics: Object.fromEntries(analysis.metrics.map((metric) => [metric.key, metric.score])),
    fundamentals: {
      revenueGrowth: liveFundamentals?.revenueGrowth ?? null,
      earningsGrowth: liveFundamentals?.earningsGrowth ?? null,
      roe: analysis.metrics.find((m) => m.key === "roe")?.value ?? 0,
      roce: analysis.metrics.find((m) => m.key === "roce")?.value ?? 0,
      netMargin: liveFundamentals?.netMargin ?? 0,
      debtToEquity: analysis.metrics.find((m) => m.key === "de")?.value ?? 0,
      pe: analysis.metrics.find((m) => m.key === "pe")?.value ?? 0,
    },
  };
}

function storageKey(exchange: string, symbol: string): string {
  return "deepscreen:quarterly-score:" + exchange.toLowerCase() + ":" + symbol.toLowerCase();
}

function readStored(key: string): StoredSnapshots | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSnapshots;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: StoredSnapshots): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing/storage-disabled environments simply skip the baseline.
  }
}

function categoryDelta(
  category: Category,
  current: Snapshot,
  previous: Snapshot,
  totalWeight: number,
): number {
  return category.weightKeys.reduce((sum, key) => {
    const currentScore = current.metrics[key];
    const previousScore = previous.metrics[key];
    if (!Number.isFinite(currentScore) || !Number.isFinite(previousScore)) return sum;
    const weight = ANALYSIS_WEIGHTS[key] ?? 1;
    return sum + ((currentScore - previousScore) * weight) / totalWeight;
  }, 0);
}

function signed(value: number, digits = 0): string {
  return (value >= 0 ? "+" : "−") + Math.abs(value).toFixed(digits);
}

function growthDetail(current: Snapshot, previous: Snapshot): string {
  const parts: string[] = [];
  const rgNow = current.fundamentals.revenueGrowth;
  const rgThen = previous.fundamentals.revenueGrowth;
  const egNow = current.fundamentals.earningsGrowth;
  const egThen = previous.fundamentals.earningsGrowth;

  if (rgNow !== null && rgThen !== null) {
    parts.push(
      "Revenue growth " +
        (rgNow >= rgThen ? "increased" : "decreased") +
        " from " +
        rgThen.toFixed(1) +
        "% to " +
        rgNow.toFixed(1) +
        "%.",
    );
  }
  if (egNow !== null && egThen !== null) {
    parts.push(
      "Earnings growth " +
        (egNow >= egThen ? "increased" : "decreased") +
        " from " +
        egThen.toFixed(1) +
        "% to " +
        egNow.toFixed(1) +
        "%.",
    );
  }
  return parts.length ? parts.join(" ") : "Revenue and earnings growth data was not available in both quarterly snapshots.";
}

function profitabilityDetail(current: Snapshot, previous: Snapshot): string {
  const parts: string[] = [];
  const deltas = [
    ["ROCE", current.fundamentals.roce, previous.fundamentals.roce, "%"],
    ["net margin", current.fundamentals.netMargin, previous.fundamentals.netMargin, "%"],
  ] as const;
  for (const [label, now, then, suffix] of deltas) {
    const direction = now >= then ? "improved" : "declined";
    parts.push(label + " " + direction + " from " + then.toFixed(1) + suffix + " to " + now.toFixed(1) + suffix + ".");
  }
  return parts.join(" ");
}

function balanceDetail(current: Snapshot, previous: Snapshot): string {
  const now = current.fundamentals.debtToEquity;
  const then = previous.fundamentals.debtToEquity;
  return "Debt/equity " + (now <= then ? "declined" : "increased") + " from " + then.toFixed(2) + "x to " + now.toFixed(2) + "x.";
}

function valuationDetail(current: Snapshot, previous: Snapshot): string {
  const now = current.fundamentals.pe;
  const then = previous.fundamentals.pe;
  return "P/E " + (now >= then ? "expanded" : "contracted") + " from " + then.toFixed(1) + "x to " + now.toFixed(1) + "x.";
}

export function ScoreChangePanel({
  exchange,
  symbol,
  analysis,
  liveFundamentals,
}: {
  exchange: string;
  symbol: string;
  analysis: Analysis;
  liveFundamentals?: LiveFundamentals | null;
}) {
  const [previous, setPrevious] = useState<Snapshot | null>(null);
  const [currentQuarter, setCurrentQuarter] = useState<string | null>(null);

  useEffect(() => {
    const key = storageKey(exchange, symbol);
    const now = snapshotFor(analysis, liveFundamentals);
    const existing = readStored(key);

    let next: StoredSnapshots;
    if (existing?.current?.quarter === now.quarter) {
      next = existing;
    } else {
      next = {
        previous: existing?.current ?? existing?.previous,
        current: now,
      };
      writeStored(key, next);
    }

    setPrevious(next.previous ?? null);
    setCurrentQuarter(now.quarter);
  }, [analysis, exchange, liveFundamentals, symbol]);

  if (!currentQuarter) return null;

  const current = snapshotFor(analysis, liveFundamentals);
  if (!previous) {
    return (
      <section className="mt-4 rounded-lg border border-border bg-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide">Why did this stock's score change?</h2>
            <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
              DeepScreen is now saving a quarterly fundamentals snapshot for this stock. The first
              quarter-to-quarter change will appear after a new quarterly snapshot is available on this device.
            </p>
          </div>
          <span className="num rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            {currentQuarter} baseline collecting
          </span>
        </div>
      </section>
    );
  }

  const totalWeight = Object.values(ANALYSIS_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const scoreDelta = current.score - previous.score;
  const rawDeltas = CATEGORIES.map((category) => ({
    ...category,
    value: categoryDelta(category, current, previous, totalWeight),
  }));

  const rounded = rawDeltas.map((item) => Math.round(item.value));
  const roundingGap = scoreDelta - rounded.reduce((sum, value) => sum + value, 0);
  if (roundingGap !== 0) {
    const largest = rawDeltas.reduce(
      (best, item, index) => Math.abs(item.value) > Math.abs(rawDeltas[best]!.value) ? index : best,
      0,
    );
    rounded[largest] = (rounded[largest] ?? 0) + roundingGap;
  }

  const details: Record<Category["id"], string> = {
    growth: growthDetail(current, previous),
    profitability: profitabilityDetail(current, previous),
    balance: balanceDetail(current, previous),
    valuation: valuationDetail(current, previous),
  };

  return (
    <section className="mt-4 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Why did this stock's score change?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Quarterly model comparison for {symbol}. This uses a saved snapshot from the prior quarter
            rather than a paid historical market-data series.
          </p>
        </div>
        <div className="text-right">
          <div className="num text-2xl font-bold">
            {current.score}{" "}
            <span className={scoreDelta >= 0 ? "text-bull" : "text-bear"}>
              {scoreDelta >= 0 ? "↑" : "↓"} {Math.abs(scoreDelta)} points
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            since {previous.quarter} snapshot · current {currentQuarter}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rawDeltas.map((category, index) => {
          const delta = rounded[index] ?? 0;
          const positive = delta > 0;
          const negative = delta < 0;
          return (
            <div key={category.id} className="rounded border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{category.label}</span>
                <span
                  className={
                    positive
                      ? "num font-semibold text-bull"
                      : negative
                        ? "num font-semibold text-bear"
                        : "num font-semibold text-muted-foreground"
                  }
                >
                  {signed(delta)}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{details[category.id]}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        The point changes are attributed to the weighted DeepScreen factor scores. The quarterly
        baseline is saved locally on this device, so it becomes more useful as each quarter is observed.
      </p>
    </section>
  );
}
