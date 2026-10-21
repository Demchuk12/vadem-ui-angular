export function vdReorderValid(items: readonly { id: string }[]): boolean {
  const ids = new Set<string>();
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) return false;
    ids.add(item.id);
  }
  return true;
}

export function vdReorderMove<T>(items: readonly T[], from: number, to: number): readonly T[] {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length ||
    from === to
  )
    return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Existing stationary row rectangles; gaps resolve to the following row. */
export function vdReorderTarget(
  y: number,
  rows: readonly { top: number; bottom: number }[],
): number {
  if (!Number.isFinite(y) || !rows.length) return -1;
  const index = rows.findIndex((row) => y < row.bottom);
  return index < 0 ? rows.length - 1 : index;
}
