# Calendar and date picker

Status: draft · Pattern: APG date picker dialog (grid of dates) + editable text field

Pick one calendar date. `vd-calendar` is the inline month grid; `vd-date-picker` is a text
field where the date can be typed, with a button that opens the calendar in a popover.
The Date range picker adds optional range presentation to this same grid
([contract](date-range-picker.md)); the single-date picker remains unchanged. Time and
multi-month views remain outside this contract.

## Values and locale

Values are ISO date strings (`"2026-10-02"`): no time, no time zone, so a date never shifts by a
day. Date math runs in UTC (`core/date.ts`, pure). Names, week start and the numeric format
come from `Intl` for `locale` (defaults to `LOCALE_ID`); the week start falls back to a region
table where `Intl.Locale#getWeekInfo` is missing.

## Anatomy

```html
<vd-calendar class="vd-calendar">
  <div class="vd-calendar__header">
    <button class="vd-calendar__nav" aria-label="Попередній місяць">‹</button>
    <span class="vd-calendar__title" id="t" aria-live="polite">жовтень 2026 р.</span>
    <button class="vd-calendar__nav" aria-label="Наступний місяць">›</button>
  </div>
  <table class="vd-calendar__grid" role="grid" aria-labelledby="t">
    <thead>
      <tr>
        <th scope="col" abbr="понеділок">пн</th>
        ...
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          role="gridcell"
          class="vd-calendar__day"
          tabindex="0"
          aria-selected="true"
          aria-current="date"
          aria-label="пʼятниця, 2 жовтня 2026 р."
          data-date="2026-10-02"
        >
          2
        </td>
        ...
      </tr>
    </tbody>
  </table>
</vd-calendar>

<vd-date-picker class="vd-date-picker">
  <vd-input-group>
    <input class="vd-input" inputmode="numeric" /> <button aria-haspopup="dialog">📅</button>
  </vd-input-group>
  <div
    class="vd-popover vd-date-picker__panel"
    popover="auto"
    role="dialog"
    aria-label="Оберіть дату"
  >
    <vd-calendar />
  </div>
</vd-date-picker>
```

## Props

Shared: `value` (two-way, ISO or null), `min`, `max`, `dateDisabled: (iso) => boolean`, `locale`,
`firstDayOfWeek` (0 = Sunday), `previousLabel`, `nextLabel`.

`vd-date-picker` also: `disabled`, `invalid`, `required`, `placeholder` (default: an example
date in the locale format, e.g. "31.12.2026"), `aria-label`, `openLabel`, `dialogLabel`. It is a
ControlValueAccessor (`formControlName`, `ngModel`) and registers its text input with `vd-field`.

## Keyboard

Grid: arrows by day/week (mirrored in RTL), Home/End to week start/end, PageUp/PageDown by
month, Shift+PageUp/PageDown by year, Enter/Space choose. Focus is clamped to `min`/`max`;
unavailable days can be focused (to read them) but not chosen.

Date picker: type a date (any separators, the locale's day/month/year order, two-digit years =
20xx, or ISO) and press Enter or leave the field; the button opens the calendar (focus moves to
the selected or today's date); choosing closes it and returns focus to the field; Escape closes it.

## States

| State         | Reflected as                                                              |
| ------------- | ------------------------------------------------------------------------- |
| selected      | `aria-selected="true"` - accent fill, top highlight                       |
| today         | `aria-current="date"` - accent text, dot                                  |
| other month   | `data-outside` - muted                                                    |
| unavailable   | `aria-disabled="true"` - disabled color, strike-through                   |
| focus-visible | inset ring on the cell                                                    |
| invalid text  | field `aria-invalid` / danger border; the value keeps its last valid date |

## ARIA contract

- Grid named by the month title (live region: announces month changes).
- Each cell has a full-date `aria-label` (weekday, day, month, year).
- DOM focus on a day synchronizes the roving date without selecting it. Keyboard activation
  and navigation use that focused day, including programmatic focus. Focus alone keeps the
  visible month stable so an adjacent-month pointer target survives until click. Explicit
  selection, navigation and the picker focus request update the visible month.
- When enlarged text makes the two-dimensional grid wider than its container, the calendar
  scrolls locally without shrinking day targets; focusing a day reveals the entire cell.
- The popover is a non-modal `role="dialog"` with a name; the button has `aria-haspopup="dialog"`
  and `aria-expanded`.

## Component tokens

`--vd-calendar-cell`, `--vd-calendar-radius`, `--vd-calendar-selected-bg`,
`--vd-calendar-selected-fg`, `--vd-calendar-hover`, `--vd-calendar-today`.

## Adapter notes

Angular: `vd-calendar`, `vd-date-picker`. React/Vue: the core (`vdMonthGrid`, `vdCalendarKey`,
`vdParseDate`, `vdFormatShort`, `vdFirstDayOfWeek`...) is framework-free.

## Optional range grid mode

Calendar also accepts selectionMode (single by default, or range), rangeStart and rangeEnd
(valid ordered ISO boundaries). Range mode marks every included date selected, adds
aria-multiselectable to the grid and data-range-start/end/in-range to cells. A missing end
marks only the start. dateSelected emits every explicit available date activation, including
repeated same-day choices. Range mode does not write the single-date value; the owning range
picker manages its draft/commit. Default mode preserves the existing valueChange behavior.
Interval styling lives with Date range picker; ordinary Calendar rendering is preserved.
