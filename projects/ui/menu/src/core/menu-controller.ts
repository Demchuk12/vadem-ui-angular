/**
 * Framework-agnostic menu button (APG): trigger + `popover="auto"` menu. Focus moves into the
 * menu (roving focus over items), arrows loop, typeahead jumps, activation or Escape closes and
 * returns focus to the trigger, Tab closes and lets focus move on.
 */
import { VdTypeahead, vdListTarget } from '@vadem/ui/keyboard';

export interface VdMenuControllerOptions {
  /** Items in DOM order (role="menuitem", including disabled ones). */
  items(): HTMLElement[];
  onOpenChange?(open: boolean): void;
  /** Where focus returns on close; defaults to the trigger (context menus return to the opener). */
  returnFocusTo?(): HTMLElement | null;
}

const ITEM = '[role="menuitem"]';

function isDisabled(el: HTMLElement): boolean {
  return el.getAttribute('aria-disabled') === 'true' || (el as HTMLButtonElement).disabled;
}

export class VdMenuController {
  private readonly typeahead = new VdTypeahead();
  private returnFocus = false;
  /** Light dismiss closes on pointerdown over the trigger; the click must not reopen. */
  private wasOpen = false;

  constructor(
    private readonly trigger: HTMLElement,
    private readonly menu: HTMLElement,
    private readonly options: VdMenuControllerOptions,
  ) {
    trigger.addEventListener('pointerdown', this.onTriggerPointerDown);
    trigger.addEventListener('click', this.onTriggerClick);
    trigger.addEventListener('keydown', this.onTriggerKeydown);
    menu.addEventListener('keydown', this.onMenuKeydown);
    menu.addEventListener('click', this.onMenuClick);
    menu.addEventListener('pointermove', this.onPointerMove);
    menu.addEventListener('toggle', this.onToggle);
  }

  get isOpen(): boolean {
    return this.menu.matches(':popover-open');
  }

  open(focus: 'first' | 'last' = 'first'): void {
    if (!this.isOpen) {
      this.menu.showPopover({ source: this.trigger } as ShowPopoverOptions);
      this.options.onOpenChange?.(true);
    }
    const items = this.enabledItems();
    (focus === 'first' ? items[0] : items[items.length - 1])?.focus();
  }

  close(returnFocus: boolean): void {
    this.returnFocus = returnFocus;
    if (this.isOpen) this.menu.hidePopover();
  }

  destroy(): void {
    this.trigger.removeEventListener('pointerdown', this.onTriggerPointerDown);
    this.trigger.removeEventListener('click', this.onTriggerClick);
    this.trigger.removeEventListener('keydown', this.onTriggerKeydown);
    this.menu.removeEventListener('keydown', this.onMenuKeydown);
    this.menu.removeEventListener('click', this.onMenuClick);
    this.menu.removeEventListener('pointermove', this.onPointerMove);
    this.menu.removeEventListener('toggle', this.onToggle);
  }

  private enabledItems(): HTMLElement[] {
    return this.options.items().filter((i) => !isDisabled(i));
  }

  private readonly onTriggerPointerDown = () => {
    this.wasOpen = this.isOpen;
  };

  private readonly onTriggerClick = (event: MouseEvent) => {
    if (this.wasOpen || this.isOpen) {
      this.wasOpen = false;
      this.close(false);
      return;
    }
    // Enter/Space are handled in keydown (and prevented), so this is a pointer click.
    this.open('first');
    event.preventDefault();
  };

  private readonly onTriggerKeydown = (event: KeyboardEvent) => {
    const { key } = event;
    if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.open('first');
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this.open('last');
    }
  };

  private readonly onMenuKeydown = (event: KeyboardEvent) => {
    const items = this.options.items();
    const current = items.indexOf(event.target as HTMLElement);
    const { key } = event;

    if (key === 'Escape') {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (key === 'Tab') {
      this.close(false);
      return;
    }
    const target = vdListTarget(key, current, items.map(isDisabled), { loop: true, pageSize: 10 });
    if (target !== null) {
      event.preventDefault();
      items[target]?.focus();
      return;
    }
    if (VdTypeahead.accepts(event)) {
      const idx = this.typeahead.match(
        key,
        items.map((i) => i.textContent?.trim() ?? ''),
        items.map(isDisabled),
        current,
      );
      if (idx !== null) items[idx]?.focus();
    }
  };

  private readonly onMenuClick = (event: MouseEvent) => {
    const item = (event.target as Element).closest<HTMLElement>(ITEM);
    if (!item || !this.menu.contains(item)) return;
    if (isDisabled(item)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    // Item handlers already ran (bubbling reached the menu): close and restore focus.
    this.close(true);
  };

  /** Pointer and keyboard share one "current" item: hovering focuses it. */
  private readonly onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const item = (event.target as Element).closest<HTMLElement>(ITEM);
    if (item && !isDisabled(item) && item !== this.menu.ownerDocument.activeElement) item.focus();
  };

  private readonly onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== 'closed') return;
    this.typeahead.reset();
    this.options.onOpenChange?.(false);
    if (this.returnFocus) (this.options.returnFocusTo?.() ?? this.trigger).focus();
    this.returnFocus = false;
  };
}
