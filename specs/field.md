# Field

Status: draft · Pattern: labelled form control with description and error message

Wraps exactly one form control (input, textarea; later select, checkbox group) and connects its
label, hint and error to it.

## Anatomy

```html
<div class="vd-field" data-invalid>
  <!-- vd-field -->
  <label class="vd-field__label" for="vd-input-3">
    Email <span class="vd-field__required" aria-hidden="true">*</span>
  </label>
  <input class="vd-input" id="vd-input-3" aria-describedby="vd-field-error-2" ... />
  <p class="vd-field__error" id="vd-field-error-2"><svg /> Вкажіть email</p>
  <!-- or, while valid: <p class="vd-field__hint" id="vd-field-hint-1">...</p> -->
</div>
```

## Props

| Name             | Type     | Default | Notes                                                                                                             |
| ---------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `label`          | `string` | -       | Visible label. Omit only if the control is labelled another way.                                                  |
| `hint`           | `string` | -       | Helper text, shown while valid.                                                                                   |
| `descriptionIds` | `string` | absent  | Additional space-separated descriptive IDs, such as Character count; deduplicated and retained beside hint/error. |
| `error`          | `string` | -       | Shown (instead of the hint) while the control displays invalid.                                                   |

## States

| State    | Reflected as                                                                       |
| -------- | ---------------------------------------------------------------------------------- |
| invalid  | `data-invalid` on the field (error visible)                                        |
| disabled | `data-disabled` - muted label                                                      |
| required | `*` marker after the label (hidden from AT; the control's `required` is announced) |

## ARIA contract

- `label[for]` = control id (component).
- Control `aria-describedby` = hint id, or error id while invalid, plus optional descriptionIds
  (deduplicated). Additional descriptions remain attached when errors replace hints.
- Error text is not a live region: it is announced on focus via `aria-describedby`, which avoids
  noisy announcements while tabbing. Form-level summaries are the consumer's job.

## Control contract (for authors of new controls)

A control inside a field provides `{ id, invalid, required, disabled }` (signals) and reads
`describedBy`. In Angular: inject `VD_FIELD` (optional) and `register()` itself.

## Fieldset (groups of choices)

`fieldset[vdFieldset]` is the group counterpart for radios and checkbox groups:

```html
<fieldset class="vd-fieldset" data-orientation="vertical" aria-describedby="hint error">
  <legend class="vd-fieldset__legend">План <span class="vd-field__required">*</span></legend>
  <p class="vd-field__hint" id="hint">...</p>
  <p class="vd-field__error" id="error">...</p>
  <!-- while any control is invalid -->
  <div class="vd-fieldset__options">label[vdChoice] ...</div>
</fieldset>
```

Inputs: `legend`, `hint`, `error`, `orientation: 'vertical' | 'horizontal'`. It provides the same
`VD_FIELD` context but accepts many controls: invalid if any is, required if any is. Hint and
error sit under the legend (read before choosing) and describe the fieldset itself - the
controls get no `aria-describedby`, so the text isn't repeated on every option (GOV.UK pattern).
`disabled` on the fieldset disables every control natively.

## Component tokens

`--vd-field-gap` (`--vd-space-1-5`); fieldset: `--vd-fieldset-gap`.

## Adapter notes

- Angular: `<vd-field>` with a DI context (`VD_FIELD`).
- React/Vue: a context/provide-inject with the same four fields.
- Error entrance uses `@starting-style` (no animation under reduced motion).
