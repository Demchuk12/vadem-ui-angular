import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  LOCALE_ID,
  OnInit,
  Signal,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField, FormValueControl, transformedValue } from '@angular/forms/signals';
import {
  VD_FIELD,
  VdFieldControl,
  VdNgControlState,
  vdNgControlState,
  vdUniqueId,
} from '@vadem/ui/field';
import { VdCalendar, vdClampDate, vdFormatShort, vdParseIso, vdToday } from '@vadem/ui/calendar';
import { VdPopover } from '@vadem/ui/popover';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import {
  VdDateRange,
  vdRangeAllowed,
  vdRangeBetween,
  vdValidRange,
  vdParseRangeDate,
} from './core/range';
import { vdTexts } from '@vadem/ui/locale';
export type VdDateRangePickerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'vd-date-range-picker',
  imports: [VdCalendar, VdPopover, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-date-range-picker',
    '[attr.data-size]': 'size()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-open]': 'open() ? "" : null',
    '(focusout)': 'leaveControl($event)',
  },
  template: `
    <div class="vd-date-range-picker__fields" role="group" [attr.aria-label]="t().groupLabel">
      <div class="vd-date-range-picker__field">
        <label [for]="controlId">{{ t().startLabel }}</label>
        <input
          #start
          class="vd-input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [id]="controlId"
          [attr.data-size]="size()"
          [value]="startText()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="isRequired()"
          [attr.aria-invalid]="showInvalid() || null"
          [attr.data-invalid]="showInvalid() ? '' : null"
          [attr.aria-describedby]="describedBy()"
          (input)="edit($event, 'start')"
          (blur)="commitText()"
          (keydown)="inputKey($event)"
        />
      </div>
      <div class="vd-date-range-picker__field">
        <label [for]="endId">{{ t().endLabel }}</label>
        <input
          #end
          class="vd-input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          [id]="endId"
          [attr.data-size]="size()"
          [value]="endText()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="isRequired()"
          [attr.aria-invalid]="showInvalid() || null"
          [attr.data-invalid]="showInvalid() ? '' : null"
          [attr.aria-describedby]="describedBy()"
          (input)="edit($event, 'end')"
          (blur)="commitText()"
          (keydown)="inputKey($event)"
        />
      </div>
      <button
        #trigger
        vdButton
        type="button"
        variant="secondary"
        iconOnly
        [size]="size()"
        [disabled]="locked()"
        class="vd-date-range-picker__trigger"
        [attr.aria-label]="t().openLabel"
        aria-haspopup="dialog"
        [attr.aria-controls]="popup.id"
        [attr.aria-expanded]="open()"
        (pointerdown)="rememberState()"
        (click)="toggle()"
      >
        <vd-icon name="calendar" />
      </button>
    </div>
    @if (parseError()) {
      <p class="vd-date-range-picker__error" [id]="errorId">
        <vd-icon name="alert-circle" />{{ t().errorLabel }}
      </p>
    }
    <div
      vdPopover
      #popup="vdPopover"
      class="vd-date-range-picker__popup"
      [attr.aria-label]="t().pickerLabel"
      (toggle)="onToggle($event)"
      (focusout)="leavePopup($event)"
    >
      <p class="vd-date-range-picker__instruction" role="status">
        {{ selectingEnd() ? t().endInstruction : t().startInstruction }}
      </p>
      <vd-calendar
        selectionMode="range"
        [rangeStart]="draftStart()"
        [rangeEnd]="draftEnd()"
        [min]="safeMin()"
        [max]="safeMax()"
        [dateDisabled]="unavailable"
        [locale]="locale()"
        [firstDayOfWeek]="firstDayOfWeek()"
        [previousLabel]="t().previousLabel"
        [nextLabel]="t().nextLabel"
        (dateSelected)="pick($event)"
      />
      @if (draftStart()) {
        <p class="vd-date-range-picker__summary">
          {{ t().startLabel }}: {{ format(draftStart()) }}<br />{{ t().endLabel }}:
          {{ draftEnd() ? format(draftEnd()) : '—' }}
        </p>
      }
    </div>
  `,
})
export class VdDateRangePicker implements FormValueControl<VdDateRange | null>, OnInit {
  readonly value = model<VdDateRange | null>(null);
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly locale = input(inject(LOCALE_ID));
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  readonly size = input<VdDateRangePickerSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly groupLabel = input<string>();
  readonly startLabel = input<string>();
  readonly endLabel = input<string>();
  readonly openLabel = input<string>();
  readonly pickerLabel = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  readonly startInstruction = input<string>();
  readonly endInstruction = input<string>();
  readonly errorLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('dateRangePicker', {
    groupLabel: this.groupLabel,
    startLabel: this.startLabel,
    endLabel: this.endLabel,
    openLabel: this.openLabel,
    pickerLabel: this.pickerLabel,
    previousLabel: this.previousLabel,
    nextLabel: this.nextLabel,
    startInstruction: this.startInstruction,
    endInstruction: this.endInstruction,
    errorLabel: this.errorLabel,
  });
  readonly touch = output<void>();
  readonly controlId = vdUniqueId('vd-date-range-picker');
  protected readonly endId = `${this.controlId}-end`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly safeMin = computed(() => (vdParseIso(this.minDate()) ? this.minDate() : null));
  protected readonly safeMax = computed(() => (vdParseIso(this.maxDate()) ? this.maxDate() : null));
  private readonly range = computed(() => vdValidRange(this.value()));
  private readonly raw = transformedValue<
    VdDateRange | null,
    { start: string; end: string; commit: boolean }
  >(this.value, {
    format: (value) => {
      const range = vdValidRange(value);
      return {
        start: this.format(range?.start ?? null),
        end: this.format(range?.end ?? null),
        commit: true,
      };
    },
    parse: (text) => {
      const start = text.start.trim(),
        end = text.end.trim();
      if (!start && !end) return { value: null };
      const a = vdParseRangeDate(start, this.locale()),
        b = vdParseRangeDate(end, this.locale());
      const range = a && b && a <= b ? { start: a, end: b } : null;
      if (!range || !vdRangeAllowed(range, this.safeMin(), this.safeMax())) {
        return { value: null, error: { kind: 'dateRange', message: this.t().errorLabel } };
      }
      return { value: text.commit ? range : null };
    },
  });
  protected readonly startText = computed(() => this.raw().start);
  protected readonly endText = computed(() => this.raw().end);
  protected readonly placeholder = computed(() => vdFormatShort('2026-12-31', this.locale()));
  private readonly feedback = signal(false);
  protected readonly parseError = computed(
    () => this.feedback() && this.raw.parseErrors().length > 0,
  );
  protected readonly draftStart = signal<string | null>(null);
  protected readonly draftEnd = signal<string | null>(null);
  protected readonly selectingEnd = signal(false);
  protected readonly open = signal(false);
  protected readonly field = inject(VD_FIELD, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly popup = viewChild.required(VdPopover);
  private readonly trigger = viewChild.required('trigger', {
    read: ElementRef,
  });
  private readonly startInput = viewChild.required<ElementRef<HTMLInputElement>>('start');
  focus(options?: FocusOptions): void {
    this.startInput().nativeElement.focus(options);
  }
  private readonly calendar = viewChild.required(VdCalendar);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBound = signal(false);
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly ngState = computed(
    () =>
      this.ngSource()?.() ?? { invalid: false, touched: false, disabled: false, required: false },
  );
  protected readonly isDisabled = computed(() => this.disabled() || this.ngState().disabled);
  protected readonly locked = computed(() => this.isDisabled() || this.readonly());
  protected readonly isRequired = computed(() => this.required() || this.ngState().required);
  private readonly boundsError = computed(
    () =>
      !!this.value() &&
      (!this.range() || !vdRangeAllowed(this.range()!, this.safeMin(), this.safeMax())),
  );
  protected readonly showInvalid = computed(
    () =>
      this.parseError() ||
      this.boundsError() ||
      (this.invalid() && (!this.formBound() || this.touched())) ||
      (this.ngState().invalid && this.ngState().touched),
  );
  protected readonly describedBy = computed(
    () =>
      [this.field?.describedBy(), this.parseError() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );
  protected readonly unavailable = () =>
    this.locked() || (!!this.safeMin() && !!this.safeMax() && this.safeMin()! > this.safeMax()!);
  private wasOpen: boolean | null = null;
  private lastValue: VdDateRange | null | undefined;
  private lastMin: string | null | undefined;
  private lastMax: string | null | undefined;
  private editedValue: VdDateRange | null | undefined;

  constructor() {
    const control: VdFieldControl = {
      id: signal(this.controlId),
      invalid: this.showInvalid,
      required: this.isRequired,
      disabled: this.isDisabled,
    };
    this.field?.register(control);
    this.destroyRef.onDestroy(() => this.field?.unregister(control));
    afterNextRender(() => {
      const anchor = `--${this.popup().id}`;
      this.trigger().nativeElement.style.setProperty('anchor-name', anchor);
      this.popup().el.style.setProperty('position-anchor', anchor);
    });
    afterRenderEffect(() => {
      const value = this.value(),
        min = this.safeMin(),
        max = this.safeMax();
      if (this.lastValue !== undefined && this.lastValue !== value) {
        this.popup().hide();
        if (value !== this.editedValue) this.feedback.set(false);
      }
      if (this.locked() || this.lastMin !== min || this.lastMax !== max) this.popup().hide();
      this.lastValue = value;
      this.lastMin = min;
      this.lastMax = max;
    });
  }
  ngOnInit(): void {
    const ng = this.injector.get(NgControl, null, { self: true, optional: true });
    this.formBound.set(
      !!ng || !!this.injector.get(FormField, null, { self: true, optional: true }),
    );
    this.ngSource.set(vdNgControlState(ng, this.destroyRef));
  }
  protected format(date: string | null): string {
    return date ? vdFormatShort(date, this.locale()) : '';
  }
  protected edit(event: Event, part: 'start' | 'end'): void {
    if (this.locked()) return;
    const text = (event.target as HTMLInputElement).value;
    const start = part === 'start' ? text : this.startText();
    const end = part === 'end' ? text : this.endText();
    this.editedValue = null;
    this.raw.set({ start, end, commit: false });
    this.feedback.set(false);
  }
  protected commitText(incomplete = false): void {
    if (this.locked()) return;
    const start = this.startText().trim(),
      end = this.endText().trim();
    if (!start && !end) {
      this.feedback.set(false);
      this.setRange(null);
      return;
    }
    const a = start ? vdParseRangeDate(start, this.locale()) : null;
    const b = end ? vdParseRangeDate(end, this.locale()) : null;
    const allowed = (date: string) =>
      (!this.safeMin() || date >= this.safeMin()!) && (!this.safeMax() || date <= this.safeMax()!);
    if ((start && (!a || !allowed(a))) || (end && (!b || !allowed(b))) || (a && b && a > b)) {
      this.feedback.set(true);
      return;
    }
    if (!a || !b) {
      if (incomplete) this.feedback.set(true);
      return;
    }
    const range = { start: a, end: b };
    if (!vdRangeAllowed(range, this.safeMin(), this.safeMax())) {
      this.feedback.set(true);
      return;
    }
    this.feedback.set(false);
    this.setRange(range);
  }
  private setRange(range: VdDateRange | null): void {
    this.editedValue = range;
    this.value.set(range);
    this.raw.set({
      start: this.format(range?.start ?? null),
      end: this.format(range?.end ?? null),
      commit: true,
    });
    this.editedValue = this.value();
  }
  protected inputKey(event: KeyboardEvent): void {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'Enter' && !event.altKey) {
      event.preventDefault();
      this.commitText(true);
    }
    if (event.altKey && event.key === 'ArrowDown' && !this.popup().el.matches(':popover-open')) {
      event.preventDefault();
      this.wasOpen = false;
      this.toggle();
    }
  }
  protected rememberState(): void {
    this.wasOpen = this.popup().el.matches(':popover-open');
  }
  protected toggle(): void {
    const wasOpen = this.wasOpen ?? this.popup().el.matches(':popover-open');
    this.wasOpen = null;
    if (this.locked()) return;
    if (wasOpen) {
      this.popup().hide();
      return;
    }
    const range = this.range();
    this.draftStart.set(range?.start ?? null);
    this.draftEnd.set(range?.end ?? null);
    this.selectingEnd.set(false);
    this.calendar().focused.set(
      vdClampDate(range?.start ?? vdToday(), this.safeMin(), this.safeMax()),
    );
    this.popup().el.showPopover({ source: this.trigger().nativeElement } as ShowPopoverOptions);
  }
  protected onToggle(event: Event): void {
    const opened = (event as ToggleEvent).newState === 'open';
    this.open.set(opened);
    if (opened && !this.locked()) this.calendar().focus();
  }
  protected pick(date: string): void {
    if (this.locked() || this.calendar().isDisabled(date)) return;
    if (!this.selectingEnd() || !this.draftStart()) {
      this.draftStart.set(date);
      this.draftEnd.set(null);
      this.selectingEnd.set(true);
      this.calendar().focus();
      return;
    }
    const range = vdRangeBetween(this.draftStart()!, date);
    if (!vdRangeAllowed(range, this.safeMin(), this.safeMax())) return;
    this.feedback.set(false);
    this.setRange(range);
    this.popup().hide();
    this.trigger().nativeElement.focus();
  }
  protected leavePopup(event: FocusEvent): void {
    if (event.relatedTarget && !this.popup().el.contains(event.relatedTarget as Node))
      this.popup().hide();
  }
  protected leaveControl(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.contains(event.relatedTarget as Node)) {
      this.commitText(true);
      this.touch.emit();
    }
  }
}
