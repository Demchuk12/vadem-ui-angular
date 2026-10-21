# Segmented control

Status: stable · Pattern: radio group (native `<input type="radio">`)

Single choice among 2-5 short options that change a view or filter (period, layout, units).
Not tabs: tabs switch panels of content (`vd-tabs`); a segmented control sets a value.

## Anatomy

```html
<div class="vd-segmented" role="radiogroup" aria-label="Період" data-size="md">
  <span class="vd-segment" data-checked>
    <input
      type="radio"
      class="vd-segment__input"
      name="vd-segmented-1"
      value="week"
      checked
      aria-labelledby="vd-segment-label-2"
    />
    <span class="vd-segment__label" id="vd-segment-label-2">Тиждень</span>
  </span>
  ...
</div>
```

The radio covers the whole segment (hit area and focus target) and is named by the label span
(`aria-labelledby`).

## Props

`vd-segmented`

| Name       | Type             | Default | Notes                                                                    |
| ---------- | ---------------- | ------- | ------------------------------------------------------------------------ |
| `value`    | `string \| null` | `null`  | Two-way. Also a form control (CVA): `formControlName`, `ngModel`.        |
| `size`     | `'sm' \| 'md'`   | `md`    | `md` matches small buttons/inputs; `sm` fits toolbars and table headers. |
| `disabled` | `boolean`        | `false` | Disables every segment. Form `disable()` works too.                      |

`vd-segment`: `value` (required), `disabled`, `aria-label` (icon-only segments; moved to the radio).

Width: segments share the available width (`flex: 1 0 auto`). Set `inline-size: 100%` on the
group to make it fill its container.

## Keyboard

Native radio group: Tab enters at the checked segment (first one when none is checked);
arrow keys move and select (mirrored in RTL); disabled segments are skipped; Tab leaves.

## States

| State         | Reflected as                                                     |
| ------------- | ---------------------------------------------------------------- |
| icon-only     | `data-icon-only` (segment has `aria-label`)                      |
| checked       | `data-checked` on the segment - raised surface, strong text      |
| hover         | stronger text                                                    |
| focus-visible | 2px ring around the segment                                      |
| active        | label scales to `--vd-press-scale`                               |
| disabled      | `data-disabled` (segment or group), `aria-disabled` on the group |

## ARIA contract

- Group: `role="radiogroup"` on the host; name it with `aria-label`/`aria-labelledby`.
  `vd-field` is not supported (its `<label for>` cannot name a group); use a heading or
  `fieldset`/`legend` around it when a visible label is needed.
- Segments: native radios named by the segment's text (`aria-labelledby` -> label span), or by
  `aria-label` for icon-only segments.

## Component tokens

Segments wrap into additional rows when their minimum target sizes cannot fit one row.
Native radio navigation keeps DOM order in both directions; labels retain their existing
ellipsis behavior within each segment. The group never expands the document width.

`--vd-segmented-padding`, `--vd-segmented-radius`, `--vd-segmented-bg`, `--vd-segmented-border`,
`--vd-segment-height`, `--vd-segment-padding-inline`, `--vd-segment-font-size`, `--vd-segment-fg`,
`--vd-segment-fg-hover`, `--vd-segment-fg-checked`, `--vd-segment-bg-checked`.

## Adapter notes

Angular: `vd-segmented` (CVA + `value` model) with `vd-segment` children. React/Vue: same
markup; the group owns the `name` and the value, segments render the radio.
