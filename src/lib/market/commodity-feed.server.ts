import {
  COMMODITY_SYMBOLS,
  chartResult,
  parseHistory,
  parseCommodityQuote,
} from "./commodity-analysis.ts";
import type { CommodityQuote, CommoditySnapshot, CommodityBar } from "./commodity-analysis.ts";

const TTL = 60_000,
  RETAIN = 7 * 24 * 60 * 60_000;
let snapshot: CommoditySnapshot | null = null;
let expires = 0;
let pending: Promise<CommoditySnapshot> | null = null;
const histories = new Map<string, { bars: CommodityBar[]; fetched: number }>();

async function chart(symbol: string, interval: string, range: string) {
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const response = await fetch(
        `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
        {
          headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
          signal: AbortSignal.timeout(host.startsWith("query1.") ? 9000 : 5000),
        },
      );
      if (!response.ok) continue;
      const result = chartResult(await response.json(), symbol);
      if (result) return result;
    } catch {
      /* Retry the provider's second chart host, then expose an outage. */
    }
  }
  return null;
}

export async function fetchCommoditySnapshot(): Promise<CommoditySnapshot> {
  if (snapshot && Date.now() < expires) return snapshot;
  if (pending) return pending;
  pending = (async () => {
    const now = Date.now();
    const quotes: Record<string, CommodityQuote> = {};
    await Promise.all(
      COMMODITY_SYMBOLS.map(async (symbol) => {
        const cachedHistory = histories.get(symbol);
        const [intraday, daily] = await Promise.all([
          chart(symbol, "5m", "1d"),
          cachedHistory && now - cachedHistory.fetched < 15 * 60_000
            ? Promise.resolve(null)
            : chart(symbol, "1d", "3mo"),
        ]);
        const bars = parseHistory(daily, now);
        if (bars.length) histories.set(symbol, { bars, fetched: now });
        const prior = histories.get(symbol);
        const history = prior && now - prior.fetched < RETAIN ? prior.bars : [];
        const current = parseCommodityQuote(symbol, intraday, history, now);
        if (current) quotes[symbol] = current;
        else {
          const previous = snapshot?.quotes[symbol];
          if (previous && now - Date.parse(previous.asOf) < RETAIN)
            quotes[symbol] = { ...previous, cached: true };
        }
      }),
    );
    const result = {
      quotes,
      checkedAt: new Date().toISOString(),
      unavailable: COMMODITY_SYMBOLS.filter((symbol) => !quotes[symbol] || quotes[symbol]!.cached),
    };
    snapshot = result;
    expires = Date.now() + (result.unavailable.length ? 15_000 : TTL);
    return result;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}
