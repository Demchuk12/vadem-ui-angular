import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';

export type VdAlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
/** `banner`: full-width strip at the top of a page or region (maintenance, cookies, updates). */
export type VdAlertLayout = 'inline' | 'banner';

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The next tabbable element after `host` in document order, else the previous one. */
function neighbourFocusTarget(host: HTMLElement): HTMLElement | null {
  const candidates = Array.from(host.ownerDocument.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) => !host.contains(el) && el.getClientRects().length > 0 && !el.closest('[inert]'),
  );
  const after = candidates.find(
    (el) => host.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  return (
    after ??
    candidates
      .reverse()
      .find((el) => host.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) ??
    null
  );
}

const ICONS: Record<VdAlertVariant, VdIconName> = {
  neutral: 'info',
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

/**
 * Inline message in the page flow (callout). Static by default; add `role="alert"` (urgent) or
 * `role="status"` when it appears in response to an action. Spec: specs/alert.md
 */
@Component({
  // Attribute selector: the consumer picks the element (div, section, li...).
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[vdAlert]',
  imports: [VdButton, VdIcon],
  template: `
    @if (iconName(); as name) {
      <vd-icon [name]="name" class="vd-alert__icon" />
    }
    <div class="vd-alert__content"><ng-content /></div>
    <ng-content select="[slot=end]" />
    @if (dismissible()) {
      <button
        vdButton
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        slot="end"
        class="vd-alert__dismiss"
        [attr.aria-label]="t().dismissLabel"
        (click)="onDismiss()"
      >
        <vd-icon name="x" />
      </button>
    }
  `,
  host: {
    class: 'vd-alert',
    '[attr.data-variant]': 'variant()',
    '[attr.data-layout]': 'layout() === "banner" ? "banner" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdAlert {
  readonly variant = input<VdAlertVariant>('neutral');
  /** Leading icon; defaults to the variant's icon. `null` hides it. */
  readonly icon = input<VdIconName | null | undefined>(undefined);
  readonly layout = input<VdAlertLayout>('inline');
  /** Adds a close button. The consumer removes the alert (and remembers the choice) on `dismiss`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input<string>();
  /** Emitted when the close button is activated; focus has already moved to a neighbour. */
  readonly dismiss = output<void>();

  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('alert', { dismissLabel: this.dismissLabel });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  /** Removing a focused element drops focus to <body>; hand it to the next control first. */
  protected onDismiss(): void {
    if (this.el.contains(this.el.ownerDocument.activeElement))
      neighbourFocusTarget(this.el)?.focus();
    this.dismiss.emit();
  }

  protected readonly iconName = computed(() => {
    const icon = this.icon();
    return icon === undefined ? ICONS[this.variant()] : icon;
  });
}

/** Bold first line of an alert. */
@Directive({ selector: '[vdAlertTitle]', host: { class: 'vd-alert__title' } })
export class VdAlertTitle {}

export const VD_ALERT = [VdAlert, VdAlertTitle] as const;
