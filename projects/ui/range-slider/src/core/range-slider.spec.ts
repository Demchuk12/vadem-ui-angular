import { describe, expect, it } from 'vitest';
import { vdRangeBounds, vdRangeValue, vdRangeMove, vdRangeKey } from './range-slider';
describe('Range slider arithmetic', () => {
  it('aligns decimal steps to min without drift and preserves bounds', () => {
    const bounds = vdRangeBounds(0.1, 1, 0.2);
    expect(bounds).toEqual({ min: 0.1, max: 0.9, step: 0.2 });
    expect(vdRangeValue([0.31, 2], bounds)).toEqual([0.3, 0.9]);
    expect(vdRangeMove([0.3, 0.9], 0, 0.3 + 0.2, bounds)).toEqual([0.5, 0.9]);
  });
  it('cannot cross either thumb and does not mutate the source', () => {
    const value = [20, 80] as const;
    const bounds = vdRangeBounds(0, 100, 1);
    expect(vdRangeMove(value, 0, 200, bounds)).toEqual([80, 80]);
    expect(vdRangeMove(value, 1, -1, bounds)).toEqual([20, 20]);
    expect(value).toEqual([20, 80]);
  });
  it('normalizes null, nonfinite, reversed and collapsed values', () => {
    const bounds = vdRangeBounds(0, 100, 1);
    expect(vdRangeValue(null, bounds)).toEqual([0, 100]);
    expect(vdRangeValue([80, 20], bounds)).toEqual([20, 80]);
    expect(vdRangeValue([NaN, Infinity], bounds)).toEqual([0, 0]);
    expect(vdRangeBounds(5, 3, -1)).toEqual({ min: 5, max: 5, step: 1 });
    expect(vdRangeBounds(NaN, Infinity, NaN)).toEqual(bounds);
  });
  it('maps keyboard increments and dependent Home/End bounds in RTL', () => {
    expect(vdRangeKey('ArrowRight', 50, 20, 80, 5, true)).toBe(45);
    expect(vdRangeKey('ArrowLeft', 50, 20, 80, 5, true)).toBe(55);
    expect(vdRangeKey('PageUp', 50, 20, 80, 5, false)).toBe(100);
    expect(vdRangeKey('Home', 50, 20, 80, 5, false)).toBe(20);
    expect(vdRangeKey('End', 50, 20, 80, 5, false)).toBe(80);
    expect(vdRangeKey('Tab', 50, 20, 80, 5, false)).toBeNull();
  });
});
