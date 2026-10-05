export interface ResearchEntry {
  id: string;
  market: string;
  symbol: string;
  name: string;
  list: string;
  quantity: number;
  averageCost: number;
  currency: string;
  thesis: string;
  risks: string;
  reviewDate: string;
  sources: string[];
  updatedAt: string;
}
export const DESK_KEY = "deepscreen-research-desk-v1";
export const HEADERS = [
  "market",
  "symbol",
  "name",
  "list",
  "quantity",
  "average_cost",
  "currency",
  "thesis",
  "risks",
  "review_date",
  "sources",
] as const;
export function validSource(value: string): boolean {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function validateEntry(v: unknown): v is ResearchEntry {
  if (!v || typeof v !== "object") return false;
  const p = v as ResearchEntry;
  return (
    [
      "id",
      "market",
      "symbol",
      "name",
      "list",
      "currency",
      "thesis",
      "risks",
      "reviewDate",
      "updatedAt",
    ].every((k) => typeof (v as Record<string, unknown>)[k] === "string") &&
    p.id.length > 0 &&
    p.id.length < 100 &&
    p.market.length > 0 &&
    p.market.length <= 30 &&
    p.symbol.length > 0 &&
    p.symbol.length <= 60 &&
    p.name.length <= 300 &&
    p.list.length > 0 &&
    p.list.length <= 80 &&
    /^[A-Z]{3}$/.test(p.currency) &&
    Number.isFinite(p.quantity) &&
    p.quantity >= 0 &&
    p.quantity <= 1e12 &&
    Number.isFinite(p.averageCost) &&
    p.averageCost >= 0 &&
    p.averageCost <= 1e12 &&
    p.thesis.length <= 10000 &&
    p.risks.length <= 10000 &&
    (!p.reviewDate ||
      (/^\d{4}-\d{2}-\d{2}$/.test(p.reviewDate) &&
        Number.isFinite(Date.parse(p.reviewDate)) &&
        new Date(p.reviewDate).toISOString().slice(0, 10) === p.reviewDate)) &&
    Number.isFinite(Date.parse(p.updatedAt)) &&
    Array.isArray(p.sources) &&
    p.sources.length <= 20 &&
    p.sources.every((s) => typeof s === "string" && s.length <= 2000 && validSource(s))
  );
}
export function readBackup(text: string): ResearchEntry[] {
  const data = JSON.parse(text) as { version?: number; entries?: unknown[] };
  if (
    data?.version !== 1 ||
    !Array.isArray(data.entries) ||
    data.entries.length > 1000 ||
    !data.entries.every(validateEntry)
  )
    throw new Error(
      "Invalid research backup. Expected a version 1 backup with up to 1,000 valid entries.",
    );
  if (new Set(data.entries.map((e) => e.id)).size !== data.entries.length)
    throw new Error("Backup contains duplicate identifiers.");
  return data.entries;
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += c;
      continue;
    }
    if (c === '"') {
      if (field || closed) throw new Error("Unexpected quote in CSV.");
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
      closed = false;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((s) => s.trim())) rows.push(row);
      row = [];
      field = "";
      closed = false;
    } else {
      if (closed) throw new Error("Unexpected text after a quoted CSV value.");
      field += c;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  row.push(field);
  if (row.some((s) => s.trim())) rows.push(row);
  return rows;
}
export function importCsv(text: string, now = new Date().toISOString()): ResearchEntry[] {
  const rows = parseCsv(text);
  const headers = rows.shift()?.map((v) => v.trim().toLowerCase()) ?? [];
  for (const required of ["market", "symbol", "quantity", "average_cost", "currency"])
    if (!headers.includes(required)) throw new Error(`Missing column: ${required}`);
  if (new Set(headers).size !== headers.length) throw new Error("Duplicate CSV column names.");
  if (!rows.length || rows.length > 1000) throw new Error("Import between 1 and 1,000 rows.");
  return rows.map((r, i) => {
    if (r.length !== headers.length)
      throw new Error(`Row ${i + 2}: column count does not match header.`);
    const get = (key: string) => {
      const v = r[headers.indexOf(key)] ?? "";
      return v.startsWith("'") && /^[=+\-@\t\r]/.test(v.slice(1)) ? v.slice(1) : v;
    };
    const numeric = (key: string) => {
      const s = get(key).trim();
      if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(s))
        throw new Error(
          `Row ${i + 2}: ${key} must be a non-negative number without currency symbols.`,
        );
      return Number(s);
    };
    const entry: ResearchEntry = {
      id: `import-${i}-${Date.parse(now)}`,
      market: get("market").trim().toUpperCase(),
      symbol: get("symbol").trim().toUpperCase(),
      name: get("name").trim(),
      list: get("list").trim() || "Imported",
      quantity: numeric("quantity"),
      averageCost: numeric("average_cost"),
      currency: get("currency").trim().toUpperCase(),
      thesis: get("thesis"),
      risks: get("risks"),
      reviewDate: get("review_date").trim(),
      sources: get("sources")
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean),
      updatedAt: now,
    };
    if (!validateEntry(entry))
      throw new Error(`Row ${i + 2}: invalid fields, date, currency, or source URL.`);
    return entry;
  });
}
export function exportCsv(entries: ResearchEntry[]): string {
  const cell = (v: string | number) => {
    let s = String(v);
    if (typeof v === "string" && /^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return [
    HEADERS.join(","),
    ...entries.map((e) =>
      [
        e.market,
        e.symbol,
        e.name,
        e.list,
        e.quantity,
        e.averageCost,
        e.currency,
        e.thesis,
        e.risks,
        e.reviewDate,
        e.sources.join("|"),
      ]
        .map(cell)
        .join(","),
    ),
  ].join("\r\n");
}
export function allocations(entries: ResearchEntry[]) {
  const groups = new Map<
    string,
    {
      currency: string;
      total: number;
      holdings: { entry: ResearchEntry; cost: number; weight: number }[];
    }
  >();
  for (const entry of entries) {
    const cost = entry.quantity * entry.averageCost;
    if (cost <= 0) continue;
    let g = groups.get(entry.currency);
    if (!g) {
      g = { currency: entry.currency, total: 0, holdings: [] };
      groups.set(entry.currency, g);
    }
    g.total += cost;
    g.holdings.push({ entry, cost, weight: 0 });
  }
  return [...groups.values()].map((g) => ({
    ...g,
    holdings: g.holdings
      .map((h) => ({ ...h, weight: (h.cost / g.total) * 100 }))
      .sort((a, b) => b.cost - a.cost),
  }));
}
