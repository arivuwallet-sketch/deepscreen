// Preserve the restored ranking-page keyword metadata while allowing a broader
// set of relevant long-tail phrases to pass through. Google Search ignores the
// meta-keywords tag, so these remain metadata only and are never rendered as a
// visible keyword block.
const MAX_META_KEYWORDS = 100;
const MAX_META_KEYWORD_CHARS = 5000;

export function metaKeywords(...lists: string[][]): string {
  const seen = new Set<string>();
  const picked: string[] = [];
  let chars = 0;
  for (const list of lists) {
    for (const raw of list) {
      const k = raw.replace(/\s+/g, " ").trim();
      if (!k) continue;
      const key = k.toLowerCase();
      if (seen.has(key)) continue;
      const addedChars = k.length + (picked.length ? 2 : 0);
      if (picked.length >= MAX_META_KEYWORDS || chars + addedChars > MAX_META_KEYWORD_CHARS) {
        return picked.join(", ");
      }
      seen.add(key);
      picked.push(k);
      chars += addedChars;
    }
  }
  return picked.join(", ");
}
