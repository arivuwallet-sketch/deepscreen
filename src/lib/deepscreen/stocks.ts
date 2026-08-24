import type { CapTier, Fundamentals, Stock } from "./types";

type Seed = [symbol: string, name: string, sector: string, price: number, marketCapBn: number];

// marketCapBn is in the exchange's own currency (billions).
const SEEDS: Record<string, Seed[]> = {
  NSE: [
    ["RELIANCE", "Reliance Industries", "Energy", 2954, 19980],
    ["TCS", "Tata Consultancy Services", "Information Technology", 4120, 14900],
    ["HDFCBANK", "HDFC Bank", "Financials", 1685, 12800],
    ["INFY", "Infosys", "Information Technology", 1842, 7640],
    ["ICICIBANK", "ICICI Bank", "Financials", 1218, 8560],
    ["BHARTIARTL", "Bharti Airtel", "Telecom", 1495, 8900],
    ["ITC", "ITC Limited", "Consumer Staples", 448, 5590],
    ["LT", "Larsen & Toubro", "Industrials", 3620, 4980],
    ["MARUTI", "Maruti Suzuki India", "Consumer Discretionary", 12480, 3920],
    ["SUNPHARMA", "Sun Pharmaceutical", "Healthcare", 1712, 4110],
    ["TITAN", "Titan Company", "Consumer Discretionary", 3410, 3030],
    ["ASIANPAINT", "Asian Paints", "Materials", 2860, 2740],
    ["TATAMOTORS", "Tata Motors", "Consumer Discretionary", 962, 3540],
    ["POWERGRID", "Power Grid Corporation", "Utilities", 318, 2960],
    ["DIVISLAB", "Divi's Laboratories", "Healthcare", 5240, 1390],
    ["PERSISTENT", "Persistent Systems", "Information Technology", 5610, 863],
    ["POLYCAB", "Polycab India", "Industrials", 6420, 966],
    ["ASTRAL", "Astral Limited", "Materials", 1480, 397],
    ["CDSL", "Central Depository Services", "Financials", 1590, 332],
    ["KEI", "KEI Industries", "Industrials", 3810, 344],
    ["RAINBOW", "Rainbow Children's Medicare", "Healthcare", 1465, 148],
    ["CAMPUS", "Campus Activewear", "Consumer Discretionary", 268, 81],
    ["EASEMYTRIP", "Easy Trip Planners", "Consumer Discretionary", 41, 72],
    ["SHAILY", "Shaily Engineering Plastics", "Industrials", 1620, 74],
  ],
  BSE: [
    ["SENSEXCO", "Bajaj Finance", "Financials", 6890, 4260],
    ["HINDUNILVR", "Hindustan Unilever", "Consumer Staples", 2455, 5770],
    ["KOTAKBANK", "Kotak Mahindra Bank", "Financials", 1762, 3500],
    ["AXISBANK", "Axis Bank", "Financials", 1128, 3480],
    ["NTPC", "NTPC Limited", "Utilities", 372, 3610],
    ["ULTRACEMCO", "UltraTech Cement", "Materials", 10940, 3160],
    ["NESTLEIND", "Nestle India", "Consumer Staples", 2410, 2320],
    ["JSWSTEEL", "JSW Steel", "Materials", 918, 2240],
    ["TATASTEEL", "Tata Steel", "Materials", 148, 1850],
    ["COFORGE", "Coforge", "Information Technology", 1830, 610],
    ["JUBLFOOD", "Jubilant FoodWorks", "Consumer Discretionary", 668, 441],
    ["BATAINDIA", "Bata India", "Consumer Discretionary", 1290, 166],
    ["FINEORG", "Fine Organic Industries", "Materials", 4520, 138],
    ["GRINDWELL", "Grindwell Norton", "Industrials", 1730, 191],
    ["VGUARD", "V-Guard Industries", "Industrials", 382, 166],
    ["SAFARI", "Safari Industries", "Consumer Discretionary", 2180, 106],
    ["ELECON", "Elecon Engineering", "Industrials", 542, 121],
    ["TIPSMUSIC", "Tips Music", "Communication Services", 720, 92],
    ["NUCLEUS", "Nucleus Software Exports", "Information Technology", 1130, 30],
    ["GARFIBRES", "Garware Technical Fibres", "Materials", 3720, 77],
  ],
  NYSE: [
    ["BRK.B", "Berkshire Hathaway", "Financials", 462, 998],
    ["JPM", "JPMorgan Chase", "Financials", 224, 641],
    ["XOM", "Exxon Mobil", "Energy", 116, 460],
    ["WMT", "Walmart", "Consumer Staples", 78, 628],
    ["V", "Visa Inc.", "Financials", 288, 574],
    ["UNH", "UnitedHealth Group", "Healthcare", 512, 471],
    ["PG", "Procter & Gamble", "Consumer Staples", 167, 393],
    ["JNJ", "Johnson & Johnson", "Healthcare", 158, 380],
    ["HD", "Home Depot", "Consumer Discretionary", 372, 369],
    ["CVX", "Chevron", "Energy", 152, 281],
    ["CAT", "Caterpillar", "Industrials", 348, 168],
    ["NKE", "Nike Inc.", "Consumer Discretionary", 74, 111],
    ["F", "Ford Motor", "Consumer Discretionary", 11, 44],
    ["DAL", "Delta Air Lines", "Industrials", 48, 31],
    ["TOL", "Toll Brothers", "Consumer Discretionary", 132, 13],
    ["CROX", "Crocs Inc.", "Consumer Discretionary", 108, 6.3],
    ["BLD", "TopBuild Corp.", "Industrials", 342, 10.4],
    ["SITE", "SiteOne Landscape Supply", "Industrials", 128, 5.8],
    ["KTB", "Kontoor Brands", "Consumer Discretionary", 71, 3.9],
    ["MYE", "Myers Industries", "Materials", 14, 0.52],
    ["BGS", "B&G Foods", "Consumer Staples", 7, 0.51],
  ],
  NASDAQ: [
    ["AAPL", "Apple Inc.", "Information Technology", 228, 3460],
    ["MSFT", "Microsoft Corporation", "Information Technology", 428, 3180],
    ["NVDA", "NVIDIA Corporation", "Information Technology", 132, 3240],
    ["GOOGL", "Alphabet Inc.", "Communication Services", 178, 2180],
    ["AMZN", "Amazon.com", "Consumer Discretionary", 186, 1940],
    ["META", "Meta Platforms", "Communication Services", 542, 1370],
    ["AVGO", "Broadcom Inc.", "Information Technology", 168, 784],
    ["TSLA", "Tesla Inc.", "Consumer Discretionary", 248, 792],
    ["COST", "Costco Wholesale", "Consumer Staples", 886, 393],
    ["AMD", "Advanced Micro Devices", "Information Technology", 152, 246],
    ["ADBE", "Adobe Inc.", "Information Technology", 512, 227],
    ["INTC", "Intel Corporation", "Information Technology", 22, 94],
    ["ZS", "Zscaler", "Information Technology", 186, 28],
    ["DDOG", "Datadog", "Information Technology", 118, 40],
    ["TTD", "The Trade Desk", "Communication Services", 104, 51],
    ["SMCI", "Super Micro Computer", "Information Technology", 42, 24],
    ["CELH", "Celsius Holdings", "Consumer Staples", 32, 7.5],
    ["FIVN", "Five9 Inc.", "Information Technology", 31, 2.3],
    ["PGNY", "Progyny Inc.", "Healthcare", 21, 1.8],
    ["LASR", "nLIGHT Inc.", "Industrials", 12, 0.58],
  ],
  LSE: [
    ["SHEL", "Shell plc", "Energy", 2712, 168],
    ["AZN", "AstraZeneca plc", "Healthcare", 11480, 178],
    ["HSBA", "HSBC Holdings", "Financials", 692, 124],
    ["ULVR", "Unilever plc", "Consumer Staples", 4640, 116],
    ["BP", "BP plc", "Energy", 402, 68],
    ["GSK", "GSK plc", "Healthcare", 1486, 61],
    ["RIO", "Rio Tinto", "Materials", 4890, 61],
    ["DGE", "Diageo plc", "Consumer Staples", 2480, 55],
    ["NG", "National Grid", "Utilities", 986, 48],
    ["LSEG", "London Stock Exchange Group", "Financials", 9540, 51],
    ["BA", "BAE Systems", "Industrials", 1312, 39],
    ["TSCO", "Tesco plc", "Consumer Staples", 348, 24],
    ["NXT", "Next plc", "Consumer Discretionary", 9860, 12],
    ["ITV", "ITV plc", "Communication Services", 68, 2.7],
    ["GAW", "Games Workshop", "Consumer Discretionary", 11240, 3.7],
    ["BYIT", "Bytes Technology Group", "Information Technology", 468, 1.1],
    ["CCC", "Computacenter", "Information Technology", 2380, 2.6],
    ["GNS", "Genus plc", "Healthcare", 1720, 1.1],
    ["VCT", "Victrex plc", "Materials", 978, 0.86],
    ["SOM", "Somero Enterprises", "Industrials", 312, 0.17],
  ],
};

// Cap thresholds in the exchange's local billions.
const CAP_RULES: Record<string, [large: number, mid: number]> = {
  NSE: [1000, 250],
  BSE: [1000, 250],
  NYSE: [10, 2],
  NASDAQ: [10, 2],
  LSE: [10, 2],
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: string, key: string, min: number, max: number, decimals = 2): number {
  const v = (hash(`${seed}:${key}`) % 100000) / 100000;
  return Number((min + v * (max - min)).toFixed(decimals));
}

function capOf(code: string, marketCapBn: number): CapTier {
  const rule = CAP_RULES[code] ?? [10, 2];
  if (marketCapBn >= rule[0]) return "large";
  if (marketCapBn >= rule[1]) return "mid";
  return "small";
}

function buildFundamentals(symbol: string, sector: string, cap: CapTier): Fundamentals {
  const growthBase = cap === "small" ? [4, 34] : cap === "mid" ? [6, 26] : [2, 18];
  const growth = rand(symbol, "growth", growthBase[0]!, growthBase[1]!, 1);

  const techy =
    sector === "Information Technology" || sector === "Communication Services" || sector === "Healthcare";
  const heavy = sector === "Energy" || sector === "Materials" || sector === "Utilities";

  const pe = rand(symbol, "pe", techy ? 18 : heavy ? 6 : 12, techy ? 62 : heavy ? 22 : 44, 1);
  const netMargin = rand(symbol, "nm", heavy ? 4 : 8, techy ? 32 : 20, 1);
  const ebitdaMargin = Number((netMargin + rand(symbol, "em", 5, 16, 1)).toFixed(1));
  const ps = Number(((pe * netMargin) / 100).toFixed(2));
  const roe = rand(symbol, "roe", heavy ? 6 : 10, techy ? 42 : 30, 1);
  const debtToEquity = rand(symbol, "de", heavy ? 0.4 : 0.02, heavy ? 1.9 : 1.1, 2);
  const roa = Number((roe / (1 + debtToEquity + 0.35)).toFixed(1));
  const roce = Number((roa + rand(symbol, "roce", 1.5, 9, 1)).toFixed(1));
  const pb = Number(((pe * roe) / 100).toFixed(2));
  const evEbitda = Number((pe * rand(symbol, "eve", 0.42, 0.78, 2)).toFixed(1));
  const evRevenue = Number(((evEbitda * ebitdaMargin) / 100).toFixed(2));
  const payoutRatio = cap === "large" ? rand(symbol, "pay", 8, 72, 0) : rand(symbol, "pay", 0, 38, 0);
  const dividendYield = Number(((payoutRatio / 100) * (100 / pe)).toFixed(2));

  return {
    pe,
    peg: Number((pe / Math.max(growth, 1)).toFixed(2)),
    ps,
    pb,
    evRevenue,
    evEbitda,
    roe,
    roa,
    roce,
    debtToEquity,
    dividendYield,
    payoutRatio,
    operatingLeverage: rand(symbol, "ol", 0.9, 3.4, 2),
    growth,
    netMargin,
    ebitdaMargin,
  };
}

const SECTOR_LIST = [
  "Information Technology",
  "Financials",
  "Healthcare",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Materials",
  "Energy",
  "Utilities",
  "Communication Services",
  "Real Estate",
];

const SECTOR_KEYWORDS: [RegExp, string][] = [
  [/bank|financ|capital|insur|invest|securit|credit|asset|holding|fund|bourse|leasing/i, "Financials"],
  [/tech|software|systems|infotech|semiconduct|micro|data|cyber|digital|computer|solutions|infosys|electronics/i, "Information Technology"],
  [/pharma|health|life ?science|medic|hospital|bio|labor|diagnost|drug|care/i, "Healthcare"],
  [/oil|gas|petro|energy|coal|fuel|refin|drilling/i, "Energy"],
  [/power|electric|utilit|water|grid|renewable|solar|wind/i, "Utilities"],
  [/steel|cement|chemical|mining|metal|paper|paint|polym|plastic|alumin|fertil|resource/i, "Materials"],
  [/engineer|industr|construct|infrastruct|machin|tools|logistic|transport|aviation|airline|defen[cs]e|shipping|rail|cargo/i, "Industrials"],
  [/food|bevera|consumer|foods|dairy|sugar|tea|agro|brew|distill|tobacc|household/i, "Consumer Staples"],
  [/motor|auto|retail|apparel|textil|hotel|resort|travel|leisure|restaur|footwear|jewell|entertain|toys|home/i, "Consumer Discretionary"],
  [/media|telecom|broadcast|communicat|network|publish|music|studios|games/i, "Communication Services"],
  [/realt|estate|properti|land|develop|reit|infra ?trust/i, "Real Estate"],
];

function sectorFor(symbol: string, name: string): string {
  for (const [re, sector] of SECTOR_KEYWORDS) if (re.test(name)) return sector;
  return SECTOR_LIST[hash(`sector:${symbol}`) % SECTOR_LIST.length]!;
}

// Typical top-end market cap (exchange-local billions) used to spread the universe.
const CAP_SCALE: Record<string, number> = {
  NSE: 20000,
  BSE: 18000,
  NYSE: 700,
  NASDAQ: 3500,
  LSE: 180,
};

const PRICE_SCALE: Record<string, [number, number]> = {
  NSE: [12, 9000],
  BSE: [9, 11000],
  NYSE: [3, 620],
  NASDAQ: [2, 900],
  LSE: [18, 9800],
};

function syntheticCap(code: string, symbol: string): number {
  const top = CAP_SCALE[code] ?? 500;
  const u = (hash(`cap:${code}:${symbol}`) % 100000) / 100000;
  // Cubic skew: most listings are small, a handful are mega caps.
  const value = top * Math.pow(u, 3.6);
  const floor = top / 20000;
  return Number(Math.max(floor, value).toFixed(2));
}

function syntheticPrice(code: string, symbol: string): number {
  const [min, max] = PRICE_SCALE[code] ?? [5, 500];
  const u = (hash(`price:${code}:${symbol}`) % 100000) / 100000;
  return Number((min + Math.pow(u, 2.4) * (max - min)).toFixed(2));
}

function makeStock(code: string, symbol: string, name: string, seed?: Seed): Stock {
  const sector = seed ? seed[2] : sectorFor(symbol, name);
  const marketCapBn = seed ? seed[4] : syntheticCap(code, symbol);
  const price = seed ? seed[3] : syntheticPrice(code, symbol);
  const cap = capOf(code, marketCapBn);
  const fundamentals = buildFundamentals(symbol, sector, cap);
  return {
    symbol,
    name,
    exchange: code,
    sector,
    cap,
    marketCap: marketCapBn,
    price,
    changePct: rand(symbol, "chg", -4.2, 5.1, 2),
    volume: Math.round(rand(symbol, "vol", 0.15, 48, 2) * 1_000_000),
    epsTtm: Number((price / fundamentals.pe).toFixed(2)),
    revenue: Number((marketCapBn / Math.max(fundamentals.ps, 0.3)).toFixed(2)),
    fundamentals,
  };
}

function build(): Stock[] {
  const out: Stock[] = [];
  for (const code of Object.keys(LISTINGS)) {
    const seeds = new Map<string, Seed>((SEEDS[code] ?? []).map((s) => [s[0], s]));
    const seen = new Set<string>();

    for (const line of LISTINGS[code]!.split("\n")) {
      if (!line) continue;
      const tab = line.indexOf("\t");
      const symbol = (tab === -1 ? line : line.slice(0, tab)).trim();
      const name = tab === -1 ? symbol : line.slice(tab + 1).trim();
      if (!symbol || seen.has(symbol)) continue;
      seen.add(symbol);
      out.push(makeStock(code, symbol, name, seeds.get(symbol)));
    }

    // Curated companies that are not part of the downloaded listing file.
    for (const seed of SEEDS[code] ?? []) {
      if (seen.has(seed[0])) continue;
      seen.add(seed[0]);
      out.push(makeStock(code, seed[0], seed[1], seed));
    }
  }
  return out;
}

export const STOCKS: Stock[] = build();

export const SECTORS: string[] = Array.from(new Set(STOCKS.map((s) => s.sector))).sort();

const BY_EXCHANGE = new Map<string, Stock[]>();
for (const s of STOCKS) {
  const key = s.exchange.toLowerCase();
  const list = BY_EXCHANGE.get(key);
  if (list) list.push(s);
  else BY_EXCHANGE.set(key, [s]);
}

const BY_KEY = new Map<string, Stock>(
  STOCKS.map((s) => [`${s.exchange.toLowerCase()}:${s.symbol.toLowerCase()}`, s]),
);

export function stocksByExchange(code: string): Stock[] {
  return BY_EXCHANGE.get(code.toLowerCase()) ?? [];
}

export function findStock(exchange: string, symbol: string): Stock | undefined {
  return BY_KEY.get(`${exchange.toLowerCase()}:${symbol.toLowerCase()}`);
}

export function searchStocks(query: string, limit = 10): Stock[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exact: Stock[] = [];
  const starts: Stock[] = [];
  const contains: Stock[] = [];

  for (const s of STOCKS) {
    const sym = s.symbol.toLowerCase();
    const name = s.name.toLowerCase();
    if (sym === q) exact.push(s);
    else if (sym.startsWith(q) || name.startsWith(q)) starts.push(s);
    else if (sym.includes(q) || name.includes(q)) contains.push(s);
    if (exact.length >= limit) break;
  }

  const rank = (a: Stock, b: Stock) => b.marketCap / (CAP_SCALE[b.exchange] ?? 1) - a.marketCap / (CAP_SCALE[a.exchange] ?? 1);
  starts.sort(rank);
  contains.sort(rank);
  return [...exact, ...starts, ...contains].slice(0, limit);
}

