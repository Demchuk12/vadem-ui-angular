import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { vdUniqueId } from '@vadem/ui/field';
import { vdTexts } from '@vadem/ui/locale';
import { vdExpandableTextParts } from './core/expandable-text';

/** Length-based plain-text disclosure with exact source preservation. */
@Component({
  selector: 'vd-expandable-text',
  imports: [VdButton],
  template: `
    <p class="vd-expandable-text__text" tabindex="-1">
      <ng-container>{{ parts().preview }}</ng-container
      ><span class="vd-expandable-text__rest" [id]="restId" [hidden]="hasMore() && !expanded()">{{
        parts().rest
      }}</span>
      @if (hasMore() && !expanded()) {
        <span aria-hidden="true">…</span>
      }
    </p>
    @if (hasMore()) {
      <button
        vdButton
        variant="ghost"
        size="sm"
        type="button"
        class="vd-expandable-text__toggle"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="restId"
        (click)="expanded.set(!expanded())"
      >
        {{ expanded() ? t().collapseLabel : t().expandLabel }}
      </button>
    }
  `,
  host: {
    class: 'vd-expandable-text',
    '[attr.data-state]':
      '!text() ? "empty" : !hasMore() ? "plain" : expanded() ? "expanded" : "collapsed"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdExpandableText {
  readonly text = input.required<string>();
  readonly previewLength = input(240);
  readonly expanded = model(false);
  readonly expandLabel = input<string>();
  readonly collapseLabel = input<string>();
  protected readonly t = vdTexts('expandableText', {
    expandLabel: this.expandLabel,
    collapseLabel: this.collapseLabel,
  });
  protected readonly parts = computed(() =>
    vdExpandableTextParts(this.text(), this.previewLength()),
  );
  protected readonly hasMore = computed(() => this.parts().rest.length > 0);
  protected readonly restId = vdUniqueId('vd-expandable-text-rest');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private recoverFocus = false;

  constructor() {
    effect(() => {
      if (this.hasMore()) return;
      // Capture focus before the view removes a no-longer-needed toggle.
      const button = this.host.querySelector('button');
      this.recoverFocus = !!button && this.host.ownerDocument.activeElement === button;
    });
    afterRenderEffect(() => {
      this.hasMore();
      if (!this.recoverFocus) return;
      this.recoverFocus = false;
      const document = this.host.ownerDocument;
      if (document.activeElement && document.activeElement !== document.body) return;
      this.host.querySelector<HTMLElement>('.vd-expandable-text__text')?.focus();
    });
  }
}
