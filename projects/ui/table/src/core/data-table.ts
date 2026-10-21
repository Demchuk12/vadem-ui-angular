export type VdTableRowId = string | number;
export interface VdTableColumnDefinition {
  key: string;
  required?: boolean;
}

/** Return a new selection while preserving IDs outside the current page. */
export function vdSelectTableRows(
  selected: ReadonlySet<VdTableRowId>,
  ids: readonly VdTableRowId[],
  checked: boolean,
): Set<VdTableRowId> {
  const next = new Set(selected);
  for (const id of ids) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return next;
}

/** Required columns and at least one column remain visible even with invalid external state. */
export function vdVisibleTableColumns(
  columns: readonly VdTableColumnDefinition[],
  hidden: ReadonlySet<string>,
): readonly VdTableColumnDefinition[] {
  const visible = columns.filter((column) => column.required || !hidden.has(column.key));
  return visible.length || !columns.length ? visible : [columns[0]];
}
