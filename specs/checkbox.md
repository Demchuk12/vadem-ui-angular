# Checkbox

Status: stable · Pattern: native `<input type="checkbox">` ([APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/))

## Anatomy

```html
<label class="vd-choice">                             <!-- label[vdChoice] -->
  <input type="checkbox" class="vd-checkbox" id="vd-control-4" />
  Надсилати щотижневий звіт
</label>
```

The mark is drawn with `::before` + `mask` (Lucide check / minus geometry).

## Props

| Name            | Type      | Default | Notes |
| --------------- | --------- | ------- | ----- |
| `indeterminate` | `boolean` | `false` | Mixed state; two-way (`[(indeterminate)]`), cleared when the user clicks. |
| `invalid`       | `boolean` | `false` | Forced invalid; form validity (e.g. `requiredTrue`) detected after touch. |
| `touched`       | `boolean \| undefined` | - | Gate for `invalid` (Signal Forms binds it). |
| `required`      | `boolean` | `false` | Reflected natively. |

Native: `checked`, `disabled`, `name`, `value`. No `size` prop: one size, tune with tokens.

## Events

Native `change` / `input`. `indeterminateChange` when the mixed state clears.

## States

| State         | Reflected as |
| ------------- | ------------ |
| checked       | `:checked` - action fill, check mark scales in (spring) |
| mixed         | `:indeterminate` - action fill, minus mark |
| hover         | `:hover` on the box or its `vd-choice` label |
| focus-visible | `:focus-visible` - accent outline, offset |
| active        | `:active` - press scale |
| invalid       | `data-invalid` + `aria-invalid` - danger border |
| disabled      | `:disabled` - reduced opacity; label muted |

## Keyboard

Native: `Space` toggles. Clicking anywhere on the wrapping label toggles.

## ARIA contract

- Name: text inside the wrapping `label[vdChoice]`.
- Required: native `required` from the input, or `aria-required="true"` from a validator such as
  `requiredTrue` (no native constraint validation side effects).
- Mixed state is native (`indeterminate` property -> announced as "mixed").
- Inside `vd-field`: hint/error via `aria-describedby`; omit the field `label` (the choice label names it).
- Groups: wrap in `<fieldset>` + `<legend>`.

## Component tokens

`--vd-checkbox-size` (1.125rem), `--vd-checkbox-radius`, `--vd-checkbox-bg`, `--vd-checkbox-border`
(3:1), `--vd-checkbox-border-hover`, `--vd-checkbox-bg-checked`, `--vd-checkbox-bg-checked-hover`,
`--vd-checkbox-mark`, `--vd-checkbox-icon-check`, `--vd-checkbox-icon-mixed`;
`--vd-choice-gap` on the label.

## Adapter notes

Angular: `input[type=checkbox][vdCheckbox]` (extends the shared field-control base). Works with
`formControlName`, `ngModel`, `[formField]` natively. React/Vue: set `indeterminate` via ref.
