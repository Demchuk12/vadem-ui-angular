import { vdAutocompleteActive, vdAutocompleteMove, vdAutocompletePlacement } from './autocomplete';

const options = [
  { id: 'closed', label: 'Same label', disabled: true },
  { id: 'first', label: 'Same label' },
  { id: 'second', label: 'Same label' },
] as const;

describe('Autocomplete manual selection', () => {
  it('navigates by stable id, skips disabled options and never wraps', () => {
    expect(vdAutocompleteMove(options, null, 'ArrowDown')).toBe('first');
    expect(vdAutocompleteMove(options, null, 'ArrowUp')).toBe('second');
    expect(vdAutocompleteMove(options, 'first', 'ArrowUp')).toBe('first');
    expect(vdAutocompleteMove(options, 'second', 'ArrowDown')).toBe('second');
    expect(vdAutocompleteActive(options, 'closed')).toBeUndefined();
    expect(vdAutocompleteActive(options.slice(0, 1), 'first')).toBeUndefined();
    expect(vdAutocompleteMove([], null, 'ArrowDown')).toBeNull();
  });
  it('flips and clamps viewport geometry in both directions', () => {
    const anchor = { top: 500, bottom: 540, left: 650, right: 950, width: 300 };
    const viewport = { width: 800, height: 600 };
    expect(vdAutocompletePlacement(anchor, viewport, 200, 4, false)).toEqual({
      width: 300,
      top: 296,
      inline: 496,
      available: 492,
    });
    expect(vdAutocompletePlacement(anchor, viewport, 200, 4, true)).toEqual({
      width: 300,
      top: 296,
      inline: 4,
      available: 492,
    });
    const narrow = vdAutocompletePlacement(
      { ...anchor, top: 40, bottom: 80, left: 0, right: 500, width: 500 },
      { width: 320, height: 500 },
      200,
      4,
      false,
    );
    expect(narrow).toEqual({ width: 312, top: 84, inline: 4, available: 412 });
  });
});
