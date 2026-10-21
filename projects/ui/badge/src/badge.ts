import { Directive, booleanAttribute, input } from '@angular/core';

export type VdBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Small status or metadata label in the mono eyebrow style. Not interactive.
 * Spec: specs/badge.md
 */
@Directive({
  selector: '[vdBadge]',
  host: {
    class: 'vd-badge',
    '[attr.data-variant]': 'variant()',
    '[attr.data-dot]': 'dot() ? "" : null',
  },
})
export class VdBadge {
  readonly variant = input<VdBadgeVariant>('neutral');
  /** Leading status dot in the variant's solid color. */
  readonly dot = input(false, { transform: booleanAttribute });
}
