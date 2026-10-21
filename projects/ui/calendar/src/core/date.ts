/**
 * Plain calendar dates as ISO strings ("2026-10-02"): no time, no time zone, so a date never
 * shifts by a day between server, client and DST changes. All math goes through UTC.
 */
export type VdIsoDate = string;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses "YYYY-MM-DD"; null when malformed or not a real date (e.g. 2026-02-30). */
export function vdParseIso(value: string | null | undefined): Date | null {
  const m = value ? ISO.exec(value) : null;
  if (!m) return null;
  const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return vdToIso(date) === value ? date : null;
}

export function vdToIso(date: Date): VdIsoDate {
  return date.toISOString().slice(0, 10);
}

/** Today in the user's local calendar (not UTC). */
export function vdToday(now = new Date()): VdIsoDate {
  return vdToIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function vdAddDays(iso: VdIsoDate, days: number): VdIsoDate {
  const d = vdParseIso(iso)!;
  d.setUTCDate(d.getUTCDate() + days);
  return vdToIso(d);
}

/** Adds months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
export function vdAddMonths(iso: VdIsoDate, months: number): VdIsoDate {
  const d = vdParseIso(iso)!;
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return vdToIso(target);
}

/** 0 = Sunday ... 6 = Saturday. */
export function vdWeekday(iso: VdIsoDate): number {
  return vdParseIso(iso)!.getUTCDay();
}

export function vdStartOfMonth(iso: VdIsoDate): VdIsoDate {
  return iso.slice(0, 8) + '01';
}

/** Earlier/later than, as strings compare lexicographically for ISO dates. */
export function vdClampDate(
  iso: VdIsoDate,
  min?: VdIsoDate | null,
  max?: VdIsoDate | null,
): VdIsoDate {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

export interface VdCalendarDay {
  date: VdIsoDate;
  day: number;
  inMonth: boolean;
}

/**
 * Weeks of the month that contains `month` (any date in it), starting on `firstDay`
 * (0 = Sunday, 1 = Monday...). Always 6 weeks, so the grid height never jumps between months.
 */
export function vdMonthGrid(month: VdIsoDate, firstDay: number): VdCalendarDay[][] {
  const first = vdStartOfMonth(month);
  const offset = (vdWeekday(first) - firstDay + 7) % 7;
  let cursor = vdAddDays(first, -offset);
  const weeks: VdCalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: VdCalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: cursor,
        day: +cursor.slice(8),
        inMonth: cursor.slice(0, 7) === first.slice(0, 7),
      });
      cursor = vdAddDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Regions whose week starts on Sunday or Saturday; everyone else (incl. UA, EU) starts Monday. */
const SUNDAY_FIRST = new Set([
  'US',
  'CA',
  'MX',
  'BR',
  'JP',
  'KR',
  'TW',
  'HK',
  'IL',
  'IN',
  'PH',
  'SA',
  'ZA',
  'AU',
]);
const SATURDAY_FIRST = new Set(['AE', 'EG', 'IR', 'DZ', 'IQ', 'JO', 'KW', 'LY', 'OM', 'QA', 'SY']);

/** First day of the week for a locale (0 = Sunday), from Intl when available. */
export function vdFirstDayOfWeek(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    // Intl uses 1 = Monday ... 7 = Sunday.
    if (info?.firstDay) return info.firstDay % 7;
    const region = loc.maximize().region ?? '';
    if (SUNDAY_FIRST.has(region)) return 0;
    if (SATURDAY_FIRST.has(region)) return 6;
  } catch {
    /* invalid locale: fall through */
  }
  return 1;
}

/** Narrow/short weekday names in grid order. */
export function vdWeekdayNames(
  locale: string,
  firstDay: number,
  width: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' });
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(Date.UTC(2023, 0, 1 + ((firstDay + i) % 7)))),
  );
}

export function vdFormatDate(
  iso: VdIsoDate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = vdParseIso(iso);
  return date ? new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date) : '';
}

/**
 * Order of the numeric parts in the locale's short date ("dd.mm.yyyy" for uk, "mm/dd/yyyy" for
 * en-US), used to parse typed dates and to show a placeholder.
 */
export function vdDateOrder(locale: string): ('day' | 'month' | 'year')[] {
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(Date.UTC(2006, 10, 22)));
  return parts
    .map((p) => p.type)
    .filter((t): t is 'day' | 'month' | 'year' => t === 'day' || t === 'month' || t === 'year');
}

/**
 * Parses a typed date: ISO ("2026-10-02") or three numbers in the locale's order with any
 * separators ("2.10.2026", "02/10/26"). Two-digit years map to 2000-2099. Null when invalid.
 */
export function vdParseDate(text: string, locale: string): VdIsoDate | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (vdParseIso(trimmed)) return trimmed;
  const nums = trimmed.match(/\d+/g);
  if (!nums || nums.length !== 3) return null;
  const order = vdDateOrder(locale);
  const parts: Record<string, number> = {};
  order.forEach((type, i) => (parts[type] = +nums[i]));
  let year = parts['year'];
  if (nums[order.indexOf('year')].length <= 2) year += 2000;
  const iso = `${String(year).padStart(4, '0')}-${String(parts['month']).padStart(2, '0')}-${String(parts['day']).padStart(2, '0')}`;
  return vdParseIso(iso) ? iso : null;
}

/** Numeric short format used in the text field ("02.10.2026" for uk). */
export function vdFormatShort(iso: VdIsoDate, locale: string): string {
  return vdFormatDate(iso, locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * APG date-grid keys. Returns the date focus should move to, or null for keys the grid ignores.
 * Arrows move by day/week (mirrored when `rtl`), Home/End to the week start/end, PageUp/Down
 * by month, Shift+PageUp/Down by year.
 */
export function vdCalendarKey(
  key: string,
  current: VdIsoDate,
  options: { firstDay: number; rtl?: boolean; shift?: boolean },
): VdIsoDate | null {
  const back = options.rtl ? 'ArrowRight' : 'ArrowLeft';
  const forward = options.rtl ? 'ArrowLeft' : 'ArrowRight';
  switch (key) {
    case back:
      return vdAddDays(current, -1);
    case forward:
      return vdAddDays(current, 1);
    case 'ArrowUp':
      return vdAddDays(current, -7);
    case 'ArrowDown':
      return vdAddDays(current, 7);
    case 'Home':
      return vdAddDays(current, -((vdWeekday(current) - options.firstDay + 7) % 7));
    case 'End':
      return vdAddDays(current, 6 - ((vdWeekday(current) - options.firstDay + 7) % 7));
    case 'PageUp':
      return vdAddMonths(current, options.shift ? -12 : -1);
    case 'PageDown':
      return vdAddMonths(current, options.shift ? 12 : 1);
    default:
      return null;
  }
}
