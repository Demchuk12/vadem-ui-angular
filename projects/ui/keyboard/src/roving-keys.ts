/**
 * Framework-agnostic keyboard navigation for a one-dimensional set of items (tabs, toolbars,
 * segmented controls) following the WAI-ARIA APG. No DOM access: callers pass state in and
 * get the index to focus back.
 */

export type VdOrientation = 'horizontal' | 'vertical';
export type VdDirection = 'ltr' | 'rtl';

export interface VdRovingOptions {
  orientation: VdOrientation;
  dir: VdDirection;
  /** Wrap from last to first and back. APG tabs: true. */
  loop: boolean;
}

/**
 * Returns the index to move focus to for `key`, or `null` when the key isn't a navigation key
 * for this orientation (let the browser handle it). Disabled items are skipped; if every item is
 * disabled, returns `null`.
 */
export function vdRovingTarget(
  key: string,
  current: number,
  disabled: readonly boolean[],
  options: VdRovingOptions,
): number | null {
  const count = disabled.length;
  if (count === 0) return null;

  const horizontal = options.orientation === 'horizontal';
  const forwardKey = horizontal
    ? options.dir === 'rtl'
      ? 'ArrowLeft'
      : 'ArrowRight'
    : 'ArrowDown';
  const backwardKey = horizontal ? (options.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';

  switch (key) {
    case 'Home':
      return firstEnabled(disabled, 0, 1);
    case 'End':
      return firstEnabled(disabled, count - 1, -1);
    case forwardKey:
      return step(disabled, current, 1, options.loop);
    case backwardKey:
      return step(disabled, current, -1, options.loop);
    default:
      return null;
  }
}

/** Keys that activate the focused item when activation is manual. */
export function vdIsActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

function firstEnabled(disabled: readonly boolean[], from: number, delta: 1 | -1): number | null {
  for (let i = from; i >= 0 && i < disabled.length; i += delta) {
    if (!disabled[i]) return i;
  }
  return null;
}

function step(
  disabled: readonly boolean[],
  current: number,
  delta: 1 | -1,
  loop: boolean,
): number | null {
  const count = disabled.length;
  let i = current;
  for (let n = 0; n < count; n++) {
    i += delta;
    if (i < 0 || i >= count) {
      if (!loop) return current;
      i = (i + count) % count;
    }
    if (!disabled[i]) return i;
  }
  return null;
}
