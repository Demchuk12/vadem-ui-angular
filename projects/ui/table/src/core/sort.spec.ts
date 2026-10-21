import { describe, expect, it } from 'vitest';
import { vdNextSort, vdSortRows } from './sort';

const rows = [
  { name: 'Ярослав', size: 10, file: 'file 10' },
  { name: 'Ірина', size: 2, file: 'file 2' },
  { name: 'андрій', size: null, file: '' },
  { name: 'Євген', size: 2, file: 'file 1' },
  { name: 'Борис', size: 7, file: 'file 7' },
];

describe('vdSortRows', () => {
  it('keeps source order without a sort and never mutates', () => {
    const copy = vdSortRows(rows, null);
    expect(copy).toEqual(rows);
    expect(copy).not.toBe(rows);
  });

  it('sorts Ukrainian text with the collator (case-insensitive, і/є in place)', () => {
    const names = vdSortRows(rows, { key: 'name', direction: 'ascending' }, { locale: 'uk' }).map(
      (r) => r.name,
    );
    expect(names).toEqual(['андрій', 'Борис', 'Євген', 'Ірина', 'Ярослав']);
  });

  it('sorts numbers by value, stable for ties, empty values last both ways', () => {
    const asc = vdSortRows(rows, { key: 'size', direction: 'ascending' }).map((r) => r.name);
    expect(asc).toEqual(['Ірина', 'Євген', 'Борис', 'Ярослав', 'андрій']);
    const desc = vdSortRows(rows, { key: 'size', direction: 'descending' }).map((r) => r.name);
    expect(desc).toEqual(['Ярослав', 'Борис', 'Ірина', 'Євген', 'андрій']);
  });

  it('compares numeric parts of text naturally', () => {
    const files = vdSortRows(rows, { key: 'file', direction: 'ascending' }).map((r) => r.file);
    expect(files).toEqual(['file 1', 'file 2', 'file 7', 'file 10', '']);
  });

  it('uses a custom accessor', () => {
    const byLength = vdSortRows(
      rows,
      { key: 'len', direction: 'descending' },
      { accessor: (r) => r.name.length },
    );
    expect(byLength[0].name).toBe('Ярослав');
  });
});

describe('vdNextSort', () => {
  it('starts ascending on a new column and flips on the same one', () => {
    const first = vdNextSort(null, 'name');
    expect(first).toEqual({ key: 'name', direction: 'ascending' });
    expect(vdNextSort(first, 'name')).toEqual({ key: 'name', direction: 'descending' });
    expect(vdNextSort(vdNextSort(first, 'name'), 'size')).toEqual({
      key: 'size',
      direction: 'ascending',
    });
  });
});
