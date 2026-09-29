export const DIRECTORY_PAGE_SIZE = 100;

/** Invalid pages must be 404s, not copies of page 1 under unlimited URLs. */
export function directoryPage(value: unknown): number {
  if (value === undefined) return 1;
  if (typeof value !== "string" && typeof value !== "number") return 0;
  const text = String(value);
  if (!/^[1-9]\d*$/.test(text)) return 0;
  const page = Number(text);
  return Number.isSafeInteger(page) ? page : 0;
}

export function exchangePath(code: string, page = 1): string {
  return `/exchange/${encodeURIComponent(code)}${page > 1 ? `?page=${page}` : ""}`;
}

export function stockPath(exchange: string, symbol: string): string {
  return `/stock/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}`;
}
