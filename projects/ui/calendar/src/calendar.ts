import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import {
  VdCalendarDay,
  VdIsoDate,
  vdAddDays,
  vdAddMonths,
  vdCalendarKey,
  vdClampDate,
  vdFirstDayOfWeek,
  vdFormatDate,
  vdMonthGrid,
  vdToday,
  vdWeekdayNames,
} from './core/date';
import { vdTexts } from '@vadem/ui/locale';

/**
 * Month grid for picking one date (APG date picker grid). Arrows, Home/End, PageUp/PageDown
 * (Shift: by year), Enter/Space to choose. Value is an ISO date string. Spec: specs/calendar.md
 */
@Component({
  selector: 'vd-calendar',
  imports: [VdIcon],
  template: `
    <div class="vd-calendar__header">
      <button
        type="button"
        class="vd-calendar__nav"
        [attr.aria-label]="t().previousLabel"
        [disabled]="!canGoBack()"
        (click)="shiftMonth(-1)"
      >
        <vd-icon name="chevron-left" />
      </button>
      <span class="vd-calendar__title" [id]="titleId" aria-live="polite">{{ title() }}</span>
      <button
        type="button"
        class="vd-calendar__nav"
        [attr.aria-label]="t().nextLabel"
        [disabled]="!canGoForward()"
        (click)="shiftMonth(1)"
      >
        <vd-icon name="chevron-right" />
      </button>
    </div>
    <!-- Keys bubble from the focused cell (roving tabindex); the table only delegates. -->
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <table
      class="vd-calendar__grid"
      role="grid"
      [attr.aria-labelledby]="titleId"
      [attr.aria-multiselectable]="selectionMode() === 'range' ? true : null"
      (keydown)="onKey($event)"
    >
      <thead>
        <tr>
          @for (name of weekdays(); track $index) {
            <th scope="col" [attr.abbr]="weekdaysLong()[$index]">{{ name }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (week of grid(); track week[0].date) {
          <tr>
            @for (day of week; track day.date) {
              <td
                role="gridcell"
                class="vd-calendar__day"
                [attr.data-date]="day.date"
                [attr.tabindex]="day.date === focused() ? 0 : -1"
                [attr.aria-selected]="isSelected(day.date)"
                [attr.data-range-start]="
                  selectionMode() === 'range' && day.date === rangeStart() ? '' : null
                "
                [attr.data-range-end]="
                  selectionMode() === 'range' && day.date === rangeEnd() ? '' : null
                "
                [attr.data-in-range]="
                  selectionMode() === 'range' && isSelected(day.date) ? '' : null
                "
                [attr.aria-disabled]="isDisabled(day.date) || null"
                [attr.aria-current]="day.date === today ? 'date' : null"
                [attr.aria-label]="dayLabel(day)"
                [attr.data-outside]="day.inMonth ? null : ''"
                (focus)="onDayFocus(day.date, $event)"
                (click)="choose(day.date)"
              >
                {{ numbers().format(day.day) }}
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  host: { class: 'vd-calendar' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdCalendar {
  /** Selected date, "YYYY-MM-DD" (two-way). */
  readonly value = model<VdIsoDate | null>(null);
  readonly selectionMode = input<'single' | 'range'>('single');
  readonly rangeStart = input<VdIsoDate | null>(null);
  readonly rangeEnd = input<VdIsoDate | null>(null);
  /** Every explicit available date activation, including repeated same-day choices. */
  readonly dateSelected = output<VdIsoDate>();
  readonly min = input<VdIsoDate | null>(null);
  readonly max = input<VdIsoDate | null>(null);
  /** Extra rule for unavailable dates (weekends, booked days...). */
  readonly dateDisabled = input<(date: VdIsoDate) => boolean>(() => false);
  /** BCP 47 locale for names, week start and labels. Defaults to the app's LOCALE_ID. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** 0 = Sunday ... 6 = Saturday. Defaults to the locale's week start. */
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('calendar', {
    previousLabel: this.previousLabel,
    nextLabel: this.nextLabel,
  });

  protected readonly today = vdToday();
  protected readonly titleId = vdUniqueId('vd-calendar-title');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  private readonly initialDate = computed(() =>
    this.nearestAvailable(
      vdClampDate(this.value() ?? this.rangeStart() ?? this.today, this.min(), this.max()),
    ),
  );
  /** The date that has (or would get) keyboard focus. */
  readonly focused = linkedSignal(() => this.initialDate());
  // Focus alone must not replace an adjacent-month cell between pointerdown and click.
  private readonly displayed = linkedSignal(() => this.initialDate());
  /** Set when the keyboard moved focus, so the grid moves DOM focus after rendering. */
  private readonly focusRequested = signal(false);

  protected readonly firstDay = computed(
    () => this.firstDayOfWeek() ?? vdFirstDayOfWeek(this.locale()),
  );
  protected readonly grid = computed(() => vdMonthGrid(this.displayed(), this.firstDay()));
  /** Short names, or narrow ones where "short" is a whole word (e.g. Arabic). */
  protected readonly weekdays = computed(() => {
    const short = vdWeekdayNames(this.locale(), this.firstDay(), 'short');
    return short.some((name) => name.length > 3)
      ? vdWeekdayNames(this.locale(), this.firstDay(), 'narrow')
      : short;
  });
  private readonly numbers = computed(() => new Intl.NumberFormat(this.locale()));
  protected readonly weekdaysLong = computed(() =>
    vdWeekdayNames(this.locale(), this.firstDay(), 'long'),
  );
  protected readonly title = computed(() =>
    vdFormatDate(this.displayed(), this.locale(), { month: 'long', year: 'numeric' }),
  );
  protected readonly canGoBack = computed(() => {
    const min = this.min();
    return !min || this.displayed().slice(0, 7) > min.slice(0, 7);
  });
  protected readonly canGoForward = computed(() => {
    const max = this.max();
    return !max || this.displayed().slice(0, 7) < max.slice(0, 7);
  });

  constructor() {
    afterRenderEffect(() => {
      const date = this.focused();
      if (!this.focusRequested()) return;
      this.focusRequested.set(false);
      this.el.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
    });
  }

  /** Moves DOM focus to the focused date (e.g. when a date picker opens). */
  focus(): void {
    this.displayed.set(this.focused());
    this.focusRequested.set(true);
  }

  isSelected(date: VdIsoDate): boolean {
    if (this.selectionMode() === 'single') return date === this.value();
    const start = this.rangeStart();
    return !!start && date >= start && date <= (this.rangeEnd() ?? start);
  }

  isDisabled(date: VdIsoDate): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && date < min) || (!!max && date > max) || this.dateDisabled()(date);
  }

  /** The date itself if available, else the closest available one (forward first, within a year). */
  private nearestAvailable(date: VdIsoDate): VdIsoDate {
    if (!this.isDisabled(date)) return date;
    for (let i = 1; i <= 366; i++) {
      const after = vdAddDays(date, i);
      if (!this.isDisabled(after)) return after;
      const before = vdAddDays(date, -i);
      if (!this.isDisabled(before)) return before;
    }
    return date;
  }

  protected dayLabel(day: VdCalendarDay): string {
    return vdFormatDate(day.date, this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  protected onDayFocus(date: VdIsoDate, event: FocusEvent): void {
    (event.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    if (date === this.focused()) return;
    this.focused.set(date);
  }

  protected choose(date: VdIsoDate): void {
    if (this.isDisabled(date)) return;
    this.focused.set(date);
    this.displayed.set(date);
    if (this.selectionMode() === 'single') this.value.set(date);
    this.dateSelected.emit(date);
  }

  protected shiftMonth(months: number): void {
    const date = vdClampDate(vdAddMonths(this.displayed(), months), this.min(), this.max());
    this.focused.set(date);
    this.displayed.set(date);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.choose(this.focused());
      return;
    }
    const rtl = this.el.ownerDocument.defaultView?.getComputedStyle(this.el).direction === 'rtl';
    const next = vdCalendarKey(event.key, this.focused(), {
      firstDay: this.firstDay(),
      rtl,
      shift: event.shiftKey,
    });
    if (!next) return;
    event.preventDefault();
    this.focused.set(vdClampDate(next, this.min(), this.max()));
    this.displayed.set(this.focused());
    this.focusRequested.set(true);
  }
}
