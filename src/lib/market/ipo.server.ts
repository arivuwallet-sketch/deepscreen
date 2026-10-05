// Live IPO pipeline for the five exchanges covered by DeepScreen:
//   * NSE/BSE India — official NSE issue feeds, including BSE flags where supplied
//   * NYSE/NASDAQ   — Nasdaq IPO calendar powered by EDGAR Online
//   * LSE           — London Stock Exchange official New Issues page
//
// Missing fields stay null. DeepScreen never invents offer terms, subscription
// figures or listing dates when the upstream source does not publish them.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface LiveIpo {
  symbol: string;
  name: string;
  exchange: string;
  /** "mainboard" | "sme" | "us" */
  segment: string;
  market: string | null;
  securityType: string | null;
  currency: string | null;
  bandLow: number | null;
  bandHigh: number | null;
  /** Shares offered/reserved, where the source publishes it. */
  sharesOffered: number | null;
  /** Bids received across reported categories, where published. */
  bidsReceived: number | null;
  /** Official subscription multiple, e.g. 12.2 = 12.2x. */
  subscriptionMultiple: number | null;
  /** Minimum bid / market lot where published. */
  lotSize: number | null;
  /** Issue value in local-currency billions, when directly reported or safely derivable. */
  issueSize: number | null;
  /** LSE primary/secondary offer values in local-currency billions. */
  primaryOfferSize: number | null;
  secondaryOfferSize: number | null;
  openDate: string | null;
  closeDate: string | null;
  /** Actual/official listing date where known, or an exchange-published expected first-trading date. */
  listingDate: string | null;
  /** US filing date, kept separate from offer dates. */
  filingDate: string | null;
  /** US expected pricing date. Nasdaq notes this is estimated from filings. */
  expectedPricingDate: string | null;
  status: "upcoming" | "open" | "closed" | "listed";
  note: string;
  timelineBasis: string;
  fetchedAt: string;
  sourceUrl: string;
  source: "NSE official" | "BSE via NSE issue flag" | "Nasdaq/EDGAR Online" | "LSE official";
}

const CACHE_MS = 5 * 60_000;
let cache: { at: number; data: LiveIpo[] } | null = null;

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoOf(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

function parseNseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const value = s.trim();
  const dmy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(value);
  if (dmy) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mi = months.indexOf((dmy[2] ?? "").toLowerCase());
    if (mi >= 0) return new Date(Date.UTC(Number(dmy[3]), mi, Number(dmy[1])));
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
  return null;
}

function parseUsDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2])));
}

function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const clean = value.replace(/,/g, "").replace(/[^0-9.\-]/g, "");
  const parsed = Number(clean);
  return Number.isFinite(parsed) && value.trim() !== "" ? parsed : null;
}

function firstNum(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = num(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

/** "Rs.168 to Rs.177", "$12 - $14", "£2.50" → [low, high]. */
function parseBand(value: string | null | undefined): [number | null, number | null] {
  if (!value) return [null, null];
  const values = (value.match(/[\d,]+(?:\.\d+)?/g) ?? [])
    .map((part) => Number(part.replace(/,/g, "")))
    .filter(Number.isFinite);
  if (values.length === 0) return [null, null];
  if (values.length === 1) return [values[0] ?? null, values[0] ?? null];
  return [Math.min(...values), Math.max(...values)];
}

function statusFrom(open: Date | null, close: Date | null, listing: Date | null): LiveIpo["status"] {
  const t = today().getTime();
  if (listing && listing.getTime() <= t) return "listed";
  if (close && close.getTime() < t) return "closed";
  if (open && open.getTime() <= t) return "open";
  return "upcoming";
}

async function getJson(url: string, referer: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: referer,
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

interface NseRow {
  companyName?: string;
  symbol?: string;
  series?: string;
  securityType?: string;
  status?: string;
  isBse?: string;
  issuePrice?: string;
  issueSize?: string;
  noOfSharesOffered?: string;
  sharesOffered?: string;
  offeredReserved?: string;
  noOfSharesBid?: string;
  totalBidQty?: string;
  bidQuantity?: string;
  subscription?: string;
  subscriptionTimes?: string;
  timesSubscribed?: string;
  noOfTimes?: string;
  minBidQuantity?: string;
  marketLot?: string;
  lotSize?: string;
  issueStartDate?: string;
  issueEndDate?: string;
  listingDate?: string;
  dateOfListing?: string;
  listingDt?: string;
}

function mapNse(rows: NseRow[], fallbackSegment: string, fetchedAt: string): LiveIpo[] {
  const sourceUrl = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo";
  return rows
    .filter((row) => row.symbol || row.companyName)
    .map((row) => {
      const open = parseNseDate(row.issueStartDate);
      const close = parseNseDate(row.issueEndDate);
      const listing = parseNseDate(row.listingDate ?? row.dateOfListing ?? row.listingDt);
      const [bandLow, bandHigh] = parseBand(row.issuePrice);
      const shares = firstNum(row.noOfSharesOffered, row.sharesOffered, row.offeredReserved);
      const bids = firstNum(row.noOfSharesBid, row.totalBidQty, row.bidQuantity);
      const reportedMultiple = firstNum(
        row.subscription,
        row.subscriptionTimes,
        row.timesSubscribed,
        row.noOfTimes,
      );
      const subscriptionMultiple =
        reportedMultiple ?? (shares && shares > 0 && bids !== null ? bids / shares : null);
      const lotSize = firstNum(row.minBidQuantity, row.marketLot, row.lotSize);
      const issueSize = shares && bandHigh ? (shares * bandHigh) / 1e9 : null;
      const sme = (row.series ?? "").toUpperCase() === "SME";
      const exchange = row.isBse === "1" ? "BSE" : "NSE";
      const status = statusFrom(open, close, listing);

      return {
        symbol: (row.symbol || row.companyName || "").trim().toUpperCase().slice(0, 30),
        name: (row.companyName ?? row.symbol ?? "").trim(),
        exchange,
        segment: sme ? "sme" : fallbackSegment,
        market: sme ? "SME" : "Mainboard",
        securityType: row.securityType ?? row.series ?? "Equity",
        currency: "INR",
        bandLow,
        bandHigh,
        sharesOffered: shares,
        bidsReceived: bids,
        subscriptionMultiple:
          subscriptionMultiple !== null && Number.isFinite(subscriptionMultiple)
            ? Number(subscriptionMultiple.toFixed(2))
            : null,
        lotSize,
        issueSize,
        primaryOfferSize: null,
        secondaryOfferSize: null,
        openDate: isoOf(open),
        closeDate: isoOf(close),
        listingDate: isoOf(listing),
        filingDate: null,
        expectedPricingDate: null,
        status,
        note: sme
          ? "SME platform issue. Subscription figures are shown only when published by the official NSE issue feed."
          : "Mainboard issue. Subscription figures are shown only when published by the official NSE issue feed.",
        timelineBasis: listing
          ? "Official exchange issue/listing dates"
          : "Official issue dates; listing date not published in this feed",
        fetchedAt,
        sourceUrl,
        source: exchange === "BSE" ? "BSE via NSE issue flag" : "NSE official",
      } satisfies LiveIpo;
    });
}

interface NasdaqRow {
  proposedTickerSymbol?: string | null;
  companyName?: string;
  proposedExchange?: string | null;
  proposedSharePrice?: string | null;
  sharesOffered?: string | null;
  expectedPriceDate?: string | null;
  pricedDate?: string | null;
  filedDate?: string | null;
  dollarValueOfSharesOffered?: string | null;
}

function usExchange(label: string | null | undefined): string {
  const value = (label ?? "").toUpperCase();
  if (value.includes("NYSE") || value.includes("NEW YORK")) return "NYSE";
  return "NASDAQ";
}

function mapNasdaq(
  rows: NasdaqRow[],
  kind: "upcoming" | "priced" | "filed",
  fetchedAt: string,
): LiveIpo[] {
  const sourceUrl = "https://www.nasdaq.com/market-activity/ipos";
  return rows
    .filter((row) => row.companyName)
    .map((row) => {
      const expectedPrice = parseUsDate(row.expectedPriceDate);
      const priced = parseUsDate(row.pricedDate);
      const filed = parseUsDate(row.filedDate);
      const [bandLow, bandHigh] = parseBand(row.proposedSharePrice);
      const shares = num(row.sharesOffered);
      const directValue = num(row.dollarValueOfSharesOffered);
      const issueSize =
        directValue !== null
          ? directValue / 1e9
          : shares && bandHigh
            ? (shares * bandHigh) / 1e9
            : null;
      const exchange = usExchange(row.proposedExchange);
      const status: LiveIpo["status"] = kind === "priced" ? "listed" : "upcoming";

      return {
        symbol: (row.proposedTickerSymbol ?? "").trim().toUpperCase() || "—",
        name: (row.companyName ?? "").trim(),
        exchange,
        segment: "us",
        market: row.proposedExchange?.trim() || exchange,
        securityType: "Equity",
        currency: "USD",
        bandLow,
        bandHigh,
        sharesOffered: shares,
        bidsReceived: null,
        subscriptionMultiple: null,
        lotSize: null,
        issueSize,
        primaryOfferSize: null,
        secondaryOfferSize: null,
        openDate: null,
        closeDate: null,
        listingDate: kind === "priced" ? isoOf(priced) : null,
        filingDate: isoOf(filed),
        expectedPricingDate: kind === "upcoming" ? isoOf(expectedPrice) : null,
        status,
        note:
          kind === "priced"
            ? "Priced issue from the Nasdaq IPO calendar."
            : kind === "filed"
              ? "SEC filing shown by the Nasdaq/EDGAR Online IPO calendar; pricing date is not yet set."
              : "Expected pricing date from the Nasdaq/EDGAR Online calendar. Nasdaq states expected dates are estimates based on filings.",
        timelineBasis:
          kind === "priced"
            ? "Priced date reported by Nasdaq/EDGAR Online"
            : kind === "filed"
              ? "SEC filing date; no offer/listing date inferred"
              : "Expected pricing date estimated by EDGAR Online from filings",
        fetchedAt,
        sourceUrl,
        source: "Nasdaq/EDGAR Online",
      } satisfies LiveIpo;
    });
}

async function fetchIndia(fetchedAt: string): Promise<LiveIpo[]> {
  const ref = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo";
  const [upcoming, current] = await Promise.all([
    getJson("https://www.nseindia.com/api/all-upcoming-issues?category=ipo", ref),
    getJson("https://www.nseindia.com/api/ipo-current-issue", ref),
  ]);
  const rows: LiveIpo[] = [];
  if (Array.isArray(upcoming)) rows.push(...mapNse(upcoming as NseRow[], "mainboard", fetchedAt));
  if (Array.isArray(current)) rows.push(...mapNse(current as NseRow[], "mainboard", fetchedAt));
  return rows;
}

function monthKey(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&pound;/gi, "£")
    .replace(/&#163;/g, "£")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLseDate(value: string): Date | null {
  const exact = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i.exec(value);
  if (exact) {
    const month = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ].indexOf((exact[2] ?? "").toLowerCase());
    if (month >= 0) return new Date(Date.UTC(Number(exact[3]), month, Number(exact[1])));
  }

  const approximate = /(?:early|mid|late)?\s*([A-Za-z]+)\s+(\d{4})/i.exec(value);
  if (!approximate) return null;
  const month = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf((approximate[1] ?? "").toLowerCase());
  if (month < 0) return null;
  const day = /early/i.test(value) ? 8 : /late/i.test(value) ? 25 : /mid/i.test(value) ? 15 : 1;
  return new Date(Date.UTC(Number(approximate[2]), month, day));
}

function parseLseSize(value: string): number | null {
  const match = /([\d,.]+)\s*(billion|million|bn|m)/i.exec(value);
  if (!match) return null;
  const parsed = Number((match[1] ?? "").replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return /billion|bn/i.test(match[2] ?? "") ? parsed : parsed / 1000;
}

/** London Stock Exchange official New Issues page. Only upcoming equity issues are kept. */
async function fetchLse(fetchedAt: string): Promise<LiveIpo[]> {
  const url = "https://www.londonstockexchange.com/live-markets/new-issues";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const start = html.search(/Upcoming issues/i);
    const end = html.search(/Recent issues/i);
    if (start < 0 || end <= start) return [];

    const section = html.slice(start, end);
    const rows = section.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
    const out: LiveIpo[] = [];

    for (const row of rows) {
      const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? []).map(decodeHtml);
      // Official LSE order:
      // Name | Market | Primary offer | Secondary offer | Currency | Price range | Expected first date | Type
      if (cells.length < 8 || /^name$/i.test(cells[0] ?? "")) continue;
      const type = cells[7] ?? "";
      if (!/equity/i.test(type)) continue;

      const name = cells[0] ?? "";
      const market = cells[1] ?? "";
      const primary = parseLseSize(cells[2] ?? "");
      const secondary = parseLseSize(cells[3] ?? "");
      const rawCurrency = (cells[4] ?? "").trim();
      const currency = rawCurrency && rawCurrency !== "-" ? rawCurrency : "GBP";
      const [bandLow, bandHigh] = parseBand(cells[5] ?? "");
      const expected = cells[6] ?? "";
      const listing = parseLseDate(expected);
      const size =
        primary !== null && secondary !== null ? primary + secondary : primary ?? secondary;
      if (!name) continue;

      out.push({
        symbol: "—",
        name,
        exchange: "LSE",
        segment: /AIM/i.test(market) ? "sme" : "mainboard",
        market: market || null,
        securityType: type || "Equity",
        currency,
        bandLow,
        bandHigh,
        sharesOffered: null,
        bidsReceived: null,
        subscriptionMultiple: null,
        lotSize: null,
        issueSize: size,
        primaryOfferSize: primary,
        secondaryOfferSize: secondary,
        openDate: null,
        closeDate: null,
        listingDate: isoOf(listing),
        filingDate: null,
        expectedPricingDate: null,
        status: listing && listing.getTime() <= today().getTime() ? "listed" : "upcoming",
        note: `Expected first trading date from the LSE official New Issues feed: ${expected || "TBA"}.`,
        timelineBasis: "Exchange-published expected first trading date",
        fetchedAt,
        sourceUrl: url,
        source: "LSE official",
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchUs(fetchedAt: string): Promise<LiveIpo[]> {
  const months = [-1, 0, 1, 2].map(monthKey);
  const out: LiveIpo[] = [];
  const results = await Promise.all(
    months.map((month) =>
      getJson(
        `https://api.nasdaq.com/api/ipo/calendar?date=${month}`,
        "https://www.nasdaq.com/market-activity/ipos",
      ),
    ),
  );

  for (const result of results) {
    const data = (
      result as {
        data?: {
          upcoming?: { upcomingTable?: { rows?: NasdaqRow[] } | null } | null;
          priced?: { rows?: NasdaqRow[] } | null;
          filed?: { rows?: NasdaqRow[] } | null;
        };
      } | null
    )?.data;
    if (!data) continue;
    out.push(...mapNasdaq(data.upcoming?.upcomingTable?.rows ?? [], "upcoming", fetchedAt));
    out.push(...mapNasdaq(data.priced?.rows ?? [], "priced", fetchedAt));
    out.push(...mapNasdaq(data.filed?.rows ?? [], "filed", fetchedAt));
  }
  return out;
}

/** All live issues across NSE/BSE/NYSE/NASDAQ/LSE, de-duplicated and date-sorted. */
export async function fetchLiveIpos(): Promise<LiveIpo[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  const fetchedAt = new Date().toISOString();
  const [india, us, lse] = await Promise.all([
    fetchIndia(fetchedAt),
    fetchUs(fetchedAt),
    fetchLse(fetchedAt),
  ]);

  const seen = new Set<string>();
  const merged: LiveIpo[] = [];
  for (const ipo of [...india, ...us, ...lse]) {
    if (!ipo.name) continue;
    const key = `${ipo.exchange}:${ipo.symbol}:${ipo.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ipo);
  }

  const dateKey = (ipo: LiveIpo) =>
    ipo.openDate ?? ipo.expectedPricingDate ?? ipo.listingDate ?? ipo.filingDate ?? "";
  merged.sort((a, b) => dateKey(b).localeCompare(dateKey(a)));

  if (merged.length > 0) cache = { at: Date.now(), data: merged };
  return merged;
}
