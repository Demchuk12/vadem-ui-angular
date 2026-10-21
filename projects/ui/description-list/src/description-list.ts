import { Directive, input } from '@angular/core';

export type VdDescriptionListLayout = 'horizontal' | 'vertical';

/** Native term/value groups; consumers own content, actions and missing-value copy. */
@Directive({
  selector: 'dl[vdDescriptionList]',
  host: { class: 'vd-description-list', '[attr.data-layout]': 'layout()' },
})
export class VdDescriptionList {
  readonly layout = input<VdDescriptionListLayout>('horizontal');
}
