import { booleanAttribute, Directive, input } from '@angular/core';

export type VdSkeletonShape = 'text' | 'circle' | 'rectangle';
export type VdSkeletonSize = 'sm' | 'md' | 'lg';

/** Decorative placeholder. Loading status and lifecycle belong to its consumer. */
@Directive({
  selector: '[vdSkeleton]',
  host: {
    class: 'vd-skeleton',
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[attr.data-size]': 'size()',
    '[attr.data-animated]': 'animated() ? "" : null',
  },
})
export class VdSkeleton {
  readonly shape = input<VdSkeletonShape | null>(null);
  readonly size = input<VdSkeletonSize>('md');
  readonly animated = input(true, { transform: booleanAttribute });
}
