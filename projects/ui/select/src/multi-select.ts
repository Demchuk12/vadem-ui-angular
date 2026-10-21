import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdMatchesQuery } from '@vadem/ui/keyboard';
import { vdToggleSelection, vdUniqueSelection } from './core/multi-selection';
import { VdListboxBase } from './listbox-base';
import { VD_LISTBOX } from './listbox-host';
import type { VdOption } from './option';
import { vdTexts } from '@vadem/ui/locale';

/** Searchable multiple selection. Spec: specs/multi-select.md. */
@Component({
  selector: 'vd-multi-select',
  imports: [VdIcon],
  template: `
    <div #field class="vd-multi-select__field" (pointerdown)="onFieldPointerDown($event)">
      @for (item of selectedItems(); track item.value) {
        <span class="vd-multi-select__chip">
          <span class="vd-multi-select__label" [title]="item.label">{{ item.label }}</span>
          <button
            type="button"
            class="vd-multi-select__remove"
            [disabled]="isDisabled() || item.disabled"
            [attr.aria-label]="multiTexts().removeLabel(item.label)"
            (click)="remove(item.value)"
          >
            <vd-icon name="x" />
          </button>
        </span>
      }
      <input
        #input
        class="vd-multi-select__input"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        autocomplete="off"
        [id]="controlId"
        [value]="query()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="open() ? activeId() : null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="isRequired() || null"
        [attr.aria-describedby]="descriptionIds()"
        [attr.aria-label]="ariaLabel() ?? null"
        [attr.aria-labelledby]="ariaLabelledby() ?? null"
        (click)="openList()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (compositionend)="onInput($event)"
      />
      <vd-icon name="chevron-down" class="vd-select__chevron" />
    </div>
    <span class="vd-visually-hidden" [id]="summaryId" role="status" aria-atomic="true">
      {{ multiTexts().selectionLabel(selectedItems().length) }}
    </span>
    <div
      #list
      class="vd-listbox vd-multi-select__list"
      popover="auto"
      role="listbox"
      aria-multiselectable="true"
      [id]="listboxId"
      tabindex="-1"
    >
      <ng-content />
      @if (visibleOptions().length === 0) {
        <p class="vd-listbox__empty">{{ t().emptyText }}</p>
      }
    </div>
  `,
  host: {
    class: 'vd-multi-select',
    '[attr.data-size]': 'size()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  providers: [
    { provide: VD_LISTBOX, useExisting: forwardRef(() => VdMultiSelect) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VdMultiSelect), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdMultiSelect extends VdListboxBase<string[]> {
  readonly value = model<string[]>([]);
  readonly removeLabel = input<(label: string) => string>();
  readonly selectionLabel = input<(count: number) => string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly multiTexts = vdTexts('multiSelect', {
    removeLabel: this.removeLabel,
    selectionLabel: this.selectionLabel,
  });

  private readonly fieldRef = viewChild.required<ElementRef<HTMLElement>>('field');
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  protected readonly query = signal('');
  protected readonly summaryId = vdUniqueId('vd-selection');
  protected readonly descriptionIds = computed(() =>
    [this.describedBy(), this.summaryId].filter(Boolean).join(' '),
  );
  protected readonly selectedItems = computed(() =>
    vdUniqueSelection(this.value()).map((value) => {
      const option = this.ordered().find((item) => item.value() === value);
      return { value, label: option?.textLabel() || value, disabled: option?.disabled() ?? false };
    }),
  );

  protected listEl(): HTMLElement | undefined {
    return this.list()?.nativeElement;
  }

  protected anchorEl(): HTMLElement | undefined {
    return this.fieldRef()?.nativeElement;
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  isSelected(option: VdOption): boolean {
    return this.value().includes(option.value());
  }

  override isVisible(option: VdOption): boolean {
    return vdMatchesQuery(option.textLabel(), this.query());
  }

  choose(option: VdOption): void {
    if (this.isDisabled() || option.disabled()) return;
    this.setValue(vdToggleSelection(this.value(), option.value()));
    this.focus();
  }

  writeValue(value: string[] | null): void {
    this.value.set(vdUniqueSelection(value));
  }

  protected remove(value: string): void {
    const item = this.selectedItems().find((item) => item.value === value);
    if (this.isDisabled() || item?.disabled) return;
    this.setValue(this.value().filter((item) => item !== value));
    this.focus();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    if ((event as InputEvent).isComposing) return;
    this.openList('first');
    this.activate('first');
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.hostEl.contains(next)) return;
    this.markTouched();
    this.closeList();
  }

  protected onFieldPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (this.isDisabled() || target.closest('button') || target === this.inputRef().nativeElement)
      return;
    event.preventDefault();
    this.focus();
    this.openList();
  }

  protected override onClosed(): void {
    this.query.set('');
    if (!this.hostEl.contains(this.hostEl.ownerDocument.activeElement)) this.markTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || this.isDisabled()) return;
    const { key, altKey } = event;
    if (key === 'Backspace' && this.query() === '') {
      const last = this.selectedItems().at(-1);
      if (last && !last.disabled) {
        event.preventDefault();
        this.remove(last.value);
      }
    } else if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openList(key === 'ArrowUp' ? 'last' : 'selected');
      }
    } else if (key === 'Escape' || (altKey && key === 'ArrowUp')) {
      event.preventDefault();
      event.stopPropagation();
      this.closeList();
    } else if (key === 'Enter') {
      event.preventDefault();
      const active = this.activeOption();
      if (active) this.choose(active);
    } else if (key === 'Tab') {
      this.closeList();
    } else if (key !== 'Home' && key !== 'End') {
      this.navigate(event);
    }
  }
}
