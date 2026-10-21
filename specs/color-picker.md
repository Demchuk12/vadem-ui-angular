# Color picker

Status: implemented · Pattern: non-modal Popover dialog with HEX input and palette radio group

## Anatomy

A native button contains a decorative color preview, HEX text/placeholder and chevron.
It opens an existing Vadem Popover with a labelled text input, draft preview, named palette
radio group, feedback and Apply button. Field labels/descriptions refer to the trigger.
The native text field styles reuse Input CSS without registering a second Field control.

## Props

| Name                         | Type                                        | Default                            | Notes                                                                                                               |
| ---------------------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| value                        | string                                      | empty                              | Committed HEX. Only explicit choices normalize/write it.                                                            |
| swatches                     | readonly { value: string; label: string }[] | []                                 | Application palette; invalid entries omitted, equivalent duplicates keep first name. No library-wide palette scale. |
| size                         | sm / md / lg                                | md                                 | Trigger sizes from Input geometry.                                                                                  |
| disabled / readonly          | boolean                                     | false                              | Disabled skips focus; readonly trigger remains focusable without opening.                                           |
| invalid / touched / required | boolean                                     | false                              | Shared form/Field error contract.                                                                                   |
| aria-label / aria-labelledby | string                                      | unset                              | Standalone naming; Field may label the trigger through its id.                                                      |
| placeholder                  | string                                      | Choose color                       | Text for empty/invalid external values.                                                                             |
| pickerLabel                  | string                                      | Choose color                       | Named dialog.                                                                                                       |
| hexLabel                     | string                                      | HEX color                          | Native text label.                                                                                                  |
| paletteLabel                 | string                                      | Palette                            | Palette group name.                                                                                                 |
| applyLabel                   | string                                      | Apply color                        | Explicit draft commit.                                                                                              |
| errorLabel                   | string                                      | Enter a HEX color, such as #6D4BD3 | Invalid/empty draft feedback.                                                                                       |

## Events and content

valueChange emits canonical uppercase #RRGGBB on palette activation or valid HEX Apply/Enter.
Short #RGB and bare RGB/RRGGBB input expand/normalize. Alpha, named colors, functions and
invalid text never become CSS color values. External model values are displayed safely but
not silently rewritten. Palette names and labels are consumer data. No projected slots,
alpha editor, saturation field, eyedropper, native OS picker or auto-submit.

## State and interaction

Trigger empty/default, hover, focus, invalid, disabled/readonly and open states. A valid draft
updates only the popup preview; bad/incomplete HEX retains the last committed preview until
corrected. Apply/HEX Enter validates; invalid input shows localized feedback and retains focus.
Palette pointer/Space/Enter commits and closes. Arrow navigation changes draft/ARIA palette
selection without committing the form. Escape/outside dismissal discards pending draft. External
model replacement or disabled/readonly transition closes the popup and discards editing.

## Keyboard / ARIA

Button Space/Enter or Alt+ArrowDown opens and focuses HEX. Native text editing/paste/selection
remain intact. Tab moves HEX → one palette option (if any) → Apply → outside. Leaving the
non-modal popup closes it without moving outside focus. Palette arrows wrap/move in reading
order; physical horizontal arrows mirror RTL. Home/End move to first/last. Space/Enter
commits palette value. Escape returns focus to the trigger via native Popover invoker.
No focus trap. Trigger aria-haspopup=dialog, aria-expanded/controls and Field descriptions.
Dialog and palette are named; palette buttons role=radio, exclusive aria-checked and roving
Tab entry. Invalid draft links its native input to visible feedback. Color preview is decorative;
trigger HEX and localized palette names identify choices. Touch emits only on leaving the
entire component, including its top-layer content.

## Component tokens

Trigger reuses Input geometry/colors. Component preview size→space-6, swatch size→control-height-md,
gap→space-2, border→border-control, radius→radius-control. Popup uses existing Popover tokens.
Swatch/draft colors and calculated black/white contrasting marks are user data properties,
not new design token scales. Neutral frames retain theme-dependent UI contrast independently
of the supplied color. Forced colors keeps color samples but uses system boundaries/selection.
Narrow/enlarged labels and actions reflow; palette switches from four to two columns when the popup content is narrow.
The popup adds a centered viewport fallback if neither anchored side can fit.
Trigger text uses ellipsis within narrow controls; the full HEX remains in the editor.

## Adapter notes

Angular: VdColorPicker from @vadem/ui/color-picker, with VdColorSwatch and VdColorPickerSize types.
Standalone, OnPush, global CSS, model/touch FormValueControl<string> contract for Angular 22
Reactive/Signal Forms. Existing Field/NgControl state bridge; no custom CVA. Browser-only render
hooks set explicit Popover anchors and close stale editing; no DOM globals. Core HEX parsing,
contrast and palette navigation are pure TypeScript. Configure model validators; the native
internal text input does not own the Angular form model or a submitted hidden value.
