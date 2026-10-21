import {
  areaPath,
  bands,
  barPath,
  extent,
  linePath,
  linearScale,
  nearestIndex,
  niceTicks,
  stack,
} from './chart-math';

describe('chart math', () => {
  it('maps a linear domain onto a range, including inverted ranges', () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(50)).toBe(100);
    expect(y(100)).toBe(0);
  });

  it('produces round ticks that include zero', () => {
    expect(niceTicks(0, 87)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(0, 4.2)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(niceTicks(-30, 45)).toEqual([-40, -20, 0, 20, 40, 60]);
    expect(niceTicks(0, 0)).toEqual([0, 1]);
    expect(niceTicks(12, 980, 4)).toEqual([0, 250, 500, 750, 1000]);
  });

  it('splits a range into bands and finds the nearest one', () => {
    const b = bands(4, [0, 400]);
    expect(b.map((x) => x.center)).toEqual([50, 150, 250, 350]);
    expect(nearestIndex(-20, 4, [0, 400])).toBe(0);
    expect(nearestIndex(260, 4, [0, 400])).toBe(2);
    expect(nearestIndex(999, 4, [0, 400])).toBe(3);
    expect(nearestIndex(10, 0, [0, 400])).toBe(-1);
  });

  it('stacks positives up and negatives down; extent covers totals', () => {
    const series = [
      { name: 'a', values: [3, -2] },
      { name: 'b', values: [4, -1] },
    ];
    expect(stack(series, 2)).toEqual([
      [
        { from: 0, to: 3 },
        { from: 0, to: -2 },
      ],
      [
        { from: 3, to: 7 },
        { from: -2, to: -3 },
      ],
    ]);
    expect(extent(series, 2, true)).toEqual([-3, 7]);
    expect(extent(series, 2, false)).toEqual([-2, 4]);
  });

  it('rounds only the data end of a bar and skips zero-length bars', () => {
    const up = barPath(50, 20, 200, 100, 4, 'vertical');
    expect(up.startsWith('M40,200 L40,104 Q40,100 44,100')).toBe(true);
    expect(up.endsWith('L60,200 Z')).toBe(true);
    expect(barPath(50, 20, 200, 200, 4, 'vertical')).toBe('');
    const right = barPath(30, 10, 0, 80, 4, 'horizontal');
    expect(right.startsWith('M0,25 L76,25 Q80,25 80,29')).toBe(true);
  });

  it('breaks lines and areas at missing values', () => {
    const pts = [[0, 10], [10, 20], null, [30, 5], [40, 0]] as const;
    expect(linePath(pts)).toBe('M0,10L10,20M30,5L40,0');
    expect(areaPath(pts, 50)).toBe('M0,50L0,10L10,20L10,50ZM30,50L30,5L40,0L40,50Z');
  });
});
