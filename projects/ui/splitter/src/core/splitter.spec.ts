import { vdSplitterBounds, vdSplitterDrag, vdSplitterKey, vdSplitterValue } from './splitter';

describe('Splitter arithmetic', () => {
  it('normalizes nonfinite, reversed and zero-size bounds without collapsing either pane', () => {
    expect(vdSplitterBounds(NaN, Infinity)).toEqual({ min: 10, max: 90 });
    expect(vdSplitterBounds(-20, 200)).toEqual({ min: 1, max: 99 });
    expect(vdSplitterBounds(80, 20)).toEqual({ min: 80, max: 80 });
  });
  it('clamps input and uses a finite fallback', () => {
    const bounds = vdSplitterBounds(20, 80);
    expect([NaN, -10, 120, 32.5].map((value) => vdSplitterValue(value, bounds))).toEqual([
      50, 20, 80, 32.5,
    ]);
  });
  it('mirrors physical horizontal arrows in RTL and preserves irrelevant keys', () => {
    const bounds = vdSplitterBounds(20, 80);
    expect(vdSplitterKey('ArrowRight', 50, bounds, 'horizontal', 'ltr', 2)).toBe(52);
    expect(vdSplitterKey('ArrowRight', 50, bounds, 'horizontal', 'rtl', 2)).toBe(48);
    expect(vdSplitterKey('ArrowLeft', 50, bounds, 'horizontal', 'rtl', 2)).toBe(52);
    expect(vdSplitterKey('ArrowUp', 50, bounds, 'horizontal', 'ltr', 2)).toBeNull();
    expect(vdSplitterKey('Enter', 50, bounds, 'horizontal', 'ltr', 2)).toBeNull();
  });
  it('uses vertical steps, bounds and stable decimal arithmetic', () => {
    const bounds = vdSplitterBounds(20, 80);
    expect(vdSplitterKey('Home', 50, bounds, 'vertical', 'rtl', 2.5)).toBe(20);
    expect(vdSplitterKey('End', 50, bounds, 'vertical', 'rtl', 2.5)).toBe(80);
    expect(vdSplitterKey('ArrowDown', 50, bounds, 'vertical', 'rtl', 2.5)).toBe(52.5);
    expect(vdSplitterKey('ArrowUp', 50, bounds, 'vertical', 'ltr', 0)).toBe(49);
    expect(vdSplitterKey('ArrowRight', 50, bounds, 'vertical', 'ltr', 1)).toBeNull();
  });
  it('converts drag distance to a bounded share and reverses RTL', () => {
    const bounds = vdSplitterBounds(20, 80);
    expect(vdSplitterDrag(50, 60, 300, bounds, false)).toBe(70);
    expect(vdSplitterDrag(50, 60, 300, bounds, true)).toBe(30);
    expect(vdSplitterDrag(50, 1000, 300, bounds, false)).toBe(80);
    expect(vdSplitterDrag(50, -1000, 300, bounds, false)).toBe(20);
  });
  it('ignores absent/nonfinite geometry', () => {
    const bounds = vdSplitterBounds(20, 80);
    expect(vdSplitterDrag(50, 10, 0, bounds, false)).toBe(50);
    expect(vdSplitterDrag(50, NaN, 300, bounds, false)).toBe(50);
    expect(vdSplitterDrag(50, 10, Infinity, bounds, false)).toBe(50);
  });
});
