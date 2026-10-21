import { vdParseIso, vdParseDate, type VdIsoDate } from '@vadem/ui/calendar';
export interface VdDateRange {
  readonly start: VdIsoDate;
  readonly end: VdIsoDate;
}
export function vdValidRange(value: unknown): VdDateRange | null {
  if (!value || typeof value !== 'object') return null;
  const range = value as Partial<VdDateRange>;
  return typeof range.start === 'string' &&
    typeof range.end === 'string' &&
    vdParseIso(range.start) &&
    vdParseIso(range.end) &&
    range.start <= range.end
    ? { start: range.start, end: range.end }
    : null;
}
export function vdRangeAllowed(
  range: VdDateRange,
  min: string | null,
  max: string | null,
): boolean {
  return (!min || range.start >= min) && (!max || range.end <= max) && (!min || !max || min <= max);
}
export function vdRangeBetween(a: VdIsoDate, b: VdIsoDate): VdDateRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** Normalize Arabic decimal digits before the shared locale date parser. */
export function vdParseRangeDate(text: string, locale: string): VdIsoDate | null {
  return vdParseDate(
    text.replace(/[٠-٩۰-۹]/g, (char) =>
      String(char.charCodeAt(0) - (char >= '۰' ? 0x06f0 : 0x0660)),
    ),
    locale,
  );
}
