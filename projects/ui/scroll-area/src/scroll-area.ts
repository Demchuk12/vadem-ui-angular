import { Directive, input } from '@angular/core';

/** A named native scroll viewport; the browser owns all scrolling and descendant keys. */
@Directive({
  selector: '[vdScrollArea]',
  host: {
    class: 'vd-scroll-area',
    role: 'region',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
  },
})
export class VdScrollArea {
  readonly label = input.required<string>();
}
