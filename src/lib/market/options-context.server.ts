import { realizedVolatility, cleanHistory, type PricePoint } from "./history-analysis.ts";
export type OptionsContext = {
  symbol: string;
  currency: string;
  price: number | null;
  asOf: string | null;
  checkedAt: string;
  points: PricePoint[];
  volatility20: number | null;
  volatility60: number | null;
  sourceUrl: string;
  error: boolean;
};
const cache = new Map<string, { at: number; data: OptionsContext }>();
const pending = new Map<string, Promise<OptionsContext>>();
export function parseOptionsContext(
  payload: unknown,
  symbol: string,
  now = Date.now(),
): OptionsContext {
  const empty: OptionsContext = {
    symbol,
    currency: "",
    price: null,
    asOf: null,
    checkedAt: new Date(now).toISOString(),
    points: [],
    volatility20: null,
    volatility60: null,
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history/`,
    error: true,
  };
  const json = payload as {
    chart?: {
      result?: Array<{
        meta?: Record<string, unknown>;
        timestamp?: number[];
        indicators?: {
          adjclose?: Array<{ adjclose?: (number | null)[] }>;
          quote?: Array<{ close?: (number | null)[] }>;
        };
      }>;
      error?: unknown;
    };
  } | null;
  const result = json?.chart?.result?.[0],
    meta = result?.meta;
  if (!meta || meta["symbol"] !== symbol || json?.chart?.error) return empty;
  const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const currency = typeof meta["currency"] === "string" ? meta["currency"] : "";
  const scale = currency === "GBp" || currency === "GBX" ? 100 : 1;
  const adjusted = result?.indicators?.adjclose?.[0]?.adjclose;
  const prices = adjusted?.some((v) => finite(v) && v > 0)
    ? adjusted
    : (result?.indicators?.quote?.[0]?.close ?? []);
  const points = cleanHistory(
    (result?.timestamp ?? []).flatMap((at, i) =>
      finite(at) && at * 1000 <= now && finite(prices[i]) && prices[i]! > 0
        ? [{ at: at * 1000, value: prices[i]! / scale }]
        : [],
    ),
  );
  const time = meta["regularMarketTime"],
    price = meta["regularMarketPrice"];
  const validQuote =
    finite(time) && time > 0 && time * 1000 <= now + 300000 && finite(price) && price > 0;
  const vol = (n: number) => {
    const p = points.slice(-n - 1);
    return p.some((v, i) => i > 0 && v.at - p[i - 1]!.at > 10 * 86400000)
      ? null
      : realizedVolatility(p, n);
  };
  return {
    ...empty,
    currency: scale === 100 ? "GBP" : currency,
    price: validQuote ? price / scale : null,
    asOf: validQuote ? new Date(time * 1000).toISOString() : null,
    points,
    volatility20: vol(20),
    volatility60: vol(60),
    error: !validQuote && !points.length,
  };
}
export async function fetchOptionsContext(market: string, code: string): Promise<OptionsContext> {
  if (
    !["NSE", "BSE", "NYSE", "NASDAQ", "LSE"].includes(market) ||
    !/^[A-Z0-9^][A-Z0-9.^&=-]{0,24}$/.test(code)
  )
    throw new Error("Unsupported underlying");
  const symbol =
    code + (market === "NSE" ? ".NS" : market === "BSE" ? ".BO" : market === "LSE" ? ".L" : "");
  const prior = cache.get(symbol);
  if (prior && Date.now() - prior.at < 60000) return prior.data;
  const running = pending.get(symbol);
  if (running) return running;
  const task = (async () => {
    let data = parseOptionsContext(null, symbol);
    for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"])
      try {
        const res = await fetch(
          `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`,
          {
            headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
            signal: AbortSignal.timeout(7000),
          },
        );
        if (!res.ok) continue;
        data = parseOptionsContext(await res.json(), symbol);
        if (!data.error) break;
      } catch {
        /* Preserve explicit unavailable state, never use directory sample prices. */
      }
    if (cache.size >= 200) cache.delete(cache.keys().next().value!);
    cache.set(symbol, { at: Date.now(), data });
    return data;
  })();
  pending.set(symbol, task);
  try {
    return await task;
  } finally {
    pending.delete(symbol);
  }
}
