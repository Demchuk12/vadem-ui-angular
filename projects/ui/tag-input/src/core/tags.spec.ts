import { vdAddTag, vdNormalizeTags, vdTagKey } from './tags';

describe('tag values', () => {
  it('trims and NFC-normalizes identity while preserving first spelling and order', () => {
    const source = [' Дизайн ', 'дизайн', 'UI', 'ui', '', '   ', 'Cafe\u0301', 'Café'];
    expect(vdNormalizeTags(source)).toEqual(['Дизайн', 'UI', 'Café']);
    expect(source[0]).toBe(' Дизайн ');
    expect(vdNormalizeTags(null)).toEqual([]);
  });
  it('keeps accents, internal whitespace and Ukrainian letters significant', () => {
    expect(vdTagKey(' ЇЖАК ')).toBe('їжак');
    expect(vdNormalizeTags(['Cafe', 'Café', 'a b', 'a  b', 'є', 'е'])).toHaveLength(6);
  });
  it('adds one canonical tag without mutating the provided array', () => {
    const source = Object.freeze(['Дизайн']);
    expect(vdAddTag(source, '  Angular  ')).toEqual({
      kind: 'added',
      tag: 'Angular',
      value: ['Дизайн', 'Angular'],
    });
    expect(source).toEqual(['Дизайн']);
  });
  it('rejects whitespace and duplicates with a reason instead of a changed value', () => {
    expect(vdAddTag(['Дизайн'], '   ')).toEqual({ kind: 'empty', tag: '' });
    expect(vdAddTag(['Дизайн'], '  ДИЗАЙН ')).toEqual({ kind: 'duplicate', tag: 'ДИЗАЙН' });
    expect(vdAddTag(['Café'], 'Cafe\u0301')).toEqual({ kind: 'duplicate', tag: 'Café' });
  });
});
