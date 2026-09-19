import { Link } from "@tanstack/react-router";
import type { Analysis } from "@/lib/deepscreen/metrics";
import type { Stock } from "@/lib/deepscreen/types";
import { cn } from "@/lib/utils";

export interface PeerRow {
  stock: Stock;
  analysis: Analysis;
  industry: string | null;
  exactIndustry: boolean;
}

type MetricKey = "score" | "growth" | "roe" | "roce" | "margin" | "de" | "pe";

const median = (values: number[]): number | null => {
  const clean = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[mid]! : (clean[mid - 1]! + clean[mid]!) / 2;
};

function metricValue(row: PeerRow, key: MetricKey): number {
  switch (key) {
    case "score": return row.analysis.score;
    case "growth": return row.stock.fundamentals.growth;
    case "roe": return row.stock.fundamentals.roe;
    case "roce": return row.stock.fundamentals.roce;
    case "margin": return row.stock.fundamentals.netMargin;
    case "de": return row.stock.fundamentals.debtToEquity;
    case "pe": return row.stock.fundamentals.pe;
  }
}

function formatMetric(key: MetricKey, value: number): string {
  if (key === "score") return value.toFixed(0);
  if (key === "pe" || key === "de") return value.toFixed(1) + "x";
  return value.toFixed(1) + "%";
}

function deltaText(key: MetricKey, value: number, peerMedian: number): string {
  const delta = value - peerMedian;
  const sign = delta >= 0 ? "+" : "";
  const suffix = key === "score" ? " pts" : key === "pe" || key === "de" ? "x" : " pp";
  return sign + delta.toFixed(key === "score" ? 0 : 1) + suffix;
}

export function PeerAnalysisPanel({
  stock,
  analysis,
  peers,
  targetIndustry,
  dataUpdatedAt,
}: {
  stock: Stock;
  analysis: Analysis;
  peers: PeerRow[];
  targetIndustry: string | null;
  dataUpdatedAt?: number;
}) {
  const targetRow: PeerRow = { stock, analysis, industry: targetIndustry, exactIndustry: true };
  const metrics: { key: MetricKey; label: string }[] = [
    { key: "score", label: "DeepScreen score" },
    { key: "growth", label: "Growth" },
    { key: "roe", label: "ROE" },
    { key: "roce", label: "ROCE" },
    { key: "margin", label: "Net margin" },
    { key: "de", label: "D/E" },
    { key: "pe", label: "P/E" },
  ];
  const medians = Object.fromEntries(
    metrics.map((m) => [m.key, median(peers.map((p) => metricValue(p, m.key)))]),
  ) as Record<MetricKey, number | null>;

  const scoreMedian = medians.score;
  const scoreDelta = scoreMedian === null ? null : analysis.score - scoreMedian;
  const exactCount = peers.filter((p) => p.exactIndustry).length;

  const summary = peers.length === 0
    ? "Peer fundamentals are still loading. The comparison will populate automatically when comparable company data arrives."
    : scoreDelta === null
      ? "DeepScreen is comparing " + stock.symbol + " with " + peers.length + " closest available listed peers."
      : stock.symbol + " scores " + analysis.score + "/100 versus a " + scoreMedian.toFixed(0) +
        "/100 peer median (" + (scoreDelta >= 0 ? "+" : "") + scoreDelta.toFixed(0) + " points). " +
        (exactCount > 0
          ? exactCount + " peer" + (exactCount === 1 ? "" : "s") + " match" + (exactCount === 1 ? "s" : "") + " the same provider-reported industry."
          : "The comparison uses same-sector peers because an exact provider-reported industry match is unavailable.");

  return (
    <section className="mt-6 rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Closest peer competitors</h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            {targetIndustry
              ? "Industry match: " + targetIndustry + ". Peers use the same regional market universe, same sector, provider-reported industry where available, and market-cap proximity."
              : "Peers use the same regional market universe, same sector and market-cap proximity until a provider-reported industry is available."}
          </p>
        </div>
        <div className="text-right">
          <span className="rounded border border-border px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            {peers.length ? peers.length + " peers" : "Loading"}
          </span>
          {dataUpdatedAt ? (
            <div className="mt-1 text-[9px] text-muted-foreground">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-4 rounded border border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        {summary}
      </p>

      {peers.length > 0 ? (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-xs">
              <thead className="bg-card text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Company</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right">Growth</th>
                  <th className="px-3 py-2 text-right">ROE</th>
                  <th className="px-3 py-2 text-right">ROCE</th>
                  <th className="px-3 py-2 text-right">Net margin</th>
                  <th className="px-3 py-2 text-right">D/E</th>
                  <th className="px-3 py-2 text-right">P/E</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border bg-primary/5 font-semibold">
                  <td className="px-3 py-2">
                    {stock.symbol}
                    <div className="text-[10px] font-normal text-muted-foreground">This company</div>
                  </td>
                  {metrics.map((m) => (
                    <td key={m.key} className="num px-3 py-2 text-right">
                      {formatMetric(m.key, metricValue(targetRow, m.key))}
                    </td>
                  ))}
                </tr>

                {peers.map((peer) => (
                  <tr key={peer.stock.exchange + ":" + peer.stock.symbol} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Link
                        to="/stock/$exchange/$symbol"
                        params={{ exchange: peer.stock.exchange, symbol: peer.stock.symbol }}
                        className="font-semibold hover:text-primary"
                      >
                        {peer.stock.symbol}
                      </Link>
                      <div className="max-w-[220px] truncate text-[10px] text-muted-foreground">{peer.stock.name}</div>
                      <span
                        className={cn(
                          "mt-1 inline-block rounded px-1.5 py-0.5 text-[9px]",
                          peer.exactIndustry ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {peer.exactIndustry ? "Industry match" : "Sector match"}
                      </span>
                    </td>
                    <td className="num px-3 py-2 text-right">{peer.analysis.score}</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.growth.toFixed(1)}%</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.roe.toFixed(1)}%</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.roce.toFixed(1)}%</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.netMargin.toFixed(1)}%</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.debtToEquity.toFixed(1)}x</td>
                    <td className="num px-3 py-2 text-right">{peer.stock.fundamentals.pe.toFixed(1)}x</td>
                  </tr>
                ))}

                <tr className="border-t border-border text-muted-foreground">
                  <td className="px-3 py-2 font-semibold">Peer median</td>
                  {metrics.map((m) => {
                    const med = medians[m.key];
                    return (
                      <td key={m.key} className="num px-3 py-2 text-right">
                        {med === null ? "—" : formatMetric(m.key, med)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.slice(0, 4).map((m) => {
              const med = medians[m.key];
              if (med === null) return null;
              const value = metricValue(targetRow, m.key);
              return (
                <div key={m.key} className="rounded border border-border p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">{m.label}</div>
                  <div className="num mt-1 text-lg font-semibold">{formatMetric(m.key, value)}</div>
                  <div className="num mt-1 text-[11px] text-muted-foreground">
                    vs peer median {formatMetric(m.key, med)} · {deltaText(m.key, value, med)}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
            This comparison is descriptive. It uses the latest available provider data and the DeepScreen model where applicable; reporting periods can differ, so peer medians should be interpreted alongside each source timestamp.
          </p>
        </>
      ) : null}
    </section>
  );
}
