import { vdTextHighlightParts } from './text-highlight';

const matches = (text: string, query: string) =>
  vdTextHighlightParts(text, query)
    .filter((part) => part.matched)
    .map((part) => part.text);

describe('text highlight segmentation', () => {
  it('handles empty source/query and absent matches without changing text', () => {
    expect(vdTextHighlightParts('', 'x')).toEqual([]);
    expect(vdTextHighlightParts('  text\n', '')).toEqual([{ text: '  text\n', matched: false }]);
    expect(vdTextHighlightParts('source', 'missing')).toEqual([{ text: 'source', matched: false }]);
  });
  it('marks all adjacent/repeated occurrences and preserves original case, spaces and line breaks', () => {
    const text = '  ЗВІТзвіт!\nЗвіт  ';
    const parts = vdTextHighlightParts(text, 'звіт');
    expect(parts.filter((part) => part.matched).map((part) => part.text)).toEqual([
      'ЗВІТ',
      'звіт',
      'Звіт',
    ]);
    expect(parts.map((part) => part.text).join('')).toBe(text);
    expect(parts.filter((part) => !part.matched).map((part) => part.text)).toEqual([
      '  ',
      '!\n',
      '  ',
    ]);
  });
  it('treats every regexp metacharacter and backslash as literal data', () => {
    const literal = '.*+?^${}()|[]\\';
    expect(matches(`${literal} plain ${literal}`, literal)).toEqual([literal, literal]);
    for (const query of literal) expect(matches(query, query)).toEqual([query]);
    expect(matches('a+b aaab', 'a+b')).toEqual(['a+b']);
  });
  it('handles Ukrainian letters without merging distinct letters', () => {
    expect(matches('ҐАНОК ґанок', 'ґанок')).toEqual(['ҐАНОК', 'ґанок']);
    expect(matches('ЄДНІСТЬ єдність', 'єдність')).toHaveLength(2);
    expect(matches('ІНЖЕНЕР інженер', 'інженер')).toHaveLength(2);
    expect(matches('ЇЖАК їжак іжак', 'їжак')).toEqual(['ЇЖАК', 'їжак']);
  });
  it('uses Unicode simple folding while keeping original offsets', () => {
    expect(vdTextHighlightParts('İ: I i', 'i')).toEqual([
      { text: 'İ: ', matched: false },
      { text: 'I', matched: true },
      { text: ' ', matched: false },
      { text: 'i', matched: true },
    ]);
    expect(matches('Σ ς σ', 'σ')).toEqual(['Σ', 'ς', 'σ']);
    expect(matches('Straße', 'ss')).toEqual([]);
    expect(matches('café e\u0301', 'cafe')).toEqual([]);
    expect(matches('e\u0301', 'é')).toEqual([]);
  });
  it('uses non-overlapping matches and treats whitespace as a literal query', () => {
    expect(vdTextHighlightParts('banana', 'ana')).toEqual([
      { text: 'b', matched: false },
      { text: 'ana', matched: true },
      { text: 'na', matched: false },
    ]);
    expect(matches('a  b c', ' ')).toEqual([' ', ' ', ' ']);
  });
  it('preserves emoji pairs and Arabic source order', () => {
    expect(matches('😀x😀', '😀')).toEqual(['😀', '😀']);
    expect(matches('😀', '\ud83d')).toEqual([]);
    const text = 'تقرير الإنتاج وتقرير الجودة';
    const parts = vdTextHighlightParts(text, 'تقرير');
    expect(parts.filter((part) => part.matched)).toHaveLength(2);
    expect(parts.map((part) => part.text).join('')).toBe(text);
  });
});
