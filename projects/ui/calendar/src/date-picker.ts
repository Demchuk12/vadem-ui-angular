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
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdNgControlState, vdNgControlState, vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';
import { VdCalendar } from './calendar';
import { VdIsoDate, vdFormatShort, vdParseDate } from './core/date';
import { vdTexts } from '@vadem/ui/locale';

const NO_NG_STATE: VdNgControlState = {
  invalid: false,
  touched: false,
  disabled: false,
  required: false,
};

/**
 * Date field: type a date in the locale's numeric format or pick it from a calendar popover
 * (APG date picker dialog). Value is an ISO date string; works with forms and `vd-field`.
 * Spec: specs/calendar.md
 */
@Component({
  selector: 'vd-date-picker',
  imports: [VdButton, VdCalendar, VdIcon, VdInput, VdInputGroup],
  template: `
    <vd-input-group class="vd-date-picker__group" #group>
      <input
        vdInput
        #field
        type="text"
        inputmode="numeric"
        autocomplete="off"
        [value]="text()"
        [placeholder]="placeholderText()"
        [disabled]="isDisabled()"
        [invalid]="showInvalid()"
        [touched]="touchedState()"
        [required]="isRequired()"
        [attr.aria-label]="ariaLabel() ?? null"
        (input)="onType($event)"
        (keydown.enter)="commit()"
        (blur)="onBlur()"
      />
      <button
        vdButton
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        slot="end"
        aria-haspopup="dialog"
        [attr.aria-label]="t().openLabel"
        [attr.aria-expanded]="open()"
        [disabled]="isDisabled()"
        (pointerdown)="rememberState()"
        (click)="toggle()"
      >
        <vd-icon name="calendar" />
      </button>
    </vd-input-group>
    <div
      class="vd-popover vd-date-picker__panel"
      popover="auto"
      role="dialog"
      [attr.aria-label]="t().dialogLabel"
      #panel
    >
      <vd-calendar
        [value]="value()"
        [min]="min()"
        [max]="max()"
        [dateDisabled]="dateDisabled()"
        [locale]="locale()"
        [firstDayOfWeek]="firstDayOfWeek()"
        [previousLabel]="t().previousLabel"
        [nextLabel]="t().nextLabel"
        (valueChange)="pick($event)"
      />
    </div>
  `,
  host: {
    class: 'vd-date-picker',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.aria-label]': 'null',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VdDatePicker), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdDatePicker implements ControlValueAccessor, OnInit {
  readonly value = model<VdIsoDate | null>(null);
  readonly min = input<VdIsoDate | null>(null);
  readonly max = input<VdIsoDate | null>(null);
  readonly dateDisabled = input<(date: VdIsoDate) => boolean>(() => false);
  readonly locale = input<string>(inject(LOCALE_ID));
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** Defaults to an example date in the locale's format ("31.12.2026"). */
  readonly placeholder = input<string>();
  /** Name of the text field when there is no `vd-field` label. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly openLabel = input<string>();
  readonly dialogLabel = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('datePicker', {
    openLabel: this.openLabel,
    dialogLabel: this.dialogLabel,
    previousLabel: this.previousLabel,
    nextLabel: this.nextLabel,
  });

  protected readonly open = signal(false);
  /** What the user typed; follows the value until they type. */
  protected readonly text = linkedSignal(() => {
    const value = this.value();
    return value ? vdFormatShort(value, this.locale()) : '';
  });
  /** Typed text that isn't a valid, available date. */
  private readonly parseError = signal(false);
  private readonly formDisabled = signal(false);
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly ngState = computed(() => this.ngSource()?.() ?? NO_NG_STATE);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly isRequired = computed(() => this.required() || this.ngState().required);
  protected readonly showInvalid = computed(
    () => this.invalid() || this.parseError() || (this.ngState().invalid && this.ngState().touched),
  );
  /** Gate for the inner input: never hide our own invalid state. */
  protected readonly touchedState = computed(() => (this.showInvalid() ? true : undefined));
  protected readonly placeholderText = computed(
    () => this.placeholder() ?? vdFormatShort(`${new Date().getFullYear()}-12-31`, this.locale()),
  );

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly group = viewChild.required('group', { read: ElementRef });
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly calendar = viewChild.required(VdCalendar);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly anchorName = `--${vdUniqueId('vd-date-picker')}`;
  private openAtPress: boolean | null = null;

  private onChange: (value: VdIsoDate | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    afterNextRender(() => {
      const panel = this.panel().nativeElement;
      (this.group().nativeElement as HTMLElement).style.setProperty('anchor-name', this.anchorName);
      panel.style.setProperty('position-anchor', this.anchorName);
      const onToggle = (event: Event) => {
        const opened = (event as ToggleEvent).newState === 'open';
        this.open.set(opened);
        if (opened) this.calendar().focus();
      };
      panel.addEventListener('toggle', onToggle);
      this.destroyRef.onDestroy(() => panel.removeEventListener('toggle', onToggle));
    });
  }

  ngOnInit(): void {
    const ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    this.ngSource.set(vdNgControlState(ngControl, this.destroyRef));
  }

  // ------------------------------------------------------------------ popover

  protected rememberState(): void {
    this.openAtPress = this.panel().nativeElement.matches(':popover-open');
  }

  protected toggle(): void {
    const panel = this.panel().nativeElement;
    const wasOpen = this.openAtPress ?? panel.matches(':popover-open');
    this.openAtPress = null;
    if (wasOpen) {
      if (panel.matches(':popover-open')) panel.hidePopover();
    } else {
      this.commit();
      panel.showPopover({ source: this.field().nativeElement } as ShowPopoverOptions);
    }
  }

  protected pick(date: VdIsoDate | null): void {
    this.setValue(date);
    this.panel().nativeElement.hidePopover();
    this.field().nativeElement.focus();
  }

  // ------------------------------------------------------------------- typing

  protected onType(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
    this.parseError.set(false);
  }

  protected onBlur(): void {
    this.commit();
    this.onTouched();
  }

  /** Turns the typed text into the value (or flags it). */
  protected commit(): void {
    const text = this.text().trim();
    if (!text) {
      this.parseError.set(false);
      this.setValue(null);
      return;
    }
    const date = vdParseDate(text, this.locale());
    const calendar = this.calendar();
    if (!date || calendar.isDisabled(date)) {
      this.parseError.set(true);
      return;
    }
    this.parseError.set(false);
    this.setValue(date);
    // Normalize what's shown ("2.10.26" -> "02.10.2026").
    this.text.set(vdFormatShort(date, this.locale()));
  }

  private setValue(date: VdIsoDate | null): void {
    if (date === this.value()) return;
    this.value.set(date);
    this.onChange(date);
  }

  // ---------------------------------------------------------- ControlValueAccessor

  writeValue(value: VdIsoDate | null): void {
    this.parseError.set(false);
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: VdIsoDate | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
