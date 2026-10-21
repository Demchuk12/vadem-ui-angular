# Schedule

Status: draft · Pattern: native tables, lists and buttons; month days use a roving tab stop with
[APG date grid](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
keys. No `role=grid`: cells contain several buttons.

A calendar of application-owned events in month, week, day and agenda views (activities in a CRM).
Not a date picker: use `@vadem/ui/calendar` to pick a date.

## Data

Times are local wall-clock strings without a time zone; the application converts from its
storage zone. Timed: `start`/`end` "YYYY-MM-DDTHH:mm", `end` exclusive. All-day: `allDay: true`,
`start`/`end` "YYYY-MM-DD", `end` is the last day (inclusive). Arithmetic treats every day as 1440
minutes (no DST gaps). IDs are unique; invalid data shows `invalidText` and no events.

## Props and events

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| events | readonly { id, title, start, end, allDay?, color? }[] | [] | `color`: accent, neutral, success, warning, danger, info |
| view | model 'month' \| 'week' \| 'day' \| 'agenda' | month | Two-way |
| date | model "YYYY-MM-DD" | today | Any date in the shown period; two-way |
| views | VdScheduleView[] | all four | Order of the view switch; one item hides it |
| locale | string | LOCALE_ID | Names, week start, date and time formats |
| firstDayOfWeek | 0-6 | locale | |
| dayStartHour, dayEndHour | number | 0, 24 | Visible hours in week/day views |
| scrollToHour | number | 8 | Initial scroll of week/day views (once per period) |
| slotMinutes | number | 30 | Snapping for drag, resize and empty-time clicks (5-120) |
| maxEventsPerDay | number | 3 | Month chips before "+N more" |
| agendaDays | number | 14 | Days listed by the agenda (only days with events are shown) |
| now | "YYYY-MM-DDTHH:mm" \| null | null | Draws the now line and defines today; the app updates it |
| editable | boolean | true | Pointer drag and resize; activation and slot clicks always work |
| label, todayText, previousLabel, nextLabel, viewLabel, monthText, weekText, dayText, agendaText, allDayText, emptyText, invalidText | string | locale: schedule.* | UI copy |
| moreText, eventsText, changedText, canceledText | functions | locale | Plural-aware counts and announcements |

Outputs: `eventActivate(event)` on click/Enter/Space; `slotActivate({ date, time })` on a click on
empty space (`time` "HH:mm" snapped in week/day, null for a whole day); `eventChange({ id, start,
end, allDay, kind: 'move' | 'resize' })` after a drag. The schedule never edits `events`;
`vdScheduleApplyChange(events, change)` applies a change immutably.

## Views

- Toolbar: Today, previous/next period (icon buttons with labels, mirrored in RTL), the period
  title (polite live region) and a view switch (`aria-pressed` buttons in a named group).
- Month: a 6-week table with weekday headers (`abbr` long names). Each cell has a day button
  (number; label = long date + event count; `aria-current=date` for today) and chips for its
  events (time + title, ellipsis). Overflow shows "+N more", which opens the day. Multi-day events
  show a chip on each day. In containers narrower than 36rem chips are hidden and a dot marks
  days with events; the day button opens the day view.
- Week/Day: column header buttons (open the day), an all-day row, and a scrollable time grid
  (`role=region`, focusable) with hour lines. Overlapping events share the column width (each
  cluster gets the fewest columns). Events beyond the visible hours are clipped with square
  corners. The now line marks `now` on its day.
- Agenda: days with events as sections (long date heading) listing buttons with time range
  ("…" when an event continues from or into another day) and title; `emptyText` otherwise.

## Keyboard

- Tab: toolbar, then the month grid's single day stop and that day's chips, or the week/day
  header buttons, all-day chips, the scroll region and event blocks in time order.
- Month day button: arrows move by day/week (mirrored in RTL), Home/End to week start/end,
  PageUp/PageDown by month, Shift+PageUp/PageDown by year; moving outside the period changes it.
  Enter/Space opens the day view.
- Events: Enter/Space activate (`eventActivate`). Moving or resizing with the keyboard is the
  application's edit form, opened from activation (the single-pointer alternative to dragging).

## Pointer

Mouse/pen only (touch scrolls). Press an event and move 4px to drag; release over another day or
time to request a move (whole days in month and all-day rows, snapped minutes in the time grid).
The bottom edge of a timed block resizes it (minimum one slot). A dashed preview shows the target
time; month cells and all-day cells show a focus-colour outline. Escape, Tab, pointercancel or
replacing `events` cancel. The click after a drag or a canceled drag is suppressed.

## ARIA contract

- Event buttons are named "title, date, time range" (or "All day" with the date range).
- The period title is `aria-live=polite`; changes are announced through a persistent
  `role=status` (`changedText`, `canceledText`).

## Component tokens

`--vd-schedule-gap`, `-border`, `-bg`, `-muted`, `-radius` (radius-surface), `-cell-height`
(7rem), `-hour-height` (3rem), `-gutter` (3.5rem), `-max-height` (36rem), `-agenda-time` (9rem),
`-event-radius`, `-today-bg`/`-today-fg` (action), `-now` (danger), `-now-size`, `-marker`
(focus). Event colours map to the semantic subtle/solid pairs like Badge. Forced colors: system
borders for events, Highlight for today and the now line.

## Adapter notes

Pure core (`core/schedule.ts`, no Angular, no other entry points): parsing, validation, view
ranges, period steps, overlap layout, move/resize/apply. Angular renders views with signals and
OnPush, binds pointer capture on events and reads date helpers from `@vadem/ui/calendar`. No
timers, document listeners, CDK or runtime dependencies. Recurrence, time zones, resource
columns, touch dragging and drag-to-create are out of scope.
