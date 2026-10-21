export interface VdTextHighlightPart {
  readonly text: string;
  readonly matched: boolean;
}

/** Unicode simple case folding keeps match indices tied to the original source. */
export function vdTextHighlightParts(text: string, query: string): readonly VdTextHighlightPart[] {
  if (!text) return [];
  if (!query) return [{ text, matched: false }];
  const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
  const parts: VdTextHighlightPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index), matched: false });
    parts.push({ text: match[0], matched: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), matched: false });
  return parts;
}
