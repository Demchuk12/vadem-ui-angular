import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { vdTexts } from '@vadem/ui/locale';
import { VdMenuController } from './core/menu-controller';
import type { VdMenu } from './menu';

/** Touch hold that opens the menu where `contextmenu` does not fire (iOS Safari). */
const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 10;

/** One controller and one virtual anchor per menu, shared by every region that opens it. */
interface Shared {
  anchor: HTMLElement;
  controller: VdMenuController;
  opener: HTMLElement | null;
  users: number;
}
const shared = new WeakMap<HTMLElement, Shared>();

function acquire(menu: VdMenu, doc: Document): Shared {
  let entry = shared.get(menu.el);
  if (!entry) {
    const anchor = doc.createElement('span');
    anchor.className = 'vd-context-menu__anchor';
    anchor.setAttribute('aria-hidden', 'true');
    const name = `--${vdUniqueId('vd-context-anchor')}`;
    anchor.style.setProperty('anchor-name', name);
    menu.el.style.setProperty('position-anchor', name);
    // Next to the menu, so it shares any dialog's top layer and inert state.
    (menu.el.parentElement ?? doc.body).appendChild(anchor);
    const created: Shared = {
      anchor,
      opener: null,
      users: 0,
      controller: new VdMenuController(anchor, menu.el, {
        items: () => menu.items(),
        returnFocusTo: () => created.opener,
      }),
    };
    entry = created;
    shared.set(menu.el, entry);
  }
  entry.users++;
  return entry;
}

function release(menu: VdMenu): void {
  const entry = shared.get(menu.el);
  if (!entry || --entry.users > 0) return;
  entry.controller.destroy();
  entry.anchor.remove();
  shared.delete(menu.el);
}

/**
 * Opens a `vdMenu` at the pointer on right-click / long-press, or at the focused element on
 * the ContextMenu key and Shift+F10. Spec: specs/menu.md
 */
@Directive({
  selector: '[vdContextMenu]',
  host: {
    class: 'vd-context-menu-target',
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class VdContextMenu {
  readonly vdContextMenu = input.required<VdMenu>();
  /** Accessible name of the menu while this region opened it. */
  readonly label = input<string>();
  /** Fires before the menu opens, so the consumer can point it at this region's item. */
  readonly opened = output<void>();

  protected readonly t = vdTexts('contextMenu', { label: this.label });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private entry: Shared | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.pressTimer);
      if (this.entry) release(this.vdContextMenu());
    });
  }

  protected onContextMenu(event: MouseEvent): void {
    // Shift+right-click keeps the browser's own menu (copy, inspect) available.
    if (event.shiftKey && event.button === 2) return;
    event.preventDefault();
    this.openAt(event.clientX, event.clientY, event.target as HTMLElement);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keyboardMenu = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
    if (!keyboardMenu) return;
    event.preventDefault();
    const target = (event.target as HTMLElement) ?? this.el;
    const rect = target.getBoundingClientRect();
    const rtl = this.doc.defaultView?.getComputedStyle(target).direction === 'rtl';
    this.openAt(rtl ? rect.right : rect.left, rect.bottom, target);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return;
    const { clientX: x, clientY: y } = event;
    const target = event.target as HTMLElement;
    const cancel = (e?: PointerEvent) => {
      if (
        e &&
        e.type === 'pointermove' &&
        Math.hypot(e.clientX - x, e.clientY - y) < LONG_PRESS_SLOP
      )
        return;
      clearTimeout(this.pressTimer);
      this.el.removeEventListener('pointermove', cancel);
      this.el.removeEventListener('pointerup', cancel);
      this.el.removeEventListener('pointercancel', cancel);
    };
    this.el.addEventListener('pointermove', cancel);
    this.el.addEventListener('pointerup', cancel);
    this.el.addEventListener('pointercancel', cancel);
    clearTimeout(this.pressTimer);
    this.pressTimer = setTimeout(() => {
      cancel();
      this.openAt(x, y, target);
    }, LONG_PRESS_MS);
  }

  private openAt(x: number, y: number, origin: HTMLElement): void {
    const menu = this.vdContextMenu();
    this.entry ??= acquire(menu, this.doc);
    // Android also fires contextmenu after a long press; one opening is enough.
    if (this.entry.controller.isOpen && this.entry.opener === this.focusable(origin)) return;
    this.opened.emit();
    this.entry.opener = this.focusable(origin);
    this.place(this.entry.anchor, x, y);
    menu.el.setAttribute('aria-label', this.t().label);
    menu.labelledBy.set(null);
    this.entry.controller.close(false);
    this.entry.controller.open('first');
  }

  /**
   * Puts the zero-size anchor at viewport point (x, y). An ancestor with a transform, filter or
   * container query becomes the fixed containing block, so the first guess is measured and
   * corrected by the difference. Insets stay logical: in RTL inline-start grows leftwards.
   */
  private place(anchor: HTMLElement, x: number, y: number): void {
    const rtl = this.doc.defaultView?.getComputedStyle(anchor).direction === 'rtl';
    let inline = rtl ? this.doc.documentElement.clientWidth - x : x;
    let block = y;
    const set = () => {
      anchor.style.setProperty('--vd-context-x', `${inline}px`);
      anchor.style.setProperty('--vd-context-y', `${block}px`);
    };
    set();
    const rect = anchor.getBoundingClientRect();
    inline += rtl ? rect.left - x : x - rect.left;
    block += y - rect.top;
    set();
  }

  /** Focus returns to the nearest focusable element of this region, or the region itself. */
  private focusable(origin: HTMLElement): HTMLElement {
    const candidate = origin.closest<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]',
    );
    return candidate && this.el.contains(candidate) ? candidate : this.el;
  }
}
