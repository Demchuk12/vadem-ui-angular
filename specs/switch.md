# Switch

Status: draft · Pattern: [APG Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) on a native checkbox

Use for settings that take effect immediately. In forms that are submitted, prefer a checkbox.

## Anatomy

```html
<label class="vd-choice">
  <input type="checkbox" role="switch" class="vd-switch" id="vd-control-7" />
  Темна тема
</label>
```

Track = the input; thumb = `::before`, moved with `translate` (mirrored in RTL via `:dir(rtl)`).

## Props

Same as checkbox minus `indeterminate`: `invalid`, `touched`, `required`; native `checked`,
`disabled`, `name`.

## Events

Native `change` / `input`.

## States

| State         | Reflected as |
| ------------- | ------------ |
| on            | `:checked` - action track, thumb at the end (spring) |
| hover         | `:hover` on the switch or its label |
| focus-visible | `:focus-visible` - accent outline, offset |
| active        | `:active` - press scale |
| invalid       | `data-invalid` + `aria-invalid` - danger border |
| disabled      | `:disabled` - reduced opacity; label muted |

## Keyboard

Native checkbox: `Space` toggles (APG also allows `Enter`; native checkboxes don't, which matches
platform behavior for switches built on checkboxes).

## ARIA contract

- `role="switch"` (component) on the native checkbox: announced as "switch, on/off".
- Name from the wrapping `label[vdChoice]`. Don't change the label text with the state.

## Component tokens

`--vd-switch-width` (2.25rem), `--vd-switch-height` (1.25rem), `--vd-switch-padding`,
`--vd-switch-track` (off, 3:1), `--vd-switch-track-hover`, `--vd-switch-track-on`,
`--vd-switch-track-on-hover`, `--vd-switch-thumb-color`.

## Adapter notes

Angular: `input[type=checkbox][vdSwitch]`. React/Vue: same markup, `role="switch"`.
