import { vdLocaleEn, vdLocaleUk, vdPlural } from './locale';

describe('locale packs', () => {
  it('uses CLDR plural rules, including Ukrainian one/few/many', () => {
    const results = vdLocaleUk.autocomplete.resultsText;
    expect(results(1)).toBe('Доступна 1 підказка.');
    expect(results(3)).toBe('Доступні 3 підказки.');
    expect(results(5)).toBe('Доступно 5 підказок.');
    expect(results(21)).toBe('Доступна 21 підказка.');
    expect(vdLocaleEn.autocomplete.resultsText(1)).toBe('1 suggestion available.');
    expect(vdLocaleEn.autocomplete.resultsText(2)).toBe('2 suggestions available.');
    expect(vdLocaleUk.rating.starLabel(4)).toBe('4 зірки з 5');
  });

  it('falls back to "other" when a form is missing', () => {
    expect(vdPlural('uk', 5, { other: '# items' })).toBe('5 items');
  });

  it('keeps both packs in the same shape', () => {
    const shape = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' ? shape(v).map((s) => `${k}.${s}`) : [k],
      );
    expect(shape(vdLocaleUk).sort()).toEqual(shape(vdLocaleEn).sort());
  });
});
