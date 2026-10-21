import { vdActiveFiltersValid as valid } from './active-filters';
it('accepts stable IDs without interpreting selector syntax', () => {
  expect(valid([])).toBe(true);
  expect(valid([{ id: 'a"[]' }, { id: 'a' }])).toBe(true);
});
it('rejects duplicate or blank IDs without mutating input', () => {
  const source = Object.freeze([{ id: 'a' }, { id: 'a' }]);
  expect(valid(source)).toBe(false);
  expect(valid([{ id: '' }])).toBe(false);
  expect(valid([{ id: '  ' }])).toBe(false);
  expect(source).toHaveLength(2);
});
