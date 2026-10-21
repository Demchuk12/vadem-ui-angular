/**
 * Framework-agnostic shortcut parsing: "Mod+Shift+K" -> keys with a visible label and a spoken
 * name, per platform. A space separates steps of a sequence ("G D").
 */

export type VdPlatform = 'apple' | 'other';

export interface VdShortcutKey {
  /** What is shown (may be a symbol). */
  label: string;
  /** Full name read by assistive technology. */
  name: string;
  /** Key name for `aria-keyshortcuts` (UI Events `key` values). */
  ariaName: string;
}

interface KeyDef {
  apple: [label: string, name: string];
  other: [label: string, name: string];
  aria: string;
}

const KEYS: Record<string, KeyDef> = {
  mod: { apple: ['⌘', 'Command'], other: ['Ctrl', 'Control'], aria: 'Mod' },
  meta: { apple: ['⌘', 'Command'], other: ['Win', 'Windows'], aria: 'Meta' },
  ctrl: { apple: ['⌃', 'Control'], other: ['Ctrl', 'Control'], aria: 'Control' },
  alt: { apple: ['⌥', 'Option'], other: ['Alt', 'Alt'], aria: 'Alt' },
  shift: { apple: ['⇧', 'Shift'], other: ['Shift', 'Shift'], aria: 'Shift' },
  enter: { apple: ['↵', 'Return'], other: ['Enter', 'Enter'], aria: 'Enter' },
  esc: { apple: ['Esc', 'Escape'], other: ['Esc', 'Escape'], aria: 'Escape' },
  backspace: { apple: ['⌫', 'Delete'], other: ['Backspace', 'Backspace'], aria: 'Backspace' },
  delete: { apple: ['⌦', 'Forward delete'], other: ['Del', 'Delete'], aria: 'Delete' },
  tab: { apple: ['⇥', 'Tab'], other: ['Tab', 'Tab'], aria: 'Tab' },
  space: { apple: ['Space', 'Space'], other: ['Space', 'Space'], aria: 'Space' },
  up: { apple: ['↑', 'Up arrow'], other: ['↑', 'Up arrow'], aria: 'ArrowUp' },
  down: { apple: ['↓', 'Down arrow'], other: ['↓', 'Down arrow'], aria: 'ArrowDown' },
  left: { apple: ['←', 'Left arrow'], other: ['←', 'Left arrow'], aria: 'ArrowLeft' },
  right: { apple: ['→', 'Right arrow'], other: ['→', 'Right arrow'], aria: 'ArrowRight' },
  plus: { apple: ['+', 'Plus'], other: ['+', 'Plus'], aria: 'Plus' },
};

const ALIASES: Record<string, string> = {
  control: 'ctrl',
  option: 'alt',
  opt: 'alt',
  cmd: 'meta',
  command: 'meta',
  return: 'enter',
  escape: 'esc',
  del: 'delete',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
};

function resolveKey(token: string, platform: VdPlatform): VdShortcutKey {
  const id = token.toLowerCase();
  const def = KEYS[ALIASES[id] ?? id];
  if (def) {
    const [label, name] = def[platform];
    // "Mod" has no aria-keyshortcuts value of its own; it maps to the platform modifier.
    const ariaName = def.aria === 'Mod' ? (platform === 'apple' ? 'Meta' : 'Control') : def.aria;
    return { label, name, ariaName };
  }
  const label = token.length === 1 ? token.toUpperCase() : token;
  return { label, name: label, ariaName: label };
}

/** Steps of a sequence, each a combination of keys. Empty tokens are ignored. */
export function vdParseShortcut(keys: string, platform: VdPlatform): VdShortcutKey[][] {
  return keys
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((step) =>
      step
        .split('+')
        .filter(Boolean)
        .map((token) => resolveKey(token, platform)),
    )
    .filter((step) => step.length > 0);
}

/**
 * Value for `aria-keyshortcuts` on the control that owns the shortcut. In that attribute a
 * space separates alternatives, and sequences cannot be expressed, so a multi-step sequence
 * returns an empty string (omit the attribute).
 */
export function vdShortcutAria(keys: string, platform: VdPlatform): string {
  const steps = vdParseShortcut(keys, platform);
  if (steps.length !== 1) return '';
  return steps[0].map((key) => key.ariaName).join('+');
}

/** Apple platforms show symbols; detection reads only a navigator-like object. */
export function vdDetectPlatform(
  nav?: { platform?: string; userAgent?: string } | null,
): VdPlatform {
  const source = `${nav?.platform ?? ''} ${nav?.userAgent ?? ''}`;
  return /Mac|iPhone|iPad|iPod/i.test(source) ? 'apple' : 'other';
}
