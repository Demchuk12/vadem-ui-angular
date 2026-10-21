import { describe, expect, it } from 'vitest';
import { vdColorInk, vdColorPaletteKey, vdNormalizeHex } from './color';

describe('Color picker data', () => {
  it('normalizes short, full and trimmed HEX without accepting CSS expressions', () => {
    expect(vdNormalizeHex(' #aB3 ')).toBe('#AABB33');
    expect(vdNormalizeHex('6d4bd3')).toBe('#6D4BD3');
    for (const value of [
      '',
      '#1234',
      '#12345678',
      'red',
      'url(https://example.com)',
      'var(--color)',
      '#ggg',
      null,
      123,
    ])
      expect(vdNormalizeHex(value)).toBeNull();
  });
  it('chooses readable ink for arbitrary data colors', () => {
    expect(vdColorInk('#FFFFFF')).toBe('#000000');
    expect(vdColorInk('#000000')).toBe('#FFFFFF');
    expect(vdColorInk('#6D4BD3')).toBe('#FFFFFF');
    expect(vdColorInk('#C99B32')).toBe('#000000');
  });
  it('wraps the palette in reading order and reverses horizontal arrows in RTL', () => {
    expect(vdColorPaletteKey(0, 8, 'ArrowLeft', false)).toBe(7);
    expect(vdColorPaletteKey(0, 8, 'ArrowLeft', true)).toBe(1);
    expect(vdColorPaletteKey(7, 8, 'ArrowDown', true)).toBe(0);
    expect(vdColorPaletteKey(3, 8, 'Home', false)).toBe(0);
    expect(vdColorPaletteKey(3, 8, 'End', false)).toBe(7);
    expect(vdColorPaletteKey(0, 0, 'End', false)).toBeNull();
    expect(vdColorPaletteKey(0, 8, 'Tab', false)).toBeNull();
  });
});
