/**
 * Framework-agnostic keyboard navigation for vertical lists with an "active" item
 * (listbox options, menu items): arrows, Home/End, PageUp/PageDown, disabled items skipped.
 */

export interface VdListKeyOptions {
  /** Wrap at the ends. APG listbox: false; menu: true. */
  loop: boolean;
  /** Items moved by PageUp/PageDown. */
  pageSize: number;
}

/**
 * Index to make active for `key`, or `null` when the key isn't handled.
 * `current` may be -1 (nothing active yet): ArrowDown goes to the first, ArrowUp to the last.
 * When no enabled item exists in the direction, returns `current`.
 */
export function vdListTarget(
  key: string,
  current: number,
  disabled: readonly boolean[],
  options: VdListKeyOptions,
): number | null {
  const count = disabled.length;
  if (count === 0) return null;
  const first = scan(disabled, 0, 1);
  const last = scan(disabled, count - 1, -1);
  if (first === null || last === null) return null;

  switch (key) {
    case 'Home':
      return first;
    case 'End':
      return last;
    case 'ArrowDown':
      if (current < 0) return first;
      return scan(disabled, current + 1, 1) ?? (options.loop ? first : current);
    case 'ArrowUp':
      if (current < 0) return last;
      return scan(disabled, current - 1, -1) ?? (options.loop ? last : current);
    case 'PageDown':
      return scan(disabled, Math.min(current + options.pageSize, count - 1), -1, current) ?? last;
    case 'PageUp':
      return scan(disabled, Math.max(current - options.pageSize, 0), 1, current) ?? first;
    default:
      return null;
  }
}

/** First enabled index from `from` stepping by `delta`, optionally not passing `stop`. */
function scan(
  disabled: readonly boolean[],
  from: number,
  delta: 1 | -1,
  stop?: number,
): number | null {
  for (let i = from; i >= 0 && i < disabled.length; i += delta) {
    if (stop !== undefined && (delta === 1 ? i > stop : i < stop)) break;
    if (!disabled[i]) return i;
  }
  return null;
}
