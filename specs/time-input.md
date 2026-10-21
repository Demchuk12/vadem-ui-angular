# Time input

Status: stable · Pattern: native input type=time with a themed selection dialog

## Anatomy

```html
<input
  class="vd-input vd-time-input"
  type="time"
  data-size="md"
  min="09:00"
  max="18:00"
  step="900"
/>
```

One native input; Field supplies labels/hints/errors. Native segments remain browser-owned. A sibling internal view supplies the themed popup;
there is no duplicate form model or custom segmented editor.

## Props

| Name                     | Type                        | Default            | Notes                                                                                 |
| ------------------------ | --------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| size                     | sm / md / lg                | md                 | Inherited Input geometry.                                                             |
| value                    | native string               | empty              | HH:mm, optionally seconds per platform; no Date/time zone conversion.                 |
| min, max                 | native time string          | unset              | Native time bounds; reversed bounds describe an overnight interval where supported.   |
| step                     | native numeric string / any | native 60          | Seconds, not minutes; 900 represents 15 minutes. Preserve native base/rounding rules. |
| disabled, readonly, name | native                      | native             | Native editing/submission semantics.                                                  |
| required                 | boolean                     | false              | Native required; inherited Field/form contract.                                       |
| invalid                  | boolean                     | false              | Explicit server state or consumer native-validation bridge.                           |
| touched                  | boolean / undefined         | undefined          | Inherited error display gate.                                                         |
| pickerLabel              | string                      | Choose time        | Localized dialog/list name.                                                           |
| emptyLabel               | string                      | No available times | Localized empty minute-options message.                                               |
| id                       | string                      | generated          | Consumer may supply stable id.                                                        |

Apply the directive to `input[type=time]`; keep type fixed for its lifetime. Bounds/step are
native attributes/properties, not a parallel custom API. Both 12-hour and 24-hour browser UIs
remain usable; the submitted value is standardized independently of the displayed locale.
The first gallery version uses hours/minutes and steps divisible by 60. Native finer steps
may show seconds. The themed list offers minute-resolution values that satisfy the constraints;
seconds remain editable in the native field. No custom seconds editor is supplied.

## Events and content

Native input/change/focus/blur and form submission. No custom outputs or slots. Picker selection dispatches native input/change events. The browser
sanitizes malformed assigned values, may represent incomplete segments as an empty value and
handles stepping/rounding. The directive does not clamp or rewrite programmatic values.
No custom paste parser, automatic submission or time zone conversion. Focus moves only
on explicit popup activation, navigation or selection.

## States

Empty/default, hover, focus-visible, disabled, readonly and invalid reuse Input and Field.
Invalid reflects data-invalid / aria-invalid=true after touch or explicit invalid input.
Native constraint validity does not by itself enable the touched Field error. Consumers must
configure Angular validators, or bridge native validity explicitly when not using a form model.
No loading state; applications may disable the field during a request.

## Keyboard

Native per-browser segment navigation, arrows to edit, digits and Tab/Shift+Tab entry/exit.
Click or Alt+ArrowDown opens the themed picker. Within its list, ArrowUp/Down and Home/End
move focus; Enter/Space selects, Escape cancels and returns focus to the field.
Tab exits the non-modal picker and closes it without changing the value. A browser may use Tab between time
segments before leaving the field. readonly is focusable; disabled is skipped. Keyboard/picker
behavior varies across browsers; no identical key count or picker popup structure is promised.

## ARIA contract

Native time control and its browser-owned segments. No imposed textbox/spinbutton role or aria-valuenow. The native time role does not support
aria-expanded; open state is represented by data-state, with aria-haspopup=dialog and
aria-controls pointing to the popup. The named popup contains a named single-selection
listbox with roving options and aria-selected; selection and keyboard focus are separate. Field labels through id and switches describedby
between hint/error. Standalone controls require a native accessible label. Native segment localization and disabled/readonly semantics belong to the platform.
Disabled/readonly controls do not open the picker; selection rechecks live constraints. RTL labels retain RTL;
no custom physical arrow conversion is added.

## Component tokens

| Token                | Default        |
| -------------------- | -------------- |
| --vd-time-input-font | --vd-font-mono |

Tabular digits; inherited Input background/border/focus/radius/padding/height/size tokens.
Width follows Input and permits shrinking via min-inline-size:0. The native clock affordance remains visible; its ordinary click is intercepted to open
the themed popup. Direct application calls to showPicker still invoke browser UI. Forced colors, reduced motion and theme color-scheme inherit Input.
Very narrow enlarged native editors can internally clip segments; consumers should provide
adequate room and avoid packing time fields into tiny side-by-side columns.

## Adapter notes

Angular: `VdTimeInput` from `@vadem/ui/time-input`, selector input[type=time][vdTimeInput],
extends VdInput. Native accessors serve Reactive/Template and Signal Forms; no CVA or validator
provider. Unlike number inputs, native time values remain strings. Angular model validators
must match native bounds/step; min/max attributes alone do not validate a Reactive/Signal Forms
model. The gallery supplies matching 09:00..18:00 quarter-hour validators. The internal popup is created after browser rendering, preserving SSR-safe native markup.
Pure time-options logic generates minute choices matching bounds, step and native initial
value step base. There are no DOM globals or extra runtime dependencies.

Current project browser targets support native time inputs. Older unsupported browsers can
fall back to text; matching model validation and a format hint remain necessary there. Actual
picker appearance/locale/seconds support is browser-dependent. Native range/step behavior is
not replaced with a second parser. Server/business validation remains the application's task.

Source: [MDN native time input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time).

## Themed picker additions (2026-10-08)

The user requested styling the popup instead of browser defaults. Native date/time picker
contents cannot be reliably restyled with CSS, so the standard click and Alt+ArrowDown
use a Vadem Popover with a scrollable option list. It reuses existing semantic surfaces,
control borders, focus and accent tokens, with a vendored Lucide check for the selected value.

Localizable inputs: pickerLabel (default "Choose time") and emptyLabel (default
"No available times"). List values are 24-hour HH:mm. Options are rebuilt from live native
constraints on opening; an empty minute-resolution set shows the localized empty message.
Opening/canceling does not change the native value. Only explicit selection dispatches
input/change. Native blur continues to mark forms touched. No timezone, confirmation flow,
new token scale or CVA is added. --vd-time-picker-width defaults to 14rem and
--vd-time-picker-height to 16rem; both are viewport constrained. Popover supplies existing
anchor positioning and flip behavior.

## Two-column picker refinement (2026-10-08)

The user requested separate hours/minutes columns. The dialog now contains two named
listboxes with separate roving focus. hoursLabel (default "Hours") and minutesLabel
(default "Minutes") localize the column headings and accessible names. Ukrainian gallery
headings use "Год" and "Хв"; Arabic headings are localized.

Hours are derived from valid complete minute-resolution times. Minutes show only the valid
choices for the draft hour, so endpoints such as 18:00 expose only minute 00. Selecting an
hour preserves the previous minute if valid or chooses the first valid minute as a draft,
and focuses the minute column. The field is unchanged until explicit minute selection.
Escape or outside dismissal discards the draft. Opening derives both columns from the
current native value. ArrowUp/Down and Home/End move within each column; Enter/Space
select the active part. Tab moves hours to minutes and then out of the popup. Existing
step, overnight bounds, live constraint recheck and native input/change dispatch remain.
Logical CSS mirrors the columns in RTL and keeps two-digit values on one line at enlarged
text sizes. No new dependencies or token scale.
