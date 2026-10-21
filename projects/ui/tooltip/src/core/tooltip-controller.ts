/**
 * Framework-agnostic tooltip behavior for a trigger + a `popover="manual"` element:
 * - hover shows after a delay (instantly while another tooltip was just open: "warm" state),
 *   keyboard focus (:focus-visible) shows immediately;
 * - the tooltip itself is hoverable, so the pointer can move onto it (WCAG 1.4.13);
 * - Escape hides it without moving focus; touch input never shows it.
 */

export interface VdTooltipControllerOptions {
  /** Hover delay before showing, ms. */
  showDelay: number;
  /** Grace period after the pointer leaves, ms. */
  hideDelay: number;
}

export const VD_TOOLTIP_DEFAULTS: VdTooltipControllerOptions = { showDelay: 500, hideDelay: 120 };

/** Shared across instances: moving between triggers right after one closed shows instantly. */
let warmUntil = 0;
const WARM_MS = 600;

export class VdTooltipController {
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private hovering = false;
  private focused = false;

  constructor(
    private readonly trigger: HTMLElement,
    private readonly tooltip: HTMLElement,
    private readonly options: VdTooltipControllerOptions = VD_TOOLTIP_DEFAULTS,
  ) {
    trigger.addEventListener('pointerenter', this.onEnter);
    trigger.addEventListener('pointerleave', this.onLeave);
    tooltip.addEventListener('pointerenter', this.onEnter);
    tooltip.addEventListener('pointerleave', this.onLeave);
    trigger.addEventListener('focusin', this.onFocusIn);
    trigger.addEventListener('focusout', this.onFocusOut);
    trigger.addEventListener('pointerdown', this.onPress);
    trigger.ownerDocument.addEventListener('keydown', this.onKeydown);
  }

  get isOpen(): boolean {
    return this.tooltip.matches(':popover-open');
  }

  show(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    if (!this.isOpen && this.tooltip.isConnected) this.tooltip.showPopover();
  }

  hide(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    if (this.isOpen) {
      this.tooltip.hidePopover();
      warmUntil = Date.now() + WARM_MS;
    }
  }

  destroy(): void {
    this.hide();
    this.trigger.removeEventListener('pointerenter', this.onEnter);
    this.trigger.removeEventListener('pointerleave', this.onLeave);
    this.tooltip.removeEventListener('pointerenter', this.onEnter);
    this.tooltip.removeEventListener('pointerleave', this.onLeave);
    this.trigger.removeEventListener('focusin', this.onFocusIn);
    this.trigger.removeEventListener('focusout', this.onFocusOut);
    this.trigger.removeEventListener('pointerdown', this.onPress);
    this.trigger.ownerDocument.removeEventListener('keydown', this.onKeydown);
  }

  private readonly onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    this.hovering = true;
    clearTimeout(this.hideTimer);
    if (this.isOpen) return;
    const delay = Date.now() < warmUntil ? 0 : this.options.showDelay;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), delay);
  };

  private readonly onLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    this.hovering = false;
    clearTimeout(this.showTimer);
    if (this.focused) return;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), this.options.hideDelay);
  };

  private readonly onFocusIn = () => {
    // Only keyboard-style focus; a mouse click focuses the button too and shouldn't pop it.
    if (!this.trigger.matches(':focus-visible')) return;
    this.focused = true;
    this.show();
  };

  private readonly onFocusOut = () => {
    this.focused = false;
    if (!this.hovering) this.hide();
  };

  /** Pressing the trigger acts on it; the tooltip gets out of the way. */
  private readonly onPress = () => this.hide();

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isOpen) {
      this.hide();
      this.hovering = false;
    }
  };
}

/** Test helper: reset the shared warm-up state. */
export function vdResetTooltipWarmth(): void {
  warmUntil = 0;
}
