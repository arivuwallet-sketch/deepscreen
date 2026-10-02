import type { MutualFundMetadata } from "@/lib/deepscreen/investment-analysis";
import type { InvestmentType } from "@/lib/deepscreen/investments";
import type { EnhancedFundProfileAnalysis, EnhancedInvestmentAnalysisData } from "@/lib/deepscreen/investment-official";
import { fetchAmfiOfficialFundAnalytics } from "./amfi-official.server";
import { fetchInvestmentAnalysis } from "./investment-analysis.server";

const UA = "Mozilla/5.0 (compatible; DeepScreen Investment Research; +https://deepscreen.online)";
const EXTRA_TTL = 30 * 60_000;
type Raw = Record<string, unknown>;
type Request = { market: string; type: InvestmentType; code: string; name: string };

let yahooSession: { cookie: string; crumb: string; at: number } | null = null;
const extraCache = new Map<string, { at: number; data: Partial<EnhancedFundProfileAnalysis> | null }>();

function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value && typeof value === "object" && "raw" in (value as Raw)) return num((value as Raw)["raw"]);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function scalarEntries(value: unknown, prefix = ""): Array<[string, unknown]> {
  if (!value || typeof value !== "object") return [];
  const out: Array<[string, unknown]> = [];
  for (const [key, child] of Object.entries(value as Raw)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child) && !("raw" in (child as Raw))) out.push(...scalarEntries(child, path));
    else out.push([path, child]);
  }
  return out;
}

function findNumber(value: unknown, alternatives: string[][]): number | null {
  for (const [key, child] of scalarEntries(value)) {
    const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!alternatives.some((parts) => parts.every((part) => clean.includes(part)))) continue;
    const parsed = num(child);
    if (parsed !== null) return parsed;
  }
  return null;
}

function findString(value: unknown, alternatives: string[][]): string | null {
  for (const [key, child] of scalarEntries(value)) {
    const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!alternatives.some((parts) => parts.every((part) => clean.includes(part)))) continue;
    const parsed = child && typeof child === "object" && "fmt" in (child as Raw) ? str((child as Raw)["fmt"]) : str(child);
    if (parsed) return parsed;
  }
  return null;
}

function yahooSymbol(market: string, code: string): string {
  const symbol = code.trim().toUpperCase().replace(/\s+/g, "-");
  if (market.toUpperCase() === "NSE") return `${symbol}.NS`;
  if (market.toUpperCase() === "BSE") return `${symbol}.BO`;
  if (market.toUpperCase() === "LSE") return `${symbol}.L`;
  return symbol;
}

async function getYahooSession() {
  if (yahooSession && Date.now() - yahooSession.at < 30 * 60_000) return yahooSession;
  try {
    const cookieResponse = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) });
    const cookie = (cookieResponse.headers.get("set-cookie") ?? "")
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
    yahooSession = { cookie, crumb, at: Date.now() };
    return yahooSession;
  } catch {
    return null;
  }
}

async function fetchYahooFundExtras(market: string, code: string): Promise<Partial<EnhancedFundProfileAnalysis> | null> {
  const symbol = yahooSymbol(market, code);
  const cached = extraCache.get(symbol);
  if (cached && Date.now() - cached.at < EXTRA_TTL) return cached.data;
  const session = await getYahooSession();
  if (!session) return null;
  try {
    const modules = "fundProfile,fundPerformance,defaultKeyStatistics,summaryDetail,price";
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(session.crumb)}`,
      { headers: { "User-Agent": UA, Cookie: session.cookie }, signal: AbortSignal.timeout(9000) },
    );
    if (!response.ok) {
      if (response.status === 401) yahooSession = null;
      return null;
    }
    const json = (await response.json()) as { quoteSummary?: { result?: Raw[] } };
    const result = json.quoteSummary?.result?.[0];
    if (!result) return null;

    const startTimestamp = findNumber(result, [["manager", "start"], ["startdate"]]);
    const inceptionTimestamp = findNumber(result, [["fund", "inception"], ["inceptiondate"]]);
    const toDate = (timestamp: number | null) => timestamp && timestamp > 100_000_000 ? new Date(timestamp * 1000).toISOString().slice(0, 10) : null;
    const data: Partial<EnhancedFundProfileAnalysis> = {
      providerName: findString(result, [["longname"], ["shortname"]]),
      managerName: findString(result, [["manager", "name"]]),
      managerStartDate: toDate(startTimestamp),
      inceptionDate: toDate(inceptionTimestamp),
      alpha3Year: findNumber(result, [["alpha", "3y"], ["alpha3"]]),
      sharpe3Year: findNumber(result, [["sharpe", "3y"], ["sharpe3"]]),
      stdDev3Year: findNumber(result, [["std", "dev", "3y"], ["standard", "deviation", "3y"]]),
      rSquared3Year: findNumber(result, [["rsquared", "3y"], ["r2", "3y"]]),
      treynor3Year: findNumber(result, [["treynor", "3y"], ["treynor3"]]),
    };
    extraCache.set(symbol, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

export async function fetchEnhancedInvestmentAnalysis(request: Request): Promise<EnhancedInvestmentAnalysisData> {
  const base = await fetchInvestmentAnalysis(request);
  const sources = new Set(base.sources);
  let officialFund = null;
  let extras: Partial<EnhancedFundProfileAnalysis> | null = null;

  // AMFI's supplementary disclosure endpoints can stall for minutes when their
  // gateway is unreachable. Never hold the verified NAV/history or page behind them.
  const within = async <T,>(work: Promise<T>, milliseconds: number): Promise<T | null> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        work,
        new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), milliseconds); }),
      ]);
    } catch {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  if (request.type === "ETF" || (request.type === "FUND" && request.market.toUpperCase() !== "IN")) {
    extras = await within(fetchYahooFundExtras(request.market, request.code), 3500);
    if (extras && Object.values(extras).some((value) => value !== null)) sources.add("Yahoo Finance fund risk/management statistics");
  }

  if (request.type === "FUND" && request.market.toUpperCase() === "IN" && base.mutualFund) {
    officialFund = await within(fetchAmfiOfficialFundAnalytics(request.code, request.name, base.mutualFund), 3500);
    if (officialFund) sources.add("AMFI official scheme, TER, tracking and fund-performance disclosures");
  }

  if (request.type === "ETF" && ["NSE", "BSE"].includes(request.market.toUpperCase())) {
    const providerName = extras?.providerName ?? request.name;
    const meta: MutualFundMetadata = {
      fundHouse: base.fundProfile?.family ?? null,
      schemeType: "Open Ended",
      schemeCategory: "Other Scheme - ETFs",
      schemeName: providerName,
      planType: "Unclear",
      optionType: "Other",
    };
    officialFund = await within(fetchAmfiOfficialFundAnalytics(request.code, providerName, meta), 3500);
    if (officialFund) sources.add("AMFI official ETF TER and tracking disclosures");
  }

  const fundProfile: EnhancedFundProfileAnalysis | null = base.fundProfile
    ? {
        ...base.fundProfile,
        providerName: extras?.providerName ?? null,
        managerName: extras?.managerName ?? null,
        managerStartDate: extras?.managerStartDate ?? null,
        inceptionDate: extras?.inceptionDate ?? officialFund?.launchDate ?? null,
        alpha3Year: extras?.alpha3Year ?? officialFund?.jensensAlphaPct ?? null,
        sharpe3Year: extras?.sharpe3Year ?? officialFund?.sharpe ?? null,
        stdDev3Year: extras?.stdDev3Year ?? officialFund?.standardDeviationPct ?? null,
        rSquared3Year: extras?.rSquared3Year ?? null,
        treynor3Year: extras?.treynor3Year ?? officialFund?.treynor ?? null,
      }
    : null;

  return { ...base, sources: [...sources], fundProfile, officialFund };
}
