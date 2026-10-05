import { STOCKS } from "@/lib/deepscreen/stocks";
import type { Stock } from "@/lib/deepscreen/types";
import type { LiveQuote } from "./yahoo.server";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const ALLOWED_EXCHANGES = ["NSE", "BSE", "NYSE", "NASDAQ", "LSE"] as const;
type DeepExchange = (typeof ALLOWED_EXCHANGES)[number];

type YahooGroup = {
  id: "india" | "us" | "uk";
  deep: DeepExchange[];
  yahoo: string[];
};

const GROUPS: YahooGroup[] = [
  { id: "india", deep: ["NSE", "BSE"], yahoo: ["NSI", "BSE"] },
  { id: "us", deep: ["NYSE", "NASDAQ"], yahoo: ["NYQ", "NAS", "NMS", "NGM", "NCM"] },
  { id: "uk", deep: ["LSE"], yahoo: ["LSE"] },
];

const YAHOO_TO_DEEP: Record<string, DeepExchange> = {
  NSI: "NSE",
  BSE: "BSE",
  NYQ: "NYSE",
  NAS: "NASDAQ",
  NMS: "NASDAQ",
  NGM: "NASDAQ",
  NCM: "NASDAQ",
  LSE: "LSE",
};

interface Session {
  cookie: string;
  crumb: string;
  at: number;
}

let session: Session | null = null;

async function getSession(): Promise<Session | null> {
  if (session && Date.now() - session.at < 30 * 60_000) return session;
  try {
    const cookieResponse = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8_000),
    });
    const rawCookie = cookieResponse.headers.get("set-cookie") ?? "";
    const cookie = rawCookie
      .split(/,(?=[^;]+=[^;]+)/)
      .map((value) => value.split(";")[0]!.trim())
      .filter(Boolean)
      .join("; ");
    if (!cookie) return null;

    const crumbResponse = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(8_000),
    });
    const crumb = (await crumbResponse.text()).trim();
    if (!crumb || crumb.length > 64) return null;

    session = { cookie, crumb, at: Date.now() };
    return session;
  } catch {
    return null;
  }
}

type Raw = Record<string, unknown>;

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && value !== null && "raw" in (value as Raw)) {
    const raw = (value as Raw).raw;
    return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isPence(currency: string): boolean {
  return currency === "GBp" || currency.toUpperCase() === "GBX";
}

function normalizedProviderSymbol(symbol: string): string {
  return symbol
    .trim()
    .toUpperCase()
    .replace(/\.(NS|BO|L)$/i, "");
}

function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/\b(THE|LIMITED|LTD|PLC|INCORPORATED|INC|CORPORATION|CORP|COMPANY|CO)\b/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildStockIndexes(exchanges: Set<DeepExchange>) {
  const byKey = new Map<string, Stock>();
  const byName = new Map<string, Stock | null>();

  for (const stock of STOCKS) {
    if (!exchanges.has(stock.exchange as DeepExchange)) continue;
    byKey.set(`${stock.exchange}:${stock.symbol.toUpperCase()}`, stock);

    const nameKey = `${stock.exchange}:${normalizeName(stock.name)}`;
    const current = byName.get(nameKey);
    if (current === undefined) byName.set(nameKey, stock);
    else if (current && current.symbol !== stock.symbol) byName.set(nameKey, null);
  }

  return { byKey, byName };
}

function resolveStock(
  raw: Raw,
  wanted: Set<DeepExchange>,
  indexes: ReturnType<typeof buildStockIndexes>,
): Stock | null {
  const exchange = YAHOO_TO_DEEP[text(raw.exchange).toUpperCase()];
  if (!exchange || !wanted.has(exchange)) return null;

  const providerSymbol = normalizedProviderSymbol(text(raw.symbol));
  const directCandidates = [
    providerSymbol,
    providerSymbol.replace(/-/g, "."),
    providerSymbol.replace(/\./g, "-"),
  ];

  for (const symbol of directCandidates) {
    const stock = indexes.byKey.get(`${exchange}:${symbol}`);
    if (stock) return stock;
  }

  const providerName = text(raw.longName) || text(raw.shortName);
  if (!providerName) return null;
  return indexes.byName.get(`${exchange}:${normalizeName(providerName)}`) ?? null;
}

function toLiveQuote(raw: Raw): LiveQuote | null {
  const rawPrice = num(raw.regularMarketPrice) ?? num(raw.intradayprice);
  if (rawPrice === null || rawPrice <= 0) return null;

  const rawCurrency = text(raw.currency) || "USD";
  const scale = isPence(rawCurrency) ? 100 : 1;
  const price = rawPrice / scale;
  const rawPreviousClose =
    num(raw.regularMarketPreviousClose) ??
    num(raw.previousClose) ??
    (num(raw.regularMarketChange) !== null ? rawPrice - num(raw.regularMarketChange)! : rawPrice);
  const previousClose = rawPreviousClose / scale;

  const providerChangePct =
    num(raw.regularMarketChangePercent) ??
    num(raw.percentchange) ??
    num(raw.percentChange);
  const changePct =
    providerChangePct !== null
      ? providerChangePct
      : previousClose > 0
        ? ((price - previousClose) / previousClose) * 100
        : 0;

  const marketTime = num(raw.regularMarketTime);
  return {
    symbol: text(raw.symbol),
    price,
    previousClose,
    changePct,
    dayHigh: (num(raw.regularMarketDayHigh) ?? rawPrice) / scale,
    dayLow: (num(raw.regularMarketDayLow) ?? rawPrice) / scale,
    volume: num(raw.regularMarketVolume) ?? num(raw.dayvolume) ?? 0,
    currency: scale === 100 ? "GBP" : rawCurrency,
    fiftyTwoWeekHigh: (num(raw.fiftyTwoWeekHigh) ?? 0) / scale,
    fiftyTwoWeekLow: (num(raw.fiftyTwoWeekLow) ?? 0) / scale,
    marketState: text(raw.marketState),
    asOf:
      marketTime && marketTime > 0
        ? new Date(marketTime * 1000).toISOString()
        : new Date().toISOString(),
  };
}

async function fetchScreener(exchangeCodes: string[], direction: "asc" | "desc"): Promise<Raw[]> {
  const auth = await getSession();
  if (!auth) return [];

  const movementOperator = direction === "desc" ? "gt" : "lt";
  const body = {
    offset: 0,
    size: 250,
    sortField: "percentchange",
    sortType: direction,
    quoteType: "equity",
    userId: "",
    userIdType: "guid",
    query: {
      operator: "and",
      operands: [
        { operator: "is-in", operands: ["exchange", ...exchangeCodes] },
        { operator: movementOperator, operands: ["percentchange", 0] },
        { operator: "gt", operands: ["intradayprice", 0] },
        { operator: "gt", operands: ["dayvolume", 0] },
      ],
    },
  };

  try {
    const url =
      "https://query2.finance.yahoo.com/v1/finance/screener" +
      `?corsDomain=finance.yahoo.com&formatted=false&lang=en-US&region=US&crumb=${encodeURIComponent(auth.crumb)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Cookie: auth.cookie,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      if (response.status === 401) session = null;
      return [];
    }

    const json = (await response.json()) as {
      finance?: { result?: Array<{ quotes?: Raw[] }> };
    };
    return json.finance?.result?.[0]?.quotes ?? [];
  } catch {
    return [];
  }
}

export interface LiveMarketMover {
  exchange: DeepExchange;
  symbol: string;
  name: string;
  quote: LiveQuote;
}

export interface LiveMarketMoversSnapshot {
  gainers: LiveMarketMover[];
  losers: LiveMarketMover[];
  fetchedAt: string;
  source: "Yahoo Finance equity screener" | "Yahoo Finance chart fallback";
}

const CACHE_TTL_MS = 12_000;
const cache = new Map<string, { data: LiveMarketMoversSnapshot; at: number }>();
const inFlight = new Map<string, Promise<LiveMarketMoversSnapshot>>();

function sanitizeExchanges(exchanges: string[]): DeepExchange[] {
  const allowed = new Set<string>(ALLOWED_EXCHANGES);
  const clean = Array.from(
    new Set(exchanges.map((value) => value.toUpperCase()).filter((value) => allowed.has(value))),
  ) as DeepExchange[];
  return clean.length ? clean.sort() : [...ALLOWED_EXCHANGES];
}

async function fetchChartFallback(exchanges: DeepExchange[]): Promise<LiveMarketMover[]> {
  const { fetchChartQuote, yahooSymbol } = await import("./yahoo.server");
  const candidates = exchanges.flatMap((exchange) =>
    STOCKS
      .filter((stock) => stock.exchange === exchange)
      .slice()
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 40),
  );

  const rows: LiveMarketMover[] = [];
  const chunkSize = 10;
  for (let start = 0; start < candidates.length; start += chunkSize) {
    const chunk = candidates.slice(start, start + chunkSize);
    const quotes = await Promise.all(
      chunk.map((stock) => fetchChartQuote(yahooSymbol(stock.exchange, stock.symbol))),
    );
    chunk.forEach((stock, index) => {
      const quote = quotes[index];
      if (!quote || !Number.isFinite(quote.changePct)) return;
      rows.push({
        exchange: stock.exchange as DeepExchange,
        symbol: stock.symbol,
        name: stock.name,
        quote,
      });
    });
  }
  return rows;
}

async function refreshMarketMovers(exchanges: DeepExchange[]): Promise<LiveMarketMoversSnapshot> {
  const wanted = new Set(exchanges);
  const indexes = buildStockIndexes(wanted);
  const relevantGroups = GROUPS.filter((group) => group.deep.some((exchange) => wanted.has(exchange)));

  const resultSets = await Promise.all(
    relevantGroups.map(async (group) => {
      const [up, down] = await Promise.all([
        fetchScreener(group.yahoo, "desc"),
        fetchScreener(group.yahoo, "asc"),
      ]);
      return [...up, ...down];
    }),
  );

  const deduped = new Map<string, LiveMarketMover>();
  for (const raw of resultSets.flat()) {
    const stock = resolveStock(raw, wanted, indexes);
    const quote = stock ? toLiveQuote(raw) : null;
    if (!stock || !quote || !Number.isFinite(quote.changePct)) continue;

    const key = `${stock.exchange}:${stock.symbol}`;
    const existing = deduped.get(key);
    if (!existing || Math.abs(quote.changePct) > Math.abs(existing.quote.changePct)) {
      deduped.set(key, {
        exchange: stock.exchange as DeepExchange,
        symbol: stock.symbol,
        name: stock.name,
        quote,
      });
    }
  }

  let rows = [...deduped.values()];
  let source: LiveMarketMoversSnapshot["source"] = "Yahoo Finance equity screener";

  if (rows.length === 0) {
    rows = await fetchChartFallback(exchanges);
    source = "Yahoo Finance chart fallback";
  }

  const gainers = rows
    .filter((row) => row.quote.changePct > 0)
    .sort((a, b) => b.quote.changePct - a.quote.changePct)
    .slice(0, 50);
  const losers = rows
    .filter((row) => row.quote.changePct < 0)
    .sort((a, b) => a.quote.changePct - b.quote.changePct)
    .slice(0, 50);

  return {
    gainers,
    losers,
    fetchedAt: new Date().toISOString(),
    source,
  };
}

export async function fetchLiveMarketMovers(exchanges: string[]): Promise<LiveMarketMoversSnapshot> {
  const clean = sanitizeExchanges(exchanges);
  const key = clean.join(",");
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && now - existing.at < CACHE_TTL_MS) return existing.data;

  const current = inFlight.get(key);
  if (current) return current;

  const request = refreshMarketMovers(clean)
    .then((data) => {
      if (data.gainers.length || data.losers.length) {
        cache.set(key, { data, at: Date.now() });
        return data;
      }
      return existing?.data ?? data;
    })
    .catch(() => existing?.data ?? {
      gainers: [],
      losers: [],
      fetchedAt: new Date().toISOString(),
      source: "Yahoo Finance chart fallback" as const,
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}
