import { vdCharacterCount } from './character-count';

describe('character count', () => {
  it('preserves exact text and counts UTF-16 like maxlength', () => {
    expect(vdCharacterCount(' і 😀 ', 5)).toEqual({
      used: 6,
      limit: 5,
      remaining: -1,
      state: 'over',
    });
    expect(vdCharacterCount('e\u0301', 2).state).toBe('limit');
    expect(vdCharacterCount('a\nb', 4).remaining).toBe(1);
  });
  it('supports empty, exact and over-limit values including a zero limit', () => {
    expect(vdCharacterCount('', 0).state).toBe('limit');
    expect(vdCharacterCount('x', 0).state).toBe('over');
    expect(vdCharacterCount('', 1).state).toBe('within');
    expect(vdCharacterCount('x', 1).remaining).toBe(0);
  });
  it('normalizes fractions and treats malformed limits as unlimited', () => {
    expect(vdCharacterCount('x', 1.9).limit).toBe(1);
    for (const value of [null, NaN, Infinity, -1]) {
      expect(vdCharacterCount('text', value)).toEqual({
        used: 4,
        limit: null,
        remaining: null,
        state: 'unlimited',
      });
    }
  });
});
