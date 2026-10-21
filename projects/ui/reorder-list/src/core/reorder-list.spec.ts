import { vdReorderMove, vdReorderTarget, vdReorderValid } from './reorder-list';
describe('Reorder list core', () => {
  it('validates stable nonempty unique IDs without changing source', () => {
    expect(vdReorderValid([])).toBe(true);
    expect(vdReorderValid([{ id: 'Ї' }, { id: 'a"[]' }])).toBe(true);
    expect(vdReorderValid([{ id: 'a' }, { id: 'a' }])).toBe(false);
    expect(vdReorderValid([{ id: '  ' }])).toBe(false);
  });
  it('moves records immutably in either direction with original identities', () => {
    const items = Object.freeze([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const down = vdReorderMove(items, 0, 2);
    expect(down.map((item) => item.id)).toEqual(['b', 'c', 'a']);
    expect(down[2]).toBe(items[0]);
    expect(vdReorderMove(down, 2, 0)).toEqual(items);
    expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
  it('does not emit an artificial new array at boundaries, invalid indices or same position', () => {
    const items = ['a', 'b'];
    for (const [from, to] of [
      [0, 0],
      [0, -1],
      [0, 2],
      [-1, 0],
      [2, 0],
      [0, NaN],
      [0.5, 1],
      [Infinity, 0],
    ])
      expect(vdReorderMove(items, from, to)).toBe(items);
    expect(vdReorderMove([], 0, 0)).toEqual([]);
  });
  it('resolves stationary variable-height rows, gaps and empty/nonfinite coordinates', () => {
    const rows = [
      { top: 10, bottom: 40 },
      { top: 50, bottom: 180 },
      { top: 200, bottom: 230 },
    ];
    expect(vdReorderTarget(10, rows)).toBe(0);
    expect(vdReorderTarget(45, rows)).toBe(1);
    expect(vdReorderTarget(160, rows)).toBe(1);
    expect(vdReorderTarget(225, rows)).toBe(2);
    expect(vdReorderTarget(300, rows)).toBe(2);
    expect(vdReorderTarget(NaN, rows)).toBe(-1);
    expect(vdReorderTarget(30, [])).toBe(-1);
  });
});
