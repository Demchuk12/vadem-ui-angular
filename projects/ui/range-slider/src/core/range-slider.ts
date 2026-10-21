export type VdRangeValue = readonly [number, number];
export interface VdRangeBounds {
  min: number;
  max: number;
  step: number;
}

export function vdRangeBounds(min: number, max: number, step: number): VdRangeBounds {
  min = Number.isFinite(min) ? min : 0;
  max = Number.isFinite(max) ? Math.max(min, max) : Math.max(min, 100);
  step = Number.isFinite(step) && step > 0 ? step : 1;
  const count = Math.floor((max - min) / step + 1e-9);
  if (!Number.isFinite(count) || !Number.isFinite(max - min)) return { min, max: min, step };
  return {
    min,
    max: Math.max(min, Math.min(max, Number((min + count * step).toPrecision(14)))),
    step,
  };
}
export function vdRangeSnap(value: number, bounds: VdRangeBounds): number {
  const { min, max, step } = bounds;
  const safe = Number.isFinite(value) ? value : min;
  const clamped = Math.min(max, Math.max(min, safe));
  return Math.min(
    max,
    Math.max(min, Number((min + Math.round((clamped - min) / step) * step).toPrecision(14))),
  );
}
export function vdRangeValue(value: VdRangeValue | null, bounds: VdRangeBounds): VdRangeValue {
  const lower = vdRangeSnap(value?.[0] ?? bounds.min, bounds);
  const upper = vdRangeSnap(value?.[1] ?? bounds.max, bounds);
  return lower <= upper ? [lower, upper] : [upper, lower];
}
export function vdRangeMove(
  value: VdRangeValue,
  index: 0 | 1,
  next: number,
  bounds: VdRangeBounds,
): VdRangeValue {
  const snapped = vdRangeSnap(next, bounds);
  return index === 0
    ? [Math.min(snapped, value[1]), value[1]]
    : [value[0], Math.max(snapped, value[0])];
}
export function vdRangeKey(
  key: string,
  current: number,
  min: number,
  max: number,
  step: number,
  rtl: boolean,
): number | null {
  switch (key) {
    case 'Home':
      return min;
    case 'End':
      return max;
    case 'ArrowUp':
      return current + step;
    case 'ArrowDown':
      return current - step;
    case 'ArrowRight':
      return current + (rtl ? -step : step);
    case 'ArrowLeft':
      return current + (rtl ? step : -step);
    case 'PageUp':
      return current + step * 10;
    case 'PageDown':
      return current - step * 10;
    default:
      return null;
  }
}
