// Live IPO pipeline. Two public sources cover four of the five exchanges:
//   * NSE India   — /api/all-upcoming-issues + /api/ipo-current-issue
//                   (mainboard + SME; BSE-only issues are flagged by isBse)
//   * Nasdaq Trader — /api/ipo/calendar, which carries the whole US calendar
//                   (upcoming, priced and filed) for NASDAQ *and* NYSE.
// LSE publishes no open new-issues feed, so those come from the curated list
// in src/lib/deepscreen/ipos.ts and are merged by the caller.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface LiveIpo {
  symbol: string;
  name: string;
  exchange: string;
  /** "mainboard" | "sme" | "us" — used for the board's segment filter. */
  segment: string;
  bandLow: number | null;
  bandHigh: number | null;
  /** Shares on offer (India) or shares offered (US). */
  sharesOffered: number | null;
  /** Issue value in local-currency billions, when derivable. */
  issueSize: number | null;
  openDate: string | null;
  closeDate: string | null;
  listingDate: string | null;
  status: "upcoming" | "open" | "closed" | "listed";
  note: string;
}

const CACHE_MS = 10 * 60_000;
let cache: { at: number; data: LiveIpo[] } | null = null;

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoOf(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

/** "03-Sep-2026" → Date */
function parseNseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const mi = months.indexOf((m[2] ?? "").toLowerCase());
  if (mi < 0) return null;
  return new Date(Date.UTC(Number(m[3]), mi, Number(m[1])));
}

/** "9/08/2026" → Date */
function parseUsDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2])));
}

function num(s: unknown): number | null {
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  if (typeof s !== "string") return null;
  const n = Number(s.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) && s.trim() !== "" ? n : null;
}

/** "Rs.168 to Rs.177" / "Rs. 90" → [low, high] */
function parseBand(s: string | undefined): [number | null, number | null] {
  if (!s) return [null, null];
  const nums = (s.match(/[\d,]+(?:\.\d+)?/g) ?? []).map((x) => Number(x.replace(/,/g, "")));
  if (nums.length === 0) return [null, null];
  if (nums.length === 1) return [nums[0] ?? null, nums[0] ?? null];
  return [Math.min(...nums), Math.max(...nums)];
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
  status?: string;
  isBse?: string;
  issuePrice?: string;
  issueSize?: string;
  noOfSharesOffered?: string;
  issueStartDate?: string;
  issueEndDate?: string;
}

function mapNse(rows: NseRow[], fallbackSegment: string): LiveIpo[] {
  return rows
    .filter((r) => r.symbol || r.companyName)
    .map((r) => {
      const open = parseNseDate(r.issueStartDate);
      const close = parseNseDate(r.issueEndDate);
      // Indian issues typically list ~3 working days after close.
      const listing = close ? new Date(close.getTime() + 3 * 86400000) : null;
      const [bandLow, bandHigh] = parseBand(r.issuePrice);
      const shares = num(r.issueSize) ?? num(r.noOfSharesOffered);
      const value = shares && bandHigh ? (shares * bandHigh) / 1e9 : null;
      const sme = (r.series ?? "").toUpperCase() === "SME";
      return {
        symbol: (r.symbol || r.companyName || "").trim().toUpperCase().slice(0, 20),
        name: (r.companyName ?? r.symbol ?? "").trim(),
        exchange: r.isBse === "1" && (r.series ?? "").toUpperCase() === "SME" ? "BSE" : "NSE",
        segment: sme ? "sme" : fallbackSegment,
        bandLow,
        bandHigh,
        sharesOffered: shares,
        issueSize: value,
        openDate: isoOf(open),
        closeDate: isoOf(close),
        listingDate: isoOf(listing),
        status: statusFrom(open, close, listing),
        note: sme ? "SME platform issue." : "Mainboard book-built issue.",
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
  const s = (label ?? "").toUpperCase();
  if (s.includes("NYSE") || s.includes("NEW YORK")) return "NYSE";
  return "NASDAQ";
}

function mapNasdaq(rows: NasdaqRow[], kind: "upcoming" | "priced" | "filed"): LiveIpo[] {
  return rows
    .filter((r) => r.companyName)
    .map((r) => {
      const dateStr = kind === "priced" ? r.pricedDate : kind === "upcoming" ? r.expectedPriceDate : r.filedDate;
      const d = parseUsDate(dateStr);
      const price = num(r.proposedSharePrice);
      const value = num(r.dollarValueOfSharesOffered);
      const status: LiveIpo["status"] =
        kind === "priced" ? "listed" : kind === "filed" ? "upcoming" : statusFrom(d, d, d);
      return {
        symbol: (r.proposedTickerSymbol ?? "").trim().toUpperCase() || "—",
        name: (r.companyName ?? "").trim(),
        exchange: usExchange(r.proposedExchange),
        segment: "us",
        bandLow: price,
        bandHigh: price,
        sharesOffered: num(r.sharesOffered),
        issueSize: value ? value / 1e9 : null,
        openDate: isoOf(d),
        closeDate: isoOf(d),
        listingDate: kind === "priced" ? isoOf(d) : isoOf(d),
        status,
        note:
          kind === "priced"
            ? "Priced and listed on the US calendar."
            : kind === "filed"
              ? "S-1 filed; pricing date not yet set."
              : "Expected to price on the US calendar.",
      } satisfies LiveIpo;
    });
}

async function fetchIndia(): Promise<LiveIpo[]> {
  const ref = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo";
  const [upcoming, current] = await Promise.all([
    getJson("https://www.nseindia.com/api/all-upcoming-issues?category=ipo", ref),
    getJson("https://www.nseindia.com/api/ipo-current-issue", ref),
  ]);
  const rows: LiveIpo[] = [];
  if (Array.isArray(upcoming)) rows.push(...mapNse(upcoming as NseRow[], "mainboard"));
  if (Array.isArray(current)) rows.push(...mapNse(current as NseRow[], "mainboard"));
  return rows;
}

function monthKey(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function fetchUs(): Promise<LiveIpo[]> {
  const months = [-1, 0, 1, 2].map(monthKey);
  const out: LiveIpo[] = [];
  const results = await Promise.all(
    months.map((m) =>
      getJson(`https://api.nasdaq.com/api/ipo/calendar?date=${m}`, "https://www.nasdaq.com/market-activity/ipos"),
    ),
  );
  for (const res of results) {
    const data = (
      res as {
        data?: {
          upcoming?: { upcomingTable?: { rows?: NasdaqRow[] } | null } | null;
          priced?: { rows?: NasdaqRow[] } | null;
          filed?: { rows?: NasdaqRow[] } | null;
        };
      } | null
    )?.data;
    if (!data) continue;
    out.push(...mapNasdaq(data.upcoming?.upcomingTable?.rows ?? [], "upcoming"));
    out.push(...mapNasdaq(data.priced?.rows ?? [], "priced"));
    out.push(...mapNasdaq(data.filed?.rows ?? [], "filed"));
  }
  return out;
}

/** All live issues across NSE/BSE/NYSE/NASDAQ, de-duplicated and date-sorted. */
export async function fetchLiveIpos(): Promise<LiveIpo[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  const [india, us] = await Promise.all([fetchIndia(), fetchUs()]);
  const seen = new Set<string>();
  const merged: LiveIpo[] = [];
  for (const ipo of [...india, ...us]) {
    if (!ipo.name) continue;
    const key = `${ipo.exchange}:${ipo.symbol}:${ipo.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ipo);
  }
  merged.sort((a, b) => (b.openDate ?? "").localeCompare(a.openDate ?? ""));

  if (merged.length > 0) cache = { at: Date.now(), data: merged };
  return merged;
}
