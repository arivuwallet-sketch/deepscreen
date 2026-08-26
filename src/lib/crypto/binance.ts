export interface Candle {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  changePct: number;
  high: number;
  low: number;
  quoteVolume: number;
}

/** Public Binance market-data mirror: no key, CORS-open, read-only. */
const BASE = "https://data-api.binance.vision";

export const INTERVALS = ["5m", "15m", "1h", "4h", "1d"] as const;
export type Interval = (typeof INTERVALS)[number];

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Binance request failed (${res.status})`);
  return (await res.json()) as T;
}

const QUOTES = ["USDT", "FDUSD", "USDC", "BTC", "ETH"];

function splitPair(symbol: string): { base: string; quote: string } | null {
  for (const q of QUOTES) {
    if (symbol.endsWith(q) && symbol.length > q.length) {
      return { base: symbol.slice(0, -q.length), quote: q };
    }
  }
  return null;
}

export async function fetchTickers(): Promise<Ticker[]> {
  const raw = await get<
    {
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      quoteVolume: string;
    }[]
  >("/api/v3/ticker/24hr");

  const out: Ticker[] = [];
  for (const t of raw) {
    const parts = splitPair(t.symbol);
    if (!parts) continue;
    const price = Number(t.lastPrice);
    if (!Number.isFinite(price) || price <= 0) continue;
    out.push({
      symbol: t.symbol,
      base: parts.base,
      quote: parts.quote,
      price,
      changePct: Number(t.priceChangePercent),
      high: Number(t.highPrice),
      low: Number(t.lowPrice),
      quoteVolume: Number(t.quoteVolume),
    });
  }
  return out.sort((a, b) => b.quoteVolume - a.quoteVolume);
}

export async function fetchCandles(symbol: string, interval: Interval, limit = 300): Promise<Candle[]> {
  const raw = await get<(string | number)[][]>(
    `/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`,
  );
  return raw.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }));
}

export function formatUsd(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const d = v >= 1000 ? 2 : v >= 1 ? 4 : v >= 0.01 ? 5 : 8;
  return v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function formatCompact(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(2);
}
