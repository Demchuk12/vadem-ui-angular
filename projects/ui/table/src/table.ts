import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';
import { VdSort, vdNextSort } from './core/sort';

export type VdTableSize = 'sm' | 'md';

/**
 * Styles a native `<table>` and owns its sort state. Rows are rendered (and sorted, e.g. with
 * `vdSortRows`) by the consumer. Spec: specs/table.md
 */
@Directive({
  selector: 'table[vdTable]',
  exportAs: 'vdTable',
  host: {
    class: 'vd-table',
    '[attr.data-size]': 'size()',
    '[attr.data-sticky-header]': 'stickyHeader() ? "" : null',
  },
})
export class VdTable {
  readonly size = input<VdTableSize>('md');
  /** Header stays visible while a `vdTableScroll` container scrolls vertically. */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  /** Current sort (two-way). `null` = source order. */
  readonly sort = model<VdSort | null>(null);

  toggleSort(key: string): void {
    this.sort.set(vdNextSort(this.sort(), key));
  }
}

/**
 * Sortable column header (APG sortable table): a button inside the `th`, `aria-sort` on the
 * sorted column only.
 */
@Component({
  // Attribute selector: the native `th` keeps its table semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'th[vdSortHeader]',
  imports: [VdIcon],
  template: `
    <button type="button" class="vd-table__sort" (click)="table.toggleSort(vdSortHeader())">
      <span><ng-content /></span>
      <vd-icon class="vd-table__sort-icon" [name]="icon()" />
    </button>
  `,
  host: {
    '[attr.aria-sort]': 'direction()',
    '[attr.data-sorted]': 'direction() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSortHeader {
  /** Sort key for this column. */
  readonly vdSortHeader = input.required<string>();

  protected readonly table = inject(VdTable);
  protected readonly direction = computed(() => {
    const sort = this.table.sort();
    return sort?.key === this.vdSortHeader() ? sort.direction : null;
  });
  protected readonly icon = computed(() => {
    const d = this.direction();
    return d === 'ascending' ? 'arrow-up' : d === 'descending' ? 'arrow-down' : 'arrow-up-down';
  });
}

/** A body row; `selected` only styles it - the row's checkbox carries the state for AT. */
@Directive({
  selector: 'tr[vdRow]',
  host: { '[attr.data-selected]': 'selected() ? "" : null' },
})
export class VdRow {
  readonly selected = input(false, { transform: booleanAttribute });
}

/** Full-width cell for the empty / no-results state: `<td vdTableEmpty colspan="5">`. */
@Directive({ selector: 'td[vdTableEmpty]', host: { class: 'vd-table__empty' } })
export class VdTableEmpty {}

/**
 * Scroll container for wide or tall tables. Focusable so keyboard users can scroll it;
 * give it a name (`aria-label` or `aria-labelledby` the caption).
 */
@Directive({
  selector: '[vdTableScroll]',
  host: { class: 'vd-table-scroll', role: 'region', tabindex: '0' },
})
export class VdTableScroll {}

export const VD_TABLE = [VdTable, VdSortHeader, VdRow, VdTableEmpty, VdTableScroll] as const;
