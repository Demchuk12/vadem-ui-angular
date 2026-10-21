import { computed, Directive, inject, input, model } from '@angular/core';
import {
  vdSelectTableRows,
  vdVisibleTableColumns,
  VdTableColumnDefinition,
  VdTableRowId,
} from './core/data-table';

/** Opt-in state for a consumer-rendered native Table. */
@Directive({ selector: '[vdDataTable]', exportAs: 'vdDataTable' })
export class VdDataTable {
  readonly rowIds = input<readonly VdTableRowId[]>([]);
  readonly columns = input<readonly VdTableColumnDefinition[]>([]);
  readonly columnOffset = input(0);
  readonly selected = model<ReadonlySet<VdTableRowId>>(new Set());
  readonly hiddenColumns = model<ReadonlySet<string>>(new Set());
  readonly visibleColumns = computed(() =>
    vdVisibleTableColumns(this.columns(), this.hiddenColumns()),
  );
  readonly columnCount = computed(() => this.columns().length + this.columnOffset());
  readonly allSelected = computed(
    () => this.rowIds().length > 0 && this.rowIds().every((id) => this.selected().has(id)),
  );
  readonly someSelected = computed(
    () => !this.allSelected() && this.rowIds().some((id) => this.selected().has(id)),
  );

  setSelected(id: VdTableRowId, checked: boolean): void {
    if (this.rowIds().includes(id))
      this.selected.set(vdSelectTableRows(this.selected(), [id], checked));
  }

  selectAll(checked: boolean): void {
    if (this.rowIds().length)
      this.selected.set(vdSelectTableRows(this.selected(), this.rowIds(), checked));
  }

  clearSelection(): void {
    this.selected.set(new Set());
  }

  isColumnVisible(key: string): boolean {
    return this.visibleColumns().some((column) => column.key === key);
  }

  canHideColumn(key: string): boolean {
    const column = this.columns().find((column) => column.key === key);
    return (
      !!column &&
      !column.required &&
      (!this.isColumnVisible(key) || this.visibleColumns().length > 1)
    );
  }

  setColumnVisible(key: string, visible: boolean): void {
    if (
      !this.columns().some((column) => column.key === key) ||
      (!visible && !this.canHideColumn(key))
    )
      return;
    // Normalize external invalid state before applying the action.
    const next = new Set(
      this.columns()
        .filter((column) => !this.isColumnVisible(column.key))
        .map((column) => column.key),
    );
    if (visible) next.delete(key);
    else next.add(key);
    this.hiddenColumns.set(next);
  }

  resetColumns(): void {
    this.hiddenColumns.set(new Set());
  }
}

@Directive({
  selector: 'th[vdTableColumn], td[vdTableColumn]',
  host: {
    '[hidden]': '!table.isColumnVisible(vdTableColumn())',
    '[attr.aria-colindex]': 'index()',
  },
})
export class VdTableColumn {
  readonly vdTableColumn = input.required<string>();
  protected readonly table = inject(VdDataTable);
  protected readonly index = computed(() => {
    const index = this.table.columns().findIndex((column) => column.key === this.vdTableColumn());
    return index < 0 ? null : index + 1 + this.table.columnOffset();
  });
}
