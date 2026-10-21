import { vdExpandableTextParts } from './expandable-text';

describe('Expandable text segmentation', () => {
  it('keeps empty, short and exact-boundary sources plain', () => {
    expect(vdExpandableTextParts('', 2)).toEqual({ preview: '', rest: '' });
    expect(vdExpandableTextParts('ЇЄ', 2)).toEqual({ preview: 'ЇЄ', rest: '' });
    expect(vdExpandableTextParts('ЇЄІ', 2)).toEqual({ preview: 'ЇЄ', rest: 'І' });
  });
  it('never divides combining sequences, family emoji or regional flags', () => {
    const graphemes = ['Ї', 'е\u0301', '👨‍👩‍👧‍👦', '🇺🇦', '👍🏽', '✈️', 'ب'];
    const source = graphemes.join('');
    for (let length = 1; length < graphemes.length; length++) {
      const parts = vdExpandableTextParts(source, length);
      expect(parts.preview).toBe(graphemes.slice(0, length).join(''));
      expect(parts.preview + parts.rest).toBe(source);
    }
    expect(vdExpandableTextParts(source, graphemes.length)).toEqual({ preview: source, rest: '' });
  });
  it('normalizes invalid limits and floors positive fractions', () => {
    const source = 'а'.repeat(250);
    for (const length of [0, -1, NaN, Infinity, -Infinity, 0.5])
      expect(vdExpandableTextParts(source, length).preview.length).toBe(240);
    expect(vdExpandableTextParts(source, 2.8).preview).toBe('аа');
  });
  it('preserves exact whitespace, apparent HTML and original offsets', () => {
    const source = '  Ї\n\n<strong>е́</strong>  ';
    const parts = vdExpandableTextParts(source, 4);
    expect(parts.preview).toBe('  Ї\n');
    expect(parts.rest).toBe('\n<strong>е́</strong>  ');
  });
  it('shows all text if grapheme segmentation is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter')!;
    try {
      Object.defineProperty(Intl, 'Segmenter', { ...descriptor, value: undefined });
      const source = '👨‍👩‍👧‍👦е́'.repeat(5);
      expect(vdExpandableTextParts(source, 1)).toEqual({ preview: source, rest: '' });
    } finally {
      Object.defineProperty(Intl, 'Segmenter', descriptor);
    }
  });
});
