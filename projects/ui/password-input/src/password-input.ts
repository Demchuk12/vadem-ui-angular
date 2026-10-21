import { DOCUMENT } from '@angular/common';
import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';
import { vdTexts } from '@vadem/ui/locale';

/** Native password value and forms accessor remain on the input. This directive owns type. */
@Directive({
  selector: 'input[vdPasswordInput]',
  exportAs: 'vdPasswordInput',
  host: { class: 'vd-password-input__input', '[type]': 'revealed() ? "text" : "password"' },
})
export class VdPasswordInput extends VdInput {
  readonly element: HTMLInputElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly visible = signal(false);
  readonly revealed = this.visible.asReadonly();
  private readonly unavailable = signal(true);
  readonly locked = this.unavailable.asReadonly();

  constructor() {
    super();
    afterEveryRender(() => {
      this.unavailable.set(this.element.disabled);
      if (this.element.disabled && this.visible()) this.setVisible(false);
    });
  }

  /** Pointer activation while editing preserves input focus; keyboard focus stays on the button. */
  preserveEditingFocus(event: MouseEvent): void {
    if (event.button === 0 && this.document.activeElement === this.element) event.preventDefault();
  }

  toggle(): void {
    if (this.element.disabled) return;
    this.setVisible(!this.visible());
  }

  private setVisible(visible: boolean): void {
    const { selectionStart, selectionEnd, selectionDirection, scrollLeft } = this.element;
    this.visible.set(visible);
    // Update synchronously so restoring the range follows the actual native type change.
    this.element.type = visible ? 'text' : 'password';
    if (selectionStart !== null && selectionEnd !== null)
      this.element.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? 'none');
    this.element.scrollLeft = scrollLeft;
  }
}

@Component({
  selector: 'vd-password-input',
  imports: [VdButton, VdIcon],
  template: `
    <ng-content select="[slot=start]" />
    <ng-content select="input[vdPasswordInput]" />
    <button
      vdButton
      type="button"
      variant="ghost"
      iconOnly
      slot="end"
      [size]="control()?.size() ?? 'md'"
      [disabled]="control()?.locked() ?? true"
      [attr.aria-label]="t().revealLabel"
      [attr.aria-pressed]="control()?.revealed() ?? false"
      [attr.aria-controls]="control()?.id() ?? null"
      (mousedown)="control()?.preserveEditingFocus($event)"
      (click)="control()?.toggle()"
    >
      <vd-icon [name]="control()?.revealed() ? 'eye-off' : 'eye'" />
    </button>
  `,
  host: {
    class: 'vd-input-group vd-password-input',
    '[attr.data-revealed]': 'control()?.revealed() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdPasswordInputGroup {
  /** Stable toggle name; aria-pressed conveys whether revealing is enabled. */
  readonly revealLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('passwordInput', { revealLabel: this.revealLabel });
  protected readonly control = contentChild(VdPasswordInput);
}

export const VD_PASSWORD_INPUT = [VdPasswordInputGroup, VdPasswordInput] as const;
