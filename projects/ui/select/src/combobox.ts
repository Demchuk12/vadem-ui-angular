import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { VdIcon } from '@vadem/ui/icon';
import { vdMatchesQuery } from '@vadem/ui/keyboard';
import { VdListboxBase } from './listbox-base';
import { VD_LISTBOX } from './listbox-host';
import type { VdOption } from './option';

/**
 * Editable combobox with list autocomplete (APG): type to filter, pick with arrows + Enter or
 * click. User choices come from the options; free text reverts on blur. Spec: specs/select.md
 */
@Component({
  selector: 'vd-combobox',
  imports: [VdIcon],
  template: `
    <!-- Pointer convenience only: the input inside handles every key. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div
      #field
      class="vd-combobox__field"
      (pointerdown)="onFieldPointerDown($event)"
      (click)="onFieldClick($event)"
    >
      <vd-icon name="search" class="vd-combobox__icon" />
      <input
        #input
        class="vd-combobox__input"
        role="combobox"
        aria-autocomplete="list"
        autocomplete="off"
        [id]="controlId"
        [value]="inputText()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="open() ? activeId() : null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="isRequired() || null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-label]="ariaLabel() ?? null"
        [attr.aria-labelledby]="ariaLabelledby() ?? null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
      />
      <vd-icon name="chevron-down" class="vd-select__chevron" />
    </div>
    <div #list class="vd-listbox" popover="auto" role="listbox" [id]="listboxId" tabindex="-1">
      <ng-content />
      @if (visibleOptions().length === 0) {
        <p class="vd-listbox__empty">{{ t().emptyText }}</p>
      }
    </div>
  `,
  host: {
    class: 'vd-combobox',
    '[attr.data-size]': 'size()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    // Naming attributes move to the inner combobox element.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  providers: [
    { provide: VD_LISTBOX, useExisting: forwardRef(() => VdCombobox) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VdCombobox), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdCombobox extends VdListboxBase {
  readonly value = model<string | null>(null);

  isSelected(option: VdOption): boolean {
    return option.value() === this.value();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
    this.query.set(null);
  }

  choose(option: VdOption): void {
    if (option.disabled() || this.isDisabled()) return;
    this.setValue(option.value());
    this.onChosen();
    this.closeList();
  }

  private readonly fieldRef = viewChild.required<ElementRef<HTMLElement>>('field');
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  /** Text being typed; `null` when not filtering (the input shows the selected label). */
  private readonly query = signal<string | null>(null);
  protected readonly inputText = computed(() => this.query() ?? this.selectedLabel());

  protected listEl(): HTMLElement | undefined {
    return this.list()?.nativeElement;
  }

  protected anchorEl(): HTMLElement | undefined {
    return this.fieldRef()?.nativeElement;
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  override isVisible(option: VdOption): boolean {
    const q = this.query();
    return q === null || vdMatchesQuery(option.textLabel(), q);
  }

  protected override onChosen(): void {
    this.query.set(null);
  }

  protected override onClosed(): void {
    this.query.set(null);
    if (this.hostEl.ownerDocument.activeElement !== this.inputRef().nativeElement)
      this.markTouched();
  }

  /** Whether the list was open when the press started (light dismiss may close it first). */
  private wasOpen = false;

  protected onFieldPointerDown(event: PointerEvent): void {
    this.wasOpen = this.open();
    const input = this.inputRef().nativeElement;
    // Icons and padding focus the input instead of stealing focus.
    if (event.target !== input && !this.isDisabled()) {
      event.preventDefault();
      input.focus();
    }
  }

  protected onFieldClick(event: MouseEvent): void {
    if (this.isDisabled()) return;
    const onInput = event.target === this.inputRef().nativeElement;
    if (this.open() && !onInput) this.closeList();
    else if (!this.open() && !(this.wasOpen && !onInput)) this.openList('selected');
    this.wasOpen = false;
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    if (!this.open()) this.openList('first');
    else this.activate('first');
  }

  protected onBlur(): void {
    this.query.set(null);
    if (!this.open()) this.markTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key, altKey } = event;

    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openList(key === 'ArrowUp' ? 'last' : 'selected');
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.closeList();
    } else if (key === 'Enter' || (altKey && key === 'ArrowUp')) {
      event.preventDefault();
      const active = this.activeOption();
      if (active) this.choose(active);
      else this.closeList();
    } else if (key === 'Tab') {
      this.closeList();
    } else if (key !== 'Home' && key !== 'End') {
      // Home/End keep moving the caret in the text field.
      this.navigate(event);
    }
  }
}
