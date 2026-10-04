export type PricePoint = { at: number; value: number };
export function cleanHistory(points: PricePoint[]): PricePoint[] {
  return [
    ...new Map(
      points
        .filter((p) => Number.isFinite(p.at) && Number.isFinite(p.value) && p.value > 0)
        .map((p) => [p.at, p]),
    ).values(),
  ].sort((a, b) => a.at - b.at);
}
export function historySummary(raw: PricePoint[]) {
  const points = cleanHistory(raw);
  const last = points.at(-1);
  const first = points[0];
  let peak = 0,
    drawdown = 0;
  for (const p of points) {
    peak = Math.max(peak, p.value);
    drawdown = Math.min(drawdown, p.value / peak - 1);
  }
  return {
    count: points.length,
    change: first && last && points.length > 1 ? (last.value / first.value - 1) * 100 : null,
    drawdown: points.length > 1 ? drawdown * 100 : null,
  };
}
/** Sample standard deviation of daily log returns, annualized with 252 sessions. */
export function realizedVolatility(raw: PricePoint[], sessions: number): number | null {
  const p = cleanHistory(raw).slice(-sessions - 1);
  if (p.length !== sessions + 1) return null;
  const returns = p.slice(1).map((v, i) => Math.log(v.value / p[i]!.value));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  return (
    Math.sqrt((returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1)) * 252) * 100
  );
}
