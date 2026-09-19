/**
 * EV/EBITDA safety helpers.
 *
 * A conventional EV/EBITDA multiple is only interpretable when both
 * enterprise value and EBITDA support a positive denominator/ratio. Negative
 * multiples are not "cheaper" multiples: they normally arise because EBITDA
 * is negative, or because enterprise value is negative. DeepScreen treats
 * non-positive values as not meaningful (N/M) instead of rewarding them.
 */

export function isMeaningfulEvEbitda(
  value: number | null | undefined,
): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function formatEvEbitda(
  value: number | null | undefined,
  digits = 1,
): string {
  return isMeaningfulEvEbitda(value) ? `${value.toFixed(digits)}x` : "N/M";
}

export function evEbitdaReading(
  value: number | null | undefined,
  isAssetLight: boolean,
): string {
  if (!isMeaningfulEvEbitda(value)) {
    return "Not meaningful — EBITDA or enterprise value does not support a positive multiple";
  }
  return isAssetLight
    ? value < 15
      ? "Low for asset-light"
      : value <= 25
        ? "Fair"
        : "High multiple — priced for exceptional growth"
    : value < 10
      ? "Low multiple"
      : value <= 15
        ? "Fair"
        : "High multiple";
}

export function evEbitdaTooltip(
  value: number | null | undefined,
  isAssetLight: boolean,
): string {
  if (!isMeaningfulEvEbitda(value)) {
    return "EV/EBITDA is not a meaningful positive multiple here. A negative value usually means EBITDA is negative; in some cases enterprise value itself is negative. DeepScreen shows N/M and does not reward the value in the score. Review enterprise value, EBITDA and free cash flow separately.";
  }
  return isAssetLight
    ? "Enterprise value divided by EBITDA. Asset-light, high-growth businesses can trade at higher multiples, so compare with close peers, growth and cash generation. Below 12x may look lower, but capex, stock-based compensation and business quality still matter."
    : "Enterprise value divided by EBITDA. Compare companies with similar business models and reporting periods. Lower positive multiples can indicate a lower valuation, but EBITDA is not free cash flow and recurring capital needs still matter.";
}
