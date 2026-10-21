import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';

/**
 * Draws one control boundary around a `vdInput` plus icons or buttons in
 * `[slot=start]` / `[slot=end]`. Size, focus and invalid states follow the inner input.
 * Clicking the non-interactive parts (padding, icons) focuses the input.
 */
@Component({
  selector: 'vd-input-group',
  template: `
    <ng-content select="[slot=start]" />
    <ng-content />
    <ng-content select="[slot=end]" />
  `,
  host: {
    class: 'vd-input-group',
    '(click)': 'focusInput($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdInputGroup {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  protected focusInput(event: MouseEvent): void {
    const interactive = (event.target as Element).closest(
      'button, a, input, textarea, select, [tabindex]',
    );
    // Only interactive elements *inside* the group handle their own clicks.
    if (interactive && interactive !== this.el && this.el.contains(interactive)) return;
    this.el.querySelector<HTMLElement>(':scope > .vd-input')?.focus();
  }
}
