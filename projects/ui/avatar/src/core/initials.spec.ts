import { describe, expect, it } from 'vitest';
import { vdInitials } from './initials';

describe('vdInitials', () => {
  it('takes the first and last word', () => {
    expect(vdInitials('Олена Коваленко')).toBe('ОК');
    expect(vdInitials('Anna Maria de la Cruz')).toBe('AC');
  });

  it('uses one letter for a single word', () => {
    expect(vdInitials('Prince')).toBe('P');
    expect(vdInitials('olena@vadem.dev')).toBe('O');
  });

  it('skips punctuation and symbol-only words', () => {
    expect(vdInitials('  — «Тарас» Мельник  ')).toBe('ТМ');
    expect(vdInitials('🙂 Ірина')).toBe('І');
  });

  it('is empty when there is nothing to take', () => {
    expect(vdInitials('')).toBe('');
    expect(vdInitials('  — ')).toBe('');
  });

  it('uppercases with the given locale', () => {
    expect(vdInitials('ilkay iz', 'tr')).toBe('İİ');
  });
});
