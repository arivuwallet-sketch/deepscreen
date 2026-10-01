import type { MutualFundMetadata, OfficialFundAnalytics } from "@/lib/deepscreen/investment-analysis";

const BASE = "https://www.amfiindia.com";
const POLLING_BASE = `${BASE}/gateway/pollingsebi`;
const UA = "Mozilla/5.0 (compatible; DeepScreen Investment Research; +https://deepscreen.online)";
const TTL = 6 * 60 * 60_000;

type Raw = Record<string, unknown>;

type CacheEntry = { at: number; value: unknown };
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(mutual fund|fund|scheme|option|plan|income distribution cum capital withdrawal|idcw)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((part) => part.length > 1));
}

function similarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.max(a.size, b.size);
}

function scalarEntries(value: unknown, prefix = ""): Array<[string, string | number | boolean]> {
  const out: Array<[string, string | number | boolean]> = [];
  if (!value || typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value as Raw)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") {
      out.push([path, child]);
    } else if (child && typeof child === "object" && !Array.isArray(child)) {
      out.push(...scalarEntries(child, path));
    }
  }
  return out;
}

function records(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload.filter((row): row is Raw => Boolean(row && typeof row === "object"));
  if (!payload || typeof payload !== "object") return [];
  const object = payload as Raw;
  for (const key of ["data", "Data", "result", "Result", "records", "Records"]) {
    const candidate = object[key];
    if (Array.isArray(candidate)) return candidate.filter((row): row is Raw => Boolean(row && typeof row === "object"));
  }
  return [object];
}

function numeric(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/,/g, "").replace(/₹|rs\.?|crores?|cr\.?/gi, "").replace(/%/g, "").trim();
  if (!cleaned || /^[-—–n/a]+$/i.test(cleaned)) return null;
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function keyIncludes(key: string, groups: string[][]): boolean {
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  return groups.some((group) => group.every((part) => clean.includes(part)));
}

function numberByKey(row: Raw | null, groups: string[][]): number | null {
  if (!row) return null;
  for (const [key, value] of scalarEntries(row)) {
    if (!keyIncludes(key, groups)) continue;
    const parsed = numeric(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function stringByKey(row: Raw | null, groups: string[][]): string | null {
  if (!row) return null;
  for (const [key, value] of scalarEntries(row)) {
    if (!keyIncludes(key, groups)) continue;
    if (typeof value === "string" && value.trim() && !/^[-—–n/a]+$/i.test(value.trim())) return value.trim();
  }
  return null;
}

function bestRecord(rows: Raw[], code: string, name: string): Raw | null {
  const codeText = String(code).trim();
  const target = normalize(name);
  let best: { score: number; row: Raw } | null = null;
  for (const row of rows) {
    let score = 0;
    for (const [key, value] of scalarEntries(row)) {
      const text = String(value).trim();
      if (!text) continue;
      const cleanKey = key.toLowerCase();
      if (codeText && text === codeText) score = Math.max(score, cleanKey.includes("code") || cleanKey.includes("id") ? 100 : 85);
      if (typeof value === "string" && value.length >= 6) {
        const normalized = normalize(value);
        if (normalized && normalized === target) score = Math.max(score, 95);
        else score = Math.max(score, similarity(normalized, target) * 80);
      }
    }
    if (!best || score > best.score) best = { score, row };
  }
  return best && best.score >= 46 ? best.row : null;
}

async function cachedJson(key: string, url: string, init?: RequestInit): Promise<unknown> {
  const existing = cache.get(key);
  if (existing && Date.now() - existing.at < TTL) return existing.value;
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = fetch(url, {
    ...init,
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": UA,
      Referer: `${BASE}/`,
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(12_000),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`AMFI ${response.status}`);
      return response.json();
    })
    .then((value) => {
      cache.set(key, { at: Date.now(), value });
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

function financialYear(now = new Date()): string {
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const start = month >= 3 ? year : year - 1;
  return `${start}-${start + 1}`;
}

function formatDate(date: Date, monthCase: "lower" | "title" = "title"): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const rawMonth = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const month = monthCase === "lower" ? rawMonth.toLowerCase() : rawMonth;
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

function previousMonthEnd(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
}

function previousMonthStart(now = new Date()): Date {
  const end = previousMonthEnd(now);
  return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
}

function lastBusinessDay(now = new Date()): Date {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() - 1);
  return date;
}

function categoryId(category: string | null): number {
  const lower = (category ?? "").toLowerCase();
  if (lower.includes("equity")) return 1;
  if (lower.includes("debt")) return 2;
  if (lower.includes("hybrid")) return 3;
  if (lower.includes("solution")) return 4;
  return 5;
}

function readId(row: Raw): number | null {
  for (const [key, value] of scalarEntries(row)) {
    const clean = key.toLowerCase();
    if (!(clean.endsWith("id") || clean.includes("subcategoryid") || clean.includes("catid"))) continue;
    const parsed = numeric(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function readName(row: Raw): string | null {
  for (const [key, value] of scalarEntries(row)) {
    const clean = key.toLowerCase();
    if (typeof value === "string" && (clean.includes("name") || clean.includes("category"))) return value.trim();
  }
  return null;
}

async function latestTerRecord(code: string, name: string): Promise<{ row: Raw | null; date: string | null }> {
  try {
    const fy = financialYear();
    const monthPayload = await cachedJson(`ter-month:${fy}`, `${BASE}/api/populate-ter-month?year=${encodeURIComponent(fy)}`);
    const months = records(monthPayload);
    const first = months[0] ?? null;
    const month = first
      ? stringByKey(first, [["monthnumber"], ["month"]])
      : Array.isArray(monthPayload) && typeof monthPayload[0] === "object" && monthPayload[0]
        ? String((monthPayload[0] as Raw)["MonthNumber"] ?? "")
        : "";
    if (!month) return { row: null, date: null };
    const payload = await cachedJson(
      `ter:${month}`,
      `${BASE}/api/populate-te-rdata-revised?MF_ID=All&Month=${encodeURIComponent(month)}&strCat=-1&strType=-1`,
    );
    return { row: bestRecord(records(payload), code, name), date: month };
  } catch {
    return { row: null, date: null };
  }
}

async function trackingRecord(kind: "error" | "difference", code: string, name: string): Promise<{ row: Raw | null; date: string }> {
  const date = kind === "error" ? formatDate(previousMonthEnd(), "lower") : formatDate(previousMonthStart(), "title");
  const path = kind === "error"
    ? `/api/tracking-error-data?MF_ID=all&strdt=${encodeURIComponent(date)}`
    : `/api/tracking-difference?MF_ID=all&date=${encodeURIComponent(date)}`;
  try {
    const payload = await cachedJson(`tracking:${kind}:${date}`, `${BASE}${path}`);
    return { row: bestRecord(records(payload), code, name), date };
  } catch {
    return { row: null, date };
  }
}

async function fundPerformance(meta: MutualFundMetadata, code: string, name: string): Promise<{ row: Raw | null; subCategoryId: number | null; date: string }> {
  const category = categoryId(meta.schemeCategory);
  const reportDate = formatDate(lastBusinessDay(), "title");
  try {
    const subPayload = await cachedJson(
      `amfi-subcat:${category}`,
      `${POLLING_BASE}/api/amfi/getsubcategory`,
      { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify({ category }) },
    );
    const candidates = records(subPayload);
    const desired = (meta.schemeCategory ?? "").split("-").slice(1).join("-").trim() || meta.schemeCategory || name;
    let chosen: { id: number; score: number } | null = null;
    for (const candidate of candidates) {
      const id = readId(candidate);
      const label = readName(candidate);
      if (id === null || !label) continue;
      const score = similarity(label, desired);
      if (!chosen || score > chosen.score) chosen = { id, score };
    }
    if (!chosen) return { row: null, subCategoryId: null, date: reportDate };
    const body = {
      maturityType: (meta.schemeType ?? "").toLowerCase().includes("close") ? 2 : 1,
      category,
      subCategory: chosen.id,
      mfid: 0,
      reportDate,
    };
    const payload = await cachedJson(
      `amfi-performance:${body.maturityType}:${category}:${chosen.id}:${reportDate}`,
      `${POLLING_BASE}/api/amfi/fundperformance`,
      { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify(body) },
    );
    return { row: bestRecord(records(payload), code, name), subCategoryId: chosen.id, date: reportDate };
  } catch {
    return { row: null, subCategoryId: null, date: reportDate };
  }
}

async function riskRecord(subCategoryId: number | null, code: string, name: string): Promise<Raw | null> {
  if (subCategoryId === null) return null;
  const date = formatDate(previousMonthStart(), "title");
  try {
    const payload = await cachedJson(
      `amfi-risk:${date}:${subCategoryId}`,
      `${BASE}/api/risk-parameter-data-revised?date=${encodeURIComponent(date)}&strCatId=${encodeURIComponent(String(subCategoryId))}`,
    );
    return bestRecord(records(payload), code, name);
  } catch {
    return null;
  }
}

export async function fetchAmfiOfficialFundAnalytics(
  code: string,
  name: string,
  meta: MutualFundMetadata,
): Promise<OfficialFundAnalytics | null> {
  const [ter, trackingError, trackingDifference, performance] = await Promise.all([
    latestTerRecord(code, name),
    trackingRecord("error", code, name),
    trackingRecord("difference", code, name),
    fundPerformance(meta, code, name),
  ]);
  const risk = await riskRecord(performance.subCategoryId, code, name);

  const result: OfficialFundAnalytics = {
    terPct: numberByKey(ter.row, [["ter"], ["expenseratio"], ["expense", "ratio"]]),
    trackingErrorPct: numberByKey(trackingError.row, [["tracking", "error"], ["trackingerror"]]),
    trackingDifferencePct: numberByKey(trackingDifference.row, [["tracking", "difference"], ["trackingdifference"]]),
    benchmark: stringByKey(performance.row, [["benchmark"]]),
    aumCrore: numberByKey(performance.row, [["aum"], ["asset", "management"]]),
    standardDeviationPct: numberByKey(risk, [["standard", "deviation"], ["std", "dev"]]),
    beta: numberByKey(risk, [["beta"]]),
    sharpe: numberByKey(risk, [["sharpe"]]),
    informationRatio: numberByKey(performance.row, [["information", "ratio"], ["inforatio"]]),
    riskometer: stringByKey(performance.row, [["riskometer"], ["risk", "meter"]]),
    sourceDate: performance.date || ter.date || trackingError.date || null,
  };

  return Object.entries(result).some(([key, value]) => key !== "sourceDate" && value !== null) ? result : null;
}
