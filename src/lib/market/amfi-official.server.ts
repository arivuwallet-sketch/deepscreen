import type { MutualFundMetadata } from "@/lib/deepscreen/investment-analysis";
import type { OfficialFundAnalytics } from "@/lib/deepscreen/investment-official";

const BASE = "https://www.amfiindia.com";
const POLLING = `${BASE}/gateway/pollingsebi`;
const UA = "Mozilla/5.0 (compatible; DeepScreen Investment Research; +https://deepscreen.online)";
const TTL_MS = 6 * 60 * 60_000;

type Raw = Record<string, unknown>;
const cache = new Map<string, { at: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(mutual fund|fund|scheme|plan|option|idcw|growth|regular|direct|income distribution cum capital withdrawal|permitted)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenSimilarity(a: string, b: string): number {
  const left = new Set(normalize(a).split(" ").filter(Boolean));
  const right = new Set(normalize(b).split(" ").filter(Boolean));
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / Math.max(left.size, right.size);
}

function scalarEntries(value: unknown, prefix = ""): Array<[string, string | number | boolean]> {
  if (!value || typeof value !== "object") return [];
  const out: Array<[string, string | number | boolean]> = [];
  for (const [key, child] of Object.entries(value as Raw)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") out.push([path, child]);
    else if (child && typeof child === "object" && !Array.isArray(child)) out.push(...scalarEntries(child, path));
  }
  return out;
}

function rows(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload.filter((row): row is Raw => Boolean(row && typeof row === "object"));
  if (!payload || typeof payload !== "object") return [];
  const object = payload as Raw;
  for (const key of ["data", "Data", "result", "Result", "records", "Records"]) {
    const candidate = object[key];
    if (Array.isArray(candidate)) return candidate.filter((row): row is Raw => Boolean(row && typeof row === "object"));
  }
  return [object];
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, "").replace(/[₹%]/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function exact(row: Raw | null, key: string): unknown {
  if (!row) return null;
  const wanted = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [candidate, value] of Object.entries(row)) {
    if (candidate.toLowerCase().replace(/[^a-z0-9]/g, "") === wanted) return value;
  }
  return null;
}

function keyMatches(key: string, alternatives: string[][]): boolean {
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  return alternatives.some((parts) => parts.every((part) => clean.includes(part)));
}

function numberByKey(row: Raw | null, alternatives: string[][]): number | null {
  if (!row) return null;
  for (const [key, value] of scalarEntries(row)) {
    if (!keyMatches(key, alternatives)) continue;
    const parsed = numberValue(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function stringByKey(row: Raw | null, alternatives: string[][]): string | null {
  if (!row) return null;
  for (const [key, value] of scalarEntries(row)) {
    if (keyMatches(key, alternatives) && typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function bestRow(records: Raw[], code: string, name: string): Raw | null {
  let best: { score: number; row: Raw } | null = null;
  const normalizedName = normalize(name);
  for (const row of records) {
    let score = 0;
    for (const [key, value] of scalarEntries(row)) {
      const text = String(value).trim();
      const lowerKey = key.toLowerCase();
      if (code && text === String(code) && (lowerKey.includes("code") || lowerKey.includes("id"))) score = Math.max(score, 100);
      if (typeof value === "string" && value.length > 4) {
        const candidate = normalize(value);
        if (candidate && candidate === normalizedName) score = Math.max(score, 96);
        else score = Math.max(score, tokenSimilarity(candidate, normalizedName) * 85);
      }
    }
    if (!best || score > best.score) best = { score, row };
  }
  return best && best.score >= 42 ? best.row : null;
}

async function json(key: string, url: string, init?: RequestInit): Promise<unknown> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const active = pending.get(key);
  if (active) return active;

  const promise = (async () => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const headers = new Headers(init?.headers);
        headers.set("Accept", "application/json, text/plain, */*");
        headers.set("User-Agent", UA);
        const response = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`AMFI ${response.status}`);
        const text = await response.text();
        const value = JSON.parse(text) as unknown;
        cache.set(key, { at: Date.now(), value });
        return value;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await sleep(350 * 2 ** attempt);
      }
    }
    throw lastError instanceof Error ? lastError : new Error("AMFI request failed");
  })().finally(() => pending.delete(key));

  pending.set(key, promise);
  return promise;
}

function financialYear(now = new Date()): string {
  const year = now.getUTCFullYear();
  const start = now.getUTCMonth() >= 3 ? year : year - 1;
  return `${start}-${start + 1}`;
}

function fmt(date: Date, lowerMonth = false): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  let month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  if (lowerMonth) month = month.toLowerCase();
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

function previousMonthEnd(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
}

function previousMonthStart(): Date {
  const end = previousMonthEnd();
  return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
}

function businessDates(count = 8): Date[] {
  const out: Date[] = [];
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  while (out.length < count) {
    if (![0, 6].includes(date.getUTCDay())) out.push(new Date(date));
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return out;
}

function categoryId(category: string | null): number {
  const value = (category ?? "").toLowerCase();
  if (value.includes("equity")) return 1;
  if (value.includes("debt")) return 2;
  if (value.includes("hybrid")) return 3;
  if (value.includes("solution")) return 4;
  return 5;
}

function rowId(row: Raw): number | null {
  for (const [key, value] of scalarEntries(row)) {
    const clean = key.toLowerCase();
    if (!(clean.endsWith("id") || clean.includes("subcategoryid") || clean.includes("schemeid") || clean.includes("catid"))) continue;
    const parsed = numberValue(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function rowName(row: Raw): string | null {
  for (const [key, value] of scalarEntries(row)) {
    if (typeof value !== "string") continue;
    const clean = key.toLowerCase();
    if (clean.includes("name") || clean.includes("category")) return value.trim();
  }
  return null;
}

async function amcId(meta: MutualFundMetadata, name: string): Promise<number | null> {
  try {
    const payload = await json("amfi:amcs", `${BASE}/api/populate-mf`);
    const target = meta.fundHouse || name;
    let best: { id: number; score: number } | null = null;
    for (const row of rows(payload)) {
      const id = numberValue(exact(row, "mfId")) ?? rowId(row);
      const label = stringByKey(row, [["mfname"], ["name"]]);
      if (id === null || !label) continue;
      const score = tokenSimilarity(label, target);
      if (!best || score > best.score) best = { id, score };
    }
    return best && best.score >= 0.35 ? best.id : null;
  } catch {
    return null;
  }
}

async function schemeIdentity(mfId: number | null, name: string): Promise<{ id: number | null; row: Raw | null }> {
  if (mfId === null) return { id: null, row: null };
  try {
    const payload = await json(`amfi:schemes:${mfId}`, `${BASE}/api/populate-scheme?MF_ID=${mfId}`);
    const row = bestRow(rows(payload), "", name);
    return { id: row ? rowId(row) : null, row };
  } catch {
    return { id: null, row: null };
  }
}

async function schemeDetails(mfId: number | null, schemeId: number | null): Promise<Raw | null> {
  if (mfId === null || schemeId === null) return null;
  try {
    const payload = await json(
      `amfi:scheme-details:${mfId}:${schemeId}`,
      `${BASE}/api/scheme-details?MF_ID=${mfId}&scheme_id=${schemeId}`,
    );
    return rows(payload)[0] ?? null;
  } catch {
    return null;
  }
}

function terFromRow(row: Raw | null, planType: MutualFundMetadata["planType"]): number | null {
  if (!row) return null;
  const normalized = numberValue(exact(row, "TER_total")) ?? numberValue(exact(row, "TER"));
  if (normalized !== null) return normalized;
  const direct = numberValue(exact(row, "D_TER"));
  const regular = numberValue(exact(row, "R_TER"));
  if (planType === "Direct") return direct ?? regular;
  if (planType === "Regular") return regular ?? direct;
  return regular ?? direct;
}

async function latestTer(mfId: number | null, name: string, meta: MutualFundMetadata) {
  try {
    const fy = financialYear();
    const monthPayload = await json(`ter-month:${fy}`, `${BASE}/api/populate-ter-month?year=${encodeURIComponent(fy)}`);
    const first = rows(monthPayload)[0];
    const month = first ? stringByKey(first, [["monthnumber"], ["month"]]) : null;
    if (!month) return { row: null as Raw | null, date: null as string | null };
    const id = mfId ?? "All";
    const payload = await json(
      `ter:${id}:${month}`,
      `${BASE}/api/populate-te-rdata-revised?MF_ID=${encodeURIComponent(String(id))}&Month=${encodeURIComponent(month)}&strCat=-1&strType=-1&page=1&pageSize=10000`,
    );
    return { row: bestRow(rows(payload), "", name), date: month, planType: meta.planType };
  } catch {
    return { row: null as Raw | null, date: null as string | null, planType: meta.planType };
  }
}

async function tracking(kind: "error" | "difference", mfId: number | null, code: string, name: string) {
  const date = kind === "error" ? fmt(previousMonthEnd(), true) : fmt(previousMonthStart());
  const endpoint = kind === "error"
    ? `${BASE}/api/tracking-error-data?MF_ID=${encodeURIComponent(String(mfId ?? "all"))}&strdt=${encodeURIComponent(date)}`
    : `${BASE}/api/tracking-difference?MF_ID=${encodeURIComponent(String(mfId ?? "all"))}&date=${encodeURIComponent(date)}`;
  try {
    const payload = await json(`tracking:${kind}:${mfId ?? "all"}:${date}`, endpoint);
    return { row: bestRow(rows(payload), code, name), date };
  } catch {
    return { row: null as Raw | null, date };
  }
}

async function performance(meta: MutualFundMetadata, mfId: number | null, code: string, name: string) {
  const category = categoryId(meta.schemeCategory);
  try {
    const subPayload = await json(
      `subcat:${category}`,
      `${POLLING}/api/amfi/getsubcategory`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category }) },
    );
    const desired = (meta.schemeCategory ?? "").split("-").slice(1).join("-").trim() || meta.schemeCategory || name;
    let chosen: { id: number; score: number } | null = null;
    for (const candidate of rows(subPayload)) {
      const id = rowId(candidate);
      const label = rowName(candidate);
      if (id === null || !label) continue;
      const score = tokenSimilarity(label, desired);
      if (!chosen || score > chosen.score) chosen = { id, score };
    }
    if (!chosen) return { row: null as Raw | null, date: null as string | null };

    for (const day of businessDates(8)) {
      const reportDate = fmt(day);
      const body = {
        maturityType: (meta.schemeType ?? "").toLowerCase().includes("close") ? 2 : 1,
        category,
        subCategory: chosen.id,
        mfid: mfId ?? 0,
        reportDate,
      };
      try {
        const payload = await json(
          `performance:${body.maturityType}:${category}:${chosen.id}:${body.mfid}:${reportDate}`,
          `${POLLING}/api/amfi/fundperformance`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
        );
        const row = bestRow(rows(payload), code, name);
        if (row) return { row, date: reportDate };
      } catch {
        // Try the previous business date; AMFI does not publish every calendar day.
      }
    }
    return { row: null as Raw | null, date: null as string | null };
  } catch {
    return { row: null as Raw | null, date: null as string | null };
  }
}

async function risk(meta: MutualFundMetadata, code: string, name: string): Promise<Raw | null> {
  // AMFI's risk-parameter disclosure currently applies to selected categories.
  // Mid-cap is documented by AMFI's public endpoint as category 17. Do not guess other IDs.
  if (!(meta.schemeCategory ?? "").toLowerCase().includes("mid cap")) return null;
  const date = fmt(previousMonthStart());
  try {
    const payload = await json(
      `risk:${date}:17`,
      `${BASE}/api/risk-parameter-data-revised?date=${encodeURIComponent(date)}&strCatId=17`,
    );
    return bestRow(rows(payload), code, name);
  } catch {
    return null;
  }
}

function trackingErrorPercent(row: Raw | null): number | null {
  const raw = numberValue(exact(row, "Tracking_Error")) ?? numberByKey(row, [["tracking", "error"]]);
  if (raw === null) return null;
  return Math.abs(raw) <= 1 ? Number((raw * 100).toFixed(4)) : raw;
}

export async function fetchAmfiOfficialFundAnalytics(
  code: string,
  name: string,
  meta: MutualFundMetadata,
): Promise<OfficialFundAnalytics | null> {
  const mfId = await amcId(meta, name);
  const scheme = await schemeIdentity(mfId, name);
  const [details, ter, error, difference, perf, riskRow] = await Promise.all([
    schemeDetails(mfId, scheme.id),
    latestTer(mfId, name, meta),
    tracking("error", mfId, code, name),
    tracking("difference", mfId, code, name),
    performance(meta, mfId, code, name),
    risk(meta, code, name),
  ]);

  const trackingBenchmark = stringByKey(error.row, [["benchmark"]]) ?? stringByKey(difference.row, [["benchmark"]]);
  const result: OfficialFundAnalytics = {
    terPct: terFromRow(ter.row, meta.planType),
    trackingErrorPct: trackingErrorPercent(error.row),
    trackingDifferencePct: numberValue(exact(difference.row, "Tracking_Difference")) ?? numberByKey(difference.row, [["tracking", "difference"]]),
    benchmark: trackingBenchmark ?? stringByKey(perf.row, [["benchmark"]]),
    aumCrore: numberByKey(perf.row, [["aum"], ["asset", "management"]]),
    standardDeviationPct: numberValue(exact(riskRow, "Standard_Deviation")) ?? numberByKey(riskRow, [["standard", "deviation"]]),
    beta: numberValue(exact(riskRow, "Beta")) ?? numberByKey(riskRow, [["beta"]]),
    sharpe: numberValue(exact(riskRow, "Sharpe_Ratio")) ?? numberByKey(riskRow, [["sharpe"]]),
    treynor: numberValue(exact(riskRow, "Treynor_Ratio")) ?? numberByKey(riskRow, [["treynor"]]),
    jensensAlphaPct: numberValue(exact(riskRow, "Jensens_Alpha")) ?? numberByKey(riskRow, [["jensen", "alpha"], ["alpha"]]),
    informationRatio: numberByKey(perf.row, [["information", "ratio"]]),
    riskometer: stringByKey(perf.row, [["riskometer"], ["risk", "meter"]]),
    launchDate: stringByKey(details, [["launch", "date"]]) ?? stringByKey(perf.row, [["launch", "date"]]),
    exitLoad: stringByKey(details, [["scheme", "load"], ["exit", "load"]]),
    minimumInvestment: numberByKey(details, [["scheme", "min", "amt"], ["minimum", "amount"]]),
    objective: stringByKey(details, [["scheme", "objective"], ["objective"]]),
    amcWebsite: stringByKey(details, [["amc", "website"], ["website"]]),
    schemeCode: stringByKey(perf.row, [["scheme", "code"]]) ?? stringByKey(error.row, [["scheme", "code"]]),
    isin: stringByKey(error.row, [["isin"]]) ?? stringByKey(difference.row, [["isin"]]),
    returns1yPct: numberValue(exact(perf.row, "Returns_1yr")) ?? numberByKey(perf.row, [["returns", "1yr"]]),
    returns3yPct: numberValue(exact(perf.row, "Returns_3yr")) ?? numberByKey(perf.row, [["returns", "3yr"]]),
    returns5yPct: numberValue(exact(perf.row, "Returns_5yr")) ?? numberByKey(perf.row, [["returns", "5yr"]]),
    benchmarkReturns1yPct: numberValue(exact(perf.row, "Benchmark_Returns_1yr")) ?? numberByKey(perf.row, [["benchmark", "returns", "1yr"]]),
    benchmarkReturns3yPct: numberValue(exact(perf.row, "Benchmark_Returns_3yr")) ?? numberByKey(perf.row, [["benchmark", "returns", "3yr"]]),
    benchmarkReturns5yPct: numberValue(exact(perf.row, "Benchmark_Returns_5yr")) ?? numberByKey(perf.row, [["benchmark", "returns", "5yr"]]),
    sourceDate:
      stringByKey(error.row, [["report", "date"]]) ??
      stringByKey(difference.row, [["report", "month"]]) ??
      perf.date ??
      ter.date ??
      null,
  };

  return Object.entries(result).some(([key, value]) => key !== "sourceDate" && value !== null) ? result : null;
}
