import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ViewEncapsulation,
  inject,
  input,
  output,
} from '@angular/core';

export type VdBuzzerState = 'locked' | 'ready' | 'won' | 'spent';

/** Long enough for the click that follows a pointer release, short enough to never eat a later one. */
const CLICK_AFTER_RELEASE_MS = 100;

/**
 * A large press-to-answer button that reacts on pointer down, because the first press wins.
 * Spec: specs/buzzer.md
 */
@Component({
  // Attribute selector keeps the native element and its semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[vdBuzzer]',
  template: `<span class="vd-buzzer__label"><ng-content /></span>`,
  host: {
    class: 'vd-buzzer',
    type: 'button',
    '[attr.data-state]': 'state()',
    '[attr.aria-disabled]': 'state() === "ready" ? null : "true"',
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdBuzzer {
  /** Stays focusable in every state, so a keyboard user keeps their place between questions. */
  readonly state = input<VdBuzzerState>('locked');
  /** One press: pointer down, or a click from the keyboard and assistive technology. */
  readonly buzz = output<void>();

  private readonly document = inject(DOCUMENT);
  private pressedByPointer = false;

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.pressedByPointer = true;
    const release = () => {
      this.document.removeEventListener('pointerup', release);
      this.document.removeEventListener('pointercancel', release);
      // A release outside the button produces no click, so the flag has to clear itself.
      setTimeout(() => (this.pressedByPointer = false), CLICK_AFTER_RELEASE_MS);
    };
    this.document.addEventListener('pointerup', release);
    this.document.addEventListener('pointercancel', release);
    this.press();
  }

  protected onClick(): void {
    // The click that ends a pointer press was already counted on pointer down.
    if (this.pressedByPointer) {
      this.pressedByPointer = false;
      return;
    }
    this.press();
  }

  private press(): void {
    if (this.state() === 'ready') this.buzz.emit();
  }
}
