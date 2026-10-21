import { describe, it, expect } from 'vitest';
import { vdToolbarEntry } from './focus';

describe('toolbar focus entry', () => {
  it('keeps the remembered available item', () =>
    expect(vdToolbarEntry([false, false, false], 1)).toBe(1));
  it('skips initially unavailable items', () =>
    expect(vdToolbarEntry([true, true, false], -1)).toBe(2));
  it('recovers at or after the removed/disabled position', () =>
    expect(vdToolbarEntry([false, true, false], -1, 1)).toBe(2));
  it('falls back before the former position', () =>
    expect(vdToolbarEntry([false, true, true], -1, 2)).toBe(0));
  it('handles empty and fully unavailable panels', () => {
    expect(vdToolbarEntry([], -1)).toBeNull();
    expect(vdToolbarEntry([true, true], -1)).toBeNull();
  });
});
