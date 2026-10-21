import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import { vdCharacterCount } from './core/character-count';

/** Advisory text length; validation, native value binding and IME remain application-owned. */
@Component({
  selector: 'vd-character-count',
  imports: [VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vd-character-count', '[attr.data-state]': 'count().state' },
  template: `
    <span class="vd-character-count__content" [id]="descriptionId()">
      <bdi class="vd-character-count__used" [attr.dir]="count().limit === null ? 'auto' : 'ltr'">{{
        t().countText(count().used, count().limit)
      }}</bdi>
      @if (message()) {
        <span class="vd-character-count__message">
          @if (count().state === 'over') {
            <vd-icon name="alert-circle" />
          }
          <span>{{ message() }}</span>
        </span>
      }
    </span>
    <span class="vd-visually-hidden" role="status" aria-atomic="true">{{ announcement() }}</span>
  `,
})
export class VdCharacterCount {
  readonly value = input('');
  readonly maxLength = input<number | null>(null);
  readonly descriptionId = input(vdUniqueId('vd-character-count'));
  readonly controlId = input<string>();
  readonly countText = input<(used: number, limit: number | null) => string>();
  readonly remainingText = input<(remaining: number) => string>();
  readonly overText = input<(excess: number) => string>();
  readonly limitText = input<string>();
  protected readonly t = vdTexts('characterCount', {
    countText: this.countText,
    remainingText: this.remainingText,
    overText: this.overText,
    limitText: this.limitText,
  });
  protected readonly count = computed(() => vdCharacterCount(this.value(), this.maxLength()));
  protected readonly message = computed(() => {
    const { remaining } = this.count();
    return remaining === null
      ? ''
      : remaining < 0
        ? this.t().overText(-remaining)
        : remaining === 0
          ? this.t().limitText
          : this.t().remainingText(remaining);
  });
  protected readonly announcement = signal('');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    let initial = true;
    effect((onCleanup) => {
      const id = this.controlId();
      const { used, limit } = this.count();
      const text = [this.t().countText(used, limit), this.message()].filter(Boolean).join('. ');
      if (initial) {
        initial = false;
        return;
      }
      this.announcement.set('');
      const view = this.host.ownerDocument.defaultView;
      if (!id || !view) return;
      const editable =
        'input:not(:disabled):not([readonly]), textarea:not(:disabled):not([readonly])';
      const control = this.host.ownerDocument.activeElement;
      if (control?.id !== id || !control.matches(editable)) return;
      const timer = view.setTimeout(() => {
        if (this.host.ownerDocument.activeElement === control && control.matches(editable))
          this.announcement.set(text);
      }, 1000);
      onCleanup(() => view.clearTimeout(timer));
    });
  }
}
