import { vdListTarget } from '@vadem/ui/keyboard';

export interface VdAutocompleteOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

/** Active identity is valid only while the current result set permits selection. */
export function vdAutocompleteActive(
  options: readonly VdAutocompleteOption[],
  id: string | null,
): VdAutocompleteOption | undefined {
  return options.find((option) => option.id === id && !option.disabled);
}

export function vdAutocompleteMove(
  options: readonly VdAutocompleteOption[],
  id: string | null,
  key: 'ArrowDown' | 'ArrowUp',
): string | null {
  const index = vdListTarget(
    key,
    options.findIndex((option) => option.id === id),
    options.map((option) => !!option.disabled),
    { loop: false, pageSize: 10 },
  );
  return index === null ? null : (options[index]?.id ?? null);
}

/** Physical viewport measurements in, logical inline offset out; no DOM dependency. */
export function vdAutocompletePlacement(
  anchor: { top: number; bottom: number; left: number; right: number; width: number },
  viewport: { width: number; height: number },
  height: number,
  gap: number,
  rtl: boolean,
) {
  const width = Math.max(0, Math.min(anchor.width, viewport.width - gap * 2));
  const below = Math.max(0, viewport.height - anchor.bottom - gap * 2);
  const above = Math.max(0, anchor.top - gap * 2);
  const flip = height > below && above > below;
  const available = flip ? above : below;
  const top = Math.max(
    gap,
    flip ? anchor.top - Math.min(height, available) - gap : anchor.bottom + gap,
  );
  const start = rtl ? viewport.width - anchor.right : anchor.left;
  const inline = Math.max(gap, Math.min(start, viewport.width - width - gap));
  return { width, top, inline, available };
}
