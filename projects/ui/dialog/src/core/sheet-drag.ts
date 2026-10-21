/**
 * Framework-agnostic swipe-to-dismiss for a dialog laid out as a bottom sheet.
 * The element follows the pointer through two custom properties that CSS consumes:
 *   --vd-sheet-offset   (px, translate down)
 *   --vd-sheet-progress (0..1, for fading the backdrop)
 * and gets `data-dragging` while a drag is active (CSS disables transitions then).
 */

export interface VdSheetDragOptions {
  /** True while the element is currently laid out as a sheet (read on every gesture). */
  isSheet(): boolean;
  dismissible(): boolean;
  /** Element(s) a drag may start from, e.g. the header that carries the handle. */
  handleSelector: string;
  onDismiss(): void;
}

/** Pointer travel before a press becomes a drag, so taps and clicks still work. */
export const VD_SHEET_DRAG_THRESHOLD = 6;
/** Fraction of the sheet height that dismisses on release. */
export const VD_SHEET_DISMISS_DISTANCE = 0.25;
/** Downward flick speed (px/ms) that dismisses regardless of distance. */
export const VD_SHEET_DISMISS_VELOCITY = 0.5;

const INTERACTIVE = 'button, a[href], input, select, textarea, [contenteditable], [tabindex]';

interface Sample {
  y: number;
  t: number;
}

/** Decides what a release does. Pure: exported for tests and other adapters. */
export function vdSheetShouldDismiss(offset: number, height: number, velocity: number): boolean {
  if (offset <= 0) return false;
  return offset > height * VD_SHEET_DISMISS_DISTANCE || velocity > VD_SHEET_DISMISS_VELOCITY;
}

export class VdSheetDrag {
  private pointerId: number | null = null;
  private start: Sample | null = null;
  private samples: Sample[] = [];
  private dragging = false;
  private offset = 0;
  private height = 0;

  constructor(
    private readonly el: HTMLElement,
    private readonly options: VdSheetDragOptions,
  ) {
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onCancel);
  }

  destroy(): void {
    this.el.removeEventListener('pointerdown', this.onDown);
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerup', this.onUp);
    this.el.removeEventListener('pointercancel', this.onCancel);
    this.reset();
  }

  private readonly onDown = (event: PointerEvent) => {
    if (event.button !== 0 || !this.options.isSheet() || !this.options.dismissible()) return;
    const target = event.target as Element;
    const zone = target.closest(this.options.handleSelector);
    if (!zone || !this.el.contains(zone)) return;
    const interactive = target.closest(INTERACTIVE);
    if (interactive && zone.contains(interactive)) return;

    this.pointerId = event.pointerId;
    this.start = { y: event.clientY, t: event.timeStamp };
    this.samples = [this.start];
    this.height = this.el.getBoundingClientRect().height;
  };

  private readonly onMove = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId || !this.start) return;
    const dy = event.clientY - this.start.y;

    if (!this.dragging) {
      if (Math.abs(dy) < VD_SHEET_DRAG_THRESHOLD) return;
      this.dragging = true;
      this.el.dataset['dragging'] = '';
      this.el.setPointerCapture?.(event.pointerId);
    }

    // Follow the finger downwards; resist upward pulls (rubber band).
    this.offset = dy > 0 ? dy : dy * 0.15;
    this.samples.push({ y: event.clientY, t: event.timeStamp });
    if (this.samples.length > 6) this.samples.shift();

    const progress = this.height > 0 ? Math.min(Math.max(this.offset, 0) / this.height, 1) : 0;
    this.el.style.setProperty('--vd-sheet-offset', `${this.offset}px`);
    this.el.style.setProperty('--vd-sheet-progress', progress.toFixed(3));
  };

  private readonly onUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    const dismiss =
      this.dragging && vdSheetShouldDismiss(this.offset, this.height, this.velocity());
    this.reset();
    // With the drag state cleared, CSS transitions run from the current offset: to the closed
    // position when dismissing, back to 0 otherwise.
    if (dismiss) this.options.onDismiss();
  };

  private readonly onCancel = (event: PointerEvent) => {
    if (event.pointerId === this.pointerId) this.reset();
  };

  /** Downward speed over the most recent samples, px/ms. */
  private velocity(): number {
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    if (!first || !last || last.t === first.t) return 0;
    return (last.y - first.y) / (last.t - first.t);
  }

  private reset(): void {
    if (this.pointerId !== null && this.el.hasPointerCapture?.(this.pointerId)) {
      this.el.releasePointerCapture(this.pointerId);
    }
    this.pointerId = null;
    this.start = null;
    this.samples = [];
    this.dragging = false;
    this.offset = 0;
    delete this.el.dataset['dragging'];
    this.el.style.removeProperty('--vd-sheet-offset');
    this.el.style.removeProperty('--vd-sheet-progress');
  }
}
