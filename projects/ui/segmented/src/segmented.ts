import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { vdUniqueId } from '@vadem/ui/field';

export type VdSegmentedSize = 'sm' | 'md';

/**
 * Single choice among a few options, shown as a segmented control. Each segment is a native
 * radio sharing one `name`, so arrow keys, Tab, RTL and form semantics come from the platform.
 * Spec: specs/segmented.md
 */
@Component({
  selector: 'vd-segmented',
  template: `<ng-content />`,
  host: {
    class: 'vd-segmented',
    role: 'radiogroup',
    '[attr.data-size]': 'size()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '(focusout)': 'onFocusOut($event)',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VdSegmented), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSegmented implements ControlValueAccessor {
  /** Selected segment value (two-way). */
  readonly value = model<string | null>(null);
  readonly size = input<VdSegmentedSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Shared radio `name`. */
  readonly name = vdUniqueId('vd-segmented');

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  select(value: string): void {
    if (this.isDisabled() || value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  protected onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    if (!host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}

/** One option of `vd-segmented`. Icon-only segments need `aria-label`. */
@Component({
  selector: 'vd-segment',
  template: `
    <input
      type="radio"
      class="vd-segment__input"
      [name]="group.name"
      [value]="value()"
      [checked]="checked()"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabel() ? null : labelId"
      (change)="group.select(value())"
    />
    <span class="vd-segment__label" [id]="labelId"><ng-content /></span>
  `,
  host: {
    class: 'vd-segment',
    '[attr.data-checked]': 'checked() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-icon-only]': 'ariaLabel() ? "" : null',
    // The name belongs to the radio, not the wrapper.
    '[attr.aria-label]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSegment {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected readonly group = inject(VdSegmented);
  /** The radio isn't inside a <label>; the visible text names it. */
  protected readonly labelId = vdUniqueId('vd-segment-label');
  protected readonly checked = computed(() => this.group.value() === this.value());
  protected readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
}
