# Radio

Status: draft · Pattern: native radio group (`<input type="radio">` sharing a `name`)

One choice from a short visible list (2-6 options). For a compact view/filter switch use
Segmented; for long lists use Select.

## Anatomy

```html
<fieldset class="vd-fieldset">
  <!-- fieldset[vdFieldset] -->
  <legend class="vd-fieldset__legend">План</legend>
  <div class="vd-fieldset__options">
    <label class="vd-choice">
      <!-- label[vdChoice] -->
      <input type="radio" class="vd-radio" name="plan" value="team" checked />
      Team
    </label>
  </div>
</fieldset>
```

## Props

Native attributes (`name`, `value`, `checked`, `disabled`, `required`). Shared control inputs
from `VdFieldControlBase`: `invalid`, `touched`, `required`, `id`. Forms: `formControlName` /
`[formControl]` / `ngModel` on every radio with the same `name` (Angular's radio accessor).

## Keyboard

Native: Tab enters at the checked radio (first when none); arrows move and select (mirrored in
RTL); Space selects the focused one.

## States

| State         | Reflected as                                                 |
| ------------- | ------------------------------------------------------------ |
| checked       | accent fill, white dot (spring scale-in), top highlight      |
| hover         | stronger border (whole label is the hit area)                |
| focus-visible | 2px ring                                                     |
| active        | press scale                                                  |
| invalid       | `data-invalid` - danger border (group error on the fieldset) |
| disabled      | reduced opacity                                              |

## ARIA contract

- Group name: the fieldset legend. Option name: the label text.
- Hint/error describe the fieldset (see `specs/field.md`).

## Component tokens

`--vd-radio-size`, `--vd-radio-bg`, `--vd-radio-border`, `--vd-radio-border-hover`,
`--vd-radio-checked`, `--vd-radio-checked-hover`, `--vd-radio-dot`.

## Adapter notes

Angular: `input[type=radio][vdRadio]` directive. React/Vue: same markup and classes.
