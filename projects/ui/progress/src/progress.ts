import { Directive, input } from '@angular/core';

export type VdProgressSize = 'sm' | 'md';
export type VdProgressVariant = 'accent' | 'success' | 'warning' | 'danger';

/**
 * Styles a native `<progress>`: completion of a task. Without `value` it is indeterminate.
 * Role, value and labelling (`<label for>`, `aria-label`) stay native. Spec: specs/progress.md
 */
@Directive({
  selector: 'progress[vdProgress]',
  host: {
    class: 'vd-progress',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
})
export class VdProgress {
  readonly size = input<VdProgressSize>('md');
  readonly variant = input<VdProgressVariant>('accent');
}

/**
 * Styles a native `<meter>`: a measurement within a known range (quota, disk, score).
 * Colors follow the native `low` / `high` / `optimum` regions. Spec: specs/progress.md
 */
@Directive({
  selector: 'meter[vdMeter]',
  host: {
    class: 'vd-meter',
    '[attr.data-size]': 'size()',
  },
})
export class VdMeter {
  readonly size = input<VdProgressSize>('md');
}
