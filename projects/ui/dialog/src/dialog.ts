import {
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdDialogController } from './core/dialog-controller';
import { VdSheetDrag } from './core/sheet-drag';

export type VdDialogSize = 'sm' | 'md' | 'lg';
/** `center`: modal dialog. `start` / `end`: drawer attached to that inline edge. */
export type VdDialogPlacement = 'center' | 'start' | 'end';

/**
 * Modal dialog on the native `<dialog>` element (top layer, focus trap, inert page and focus
 * restore come from the platform). Spec: specs/dialog.md
 */
@Directive({
  selector: 'dialog[vdDialog]',
  exportAs: 'vdDialog',
  host: {
    class: 'vd-dialog',
    '[attr.data-size]': 'size()',
    '[attr.data-placement]': 'placement() === "center" ? null : placement()',
    '[attr.data-dismissible]': 'dismissible() ? "" : null',
    '[attr.aria-labelledby]': 'titleId()',
    '[attr.aria-describedby]': 'descriptionId()',
  },
})
export class VdDialog {
  /** Two-way open state. Also controllable with `show()` / `close()`. */
  readonly open = model(false);
  readonly size = input<VdDialogSize>('md');
  /** Drawers slide in from an inline edge; below the sheet breakpoint every dialog is a sheet. */
  readonly placement = input<VdDialogPlacement>('center');
  /** Escape and backdrop click close the dialog. Turn off for flows that need an explicit choice. */
  readonly dismissible = input(true, { transform: booleanAttribute });
  /** Emits the dialog's `returnValue` ('' when dismissed) after it closes. */
  readonly closed = output<string>();

  readonly titleId = signal<string | null>(null);
  readonly descriptionId = signal<string | null>(null);

  private readonly el: HTMLDialogElement = inject(ElementRef).nativeElement;
  private controller?: VdDialogController;
  private sheetDrag?: VdSheetDrag;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.controller?.destroy();
      this.sheetDrag?.destroy();
    });
    // Browser-only: create the controller lazily and sync the model to the native element.
    afterRenderEffect(() => {
      const open = this.open();
      this.controller ??= new VdDialogController(this.el, {
        dismissible: () => this.dismissible(),
        onClose: (value) => {
          this.open.set(false);
          this.closed.emit(value);
        },
      });
      // Swipe down to dismiss when CSS lays the dialog out as a bottom sheet.
      this.sheetDrag ??= new VdSheetDrag(this.el, {
        handleSelector: '.vd-dialog__header',
        isSheet: () =>
          this.el.ownerDocument.defaultView
            ?.getComputedStyle(this.el)
            .getPropertyValue('--vd-dialog-sheet')
            .trim() === '1',
        dismissible: () => this.dismissible(),
        onDismiss: () => this.controller?.close(''),
      });
      if (open) this.controller.open();
      else this.controller.close();
    });
  }

  show(): void {
    this.open.set(true);
  }

  close(returnValue = ''): void {
    if (this.controller?.isOpen) this.controller.close(returnValue);
    else this.open.set(false);
  }
}

@Directive({ selector: '[vdDialogHeader]', host: { class: 'vd-dialog__header' } })
export class VdDialogHeader {}

/** Dialog heading; becomes the dialog's accessible name. */
@Directive({
  selector: '[vdDialogTitle]',
  host: { class: 'vd-dialog__title', '[id]': 'id' },
})
export class VdDialogTitle {
  readonly id = vdUniqueId('vd-dialog-title');

  constructor() {
    const dialog = inject(VdDialog);
    dialog.titleId.set(this.id);
    inject(DestroyRef).onDestroy(() => dialog.titleId.set(null));
  }
}

/** Short description; becomes the dialog's accessible description. */
@Directive({
  selector: '[vdDialogDescription]',
  host: { class: 'vd-dialog__description', '[id]': 'id' },
})
export class VdDialogDescription {
  readonly id = vdUniqueId('vd-dialog-description');

  constructor() {
    const dialog = inject(VdDialog);
    dialog.descriptionId.set(this.id);
    inject(DestroyRef).onDestroy(() => dialog.descriptionId.set(null));
  }
}

@Directive({ selector: '[vdDialogBody]', host: { class: 'vd-dialog__body' } })
export class VdDialogBody {}

@Directive({ selector: '[vdDialogFooter]', host: { class: 'vd-dialog__footer' } })
export class VdDialogFooter {}

/** Closes the surrounding dialog with an optional return value. */
@Directive({
  selector: 'button[vdDialogClose]',
  host: { '(click)': 'dialog.close(vdDialogClose() ?? "")' },
})
export class VdDialogClose {
  readonly vdDialogClose = input<string | undefined>(undefined);
  protected readonly dialog = inject(VdDialog);
}

export const VD_DIALOG = [
  VdDialog,
  VdDialogHeader,
  VdDialogTitle,
  VdDialogDescription,
  VdDialogBody,
  VdDialogFooter,
  VdDialogClose,
] as const;
