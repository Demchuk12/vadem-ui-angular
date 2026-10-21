import { describe, expect, it } from 'vitest';
import {
  vdAddDays,
  vdAddMonths,
  vdCalendarKey,
  vdClampDate,
  vdDateOrder,
  vdFirstDayOfWeek,
  vdFormatShort,
  vdMonthGrid,
  vdParseDate,
  vdParseIso,
  vdToday,
  vdWeekdayNames,
} from './date';

describe('ISO date math', () => {
  it('rejects malformed and impossible dates', () => {
    expect(vdParseIso('2026-10-02')).not.toBeNull();
    expect(vdParseIso('2026-02-30')).toBeNull();
    expect(vdParseIso('2026-2-3')).toBeNull();
    expect(vdParseIso(null)).toBeNull();
  });

  it('adds days across months, years and DST without drifting', () => {
    expect(vdAddDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(vdAddDays('2026-03-29', 1)).toBe('2026-03-30'); // EU DST change
    expect(vdAddDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  it('adds months clamping the day', () => {
    expect(vdAddMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(vdAddMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(vdAddMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(vdAddMonths('2026-10-15', -12)).toBe('2025-10-15');
  });

  it('clamps to min/max and reads today in local time', () => {
    expect(vdClampDate('2026-01-01', '2026-02-01', null)).toBe('2026-02-01');
    expect(vdClampDate('2026-12-31', null, '2026-06-30')).toBe('2026-06-30');
    expect(vdToday(new Date(2026, 9, 2, 23, 59))).toBe('2026-10-02');
  });
});

describe('vdMonthGrid', () => {
  it('builds 6 Monday-first weeks for October 2026', () => {
    const grid = vdMonthGrid('2026-10-15', 1);
    expect(grid).toHaveLength(6);
    expect(grid[0][0]).toEqual({ date: '2026-09-28', day: 28, inMonth: false });
    expect(grid[0][3]).toEqual({ date: '2026-10-01', day: 1, inMonth: true });
    expect(grid[5][6].date).toBe('2026-11-08');
  });

  it('starts on Sunday when asked', () => {
    expect(vdMonthGrid('2026-10-01', 0)[0][0].date).toBe('2026-09-27');
  });
});

describe('locale', () => {
  it('knows the first day of the week', () => {
    expect(vdFirstDayOfWeek('uk')).toBe(1);
    expect(vdFirstDayOfWeek('en-US')).toBe(0);
    expect(vdFirstDayOfWeek('de-DE')).toBe(1);
  });

  it('names weekdays in grid order', () => {
    expect(vdWeekdayNames('en-US', 1, 'short')).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    expect(vdWeekdayNames('uk', 1, 'short')[0]).toMatch(/^пн/i);
  });

  it('reads the numeric date order', () => {
    expect(vdDateOrder('uk')).toEqual(['day', 'month', 'year']);
    expect(vdDateOrder('en-US')).toEqual(['month', 'day', 'year']);
    expect(vdDateOrder('sv-SE')).toEqual(['year', 'month', 'day']);
  });

  it('parses typed dates in the locale order, ISO and short years', () => {
    expect(vdParseDate('2.10.2026', 'uk')).toBe('2026-10-02');
    expect(vdParseDate('02/10/26', 'uk')).toBe('2026-10-02');
    expect(vdParseDate('10/2/2026', 'en-US')).toBe('2026-10-02');
    expect(vdParseDate('2026-10-02', 'en-US')).toBe('2026-10-02');
    expect(vdParseDate('31.02.2026', 'uk')).toBeNull();
    expect(vdParseDate('завтра', 'uk')).toBeNull();
    expect(vdParseDate('', 'uk')).toBeNull();
  });

  it('formats the short numeric date', () => {
    expect(vdFormatShort('2026-10-02', 'uk')).toBe('02.10.2026');
  });
});

describe('vdCalendarKey', () => {
  const opts = { firstDay: 1 };
  it('moves by day and week, mirrored in RTL', () => {
    expect(vdCalendarKey('ArrowRight', '2026-10-02', opts)).toBe('2026-10-03');
    expect(vdCalendarKey('ArrowRight', '2026-10-02', { ...opts, rtl: true })).toBe('2026-10-01');
    expect(vdCalendarKey('ArrowDown', '2026-10-30', opts)).toBe('2026-11-06');
  });

  it('jumps to week start/end for the locale', () => {
    // 2026-10-02 is a Friday.
    expect(vdCalendarKey('Home', '2026-10-02', opts)).toBe('2026-09-28');
    expect(vdCalendarKey('End', '2026-10-02', opts)).toBe('2026-10-04');
    expect(vdCalendarKey('Home', '2026-10-02', { firstDay: 0 })).toBe('2026-09-27');
  });

  it('pages by month and year', () => {
    expect(vdCalendarKey('PageDown', '2026-01-31', opts)).toBe('2026-02-28');
    expect(vdCalendarKey('PageUp', '2026-10-02', { ...opts, shift: true })).toBe('2025-10-02');
    expect(vdCalendarKey('Tab', '2026-10-02', opts)).toBeNull();
  });
});
