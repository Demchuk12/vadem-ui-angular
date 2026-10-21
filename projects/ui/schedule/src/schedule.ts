import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import {
  vdCalendarKey,
  vdFirstDayOfWeek,
  vdFormatDate,
  vdToday,
  vdWeekdayNames,
} from '@vadem/ui/calendar';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import {
  VD_DAY_MINUTES,
  VdIsoDate,
  VdScheduleEvent,
  VdScheduleEventChange,
  VdScheduleItem,
  VdSchedulePlacement,
  VdScheduleView,
  vdScheduleDate,
  vdScheduleDays,
  vdScheduleItems,
  vdScheduleLayout,
  vdScheduleMinutes,
  vdScheduleMove,
  vdScheduleOnDay,
  vdScheduleResize,
  vdScheduleSnap,
  vdScheduleStep,
  vdScheduleTimeOfDay,
  vdScheduleValid,
} from './core/schedule';

/** A click on empty space: a day (month) or a day and snapped time (week/day). */
export interface VdScheduleSlot {
  readonly date: VdIsoDate;
  /** "HH:mm", or null for a whole day. */
  readonly time: string | null;
}

interface Drag {
  pointer: number;
  element: HTMLElement;
  item: VdScheduleItem;
  kind: 'move' | 'resize';
  events: readonly VdScheduleEvent[];
  x: number;
  y: number;
  /** Date and minute (time grid) under the pointer when the drag started. */
  origin: { date: VdIsoDate; minute: number } | null;
  active: boolean;
}

interface Preview {
  change: VdScheduleEventChange;
  item: VdScheduleItem;
}

/**
 * Month, week, day and agenda views of application-owned events. The schedule never edits
 * `events`: dragging or resizing emits `eventChange` requests that the application applies
 * (for example with `vdScheduleApplyChange`). Spec: specs/schedule.md
 */
@Component({
  selector: 'vd-schedule',
  imports: [VdButton, VdIcon],
  template: `
    <div class="vd-schedule__toolbar">
      <div class="vd-schedule__nav">
        <button vdButton size="sm" variant="secondary" type="button" (click)="goToday()">
          {{ t().todayText }}
        </button>
        <button
          vdButton
          size="sm"
          variant="ghost"
          iconOnly
          type="button"
          [attr.aria-label]="t().previousLabel"
          (click)="step(-1)"
        >
          <vd-icon name="chevron-left" />
        </button>
        <button
          vdButton
          size="sm"
          variant="ghost"
          iconOnly
          type="button"
          [attr.aria-label]="t().nextLabel"
          (click)="step(1)"
        >
          <vd-icon name="chevron-right" />
        </button>
        <p class="vd-schedule__title" [id]="baseId + '-title'" aria-live="polite">{{ title() }}</p>
      </div>
      @if (views().length > 1) {
        <div class="vd-schedule__views" role="group" [attr.aria-label]="t().viewLabel">
          @for (option of views(); track option) {
            <button
              vdButton
              size="sm"
              type="button"
              [variant]="option === view() ? 'secondary' : 'ghost'"
              [attr.aria-pressed]="option === view()"
              (click)="view.set(option)"
            >
              {{ viewText(option) }}
            </button>
          }
        </div>
      }
    </div>

    @if (!valid()) {
      <p class="vd-schedule__invalid">{{ t().invalidText }}</p>
    } @else {
      @switch (view()) {
        @case ('month') {
          <table class="vd-schedule__month" [attr.aria-labelledby]="baseId + '-title'">
            <thead>
              <tr>
                @for (name of weekdays(); track $index) {
                  <th scope="col">
                    <abbr [attr.title]="name.long">{{ name.short }}</abbr>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (week of weeks(); track week[0]) {
                <tr>
                  @for (day of week; track day) {
                    <td
                      class="vd-schedule__cell"
                      [attr.data-date]="day"
                      [attr.data-outside]="!sameMonth(day) ? '' : null"
                      [attr.data-today]="day === today() ? '' : null"
                      [attr.data-drop-target]="
                        preview()?.change?.start?.slice(0, 10) === day ? '' : null
                      "
                    >
                      <button
                        type="button"
                        class="vd-schedule__day"
                        [attr.tabindex]="day === focusDate() ? 0 : -1"
                        [attr.aria-label]="dayLabel(day)"
                        [attr.aria-current]="day === today() ? 'date' : null"
                        (click)="openDay(day)"
                        (focus)="focusDate.set(day)"
                      >
                        {{ dayNumber(day) }}
                        @if (month().has(day)) {
                          <span class="vd-schedule__dot" aria-hidden="true"></span>
                        }
                      </button>
                      @let cell = month().get(day);
                      @if (cell) {
                        <ul class="vd-schedule__chips" role="list">
                          @for (item of cell.visible; track item.event.id) {
                            <li>
                              <button
                                type="button"
                                class="vd-schedule__event"
                                [attr.tabindex]="day === focusDate() ? 0 : -1"
                                [attr.data-color]="item.event.color ?? 'accent'"
                                [attr.data-all-day]="item.allDay ? '' : null"
                                [attr.data-dragging]="draggingId() === item.event.id ? '' : null"
                                [attr.aria-label]="eventLabel(item)"
                                (click)="activate(item.event)"
                                (pointerdown)="dragStart($event, item, 'move')"
                                (pointermove)="dragMove($event)"
                                (pointerup)="dragEnd($event)"
                                (pointercancel)="dragCancel($event)"
                                (lostpointercapture)="dragCancel($event)"
                              >
                                @if (!item.allDay && item.startDate === day) {
                                  <span class="vd-schedule__time">{{ time(item.startMin) }}</span>
                                }
                                <span class="vd-schedule__name">{{ item.event.title }}</span>
                              </button>
                            </li>
                          }
                          @if (cell.more) {
                            <li>
                              <button
                                type="button"
                                class="vd-schedule__more"
                                [attr.tabindex]="day === focusDate() ? 0 : -1"
                                (click)="openDay(day)"
                              >
                                {{ t().moreText(cell.more) }}
                              </button>
                            </li>
                          }
                        </ul>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
        @case ('agenda') {
          <div class="vd-schedule__agenda" [attr.aria-labelledby]="baseId + '-title'" role="region">
            @for (group of agenda(); track group.date; let g = $index) {
              <section
                class="vd-schedule__agenda-day"
                [attr.aria-labelledby]="baseId + '-agenda-' + g"
              >
                <p
                  class="vd-schedule__agenda-date"
                  [id]="baseId + '-agenda-' + g"
                  [attr.data-today]="group.date === today() ? '' : null"
                >
                  {{ longDate(group.date) }}
                </p>
                <ul class="vd-schedule__agenda-list" role="list">
                  @for (item of group.items; track item.event.id) {
                    <li>
                      <button
                        type="button"
                        class="vd-schedule__agenda-event"
                        [attr.data-color]="item.event.color ?? 'accent'"
                        (click)="activate(item.event)"
                      >
                        <span class="vd-schedule__agenda-time">{{
                          rangeText(item, group.date)
                        }}</span>
                        <span class="vd-schedule__name">{{ item.event.title }}</span>
                      </button>
                    </li>
                  }
                </ul>
              </section>
            } @empty {
              <p class="vd-schedule__empty">{{ t().emptyText }}</p>
            }
          </div>
        }
        @default {
          <div
            class="vd-schedule__timegrid"
            [attr.data-view]="view()"
            [style.--vd-schedule-days]="days().length"
          >
            <div class="vd-schedule__head">
              <span class="vd-schedule__gutter"></span>
              @for (day of days(); track day) {
                <button
                  type="button"
                  class="vd-schedule__colhead"
                  [attr.data-today]="day === today() ? '' : null"
                  [attr.aria-label]="dayLabel(day)"
                  [attr.aria-current]="day === today() ? 'date' : null"
                  (click)="openDay(day)"
                >
                  <span class="vd-schedule__weekday">{{ weekdayShort(day) }}</span>
                  <span class="vd-schedule__date">{{ dayNumber(day) }}</span>
                </button>
              }
            </div>
            <div class="vd-schedule__allday">
              <span class="vd-schedule__gutter vd-schedule__allday-label">{{
                t().allDayText
              }}</span>
              @for (day of days(); track day) {
                <div
                  class="vd-schedule__allday-cell"
                  [attr.data-date]="day"
                  [attr.data-drop-target]="
                    preview()?.item?.allDay && preview()?.change?.start === day ? '' : null
                  "
                >
                  @for (item of allDay(day); track item.event.id) {
                    <button
                      type="button"
                      class="vd-schedule__event"
                      data-all-day
                      [attr.data-color]="item.event.color ?? 'accent'"
                      [attr.data-dragging]="draggingId() === item.event.id ? '' : null"
                      [attr.aria-label]="eventLabel(item)"
                      (click)="activate(item.event)"
                      (pointerdown)="dragStart($event, item, 'move')"
                      (pointermove)="dragMove($event)"
                      (pointerup)="dragEnd($event)"
                      (pointercancel)="dragCancel($event)"
                      (lostpointercapture)="dragCancel($event)"
                    >
                      <span class="vd-schedule__name">{{ item.event.title }}</span>
                    </button>
                  }
                </div>
              }
            </div>
            <div
              class="vd-schedule__scroll"
              role="region"
              tabindex="0"
              [attr.aria-labelledby]="baseId + '-title'"
            >
              <div class="vd-schedule__grid" [style.--vd-schedule-hours]="hours().length">
                <div class="vd-schedule__hours" aria-hidden="true">
                  @for (hour of hours(); track hour) {
                    <span class="vd-schedule__hour">{{ hourLabel(hour) }}</span>
                  }
                </div>
                @for (day of days(); track day) {
                  <div
                    class="vd-schedule__column"
                    [attr.data-date]="day"
                    [attr.data-today]="day === today() ? '' : null"
                  >
                    @for (p of layout().get(day); track p.item.event.id) {
                      <button
                        type="button"
                        class="vd-schedule__block"
                        [attr.data-color]="p.item.event.color ?? 'accent'"
                        [attr.data-dragging]="draggingId() === p.item.event.id ? '' : null"
                        [attr.data-clipped-start]="p.clippedStart ? '' : null"
                        [attr.data-clipped-end]="p.clippedEnd ? '' : null"
                        [attr.data-short]="p.bottom - p.top < 45 ? '' : null"
                        [style.--vd-schedule-top]="p.top"
                        [style.--vd-schedule-span]="p.bottom - p.top"
                        [style.--vd-schedule-col]="p.column"
                        [style.--vd-schedule-cols]="p.columns"
                        [attr.aria-label]="eventLabel(p.item)"
                        (click)="activate(p.item.event)"
                        (pointerdown)="dragStart($event, p.item, 'move')"
                        (pointermove)="dragMove($event)"
                        (pointerup)="dragEnd($event)"
                        (pointercancel)="dragCancel($event)"
                        (lostpointercapture)="dragCancel($event)"
                      >
                        <span class="vd-schedule__name">{{ p.item.event.title }}</span>
                        <span class="vd-schedule__time">{{ rangeText(p.item, day) }}</span>
                        @if (editable() && !p.clippedEnd) {
                          <span
                            class="vd-schedule__resize"
                            aria-hidden="true"
                            (pointerdown)="dragStart($event, p.item, 'resize')"
                          ></span>
                        }
                      </button>
                    }
                    @if (preview(); as pv) {
                      @if (ghost(day); as g) {
                        <span
                          class="vd-schedule__preview"
                          aria-hidden="true"
                          [style.--vd-schedule-top]="g.top"
                          [style.--vd-schedule-span]="g.span"
                        >
                          {{ time(g.startMin) }}
                        </span>
                      }
                    }
                    @if (nowLine(day); as line) {
                      <span
                        class="vd-schedule__now"
                        aria-hidden="true"
                        [style.--vd-schedule-top]="line"
                      ></span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }
    }
    <p class="vd-visually-hidden" role="status" aria-atomic="true">
      @for (message of messages(); track message.serial) {
        <span>{{ message.text }}</span>
      }
    </p>
  `,
  host: {
    class: 'vd-schedule',
    '[attr.data-view]': 'view()',
    '[attr.data-state]': '!valid() ? "invalid" : draggingId() ? "dragging" : "idle"',
    '(keydown)': 'key($event)',
    '(click)': 'emptyClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSchedule<E extends VdScheduleEvent = VdScheduleEvent> {
  readonly events = input<readonly E[]>([]);
  readonly view = model<VdScheduleView>('month');
  /** Any date inside the shown period ("YYYY-MM-DD"). Defaults to today. */
  readonly date = model<VdIsoDate>(vdToday());
  readonly views = input<readonly VdScheduleView[]>(['month', 'week', 'day', 'agenda']);
  /** BCP 47 locale for names, week start, dates and times. Defaults to the app's LOCALE_ID. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** 0 = Sunday ... 6 = Saturday. Defaults to the locale's week start. */
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  /** Visible hours in week/day views. */
  readonly dayStartHour = input(0, { transform: numberAttribute });
  readonly dayEndHour = input(24, { transform: numberAttribute });
  /** Hour scrolled into view when a week/day view appears. */
  readonly scrollToHour = input(8, { transform: numberAttribute });
  /** Snapping step for dragging, resizing and empty-slot clicks, in minutes. */
  readonly slotMinutes = input(30, { transform: numberAttribute });
  readonly maxEventsPerDay = input(3, { transform: numberAttribute });
  readonly agendaDays = input(14, { transform: numberAttribute });
  /** Current local time "YYYY-MM-DDTHH:mm" for the now line; omit to hide it. */
  readonly now = input<string | null>(null);
  /** Allows dragging and resizing (pointer). Activation and slot clicks always work. */
  readonly editable = input(true, { transform: booleanAttribute });

  readonly label = input<string>();
  readonly todayText = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  readonly viewLabel = input<string>();
  readonly monthText = input<string>();
  readonly weekText = input<string>();
  readonly dayText = input<string>();
  readonly agendaText = input<string>();
  readonly allDayText = input<string>();
  readonly emptyText = input<string>();
  readonly invalidText = input<string>();
  readonly moreText = input<(count: number) => string>();
  readonly eventsText = input<(count: number) => string>();
  readonly changedText = input<(title: string, when: string) => string>();
  readonly canceledText = input<(title: string) => string>();

  /** An event was clicked or activated with the keyboard (open it, edit it...). */
  readonly eventActivate = output<E>();
  /** Empty space was clicked (create an event there). */
  readonly slotActivate = output<VdScheduleSlot>();
  /** A drag or resize asks to change an event's time. Apply it to `events` or ignore it. */
  readonly eventChange = output<VdScheduleEventChange>();

  protected readonly t = vdTexts('schedule', {
    label: this.label,
    todayText: this.todayText,
    previousLabel: this.previousLabel,
    nextLabel: this.nextLabel,
    viewLabel: this.viewLabel,
    monthText: this.monthText,
    weekText: this.weekText,
    dayText: this.dayText,
    agendaText: this.agendaText,
    allDayText: this.allDayText,
    emptyText: this.emptyText,
    invalidText: this.invalidText,
    moreText: this.moreText,
    eventsText: this.eventsText,
    changedText: this.changedText,
    canceledText: this.canceledText,
  });

  protected readonly baseId = vdUniqueId('vd-schedule');
  protected readonly today = computed(() => this.now()?.slice(0, 10) ?? vdToday());
  protected readonly valid = computed(() => vdScheduleValid(this.events()));
  protected readonly items = computed(() => (this.valid() ? vdScheduleItems(this.events()) : []));
  protected readonly firstDay = computed(
    () => this.firstDayOfWeek() ?? vdFirstDayOfWeek(this.locale()),
  );
  protected readonly days = computed(() =>
    vdScheduleDays(this.view(), this.date(), this.firstDay(), this.agendaDays()),
  );
  protected readonly weeks = computed(() => {
    const days = this.days();
    return Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  });
  protected readonly weekdays = computed(() => {
    const short = vdWeekdayNames(this.locale(), this.firstDay(), 'short');
    const long = vdWeekdayNames(this.locale(), this.firstDay(), 'long');
    return short.map((s, i) => ({ short: s, long: long[i] }));
  });
  protected readonly hours = computed(() => {
    const from = Math.max(0, Math.min(23, this.dayStartHour()));
    const to = Math.max(from + 1, Math.min(24, this.dayEndHour()));
    return Array.from({ length: to - from }, (_, i) => from + i);
  });
  /** Month cells: visible events and the overflow count per day. */
  protected readonly month = computed(() => {
    const map = new Map<VdIsoDate, { visible: VdScheduleItem<E>[]; more: number }>();
    if (this.view() !== 'month') return map;
    const max = Math.max(1, this.maxEventsPerDay());
    for (const day of this.days()) {
      const all = vdScheduleOnDay(this.items(), day);
      if (!all.length) continue;
      const visible = all.length > max ? all.slice(0, max - 1) : all;
      map.set(day, { visible, more: all.length - visible.length });
    }
    return map;
  });
  protected readonly layout = computed(() => {
    const map = new Map<VdIsoDate, VdSchedulePlacement<E>[]>();
    const from = this.hours()[0] * 60,
      to = (this.hours().at(-1)! + 1) * 60;
    for (const day of this.days()) map.set(day, vdScheduleLayout(this.items(), day, from, to));
    return map;
  });
  protected readonly agenda = computed(() =>
    this.days()
      .map((date) => ({ date, items: vdScheduleOnDay(this.items(), date) }))
      .filter((group) => group.items.length),
  );
  protected readonly title = computed(() => {
    const days = this.days(),
      locale = this.locale();
    switch (this.view()) {
      case 'month':
        return vdFormatDate(this.date(), locale, { month: 'long', year: 'numeric' });
      case 'day':
        return this.longDate(this.date());
      default: {
        const format = new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });
        return format.formatRange(new Date(days[0]), new Date(days.at(-1)!));
      }
    }
  });

  protected readonly focusDate = signal<VdIsoDate>(this.date());
  protected readonly draggingId = signal<string | null>(null);
  protected readonly preview = signal<Preview | null>(null);
  protected readonly messages = signal<readonly { serial: number; text: string }[]>([]);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private drag: Drag | null = null;
  private moveFocus = false;
  private suppressClick = false;
  private serial = 0;
  private scrolledView: string | null = null;

  constructor() {
    // Keep the roving day inside the shown month.
    effect(() => {
      const days = this.days();
      const focus = this.focusDate();
      if (this.view() === 'month' && !days.includes(focus)) {
        this.focusDate.set(days.includes(this.date()) ? this.date() : days[7]);
      }
    });
    effect(() => {
      const events = this.events();
      if (this.drag && events !== this.drag.events) this.finish(true);
    });
    afterRenderEffect(() => {
      const focus = this.focusDate();
      if (!this.moveFocus) return;
      this.moveFocus = false;
      this.host
        .querySelector<HTMLElement>(`.vd-schedule__cell[data-date="${focus}"] .vd-schedule__day`)
        ?.focus();
    });
    // Scroll the time grid to `scrollToHour` once per view/period.
    afterRenderEffect(() => {
      const key = this.view() + this.days()[0];
      if (this.view() !== 'week' && this.view() !== 'day') return;
      if (this.scrolledView === key) return;
      this.scrolledView = key;
      const scroller = this.host.querySelector<HTMLElement>('.vd-schedule__scroll');
      const grid = this.host.querySelector<HTMLElement>('.vd-schedule__grid');
      if (!scroller || !grid) return;
      const offset = Math.max(0, this.scrollToHour() - this.hours()[0]);
      scroller.scrollTop = (grid.scrollHeight / this.hours().length) * offset;
    });
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.finish(false));
    afterNextRender(() => {
      const click = (event: Event) => {
        if (!this.suppressClick) return;
        this.suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      };
      // A new press starts fresh, so a release outside the board never swallows a later click.
      const press = () => (this.suppressClick = false);
      this.host.addEventListener('click', click, true);
      this.host.addEventListener('pointerdown', press, true);
      destroyRef.onDestroy(() => {
        this.host.removeEventListener('click', click, true);
        this.host.removeEventListener('pointerdown', press, true);
      });
    });
  }

  // ------------------------------------------------------------------ navigation

  protected goToday(): void {
    this.date.set(this.today());
    this.focusDate.set(this.today());
  }

  protected step(direction: 1 | -1): void {
    const next = vdScheduleStep(this.view(), this.date(), direction, this.agendaDays());
    this.date.set(next);
    this.focusDate.set(next);
  }

  protected openDay(date: VdIsoDate): void {
    this.date.set(date);
    this.focusDate.set(date);
    if (this.views().includes('day')) this.view.set('day');
  }

  private monthKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('vd-schedule__day')) return;
    const rtl =
      this.host.ownerDocument.defaultView?.getComputedStyle(this.host).direction === 'rtl';
    const next = vdCalendarKey(event.key, this.focusDate(), {
      firstDay: this.firstDay(),
      rtl,
      shift: event.shiftKey,
    });
    if (!next) return;
    event.preventDefault();
    if (!this.days().includes(next)) this.date.set(next);
    this.focusDate.set(next);
    this.moveFocus = true;
  }

  // ---------------------------------------------------------------- activation

  protected activate(event: E): void {
    this.eventActivate.emit(event);
  }

  /**
   * Pointer convenience on empty space (keyboard users create events with the application's own
   * controls): a month cell or all-day cell gives a day, a time-grid column a snapped time.
   */
  protected emptyClick(event: MouseEvent): void {
    const target = event.target as Element;
    if (target.closest('button')) return;
    const cell = target.closest<HTMLElement>('.vd-schedule__cell, .vd-schedule__allday-cell');
    if (cell) {
      this.slotActivate.emit({ date: cell.dataset['date']!, time: null });
      return;
    }
    const column = target.closest<HTMLElement>('.vd-schedule__column');
    if (column) this.slotClick(event, column, column.dataset['date']!);
  }

  private slotClick(event: MouseEvent, column: HTMLElement, date: VdIsoDate): void {
    const minute = this.minuteAt(column, event.clientY);
    const snapped = Math.min(
      VD_DAY_MINUTES - this.slot(),
      Math.floor(minute / this.slot()) * this.slot(),
    );
    this.slotActivate.emit({ date, time: this.clock(snapped) });
  }

  // ------------------------------------------------------------------ dragging

  protected dragStart(event: PointerEvent, item: VdScheduleItem<E>, kind: 'move' | 'resize'): void {
    if (
      !this.editable() ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.pointerType === 'touch' ||
      this.drag
    )
      return;
    if (kind === 'resize') event.stopPropagation();
    const element = (
      kind === 'resize'
        ? (event.currentTarget as HTMLElement).closest('.vd-schedule__block')
        : event.currentTarget
    ) as HTMLElement;
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    event.preventDefault();
    this.drag = {
      pointer: event.pointerId,
      element,
      item,
      kind,
      events: this.events(),
      x: event.clientX,
      y: event.clientY,
      origin: this.pointAt(event.clientX, event.clientY, item.allDay),
      active: false,
    };
  }

  protected dragMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    if (event.buttons === 0) {
      this.finish(false);
      return;
    }
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
    if (!drag.active) {
      drag.active = true;
      if (!drag.element.contains(this.host.ownerDocument.activeElement))
        drag.element.focus({ preventScroll: true });
      this.draggingId.set(drag.item.event.id);
    }
    const change = this.changeAt(drag, event.clientX, event.clientY);
    this.preview.set(change ? { change, item: drag.item } : null);
  }

  protected dragEnd(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const change = drag.active ? this.changeAt(drag, event.clientX, event.clientY) : null;
    this.suppressClick = drag.active;
    this.finish(drag.active && !change);
    if (change) {
      this.announce(this.t().changedText(drag.item.event.title, this.whenText(change)));
      this.eventChange.emit(change);
    }
  }

  protected dragCancel(event: PointerEvent): void {
    if (event.pointerId === this.drag?.pointer) this.finish(!!this.drag?.active);
  }

  protected key(event: KeyboardEvent): void {
    if (!this.drag) {
      if (this.view() === 'month') this.monthKey(event);
      return;
    }
    if (event.isComposing) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      // The button release that follows must not create or open anything.
      this.suppressClick = this.drag.active;
      this.finish(true);
    }
  }

  /** The change a pointer position asks for, or null when it changes nothing. */
  private changeAt(drag: Drag, x: number, y: number): VdScheduleEventChange | null {
    const point = this.pointAt(x, y, drag.item.allDay);
    if (!point || !drag.origin) return null;
    const dayDelta =
      (vdScheduleMinutes(point.date)! - vdScheduleMinutes(drag.origin.date)!) / VD_DAY_MINUTES;
    let change: VdScheduleEventChange;
    if (drag.kind === 'resize') {
      const end = vdScheduleMinutes(point.date)! + vdScheduleSnap(point.minute, this.slot());
      change = vdScheduleResize(drag.item, end, this.slot());
    } else if (drag.item.allDay || this.view() === 'month') {
      change = vdScheduleMove(drag.item, dayDelta * VD_DAY_MINUTES);
    } else {
      const minutes = vdScheduleSnap(point.minute - drag.origin.minute, this.slot());
      change = vdScheduleMove(drag.item, dayDelta * VD_DAY_MINUTES + minutes);
    }
    return change.start === drag.item.event.start && change.end === drag.item.event.end
      ? null
      : change;
  }

  /** Date (and minute in time grids) under a viewport point. */
  private pointAt(
    x: number,
    y: number,
    allDay: boolean,
  ): { date: VdIsoDate; minute: number } | null {
    const selector =
      this.view() === 'month'
        ? '.vd-schedule__cell[data-date]'
        : allDay
          ? '.vd-schedule__allday-cell[data-date]'
          : '.vd-schedule__column[data-date]';
    for (const el of Array.from(this.host.querySelectorAll<HTMLElement>(selector))) {
      const r = el.getBoundingClientRect();
      const inside =
        x >= r.left &&
        x <= r.right &&
        (allDay || this.view() === 'month' ? y >= r.top && y <= r.bottom : true);
      if (!inside) continue;
      const minute = this.view() === 'month' || allDay ? 0 : this.minuteAt(el, y);
      return { date: el.dataset['date']!, minute };
    }
    return null;
  }

  /** Minute of the day for a y position inside a time-grid column. */
  private minuteAt(column: HTMLElement, y: number): number {
    const r = column.getBoundingClientRect();
    const from = this.hours()[0] * 60;
    const span = this.hours().length * 60;
    const ratio = Math.max(0, Math.min(1, (y - r.top) / r.height));
    return from + ratio * span;
  }

  private finish(announce: boolean): void {
    const drag = this.drag;
    this.drag = null;
    this.draggingId.set(null);
    this.preview.set(null);
    if (!drag) return;
    if (drag.element.hasPointerCapture?.(drag.pointer))
      drag.element.releasePointerCapture(drag.pointer);
    if (announce && drag.active) this.announce(this.t().canceledText(drag.item.event.title));
  }

  /** Dashed preview of a timed change inside a time-grid column. */
  protected ghost(day: VdIsoDate): { top: number; span: number; startMin: number } | null {
    const pv = this.preview();
    if (!pv || pv.change.allDay || this.view() === 'month') return null;
    const start = vdScheduleMinutes(pv.change.start)!,
      end = vdScheduleMinutes(pv.change.end)!;
    const dayStart = vdScheduleMinutes(day)!;
    const from = dayStart + this.hours()[0] * 60,
      to = dayStart + (this.hours().at(-1)! + 1) * 60;
    if (end <= from || start >= to) return null;
    const top = Math.max(start, from) - from;
    return { top, span: Math.min(end, to) - from - top, startMin: start };
  }

  protected nowLine(day: VdIsoDate): number | null {
    const now = this.now();
    if (!now || now.slice(0, 10) !== day) return null;
    const minute = vdScheduleMinutes(now);
    if (minute === null) return null;
    const offset = vdScheduleTimeOfDay(minute) - this.hours()[0] * 60;
    return offset >= 0 && offset <= this.hours().length * 60 ? offset : null;
  }

  protected allDay(day: VdIsoDate): VdScheduleItem<E>[] {
    return vdScheduleOnDay(this.items(), day).filter((i) => i.allDay);
  }

  // ---------------------------------------------------------------- formatting

  protected viewText(view: VdScheduleView): string {
    const t = this.t();
    return { month: t.monthText, week: t.weekText, day: t.dayText, agenda: t.agendaText }[view];
  }

  protected sameMonth(day: VdIsoDate): boolean {
    return day.slice(0, 7) === this.date().slice(0, 7);
  }

  protected dayNumber(day: VdIsoDate): string {
    return vdFormatDate(day, this.locale(), { day: 'numeric' });
  }

  protected weekdayShort(day: VdIsoDate): string {
    return vdFormatDate(day, this.locale(), { weekday: 'short' });
  }

  protected longDate(day: VdIsoDate): string {
    return vdFormatDate(day, this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  protected dayLabel(day: VdIsoDate): string {
    const count = vdScheduleOnDay(this.items(), day).length;
    return `${this.longDate(day)}, ${this.t().eventsText(count)}`;
  }

  protected time(minutes: number): string {
    return new Intl.DateTimeFormat(this.locale(), {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(minutes * 60000));
  }

  protected hourLabel(hour: number): string {
    return new Intl.DateTimeFormat(this.locale(), { hour: 'numeric', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2026, 0, 1, hour)),
    );
  }

  /** Time range shown for an event on a given day ("All day" for all-day events). */
  protected rangeText(item: VdScheduleItem, day: VdIsoDate): string {
    if (item.allDay) return this.t().allDayText;
    const start = item.startDate === day ? this.time(item.startMin) : '…';
    const end = vdScheduleDate(item.endMin - 1) === day ? this.time(item.endMin) : '…';
    return `${start} – ${end}`;
  }

  protected eventLabel(item: VdScheduleItem): string {
    const date = this.longDate(item.startDate);
    if (item.allDay) {
      const last = item.endDate !== item.startDate ? ` – ${this.longDate(item.endDate)}` : '';
      return `${item.event.title}, ${date}${last}, ${this.t().allDayText}`;
    }
    const end =
      item.endDate !== item.startDate
        ? `${this.longDate(item.endDate)} ${this.time(item.endMin)}`
        : this.time(item.endMin);
    return `${item.event.title}, ${date}, ${this.time(item.startMin)} – ${end}`;
  }

  private whenText(change: VdScheduleEventChange): string {
    if (change.allDay) return this.longDate(change.start);
    const start = vdScheduleMinutes(change.start)!;
    return `${this.longDate(change.start.slice(0, 10))}, ${this.time(start)}`;
  }

  private clock(minutes: number): string {
    const h = Math.floor(minutes / 60),
      m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private slot(): number {
    return Math.max(5, Math.min(120, this.slotMinutes()));
  }

  private announce(text: string): void {
    this.messages.set([{ serial: ++this.serial, text }]);
  }
}
