import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';

export type VdStepperOrientation = 'horizontal' | 'vertical';

/** Ordered process navigation. The consumer owns stage content and validation. */
@Directive({
  selector: 'nav[vdStepper]',
  exportAs: 'vdStepper',
  host: {
    class: 'vd-stepper',
    '[attr.aria-label]': 't().label',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class VdStepper {
  readonly value = model<string | undefined>(undefined);
  readonly label = input<string>();
  readonly orientation = input<VdStepperOrientation>('horizontal');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly completedLabel = input<string>();
  readonly errorLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('stepper', {
    label: this.label,
    completedLabel: this.completedLabel,
    errorLabel: this.errorLabel,
  });

  private readonly steps = contentChildren(VdStep, { descendants: true });
  readonly current = computed(() => this.value() ?? this.steps()[0]?.value());

  number(step: VdStep): number {
    return this.steps().indexOf(step) + 1;
  }

  select(step: VdStep): void {
    if (this.disabled() || step.disabled() || step.value() === this.current()) return;
    this.value.set(step.value());
  }
}

/** Native button with a numbered/status indicator and compositional text parts. */
@Component({
  // Attribute component preserves native button behavior while rendering the status icon.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[vdStep]',
  imports: [VdIcon],
  template: `
    <span class="vd-step__indicator" aria-hidden="true">
      @if (invalid()) {
        <vd-icon name="alert-circle" />
      } @else if (completed()) {
        <vd-icon name="check" />
      } @else {
        {{ number() }}
      }
    </span>
    <span class="vd-step__content"><ng-content /></span>
    @if (status(); as text) {
      <span class="vd-visually-hidden" [id]="statusId">{{ text }}</span>
    }
  `,
  host: {
    class: 'vd-step',
    type: 'button',
    '[disabled]': 'isDisabled()',
    '[attr.aria-current]': 'current() ? "step" : null',
    '[attr.aria-labelledby]': 'title()?.id ?? null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.data-current]': 'current() ? "" : null',
    '[attr.data-completed]': 'completed() ? "" : null',
    '[attr.data-invalid]': 'invalid() ? "" : null',
    '[attr.data-state]': 'state()',
    '(click)': 'stepper.select(this)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdStep {
  readonly value = input.required<string>();
  readonly completed = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly stepper = inject(VdStepper);
  protected readonly title = contentChild(VdStepTitle);
  private readonly description = contentChild(VdStepDescription);
  protected readonly statusId = vdUniqueId('vd-step-status');
  protected readonly number = computed(() => this.stepper.number(this));
  protected readonly current = computed(() => this.stepper.current() === this.value());
  protected readonly isDisabled = computed(() => this.stepper.disabled() || this.disabled());
  protected readonly state = computed(() =>
    this.invalid()
      ? 'error'
      : this.completed()
        ? 'complete'
        : this.current()
          ? 'current'
          : 'upcoming',
  );
  protected readonly status = computed(() =>
    this.invalid()
      ? this.stepper.errorLabel()
      : this.completed()
        ? this.stepper.completedLabel()
        : '',
  );
  protected readonly describedBy = computed(
    () =>
      [this.description()?.id, this.status() ? this.statusId : null].filter(Boolean).join(' ') ||
      null,
  );
}

@Directive({
  selector: '[vdStepTitle]',
  host: { class: 'vd-step__title', '[id]': 'id' },
})
export class VdStepTitle {
  readonly id = vdUniqueId('vd-step-title');
}

@Directive({
  selector: '[vdStepDescription]',
  host: { class: 'vd-step__description', '[id]': 'id' },
})
export class VdStepDescription {
  readonly id = vdUniqueId('vd-step-description');
}

export const VD_STEPPER = [VdStepper, VdStep, VdStepTitle, VdStepDescription] as const;
