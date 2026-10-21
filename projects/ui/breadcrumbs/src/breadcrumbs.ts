import { Directive, input } from '@angular/core';
import { vdTexts } from '@vadem/ui/locale';

/**
 * Breadcrumb trail on a `<nav>` holding an `<ol>` of links; the last item is the current page
 * (`aria-current="page"`, not a link). Separators are drawn in CSS and mirror in RTL.
 * Spec: specs/breadcrumbs.md
 */
@Directive({
  selector: 'nav[vdBreadcrumbs]',
  host: { class: 'vd-breadcrumbs', '[attr.aria-label]': 't().label' },
})
export class VdBreadcrumbs {
  /** Landmark name. */
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('breadcrumbs', { label: this.label });
}
