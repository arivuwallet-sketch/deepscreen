import type { MutualFundMetadata } from "@/lib/deepscreen/investment-analysis";
import type { OfficialFundAnalytics } from "@/lib/deepscreen/investment-official";

const BASE = "https://www.amfiindia.com";
const POLLING = `${BASE}/gateway/pollingsebi`;
const UA = "Mozilla/5.0 (compatible; DeepScreen Investment Research; +https://deepscreen.online)";
const TTL_MS = 6 * 60 * 60_000;

type Raw = Record<string, unknown>;
const cache = new Map<string, { at: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(mutual fund|fund|scheme|plan|option|idcw|income distribution cum capital withdrawal)\b/g, " ")
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
      if (text === String(code) && (lowerKey.includes("code") || lowerKey.includes("id"))) score = Math.max(score, 100);
      if (typeof value === "string" && value.length > 5) {
        const candidate = normalize(value);
        if (candidate === normalizedName) score = Math.max(score, 95);
        else score = Math.max(score, tokenSimilarity(candidate, normalizedName) * 80);
      }
    }
    if (!best || score > best.score) best = { score, row };
  }
  return best && best.score >= 46 ? best.row : null;
}

async function json(key: string, url: string, init?: RequestInit): Promise<unknown> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const active = pending.get(key);
  if (active) return active;

  const requestHeaders = new Headers(init?.headers);
  requestHeaders.set("Accept", "application/json, text/plain, */*");
  requestHeaders.set("User-Agent", UA);
  requestHeaders.set("Referer", `${BASE}/`);

  const promise = fetch(url, { ...init, headers: requestHeaders, signal: AbortSignal.timeout(12_000) })
    .then(async (response) => {
      if (!response.ok) throw new Error(`AMFI ${response.status}`);
      return response.json();
    })
    .then((value) => {
      cache.set(key, { at: Date.now(), value });
      return value;
    })
    .finally(() => pending.delete(key));
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

function lastBusinessDay(): Date {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() - 1);
  return date;
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
    if (!(clean.endsWith("id") || clean.includes("subcategoryid") || clean.includes("catid"))) continue;
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

async function latestTer(code: string, name: string) {
  try {
    const fy = financialYear();
    const monthPayload = await json(`ter-month:${fy}`, `${BASE}/api/populate-ter-month?year=${encodeURIComponent(fy)}`);
    const monthRows = rows(monthPayload);
    const first = monthRows[0];
    const month = first ? stringByKey(first, [["monthnumber"], ["month"]]) : null;
    if (!month) return { row: null as Raw | null, date: null as string | null };
    const payload = await json(`ter:${month}`, `${BASE}/api/populate-te-rdata-revised?MF_ID=All&Month=${encodeURIComponent(month)}&strCat=-1&strType=-1`);
    return { row: bestRow(rows(payload), code, name), date: month };
  } catch {
    return { row: null as Raw | null, date: null as string | null };
  }
}

async function tracking(kind: "error" | "difference", code: string, name: string) {
  const date = kind === "error" ? fmt(previousMonthEnd(), true) : fmt(previousMonthStart());
  const endpoint = kind === "error"
    ? `${BASE}/api/tracking-error-data?MF_ID=all&strdt=${encodeURIComponent(date)}`
    : `${BASE}/api/tracking-difference?MF_ID=all&date=${encodeURIComponent(date)}`;
  try {
    const payload = await json(`tracking:${kind}:${date}`, endpoint);
    return { row: bestRow(rows(payload), code, name), date };
  } catch {
    return { row: null as Raw | null, date };
  }
}

async function performance(meta: MutualFundMetadata, code: string, name: string) {
  const category = categoryId(meta.schemeCategory);
  const reportDate = fmt(lastBusinessDay());
  try {
    const subPayload = await json(
      `subcat:${category}`,
      `${POLLING}/api/amfi/getsubcategory`,
      { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify({ category }) },
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
    if (!chosen) return { row: null as Raw | null, subCategoryId: null as number | null, date: reportDate };
    const body = {
      maturityType: (meta.schemeType ?? "").toLowerCase().includes("close") ? 2 : 1,
      category,
      subCategory: chosen.id,
      mfid: 0,
      reportDate,
    };
    const payload = await json(
      `performance:${body.maturityType}:${category}:${chosen.id}:${reportDate}`,
      `${POLLING}/api/amfi/fundperformance`,
      { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify(body) },
    );
    return { row: bestRow(rows(payload), code, name), subCategoryId: chosen.id, date: reportDate };
  } catch {
    return { row: null as Raw | null, subCategoryId: null as number | null, date: reportDate };
  }
}

async function risk(subCategoryId: number | null, code: string, name: string): Promise<Raw | null> {
  if (subCategoryId === null) return null;
  const date = fmt(previousMonthStart());
  try {
    const payload = await json(
      `risk:${date}:${subCategoryId}`,
      `${BASE}/api/risk-parameter-data-revised?date=${encodeURIComponent(date)}&strCatId=${encodeURIComponent(String(subCategoryId))}`,
    );
    return bestRow(rows(payload), code, name);
  } catch {
    return null;
  }
}

export async function fetchAmfiOfficialFundAnalytics(
  code: string,
  name: string,
  meta: MutualFundMetadata,
): Promise<OfficialFundAnalytics | null> {
  const [ter, error, difference, perf] = await Promise.all([
    latestTer(code, name),
    tracking("error", code, name),
    tracking("difference", code, name),
    performance(meta, code, name),
  ]);
  const riskRow = await risk(perf.subCategoryId, code, name);

  const result: OfficialFundAnalytics = {
    terPct: numberByKey(ter.row, [["ter"], ["expense", "ratio"]]),
    trackingErrorPct: numberByKey(error.row, [["tracking", "error"], ["trackingerror"]]),
    trackingDifferencePct: numberByKey(difference.row, [["tracking", "difference"], ["trackingdifference"]]),
    benchmark: stringByKey(perf.row, [["benchmark"]]),
    aumCrore: numberByKey(perf.row, [["aum"], ["asset", "management"]]),
    standardDeviationPct: numberByKey(riskRow, [["standard", "deviation"], ["std", "dev"]]),
    beta: numberByKey(riskRow, [["beta"]]),
    sharpe: numberByKey(riskRow, [["sharpe"]]),
    informationRatio: numberByKey(perf.row, [["information", "ratio"], ["inforatio"]]),
    riskometer: stringByKey(perf.row, [["riskometer"], ["risk", "meter"]]),
    sourceDate: perf.date || ter.date || error.date || difference.date || null,
  };

  return Object.entries(result).some(([key, value]) => key !== "sourceDate" && value !== null) ? result : null;
}
