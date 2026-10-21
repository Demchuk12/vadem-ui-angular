import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { VdButton, type VdButtonSize, type VdButtonVariant } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';

@Component({
  selector: 'vd-copy-button',
  imports: [VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vd-copy-button', '[attr.data-state]': 'state()' },
  template: `
    <button
      vdButton
      class="vd-copy-button__button"
      type="button"
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [iconOnly]="iconOnly()"
      [loading]="busy()"
      [attr.aria-label]="accessibleLabel()"
      [attr.title]="iconOnly() ? title() : null"
      (click)="copy()"
    >
      <vd-icon
        slot="start"
        [name]="state() === 'copied' ? 'check' : state() === 'error' ? 'alert-circle' : 'copy'"
        class="vd-copy-button__icon"
      />
      @if (!iconOnly()) {
        <span class="vd-copy-button__labels" aria-hidden="true">
          <span [attr.data-visible]="state() === 'idle' ? '' : null">{{ t().label }}</span>
          <span [attr.data-visible]="state() === 'copying' ? '' : null">{{
            t().copyingLabel
          }}</span>
          <span [attr.data-visible]="state() === 'copied' ? '' : null">{{ t().copiedLabel }}</span>
          <span [attr.data-visible]="state() === 'error' ? '' : null">{{ t().errorLabel }}</span>
        </span>
      }
    </button>
    <span class="vd-visually-hidden" role="status" aria-atomic="true">{{ announcement() }}</span>
  `,
})
export class VdCopyButton {
  readonly value = input.required<string>();
  readonly variant = input<VdButtonVariant>('secondary');
  readonly size = input<VdButtonSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly label = input<string>();
  readonly copyingLabel = input<string>();
  readonly copiedLabel = input<string>();
  readonly errorLabel = input<string>();
  readonly errorMessage = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('copyButton', {
    label: this.label,
    copyingLabel: this.copyingLabel,
    copiedLabel: this.copiedLabel,
    errorLabel: this.errorLabel,
    errorMessage: this.errorMessage,
  });
  readonly copied = output<void>();
  readonly copyFailed = output<void>();

  protected readonly state = signal<'idle' | 'copying' | 'copied' | 'error'>('idle');
  protected readonly busy = signal(false);
  protected readonly announcement = computed(() => {
    switch (this.state()) {
      case 'copying':
        return this.t().copyingLabel;
      case 'copied':
        return this.t().copiedLabel;
      case 'error':
        return this.t().errorMessage;
      default:
        return '';
    }
  });
  protected readonly accessibleLabel = computed(() => {
    if (this.iconOnly() || this.state() === 'idle') return this.t().label;
    const feedback =
      this.state() === 'copying'
        ? this.t().copyingLabel
        : this.state() === 'copied'
          ? this.t().copiedLabel
          : this.t().errorLabel;
    return `${this.t().label}: ${feedback}`;
  });
  protected readonly title = computed(() => this.announcement() || this.t().label);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private revision = 0;

  constructor() {
    effect(() => {
      this.value();
      this.revision++;
      this.state.set(untracked(this.busy) ? 'copying' : 'idle');
    });
  }

  protected async copy(): Promise<void> {
    if (this.disabled() || this.busy()) return;
    const value = this.value();
    const revision = this.revision;
    this.busy.set(true);
    this.state.set('copying');
    let succeeded = false;
    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (!clipboard?.writeText) throw new Error('Clipboard writing is unavailable');
      await clipboard.writeText(value);
      succeeded = true;
    } catch {
      // Policy failures remain retryable and do not leak exception details or clipboard data.
    }
    if (this.destroyRef.destroyed) return;
    this.busy.set(false);
    if (revision !== this.revision || value !== this.value()) {
      this.state.set('idle');
      return;
    }
    this.state.set(succeeded ? 'copied' : 'error');
    if (succeeded) this.copied.emit();
    else this.copyFailed.emit();
  }
}
