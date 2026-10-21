import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { vdTexts } from '@vadem/ui/locale';
import type { VdProgressVariant } from './progress';

export type VdProgressRingSize = 'sm' | 'md' | 'lg';

const optionalNumber = (value: unknown): number | null =>
  value === null || value === undefined || value === '' ? null : numberAttribute(value);

/**
 * Circular progress. Without `value` it is indeterminate (a spinner); with `value` it shows
 * completion. Spec: specs/progress.md
 */
@Component({
  selector: 'vd-progress-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-progress-ring',
    role: 'progressbar',
    '[attr.aria-label]': 't().label',
    '[attr.aria-valuemin]': 'determinate() ? 0 : null',
    '[attr.aria-valuemax]': 'determinate() ? max() : null',
    '[attr.aria-valuenow]': 'determinate() ? clamped() : null',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-indeterminate]': 'determinate() ? null : ""',
    '[style.--vd-progress-ring-value]': 'percent()',
  },
  template: `
    <svg class="vd-progress-ring__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle class="vd-progress-ring__track" cx="12" cy="12" r="10" pathLength="100" />
      <circle class="vd-progress-ring__indicator" cx="12" cy="12" r="10" pathLength="100" />
    </svg>
    @if (showValue() && determinate()) {
      <span class="vd-progress-ring__value" aria-hidden="true">{{ percent() }}%</span>
    }
  `,
})
export class VdProgressRing {
  /** Completed amount; leave empty for an indeterminate spinner. */
  readonly value = input<number | null, unknown>(null, { transform: optionalNumber });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<VdProgressRingSize>('md');
  readonly variant = input<VdProgressVariant>('accent');
  /** Percentage in the centre; shown at size lg only. */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Accessible name; defaults to the locale's "Loading". */
  readonly label = input<string>();
  protected readonly t = vdTexts('progressRing', { label: this.label });

  protected readonly determinate = computed(() => this.value() !== null);
  protected readonly clamped = computed(() =>
    Math.min(Math.max(this.value() ?? 0, 0), Math.max(this.max(), 0)),
  );
  protected readonly percent = computed(() =>
    this.max() > 0 ? Math.round((this.clamped() / this.max()) * 100) : 0,
  );
}
