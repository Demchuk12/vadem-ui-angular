/**
 * Framework-agnostic controller for a native modal `<dialog>`: opening/closing, Escape and
 * light-dismiss policy, and close notification. The platform handles focus trapping, inert
 * background, top layer and focus restoration.
 */

export interface VdDialogControllerOptions {
  /** Called after the dialog closed (any reason) with its `returnValue`. */
  onClose(returnValue: string): void;
  /** Whether Escape and backdrop clicks may close the dialog. Read on every attempt. */
  dismissible(): boolean;
}

/** True when the point lies outside the rectangle (i.e. on the ::backdrop). */
export function vdIsOutside(rect: DOMRectReadOnly, x: number, y: number): boolean {
  return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
}

/**
 * Width of the root scrollbar gutter on each physical side. Fixed boxes (and top-layer
 * dialogs) stop at the gutter that `scrollbar-gutter: stable` keeps reserved; which side it is
 * on depends on the engine and direction, so it is measured with a fixed probe.
 */
export function vdViewportGutters(doc: Document): { left: number; right: number } {
  const view = doc.defaultView;
  if (!view || !doc.body) return { left: 0, right: 0 };
  const probe = doc.createElement('div');
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none';
  doc.body.append(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  // No layout (e.g. jsdom): nothing to compensate.
  if (rect.width === 0) return { left: 0, right: 0 };
  return {
    left: Math.max(0, Math.round(rect.left)),
    right: Math.max(0, Math.round(view.innerWidth - rect.right)),
  };
}

export class VdDialogController {
  private pressStartedOnBackdrop = false;

  constructor(
    private readonly dialog: HTMLDialogElement,
    private readonly options: VdDialogControllerOptions,
  ) {
    dialog.addEventListener('close', this.onClose);
    dialog.addEventListener('cancel', this.onCancel);
    dialog.addEventListener('pointerdown', this.onPointerDown);
    dialog.addEventListener('click', this.onClick);
  }

  get isOpen(): boolean {
    return this.dialog.open;
  }

  open(): void {
    if (!this.dialog.open) {
      // Drawers reach over the scrollbar gutter to the real viewport edge (see dialog.css).
      const gutters = vdViewportGutters(this.dialog.ownerDocument);
      this.dialog.style.setProperty('--vd-viewport-gutter-left', `${gutters.left}px`);
      this.dialog.style.setProperty('--vd-viewport-gutter-right', `${gutters.right}px`);
      this.dialog.returnValue = '';
      this.dialog.showModal();
    }
  }

  close(returnValue = ''): void {
    if (this.dialog.open) this.dialog.close(returnValue);
  }

  destroy(): void {
    this.dialog.removeEventListener('close', this.onClose);
    this.dialog.removeEventListener('cancel', this.onCancel);
    this.dialog.removeEventListener('pointerdown', this.onPointerDown);
    this.dialog.removeEventListener('click', this.onClick);
  }

  private readonly onClose = () => {
    // A queued close event can arrive after the consumer has already reopened the dialog.
    if (!this.dialog.open) this.options.onClose(this.dialog.returnValue);
  };

  /** Escape. Prevented for non-dismissible dialogs. */
  private readonly onCancel = (event: Event) => {
    if (!this.options.dismissible()) event.preventDefault();
  };

  // Light dismiss: only when the press both starts and ends on the backdrop, so dragging a text
  // selection out of the dialog doesn't close it. Keyboard "clicks" target inner elements.
  private readonly onPointerDown = (event: PointerEvent) => {
    this.pressStartedOnBackdrop = this.isBackdropEvent(event);
  };

  private readonly onClick = (event: MouseEvent) => {
    const fromBackdrop = this.pressStartedOnBackdrop && this.isBackdropEvent(event);
    this.pressStartedOnBackdrop = false;
    if (fromBackdrop && this.options.dismissible()) this.close();
  };

  private isBackdropEvent(event: MouseEvent): boolean {
    return (
      event.target === this.dialog &&
      vdIsOutside(this.dialog.getBoundingClientRect(), event.clientX, event.clientY)
    );
  }
}
