import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';

export interface VdFormError {
  /** Raw ID of a visible, enabled, focusable control in the same document. */
  readonly target: string;
  readonly message: string;
}

/** Controlled validation navigation; the application owns validation and submit timing. */
@Component({
  selector: 'vd-form-error-summary',
  imports: [VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-form-error-summary',
    '[attr.hidden]': 'errors().length ? null : ""',
    '[attr.role]': 'errors().length ? "region" : null',
    '[attr.tabindex]': 'errors().length ? "-1" : null',
    '[attr.aria-labelledby]': 'errors().length ? titleId : null',
    '[attr.aria-describedby]': 'errors().length && t().description ? descriptionId : null',
  },
  template: `
    @if (errors().length) {
      <h2 class="vd-form-error-summary__title" [id]="titleId">
        <vd-icon name="alert-circle" /><span>{{ t().title }}</span>
      </h2>
      @if (t().description) {
        <p [id]="descriptionId">{{ t().description }}</p>
      }
      <ul class="vd-form-error-summary__list" role="list">
        @for (error of errors(); track $index) {
          <li>
            <a [href]="fragment(error.target)" (click)="navigate($event, error.target)">{{
              error.message
            }}</a>
          </li>
        }
      </ul>
    }
  `,
})
export class VdFormErrorSummary {
  readonly errors = input<readonly VdFormError[]>([]);
  readonly title = input<string>();
  readonly description = input<string>();
  protected readonly t = vdTexts('formErrorSummary', {
    title: this.title,
    description: this.description,
  });
  protected readonly titleId = vdUniqueId('vd-form-error-summary-title');
  protected readonly descriptionId = vdUniqueId('vd-form-error-summary-description');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private scrollFrame: number | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.scrollFrame !== undefined)
        this.host.ownerDocument.defaultView?.cancelAnimationFrame(this.scrollFrame);
    });
  }

  /** Call after a failed submit; passive updates deliberately do not move focus. */
  focus(): void {
    if (this.destroyRef.destroyed) return;
    afterNextRender(
      () => {
        if (!this.errors().length) return;
        this.host.focus({ preventScroll: true });
        const view = this.host.ownerDocument.defaultView;
        if (!view) return;
        if (this.scrollFrame !== undefined) view.cancelAnimationFrame(this.scrollFrame);
        // Apply scrolling after layout anchoring for newly inserted error messages.
        this.scrollFrame = view.requestAnimationFrame(() => {
          this.scrollFrame = undefined;
          if (this.errors().length && this.host.ownerDocument.activeElement === this.host)
            this.host.scrollIntoView({ block: 'start', behavior: 'instant' });
        });
      },
      { injector: this.injector },
    );
  }

  protected fragment(target: string): string {
    return `#${encodeURIComponent(target)}`;
  }

  protected navigate(event: MouseEvent, id: string): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    const target = this.host.ownerDocument.getElementById(id);
    if (
      !target ||
      target.matches(':disabled, [aria-disabled="true"]') ||
      target.closest('[hidden], [inert]') ||
      !target.getClientRects().length
    )
      return;
    target.focus();
  }
}
