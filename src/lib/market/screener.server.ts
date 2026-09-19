// Yahoo Finance's coverage of Indian small/micro-caps is thin and
import { isAllowedScreenerPath, normalizeCompanyName, normalizeSymbol } from "@/lib/security";

// sometimes stale (missing ROE/ROA/ROCE entirely, or a trailingPE computed
// off an outdated EPS for a company whose earnings recently swung sharply —
// exactly the kind of company this ends up mattering most for). Screener.in
// sources directly from BSE/NSE company filings and is the go-to reference
// for Indian retail investors precisely because it's far more reliable here
// than international aggregators.
//
// There's no public API, so this scrapes the same "Summary" ratio block a
// person sees at the top of a company page. It's necessarily best-effort:
// screener.in's markup isn't a documented contract the way an API is, and
// their URL scheme resolves some companies by ticker and others only by
// BSE's numeric scrip code (which this app doesn't otherwise track) — so a
// failed fetch here is expected for some names, not a bug. Every failure
// mode returns null and the caller falls back to Yahoo + the modeled
// estimate, exactly as if this module didn't exist.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export interface ScreenerRatios {
  price: number | null;
  marketCapCr: number | null;
  pe: number | null;
  bookValue: number | null;
  dividendYieldPct: number | null;
  rocePct: number | null;
  roePct: number | null;
  faceValue: number | null;
  /** TTM YoY profit (EPS) growth rate in %. */
  earningsGrowthPct: number | null;
  /** 3-year compounded profit growth in % — used as the PEG denominator. */
  earningsGrowth3YPct: number | null;
  /** Debt to equity ratio computed from balance sheet (most recent year). */
  deRatio: number | null;
  /** Return on assets % computed from balance sheet + P&L (most recent year). */
  roaPct: number | null;
  /** Screener company path that produced these figures. */
  resolvedSlug?: string;
}

/**
 * Screener.in's company page renders its summary ratios inside a container
 * anchored by id="top-ratios". Isolating that block before searching for any
 * individual label keeps this from accidentally matching the same word
 * appearing later in the page (e.g. "ROE" inside a pros/cons sentence, or in
 * a 10-year historical ROE table further down).
 */
function isolateTopRatiosBlock(html: string): string | null {
  const anchor = html.indexOf('id="top-ratios"');
  if (anchor === -1) return null;
  return html.slice(anchor, anchor + 4000);
}

function extractLabelValue(block: string, label: string): number | null {
  // Screener.in wraps labels in <span class="name"> with whitespace/newlines
  // around the text.  Use a regex that tolerates arbitrary whitespace between
  // the opening tag and the label text, then scans forward for the numeric
  // value in the sibling <span class="number"> element.
  const pattern = new RegExp(
    `<[^>]*>\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<`,
    "i",
  );
  const match = pattern.exec(block);
  if (!match) return null;

  const idx = match.index;
  const window = block.slice(idx, idx + 500);
  const numMatch = window.match(/-?[\d,]+\.?\d*/);
  if (!numMatch) return null;
  const n = Number(numMatch[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Extract a specific time-period figure from Screener.in's
 * "Compounded Profit Growth" ranges-table.
 */
function extractProfitGrowth(html: string, period: string): number | null {
  const sectionStart = html.indexOf("Compounded Profit Growth");
  if (sectionStart === -1) return null;
  const window = html.slice(sectionStart, sectionStart + 600);
  const escaped = period.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped + "[\\s\\S]*?<td>\\s*(-?[\\d,.]+)%", "i");
  const m = re.exec(window);
  if (!m) return null;
  const n = Number(m[1]!.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Extract balance sheet items from Screener.in and compute D/E and ROA.
 *
 * The balance sheet table has columns from oldest (left) to most recent
 * (right). We extract the LAST column (most recent fiscal year).
 *
 * For D/E: borrowings / equity where equity = equity capital + reserves
 * For ROA: net profit / total assets × 100 (from P&L + balance sheet)
 */
function extractBalanceSheetAndCompute(html: string): {
  deRatio: number | null;
  roaPct: number | null;
} {
  // Find the balance sheet section
  const bsIdx = html.indexOf("Balance Sheet</h2>");
  if (bsIdx === -1) return { deRatio: null, roaPct: null };
  const section = html.slice(bsIdx, bsIdx + 25000);

  // Find the table
  const tableMatch = section.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch || !tableMatch[1]) return { deRatio: null, roaPct: null };
  const table = tableMatch[1]!;

  // Extract all rows
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  // Helper: extract the LAST numeric value from a row containing the label
  const extractLastValue = (label: string): number | null => {
    for (const row of rows) {
      const rowContent = row[1];
      if (!rowContent || !rowContent.includes(label)) continue;
      const tds = [...rowContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      if (tds.length < 2) continue;
      // Last td value = most recent year
      const lastTd = tds[tds.length - 1];
      if (!lastTd || !lastTd[1]) continue;
      const numMatch = lastTd[1].match(/[\d,]+\.?\d*/);
      if (!numMatch) continue;
      const n = Number(numMatch[0].replace(/,/g, ""));
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
  };

  const equityCapital = extractLastValue("Equity Capital");
  const reserves = extractLastValue("Reserves");
  const borrowings = extractLastValue("Borrowings");
  const totalAssets = extractLastValue("Total Assets");

  // D/E = Borrowings / (Equity Capital + Reserves)
  let deRatio: number | null = null;
  if (borrowings != null && equityCapital != null && reserves != null) {
    const equity = equityCapital + reserves;
    if (equity > 0) {
      deRatio = borrowings / equity;
    }
  }

  // ROA = Net Income / Total Assets × 100
  // We need Net Income from the P&L section
  let roaPct: number | null = null;
  const pnlIdx = html.indexOf("Profit & Loss</h2>");
  if (pnlIdx !== -1 && totalAssets != null && totalAssets > 0) {
    const pnlSection = html.slice(pnlIdx, pnlIdx + 60000);
    const pnlTableMatch = pnlSection.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (pnlTableMatch && pnlTableMatch[1]) {
      const pnlContent = pnlTableMatch[1]!;
      const pnlRows = [...pnlContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      for (const row of pnlRows) {
        const rowContent = row[1];
        if (!rowContent) continue;
        if (
          !rowContent.includes("Net Profit") &&
          !rowContent.includes("Profit for the year") &&
          !rowContent.includes("net profit")
        )
          continue;
        const tds = [...rowContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        if (tds.length < 2) continue;
        const lastTd = tds[tds.length - 1];
        if (!lastTd || !lastTd[1]) continue;
        const numMatch = lastTd[1].match(/[\d,]+\.?\d*/);
        if (!numMatch) continue;
        const netProfit = Number(numMatch[0].replace(/,/g, ""));
        if (Number.isFinite(netProfit) && netProfit > 0) {
          roaPct = (netProfit / totalAssets) * 100;
        }
        break;
      }
    }
  }

  return {
    deRatio: deRatio != null && Number.isFinite(deRatio) ? Number(deRatio.toFixed(2)) : null,
    roaPct: roaPct != null && Number.isFinite(roaPct) ? Number(roaPct.toFixed(1)) : null,
  };
}

async function fetchAndParse(url: string): Promise<ScreenerRatios | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const block = isolateTopRatiosBlock(html);
  if (!block) return null;

  const { deRatio, roaPct } = extractBalanceSheetAndCompute(html);

  const ratios: ScreenerRatios = {
    price: extractLabelValue(block, "Current Price"),
    marketCapCr: extractLabelValue(block, "Market Cap"),
    pe: extractLabelValue(block, "Stock P/E"),
    bookValue: extractLabelValue(block, "Book Value"),
    dividendYieldPct: extractLabelValue(block, "Dividend Yield"),
    rocePct: extractLabelValue(block, "ROCE"),
    roePct: extractLabelValue(block, "ROE"),
    faceValue: extractLabelValue(block, "Face Value"),
    earningsGrowthPct: extractProfitGrowth(html, "TTM"),
    earningsGrowth3YPct: extractProfitGrowth(html, "3 Years"),
    deRatio,
    roaPct,
    resolvedSlug: new URL(res.url).pathname,
  };

  // If NONE of the fields resolved, the label-matching heuristic almost
  // certainly missed a markup change rather than the page genuinely having
  // no ratios — treat that as a failure, not a stock with no data.
  const anyField = Object.values(ratios).some((v) => v !== null);
  return anyField ? ratios : null;
}

interface SearchHit {
  id?: number;
  name?: string;
  url?: string;
}

function normalizedWords(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/\b(limited|ltd|plc|inc|company|co)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

async function searchCompany(query: string, companyName?: string): Promise<string | null> {
  if (!query.trim()) return null;
  const res = await fetch(`https://www.screener.in/api/company/search/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) return null;
  const hits = (await res.json()) as SearchHit[];
  if (!Array.isArray(hits) || hits.length === 0) return null;

  const wanted = new Set(normalizedWords(companyName ?? query));
  const ranked = hits
    .filter((hit) => typeof hit.url === "string" && hit.url.startsWith("/company/"))
    .map((hit) => {
      const words = normalizedWords(hit.name ?? "");
      const overlap = words.filter((word) => wanted.has(word)).length;
      return { hit, score: overlap / Math.max(1, wanted.size) };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.hit.url ?? null;
}

export async function fetchScreenerRatios(
  symbol: string,
  companyName?: string,
  knownSlug?: string | null,
): Promise<ScreenerRatios | null> {
  try {
    const safeSymbol = normalizeSymbol(symbol);
    if (!safeSymbol) return null;
    const safeCompanyName = companyName ? normalizeCompanyName(companyName) : null;
    if (companyName && !safeCompanyName) return null;
    if (knownSlug) {
      // Only server-generated Screener company paths are accepted here. Never
      // let a caller turn this helper into an arbitrary outbound fetcher.
      try {
        const knownUrl = new URL(knownSlug, "https://www.screener.in");
        if (
          knownUrl.origin === "https://www.screener.in" &&
          isAllowedScreenerPath(knownUrl.pathname) &&
          !knownUrl.search &&
          !knownUrl.hash
        ) {
          const known = await fetchAndParse(knownUrl.toString());
          if (known) return known;
        }
      } catch {
        // Ignore malformed cached paths and fall back to the normal resolver.
      }
    }
    // /consolidated/ first — the standalone page shows wrong values for
    // some companies (e.g. RELIANCE shows P/E 44.4 which is actually
    // PB×PE, not the real P/E of 23.2). Consolidated is correct.
    //
    // BUT: /consolidated/ only exists for companies that actually file
    // consolidated statements (i.e. have subsidiaries) — the majority of
    // small/mid-cap Indian companies are standalone-only and 404 there. The
    // earlier version stopped at that 404 and returned null, meaning this
    // whole feature silently produced NO data at all for most small-caps —
    // exactly the category it exists to help most. Falling back to the
    // standalone page keeps every listed company covered; only the (rarer)
    // large companies with subsidiaries carry the small residual risk the
    // consolidated switch was meant to avoid.
    const consolidated = await fetchAndParse(
      `https://www.screener.in/company/${encodeURIComponent(safeSymbol)}/consolidated/`,
    );
    if (consolidated) return consolidated;

    const standalone = await fetchAndParse(
      `https://www.screener.in/company/${encodeURIComponent(safeSymbol)}/`,
    );
    if (standalone) return standalone;

    // Some exchange symbols do not match Screener's slug (notably numeric BSE
    // pages and renamed/demerged companies). Resolve those through the same
    // search endpoint used by Screener's own search box.
    const symbolMatch = await searchCompany(safeSymbol, safeCompanyName ?? undefined);
    const nameMatch = symbolMatch ?? (safeCompanyName ? await searchCompany(safeCompanyName, safeCompanyName) : null);
    return nameMatch
      ? await fetchAndParse(new URL(nameMatch, "https://www.screener.in").toString())
      : null;
  } catch {
    return null;
  }
}
