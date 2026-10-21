# Input

Status: draft · Pattern: native `<input>` / `<textarea>`

Enhances native text-entry elements. Value binding, keyboard, IME, autofill and validation
attributes stay native; the library adds styling, sizes, and displayed validity.

## Anatomy

```html
<input class="vd-input" data-size="md" id="vd-input-3"
       aria-invalid="true" data-invalid aria-describedby="vd-field-error-2" />

<!-- with affixes -->
<div class="vd-input-group">              <!-- vd-input-group -->
  <vd-icon slot="start" />                <!-- icon or button, optional -->
  <input class="vd-input" ... />
  <button class="vd-button" slot="end">   <!-- icon or button, optional -->
</div>
```

## Props (input / textarea)

| Name       | Type                   | Default        | Notes |
| ---------- | ---------------------- | -------------- | ----- |
| `size`     | `'sm' \| 'md' \| 'lg'` | `md`           | Heights follow `--vd-control-height-*` (density-aware). `md`/`lg` use 16px text (no iOS zoom). |
| `invalid`  | `boolean`              | `false`        | Invalid state (e.g. server errors). Reactive/Template form validity is detected automatically. |
| `touched`  | `boolean \| undefined` | `undefined`    | Gate for `invalid`: when `false`, the error isn't shown yet. |
| `required` | `boolean`              | `false`        | Reflected to the native attribute; shows the field's required marker. |
| `id`       | `string`               | generated      | Used by the field label (`for`). |

Native attributes (`type`, `placeholder`, `disabled`, `readonly`, `autocomplete`, `inputmode`,
`maxlength`...) are used as-is.

## Displayed validity

Shown invalid when `invalid` is set, or when the bound form control is invalid **and touched**
(no errors while the user is still typing for the first time).
Sources: Reactive/Template forms (`NgControl`) and Signal Forms (`[formField]`).

Signal Forms: `[formField]` binds `invalid`, `touched` and `required` straight into these
inputs (its `FormUiControl` contract), so no extra wiring is needed. It also sets `aria-invalid`
on the native element as soon as the value is invalid (before touch); that binding wins. The
visual state (`data-invalid`, error text) still waits for touch.

## Events

Native (`input`, `change`, `focus`, `blur`).

## Slots (input group)

| Slot             | Accepts                                                        |
| ---------------- | -------------------------------------------------------------- |
| `[slot="start"]` | decorative icon, or a button (e.g. a prefix selector)          |
| default          | exactly one `vdInput`                                          |
| `[slot="end"]`   | icon, or a ghost `vdButton` (clear, reveal password, copy)     |

Clicking non-interactive parts of the group focuses the input.

## States

| State         | Reflected as                                                    |
| ------------- | --------------------------------------------------------------- |
| size          | `data-size` (group follows its input via `:has()`)              |
| hover         | `:hover` - stronger border                                      |
| focus-visible | `:focus-visible` - 2px ring on the border (group: `:has()`)     |
| invalid       | `data-invalid` + `aria-invalid="true"` - danger border and ring |
| disabled      | `:disabled` - reduced opacity                                   |
| read-only     | `:read-only` - filled background, quieter border                |
| placeholder   | `::placeholder` - `--vd-color-text-subtle` (AA on field bg)     |
| autofill      | `:autofill` - keeps theme colors                                |

## Keyboard

Native. Buttons inside a group are separate tab stops after the input.

## ARIA contract

- Name: a `<label>` (via `vd-field` or consumer). Placeholder is never the label.
- `aria-invalid="true"` while displayed invalid (component).
- `aria-describedby` points to the field's hint, or its error while invalid (component).
- Icon buttons inside a group need `aria-label` (consumer); a reveal toggle uses `aria-pressed`.

## Component tokens

`--vd-input-height`, `--vd-input-padding-inline`, `--vd-input-font-size`, `--vd-input-radius`,
`--vd-input-bg` (`--vd-color-field`), `--vd-input-fg`, `--vd-input-border`
(`--vd-color-border-control`, 3:1), `--vd-input-border-hover`, `--vd-input-ring`
(`--vd-color-focus`, danger when invalid), `--vd-input-placeholder`, `--vd-input-min-rows` (textarea).

## Adapter notes

- Angular: `input[vdInput], textarea[vdInput]` directive; works with `formControlName`,
  `ngModel`, `[formField]` through the native element (no custom value accessor needed).
- Textarea auto-grows with `field-sizing: content` where supported (Chromium; elsewhere it is a
  normal resizable textarea).
- React/Vue: same markup; derive `data-invalid` from the form library's touched + invalid.
