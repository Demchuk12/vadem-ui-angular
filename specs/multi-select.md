# Multi-select

Status: draft · Pattern: editable combobox with a multi-select listbox

Choose several existing values; type to filter and remove selected values individually.
Selection is explicit: moving the active option never changes the value.
References: [APG Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/),
[Angular Aria Multiselect](https://angular.dev/guide/aria/multiselect) (behavior reference,
whose read-only trigger differs from this searchable field).

## Anatomy

```html
<div class="vd-multi-select" data-size="md">
  <div class="vd-multi-select__field">
    <span class="vd-multi-select__chip">
      <span class="vd-multi-select__label" title="Київ">Київ</span>
      <button type="button" class="vd-multi-select__remove" aria-label="Видалити Київ">…</button>
    </span>
    <input
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-controls="options"
      aria-activedescendant="lviv"
    />
  </div>
  <span class="vd-visually-hidden" id="summary" role="status" aria-atomic="true">Вибрано: 1</span>
  <div
    class="vd-listbox vd-multi-select__list"
    id="options"
    role="listbox"
    aria-multiselectable="true"
    popover="auto"
  >
    <div class="vd-option" role="option" id="lviv" aria-selected="false">Львів</div>
  </div>
</div>
```

## Props

| Name                             | Type                        | Default             | Notes                                                 |
| -------------------------------- | --------------------------- | ------------------- | ----------------------------------------------------- |
| `value`                          | `string[]`                  | `[]`                | Two-way selection, unique keys in selection order.    |
| `size`                           | `'sm' \| 'md' \| 'lg'`      | `md`                | Same field sizing as Select; wraps when necessary.    |
| `placeholder`                    | `string`                    | `''`                | Search hint; never replaces a label.                  |
| `disabled`                       | `boolean`                   | `false`             | Disables input and removal buttons, closes the popup. |
| `invalid`, `touched`, `required` |                             |                     | Same displayed-validity contract as Select.           |
| `emptyText`                      | `string`                    | `No options`        | Text when no option matches; localize.                |
| `removeLabel`                    | `(label: string) => string` | `Remove ${label}`   | Localized name for each remove button.                |
| `selectionLabel`                 | `(count: number) => string` | `${count} selected` | Localized live selection summary.                     |
| `aria-label`, `aria-labelledby`  | `string`                    |                     | Forwarded to the input. A field label is preferred.   |

Options share Select's `value`, `label`, and `disabled` contract. Explicit `label` is recommended
for dynamic or rich option content. A disabled option cannot be toggled or removed by the user;
the consumer may still replace the value. Unknown selected keys remain visible using their raw
value until options become available; they are not silently lost.

## Events and content

`valueChange`: the complete new array after an explicit toggle or removal. Incoming form values
do not invoke the forms change callback. Default content is options with optional decorative
icons; interactive children inside an option are unsupported.

## States

| State                 | Representation                                                           |
| --------------------- | ------------------------------------------------------------------------ |
| empty selection       | Input and placeholder, no chips                                          |
| selected              | Chips; options expose `aria-selected="true"` and the existing check icon |
| active option         | `data-active`, input `aria-activedescendant`, scroll into view           |
| filtered              | Unmatched options are `hidden`; selection remains intact                 |
| no matches            | `emptyText`; no dangling active descendant                               |
| open                  | `data-open`, input `aria-expanded`, chevron rotation                     |
| invalid               | `data-invalid`, input `aria-invalid`, field error after touch            |
| disabled              | `data-disabled`, native disabled input and remove buttons                |
| focus / hover / press | Field ring, removal button ring / fill / press feedback                  |

## Keyboard

| Key                               | Action                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------- |
| ArrowDown / ArrowUp               | Open on selected / last enabled option; when open, move without selecting.    |
| PageDown / PageUp                 | Move by ten visible options when open, skipping disabled options.             |
| Enter                             | Toggle the active option when open; keep the list open and input focused.     |
| Space / printable text            | Enter query text, including spaces; every word must match.                    |
| Home / End                        | Native caret movement.                                                        |
| Escape / Alt+ArrowUp              | Close and clear the query; keep selection and input focus.                    |
| Tab / Shift+Tab                   | Close without selecting; move through removal buttons and input in DOM order. |
| Backspace with empty query        | Remove the last selected value unless it is disabled.                         |
| Enter / Space on a removal button | Remove that value and focus the input.                                        |

Pointer option selection toggles without closing. Click on the input opens; click outside and
Escape dismiss through the Popover API. Composition Enter never selects an option.
Leaving the whole control marks it touched; moving between its input and removal buttons does not.

## ARIA contract

The input is named by the field label or explicit naming attributes. Focus stays on it while
navigating options; its active descendant references only an available visible option. The list
has `role="listbox"` and `aria-multiselectable="true"`; options are not checkbox controls.
The input description combines field hint/error and a persistent, polite live selection count.
Removal controls are native buttons with the complete option label in their accessible name.
No selection limit, select-all action, free-text values, async fetching, or virtualization.

## Component tokens

Field: shared `--vd-select-*` tokens. Chips: `--vd-multi-select-gap`,
`--vd-multi-select-chip-bg`, `--vd-multi-select-chip-fg`, `--vd-multi-select-chip-radius`,
`--vd-multi-select-remove-size`, `--vd-multi-select-input-width`. Popup: shared `--vd-listbox-*`.
Themes, density, reduced motion, forced colors, and logical layout use the existing system.
CSS anchor positioning is reused; a centered bounded popup is the fallback when unsupported.

## Adapter notes

Angular: import `VdMultiSelect` and `VdOption` from `@vadem/ui/select`, use `<vd-multi-select>`.
Reuses the existing internal listbox registry, keyboard helpers, and forms/field integration.
Example:

```html
<vd-field label="Міста">
  <vd-multi-select
    [(value)]="cities"
    placeholder="Знайти місто"
    [removeLabel]="removeLabel"
    [selectionLabel]="selectionLabel"
  >
    <vd-option value="kyiv">Київ</vd-option>
    <vd-option value="lviv">Львів</vd-option>
  </vd-multi-select>
</vd-field>
```

Supports the array `[(value)]` model and Reactive, template, and Signal Forms. Signal Forms
uses the CVA route when an accessor is present. Form reset maps `null` to `[]`; incoming
duplicates are normalized.
For required array selection in Signal Forms, use `required(path)` for required metadata plus
`minLength(path, 1)` to reject an empty array: the current Signal Forms required validator
does not treat `[]` as empty. Reactive Forms `Validators.required` does reject empty arrays.
DOM setup is browser-only through render hooks. React/Vue can reuse the plain CSS and pure
selection helpers, rendering the same markup with idiomatic controlled-value APIs.

## Shared list lifecycle

Multi-select shares the disabled/open-list and active-option repair behavior described in
[Select & Combobox](select.md#dynamic-options-and-form-updates). Its existing multiple-value
and query/reset contracts remain specific to Multi-select.
