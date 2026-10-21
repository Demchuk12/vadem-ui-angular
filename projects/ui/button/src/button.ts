import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';

export type VdButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type VdButtonSize = 'sm' | 'md' | 'lg';

/**
 * Styles a native `<button>` or `<a>` and adds loading and consistent disabled behavior.
 * Spec: specs/button.md
 */
@Component({
  // Attribute selector keeps the native element and its semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[vdButton], a[vdButton]',
  imports: [VdIcon],
  template: `
    <ng-content select="[slot=start]" />
    <span class="vd-button__label"><ng-content /></span>
    <ng-content select="[slot=end]" />
    @if (loading()) {
      <span class="vd-button__spinner" aria-hidden="true"><vd-icon name="loader" /></span>
    }
  `,
  host: {
    class: 'vd-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-icon-only]': 'iconOnly() ? "" : null',
    '[attr.type]': 'isButton ? type() : null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': 'loading() || (!isButton && disabled()) ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? "-1" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdButton {
  readonly variant = input<VdButtonVariant>('secondary');
  readonly size = input<VdButtonSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly isButton = this.el.tagName === 'BUTTON';

  constructor() {
    // Capture listeners on the target run before bubble listeners (incl. framework ones),
    // so blocked clicks never reach consumer handlers, links, or form submission.
    const block = (event: Event) => {
      if (this.loading() || (!this.isButton && this.disabled())) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    this.el.addEventListener('click', block, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      this.el.removeEventListener('click', block, { capture: true }),
    );

    if (isDevMode()) {
      // Checked after the render pass settles: sibling directives (e.g. vdTooltip) may add the
      // name in their own afterNextRender.
      afterNextRender(() =>
        setTimeout(() => {
          const named = ['aria-label', 'aria-labelledby', 'title'].some((a) =>
            this.el.hasAttribute(a),
          );
          if (this.iconOnly() && !named) {
            console.warn(
              '[vdButton] iconOnly buttons need an accessible name (aria-label).',
              this.el,
            );
          }
        }),
      );
    }
  }
}
