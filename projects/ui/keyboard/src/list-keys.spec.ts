import { vdListTarget } from './list-keys';
import { VdTypeahead, vdMatchesQuery, vdNormalize } from './typeahead';

const opts = { loop: false, pageSize: 3 };

describe('vdListTarget', () => {
  const d = [false, true, false, false, false, false, true];

  it('starts from nothing active', () => {
    expect(vdListTarget('ArrowDown', -1, d, opts)).toBe(0);
    expect(vdListTarget('ArrowUp', -1, d, opts)).toBe(5);
  });

  it('moves, skips disabled, stops at ends without loop', () => {
    expect(vdListTarget('ArrowDown', 0, d, opts)).toBe(2);
    expect(vdListTarget('ArrowDown', 5, d, opts)).toBe(5);
    expect(vdListTarget('ArrowUp', 0, d, opts)).toBe(0);
    expect(vdListTarget('ArrowDown', 5, d, { ...opts, loop: true })).toBe(0);
  });

  it('pages and jumps', () => {
    expect(vdListTarget('PageDown', 0, d, opts)).toBe(3);
    expect(vdListTarget('PageUp', 5, d, opts)).toBe(2);
    expect(vdListTarget('Home', 4, d, opts)).toBe(0);
    expect(vdListTarget('End', 0, d, opts)).toBe(5);
    expect(vdListTarget('x', 0, d, opts)).toBeNull();
  });
});

describe('VdTypeahead', () => {
  const labels = ['Київ', 'Львів', 'Луцьк', 'Одеса', 'Ірпінь', 'Їжакевичі'];
  const none = labels.map(() => false);

  it('jumps by first letters and cycles on repeats', () => {
    let t = 0;
    const ta = new VdTypeahead(500, () => t);
    expect(ta.match('л', labels, none, -1)).toBe(1);
    t += 100;
    expect(ta.match('л', labels, none, 1)).toBe(2);
    t += 1000;
    expect(ta.match('л', labels, none, 2)).toBe(1);
  });

  it('builds words within the timeout', () => {
    let t = 0;
    const ta = new VdTypeahead(500, () => t);
    expect(ta.match('л', labels, none, -1)).toBe(1);
    t += 100;
    expect(ta.match('у', labels, none, 1)).toBe(2);
  });

  it('skips disabled and ignores diacritics', () => {
    const ta = new VdTypeahead(500, () => 0);
    expect(ta.match('і', labels, none, -1)).toBe(4);
    expect(ta.match('к', labels, [true, ...none.slice(1)], -1)).toBeNull();
  });

  it('accepts only printable keys without modifiers', () => {
    expect(VdTypeahead.accepts({ key: 'a', ctrlKey: false, metaKey: false, altKey: false })).toBe(
      true,
    );
    expect(VdTypeahead.accepts({ key: 'a', ctrlKey: true, metaKey: false, altKey: false })).toBe(
      false,
    );
    expect(
      VdTypeahead.accepts({ key: 'Enter', ctrlKey: false, metaKey: false, altKey: false }),
    ).toBe(false);
  });
});

describe('vdMatchesQuery', () => {
  it('matches every word, case and accent insensitive', () => {
    expect(vdMatchesQuery('Івано-Франківськ', 'франк')).toBe(true);
    expect(vdMatchesQuery('Кам’янець-Подільський', "кам'ян под")).toBe(true);
    expect(vdMatchesQuery('Київ', 'львів')).toBe(false);
    expect(vdMatchesQuery('Café', 'cafe')).toBe(true);
    expect(vdNormalize('  ЇЖАК ')).toBe('іжак');
  });
});
