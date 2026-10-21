# Editable text

Status: stable · Pattern: native edit button, labelled single-line input and explicit actions.

## Anatomy

```html
<div class="vd-editable-text" data-state="idle">
  <span class="vd-editable-text__label">Project name</span>
  <button
    type="button"
    class="vd-button vd-editable-text__trigger"
    aria-label="Edit Project name: North line"
  >
    <span class="vd-editable-text__value">North line</span><svg aria-hidden="true"></svg>
  </button>
  <span role="status" aria-atomic="true" class="vd-visually-hidden"></span>
</div>
```

Editing replaces the trigger with a Field-labelled native Input and save/cancel buttons.
There is no contenteditable element, nested form or custom textbox role. The Field owns
required marking, input label, hint and error association.

## Props

| Name                   | Type                                     | Default                            | Notes                                                                                               |
| ---------------------- | ---------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| value                  | string                                   | empty                              | Committed single-line text; two-way binding updates only after successful save                      |
| label                  | string                                   | required                           | Visible field label and context for edit button's name                                              |
| save                   | function(string) → void or Promise<void> | absent                             | Optional application persistence; omission commits locally                                          |
| disabled               | boolean                                  | false                              | Prevents starting, changing or submitting edits; does not cancel in-flight persistence              |
| required               | boolean                                  | false                              | A whitespace-only draft is invalid; valid text is never trimmed implicitly                          |
| maxLength              | number or null                           | null                               | Nonnegative finite integers; fractions round down, invalid limits are ignored; native UTF-16 length |
| hint                   | string                                   | absent                             | Consumer content shown by Field while editing                                                       |
| emptyText              | string                                   | locale: editableText.emptyText     | Visible empty-value prompt                                                                          |
| editLabel              | function(label, value) → string          | locale: editableText.editLabel     | Accessible edit button name, including current value/prompt                                         |
| saveLabel, cancelLabel | string                                   | locale: editableText.*             | Action names                                                                                        |
| savingText, savedText  | string                                   | locale: editableText.*             | Polite status announcements                                                                         |
| saveErrorText          | string                                   | locale: editableText.saveErrorText | Retry guidance; exception details are not rendered automatically                                    |
| requiredText           | string                                   | locale: editableText.requiredText  | Localized required error                                                                            |
| tooLongText            | function(limit) → string                 | locale: editableText.tooLongText   | Localized length error                                                                              |

## Events

`valueChange(string)` after successful save when committed text changes. `saveFailed(unknown)`
for application error handling; the original exception is exposed to code, not rendered.
No value event on typing, cancellation, validation error, rejection or unchanged save.

## Content / states

Idle shows the complete wrapping value and a persistent decorative pencil affordance.
Empty uses localized text. Editing keeps a separate draft; it never changes the committed
value before success. Save errors retain that draft and return to editing. User edits clear
outdated error feedback. Unchanged save simply exits without invoking persistence.

Saving makes the input readonly, disables cancel, and marks the save action busy. It guards
duplicate Enter/click calls, retains focus and allows Tab to leave. The request cannot be
cancelled through Escape; the consumer owns its transport. A disabled change locks editing
but preserves the draft and does not pretend to abort persistence.

External value writes do not replace an active draft; Cancel shows the latest committed value.
If the committed value changes during persistence, completion does not overwrite that newer
value. A destroyed instance ignores late resolutions/rejections. Consumers own record identity
and transport cancellation. Do not bind the save callback as a click event; supply a stable
function that persists the candidate and resolves/rejects.

## Keyboard and focus

| Key / action                        | Behavior                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Enter/Space on trigger              | Begin edit; focus and select input text after render                             |
| Enter in input                      | Validate, then save; prevent enclosing form submission                           |
| Escape while editable               | Cancel without commit; stop propagation; return focus to trigger                 |
| Enter/Escape during IME composition | Leave native composition untouched                                               |
| Tab/Shift+Tab or blur               | Native order; do not save, cancel or lose the draft                              |
| Save rejection                      | Keep focus where it is and retain editable draft                                 |
| Save success / Cancel               | Focus trigger only if focus was still inside this editor; preserve outside focus |

All action buttons use type=button. Validation failure focuses the input. There is no focus
trap, document shortcut or automatic commit on blur. An in-flight request does not block Tab.

## ARIA contract

Use native buttons and input. The edit name includes the visible current value and label.
Field labels the input; invalid error describes it. A stable polite status announces saving,
success and error/validation feedback. Visible errors are not separate alert regions, avoiding
duplicate live announcements. Saving action exposes aria-busy/aria-disabled through Button;
input is readonly rather than removed. Button text stays stable while pending.

## Component tokens

`--vd-editable-text-gap` → space-3; `label-size` → text-sm; `label-color` → color-text;
`value-color` → color-text; `empty-color` → color-text-muted; `icon-color` → color-text-muted.
Input, Button and Field retain their existing tokens. Trigger value and action labels wrap;
no new scale, signature, motion or platform API. Forced colors uses existing native outlines.

## Adapter notes

Angular: `VdEditableText` from `@vadem/ui/editable-text`; label is required, value is a model,
text overrides resolve via vdTexts('editableText'). This edit session is not a form value
control: its internal native Input uses existing Field wiring; no second CVA or FormField
contract is added. Use the committed value in the owning form/domain model. Browser-only focus
work is after-render and checks document focus ownership before restoring. It is SSR-safe by
construction; there are no global window/document accesses.
