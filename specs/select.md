# Select & Combobox

Status: stable · Patterns: [APG Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/),
[APG Combobox with List Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/)

Focus stays on the combobox element (button / input); the active option is exposed with
`aria-activedescendant`. The listbox is a `popover="auto"` (Escape and light dismiss from the
platform), anchored under the field with CSS anchor positioning (flips up when needed).

## Anatomy

```html
<div class="vd-select" data-size="md" [data-open] [data-invalid] [data-disabled]>
  <button
    class="vd-select__trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="true"
    aria-controls="lb"
    aria-activedescendant="opt-2"
  >
    <span class="vd-select__value" [data-placeholder]>Київ</span>
    <svg class="vd-select__chevron" />
  </button>
  <div class="vd-listbox" id="lb" role="listbox" popover="auto">
    <div class="vd-option" role="option" id="opt-2" aria-selected="true" data-active>
      <span class="vd-option__label">Київ</span><svg class="vd-option__check" />
    </div>
    <p class="vd-listbox__empty">Нічого не знайдено</p>
    <!-- when nothing is visible -->
  </div>
</div>

<!-- combobox: the field is an input group -->
<div class="vd-combobox">
  <div class="vd-combobox__field">
    <svg /><input class="vd-combobox__input" role="combobox" aria-autocomplete="list" ... /><svg
      class="vd-select__chevron"
    />
  </div>
  <div class="vd-listbox" ...>...</div>
</div>
```

## Props (both)

| Name                               | Type                   | Default                    | Notes                                                                |
| ---------------------------------- | ---------------------- | -------------------------- | -------------------------------------------------------------------- |
| `value`                            | `string \| null`       | `null`                     | Two-way; also ControlValueAccessor and Signal Forms (`value` model). |
| `placeholder`                      | `string`               | `''`                       |                                                                      |
| `size`                             | `'sm' \| 'md' \| 'lg'` | `md`                       | Matches input/button heights.                                        |
| `disabled`                         | `boolean`              | `false`                    | Also from forms.                                                     |
| `invalid` / `touched` / `required` |                        |                            | Same contract as input (shown after touch).                          |
| `emptyText`                        | `string`               | locale: `select.emptyText` | Override only when application-specific wording is needed.           |

Option: `value` (required), `disabled`, `label` (text for trigger/typeahead/filter; defaults to
text content). Content may include icons.

## Keyboard - select

| Key                                         | Closed                                 | Open                                 |
| ------------------------------------------- | -------------------------------------- | ------------------------------------ |
| `ArrowDown` / `ArrowUp` / `Enter` / `Space` | open on the selected (or first) option | move / choose                        |
| `Home` / `End`                              | open on first / last                   | first / last                         |
| `PageUp` / `PageDown`                       | -                                      | +-10                                 |
| printable                                   | open on the typeahead match            | typeahead                            |
| `Enter` / `Space` / `Alt+ArrowUp`           | -                                      | choose active, close                 |
| `Tab`                                       | -                                      | choose active, close, focus moves on |
| `Escape`                                    | -                                      | close, value unchanged               |

## Keyboard - combobox

Typing filters (every word must match, case/diacritic-insensitive: "кам'ян под" finds
"Кам'янець-Подільський") and makes the first match active. `ArrowDown`/`ArrowUp` open or move,
`Enter` chooses, `Escape` closes and restores the selected label, `Home`/`End` move the caret.
Free text never becomes the value: on blur the input shows the selected option again.
`Tab` closes without choosing the active match and preserves normal focus movement;
`Alt+ArrowUp` chooses the active match and closes. This differs from Select, where `Tab`
commits the active option.

## Dynamic options and form updates

- Disabling an open control closes its list without choosing an option or marking an
  untouched control touched. Re-enabling it leaves the list closed until the next user action.
- If the active option is removed, hidden by filtering, or disabled, activation moves to
  the first visible enabled option. If none remains, clear `aria-activedescendant`.
  This repairs navigation only; it does not change the selected value or emit a value change.
- The consumer owns option data and the selected value. Removing the selected option does
  not silently clear that value. Its label becomes unavailable until a matching option returns;
  applications should explicitly clear or validate unavailable values when their domain requires it.
- Form writes through the Angular value accessor discard an uncommitted Combobox query and show
  the written selection's label (or an empty field for null). The write does not itself select
  a match, emit a user value change, or force the popup closed. The same reset behavior is
  verified with `[formField]`, including when its model value remains null.
- Reactive form reset clears displayed errors through the form's untouched state. Required
  validator changes are reflected after the consumer calls `updateValueAndValidity()`.

## States

| State              | Reflected as                                                |
| ------------------ | ----------------------------------------------------------- |
| open               | `data-open`, `aria-expanded`, chevron rotated, field ring   |
| active option      | `data-active` + `aria-activedescendant`; scrolled into view |
| selected           | `aria-selected="true"`, check icon, semibold                |
| disabled option    | `aria-disabled`, skipped by keys and typeahead              |
| filtered out       | option `hidden`                                             |
| empty              | `.vd-listbox__empty`                                        |
| invalid / disabled | `data-invalid` + `aria-invalid` / `data-disabled`           |

## ARIA contract

- Name: `vd-field` label (`for` -> the combobox element) or consumer `aria-label`.
- `role=combobox`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-haspopup`
  (select), `aria-autocomplete="list"` (combobox) - component.
- Options are `role=option` with `aria-selected`; clicking keeps focus on the combobox.
- Required state is exposed as `aria-required` on the inner combobox element.
- Field hint/error and additional description IDs describe the inner combobox element.
- Consumer `aria-label` and `aria-labelledby` naming inputs are forwarded to the inner
  button/input, rather than left on the non-interactive wrapper.

## Component tokens

Field: `--vd-select-height`, `--vd-select-padding-inline`, `--vd-select-font-size`,
`--vd-select-radius`, `--vd-select-bg`, `--vd-select-border(-hover)`, `--vd-select-ring`.
List: `--vd-listbox-padding`, `--vd-listbox-radius` (options are concentric),
`--vd-listbox-max-height`.

## Core

`@vadem/ui/keyboard`: `vdListTarget` (arrows/Home/End/Page), `VdTypeahead`,
`vdMatchesQuery`/`vdNormalize`. Shared Angular base `VdListboxBase` (not public API).

## Adapter notes

Angular imports `VdSelect`, `VdCombobox`, and `VdOption` from `@vadem/ui/select`;
there is no separate `@vadem/ui/combobox` entry point. Both controls expose `focus()`.

`showPopover({ source })` ties the list to its field so clicks on the field don't light-dismiss
it (ignored where unsupported; select falls back to a pressed-while-open flag). Not yet: multiple
selection, option groups, async loading, virtual scrolling.

## Related free-text input

Combobox chooses a supplied option value; text entry filters those options. For arbitrary
text with optional local or asynchronous suggestions, use [Autocomplete](autocomplete.md),
which preserves native text/form value and never accepts a suggestion on blur or Tab.
