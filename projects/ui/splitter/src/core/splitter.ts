export interface VdSplitterBounds {
  min: number;
  max: number;
}
const finite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Nonzero panes keep their scrollable content reachable; invalid/reversed bounds become fixed. */
export function vdSplitterBounds(min: number, max: number): VdSplitterBounds {
  const lower = clamp(finite(min, 10), 1, 99);
  return { min: lower, max: Math.max(lower, clamp(finite(max, 90), 1, 99)) };
}
export function vdSplitterValue(value: number, bounds: VdSplitterBounds): number {
  return clamp(finite(value, 50), bounds.min, bounds.max);
}
export function vdSplitterKey(
  key: string,
  value: number,
  bounds: VdSplitterBounds,
  orientation: 'horizontal' | 'vertical',
  dir: 'ltr' | 'rtl',
  step: number,
): number | null {
  if (key === 'Home') return bounds.min;
  if (key === 'End') return bounds.max;
  let delta = 0;
  if (orientation === 'horizontal') {
    if (key === 'ArrowRight') delta = dir === 'rtl' ? -1 : 1;
    if (key === 'ArrowLeft') delta = dir === 'rtl' ? 1 : -1;
  } else {
    if (key === 'ArrowDown') delta = 1;
    if (key === 'ArrowUp') delta = -1;
  }
  if (!delta) return null;
  const amount = step > 0 && Number.isFinite(step) ? step : 1;
  return vdSplitterValue(Math.round((value + delta * amount) * 10000) / 10000, bounds);
}
export function vdSplitterDrag(
  value: number,
  delta: number,
  span: number,
  bounds: VdSplitterBounds,
  reverse: boolean,
): number {
  if (!(span > 0) || !Number.isFinite(delta) || !Number.isFinite(span)) return value;
  return vdSplitterValue(
    Math.round((value + (delta / span) * 100 * (reverse ? -1 : 1)) * 10000) / 10000,
    bounds,
  );
}
