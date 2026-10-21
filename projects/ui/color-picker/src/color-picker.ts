import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
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
import { FormField, FormValueControl } from '@angular/forms/signals';
import {
  VD_FIELD,
  VdFieldControl,
  VdNgControlState,
  vdNgControlState,
  vdUniqueId,
} from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdPopover } from '@vadem/ui/popover';
import { VdButton } from '@vadem/ui/button';
import { vdColorInk, vdColorPaletteKey, vdNormalizeHex } from './core/color';
import { vdTexts } from '@vadem/ui/locale';

export interface VdColorSwatch {
  readonly value: string;
  readonly label: string;
}
export type VdColorPickerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'vd-color-picker',
  imports: [VdIcon, VdPopover, VdButton],
  template: `
    <button
      #trigger
      type="button"
      class="vd-input vd-color-picker__trigger"
      [id]="controlId"
      [attr.data-size]="size()"
      [disabled]="isDisabled()"
      [attr.aria-disabled]="readonly() || null"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="popup.id"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledby() ?? null"
      [attr.aria-describedby]="field?.describedBy() ?? null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.data-invalid]="showInvalid() ? '' : null"
      (pointerdown)="rememberState()"
      (click)="toggle()"
      (keydown)="triggerKey($event)"
    >
      <span
        class="vd-color-picker__preview"
        aria-hidden="true"
        [attr.data-empty]="color() ? null : ''"
        [style.--vd-color-picker-value]="color()"
      ></span>
      <span class="vd-color-picker__value" [attr.data-placeholder]="color() ? null : ''">{{
        color() || t().placeholder
      }}</span>
      <vd-icon name="chevron-down" />
    </button>
    <div
      vdPopover
      #popup="vdPopover"
      class="vd-color-picker__popup"
      [attr.aria-label]="t().pickerLabel"
      (toggle)="onToggle($event)"
      (focusout)="leavePopup($event)"
    >
      <div class="vd-color-picker__draft">
        <span
          class="vd-color-picker__preview"
          aria-hidden="true"
          [attr.data-empty]="draftColor() || color() ? null : ''"
          [style.--vd-color-picker-value]="draftColor() || color()"
        ></span>
        <label class="vd-color-picker__hex-label" [for]="hexId">{{ t().hexLabel }}</label>
      </div>
      <input
        #hex
        class="vd-input vd-color-picker__hex"
        type="text"
        [id]="hexId"
        [value]="draft()"
        autocomplete="off"
        spellcheck="false"
        autocapitalize="characters"
        dir="ltr"
        [disabled]="locked()"
        [attr.aria-invalid]="draftError() || null"
        [attr.data-invalid]="draftError() ? '' : null"
        [attr.aria-describedby]="draftError() ? errorId : null"
        (input)="edit($event)"
        (blur)="validateOnBlur()"
        (keydown.enter)="apply($event)"
      />
      @if (palette().length) {
        <div
          class="vd-color-picker__palette"
          role="radiogroup"
          [attr.aria-label]="t().paletteLabel"
        >
          @for (swatch of palette(); track swatch.value; let i = $index) {
            <button
              type="button"
              class="vd-color-picker__swatch"
              role="radio"
              [disabled]="locked()"
              [attr.aria-label]="swatch.label"
              [attr.aria-checked]="draftColor() === swatch.value"
              [attr.tabindex]="i === paletteEntry() ? 0 : -1"
              [style.--vd-color-picker-value]="swatch.value"
              [style.--vd-color-picker-ink]="ink(swatch.value)"
              (keydown)="paletteKey($event, i)"
              (click)="commit(swatch.value)"
            >
              <span class="vd-color-picker__chip" aria-hidden="true"><vd-icon name="check" /></span>
            </button>
          }
        </div>
      }
      @if (draftError()) {
        <p class="vd-color-picker__error" [id]="errorId">
          <vd-icon name="alert-circle" />{{ t().errorLabel }}
        </p>
      }
      <button vdButton type="button" [disabled]="locked()" (click)="apply()">
        {{ t().applyLabel }}
      </button>
    </div>
  `,
  host: {
    class: 'vd-color-picker',
    '[attr.data-size]': 'size()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdColorPicker implements FormValueControl<string>, OnInit {
  readonly value = model('');
  readonly swatches = input<readonly VdColorSwatch[]>([]);
  readonly size = input<VdColorPickerSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly placeholder = input<string>();
  readonly pickerLabel = input<string>();
  readonly hexLabel = input<string>();
  readonly paletteLabel = input<string>();
  readonly applyLabel = input<string>();
  readonly errorLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('colorPicker', {
    placeholder: this.placeholder,
    pickerLabel: this.pickerLabel,
    hexLabel: this.hexLabel,
    paletteLabel: this.paletteLabel,
    applyLabel: this.applyLabel,
    errorLabel: this.errorLabel,
  });
  readonly touch = output<void>();
  readonly controlId = vdUniqueId('vd-color-picker');
  protected readonly hexId = `${this.controlId}-hex`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly color = computed(() => vdNormalizeHex(this.value()));
  protected readonly draft = signal('');
  protected readonly draftColor = computed(() => vdNormalizeHex(this.draft()));
  protected readonly draftError = signal(false);
  protected readonly open = signal(false);
  protected readonly ink = vdColorInk;
  protected readonly palette = computed(() => {
    const seen = new Set<string>();
    return this.swatches().flatMap((swatch) => {
      const value = vdNormalizeHex(swatch.value);
      if (!value || seen.has(value)) return [];
      seen.add(value);
      return [{ value, label: swatch.label.trim() || value }];
    });
  });
  protected readonly paletteEntry = computed(() =>
    Math.max(
      0,
      this.palette().findIndex((swatch) => swatch.value === this.draftColor()),
    ),
  );
  private readonly popup = viewChild.required(VdPopover);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly hex = viewChild.required<ElementRef<HTMLInputElement>>('hex');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly field = inject(VD_FIELD, { optional: true });
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
  protected readonly showInvalid = computed(
    () =>
      (this.invalid() && (!this.formBound() || this.touched())) ||
      (this.ngState().invalid && this.ngState().touched),
  );
  private wasOpen: boolean | null = null;
  private lastValue: string | undefined;

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
      const value = this.value();
      if (this.locked() || (this.lastValue !== undefined && this.lastValue !== value))
        this.popup().hide();
      this.lastValue = value;
    });
  }
  ngOnInit(): void {
    const ng = this.injector.get(NgControl, null, { self: true, optional: true });
    this.formBound.set(
      !!ng || !!this.injector.get(FormField, null, { self: true, optional: true }),
    );
    this.ngSource.set(vdNgControlState(ng, this.destroyRef));
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
    this.draft.set(this.color() ?? '');
    this.draftError.set(false);
    this.popup().el.showPopover({ source: this.trigger().nativeElement } as ShowPopoverOptions);
  }
  protected triggerKey(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown' && !this.popup().el.matches(':popover-open')) {
      event.preventDefault();
      this.wasOpen = false;
      this.toggle();
    }
  }
  protected onToggle(event: Event): void {
    const opened = (event as ToggleEvent).newState === 'open';
    this.open.set(opened);
    if (opened && !this.locked()) {
      this.hex().nativeElement.focus();
      this.hex().nativeElement.select();
    }
  }
  protected edit(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    this.draftError.set(false);
  }
  protected validateOnBlur(): void {
    if (this.draft() && !this.draftColor()) this.draftError.set(true);
  }
  protected apply(event?: Event): void {
    event?.preventDefault();
    const value = this.draftColor();
    if (!value) {
      this.draftError.set(true);
      this.hex().nativeElement.focus();
      return;
    }
    this.commit(value);
  }
  protected commit(value: string): void {
    if (this.locked()) return;
    this.value.set(value);
    this.popup().hide();
    this.trigger().nativeElement.focus();
  }
  protected paletteKey(event: KeyboardEvent, index: number): void {
    if (this.locked() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const next = vdColorPaletteKey(
      index,
      this.palette().length,
      event.key,
      this.host.matches(':dir(rtl)'),
    );
    if (next === null) return;
    event.preventDefault();
    this.draft.set(this.palette()[next].value);
    this.draftError.set(false);
    this.popup().el.querySelectorAll<HTMLButtonElement>('[role=radio]')[next]?.focus();
  }
  protected leavePopup(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.popup().el.contains(next)) this.popup().hide();
  }
  protected onFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.contains(event.relatedTarget as Node)) this.touch.emit();
  }
}
