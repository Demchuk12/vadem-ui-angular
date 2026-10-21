import { vdRatingKey, vdRatingValue } from './rating';

describe('Rating value and keyboard', () => {
  it('accepts whole stars and displays invalid external values as unrated', () => {
    expect([0, 1, 5, 2.5, -1, 6, NaN, null, '3'].map(vdRatingValue)).toEqual([
      0, 1, 5, 0, 0, 0, 0, 0, 0,
    ]);
  });
  it('wraps arrows and selects endpoints', () => {
    expect(vdRatingKey(5, 'ArrowRight', false)).toBe(1);
    expect(vdRatingKey(1, 'ArrowUp', false)).toBe(5);
    expect(vdRatingKey(3, 'Home', false)).toBe(1);
    expect(vdRatingKey(3, 'End', false)).toBe(5);
    expect(vdRatingKey(3, 'Tab', false)).toBeNull();
  });
  it('mirrors physical horizontal arrows while preserving reading-order arrows in RTL', () => {
    expect(vdRatingKey(3, 'ArrowRight', true)).toBe(2);
    expect(vdRatingKey(3, 'ArrowLeft', true)).toBe(4);
    expect(vdRatingKey(3, 'ArrowDown', true)).toBe(4);
  });
});
