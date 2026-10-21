import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injectable,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import {
  VD_TOAST_DEFAULTS,
  VdToast,
  VdToastInput,
  VdToastStore,
  VdToastVariant,
} from './core/toast-store';
import { vdTexts } from '@vadem/ui/locale';

/** App-wide toast queue. Render it once with `<vd-toaster />`. Spec: specs/toast.md */
@Injectable({ providedIn: 'root' })
export class VdToaster {
  readonly store = new VdToastStore(VD_TOAST_DEFAULTS);
  private readonly list = signal<readonly VdToast[]>([]);
  readonly toasts = this.list.asReadonly();

  constructor() {
    this.store.subscribe((t) => this.list.set(t));
    inject(DestroyRef).onDestroy(() => this.store.destroy());
  }

  show(toast: VdToastInput): number {
    return this.store.show(toast);
  }

  success(title: string, description?: string): number {
    return this.show({ title, description, variant: 'success' });
  }

  error(title: string, description?: string): number {
    return this.show({ title, description, variant: 'danger' });
  }

  dismiss(id: number): void {
    this.store.dismiss(id);
  }
}

const ICONS: Partial<Record<VdToastVariant, VdIconName>> = {
  success: 'check-circle',
  danger: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

@Component({
  selector: 'vd-toaster',
  imports: [VdButton, VdIcon],
  template: `
    <ol class="vd-toaster__list" aria-live="polite" aria-relevant="additions">
      @for (toast of toaster.toasts(); track toast.id) {
        <li
          class="vd-toast"
          [attr.data-variant]="toast.variant"
          [attr.data-state]="toast.state"
          [attr.role]="toast.variant === 'danger' ? 'alert' : null"
          aria-atomic="true"
        >
          @if (icons[toast.variant]; as icon) {
            <vd-icon class="vd-toast__icon" [name]="icon" />
          }
          <div class="vd-toast__content">
            <p class="vd-toast__title">{{ toast.title }}</p>
            @if (toast.description) {
              <p class="vd-toast__description">{{ toast.description }}</p>
            }
          </div>
          @if (toast.action; as action) {
            <button
              vdButton
              size="sm"
              class="vd-toast__action"
              (click)="action.onClick(); toaster.dismiss(toast.id)"
            >
              {{ action.label }}
            </button>
          }
          <button
            vdButton
            variant="ghost"
            size="sm"
            iconOnly
            class="vd-toast__close"
            [attr.aria-label]="t().closeLabel"
            (click)="toaster.dismiss(toast.id)"
          >
            <vd-icon name="x" />
          </button>
        </li>
      }
    </ol>
  `,
  host: {
    class: 'vd-toaster',
    popover: 'manual',
    role: 'region',
    '[attr.aria-label]': 't().label',
    '(pointerenter)': 'toaster.store.pause()',
    '(pointerleave)': 'resumeUnlessFocused()',
    '(focusin)': 'toaster.store.pause()',
    '(focusout)': 'resumeIfLeaving($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdToasterOutlet {
  /** Landmark name for the region (localize it). */
  readonly label = input<string>();
  readonly closeLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('toast', { label: this.label, closeLabel: this.closeLabel });

  protected readonly toaster = inject(VdToaster);
  protected readonly icons = ICONS;
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly hasToasts = computed(() => this.toaster.toasts().length > 0);

  constructor() {
    // Browser-only: keep the region in the top layer while it has toasts.
    afterRenderEffect(() => {
      const show = this.hasToasts();
      if (!this.el.showPopover) return;
      const open = this.el.matches(':popover-open');
      if (show && !open) this.el.showPopover();
      if (!show && open) this.el.hidePopover();
    });
  }

  protected resumeUnlessFocused(): void {
    if (!this.el.contains(this.el.ownerDocument.activeElement)) this.toaster.store.resume();
  }

  protected resumeIfLeaving(event: FocusEvent): void {
    if (!this.el.contains(event.relatedTarget as Node | null) && !this.el.matches(':hover')) {
      this.toaster.store.resume();
    }
  }
}
