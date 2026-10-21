import { describe, expect, it } from 'vitest';
import { vdActiveCommand, vdFilterCommands } from './command';

const items = [
  { id: 'projects', label: 'Проєкти Київської команди', keywords: ['workspace'], disabled: false },
  { id: 'billing', label: 'Керувати оплатою', keywords: ['billing'], disabled: true },
  {
    id: 'settings',
    label: 'Налаштування профілю',
    keywords: ['settings', 'account'],
    disabled: false,
  },
];

describe('command matching and active results', () => {
  it('matches aliases, Ukrainian diacritics and all query words without reordering', () => {
    expect(vdFilterCommands(items, 'киівськоі WORKSPACE')).toEqual([items[0]]);
    expect(vdFilterCommands(items, 'account settings')).toEqual([items[2]]);
    expect(vdFilterCommands(items, 'workspace settings')).toEqual([]);
    expect(vdFilterCommands(items, '  ')).toEqual(items);
  });

  it('keeps disabled matches visible while preventing them from becoming active', () => {
    expect(vdFilterCommands(items, 'billing')).toEqual([items[1]]);
    expect(vdActiveCommand(items, 'billing')).toBe(items[0]);
    expect(vdActiveCommand([items[1]], null)).toBeNull();
  });

  it('preserves identity after a reorder and falls back after removal or filtering', () => {
    expect(vdActiveCommand([items[2], items[0]], 'projects')).toBe(items[0]);
    expect(vdActiveCommand([items[2]], 'projects')).toBe(items[2]);
    expect(vdActiveCommand(vdFilterCommands(items, 'settings'), 'projects')).toBe(items[2]);
    expect(vdActiveCommand([], 'projects')).toBeNull();
  });
});
