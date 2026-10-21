import { describe, expect, it } from 'vitest';
import { vdRangeAllowed, vdRangeBetween, vdValidRange, vdParseRangeDate } from './range';
describe('Date ranges', () => {
  it('accepts real inclusive ISO boundaries and rejects malformed or reversed external data', () => {
    expect(vdValidRange({ start: '2024-02-29', end: '2024-03-01' })).toEqual({
      start: '2024-02-29',
      end: '2024-03-01',
    });
    for (const value of [
      null,
      {},
      { start: '2026-02-30', end: '2026-03-01' },
      { start: '2026-10-10', end: '2026-10-09' },
      { start: 123, end: '2026-10-09' },
    ])
      expect(vdValidRange(value)).toBeNull();
  });
  it('orders calendar choices across months and allows a same-day period', () => {
    expect(vdRangeBetween('2026-11-02', '2026-10-30')).toEqual({
      start: '2026-10-30',
      end: '2026-11-02',
    });
    expect(vdRangeBetween('2026-10-08', '2026-10-08')).toEqual({
      start: '2026-10-08',
      end: '2026-10-08',
    });
  });
  it('enforces inclusive bounds on the entire range, including reversed bounds', () => {
    const range = { start: '2026-10-01', end: '2026-10-31' };
    expect(vdRangeAllowed(range, range.start, range.end)).toBe(true);
    expect(vdRangeAllowed(range, '2026-10-02', null)).toBe(false);
    expect(vdRangeAllowed(range, null, '2026-10-30')).toBe(false);
    expect(vdRangeAllowed(range, '2026-12-01', '2026-09-01')).toBe(false);
  });
});

describe('Arabic range editing', () => {
  it('parses the localized date display in Arabic and extended Arabic decimal digits', () => {
    expect(vdParseRangeDate('٠٨/١٠/٢٠٢٦', 'ar-EG')).toBe('2026-10-08');
    expect(vdParseRangeDate('۰۸/۱۰/۲۰۲۶', 'ar-EG')).toBe('2026-10-08');
  });
});
