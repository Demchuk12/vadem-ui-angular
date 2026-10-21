import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';

export type VdCardVariant = 'default' | 'raised';

/**
 * Surface container. Interactive cards (links, buttons, or `interactive`) get the
 * cursor-following glow. Spec: specs/card.md
 */
@Directive({
  selector: '[vdCard]',
  host: {
    class: 'vd-card',
    '[attr.data-variant]': 'variant()',
    '[attr.data-interactive]': 'isInteractive() ? "" : null',
  },
})
export class VdCard {
  readonly variant = input<VdCardVariant>('default');
  /**
   * Hover/glow treatment for cards that act as one target. Automatic on `<a>`/`<button>`;
   * set it on a container whose primary link uses `vdCardLink`.
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly nativeInteractive = this.el.tagName === 'A' || this.el.tagName === 'BUTTON';
  protected readonly isInteractive = computed(() => this.interactive() || this.nativeInteractive);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Plain DOM listener: pointermove must not trigger change detection.
    afterNextRender(() => {
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || !this.isInteractive()) return;
        const r = this.el.getBoundingClientRect();
        this.el.style.setProperty('--vd-x', `${e.clientX - r.left}px`);
        this.el.style.setProperty('--vd-y', `${e.clientY - r.top}px`);
      };
      this.el.addEventListener('pointermove', move, { passive: true });
      destroyRef.onDestroy(() => this.el.removeEventListener('pointermove', move));
    });
  }
}

/** Card header: title, description, and optional actions at the end. */
@Directive({ selector: '[vdCardHeader]', host: { class: 'vd-card__header' } })
export class VdCardHeader {}

@Directive({ selector: '[vdCardTitle]', host: { class: 'vd-card__title' } })
export class VdCardTitle {}

@Directive({ selector: '[vdCardDescription]', host: { class: 'vd-card__description' } })
export class VdCardDescription {}

@Directive({ selector: '[vdCardFooter]', host: { class: 'vd-card__footer' } })
export class VdCardFooter {}

/**
 * The card's primary link. Its hit area stretches over the whole card (pseudo-element), so the
 * card is clickable while keeping one tab stop and a short accessible name.
 */
@Directive({ selector: 'a[vdCardLink]', host: { class: 'vd-card__link' } })
export class VdCardLink {}

export const VD_CARD = [
  VdCard,
  VdCardHeader,
  VdCardTitle,
  VdCardDescription,
  VdCardFooter,
  VdCardLink,
] as const;
