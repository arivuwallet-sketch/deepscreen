import { getExchange } from "./exchanges";

export function currencySymbol(exchange: string): string {
  return getExchange(exchange)?.symbol ?? "$";
}

export function formatPrice(value: number, exchange: string): string {
  return `${currencySymbol(exchange)}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** marketCap is expressed in local-currency billions. */
export function formatCap(value: number, exchange: string): string {
  const s = currencySymbol(exchange);
  if (value >= 1000) return `${s}${(value / 1000).toFixed(2)}T`;
  if (value >= 1) return `${s}${value.toFixed(1)}B`;
  return `${s}${(value * 1000).toFixed(0)}M`;
}

export function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

export function formatAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const CAP_LABEL: Record<string, string> = {
  large: "Large Cap",
  mid: "Mid Cap",
  small: "Small Cap",
};
