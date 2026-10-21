import { timeOptions } from './time-options';

describe('Time picker options', () => {
  it('matches inclusive working hours and seconds-based quarter-hour steps', () => {
    const options = timeOptions('09:00', '18:00', '900', '');
    expect(options).toHaveLength(37);
    expect(options[0]).toBe('09:00');
    expect(options.at(-1)).toBe('18:00');
    expect(options).not.toContain('09:07');
  });
  it('preserves overnight ranges and the initial native step base', () => {
    expect(timeOptions('22:00', '06:00', '900', '')).toContain('00:00');
    expect(timeOptions('22:00', '06:00', '900', '')).not.toContain('12:00');
    expect(timeOptions('', '', '900', '09:07')[0]).toBe('00:07');
  });
  it('handles any, seconds constraints and impossible minute choices', () => {
    expect(timeOptions('', '', 'any', '')).toHaveLength(1440);
    expect(timeOptions('09:00:30', '09:01:30', '60', '')).toEqual([]);
    expect(timeOptions('09:00:30', '09:01:30', 'any', '')).toEqual(['09:01']);
  });
});
