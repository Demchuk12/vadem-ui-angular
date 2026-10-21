# Kbd

Status: draft · Pattern: native `<kbd>` ([HTML: nested kbd for key combinations](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element))

Displays a keyboard shortcut. A single `<kbd>` styled by base CSS remains the way to show one
literal key in prose. This component adds platform-aware combinations and accessible key names.

## Anatomy

```html
<!-- keys="Mod+Shift+K" on macOS -->
<kbd class="vd-kbd" data-platform="apple">
  <kbd><span aria-hidden="true">⌘</span><span class="vd-visually-hidden">Command</span></kbd>
  <kbd><span aria-hidden="true">⇧</span><span class="vd-visually-hidden">Shift</span></kbd>
  <kbd>K</kbd>
</kbd>

<!-- same keys elsewhere -->
<kbd class="vd-kbd" data-platform="other">
  <kbd>Ctrl</kbd><span class="vd-kbd__plus" aria-hidden="true">+</span>
  <kbd>Shift</kbd><span class="vd-kbd__plus" aria-hidden="true">+</span>
  <kbd>K</kbd>
</kbd>
```

## Props

| Name      | Type                          | Default | Notes                                                        |
| --------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| keys      | string                        | —       | Required. `+` joins keys; spaces separate sequence steps     |
| thenLabel | string                        | then    | Spoken between sequence steps; localize                      |
| platform  | `'auto' \| 'apple' \| 'other'` | auto    | `auto` detects the viewer; fixed values document one platform |

Aliases: `Mod` (⌘ Command on Apple, Ctrl elsewhere), `Ctrl`/`Control`, `Alt`/`Option`
(⌥ Option on Apple), `Shift` (⇧ on Apple), `Meta`/`Cmd` (⌘ on Apple, Win elsewhere), `Enter` (↵ on Apple), `Esc`/`Escape`,
`Backspace`, `Delete`, `Tab`, `Space`, `Up`/`Down`/`Left`/`Right` (arrows). Any other token
is shown as written, single letters upper-cased. A literal plus is written `Plus`.

## Events

None.

## Slots / content

None; the content is generated from `keys`.

## States

| State    | Contract                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| apple    | `data-platform="apple"`: symbols, no separators, tight spacing (macOS, iOS)    |
| other    | `data-platform="other"`: names with `+` separators                              |
| sequence | Steps of a sequence are separated by a visible gap and a visually hidden "then" |
| narrow   | The combination wraps between keys; a single key cap never breaks               |

The platform is detected in the browser; server rendering uses `other` and the client updates.

## Keyboard

Not interactive.

## ARIA contract

- Outer `<kbd>` with nested `<kbd>` per key (HTML semantics for combinations).
- Symbol glyphs are `aria-hidden`; the full key name is visually hidden text, so assistive
  technology reads "Command Shift K". Visible `+` separators are `aria-hidden`.
- Consumers that bind the shortcut on a control should also set `aria-keyshortcuts` there;
  `vdShortcutAria(keys, platform)` returns that value. That attribute separates alternatives
  with spaces and cannot express sequences, so a sequence returns an empty string.

## Component tokens

`--vd-kbd-gap` → space-0-5 (apple) / space-1 (other); `--vd-kbd-step-gap` → space-2;
`--vd-kbd-plus-color` → color-text-subtle. Key caps reuse the base `kbd` style. Logical properties; key order is not
mirrored in RTL (shortcuts are read left to right).

## Adapter notes

Core: `vdParseShortcut(keys, platform)` returns steps of keys with `{ label, name }`, and
`vdShortcutAria(keys, platform)` returns the `aria-keyshortcuts` string. Platform detection
(`vdDetectPlatform(navigator)`) is a pure function of a navigator-like object.
Angular: `<vd-kbd keys="Mod+K" />` from `@vadem/ui/kbd`.
