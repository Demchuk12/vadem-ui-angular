import { describe, expect, it } from 'vitest';
import { vdPageRange } from './range';

describe('vdPageRange', () => {
  it('lists every page when they fit', () => {
    expect(vdPageRange(1, 1)).toEqual([1]);
    expect(vdPageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(vdPageRange(1, 0)).toEqual([]);
  });

  it('collapses both sides around the current page', () => {
    expect(vdPageRange(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]);
  });

  it('keeps a constant length near the edges', () => {
    expect(vdPageRange(1, 12)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 12]);
    expect(vdPageRange(4, 12)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 12]);
    expect(vdPageRange(5, 12)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 12]);
    expect(vdPageRange(9, 12)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12]);
    expect(vdPageRange(12, 12)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12]);
    for (let p = 1; p <= 40; p++) expect(vdPageRange(p, 40)).toHaveLength(7);
  });

  it('never hides a single page behind an ellipsis', () => {
    // An ellipsis would stand for page 2 alone: show 2.
    expect(vdPageRange(4, 9)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 9]);
    for (let p = 1; p <= 20; p++) {
      const items = vdPageRange(p, 20);
      items.forEach((item, i) => {
        if (item !== 'ellipsis') return;
        const prev = items[i - 1] as number;
        const next = items[i + 1] as number;
        expect(next - prev).toBeGreaterThan(2);
      });
    }
  });

  it('supports more siblings and boundaries, and clamps the page', () => {
    expect(vdPageRange(10, 20, 2, 2)).toEqual([
      1,
      2,
      'ellipsis',
      8,
      9,
      10,
      11,
      12,
      'ellipsis',
      19,
      20,
    ]);
    expect(vdPageRange(99, 12)).toEqual(vdPageRange(12, 12));
  });
});
