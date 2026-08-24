import type { Exchange } from "./types";

export const EXCHANGES: Exchange[] = [
  {
    code: "NSE",
    name: "National Stock Exchange of India",
    country: "India",
    currency: "INR",
    symbol: "₹",
    timezone: "IST · 09:15–15:30",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "BSE",
    name: "Bombay Stock Exchange",
    country: "India",
    currency: "INR",
    symbol: "₹",
    timezone: "IST · 09:15–15:30",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "NYSE",
    name: "New York Stock Exchange",
    country: "United States",
    currency: "USD",
    symbol: "$",
    timezone: "ET · 09:30–16:00",
    flag: "🇺🇸",
    region: "United States",
  },
  {
    code: "NASDAQ",
    name: "Nasdaq Stock Market",
    country: "United States",
    currency: "USD",
    symbol: "$",
    timezone: "ET · 09:30–16:00",
    flag: "🇺🇸",
    region: "United States",
  },
  {
    code: "LSE",
    name: "London Stock Exchange",
    country: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    timezone: "GMT · 08:00–16:30",
    flag: "🇬🇧",
    region: "United Kingdom",
  },
];

export function getExchange(code: string): Exchange | undefined {
  return EXCHANGES.find((e) => e.code.toLowerCase() === code.toLowerCase());
}
