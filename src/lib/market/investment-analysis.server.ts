import type { InvestmentType } from "@/lib/deepscreen/investments";
import {
  computeHistoricalMetrics,
  parseMutualFundPlan,
  type FundProfileAnalysis,
  type HoldingQualityAnalysis,
  type HistoricalPoint,
  type InvestmentAnalysisData,
  type InvestmentHolding,
  type MutualFundMetadata,
  type ReitAnalysis,
  type SectorWeight,
} from "@/lib/deepscreen/investment-analysis";
import { fetchFundamentals, type LiveFundamentals } from "./yahoo.server";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const CACHE_TTL_MS = 30 * 60_000;
const MAX_CACHE = 300;

type Raw = Record<string, unknown>;
type Request = { market: string; type: InvestmentType; code: string; name: string };

interface Session {
  cookie: string;
  crumb: string;
  at: number;
}

let session: Session | null = null;
const cache = new Map<string, { at: number; data: InvestmentAnalysisData }>();
const inFlight = new Map<string, Promise<InvestmentAnalysisData>>();

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && value !== null && "raw" in (value as Raw)) {
    const raw = (value as Raw)["raw"];
    return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function ratio(value: unknown): number | null {
  if (value && typeof value === "object") {
    const formatted = str((value as Raw)["fmt"]);
    if (formatted) {
      const parsed = Number(formatted.replaceAll(",", "").replace(/x$/i, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return num(value);
}

function pct(value: unknown): number | null {
  const valueNumber = num(value);
  return valueNumber === null ? null : Number((valueNumber * 100).toFixed(2));
}

function percentAlreadyOrDecimal(value: number | null): number | null {
  if (value === null) return null;
  return Number((Math.abs(value) <= 1 ? value * 100 : value).toFixed(2));
}

function yahooSymbol(market: string, code: string): string {
  const symbol = code.trim().toUpperCase().replace(/\s+/g, "-");
  switch (market.toUpperCase()) {
    case "NSE":
      return `${symbol}.NS`;
    case "BSE":
      return `${symbol}.BO`;
    case "LSE":
      return `${symbol}.L`;
    default:
      return symbol;
  }
}

async function getSession(): Promise<Session | null> {
  if (session && Date.now() - session.at < 30 * 60_000) return session;
  try {
    const response = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(6000),
    });
    const cookie = (response.headers.get("set-cookie") ?? "")
      .split(/,(?=[^;]+=[^;]+)/)
      .map((part) => part.split(";")[0]!.trim())
      .filter(Boolean)
      .join("; ");
    if (!cookie) return null;
    const crumbResponse = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": UA, Cookie: cookie },
      signal: AbortSignal.timeout(6000),
    });
    const crumb = (await crumbResponse.text()).trim();
    if (!crumb || crumb.length > 64) return null;
    session = { cookie, crumb, at: Date.now() };
    return session;
  } catch {
    return null;
  }
}

async function fetchYahooHistory(symbol: string): Promise<HistoricalPoint[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1wk&range=10y&events=div%2Csplits`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(9000) },
    );
    if (!response.ok) return [];
    const json = (await response.json()) as {
      chart?: {
        result?: Array<{
          timestamp?: number[];
          indicators?: { adjclose?: Array<{ adjclose?: Array<number | null> }>; quote?: Array<{ close?: Array<number | null> }> };
        }>;
      };
    };
    const result = json.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const values = result?.indicators?.adjclose?.[0]?.adjclose ?? result?.indicators?.quote?.[0]?.close ?? [];
    const points: HistoricalPoint[] = [];
    for (let index = 0; index < Math.min(timestamps.length, values.length); index += 1) {
      const value = values[index];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
      points.push({ at: timestamps[index]! * 1000, value });
    }
    return points;
  } catch {
    return [];
  }
}

function objectAt(value: unknown, key: string): Raw {
  return value && typeof value === "object" && key in (value as Raw) && typeof (value as Raw)[key] === "object"
    ? (((value as Raw)[key] ?? {}) as Raw)
    : {};
}

function parseSectorWeights(value: unknown): SectorWeight[] {
  if (!Array.isArray(value)) return [];
  const sectors: SectorWeight[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    for (const [name, weight] of Object.entries(row as Raw)) {
      const weightPct = pct(weight);
      if (weightPct !== null && weightPct > 0) {
        sectors.push({ name: name.replace(/([a-z])([A-Z])/g, "$1 $2"), weightPct });
      }
    }
  }
  return sectors.sort((a, b) => b.weightPct - a.weightPct).slice(0, 8);
}

function parseHoldings(value: unknown): InvestmentHolding[] {
  if (!Array.isArray(value)) return [];
  return (value as Raw[])
    .map((holding) => ({
      symbol: str(holding["symbol"]) ?? "",
      name: str(holding["holdingName"]) ?? str(holding["name"]) ?? str(holding["symbol"]) ?? "Unknown holding",
      weightPct: pct(holding["holdingPercent"]),
    }))
    .filter((holding) => holding.symbol || holding.name !== "Unknown holding")
    .slice(0, 25);
}

async function fetchYahooFundProfile(symbol: string): Promise<FundProfileAnalysis | null> {
  const yahooSession = await getSession();
  if (!yahooSession) return null;
  try {
    const modules = "fundProfile,topHoldings,fundPerformance,defaultKeyStatistics,summaryDetail,price";
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(yahooSession.crumb)}`,
      {
        headers: { "User-Agent": UA, Cookie: yahooSession.cookie },
        signal: AbortSignal.timeout(9000),
      },
    );
    if (!response.ok) {
      if (response.status === 401) session = null;
      return null;
    }
    const json = (await response.json()) as { quoteSummary?: { result?: Raw[] } };
    const result = json.quoteSummary?.result?.[0];
    if (!result) return null;

    const profile = objectAt(result, "fundProfile");
    const fees = objectAt(profile, "feesExpensesInvestment");
    const holdingsRaw = objectAt(result, "topHoldings");
    const equity = objectAt(holdingsRaw, "equityHoldings");
    const performance = objectAt(result, "fundPerformance");
    const trailing = objectAt(performance, "trailingReturns");
    const stats = objectAt(result, "defaultKeyStatistics");
    const summary = objectAt(result, "summaryDetail");
    const price = objectAt(result, "price");

    const holdings = parseHoldings(holdingsRaw["holdings"]);
    const weightedTop10 = holdings
      .slice(0, 10)
      .map((holding) => holding.weightPct)
      .filter((weight): weight is number => weight !== null)
      .reduce((sum, weight) => sum + weight, 0);
    const navPrice = num(summary["navPrice"]);
    const marketPrice = num(price["regularMarketPrice"]) ?? num(summary["regularMarketPrice"]);
    const bid = num(summary["bid"]);
    const ask = num(summary["ask"]);
    const midpoint = bid !== null && ask !== null && bid > 0 && ask >= bid ? (bid + ask) / 2 : null;
    const currentSpreadPct = midpoint && bid !== null && ask !== null ? Number((((ask - bid) / midpoint) * 100).toFixed(3)) : null;
    const premiumDiscountPct = navPrice && marketPrice ? Number((((marketPrice - navPrice) / navPrice) * 100).toFixed(3)) : null;

    const parsed: FundProfileAnalysis = {
      family: str(profile["family"]),
      category: str(profile["categoryName"]),
      legalType: str(profile["legalType"]),
      expenseRatioPct: pct(fees["annualReportExpenseRatio"]) ?? pct(fees["netExpRatio"]),
      turnoverPct: pct(fees["annualHoldingsTurnover"]) ?? pct(stats["annualHoldingsTurnover"]),
      totalAssets: num(stats["totalAssets"]) ?? num(summary["totalAssets"]),
      currency: str(price["currency"]) ?? str(summary["currency"]),
      marketPrice,
      navPrice,
      bid,
      ask,
      currentSpreadPct,
      premiumDiscountPct,
      averageVolume: num(summary["averageVolume"]) ?? num(summary["averageVolume10days"]),
      yieldPct: pct(summary["yield"]),
      beta3Year: num(stats["beta3Year"]),
      threeYearAverageReturnPct: pct(stats["threeYearAverageReturn"]) ?? pct(trailing["threeYear"]),
      fiveYearAverageReturnPct: pct(stats["fiveYearAverageReturn"]) ?? pct(trailing["fiveYear"]),
      holdingsCount: null,
      top10WeightPct: weightedTop10 > 0 ? Number(weightedTop10.toFixed(2)) : null,
      cashPositionPct: pct(holdingsRaw["cashPosition"]),
      portfolioPe: ratio(equity["priceToEarnings"]),
      portfolioPb: ratio(equity["priceToBook"]),
      topSectors: parseSectorWeights(holdingsRaw["sectorWeightings"]),
      holdings,
    };
    const hasUsefulData = parsed.category !== null || parsed.family !== null || parsed.expenseRatioPct !== null ||
      parsed.totalAssets !== null || parsed.marketPrice !== null || parsed.navPrice !== null || parsed.holdings.length > 0;
    return hasUsefulData ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchHoldingQuality(holdings: InvestmentHolding[]): Promise<HoldingQualityAnalysis | null> {
  const targets = holdings.filter((holding) => holding.symbol && holding.weightPct !== null).slice(0, 10);
  if (!targets.length) return null;
  const results: Array<{ holding: InvestmentHolding; fundamentals: LiveFundamentals | null }> = [];
  for (let index = 0; index < targets.length; index += 4) {
    const part = targets.slice(index, index + 4);
    const fetched = await Promise.all(
      part.map(async (holding) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        try {
          return await fetchFundamentals(holding.symbol, controller.signal);
        } finally {
          clearTimeout(timer);
        }
      }),
    );
    part.forEach((holding, offset) => results.push({ holding, fundamentals: fetched[offset] ?? null }));
  }

  const covered = results.filter((row) => row.fundamentals);
  if (!covered.length) return null;
  const coveredWeightPct = covered.reduce((sum, row) => sum + (row.holding.weightPct ?? 0), 0);
  const weighted = (pick: (fundamentals: LiveFundamentals) => number | null): number | null => {
    const usable = covered.filter((row) => pick(row.fundamentals!) !== null && (row.holding.weightPct ?? 0) > 0);
    const weight = usable.reduce((sum, row) => sum + (row.holding.weightPct ?? 0), 0);
    if (weight <= 0) return null;
    return Number(
      (
        usable.reduce((sum, row) => sum + pick(row.fundamentals!)! * (row.holding.weightPct ?? 0), 0) / weight
      ).toFixed(2),
    );
  };

  return {
    weightedRoePct: weighted((fundamentals) => fundamentals.roe),
    weightedEarningsGrowthPct: weighted((fundamentals) => fundamentals.earningsGrowth),
    weightedDebtToEquity: weighted((fundamentals) => fundamentals.debtToEquity),
    coveredWeightPct: Number(coveredWeightPct.toFixed(2)),
    holdingsAnalyzed: covered.length,
  };
}

function parseMfapiDate(value: string): number | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const at = Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isFinite(at) ? at : null;
}

async function fetchIndianMutualFund(code: string, name: string): Promise<{ history: HistoricalPoint[]; meta: MutualFundMetadata | null }> {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${encodeURIComponent(code)}`, {
      headers: { "User-Agent": "DeepScreen investment research" },
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) return { history: [], meta: null };
    const json = (await response.json()) as {
      meta?: { fund_house?: string; scheme_type?: string; scheme_category?: string; scheme_name?: string };
      data?: Array<{ date?: string; nav?: string }>;
    };
    const history: HistoricalPoint[] = [];
    for (const row of json.data ?? []) {
      const at = row.date ? parseMfapiDate(row.date) : null;
      const value = Number(row.nav);
      if (at !== null && Number.isFinite(value) && value > 0) history.push({ at, value });
    }
    const plan = parseMutualFundPlan(json.meta?.scheme_name || name);
    return {
      history,
      meta: {
        fundHouse: json.meta?.fund_house?.trim() || null,
        schemeType: json.meta?.scheme_type?.trim() || null,
        schemeCategory: json.meta?.scheme_category?.trim() || null,
        schemeName: json.meta?.scheme_name?.trim() || null,
        ...plan,
      },
    };
  } catch {
    return { history: [], meta: null };
  }
}

function mapReitFundamentals(fundamentals: LiveFundamentals | null): ReitAnalysis | null {
  if (!fundamentals) return null;
  const debtToEbitda = fundamentals.totalDebt !== null && fundamentals.ebitda && fundamentals.ebitda > 0
    ? Number((fundamentals.totalDebt / fundamentals.ebitda).toFixed(2))
    : null;
  const netDebt = fundamentals.totalDebt !== null ? fundamentals.totalDebt - (fundamentals.totalCash ?? 0) : null;
  const netDebtToEbitda = netDebt !== null && fundamentals.ebitda && fundamentals.ebitda > 0
    ? Number((netDebt / fundamentals.ebitda).toFixed(2))
    : null;
  return {
    marketCap: fundamentals.marketCap,
    currency: fundamentals.currency,
    pe: fundamentals.pe,
    pb: fundamentals.pb,
    dividendYieldPct: percentAlreadyOrDecimal(fundamentals.dividendYield),
    payoutRatioPct: fundamentals.payoutRatio,
    debtToEquity: fundamentals.debtToEquity,
    totalDebt: fundamentals.totalDebt,
    totalCash: fundamentals.totalCash,
    ebitda: fundamentals.ebitda,
    debtToEbitda,
    netDebtToEbitda,
    operatingCashflow: fundamentals.operatingCashflow,
    freeCashflow: fundamentals.freeCashflow,
    revenueGrowthPct: fundamentals.revenueGrowth,
    earningsGrowthPct: fundamentals.earningsGrowth,
    sector: fundamentals.sector,
    industry: fundamentals.industry,
    country: fundamentals.country,
  };
}

async function buildAnalysis(request: Request): Promise<InvestmentAnalysisData> {
  const sources = new Set<string>();
  let historyPoints: HistoricalPoint[] = [];
  let fundProfile: FundProfileAnalysis | null = null;
  let holdingQuality: HoldingQualityAnalysis | null = null;
  let mutualFund: MutualFundMetadata | null = request.type === "FUND"
    ? { fundHouse: null, schemeType: null, schemeCategory: null, schemeName: null, ...parseMutualFundPlan(request.name) }
    : null;
  let reit: ReitAnalysis | null = null;

  if (request.type === "FUND" && request.market.toUpperCase() === "IN" && /^\d+$/.test(request.code)) {
    const indian = await fetchIndianMutualFund(request.code, request.name);
    historyPoints = indian.history;
    mutualFund = indian.meta ?? mutualFund;
    if (indian.history.length || indian.meta) sources.add("MFAPI (AMFI-sourced NAV history)");
  } else {
    const symbol = yahooSymbol(request.market, request.code);
    const [history, profile] = await Promise.all([
      fetchYahooHistory(symbol),
      request.type === "ETF" || request.type === "FUND" ? fetchYahooFundProfile(symbol) : Promise.resolve(null),
    ]);
    historyPoints = history;
    fundProfile = profile;
    if (history.length || profile) sources.add("Yahoo Finance");

    if (request.type === "ETF" && profile?.holdings.length) {
      holdingQuality = await fetchHoldingQuality(profile.holdings);
      if (holdingQuality) sources.add("Yahoo Finance holding fundamentals");
    }
    if (request.type === "REIT") {
      reit = mapReitFundamentals(await fetchFundamentals(symbol));
      if (reit) sources.add("Yahoo Finance company fundamentals");
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    sources: [...sources],
    history: computeHistoricalMetrics(historyPoints),
    fundProfile,
    holdingQuality,
    mutualFund,
    reit,
  };
}

function pruneCache() {
  if (cache.size <= MAX_CACHE) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, cache.size - MAX_CACHE);
  for (const [key] of oldest) cache.delete(key);
}

export async function fetchInvestmentAnalysis(request: Request): Promise<InvestmentAnalysisData> {
  const key = `${request.market.toUpperCase()}:${request.type}:${request.code.toUpperCase()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = buildAnalysis(request)
    .then((data) => {
      cache.set(key, { at: Date.now(), data });
      pruneCache();
      return data;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
