import { createServerFn } from "@tanstack/react-start";

export interface CommodityQuote {
  symbol: string;
  price: number;
  previousClose: number;
  changePct: number;
  currency: string;
  asOf: string;
}

const SYMBOLS = ["GC=F", "SI=F", "CL=F", "NG=F", "HG=F"] as const;

export const getCommodityQuotes = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, CommodityQuote>> => {
    const { fetchChartQuote } = await import("./yahoo.server");
    const quotes = await Promise.all(SYMBOLS.map((symbol) => fetchChartQuote(symbol)));
    const result: Record<string, CommodityQuote> = {};
    SYMBOLS.forEach((symbol, index) => {
      const quote = quotes[index];
      if (quote) {
        result[symbol] = {
          symbol,
          price: quote.price,
          previousClose: quote.previousClose,
          changePct: quote.changePct,
          currency: quote.currency,
          asOf: quote.asOf,
        };
      }
    });
    return result;
  },
);