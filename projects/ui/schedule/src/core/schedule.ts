/**
 * Framework-agnostic schedule logic. Times are local wall-clock strings without a time zone
 * ("2026-10-21T14:30"): the application converts from its storage zone. All arithmetic runs on
 * minutes counted as if UTC, so a day always has 1440 minutes and nothing shifts around DST.
 */

/** "YYYY-MM-DD" calendar date. */
export type VdIsoDate = string;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value: string): Date | null {
  const m = ISO_DATE.exec(value);
  if (!m) return null;
  const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function addDays(date: VdIsoDate, days: number): VdIsoDate {
  const d = parseDate(date)!;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Adds months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
function addMonths(date: VdIsoDate, months: number): VdIsoDate {
  const d = parseDate(date)!;
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return target.toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday. */
function weekday(date: VdIsoDate): number {
  return parseDate(date)!.getUTCDay();
}

function weekStart(date: VdIsoDate, firstDay: number): VdIsoDate {
  return addDays(date, -((weekday(date) - firstDay + 7) % 7));
}

export type VdScheduleView = 'month' | 'week' | 'day' | 'agenda';
export type VdScheduleColor = 'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface VdScheduleEvent {
  readonly id: string;
  readonly title: string;
  /** Timed: "YYYY-MM-DDTHH:mm". All-day: "YYYY-MM-DD". */
  readonly start: string;
  /** Timed: exclusive end "YYYY-MM-DDTHH:mm". All-day: last day, inclusive, "YYYY-MM-DD". */
  readonly end: string;
  readonly allDay?: boolean;
  readonly color?: VdScheduleColor;
}

/** A requested change of an event's time (from dragging or resizing). Same formats as the event. */
export interface VdScheduleEventChange {
  readonly id: string;
  readonly start: string;
  readonly end: string;
  readonly allDay: boolean;
  readonly kind: 'move' | 'resize';
}

/** A normalized event: minutes since the epoch (wall clock), exclusive end. */
export interface VdScheduleItem<E extends VdScheduleEvent = VdScheduleEvent> {
  readonly event: E;
  readonly allDay: boolean;
  readonly startMin: number;
  readonly endMin: number;
  /** First and last day the event touches (inclusive). */
  readonly startDate: VdIsoDate;
  readonly endDate: VdIsoDate;
}

export const VD_DAY_MINUTES = 1440;
const DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;

/** Minutes since the epoch for "YYYY-MM-DD" (midnight) or "YYYY-MM-DDTHH:mm"; null if invalid. */
export function vdScheduleMinutes(value: string): number | null {
  const m = DATE_TIME.exec(value);
  const date = parseDate(m ? m[1] : value);
  if (!date) return null;
  if (!m) return date.getTime() / 60000;
  const h = +m[2],
    min = +m[3];
  if (h > 23 || min > 59) return null;
  return date.getTime() / 60000 + h * 60 + min;
}

export function vdScheduleDateTime(minutes: number): string {
  return new Date(minutes * 60000).toISOString().slice(0, 16);
}

export function vdScheduleDate(minutes: number): VdIsoDate {
  return new Date(minutes * 60000).toISOString().slice(0, 10);
}

/** Minutes since midnight of the day that contains `minutes`. */
export function vdScheduleTimeOfDay(minutes: number): number {
  return ((minutes % VD_DAY_MINUTES) + VD_DAY_MINUTES) % VD_DAY_MINUTES;
}

export function vdScheduleNormalize<E extends VdScheduleEvent>(event: E): VdScheduleItem<E> | null {
  if (event.allDay) {
    const start = vdScheduleMinutes(event.start.slice(0, 10));
    const last = vdScheduleMinutes(event.end.slice(0, 10));
    if (start === null || last === null || last < start) return null;
    return {
      event,
      allDay: true,
      startMin: start,
      endMin: last + VD_DAY_MINUTES,
      startDate: event.start.slice(0, 10),
      endDate: event.end.slice(0, 10),
    };
  }
  const start = vdScheduleMinutes(event.start);
  const end = vdScheduleMinutes(event.end);
  if (start === null || end === null || end <= start || !event.start.includes('T')) return null;
  return {
    event,
    allDay: false,
    startMin: start,
    endMin: end,
    startDate: vdScheduleDate(start),
    endDate: vdScheduleDate(end - 1),
  };
}

/** IDs unique and non-empty; every event parses and ends after it starts. */
export function vdScheduleValid(events: readonly VdScheduleEvent[]): boolean {
  const ids = new Set<string>();
  for (const event of events) {
    if (typeof event.id !== 'string' || !event.id.trim() || ids.has(event.id)) return false;
    if (!vdScheduleNormalize(event)) return false;
    ids.add(event.id);
  }
  return true;
}

/** Normalized events sorted by start, all-day first, then longer first. */
export function vdScheduleItems<E extends VdScheduleEvent>(
  events: readonly E[],
): VdScheduleItem<E>[] {
  return events
    .map((e) => vdScheduleNormalize(e))
    .filter((i): i is VdScheduleItem<E> => !!i)
    .sort(
      (a, b) =>
        Number(b.allDay) - Number(a.allDay) ||
        a.startMin - b.startMin ||
        b.endMin - a.endMin ||
        a.event.title.localeCompare(b.event.title),
    );
}

/** Items touching `date`. */
export function vdScheduleOnDay<E extends VdScheduleEvent>(
  items: readonly VdScheduleItem<E>[],
  date: VdIsoDate,
): VdScheduleItem<E>[] {
  return items.filter((i) => i.startDate <= date && i.endDate >= date);
}

/** The dates a view shows for an anchor date. Month: 6 full weeks. */
export function vdScheduleDays(
  view: VdScheduleView,
  date: VdIsoDate,
  firstDay: number,
  agendaDays = 14,
): VdIsoDate[] {
  switch (view) {
    case 'month': {
      // Always 6 weeks, so the grid height never jumps between months.
      const start = weekStart(date.slice(0, 8) + '01', firstDay);
      return Array.from({ length: 42 }, (_, i) => addDays(start, i));
    }
    case 'week': {
      const start = weekStart(date, firstDay);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    case 'day':
      return [date];
    case 'agenda':
      return Array.from({ length: Math.max(1, agendaDays) }, (_, i) => addDays(date, i));
  }
}

/** The anchor date one period earlier or later. */
export function vdScheduleStep(
  view: VdScheduleView,
  date: VdIsoDate,
  direction: 1 | -1,
  agendaDays = 14,
): VdIsoDate {
  switch (view) {
    case 'month':
      return addMonths(date, direction);
    case 'week':
      return addDays(date, 7 * direction);
    case 'day':
      return addDays(date, direction);
    case 'agenda':
      return addDays(date, Math.max(1, agendaDays) * direction);
  }
}

export interface VdSchedulePlacement<E extends VdScheduleEvent = VdScheduleEvent> {
  readonly item: VdScheduleItem<E>;
  /** Minutes from the visible range start, clipped to the range. */
  readonly top: number;
  readonly bottom: number;
  readonly column: number;
  readonly columns: number;
  /** The event continues before/after the visible part of this day. */
  readonly clippedStart: boolean;
  readonly clippedEnd: boolean;
}

/**
 * Lays out the timed events of one day between `fromMinute` and `toMinute` (minutes after
 * midnight). Overlapping events share the width: each cluster of transitively overlapping events
 * gets the smallest number of columns and every event takes the first free column.
 */
export function vdScheduleLayout<E extends VdScheduleEvent>(
  items: readonly VdScheduleItem<E>[],
  date: VdIsoDate,
  fromMinute = 0,
  toMinute = VD_DAY_MINUTES,
): VdSchedulePlacement<E>[] {
  const dayStart = vdScheduleMinutes(date);
  if (dayStart === null) return [];
  const from = dayStart + fromMinute,
    to = dayStart + toMinute;
  const visible = items
    .filter((i) => !i.allDay && i.startMin < to && i.endMin > from)
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const result: VdSchedulePlacement<E>[] = [];
  let cluster: { item: VdScheduleItem<E>; column: number }[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    for (const { item, column } of cluster) {
      const start = Math.max(item.startMin, from),
        end = Math.min(item.endMin, to);
      result.push({
        item,
        top: start - from,
        bottom: end - from,
        column,
        columns: columnEnds.length,
        clippedStart: item.startMin < from,
        clippedEnd: item.endMin > to,
      });
    }
    cluster = [];
    columnEnds = [];
  };
  for (const item of visible) {
    if (item.startMin >= clusterEnd) flush();
    let column = columnEnds.findIndex((end) => end <= item.startMin);
    if (column < 0) column = columnEnds.push(item.endMin) - 1;
    else columnEnds[column] = item.endMin;
    cluster.push({ item, column });
    clusterEnd = Math.max(clusterEnd === -Infinity ? item.endMin : clusterEnd, item.endMin);
  }
  flush();
  return result;
}

export function vdScheduleSnap(minutes: number, step: number): number {
  return step > 0 ? Math.round(minutes / step) * step : minutes;
}

/** Moves an event by whole days (all-day) or minutes (timed), keeping its duration. */
export function vdScheduleMove(item: VdScheduleItem, deltaMinutes: number): VdScheduleEventChange {
  if (item.allDay) {
    const days = Math.round(deltaMinutes / VD_DAY_MINUTES);
    return {
      id: item.event.id,
      start: addDays(item.startDate, days),
      end: addDays(item.endDate, days),
      allDay: true,
      kind: 'move',
    };
  }
  return {
    id: item.event.id,
    start: vdScheduleDateTime(item.startMin + deltaMinutes),
    end: vdScheduleDateTime(item.endMin + deltaMinutes),
    allDay: false,
    kind: 'move',
  };
}

/** Sets a timed event's end, keeping at least `minimum` minutes of duration. */
export function vdScheduleResize(
  item: VdScheduleItem,
  endMin: number,
  minimum: number,
): VdScheduleEventChange {
  return {
    id: item.event.id,
    start: item.event.start,
    end: vdScheduleDateTime(Math.max(endMin, item.startMin + Math.max(1, minimum))),
    allDay: false,
    kind: 'resize',
  };
}

/** Applies a change immutably; returns the same array when the event is not found. */
export function vdScheduleApplyChange<E extends VdScheduleEvent>(
  events: readonly E[],
  change: VdScheduleEventChange,
): readonly E[] {
  if (!events.some((e) => e.id === change.id)) return events;
  return events.map((e) =>
    e.id === change.id ? { ...e, start: change.start, end: change.end, allDay: change.allDay } : e,
  );
}
