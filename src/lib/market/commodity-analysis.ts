export const COMMODITY_SYMBOLS = ["GC=F", "SI=F", "CL=F", "NG=F", "HG=F"] as const;
export type CommoditySymbol = (typeof COMMODITY_SYMBOLS)[number];
export interface CommodityBar {
  time: number;
  close: number;
}
export interface CommodityQuote {
  symbol: string;
  price: number;
  previousClose: number | null;
  changePct: number | null;
  currency: string;
  asOf: string;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  exchange: string;
  sourceUrl: string;
  history: CommodityBar[];
  historyAsOf: string | null;
  cached: boolean;
}
export interface CommoditySnapshot {
  quotes: Record<string, CommodityQuote>;
  checkedAt: string;
  unavailable: string[];
}
const number = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
export function chartResult(payload: unknown, symbol: string): Record<string, unknown> | null {
  const chart = object(object(payload)["chart"]);
  const results = chart["result"];
  if (!Array.isArray(results) || chart["error"]) return null;
  const result = object(results[0]);
  return object(result["meta"])["symbol"] === symbol ? result : null;
}
export function parseHistory(result: Record<string, unknown> | null, now: number): CommodityBar[] {
  if (!result || !Array.isArray(result["timestamp"])) return [];
  const quotes = object(result["indicators"])["quote"];
  const close = Array.isArray(quotes) ? object(quotes[0])["close"] : null;
  if (!Array.isArray(close)) return [];
  const unique = new Map<number, CommodityBar>();
  result["timestamp"].forEach((raw, index) => {
    const time = number(raw),
      price = number(close[index]);
    if (time !== null && time > 0 && time * 1000 <= now + 300_000 && price !== null)
      unique.set(time, { time, close: price });
  });
  return [...unique.values()].sort((a, b) => a.time - b.time);
}
export function parseCommodityQuote(
  symbol: string,
  result: Record<string, unknown> | null,
  history: CommodityBar[],
  now: number,
): CommodityQuote | null {
  if (!result) return null;
  const meta = object(result["meta"]),
    price = number(meta["regularMarketPrice"]),
    time = number(meta["regularMarketTime"]);
  if (price === null || time === null || time <= 0 || time * 1000 > now + 300_000) return null;
  // Only call this with a one-day chart: chartPreviousClose on a multi-day
  // request is the start-of-range baseline, NOT the previous session close.
  const previousClose = number(meta["previousClose"]) ?? number(meta["chartPreviousClose"]);
  const high = number(meta["regularMarketDayHigh"]),
    low = number(meta["regularMarketDayLow"]);
  const validRange = high !== null && low !== null && high >= low;
  const rawVolume = number(meta["regularMarketVolume"]);
  return {
    symbol,
    price,
    previousClose,
    changePct:
      previousClose !== null && previousClose > 0
        ? ((price - previousClose) / previousClose) * 100
        : null,
    currency:
      typeof meta["currency"] === "string" && /^[A-Z]{3}$/.test(meta["currency"])
        ? meta["currency"]
        : "USD",
    asOf: new Date(time * 1000).toISOString(),
    dayHigh: validRange ? high : null,
    dayLow: validRange ? low : null,
    volume: rawVolume !== null && rawVolume >= 0 ? rawVolume : null,
    exchange: typeof meta["exchangeName"] === "string" ? meta["exchangeName"] : "",
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`,
    history,
    historyAsOf: history.length
      ? new Date(history[history.length - 1]!.time * 1000).toISOString()
      : null,
    cached: false,
  };
}
export function commodityAnalysis(history: CommodityBar[]) {
  const values = history.map((bar) => bar["close"]),
    last = values.at(-1);
  const average = (period: number) =>
    values.length >= period ? values.slice(-period).reduce((a, b) => a + b, 0) / period : null;
  const change = (period: number) => {
    const base = values.at(-period - 1);
    return last !== undefined && base !== undefined && base > 0
      ? ((last - base) / base) * 100
      : null;
  };
  let rsi: number | null = null;
  if (values.length >= 15) {
    let gain = 0,
      loss = 0;
    for (let i = 1; i <= 14; i++) {
      const d = values[i]! - values[i - 1]!;
      gain += Math.max(d, 0) / 14;
      loss += Math.max(-d, 0) / 14;
    }
    for (let i = 15; i < values.length; i++) {
      const d = values[i]! - values[i - 1]!;
      gain = (gain * 13 + Math.max(d, 0)) / 14;
      loss = (loss * 13 + Math.max(-d, 0)) / 14;
    }
    rsi = gain === 0 && loss === 0 ? 50 : loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  const sma20 = average(20),
    sma50 = average(50);
  const trend =
    last === undefined || sma20 === null || sma50 === null
      ? "Insufficient history"
      : last > sma20 && sma20 > sma50
        ? "Upward alignment"
        : last < sma20 && sma20 < sma50
          ? "Downward alignment"
          : "Mixed trend";
  return {
    sma20,
    sma50,
    rsi,
    change5: change(5),
    change20: change(20),
    trend,
    last: last ?? null,
    bars: values.length,
  };
}
