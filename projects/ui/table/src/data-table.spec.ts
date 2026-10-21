import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { VdDataTable } from './data-table';
import { vdSelectTableRows, vdVisibleTableColumns } from './core/data-table';

@Component({
  imports: [VdDataTable],
  template: `<div vdDataTable [rowIds]="['a', 'b']" [columns]="columns()"></div>`,
})
class Host {
  readonly columns = signal<{ key: string; required?: boolean }[]>([{ key: 'a' }, { key: 'b' }]);
}

describe('Data table', () => {
  it('preserves off-page selection without mutating its input', () => {
    const source = new Set(['outside', 'a']);
    expect(vdSelectTableRows(source, ['a', 'b'], false)).toEqual(new Set(['outside']));
    expect(vdSelectTableRows(source, ['a', 'b'], true)).toEqual(new Set(['outside', 'a', 'b']));
    expect(source).toEqual(new Set(['outside', 'a']));
  });
  it('keeps required columns and guards invalid all-hidden state', () => {
    expect(
      vdVisibleTableColumns([{ key: 'a' }, { key: 'b', required: true }], new Set(['a', 'b'])),
    ).toEqual([{ key: 'b', required: true }]);
    expect(vdVisibleTableColumns([{ key: 'a' }, { key: 'b' }], new Set(['a', 'b']))).toEqual([
      { key: 'a' },
    ]);
    expect(vdVisibleTableColumns([], new Set())).toEqual([]);
  });
  it('guards the last column and emits immutable selection state', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const table = fixture.debugElement.children[0].injector.get(VdDataTable);
    table.setSelected('a', true);
    expect(table.someSelected()).toBe(true);
    table.selectAll(true);
    expect(table.allSelected()).toBe(true);
    table.setColumnVisible('a', false);
    const hidden = table.hiddenColumns();
    table.setColumnVisible('b', false);
    expect(table.hiddenColumns()).toBe(hidden);
    expect(table.isColumnVisible('b')).toBe(true);
    fixture.componentInstance.columns.set([{ key: 'a', required: true }, { key: 'b' }]);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(table.isColumnVisible('a')).toBe(true);
    table.resetColumns();
    expect(table.hiddenColumns().size).toBe(0);
    table.clearSelection();
    expect(table.selected().size).toBe(0);
  });
  it('does not mutate models when an action targets an unknown row or column', () => {
    const table = TestBed.runInInjectionContext(() => new VdDataTable());
    const selection = table.selected();
    const hidden = table.hiddenColumns();
    table.setSelected('unknown', true);
    table.selectAll(true);
    table.setColumnVisible('unknown', false);
    expect(table.selected()).toBe(selection);
    expect(table.hiddenColumns()).toBe(hidden);
    expect(table.allSelected()).toBe(false);
    expect(table.someSelected()).toBe(false);
  });
});
