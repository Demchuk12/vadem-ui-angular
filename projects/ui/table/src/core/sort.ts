export type VdSortDirection = 'ascending' | 'descending';

/** Current sort of a table: which column and which way. `null` = source order. */
export interface VdSort {
  key: string;
  direction: VdSortDirection;
}

/** Next state when a column header is activated: a new column starts ascending, the same one flips. */
export function vdNextSort(current: VdSort | null, key: string): VdSort {
  if (current?.key !== key) return { key, direction: 'ascending' };
  return { key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' };
}

export interface VdSortOptions<T> {
  /** Value to compare for a column; defaults to `row[key]`. */
  accessor?: (row: T, key: string) => unknown;
  /** Locale for text comparison (e.g. 'uk'); defaults to the runtime locale. */
  locale?: string;
}

/**
 * Returns a sorted copy (stable). Numbers and dates compare by value, text with `Intl.Collator`
 * (case- and accent-aware, numeric: "file 2" < "file 10"). Empty values (null, undefined, '')
 * always go last, in both directions.
 */
export function vdSortRows<T>(
  rows: readonly T[],
  sort: VdSort | null,
  options: VdSortOptions<T> = {},
): T[] {
  if (!sort) return [...rows];
  const read = options.accessor ?? ((row: T, key: string) => (row as Record<string, unknown>)[key]);
  const collator = new Intl.Collator(options.locale, { numeric: true, sensitivity: 'base' });
  const sign = sort.direction === 'ascending' ? 1 : -1;
  const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

  return rows
    .map((row, index) => ({ row, index, value: read(row, sort.key) }))
    .sort((a, b) => {
      const aEmpty = isEmpty(a.value);
      const bEmpty = isEmpty(b.value);
      if (aEmpty || bEmpty) return aEmpty === bEmpty ? a.index - b.index : aEmpty ? 1 : -1;
      const result = compare(a.value, b.value, collator);
      return result === 0 ? a.index - b.index : result * sign;
    })
    .map((entry) => entry.row);
}

function compare(a: unknown, b: unknown, collator: Intl.Collator): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}
