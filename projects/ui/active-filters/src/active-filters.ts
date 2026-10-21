import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import { vdActiveFiltersValid } from './core/active-filters';

export interface VdActiveFilter {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}
interface Focus {
  element: HTMLButtonElement;
  id: string | undefined;
  index: number;
}

@Component({
  selector: 'vd-active-filters',
  imports: [VdButton, VdIcon],
  template: `
    @if (!valid()) {
      <p class="vd-active-filters__message">{{ t().invalidText }}</p>
    } @else if (!filters().length) {
      <p class="vd-active-filters__message">{{ t().emptyText }}</p>
    } @else {
      <ul class="vd-active-filters__list" role="list">
        @for (filter of filters(); track filter.id) {
          <li class="vd-active-filters__item">
            <button
              vdButton
              variant="secondary"
              size="sm"
              type="button"
              class="vd-active-filters__remove"
              [attr.data-filter-id]="filter.id"
              [disabled]="disabled()"
              [attr.aria-label]="t().removeLabel(filter.label, filter.value)"
              (click)="remove(filter.id)"
            >
              <span class="vd-active-filters__text"
                ><bdi>{{ filter.label }}</bdi
                >: <bdi>{{ filter.value }}</bdi></span
              >
              <vd-icon name="x" slot="end" />
            </button>
          </li>
        }
      </ul>
      <button
        vdButton
        variant="ghost"
        size="sm"
        type="button"
        data-action="clear"
        [disabled]="disabled()"
        (click)="clear()"
      >
        {{ t().clearText }}
      </button>
    }
  `,
  host: {
    class: 'vd-active-filters',
    role: 'group',
    tabindex: '-1',
    '[attr.aria-label]': 't().label',
    '[attr.data-state]':
      '!valid() ? "invalid" : !filters().length ? "empty" : disabled() ? "disabled" : "active"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdActiveFilters {
  readonly filters = input<readonly VdActiveFilter[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>();
  readonly clearText = input<string>();
  readonly emptyText = input<string>();
  readonly invalidText = input<string>();
  readonly removeLabel = input<(label: string, value: string) => string>();
  readonly filterRemove = output<string>();
  readonly clearAll = output<void>();
  protected readonly valid = computed(() => vdActiveFiltersValid(this.filters()));
  protected readonly t = vdTexts('activeFilters', {
    label: this.label,
    clearText: this.clearText,
    emptyText: this.emptyText,
    invalidText: this.invalidText,
    removeLabel: this.removeLabel,
  });
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private focus: Focus | null = null;
  constructor() {
    effect(() => {
      this.filters();
      this.disabled();
      this.valid();
      const active = this.host.ownerDocument.activeElement;
      const buttons = this.buttons();
      const index = buttons.findIndex((button) => button === active);
      this.focus =
        index < 0
          ? null
          : { element: buttons[index], id: buttons[index].dataset['filterId'], index };
    });
    afterRenderEffect(() => {
      this.filters();
      this.disabled();
      this.valid();
      const focus = this.focus;
      this.focus = null;
      if (!focus) return;
      const active = this.host.ownerDocument.activeElement;
      if (active === focus.element && !focus.element.disabled) return;
      if (active && active !== this.host.ownerDocument.body && active !== focus.element) return;
      const buttons = this.buttons().filter((button) => !button.disabled);
      const same =
        focus.id === undefined
          ? buttons.find((button) => button.dataset['action'] === 'clear')
          : buttons.find((button) => button.dataset['filterId'] === focus.id);
      const removes = buttons.filter((button) => button.dataset['filterId'] !== undefined);
      (same ?? removes[Math.min(focus.index, removes.length - 1)] ?? this.host).focus();
    });
  }
  private buttons(): HTMLButtonElement[] {
    return Array.from(this.host.querySelectorAll<HTMLButtonElement>('button'));
  }
  protected remove(id: string): void {
    if (!this.disabled() && this.valid() && this.filters().some((filter) => filter.id === id))
      this.filterRemove.emit(id);
  }
  protected clear(): void {
    if (!this.disabled() && this.valid() && this.filters().length) this.clearAll.emit();
  }
}
