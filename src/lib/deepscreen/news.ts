import { STOCKS } from "./stocks";
import type { NewsItem, Stock } from "./types";

const SOURCES: Record<string, string[]> = {
  NSE: ["Moneycontrol", "Economic Times Markets", "Mint", "Business Standard"],
  BSE: ["Moneycontrol", "BSE Filings", "Livemint", "CNBC-TV18"],
  NYSE: ["Reuters", "Bloomberg", "CNBC", "Barron's"],
  NASDAQ: ["Bloomberg", "MarketWatch", "Reuters", "The Information"],
  LSE: ["Financial Times", "Reuters UK", "Sky News Business", "City A.M."],
};

const STOCK_TEMPLATES: ((s: Stock) => string)[] = [
  (s) => `${s.name} beats consensus as ${s.sector.toLowerCase()} margins expand to ${s.fundamentals.ebitdaMargin}%`,
  (s) => `Analysts lift ${s.symbol} target after ${s.fundamentals.growth}% revenue growth guidance`,
  (s) => `${s.name} board approves capex programme to widen capacity`,
  (s) => `Institutional holding in ${s.symbol} rises ahead of quarterly results`,
  (s) => `${s.name} flags input-cost pressure; management defends full-year outlook`,
  (s) => `${s.symbol} trades ${s.changePct >= 0 ? "higher" : "lower"} as ${s.sector.toLowerCase()} peers reprice`,
  (s) => `Brokerage note: ${s.name} ROCE of ${s.fundamentals.roce}% among best in its sector`,
  (s) => `${s.name} announces dividend with payout ratio held near ${s.fundamentals.payoutRatio}%`,
];

const MARKET_TEMPLATES: Record<string, string[]> = {
  NSE: [
    "Nifty 50 holds range as banking heavyweights offset IT weakness",
    "FII flows turn positive; index heavyweights lead the advance",
    "RBI commentary keeps rate-sensitive sectors in focus",
    "India VIX cools as monthly expiry passes without a shock",
  ],
  BSE: [
    "Sensex swings intraday as metals rally and FMCG lags",
    "Midcap index outperforms on sustained domestic inflows",
    "BSE SmallCap breadth improves for a third straight session",
    "Quarterly earnings season keeps stock-specific action elevated",
  ],
  NYSE: [
    "Dow steadies as energy majors track crude higher",
    "Treasury yields ease, supporting dividend-heavy sectors",
    "Industrial bellwethers signal steady order books",
    "Value rotation continues as investors trim high-multiple names",
  ],
  NASDAQ: [
    "Nasdaq 100 led by semiconductor complex on AI demand commentary",
    "Megacap tech earnings set the tone for growth multiples",
    "Software names rebound as rate-cut odds improve",
    "Chip supply chain updates drive dispersion across the index",
  ],
  LSE: [
    "FTSE 100 supported by weaker sterling and heavyweight miners",
    "Bank of England outlook keeps UK banks in focus",
    "Energy majors buoy the index amid firmer Brent prices",
    "FTSE 250 lags as domestic consumer names stay under pressure",
  ],
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T,>(arr: T[], seed: string): T => arr[hash(seed) % arr.length]!;

function makeItem(seed: string, headline: string, exchange: string, scope: string, i: number): NewsItem {
  const h = hash(seed + i);
  const sentiment = (["bullish", "bearish", "neutral"] as const)[h % 3]!;
  const impact = (["high", "medium", "low"] as const)[(h >> 3) % 3]!;
  return {
    id: `${seed}-${i}`,
    headline,
    source: pick(SOURCES[exchange] ?? SOURCES["NYSE"]!, seed + i),
    minutesAgo: 4 + ((h >> 5) % 680),
    impact,
    sentiment,
    scope,
  };
}

export function stockNews(stock: Stock, count = 6): NewsItem[] {
  return Array.from({ length: count }, (_, i) => {
    const tpl = STOCK_TEMPLATES[hash(stock.symbol + i) % STOCK_TEMPLATES.length]!;
    return makeItem(stock.symbol, tpl(stock), stock.exchange, stock.symbol, i);
  }).sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function exchangeNews(code: string, count = 8): NewsItem[] {
  const market = MARKET_TEMPLATES[code] ?? [];
  const stocks = STOCKS.filter((s) => s.exchange === code);
  const items: NewsItem[] = market.map((headline, i) => makeItem(code, headline, code, code, i));
  for (let i = 0; i < count - market.length; i++) {
    const s = stocks[hash(code + "s" + i) % stocks.length]!;
    const tpl = STOCK_TEMPLATES[hash(s.symbol + "x" + i) % STOCK_TEMPLATES.length]!;
    items.push(makeItem(code + "extra", tpl(s), code, s.symbol, i));
  }
  return items.sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, count);
}

export function globalNews(count = 10): NewsItem[] {
  return ["NSE", "BSE", "NYSE", "NASDAQ", "LSE"]
    .flatMap((code) => exchangeNews(code, 4))
    .sort((a, b) => a.minutesAgo - b.minutesAgo)
    .slice(0, count);
}
