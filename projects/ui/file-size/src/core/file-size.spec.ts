import { vdFormatFileSize as format } from './file-size';
describe('file size', () => {
  it('distinguishes zero and invalid byte counts without coercion', () => {
    expect(format(0)).toBe('0 byte');
    for (const value of [null, undefined, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
      expect(format(value, { unknownText: 'Unknown' })).toBe('Unknown');
  });
  it('uses decimal thresholds and promotes rounded boundaries', () => {
    expect(format(999)).toBe('999 byte');
    expect(format(1000)).toBe('1 kB');
    expect(format(1536000)).toBe('1.5 MB');
    expect(format(999949)).toBe('999.9 kB');
    expect(format(999950)).toBe('1 MB');
    expect(format(999950, { maximumFractionDigits: 2 })).toBe('999.95 kB');
  });
  it('keeps IEC symbols and localizes numbers, never labels 1024 as kB', () => {
    expect(format(1023, { system: 'binary' })).toBe('1,023 byte');
    expect(format(1024, { system: 'binary' })).toBe('1\u00a0KiB');
    expect(format(1536, { system: 'binary', locale: 'uk' })).toBe('1,5\u00a0KiB');
    expect(format(1024 ** 2 - 1, { system: 'binary' })).toBe('1\u00a0MiB');
  });
  it('handles precision, malformed locales and largest exact counts', () => {
    expect(format(1536000, { maximumFractionDigits: 0 })).toBe('2 MB');
    expect(format(1536000, { maximumFractionDigits: 9 })).toBe('1.5 MB');
    expect(format(1536000, { locale: 'bad_locale' })).toBe('1.5 MB');
    expect(format(Number.MAX_SAFE_INTEGER)).toBe('9 PB');
    expect(format(Number.MAX_SAFE_INTEGER, { system: 'binary' })).toBe('8\u00a0PiB');
    expect(format(1536000, { locale: 'uk' })).toContain('1,5');
  });
});
