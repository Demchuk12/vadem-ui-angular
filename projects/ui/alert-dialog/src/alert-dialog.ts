import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_DIALOG } from '@vadem/ui/dialog';
import { vdTexts } from '@vadem/ui/locale';

export type VdAlertDialogAction = () => void | Promise<void>;

/** An explicit decision with application-owned work and a safe initial focus. */
@Component({
  selector: 'vd-alert-dialog',
  imports: [VdButton, VD_DIALOG],
  template: `
    <dialog
      vdDialog
      class="vd-alert-dialog__dialog"
      role="alertdialog"
      aria-modal="true"
      [open]="open()"
      (openChange)="open.set($event)"
      [dismissible]="false"
      [attr.data-state]="state()"
      (cancel)="escape($event)"
    >
      <div
        vdDialogBody
        class="vd-alert-dialog__content"
        tabindex="0"
        role="region"
        [attr.aria-label]="title()"
      >
        <h2 vdDialogTitle>{{ title() }}</h2>
        <p vdDialogDescription>{{ description() }}</p>
        <p
          class="vd-alert-dialog__status"
          [class.vd-visually-hidden]="!pending() && !failed()"
          role="status"
          aria-atomic="true"
          [attr.data-error]="failed() ? '' : null"
        >
          {{ pending() ? t().pendingText : failed() ? t().errorText : '' }}
        </p>
      </div>
      <footer vdDialogFooter>
        <button
          vdButton
          variant="secondary"
          type="button"
          autofocus
          [attr.aria-disabled]="pending() ? 'true' : null"
          (click)="cancel()"
        >
          {{ t().cancelLabel }}
        </button>
        <button
          vdButton
          [variant]="variant()"
          type="button"
          [loading]="pending()"
          (click)="confirm()"
        >
          {{ t().confirmLabel }}
        </button>
      </footer>
    </dialog>
  `,
  host: { class: 'vd-alert-dialog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdAlertDialog {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly action = input.required<VdAlertDialogAction>();
  readonly variant = input<'primary' | 'danger'>('danger');
  readonly confirmLabel = input<string>();
  readonly cancelLabel = input<string>();
  readonly pendingText = input<string>();
  readonly errorText = input<string>();
  readonly confirmed = output<void>();
  readonly canceled = output<void>();
  readonly actionFailed = output<unknown>();
  protected readonly t = vdTexts('alertDialog', {
    confirmLabel: this.confirmLabel,
    cancelLabel: this.cancelLabel,
    pendingText: this.pendingText,
    errorText: this.errorText,
  });
  protected readonly pending = signal(false);
  protected readonly failed = signal(false);
  protected readonly state = computed(() =>
    !this.open() ? 'closed' : this.pending() ? 'pending' : this.failed() ? 'error' : 'idle',
  );
  private generation = 0;
  private destroyed = false;

  constructor() {
    effect(() => {
      this.open();
      // A visible session boundary invalidates work without claiming to abort it.
      this.generation++;
      this.pending.set(false);
      this.failed.set(false);
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.generation++;
    });
  }
  protected escape(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cancel();
  }
  protected cancel(): void {
    if (!this.open() || this.pending()) return;
    this.generation++;
    this.failed.set(false);
    this.open.set(false);
    this.canceled.emit();
  }
  protected async confirm(): Promise<void> {
    if (!this.open() || this.pending()) return;
    const action = this.action();
    const generation = ++this.generation;
    this.failed.set(false);
    this.pending.set(true);
    try {
      await action();
      if (!this.current(generation)) return;
      this.pending.set(false);
      this.open.set(false);
      this.confirmed.emit();
    } catch (error: unknown) {
      if (!this.current(generation)) return;
      this.pending.set(false);
      this.failed.set(true);
      this.actionFailed.emit(error);
    }
  }
  private current(generation: number): boolean {
    return !this.destroyed && this.open() && generation === this.generation;
  }
}
