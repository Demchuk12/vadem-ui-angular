import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  forwardRef,
  model,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { VdIcon } from '@vadem/ui/icon';
import { VdListboxBase } from './listbox-base';
import { VD_LISTBOX } from './listbox-host';
import type { VdOption } from './option';

/**
 * Select-only combobox (APG): a button that opens a listbox; focus stays on the button and the
 * active option is exposed with aria-activedescendant. Spec: specs/select.md
 */
@Component({
  selector: 'vd-select',
  imports: [VdIcon],
  template: `
    <button
      #trigger
      type="button"
      class="vd-select__trigger"
      role="combobox"
      aria-haspopup="listbox"
      [id]="controlId"
      [disabled]="isDisabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listboxId"
      [attr.aria-activedescendant]="open() ? activeId() : null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-required]="isRequired() || null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledby() ?? null"
      (pointerdown)="wasOpen = open()"
      (click)="onClick()"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    >
      <span class="vd-select__value" [attr.data-placeholder]="selectedLabel() ? null : ''">
        {{ selectedLabel() || placeholder() }}
      </span>
      <vd-icon name="chevron-down" class="vd-select__chevron" />
    </button>
    <div #list class="vd-listbox" popover="auto" role="listbox" [id]="listboxId" tabindex="-1">
      <ng-content />
      @if (visibleOptions().length === 0) {
        <p class="vd-listbox__empty">{{ t().emptyText }}</p>
      }
    </div>
  `,
  host: {
    class: 'vd-select',
    '[attr.data-size]': 'size()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    // Naming attributes move to the inner combobox element.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  providers: [
    { provide: VD_LISTBOX, useExisting: forwardRef(() => VdSelect) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => VdSelect), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSelect extends VdListboxBase {
  readonly value = model<string | null>(null);

  isSelected(option: VdOption): boolean {
    return option.value() === this.value();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  choose(option: VdOption): void {
    if (option.disabled() || this.isDisabled()) return;
    this.setValue(option.value());
    this.onChosen(option);
    this.closeList();
  }

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  /** Light dismiss closes the list on pointerdown; the following click must not reopen it. */
  protected wasOpen = false;

  protected listEl(): HTMLElement | undefined {
    return this.list()?.nativeElement;
  }

  protected anchorEl(): HTMLElement | undefined {
    return this.trigger()?.nativeElement;
  }

  focus(): void {
    this.trigger().nativeElement.focus();
  }

  protected onClick(): void {
    if (this.wasOpen || this.open()) {
      this.wasOpen = false;
      this.closeList();
      return;
    }
    this.openList('selected');
  }

  protected onBlur(): void {
    if (!this.open()) this.markTouched();
  }

  protected override onClosed(): void {
    // Light dismiss moved focus elsewhere: the user has left the field.
    if (this.hostEl.ownerDocument.activeElement !== this.trigger().nativeElement)
      this.markTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key, altKey } = event;

    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.openList('selected');
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        this.openList(key === 'Home' ? 'first' : 'last');
      } else {
        const match = this.typeaheadMatch(event);
        if (match) {
          // APG: typing on a closed select opens it on the match.
          this.openList('selected');
          this.activeId.set(match.id);
        }
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.closeList();
    } else if (key === 'Enter' || key === ' ' || (altKey && key === 'ArrowUp')) {
      event.preventDefault();
      const active = this.activeOption();
      if (active) this.choose(active);
      else this.closeList();
    } else if (key === 'Tab') {
      const active = this.activeOption();
      if (active) this.choose(active);
      else this.closeList();
    } else if (!this.navigate(event)) {
      const match = this.typeaheadMatch(event);
      if (match) this.activeId.set(match.id);
    }
  }
}
