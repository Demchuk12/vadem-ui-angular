import { vdMatchesQuery } from '@vadem/ui/keyboard';

/** Pure searchable-action data; no framework or routing concerns. */
export interface VdCommandRecord {
  readonly id: string;
  readonly label: string;
  readonly keywords: readonly string[];
  readonly disabled: boolean;
}

export function vdFilterCommands<T extends VdCommandRecord>(
  items: readonly T[],
  query: string,
): T[] {
  return items.filter((item) => vdMatchesQuery([item.label, ...item.keywords].join(' '), query));
}

/** Preserve a valid active action by identity, otherwise choose the first enabled result. */
export function vdActiveCommand<T extends VdCommandRecord>(
  items: readonly T[],
  activeId: string | null,
): T | null {
  return (
    items.find((item) => item.id === activeId && !item.disabled) ??
    items.find((item) => !item.disabled) ??
    null
  );
}
