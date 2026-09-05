import type { ScreenerRatios } from "./screener.server";

export interface CachedScreenerRatio {
  exchange: "NSE" | "BSE";
  symbol: string;
  resolvedSlug: string | null;
  data: ScreenerRatios;
  fetchedAt: number;
}

export async function readScreenerCache(
  keys: { exchange: string; symbol: string }[],
): Promise<Map<string, CachedScreenerRatio>> {
  const out = new Map<string, CachedScreenerRatio>();
  if (keys.length === 0) return out;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const symbols = [...new Set(keys.map((key) => key.symbol))];
    const { data, error } = await supabaseAdmin
      .from("screener_ratios")
      .select("exchange,symbol,resolved_slug,ratios,fetched_at")
      .in("symbol", symbols);
    if (error) throw error;

    for (const row of data ?? []) {
      out.set(`${row.exchange}:${row.symbol}`, {
        exchange: row.exchange as "NSE" | "BSE",
        symbol: row.symbol,
        resolvedSlug: row.resolved_slug,
        data: row.ratios as unknown as ScreenerRatios,
        fetchedAt: new Date(row.fetched_at).getTime(),
      });
    }
  } catch (error) {
    console.error("[screener-cache] read failed", error);
  }

  return out;
}

export async function writeScreenerCache(rows: CachedScreenerRatio[]): Promise<void> {
  if (rows.length === 0) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("screener_ratios").upsert(
      rows.map((row) => ({
        exchange: row.exchange,
        symbol: row.symbol,
        resolved_slug: row.resolvedSlug,
        ratios: row.data,
        fetched_at: new Date(row.fetchedAt).toISOString(),
      })),
      { onConflict: "exchange,symbol" },
    );
    if (error) throw error;
  } catch (error) {
    console.error("[screener-cache] write failed", error);
  }
}