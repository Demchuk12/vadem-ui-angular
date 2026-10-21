import { Directive, input } from '@angular/core';
import { vdTexts } from '@vadem/ui/locale';

/** Native navigation landmark; applications supply groups, links and current state. */
@Directive({
  selector: 'nav[vdNavigationList]',
  host: { class: 'vd-navigation-list', '[attr.aria-label]': 't().label' },
})
export class VdNavigationList {
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('navigationList', { label: this.label });
}

/** Keeps href, router integration, keyboard and modified-click behavior native. */
@Directive({ selector: 'a[vdNavigationLink]', host: { class: 'vd-navigation-link' } })
export class VdNavigationLink {}

/** Preserves the consumer's heading level and section labelling. */
@Directive({ selector: '[vdNavigationLabel]', host: { class: 'vd-navigation-label' } })
export class VdNavigationLabel {}

export const VD_NAVIGATION_LIST = [VdNavigationList, VdNavigationLink, VdNavigationLabel] as const;
