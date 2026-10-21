import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { VdButton } from '@vadem/ui/button';
import { vdRovingTarget, type VdOrientation } from '@vadem/ui/keyboard';
import { vdToolbarEntry } from './core/focus';
import { vdTexts } from '@vadem/ui/locale';

interface ToolbarSnapshot {
  items: readonly VdToolbarItem[];
  unavailable: readonly boolean[];
}

/** A single keyboard stop for related button actions; consumers own activation. */
@Directive({
  selector: '[vdToolbar]',
  exportAs: 'vdToolbar',
  host: {
    class: 'vd-toolbar',
    role: 'toolbar',
    '[attr.aria-label]': 't().label',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class VdToolbar {
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('toolbar', { label: this.label });
  readonly orientation = input<VdOrientation>('horizontal');
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly descendants = contentChildren(VdToolbarItem, { descendants: true });
  readonly snapshot = computed<ToolbarSnapshot>(() => {
    const items = this.descendants().filter((item) => item.toolbar === this);
    return { items, unavailable: items.map((item) => item.unavailable()) };
  });
  readonly active = linkedSignal<ToolbarSnapshot, VdToolbarItem | null>({
    source: this.snapshot,
    computation: (source, previous) => {
      const index = vdToolbarEntry(
        source.unavailable,
        previous?.value ? source.items.indexOf(previous.value) : -1,
        previous?.value ? previous.source.items.indexOf(previous.value) : 0,
      );
      return index === null ? null : source.items[index];
    },
  });
  private lastFocused: VdToolbarItem | null = null;

  constructor() {
    afterRenderEffect(() => {
      const { items, unavailable } = this.snapshot();
      const target = this.active();
      // Toolbar is the sole owner of roving tabindex, including beside Button host bindings.
      for (const item of items) {
        const tabIndex = item === target ? 0 : -1;
        if (item.element.tabIndex !== tabIndex) item.element.tabIndex = tabIndex;
      }
      const active = this.document.activeElement;
      const oldIndex = this.lastFocused ? items.indexOf(this.lastFocused) : -1;
      if (
        this.lastFocused &&
        (oldIndex < 0 || unavailable[oldIndex]) &&
        target &&
        (active === this.document.body || (active && this.element.contains(active))) &&
        !this.element.closest('[hidden], [inert]')
      ) {
        target.element.focus();
      }
    });
  }

  remember(item: VdToolbarItem): void {
    if (item.unavailable()) return;
    this.lastFocused = item;
    this.active.set(item);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget && !this.element.contains(event.relatedTarget as Node))
      this.lastFocused = null;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
      return;
    const { items, unavailable } = this.snapshot();
    // Nested controls/independent toolbars must retain their own keys.
    const index = items.findIndex((item) => item.element === event.target);
    if (index < 0) return;
    const target = vdRovingTarget(event.key, index, unavailable, {
      orientation: this.orientation(),
      dir: this.element.matches(':dir(rtl)') ? 'rtl' : 'ltr',
      loop: true,
    });
    if (target === null) return;
    event.preventDefault();
    this.active.set(items[target]);
    items[target].element.focus();
  }
}

/** Add beside vdButton; native Enter/Space, disabled/loading and click actions stay with Button. */
@Directive({
  selector: 'button[vdButton][vdToolbarItem]',
  host: {
    class: 'vd-toolbar__item',
    '[hidden]': 'hidden()',
    '[attr.tabindex]': 'toolbar.active() === this ? 0 : -1',
    '(focus)': 'toolbar.remember(this)',
  },
})
export class VdToolbarItem {
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly toolbar = inject(VdToolbar);
  readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private readonly button = inject(VdButton, { self: true });
  private readonly group = inject(VdToolbarGroup, { optional: true });
  readonly unavailable = computed(() => {
    if (this.hidden() || this.button.disabled() || this.button.loading()) return true;
    let group = this.group;
    while (group && group.toolbar === this.toolbar) {
      if (group.hidden()) return true;
      group = group.parent;
    }
    return false;
  });
}

@Directive({
  selector: '[vdToolbarGroup]',
  host: {
    class: 'vd-toolbar__group',
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[attr.data-orientation]': 'toolbar.orientation()',
    '[hidden]': 'hidden()',
  },
})
export class VdToolbarGroup {
  readonly label = input.required<string>();
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly toolbar = inject(VdToolbar);
  readonly parent = inject(VdToolbarGroup, { optional: true, skipSelf: true });
}

@Directive({
  selector: '[vdToolbarSeparator]',
  host: {
    class: 'vd-toolbar__separator',
    role: 'separator',
    '[attr.aria-orientation]': 'toolbar.orientation() === "horizontal" ? "vertical" : "horizontal"',
    '[attr.data-orientation]': 'toolbar.orientation()',
  },
})
export class VdToolbarSeparator {
  protected readonly toolbar = inject(VdToolbar);
}

export const VD_TOOLBAR = [VdToolbar, VdToolbarItem, VdToolbarGroup, VdToolbarSeparator] as const;
