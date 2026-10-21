/**
 * Initials for an avatar fallback: the first letter of the first and last word
 * ("Олена Коваленко" -> "ОК", "Prince" -> "P"). Grapheme-safe for surrogate pairs and
 * locale-aware uppercasing; words without letters or digits (dashes, emoji) are skipped.
 */
export function vdInitials(name: string, locale?: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
  if (!words.length) return '';
  const first = (w: string) => Array.from(w.replace(/^[^\p{L}\p{N}]+/u, ''))[0] ?? '';
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : [words[0]];
  return picked.map(first).join('').toLocaleUpperCase(locale);
}
