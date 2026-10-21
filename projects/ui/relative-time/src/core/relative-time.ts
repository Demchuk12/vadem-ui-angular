export interface VdRelativeTimeOptions {
  readonly locale?: string;
  readonly justNowText?: string;
  readonly unknownText?: string;
}
const MIN = -62135596800000; // 0001-01-01T00:00:00.000Z
const MAX = 253402300799999; // 9999-12-31T23:59:59.999Z

/** Epoch milliseconds only, constrained to the native time element's four-digit year range. */
export function vdRelativeTimeValid(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= MIN && value <= MAX;
}
const UNITS: readonly [number, Intl.RelativeTimeFormatUnit][] = [
  [365 * 86400000, 'year'],
  [30 * 86400000, 'month'],
  [7 * 86400000, 'week'],
  [86400000, 'day'],
  [3600000, 'hour'],
  [60000, 'minute'],
  [1000, 'second'],
];

/** Elapsed-duration labels; callers own the clock and refresh cadence. */
export function vdFormatRelativeTime(
  value: number | null | undefined,
  now: number | null | undefined,
  options: VdRelativeTimeOptions = {},
): string {
  if (!vdRelativeTimeValid(value) || !vdRelativeTimeValid(now))
    return options.unknownText ?? 'Unknown time';
  const delta = value - now;
  if (delta <= 0 && delta > -5000) return options.justNowText ?? 'Just now';
  const [span, unit] = UNITS.find(([span]) => Math.abs(delta) >= span) ?? UNITS[UNITS.length - 1];
  const count = Math.sign(delta) * Math.max(1, Math.floor(Math.abs(delta) / span));
  let formatter: Intl.RelativeTimeFormat;
  try {
    formatter = new Intl.RelativeTimeFormat(options.locale ?? 'en', { numeric: 'always' });
  } catch {
    formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
  }
  return formatter.format(count, unit);
}
