/** Only whole-star values 1..5 are displayed; 0 represents an unrated control. */
export function vdRatingValue(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
    ? value
    : 0;
}

/** Radio navigation wraps in reading order; physical horizontal arrows respect RTL. */
export function vdRatingKey(value: number, key: string, rtl: boolean): number | null {
  if (key === 'Home') return 1;
  if (key === 'End') return 5;
  const delta =
    key === 'ArrowDown'
      ? 1
      : key === 'ArrowUp'
        ? -1
        : key === 'ArrowRight'
          ? rtl
            ? -1
            : 1
          : key === 'ArrowLeft'
            ? rtl
              ? 1
              : -1
            : 0;
  if (!delta) return null;
  return ((Math.max(1, vdRatingValue(value)) - 1 + delta + 5) % 5) + 1;
}
