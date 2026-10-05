export interface MarketIndexDef {
  id: string;
  exchange: "NSE" | "BSE" | "NYSE" | "NASDAQ" | "LSE";
  name: string;
  symbol: string;
  flag: string;
}

export const MARKET_INDEX_TAPE: readonly MarketIndexDef[] = [
  { id: "nifty50", exchange: "NSE", name: "NIFTY 50", symbol: "^NSEI", flag: "🇮🇳" },
  { id: "niftybank", exchange: "NSE", name: "NIFTY BANK", symbol: "^NSEBANK", flag: "🇮🇳" },

  { id: "sensex", exchange: "BSE", name: "SENSEX", symbol: "^BSESN", flag: "🇮🇳" },
  { id: "bse200", exchange: "BSE", name: "BSE 200", symbol: "BSE-200.BO", flag: "🇮🇳" },
  { id: "bse500", exchange: "BSE", name: "BSE 500", symbol: "BSE-500.BO", flag: "🇮🇳" },

  { id: "nyse", exchange: "NYSE", name: "NYSE Composite", symbol: "^NYA", flag: "🇺🇸" },
  { id: "sp500", exchange: "NYSE", name: "S&P 500", symbol: "^GSPC", flag: "🇺🇸" },
  { id: "dow", exchange: "NYSE", name: "Dow Jones", symbol: "^DJI", flag: "🇺🇸" },
  { id: "russell2000", exchange: "NYSE", name: "Russell 2000", symbol: "^RUT", flag: "🇺🇸" },

  { id: "nasdaq", exchange: "NASDAQ", name: "Nasdaq Composite", symbol: "^IXIC", flag: "🇺🇸" },
  { id: "nasdaq100", exchange: "NASDAQ", name: "Nasdaq-100", symbol: "^NDX", flag: "🇺🇸" },

  { id: "ftse100", exchange: "LSE", name: "FTSE 100", symbol: "^FTSE", flag: "🇬🇧" },
  { id: "ftse250", exchange: "LSE", name: "FTSE 250", symbol: "^FTMC", flag: "🇬🇧" },
] as const;
