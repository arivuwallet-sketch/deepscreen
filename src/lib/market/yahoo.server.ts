/**
 * Server-only Yahoo Finance client.
 * Public endpoints, no API key. Needs a session cookie + crumb for quoteSummary.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface Session {
  cookie: string;
  crumb: string;
  at: number;
}

let session: Session | null = null;

async function getSession(): Promise<Session | null> {
  if (session && Date.now() - session.at < 30 * 60_000) return session;
  try {
    const res = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    const raw = res.headers.get("set-cookie") ?? "";
    const cookie = raw
      .split(/,(?=[^;]+=[^;]+)/)
      .map((c) => c.split(";")[0]!.trim())
      .filter(Boolean)
      .join("; ");
    if (!cookie) return null;
    const cr = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(8000),
    });
    const crumb = (await cr.text()).trim();
    if (!crumb || crumb.length > 32) return null;
    session = { cookie, crumb, at: Date.now() };
    return session;
  } catch {
    return null;
  }
}

/** Map a DeepScreen exchange + symbol to a Yahoo ticker. */
export function yahooSymbol(exchange: string, symbol: string): string {
  const s = symbol.trim().toUpperCase().replace(/\s+/g, "-");
  switch (exchange.toUpperCase()) {
    case "NSE":
      return `${s}.NS`;
    case "BSE":
      return `${s}.BO`;
    case "LSE":
      return `${s}.L`;
    default:
      return s;
  }
}

export interface LiveQuote {
  symbol: string;
  price: number;
  previousClose: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  currency: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketState: string;
  asOf: string;
}

export async function fetchChartQuote(ySymbol: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(9000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: Record<string, unknown> }[] };
    };
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = Number(meta['regularMarketPrice']);
    const prev = Number(meta['chartPreviousClose'] ?? meta['previousClose'] ?? price);
    if (!Number.isFinite(price) || price <= 0) return null;
    return {
      symbol: ySymbol,
      price,
      previousClose: prev,
      changePct: prev > 0 ? ((price - prev) / prev) * 100 : 0,
      dayHigh: Number(meta['regularMarketDayHigh'] ?? price),
      dayLow: Number(meta['regularMarketDayLow'] ?? price),
      volume: Number(meta['regularMarketVolume'] ?? 0),
      currency: String(meta['currency'] ?? "USD"),
      fiftyTwoWeekHigh: Number(meta['fiftyTwoWeekHigh'] ?? 0),
      fiftyTwoWeekLow: Number(meta['fiftyTwoWeekLow'] ?? 0),
      marketState: String(meta['marketState'] ?? ""),
      asOf: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export interface LiveFundamentals {
  symbol: string;
  marketCap: number | null;
  currency: string | null;
  pe: number | null;
  forwardPe: number | null;
  peg: number | null;
  ps: number | null;
  pb: number | null;
  evRevenue: number | null;
  evEbitda: number | null;
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  ebitdaMargin: number | null;
  revenue: number | null;
  ebitda: number | null;
  freeCashflow: number | null;
  operatingCashflow: number | null;
  totalCash: number | null;
  totalDebt: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  beta: number | null;
  epsTtm: number | null;
  sharesOutstanding: number | null;
  bookValue: number | null;
  targetMeanPrice: number | null;
  recommendationKey: string | null;
  numberOfAnalysts: number | null;
  // profile
  sector: string | null;
  industry: string | null;
  website: string | null;
  employees: number | null;
  city: string | null;
  country: string | null;
  summary: string | null;
  officers: { name: string; title: string }[];
}

type Raw = Record<string, unknown>;

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "object" && v !== null && "raw" in (v as Raw)) {
    const r = (v as Raw)['raw'];
    return typeof r === "number" && Number.isFinite(r) ? r : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pct(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Number((n * 100).toFixed(2));
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function fetchFundamentals(ySymbol: string): Promise<LiveFundamentals | null> {
  const s = await getSession();
  if (!s) return null;
  try {
    const modules = "summaryDetail,defaultKeyStatistics,financialData,assetProfile,price";
    const res = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
        ySymbol,
      )}?modules=${modules}&crumb=${encodeURIComponent(s.crumb)}`,
      {
        headers: { "User-Agent": UA, Cookie: s.cookie },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) {
      if (res.status === 401) session = null;
      return null;
    }
    const json = (await res.json()) as { quoteSummary?: { result?: Raw[] } };
    const r = json.quoteSummary?.result?.[0];
    if (!r) return null;
    const sd = (r['summaryDetail'] ?? {}) as Raw;
    const ks = (r['defaultKeyStatistics'] ?? {}) as Raw;
    const fd = (r['financialData'] ?? {}) as Raw;
    const ap = (r['assetProfile'] ?? {}) as Raw;
    const pr = (r['price'] ?? {}) as Raw;

    const revenue = num(fd['totalRevenue']);
    const ebitda = num(fd['ebitda']);
    const marketCap = num(sd['marketCap']) ?? num(pr['marketCap']);
    const totalDebt = num(fd['totalDebt']);
    const totalCash = num(fd['totalCash']);
    const ev = num(ks['enterpriseValue']) ?? (marketCap !== null ? marketCap + (totalDebt ?? 0) - (totalCash ?? 0) : null);

    const officers = Array.isArray(ap['companyOfficers'])
      ? (ap['companyOfficers'] as Raw[])
          .map((o) => ({ name: str(o['name']) ?? "", title: str(o['title']) ?? "" }))
          .filter((o) => o.name)
          .slice(0, 5)
      : [];

    return {
      symbol: ySymbol,
      marketCap,
      currency: str(sd['currency']) ?? str(pr['currency']),
      pe: num(sd['trailingPE']),
      forwardPe: num(sd['forwardPE']),
      peg: num(ks['pegRatio']),
      ps: num(ks['priceToSalesTrailing12Months']) ?? num(sd['priceToSalesTrailing12Months']),
      pb: num(ks['priceToBook']),
      evRevenue: num(ks['enterpriseToRevenue']) ?? (ev && revenue ? Number((ev / revenue).toFixed(2)) : null),
      evEbitda: num(ks['enterpriseToEbitda']) ?? (ev && ebitda ? Number((ev / ebitda).toFixed(2)) : null),
      roe: pct(fd['returnOnEquity']),
      roa: pct(fd['returnOnAssets']),
      debtToEquity: num(fd['debtToEquity']) !== null ? Number((num(fd['debtToEquity'])! / 100).toFixed(2)) : null,
      currentRatio: num(fd['currentRatio']),
      quickRatio: num(fd['quickRatio']),
      grossMargin: pct(fd['grossMargins']),
      operatingMargin: pct(fd['operatingMargins']),
      netMargin: pct(fd['profitMargins']) ?? pct(ks['profitMargins']),
      ebitdaMargin: pct(fd['ebitdaMargins']),
      revenue,
      ebitda,
      freeCashflow: num(fd['freeCashflow']),
      operatingCashflow: num(fd['operatingCashflow']),
      totalCash,
      totalDebt,
      revenueGrowth: pct(fd['revenueGrowth']),
      earningsGrowth: pct(fd['earningsGrowth']) ?? pct(ks['earningsQuarterlyGrowth']),
      dividendYield: num(sd['dividendYield']) !== null ? Number(num(sd['dividendYield'])!.toFixed(2)) : null,
      payoutRatio: pct(sd['payoutRatio']),
      beta: num(sd['beta']) ?? num(ks['beta']),
      epsTtm: num(ks['trailingEps']),
      sharesOutstanding: num(ks['sharesOutstanding']),
      bookValue: num(ks['bookValue']),
      targetMeanPrice: num(fd['targetMeanPrice']),
      recommendationKey: str(fd['recommendationKey']),
      numberOfAnalysts: num(fd['numberOfAnalystOpinions']),
      sector: str(ap['sector']),
      industry: str(ap['industry']),
      website: str(ap['website']),
      employees: num(ap['fullTimeEmployees']),
      city: str(ap['city']),
      country: str(ap['country']),
      summary: str(ap['longBusinessSummary']),
      officers,
    };
  } catch {
    return null;
  }
}

export async function fetchWikiSummary(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, "_"))}`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(7000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { extract?: string; type?: string };
    if (json.type === "disambiguation") return null;
    return json.extract?.trim() || null;
  } catch {
    return null;
  }
}
