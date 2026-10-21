/** Canonical display/editing identity without discarding accents or internal whitespace. */
export function vdTagKey(tag: string): string {
  return tag.trim().normalize('NFC').toLowerCase();
}

export function vdNormalizeTags(value: readonly string[] | null | undefined): string[] {
  const seen = new Set<string>();
  return (value ?? [])
    .filter((tag) => {
      if (typeof tag !== 'string') return false;
      const key = vdTagKey(tag);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((tag) => tag.trim().normalize('NFC'));
}

export function vdAddTag(
  value: readonly string[],
  draft: string,
):
  | { kind: 'empty'; tag: string }
  | { kind: 'duplicate'; tag: string }
  | { kind: 'added'; tag: string; value: string[] } {
  const tag = draft.trim().normalize('NFC');
  if (!tag) return { kind: 'empty', tag };
  const tags = vdNormalizeTags(value);
  if (tags.some((item) => vdTagKey(item) === vdTagKey(tag))) return { kind: 'duplicate', tag };
  return { kind: 'added', tag, value: [...tags, tag] };
}
