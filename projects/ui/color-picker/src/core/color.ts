/** Safe opaque sRGB HEX; no CSS functions, keywords, alpha or URLs are accepted. */
export function vdNormalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim().replace(/^#/, '');
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return null;
  return (
    '#' + (raw.length === 3 ? [...raw].map((char) => char + char).join('') : raw).toUpperCase()
  );
}

/** Maximum-contrast black/white foreground for arbitrary user color data. */
export function vdColorInk(value: string): '#000000' | '#FFFFFF' {
  const hex = vdNormalizeHex(value);
  if (!hex) return '#000000';
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = channels
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#FFFFFF';
}

export function vdColorPaletteKey(
  index: number,
  count: number,
  key: string,
  rtl: boolean,
): number | null {
  if (!count) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const delta =
    key === 'ArrowDown'
      ? 1
      : key === 'ArrowUp'
        ? -1
        : key === 'ArrowRight'
          ? rtl
            ? -1
            : 1
          : key === 'ArrowLeft'
            ? rtl
              ? 1
              : -1
            : 0;
  return delta ? (index + delta + count) % count : null;
}
