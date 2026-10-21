/** Length-based preview preserving source offsets and whole grapheme clusters. */
export function vdExpandableTextParts(text: string, requestedLength: number) {
  const length =
    Number.isFinite(requestedLength) && requestedLength >= 1 ? Math.floor(requestedLength) : 240;
  if (text.length <= length || typeof Intl.Segmenter !== 'function')
    return { preview: text, rest: '' };
  let count = 0;
  for (const segment of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
    if (count++ === length)
      return { preview: text.slice(0, segment.index), rest: text.slice(segment.index) };
  }
  return { preview: text, rest: '' };
}
