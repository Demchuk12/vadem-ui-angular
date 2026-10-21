/**
 * Framework-agnostic chart geometry: scales, ticks, stacking and SVG paths.
 * No DOM access; every function is pure and unit-tested.
 */

export interface VdChartSeries {
  name: string;
  /** One value per category; `null` = missing (a gap, never zero). */
  values: readonly (number | null)[];
}

export interface VdLinearScale {
  domain: readonly [number, number];
  range: readonly [number, number];
  (value: number): number;
}

export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): VdLinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const scale = ((value: number) => r0 + ((value - d0) / span) * (r1 - r0)) as VdLinearScale;
  return Object.assign(scale, { domain, range });
}

/** Round numbers for an axis: 1, 2, 2.5 or 5 times a power of ten. Always includes zero. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  const lo = Math.min(0, min);
  const hi = Math.max(0, max);
  if (lo === hi) return [0, 1];
  const raw = (hi - lo) / Math.max(1, target);
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

export interface VdBand {
  /** Start of each band. */
  start: number;
  /** Centre of each band. */
  center: number;
  /** Band width including its share of padding. */
  step: number;
}

/** Evenly spaced bands across `range` for `count` categories. */
export function bands(count: number, range: readonly [number, number]): VdBand[] {
  const [r0, r1] = range;
  const step = count > 0 ? (r1 - r0) / count : 0;
  return Array.from({ length: count }, (_, i) => ({
    start: r0 + i * step,
    center: r0 + (i + 0.5) * step,
    step,
  }));
}

/** Index of the band nearest to `position` (pointer or keyboard), clamped. */
export function nearestIndex(position: number, count: number, range: readonly [number, number]) {
  if (count <= 0) return -1;
  const [r0, r1] = range;
  const t = (position - r0) / (r1 - r0 || 1);
  return Math.min(count - 1, Math.max(0, Math.floor(t * count)));
}

export interface VdStackSegment {
  from: number;
  to: number;
}

/** Stacks positive values upward and negative values downward from zero, per category. */
export function stack(series: readonly VdChartSeries[], count: number): VdStackSegment[][] {
  const up = new Array<number>(count).fill(0);
  const down = new Array<number>(count).fill(0);
  return series.map((s) =>
    Array.from({ length: count }, (_, i) => {
      const v = s.values[i] ?? 0;
      if (v >= 0) {
        const seg = { from: up[i], to: up[i] + v };
        up[i] += v;
        return seg;
      }
      const seg = { from: down[i], to: down[i] + v };
      down[i] += v;
      return seg;
    }),
  );
}

/** [min, max] over all values (stacked totals when `stacked`). */
export function extent(series: readonly VdChartSeries[], count: number, stacked: boolean) {
  let min = 0;
  let max = 0;
  if (stacked) {
    for (const segments of stack(series, count))
      for (const seg of segments) {
        min = Math.min(min, seg.to);
        max = Math.max(max, seg.to);
      }
  } else {
    for (const s of series)
      for (const v of s.values) {
        if (v === null || !Number.isFinite(v)) continue;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
  }
  return [min, max] as const;
}

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * A bar from `base` to `end` along the value axis, `thickness` wide, centred at `center` on the
 * category axis. The data end is rounded (`radius`), the baseline end square.
 */
export function barPath(
  center: number,
  thickness: number,
  base: number,
  end: number,
  radius: number,
  orientation: 'vertical' | 'horizontal',
): string {
  const length = Math.abs(end - base);
  if (length < 0.5) return '';
  const rad = Math.min(radius, thickness / 2, length);
  const a = center - thickness / 2;
  const b = center + thickness / 2;
  const dir = end < base ? -1 : 1;
  const tip = end - dir * rad;
  if (orientation === 'vertical') {
    // Value axis is y; `dir` -1 means the bar grows upward on screen.
    return [
      `M${r(a)},${r(base)}`,
      `L${r(a)},${r(tip)}`,
      `Q${r(a)},${r(end)} ${r(a + rad)},${r(end)}`,
      `L${r(b - rad)},${r(end)}`,
      `Q${r(b)},${r(end)} ${r(b)},${r(tip)}`,
      `L${r(b)},${r(base)}`,
      'Z',
    ].join(' ');
  }
  return [
    `M${r(base)},${r(a)}`,
    `L${r(tip)},${r(a)}`,
    `Q${r(end)},${r(a)} ${r(end)},${r(a + rad)}`,
    `L${r(end)},${r(b - rad)}`,
    `Q${r(end)},${r(b)} ${r(tip)},${r(b)}`,
    `L${r(base)},${r(b)}`,
    'Z',
  ].join(' ');
}

export type VdPoint = readonly [x: number, y: number] | null;

/** Polyline through points; a `null` starts a new segment (missing data is a gap). */
export function linePath(points: readonly VdPoint[]): string {
  let d = '';
  let pen = false;
  for (const p of points) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${r(p[0])},${r(p[1])}`;
    pen = true;
  }
  return d;
}

/** Closed area between each continuous run of points and the baseline. */
export function areaPath(points: readonly VdPoint[], baseline: number): string {
  const runs: (readonly [number, number])[][] = [[]];
  for (const p of points) {
    if (p) runs[runs.length - 1].push(p);
    else if (runs[runs.length - 1].length) runs.push([]);
  }
  return runs
    .filter((run) => run.length > 1)
    .map(
      (run) =>
        `M${r(run[0][0])},${r(baseline)}` +
        run.map(([x, y]) => `L${r(x)},${r(y)}`).join('') +
        `L${r(run[run.length - 1][0])},${r(baseline)}Z`,
    )
    .join('');
}
