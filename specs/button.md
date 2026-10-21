# Button

Status: stable · Pattern: native `<button>` / `<a>` ([APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/))

Enhances a native `<button>` or `<a>` element. Native semantics, focus and keyboard behavior are
preserved; the library adds styling, loading, and consistent disabled behavior.

## Anatomy

```html
<button class="vd-button" data-variant="primary" data-size="md" type="button">
  <vd-icon slot="start" />            <!-- optional, start slot -->
  <span class="vd-button__label">Label</span>
  <vd-icon slot="end" />              <!-- optional, end slot -->
  <span class="vd-button__spinner" aria-hidden="true">...</span>  <!-- only while loading -->
</button>
```

## Props

| Name       | Type                                              | Default     | Notes |
| ---------- | ------------------------------------------------- | ----------- | ----- |
| `variant`  | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `secondary` | One `primary` per view. `danger` only for destructive actions. |
| `size`     | `'sm' \| 'md' \| 'lg'`                            | `md`        | Heights follow `--vd-control-height-*` (density-aware). |
| `disabled` | `boolean`                                         | `false`     | `<button>`: native `disabled`. `<a>`: `aria-disabled="true"`, `tabindex="-1"`, clicks blocked. |
| `loading`  | `boolean`                                         | `false`     | Keeps width and focus; blocks activation; `aria-busy` + `aria-disabled`. |
| `iconOnly` | `boolean`                                         | `false`     | Square button. Requires an accessible name (`aria-label`), warned in dev. |
| `type`     | `'button' \| 'submit' \| 'reset'`                 | `button`    | `<button>` only. Defaults to `button` (not the native `submit`) to avoid accidental submits. |

## Events

Native `click`. While `loading` (any element) or `disabled` (`<a>`), `click` is stopped before
any consumer listener runs and its default action (navigation, form submit) is prevented.

## Slots / content

| Slot             | Accepts                     |
| ---------------- | --------------------------- |
| default          | label text (and/or an icon for `iconOnly`) |
| `[slot="start"]` | icon before the label (optically tightened padding) |
| `[slot="end"]`   | icon after the label (mirrors in RTL if directional) |

## States

| State          | Reflected as                                                   |
| -------------- | -------------------------------------------------------------- |
| variant / size | `data-variant`, `data-size`                                    |
| hover          | `:hover` (only on `(hover: hover)` devices, not when disabled/loading) |
| focus-visible  | `:focus-visible` - accent outline with offset                  |
| active         | `:active` - press scale (`--vd-press-scale`)                   |
| disabled       | `:disabled` or `[aria-disabled="true"]` without `data-loading` |
| loading        | `data-loading`, `aria-busy="true"`, `aria-disabled="true"`; label invisible (opacity), spinner centered |
| icon only      | `data-icon-only`                                               |

## Keyboard

Native: `Enter` and `Space` activate `<button>`; `Enter` activates `<a href>`. Disabled anchors
leave the tab order. Loading buttons stay focusable (focus is not lost) but don't activate.

## ARIA contract

- Accessible name comes from content. Icon-only buttons need `aria-label` (consumer).
- Icons inside are decorative (`aria-hidden`) unless they carry a `label`.
- Loading: `aria-busy="true"` and `aria-disabled="true"` (set by the component). The label stays
  in the accessibility tree (hidden with `opacity`, not `visibility`), so the name is unchanged.
  Announcing completion is the consumer's job (e.g. a toast or live region).
- Toggle buttons: consumer sets `aria-pressed`; styling is the same.

## Component tokens

| Token                          | Default (secondary)              |
| ------------------------------ | -------------------------------- |
| `--vd-button-height`           | `--vd-control-height-md`         |
| `--vd-button-padding-inline`   | `--vd-space-4`                   |
| `--vd-button-gap`              | `--vd-space-2`                   |
| `--vd-button-font-size`        | `--vd-text-sm`                   |
| `--vd-button-radius`           | `--vd-radius-control`            |
| `--vd-button-bg` / `-hover` / `-active` | `--vd-color-fill*`      |
| `--vd-button-fg` / `-hover`    | `--vd-color-text`                |
| `--vd-button-border`           | `--vd-color-border-strong`       |
| `--vd-button-shadow` / `-hover`| `none`                           |
| `--vd-button-sheen`            | `none` (primary/danger: top-lit gradient) |

## Adapter notes

- Angular: `button[vdButton], a[vdButton]` component (attribute selector keeps the native
  element). Boolean inputs accept bare attributes (`<button vdButton disabled>`).
- Click blocking uses a capture listener on the element itself; capture listeners at the target
  run before bubble listeners, so it beats framework-attached handlers.
- React/Vue: render the same markup on `<button>`/`<a>`; `asChild`-style composition is the
  idiomatic way to support router links.
