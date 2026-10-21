# Date range picker

Status: implemented · Pattern: labelled text inputs and non-modal calendar-grid Popover

## Anatomy and props

A named group contains labelled start/end text fields and a native calendar trigger.
The Popover contains selection instructions, a range-aware existing Calendar and textual draft
summary. Field registers the start input once, supplying shared hints/errors to both inputs.
No projected slots. One-month navigation supports ranges across months.

| Name                              | Type                                       | Default                                                 | Meaning                                           |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------- |
| value                             | { start: ISO date; end: ISO date } or null | null                                                    | Complete inclusive range; date only, no time zone |
| minDate / maxDate                 | ISO date or null                           | null                                                    | Inclusive limits on both dates                    |
| locale                            | BCP47 string                               | app locale                                              | Localized display/typing, names and week start    |
| firstDayOfWeek                    | 0..6 or undefined                          | locale                                                  | Week start                                        |
| size                              | sm / md / lg                               | md                                                      | Input/trigger geometry                            |
| disabled / readonly               | boolean                                    | false                                                   | Native fields; calendar editing unavailable       |
| invalid / touched / required      | boolean                                    | false                                                   | Shared Field/form states                          |
| groupLabel                        | string                                     | Date range                                              | Accessible group name                             |
| startLabel / endLabel             | string                                     | Start date / End date                                   | Visible input labels                              |
| openLabel / pickerLabel           | string                                     | Choose date range                                       | Button/dialog names                               |
| previousLabel / nextLabel         | string                                     | Previous month / Next month                             | Calendar navigation                               |
| startInstruction / endInstruction | string                                     | Choose the start date / Choose the end date             | Live selection instructions                       |
| errorLabel                        | string                                     | Enter a valid range, with the end on or after the start | Local parse/order/limit feedback                  |

## Events and states

valueChange emits complete ordered ISO ranges or null. touch emits on leaving the entire
component. Typing clears the committed model to null immediately, avoiding a stale valid range
being submitted while the visible fields are incomplete/invalid. Text is kept for correction.
Blur/Enter commits only two valid, ordered, in-bounds dates; empty pairs clear the model.
Partial pairs stay null; leaving the component or Enter surfaces local incomplete feedback.
Built-in typing parse errors invalidate the bound form, including optional fields. Consumers
provide required/custom model validators, including validation of externally supplied values. A non-required empty pair is valid.
External malformed/reversed values display empty safely without silent model mutation.
External value replacement resets local errors/text and closes pending calendar editing.
Changing bounds invalidates existing text/model display but does not silently rewrite value.
Disabled/readonly transition closes the popup.

Opening starts a separate calendar draft from the committed range. First activation starts a
new range; the second sorts its endpoints, commits and closes, including same-day ranges.
Escape/outside/Tab dismissal cancels the calendar draft and preserves the committed fields.
Only endpoints and dates between them are selected; interior uses a muted fill and endpoints
strong fill/borders. Text summary and instructions supplement color.
States reflect data-size/disabled/readonly/invalid/open; input aria-invalid/describedby and
native disabled/readonly; grid aria-multiselectable, selected cells, data-range-start/end/in-range.

## Keyboard and ARIA

Native typing, clipboard and selection remain intact. Enter commits typed fields. Alt+ArrowDown
from either input opens the calendar. Native button Enter/Space opens and focuses a grid date.
Existing Calendar keys: arrows by day/week (horizontal mirrored RTL), Home/End week endpoints,
PageUp/Down months, Shift+PageUp/Down years, Enter/Space selects a boundary. Modified keys and
IME Enter preserve text behavior. One grid Tab entry. Non-modal Tab leaves; no trap. Escape
returns to the calendar trigger through native Popover invoker. A complete choice focuses it.

Group, fields, dialog and grid are named. Descriptions combine Field feedback with localized
local error. Required uses native input required. Calendar selected interval sets aria-selected
for every included day and aria-multiselectable on the grid. No arbitrary unavailable-day API,
hover preview, shortcuts/presets, time zone, multiple months or booking policy is introduced.

## Tokens and layout

Existing Input/Popover/Calendar/Button tokens and theme surfaces. Component gap uses space-3;
interior range fill uses action-subtle and action-text; endpoints reuse Calendar selected colors.
Endpoint borders preserve selection shape in grayscale/forced colors. Inputs stack when narrow;
calendar columns shrink to available popup width, retaining at least 24px hit targets at 320px.
Popup gets a centered viewport fallback and scrolls with enlarged text. No new token scale.

## Adapter notes

Angular: VdDateRangePicker from @vadem/ui/date-range-picker, exported VdDateRange and size type.
Standalone signals, OnPush, global CSS, FormValueControl<VdDateRange|null> model/touch accessor
for Angular 22 Reactive/Signal Forms; transformedValue tracks raw pairs, parse errors and UI reset, with
existing NgControl/Field state bridge. Arabic decimal digits normalize before locale parsing. Internal inputs
reuse Input CSS without secondary Field registrations. Pure range logic reuses Calendar date
helpers. Browser render hooks own explicit anchors/focus/lock dismissal, without DOM globals.
Calendar adds optional range mode/start/end and dateSelected event; default single-date behavior
and valueChange remain unchanged. Explicit activation emits even for repeated same-date choice.
