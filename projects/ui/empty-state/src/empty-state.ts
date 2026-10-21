import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { VdIcon, VdIconName } from '@vadem/ui/icon';

export type VdEmptyStateSize = 'sm' | 'md';

/**
 * What to show when there is nothing yet (first run), nothing matches (filters), or nothing is
 * left (inbox zero): an icon, a title, one sentence, and the next step. Spec: specs/empty-state.md
 */
@Component({
  // Attribute selector: the consumer picks the element (div, section, td...).
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[vdEmptyState]',
  imports: [VdIcon],
  template: `
    @if (icon(); as name) {
      <span class="vd-empty-state__icon"><vd-icon [name]="name" /></span>
    }
    <ng-content />
    <ng-content select="[slot=actions]" />
  `,
  host: { class: 'vd-empty-state', '[attr.data-size]': 'size()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdEmptyState {
  readonly icon = input<VdIconName | null>(null);
  /** `sm` fits table cells, cards and menus; `md` fills a page section. */
  readonly size = input<VdEmptyStateSize>('md');
}

@Directive({ selector: '[vdEmptyStateTitle]', host: { class: 'vd-empty-state__title' } })
export class VdEmptyStateTitle {}

@Directive({
  selector: '[vdEmptyStateDescription]',
  host: { class: 'vd-empty-state__description' },
})
export class VdEmptyStateDescription {}

export const VD_EMPTY_STATE = [VdEmptyState, VdEmptyStateTitle, VdEmptyStateDescription] as const;
