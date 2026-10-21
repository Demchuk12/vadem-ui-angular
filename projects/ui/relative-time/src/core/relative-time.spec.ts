import { vdFormatRelativeTime as format, vdRelativeTimeValid as valid } from './relative-time';
const now = 1792324800000;
describe('relative elapsed time', () => {
  it('distinguishes recent past from future and uses no implicit clock', () => {
    expect(format(now, now)).toBe('Just now');
    expect(format(now - 4999, now)).toBe('Just now');
    expect(format(now - 5000, now)).toBe('5 seconds ago');
    expect(format(now + 1, now)).toBe('in 1 second');
    expect(format(now + 4999, now)).toBe('in 4 seconds');
    expect(format(now, undefined)).toBe('Unknown time');
  });
  it('uses elapsed unit boundaries without early rounding', () => {
    for (const [span, unit] of [
      [60000, 'minute'],
      [3600000, 'hour'],
      [86400000, 'day'],
      [7 * 86400000, 'week'],
      [30 * 86400000, 'month'],
      [365 * 86400000, 'year'],
    ] as const) {
      expect(format(now - span, now)).toBe(`1 ${unit} ago`);
      expect(format(now + span, now)).toBe(`in 1 ${unit}`);
    }
    expect(format(now - 59999, now)).toBe('59 seconds ago');
    expect(format(now - 3599999, now)).toBe('59 minutes ago');
    expect(format(now - 2 * 3600000, now)).toBe('2 hours ago');
  });
  it('rejects unsafe/non-integer/out-of-range values and validates both timestamps', () => {
    for (const value of [
      null,
      undefined,
      NaN,
      Infinity,
      -Infinity,
      0.1,
      253402300800000,
      -62135596800001,
      Number.MAX_SAFE_INTEGER,
    ]) {
      expect(valid(value)).toBe(false);
      expect(format(value, now)).toBe('Unknown time');
      expect(format(now, value, { unknownText: 'Missing' })).toBe('Missing');
    }
    expect(valid(0)).toBe(true);
    expect(valid(-62135596800000)).toBe(true);
    expect(valid(253402300799999)).toBe(true);
  });
  it('localizes plurals, honors text overrides and falls back from malformed locales', () => {
    expect(format(now - 300000, now, { locale: 'uk' })).toBe('5 хвилин тому');
    expect(format(now + 7200000, now, { locale: 'uk' })).toBe('через 2 години');
    expect(format(now - 1000, now, { justNowText: 'Now' })).toBe('Now');
    expect(format(now - 300000, now, { locale: 'bad_locale' })).toBe('5 minutes ago');
  });
});
