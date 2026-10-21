import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';
import { vdNumberStepValue } from './core/number-input';
import { vdTexts } from '@vadem/ui/locale';

/** Numeric native Input: the platform/forms accessor remains the source of value. */
@Directive({
  selector: 'input[type=number][vdNumberInput]',
  exportAs: 'vdNumberInput',
  host: { class: 'vd-number-input__input', '(input)': 'refresh()', '(change)': 'refresh()' },
})
export class VdNumberInput extends VdInput {
  private readonly el: HTMLInputElement = inject(ElementRef).nativeElement;
  private readonly snapshot = signal<string | null>(null);
  readonly locked = computed(() => {
    this.snapshot();
    return this.snapshot() === null || this.el.disabled || this.el.readOnly;
  });
  readonly canDecrease = computed(
    () => this.snapshot() !== null && vdNumberStepValue(this.el, -1) !== null,
  );
  readonly canIncrease = computed(
    () => this.snapshot() !== null && vdNumberStepValue(this.el, 1) !== null,
  );

  constructor() {
    super();
    // Browser-only. Equality of the serialized snapshot prevents render feedback loops.
    afterEveryRender(() => this.refresh());
  }

  refresh(): void {
    this.snapshot.set(
      JSON.stringify([
        this.el.type,
        this.el.value,
        this.el.getAttribute('value'),
        this.el.min,
        this.el.max,
        this.el.step,
        this.el.disabled,
        this.el.readOnly,
        this.el.validity.badInput,
      ]),
    );
  }

  step(direction: -1 | 1): void {
    const value = vdNumberStepValue(this.el, direction);
    if (value === null) return;
    this.el.value = value;
    this.refresh();
    this.el.dispatchEvent(new Event('input', { bubbles: true }));
    this.el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

@Component({
  selector: 'vd-number-input',
  imports: [VdIcon],
  template: `
    <button
      class="vd-button"
      data-icon-only
      type="button"
      data-variant="ghost"
      slot="start"
      [attr.data-size]="control()?.size() ?? 'md'"
      [attr.aria-label]="t().decreaseLabel"
      [attr.aria-controls]="control()?.id() ?? null"
      [disabled]="control()?.locked() ?? true"
      [attr.aria-disabled]="control()?.canDecrease() ? null : 'true'"
      (click)="control()?.step(-1)"
    >
      <vd-icon name="minus" />
    </button>
    <ng-content select="input[vdNumberInput]" />
    <button
      class="vd-button"
      data-icon-only
      type="button"
      data-variant="ghost"
      slot="end"
      [attr.data-size]="control()?.size() ?? 'md'"
      [attr.aria-label]="t().increaseLabel"
      [attr.aria-controls]="control()?.id() ?? null"
      [disabled]="control()?.locked() ?? true"
      [attr.aria-disabled]="control()?.canIncrease() ? null : 'true'"
      (click)="control()?.step(1)"
    >
      <vd-icon name="plus" />
    </button>
  `,
  host: { class: 'vd-input-group vd-number-input' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdNumberInputGroup {
  readonly decreaseLabel = input<string>();
  readonly increaseLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('numberInput', {
    decreaseLabel: this.decreaseLabel,
    increaseLabel: this.increaseLabel,
  });
  protected readonly control = contentChild(VdNumberInput);
}

export const VD_NUMBER_INPUT = [VdNumberInputGroup, VdNumberInput] as const;
