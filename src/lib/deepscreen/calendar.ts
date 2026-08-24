import type { CalendarEvent } from "./types";

const RAW: Omit<CalendarEvent, "id">[] = [
  { time: "05:30", country: "India", flag: "🇮🇳", currency: "INR", title: "WPI Inflation y/y", impact: "medium", actual: "2.6%", forecast: "2.4%", previous: "2.1%", dayOffset: 0 },
  { time: "07:00", country: "United Kingdom", flag: "🇬🇧", currency: "GBP", title: "CPI y/y", impact: "high", actual: "2.9%", forecast: "3.0%", previous: "3.2%", dayOffset: 0 },
  { time: "07:00", country: "United Kingdom", flag: "🇬🇧", currency: "GBP", title: "Retail Sales m/m", impact: "medium", actual: "0.4%", forecast: "0.2%", previous: "-0.1%", dayOffset: 0 },
  { time: "12:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "Core CPI m/m", impact: "high", actual: "0.2%", forecast: "0.3%", previous: "0.3%", dayOffset: 0 },
  { time: "12:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "Initial Jobless Claims", impact: "medium", actual: "218K", forecast: "224K", previous: "221K", dayOffset: 0 },
  { time: "14:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "Crude Oil Inventories", impact: "medium", actual: "-1.8M", forecast: "-0.9M", previous: "2.4M", dayOffset: 0 },
  { time: "18:00", country: "United States", flag: "🇺🇸", currency: "USD", title: "FOMC Member Speech", impact: "high", actual: "—", forecast: "—", previous: "—", dayOffset: 0 },

  { time: "04:00", country: "India", flag: "🇮🇳", currency: "INR", title: "RBI Monetary Policy Statement", impact: "high", actual: "—", forecast: "6.25%", previous: "6.50%", dayOffset: 1 },
  { time: "06:00", country: "India", flag: "🇮🇳", currency: "INR", title: "Manufacturing PMI", impact: "medium", actual: "—", forecast: "57.4", previous: "57.1", dayOffset: 1 },
  { time: "08:30", country: "United Kingdom", flag: "🇬🇧", currency: "GBP", title: "BoE Rate Decision", impact: "high", actual: "—", forecast: "4.50%", previous: "4.75%", dayOffset: 1 },
  { time: "12:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "PPI m/m", impact: "medium", actual: "—", forecast: "0.2%", previous: "0.4%", dayOffset: 1 },
  { time: "14:00", country: "United States", flag: "🇺🇸", currency: "USD", title: "Consumer Sentiment (Prelim)", impact: "medium", actual: "—", forecast: "71.8", previous: "70.6", dayOffset: 1 },

  { time: "05:30", country: "India", flag: "🇮🇳", currency: "INR", title: "Industrial Production y/y", impact: "medium", actual: "—", forecast: "4.1%", previous: "3.6%", dayOffset: 2 },
  { time: "07:00", country: "United Kingdom", flag: "🇬🇧", currency: "GBP", title: "GDP m/m", impact: "high", actual: "—", forecast: "0.2%", previous: "0.1%", dayOffset: 2 },
  { time: "12:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "Non-Farm Payrolls", impact: "high", actual: "—", forecast: "168K", previous: "142K", dayOffset: 2 },
  { time: "12:30", country: "United States", flag: "🇺🇸", currency: "USD", title: "Unemployment Rate", impact: "high", actual: "—", forecast: "4.1%", previous: "4.2%", dayOffset: 2 },
];

export function economicCalendar(): CalendarEvent[] {
  return RAW.map((e, i) => ({ ...e, id: `evt-${i}` }));
}

export function dayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const label = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return offset === 0 ? `Today · ${label}` : offset === 1 ? `Tomorrow · ${label}` : label;
}
