import { vdToggleSelection, vdUniqueSelection } from './multi-selection';

describe('multiple selection', () => {
  it('normalizes reset and duplicates without mutating the incoming value', () => {
    const values = ['kyiv', 'kyiv', 'lviv'];
    expect(vdUniqueSelection(values)).toEqual(['kyiv', 'lviv']);
    expect(values).toEqual(['kyiv', 'kyiv', 'lviv']);
    expect(vdUniqueSelection(null)).toEqual([]);
  });

  it('preserves selection order and removes every duplicate of a toggled key', () => {
    const values = ['unknown', 'kyiv', 'kyiv'];
    expect(vdToggleSelection(values, 'lviv')).toEqual(['unknown', 'kyiv', 'lviv']);
    expect(vdToggleSelection(values, 'kyiv')).toEqual(['unknown']);
    expect(values).toEqual(['unknown', 'kyiv', 'kyiv']);
  });
});
