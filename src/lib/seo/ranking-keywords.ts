// Preserve the original keyword metadata on the restored ranking pages.
export function metaKeywords(...lists: string[][]): string {
  const seen = new Set<string>();
  const picked: string[] = [];
  for (const list of lists) {
    for (const k of list) {
      const key = k.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(k);
      if (picked.length >= 45) return picked.join(", ");
    }
  }
  return picked.join(", ");
}
