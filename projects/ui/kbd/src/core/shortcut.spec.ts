import { vdDetectPlatform, vdParseShortcut, vdShortcutAria } from './shortcut';

const labels = (keys: string, platform: 'apple' | 'other') =>
  vdParseShortcut(keys, platform).map((step) => step.map((k) => k.label).join(' '));

describe('shortcut parsing', () => {
  it('maps Mod and modifiers per platform with spoken names', () => {
    expect(labels('Mod+Shift+k', 'apple')).toEqual(['⌘ ⇧ K']);
    expect(labels('Mod+Shift+k', 'other')).toEqual(['Ctrl Shift K']);
    const [[cmd]] = vdParseShortcut('Mod+K', 'apple');
    expect(cmd).toEqual({ label: '⌘', name: 'Command', ariaName: 'Meta' });
  });

  it('accepts aliases case-insensitively and keeps unknown tokens', () => {
    expect(labels('option+RETURN', 'apple')).toEqual(['⌥ ↵']);
    expect(labels('control+F5', 'other')).toEqual(['Ctrl F5']);
    expect(labels('Ctrl+Plus', 'other')).toEqual(['Ctrl +']);
  });

  it('splits sequences on spaces and ignores empty tokens', () => {
    expect(labels('  g   d ', 'other')).toEqual(['G', 'D']);
    expect(labels('Mod++K', 'other')).toEqual(['Ctrl K']);
    expect(vdParseShortcut('', 'other')).toEqual([]);
  });

  it('builds aria-keyshortcuts values', () => {
    expect(vdShortcutAria('Mod+K', 'apple')).toBe('Meta+K');
    expect(vdShortcutAria('Mod+K', 'other')).toBe('Control+K');
    // ARIA cannot express sequences; a space there would mean "G or D".
    expect(vdShortcutAria('G D', 'other')).toBe('');
    expect(vdShortcutAria('Shift+Up', 'other')).toBe('Shift+ArrowUp');
  });

  it('detects Apple platforms from a navigator-like object', () => {
    expect(vdDetectPlatform({ platform: 'MacIntel' })).toBe('apple');
    expect(vdDetectPlatform({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0)' })).toBe(
      'apple',
    );
    expect(vdDetectPlatform({ platform: 'Linux x86_64' })).toBe('other');
    expect(vdDetectPlatform(null)).toBe('other');
  });
});
