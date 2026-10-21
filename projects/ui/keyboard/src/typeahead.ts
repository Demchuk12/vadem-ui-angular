/**
 * Framework-agnostic typeahead: type letters to jump to the next item whose label starts with
 * them. Repeating one letter cycles through matches; the buffer resets after a pause.
 */

export class VdTypeahead {
  private buffer = '';
  private last = 0;

  constructor(
    private readonly timeout = 500,
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** True for keys that should feed the typeahead (single printable characters, no modifiers). */
  static accepts(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): boolean {
    return (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    );
  }

  /** Index of the match, or `null`. Search starts after `current` and wraps. */
  match(
    char: string,
    labels: readonly string[],
    disabled: readonly boolean[],
    current: number,
  ): number | null {
    const t = this.now();
    if (t - this.last > this.timeout) this.buffer = '';
    this.last = t;

    const c = char.toLocaleLowerCase();
    const repeating = this.buffer.length > 0 && [...this.buffer].every((ch) => ch === c);
    this.buffer += c;
    const query = repeating ? c : this.buffer;
    // A fresh or cycling search looks past the current item; a longer word may still match it.
    const start = repeating || this.buffer.length === 1 ? current + 1 : Math.max(current, 0);

    const n = labels.length;
    for (let i = 0; i < n; i++) {
      const idx = (((start + i) % n) + n) % n;
      if (!disabled[idx] && vdNormalize(labels[idx]).startsWith(query)) return idx;
    }
    return null;
  }

  reset(): void {
    this.buffer = '';
  }
}

/**
 * Case- and accent-insensitive form for matching user input against labels. Diacritics are
 * dropped (so "ї" also matches "і", "é" matches "e"); the apostrophe variants are unified.
 */
export function vdNormalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’ʼ`]/g, "'")
    .toLocaleLowerCase()
    .trim();
}

/** Filtering predicate for comboboxes: every word of the query occurs in the label. */
export function vdMatchesQuery(label: string, query: string): boolean {
  const words = vdNormalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = vdNormalize(label);
  return words.every((w) => haystack.includes(w));
}
