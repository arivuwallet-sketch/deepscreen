// Index membership engine — maps every listed stock to the exchange-level
// indices it belongs to. Flagship indices use curated official-style
// constituent lists; broad-market indices are derived deterministically from
// the market-cap ranking of the full listing universe, so no stock is ever
// orphaned (broad indices always cover the universe top-down).

import { STOCKS, stocksByExchange } from "./stocks";
import type { Stock } from "./types";

export interface IndexDef {
  id: string;
  name: string;
  /** Exchange code the index is displayed under. */
  exchange: string;
  /** Universe the ranking runs over: an exchange code or "US" (NYSE+NASDAQ). */
  universe: string;
  blurb: string;
}

export const INDICES: IndexDef[] = [
  // India — NSE
  { id: "NIFTY50", name: "NIFTY 50", exchange: "NSE", universe: "NSE", blurb: "Primary large-cap 50 constituents." },
  { id: "NIFTYNEXT50", name: "NIFTY Next 50", exchange: "NSE", universe: "NSE", blurb: "Next 50 liquid large-caps." },
  { id: "NIFTY100", name: "NIFTY 100", exchange: "NSE", universe: "NSE", blurb: "Nifty 50 + Next 50 universe." },
  { id: "NIFTY200", name: "NIFTY 200", exchange: "NSE", universe: "NSE", blurb: "Large and mid-cap blended benchmark." },
  { id: "NIFTY500", name: "NIFTY 500", exchange: "NSE", universe: "NSE", blurb: "Broad-market multi-sector flagship." },
  { id: "NIFTYTOTAL", name: "NIFTY Total Market", exchange: "NSE", universe: "NSE", blurb: "750+ large, mid, small and micro caps." },
  // India — BSE
  { id: "SENSEX", name: "BSE SENSEX", exchange: "BSE", universe: "BSE", blurb: "Flagship 30 bellwether stocks." },
  { id: "SENSEX50", name: "BSE Sensex 50", exchange: "BSE", universe: "BSE", blurb: "Top 50 liquid large-caps." },
  { id: "SENSEXNEXT50", name: "BSE Sensex Next 50", exchange: "BSE", universe: "BSE", blurb: "The trailing tier." },
  { id: "BSE100", name: "BSE 100", exchange: "BSE", universe: "BSE", blurb: "Broad market tier." },
  { id: "BSE200", name: "BSE 200", exchange: "BSE", universe: "BSE", blurb: "Broad market tier." },
  { id: "BSE500", name: "BSE 500", exchange: "BSE", universe: "BSE", blurb: "Broad market tier." },
  { id: "BSEALLCAP", name: "BSE Allcap", exchange: "BSE", universe: "BSE", blurb: "Complete universe: large, mid, small & micro caps." },
  { id: "BSELARGE", name: "BSE LargeCap", exchange: "BSE", universe: "BSE", blurb: "Large-cap size category." },
  { id: "BSEMID", name: "BSE MidCap", exchange: "BSE", universe: "BSE", blurb: "Mid-cap size category." },
  { id: "BSESMALL", name: "BSE SmallCap", exchange: "BSE", universe: "BSE", blurb: "Small-cap size category." },
  // United States
  { id: "DJIA", name: "Dow Jones (DJIA)", exchange: "NYSE", universe: "US", blurb: "Price-weighted 30 blue chips." },
  { id: "SP500", name: "S&P 500", exchange: "NYSE", universe: "US", blurb: "Large-cap core benchmark." },
  { id: "SP400", name: "S&P MidCap 400", exchange: "NYSE", universe: "US", blurb: "Mid-cap segment." },
  { id: "SP600", name: "S&P SmallCap 600", exchange: "NYSE", universe: "US", blurb: "Small-cap segment." },
  { id: "RUSSELL1000", name: "Russell 1000", exchange: "NYSE", universe: "US", blurb: "Broad large/mid barometer." },
  { id: "RUSSELL2000", name: "Russell 2000", exchange: "NYSE", universe: "US", blurb: "Small-cap barometer." },
  { id: "NASDAQ100", name: "NASDAQ 100", exchange: "NASDAQ", universe: "NASDAQ", blurb: "Top 100 non-financial innovators." },
  // United Kingdom
  { id: "FTSE100", name: "FTSE 100", exchange: "LSE", universe: "LSE", blurb: "Top 100 blue chips." },
  { id: "FTSE250", name: "FTSE 250", exchange: "LSE", universe: "LSE", blurb: "Next 250 mid caps." },
  { id: "FTSE350", name: "FTSE 350", exchange: "LSE", universe: "LSE", blurb: "FTSE 100 + FTSE 250 aggregate." },
];

// Curated flagship constituents. Any symbol absent from the downloaded
// listing universe is skipped; broad tiers below always fill by rank.
const NIFTY_50 = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "BHARTIARTL", "ITC", "LT",
  "MARUTI", "SUNPHARMA", "TITAN", "ASIANPAINT", "TATAMOTORS", "POWERGRID",
  "HINDUNILVR", "KOTAKBANK", "AXISBANK", "NTPC", "ULTRACEMCO", "NESTLEIND",
  "JSWSTEEL", "TATASTEEL", "SBIN", "BAJFINANCE", "BAJAJFINSV", "HCLTECH",
  "ADANIENT", "ADANIPORTS", "COALINDIA", "ONGC", "GRASIM", "HINDALCO", "M&M",
  "TECHM", "WIPRO", "TRENT", "BAJAJ-AUTO", "HEROMOTOCO", "EICHERMOT", "DRREDDY",
  "CIPLA", "APOLLOHOSP", "BRITANNIA", "INDUSINDBK", "TATACONSUM", "SHRIRAMFIN",
  "BEL", "JIOFIN", "SBILIFE", "HDFCLIFE",
];

const NIFTY_NEXT_50 = [
  "GODREJCP", "DABUR", "PNB", "BANKBARODA", "IOC", "BPCL", "VEDL", "SAIL",
  "NMDC", "TATAPOWER", "ADANIGREEN", "ADANIPWR", "DLF", "LODHA", "SIEMENS",
  "ABB", "BOSCHLTD", "MOTHERSON", "TVSMOTOR", "AMBUJACEM", "ACC", "PIDILITIND",
  "HAVELLS", "BERGEPAINT", "COLPAL", "GAIL", "INDIGO", "NAUKRI", "IRCTC", "HAL",
  "ZOMATO", "DMART", "SBICARD", "ICICIGI", "MARICO", "CHOLAFIN", "MUTHOOTFIN",
  "AUROPHARMA", "LUPIN", "TORNTPHARM", "INDUSTOWER", "JSWENERGY", "UPL",
  "SHREECEM", "PERSISTENT", "POLYCAB", "LTIM", "VBL", "CUMMINSIND",
];

const SENSEX_30 = [
  "RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS", "HINDUNILVR", "ITC",
  "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI",
  "SUNPHARMA", "TITAN", "ULTRACEMCO", "BAJFINANCE", "NESTLEIND", "HCLTECH",
  "M&M", "TATASTEEL", "NTPC", "POWERGRID", "TATAMOTORS", "ADANIENT",
  "ADANIPORTS", "TECHM", "INDUSINDBK", "JSWSTEEL",
];

const DJIA_30 = [
  "AAPL", "AMGN", "AXP", "BA", "CAT", "CRM", "CSCO", "CVX", "DIS", "DOW",
  "GS", "HD", "HON", "IBM", "INTC", "JNJ", "JPM", "KO", "MCD", "MMM",
  "MRK", "MSFT", "NKE", "NVDA", "PG", "SHW", "TRV", "UNH", "V", "WMT",
];

function universeStocks(universe: string): Stock[] {
  if (universe === "US") {
    return [...stocksByExchange("NYSE"), ...stocksByExchange("NASDAQ")].sort(
      (a, b) => b.marketCap - a.marketCap,
    );
  }
  return [...stocksByExchange(universe)].sort((a, b) => b.marketCap - a.marketCap);
}

const keyOf = (s: Stock) => `${s.exchange}:${s.symbol}`;

/** Fill a curated set up to `size` using the rank list (skips duplicates). */
function fill(curated: string[], ranked: Stock[], size: number): Set<string> {
  const out = new Set<string>();
  const bySymbol = new Map(ranked.map((s) => [s.symbol, s]));
  for (const sym of curated) {
    const s = bySymbol.get(sym);
    if (s) out.add(keyOf(s));
  }
  for (const s of ranked) {
    if (out.size >= size) break;
    out.add(keyOf(s));
  }
  return out;
}

function rankSlice(ranked: Stock[], from: number, to: number): Set<string> {
  return new Set(ranked.slice(from, to).map(keyOf));
}

interface UniverseMaps {
  /** stock key -> index ids it belongs to */
  membership: Map<string, string[]>;
  /** index id -> member stock keys */
  members: Map<string, Set<string>>;
}

const cache = new Map<string, UniverseMaps>();

function buildUniverse(universe: string): UniverseMaps {
  const cached = cache.get(universe);
  if (cached) return cached;

  const ranked = universeStocks(universe);
  const members = new Map<string, Set<string>>();
  const add = (id: string, set: Set<string>) => members.set(id, set);

  if (universe === "NSE") {
    const n50 = fill(NIFTY_50, ranked, 50);
    const next50 = fill(
      NIFTY_NEXT_50.filter((s) => !NIFTY_50.includes(s)),
      ranked.filter((s) => !n50.has(keyOf(s))),
      50,
    );
    const n100 = new Set([...n50, ...next50]);
    add("NIFTY50", n50);
    add("NIFTYNEXT50", next50);
    add("NIFTY100", n100);
    add("NIFTY200", new Set([...n100, ...rankSlice(ranked, 100, 200)]));
    add("NIFTY500", rankSlice(ranked, 0, 500));
    add("NIFTYTOTAL", rankSlice(ranked, 0, 750));
  } else if (universe === "BSE") {
    const sensex = fill(SENSEX_30, ranked, 30);
    const sensex50 = new Set([...sensex, ...rankSlice(ranked.filter((s) => !sensex.has(keyOf(s))), 0, 20)]);
    add("SENSEX", sensex);
    add("SENSEX50", sensex50);
    add("SENSEXNEXT50", rankSlice(ranked.filter((s) => !sensex50.has(keyOf(s))), 0, 50));
    add("BSE100", rankSlice(ranked, 0, 100));
    add("BSE200", rankSlice(ranked, 0, 200));
    add("BSE500", rankSlice(ranked, 0, 500));
    add("BSEALLCAP", new Set(ranked.map(keyOf)));
    add("BSELARGE", new Set(ranked.filter((s) => s.cap === "large").map(keyOf)));
    add("BSEMID", new Set(ranked.filter((s) => s.cap === "mid").map(keyOf)));
    add("BSESMALL", new Set(ranked.filter((s) => s.cap === "small").map(keyOf)));
  } else if (universe === "US") {
    add("DJIA", fill(DJIA_30, ranked, 30));
    add("SP500", rankSlice(ranked, 0, 500));
    add("SP400", rankSlice(ranked, 500, 900));
    add("SP600", rankSlice(ranked, 900, 1500));
    add("RUSSELL1000", rankSlice(ranked, 0, 1000));
    add("RUSSELL2000", rankSlice(ranked, 1000, 3000));
  } else if (universe === "NASDAQ") {
    const nonFin = ranked.filter((s) => s.sector !== "Financials");
    add("NASDAQ100", rankSlice(nonFin, 0, 100));
  } else if (universe === "LSE") {
    const f100 = rankSlice(ranked, 0, 100);
    const f250 = rankSlice(ranked, 100, 350);
    add("FTSE100", f100);
    add("FTSE250", f250);
    add("FTSE350", new Set([...f100, ...f250]));
  }

  const membership = new Map<string, string[]>();
  for (const [id, set] of members) {
    for (const key of set) {
      const list = membership.get(key);
      if (list) list.push(id);
      else membership.set(key, [id]);
    }
  }

  const maps: UniverseMaps = { membership, members };
  cache.set(universe, maps);
  return maps;
}

function universesForExchange(exchange: string): string[] {
  if (exchange === "NYSE" || exchange === "NASDAQ") {
    return exchange === "NASDAQ" ? ["NASDAQ", "US"] : ["US"];
  }
  return [exchange];
}

/** Names of every index the stock belongs to, in display order. */
export function getIndexMemberships(exchange: string, symbol: string): IndexDef[] {
  const key = `${exchange.toUpperCase()}:${symbol.toUpperCase()}`;
  const ids = new Set<string>();
  for (const u of universesForExchange(exchange.toUpperCase())) {
    for (const id of buildUniverse(u).membership.get(key) ?? []) ids.add(id);
  }
  return INDICES.filter((i) => ids.has(i.id));
}

/** All indices shown in the screener filter for an exchange. */
export function indicesForExchange(exchange: string): IndexDef[] {
  const universes = universesForExchange(exchange.toUpperCase());
  return INDICES.filter((i) => universes.includes(i.universe));
}

/** Member stocks of one index within a given exchange's listing page. */
export function isInIndex(exchange: string, symbol: string, indexId: string): boolean {
  const def = INDICES.find((i) => i.id === indexId);
  if (!def) return false;
  const key = `${exchange.toUpperCase()}:${symbol.toUpperCase()}`;
  return buildUniverse(def.universe).members.get(indexId)?.has(key) ?? false;
}

export const TOTAL_STOCKS = STOCKS.length;
