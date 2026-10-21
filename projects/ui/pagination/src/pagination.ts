import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';
import { vdPageRange } from './core/range';
import { vdTexts } from '@vadem/ui/locale';

export type VdPaginationSize = 'sm' | 'md';

/**
 * Page navigation for paged lists and tables. Buttons (not links): the consumer loads the page.
 * Spec: specs/pagination.md
 */
@Component({
  selector: 'vd-pagination',
  imports: [VdIcon],
  template: `
    <button
      type="button"
      class="vd-pagination__step"
      [attr.aria-label]="t().previousLabel"
      [attr.aria-disabled]="isFirst() || null"
      (click)="go(current() - 1)"
    >
      <vd-icon name="chevron-left" />
    </button>

    @if (compact()) {
      <span class="vd-pagination__status">{{ current() }} / {{ pageCount() }}</span>
    } @else {
      <ul class="vd-pagination__pages" role="list">
        @for (item of items(); track item === 'ellipsis' ? 'e' + $index : item) {
          <li>
            @if (item === 'ellipsis') {
              <span class="vd-pagination__ellipsis" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                class="vd-pagination__page"
                [attr.aria-current]="item === current() ? 'page' : null"
                [attr.aria-label]="t().pageLabel(item)"
                (click)="go(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
      </ul>
    }

    <button
      type="button"
      class="vd-pagination__step"
      [attr.aria-label]="t().nextLabel"
      [attr.aria-disabled]="isLast() || null"
      (click)="go(current() + 1)"
    >
      <vd-icon name="chevron-right" />
    </button>
  `,
  host: {
    class: 'vd-pagination',
    role: 'navigation',
    '[attr.aria-label]': 't().label',
    '[attr.data-size]': 'size()',
    '(focusin)': 'revealFocused($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdPagination {
  /** Current page, 1-based (two-way). */
  readonly page = model(1);
  readonly pageCount = input.required({ transform: numberAttribute });
  readonly size = input<VdPaginationSize>('md');
  /** Pages shown on each side of the current one. */
  readonly siblings = input(1, { transform: numberAttribute });
  /** "3 / 12" instead of page buttons (narrow spaces). */
  readonly compact = input(false, { transform: booleanAttribute });
  /** Landmark name; name each pagination on a page differently. */
  readonly label = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  readonly pageLabel = input<(page: number) => string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('pagination', {
    label: this.label,
    previousLabel: this.previousLabel,
    nextLabel: this.nextLabel,
    pageLabel: this.pageLabel,
  });

  protected readonly current = computed(() =>
    Math.min(Math.max(1, this.page()), Math.max(1, this.pageCount())),
  );
  protected readonly isFirst = computed(() => this.current() <= 1);
  protected readonly isLast = computed(() => this.current() >= this.pageCount());
  protected readonly items = computed(() =>
    vdPageRange(this.current(), this.pageCount(), this.siblings()),
  );

  /** Native focus scrolling can leave a partially visible button clipped. */
  protected revealFocused(event: FocusEvent): void {
    (event.target as HTMLElement).scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  /** Disabled steps use aria-disabled (they keep focus at the edges), so guard here. */
  protected go(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.current()) return;
    this.page.set(page);
  }
}
