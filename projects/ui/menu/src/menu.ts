import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdMenuController } from './core/menu-controller';

/** Menu panel: a `popover="auto"` with `role="menu"`. Open it with `vdMenuTrigger`. */
@Directive({
  selector: '[vdMenu]',
  exportAs: 'vdMenu',
  host: {
    class: 'vd-menu',
    role: 'menu',
    popover: 'auto',
    tabindex: '-1',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'labelledBy()',
  },
})
export class VdMenu {
  readonly id = vdUniqueId('vd-menu');
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  readonly labelledBy = signal<string | null>(null);

  items(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  }
}

/** Opens a `vdMenu`. Use on a button (works with `vdButton`). Spec: specs/menu.md */
@Directive({
  selector: 'button[vdMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'vdMenuTrigger().id',
    '[attr.data-state]': 'open() ? "open" : "closed"',
  },
})
export class VdMenuTrigger {
  readonly vdMenuTrigger = input.required<VdMenu>();
  protected readonly open = signal(false);
  private readonly el: HTMLButtonElement = inject(ElementRef).nativeElement;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const menu = this.vdMenuTrigger();
      if (!this.el.id) this.el.id = vdUniqueId('vd-menu-trigger');
      menu.labelledBy.set(this.el.id);
      const name = `--${menu.id}`;
      this.el.style.setProperty('anchor-name', name);
      menu.el.style.setProperty('position-anchor', name);
      const controller = new VdMenuController(this.el, menu.el, {
        items: () => menu.items(),
        onOpenChange: (open) => this.open.set(open),
      });
      destroyRef.onDestroy(() => controller.destroy());
    });
  }
}

export type VdMenuItemVariant = 'default' | 'danger';

@Directive({
  selector: 'button[vdMenuItem], a[vdMenuItem]',
  host: {
    class: 'vd-menu__item',
    role: 'menuitem',
    tabindex: '-1',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class VdMenuItem {
  readonly variant = input<VdMenuItemVariant>('default');
  /** Disabled items stay in the menu (discoverable) but are skipped and inert. */
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly isButton =
    (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';
}

@Directive({
  selector: '[vdMenuSeparator]',
  host: { class: 'vd-menu__separator', role: 'separator' },
})
export class VdMenuSeparator {}

/** Group heading inside a menu (mono eyebrow). Presentational. */
@Directive({
  selector: '[vdMenuLabel]',
  host: { class: 'vd-menu__label', role: 'presentation' },
})
export class VdMenuLabel {}

export const VD_MENU = [VdMenu, VdMenuTrigger, VdMenuItem, VdMenuSeparator, VdMenuLabel] as const;
