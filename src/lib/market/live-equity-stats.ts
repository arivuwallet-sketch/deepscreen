import type { LiveFundamentals, LiveQuote } from "./yahoo.server";

export type LiveMarketCapSource = "quote-derived" | "provider" | "unavailable";

export interface LiveMarketCap {
  /** Local-currency billions, matching DeepScreen's Stock.marketCap unit. */
  value: number | null;
  source: LiveMarketCapSource;
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Build the freshest market cap available for a displayed stock row.
 *
 * Shares outstanding changes slowly, while price moves throughout the session,
 * so once the provider has supplied shares outstanding we recompute market cap
 * from every refreshed quote: latest price × reported shares outstanding.
 * Yahoo company-level figures are raw local-currency units; DeepScreen stores
 * market cap in local-currency billions, hence the 1e9 conversion.
 */
export function liveMarketCapBillions(
  quote: Pick<LiveQuote, "price"> | null | undefined,
  fundamentals:
    | Pick<LiveFundamentals, "sharesOutstanding" | "marketCap">
    | null
    | undefined,
): LiveMarketCap {
  if (positiveFinite(quote?.price) && positiveFinite(fundamentals?.sharesOutstanding)) {
    return {
      value: (quote.price * fundamentals.sharesOutstanding) / 1e9,
      source: "quote-derived",
    };
  }

  if (positiveFinite(fundamentals?.marketCap)) {
    return { value: fundamentals.marketCap / 1e9, source: "provider" };
  }

  return { value: null, source: "unavailable" };
}

/** Preserve a genuine zero-volume quote instead of falling back to seed data. */
export function liveQuoteVolume(
  quote: Pick<LiveQuote, "volume"> | null | undefined,
): number | null {
  const volume = quote?.volume;
  return typeof volume === "number" && Number.isFinite(volume) && volume >= 0 ? volume : null;
}
