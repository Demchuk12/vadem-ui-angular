import { vdNumberStepValue } from './number-input';

describe('native number stepping probe', () => {
  function field(value: string, attrs: Record<string, string> = {}) {
    const input = document.createElement('input');
    input.type = 'number';
    for (const [key, attr] of Object.entries(attrs)) input.setAttribute(key, attr);
    input.value = value;
    return input;
  }
  it('uses native decimal alignment without modifying the source', () => {
    const input = field('0.2', { min: '0', step: '0.1' });
    expect(vdNumberStepValue(input, 1)).toBe('0.3');
    expect(vdNumberStepValue(input, -1)).toBe('0.1');
    expect(input.value).toBe('0.2');
    input.value = '0.25';
    expect(vdNumberStepValue(input, 1)).toBe('0.3');
    expect(vdNumberStepValue(input, -1)).toBe('0.2');
  });
  it('respects step base, empty values and bounds', () => {
    expect(vdNumberStepValue(field('1.3', { value: '1.3', step: '0.5' }), 1)).toBe('1.8');
    expect(vdNumberStepValue(field('', { min: '2', max: '5' }), 1)).toBe('2');
    expect(vdNumberStepValue(field('5', { min: '2', max: '5' }), 1)).toBeNull();
    expect(vdNumberStepValue(field('2', { min: '2', max: '5' }), -1)).toBeNull();
    expect(vdNumberStepValue(field('3', { min: '5', max: '2' }), 1)).toBeNull();
  });
  it('never reverses the action direction to repair an out-of-range value', () => {
    expect(vdNumberStepValue(field('15', { max: '10' }), 1)).toBeNull();
    expect(vdNumberStepValue(field('15', { max: '10' }), -1)).toBe('10');
    expect(vdNumberStepValue(field('-5', { min: '0' }), -1)).toBeNull();
  });
  it('does not step arbitrary precision, disabled or read-only fields', () => {
    expect(vdNumberStepValue(field('1.23', { step: 'any' }), 1)).toBeNull();
    expect(vdNumberStepValue(field('2', { disabled: '' }), 1)).toBeNull();
    expect(vdNumberStepValue(field('2', { readonly: '' }), -1)).toBeNull();
  });
});
