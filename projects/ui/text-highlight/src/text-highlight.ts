import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { vdTextHighlightParts } from './core/text-highlight';

/** Preserves plain text while marking every literal, case-insensitive query match. */
@Component({
  selector: 'vd-text-highlight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-text-highlight',
    '[attr.data-state]': '!text() ? "empty" : matched() ? "matched" : "plain"',
  },
  template: `@for (part of parts(); track $index) {
    @if (part.matched) {
      <mark class="vd-text-highlight__match">{{ part.text }}</mark>
    } @else {
      <ng-container>{{ part.text }}</ng-container>
    }
  }`,
})
export class VdTextHighlight {
  readonly text = input.required<string>();
  readonly query = input('');
  protected readonly parts = computed(() => vdTextHighlightParts(this.text(), this.query()));
  protected readonly matched = computed(() => this.parts().some((part) => part.matched));
}
