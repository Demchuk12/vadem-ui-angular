export function vdActiveFiltersValid(filters: readonly { id: string }[]): boolean {
  const ids = new Set<string>();
  for (const filter of filters) {
    if (typeof filter.id !== 'string' || !filter.id.trim() || ids.has(filter.id)) return false;
    ids.add(filter.id);
  }
  return true;
}
