import { DOCUMENT } from '@angular/common';
import {
  afterEveryRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';
import { vdTexts } from '@vadem/ui/locale';
import { VdProgressRing } from '@vadem/ui/progress';

/**
 * Native `input[type=search]`: value, forms accessor and the `search` event stay native.
 * Adds consistent Escape-to-clear and a clear action. Spec: specs/search-input.md
 */
@Directive({
  selector: 'input[type=search][vdSearchInput]',
  exportAs: 'vdSearchInput',
  host: {
    class: 'vd-search-input__input',
    '(input)': 'sync()',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class VdSearchInput extends VdInput {
  readonly element: HTMLInputElement = inject(ElementRef).nativeElement;
  /** Emits after the value was cleared by the button or Escape. */
  readonly cleared = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly hasValue = signal(false);
  readonly filled = this.hasValue.asReadonly();
  private readonly editable = signal(true);
  readonly canClear = this.editable.asReadonly();

  constructor() {
    super();
    // Forms can set the value programmatically without an input event.
    afterEveryRender(() => {
      this.sync();
      this.editable.set(!this.element.disabled && !this.element.readOnly);
    });
  }

  protected sync(): void {
    this.hasValue.set(this.element.value !== '');
  }

  /** Escape clears a non-empty field; an empty field lets Escape reach outer handlers (dialogs). */
  protected onEscape(event: Event): void {
    if (!this.hasValue() || !this.editable()) return;
    event.preventDefault();
    event.stopPropagation();
    this.clear();
  }

  clear(): void {
    if (!this.editable()) return;
    this.element.value = '';
    // Forms and consumers listen to the native events.
    this.element.dispatchEvent(new Event('input', { bubbles: true }));
    this.element.dispatchEvent(new Event('search', { bubbles: true }));
    this.sync();
    if (this.document.activeElement !== this.element) this.element.focus();
    this.cleared.emit();
  }

  /** Pointer activation keeps the caret in the field. */
  preserveFocus(event: MouseEvent): void {
    if (event.button === 0) event.preventDefault();
  }
}

@Component({
  selector: 'vd-search-input',
  imports: [VdButton, VdIcon, VdProgressRing],
  template: `
    <vd-icon slot="start" name="search" />
    <ng-content select="input[vdSearchInput]" />
    @if (loading()) {
      <vd-progress-ring slot="end" size="sm" [label]="t().loadingLabel" />
    }
    @if (control()?.filled() && control()?.canClear()) {
      <button
        vdButton
        type="button"
        variant="ghost"
        iconOnly
        slot="end"
        class="vd-search-input__clear"
        [size]="control()?.size() ?? 'md'"
        [attr.aria-label]="t().clearLabel"
        [attr.aria-controls]="control()?.id() ?? null"
        (mousedown)="control()?.preserveFocus($event)"
        (click)="control()?.clear()"
      >
        <vd-icon name="x" />
      </button>
    } @else {
      <ng-content select="[slot=end]" />
    }
  `,
  host: {
    class: 'vd-input-group vd-search-input',
    '[attr.data-filled]': 'control()?.filled() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdSearchInputGroup {
  /** Shows a spinner while results load; the field stays editable. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly clearLabel = input<string>();
  readonly loadingLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('searchInput', {
    clearLabel: this.clearLabel,
    loadingLabel: this.loadingLabel,
  });
  protected readonly control = contentChild(VdSearchInput);
}

export const VD_SEARCH_INPUT = [VdSearchInputGroup, VdSearchInput] as const;
