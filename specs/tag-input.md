# Tag input

Status: implemented · Pattern: native textbox, named list and explicit native action buttons.

## Anatomy

```html
<div class="vd-tag-input" data-size="md">
  <div class="vd-input-group vd-tag-input__field">
    <ul class="vd-tag-input__tags" role="list" aria-label="Tags">
      <li class="vd-tag-input__tag">
        <span class="vd-tag-input__label">Дизайн</span>
        <button class="vd-tag-input__remove" type="button" aria-label="Видалити Дизайн">
          <svg aria-hidden="true"></svg>
        </button>
      </li>
    </ul>
    <input class="vd-input vd-tag-input__input" type="text" id="tags" />
    <button class="vd-button" type="button">Додати</button>
  </div>
  <p class="vd-tag-input__feedback" role="status" aria-atomic="true"></p>
</div>
```

The list appears only when tags exist. Tags wrap; labels are never truncated. Draft input is
separate from the committed array. There is no listbox, suggestion popup or selection model.

## Props

| Name                                                                | Default              | Contract                                                                                           |
| ------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| `value`                                                             | `[]`                 | Committed string array; changes replace the array, never mutate it                                 |
| `size`                                                              | `md`                 | Existing Input sizes sm/md/lg                                                                      |
| `disabled`, `readonly`                                              | false                | Block editing and all add/remove actions; readonly input remains focusable                         |
| `invalid`, `touched`, `required`                                    | false                | Field/form state; form errors appear after touch; explicit standalone invalid displays immediately |
| `placeholder`                                                       | empty                | Example or brief instruction, not the accessible name                                              |
| `aria-label`, `aria-labelledby`                                     | unset                | Forward to inner input when no Field label is available                                            |
| `addLabel`                                                          | Add tag              | Visible native add-button label                                                                    |
| `tagsLabel`                                                         | Tags                 | Accessible name of the native list                                                                 |
| `removeLabel(tag)`                                                  | Remove {tag}         | Accessible removal name                                                                            |
| `addedMessage(tag)`, `removedMessage(tag)`, `duplicateMessage(tag)` | English descriptions | Localizable feedback callbacks; status feedback also stays visibly readable                        |

## Values and events

User additions trim outer whitespace, normalize Unicode NFC and reject empty values. Duplicate
identity uses NFC plus Unicode lowercase; case and outer whitespace are ignored, diacritics and
internal spaces remain significant. First spelling/order wins. External arrays render through
the same canonical view without mutating the original or reporting a user edit. Later user
changes emit a canonical array. Null form writes render as an empty array. External writes do not invoke the Reactive form
change callback; model value updates still follow normal two-way binding semantics.

A successful add clears the draft and returns input focus. Duplicate addition keeps the draft
and committed value unchanged and focuses the input. Empty addition does nothing. Remove
requires explicit button activation and returns input focus; no Backspace deletion shortcut.

`valueChange` reports committed value updates. `touch` reports focus leaving the whole widget;
internal focus movement is not a touch. Editing draft, duplicate attempts and external writes do
not call the Reactive form's change callback. Programmatic form writes and UI reset clear pending draft/feedback. External model input changes also clear pending editing after browser render.

## Keyboard

- Tab/Shift+Tab visit native remove buttons, textbox and add button in DOM/visual order.
- Unmodified Enter in the textbox commits a non-empty draft and never submits the enclosing
  form. IME composition Enter is left untouched; it cannot commit a tag.
- Backspace in an empty textbox focuses the last remove button without changing the value.
- Enter/Space on native action buttons activates the named action. Escape from a remove button
  returns input focus. Text editing, caret keys and clipboard/paste otherwise remain native.
- Pasting text creates one draft; commas/newlines are not custom token delimiters. No automatic
  blur commit, press-and-hold behavior, roving tabindex or tag reordering.

## ARIA / states

Field registers the inner input ID and wires label, hint/error, required and invalid state.
Required applies to the committed tags, not an empty draft: expose aria-required rather than a
native required attribute on the draft. Disabled/read-only action buttons are natively disabled;
empty draft disables add. Icons are decorative. No redundant textbox role, aria-selected or
aria-activedescendant. A persistent polite atomic status describes the latest add/remove or
duplicate result; it does not announce every initial/programmatic value. Repeat identical
feedback is re-announced after a browser render, without timers or server DOM reads.

Root data-size/data-invalid/data-disabled/data-readonly reflect state. Focus-visible styling
surrounds the editor and identifies each removal action. Forced colors retain field/tag/button
boundaries. Reduced motion uses the existing token behavior; no new animation.

## Tokens

Existing Input/Button tokens supply heights, boundaries, fonts and focus. Component tokens
`--vd-tag-input-radius`, `--vd-tag-input-gap`, `--vd-tag-input-padding`, `--vd-tag-input-tag-bg`, `--vd-tag-input-tag-fg`,
`--vd-tag-input-tag-border`, `--vd-tag-input-tag-radius`, `--vd-tag-input-remove-size`,
`--vd-tag-input-input-width` reuse space, fill/text/border, concentric radius and control heights.
No new primitive/semantic scale.

## Adapter notes

Angular exports `VdTagInput` and `VdTagInputSize` from `@vadem/ui/tag-input`. It implements
FormValueControl<string[]> with a value model and touch output; Angular 22 connects it to
Reactive/Template Forms and Signal Forms directly. No explicit CVA/provider is added. Register
NgControl state after init so its control is resolved. Focus/reset implement the Signal Forms UI contract. Field
registration is owned by the composite control, not an extra directive on the draft input.
Native framework integration retains custom focus/reset behavior in Signal Forms instead
of selecting the legacy CVA path. Signal Forms
required() supplies required metadata; add minLength(path, 1) to validate an empty array.
No automatic native FormData serialization of the array; consumers serialize form values.
Standalone/OnPush, global CSS, browser-only render effects for repeated announcements.

References checked 2026-10-08: [Angular custom controls](https://angular.dev/guide/forms/signals/custom-controls),
[FormValueControl](https://angular.dev/api/forms/signals/FormValueControl),
[Angular Aria overview](https://angular.dev/guide/aria/overview). Native input/list/button semantics
suffice; no Angular Aria or CDK dependency is needed.

## Angular usage

```ts
import { VdTagInput } from '@vadem/ui/tag-input';
import { FormControl, Validators } from '@angular/forms';

const tags = new FormControl<string[]>([], Validators.required);
```

```html
<vd-field label="Теги" hint="Введіть тег і натисніть Enter" error="Додайте хоча б один тег">
  <vd-tag-input [formControl]="tags" addLabel="Додати" [removeLabel]="removeLabel" />
</vd-field>
```

For Signal Forms, use an array model and `required(path.tags); minLength(path.tags, 1);`
inside the schema, then bind `[formField]="tagForm.tags"`. Import the corresponding form
directives and Field in the consumer. Localize list/action names and feedback callbacks.
