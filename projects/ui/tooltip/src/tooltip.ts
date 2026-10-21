import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VD_TOOLTIP_DEFAULTS, VdTooltipController } from './core/tooltip-controller';

export type VdTooltipPlacement = 'top' | 'bottom' | 'start' | 'end';

/**
 * Short plain-text tooltip on hover and keyboard focus. Rendered as a `popover="manual"`
 * element in the top layer and positioned with CSS anchor positioning. Spec: specs/tooltip.md
 */
@Directive({
  selector: '[vdTooltip]',
})
export class VdTooltip {
  readonly vdTooltip = input.required<string>();
  readonly vdTooltipPlacement = input<VdTooltipPlacement>('top');
  readonly vdTooltipDelay = input(VD_TOOLTIP_DEFAULTS.showDelay, { transform: numberAttribute });

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly id = vdUniqueId('vd-tooltip');
  private readonly tip = signal<HTMLElement | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Browser-only: create the popover, wire ARIA and anchoring.
    afterNextRender(() => {
      const doc = this.el.ownerDocument;
      const tip = doc.createElement('div');
      tip.id = this.id;
      tip.className = 'vd-tooltip';
      tip.setAttribute('role', 'tooltip');
      tip.setAttribute('popover', 'manual');

      const anchor = `--${this.id}`;
      this.el.style.setProperty('anchor-name', anchor);
      tip.style.setProperty('position-anchor', anchor);
      // Inside a modal dialog everything outside it is inert; keep the tooltip in the dialog.
      (this.el.closest('dialog') ?? doc.body).appendChild(tip);

      // A trigger without its own name (icon button) is *labelled* by the tooltip;
      // otherwise the tooltip is a description.
      const named =
        this.el.hasAttribute('aria-label') ||
        this.el.hasAttribute('aria-labelledby') ||
        !!this.el.textContent?.trim();
      this.el.setAttribute(named ? 'aria-describedby' : 'aria-labelledby', this.id);

      const controller = new VdTooltipController(this.el, tip, {
        ...VD_TOOLTIP_DEFAULTS,
        showDelay: this.vdTooltipDelay(),
      });
      this.tip.set(tip);

      destroyRef.onDestroy(() => {
        controller.destroy();
        tip.remove();
        this.el.style.removeProperty('anchor-name');
        this.el.removeAttribute(named ? 'aria-describedby' : 'aria-labelledby');
      });
    });

    effect(() => {
      const tip = this.tip();
      if (!tip) return;
      tip.textContent = this.vdTooltip();
      tip.dataset['placement'] = this.vdTooltipPlacement();
    });
  }
}
