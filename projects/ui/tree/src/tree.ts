import {
  afterRenderEffect,
  afterNextRender,
  Injector,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdTypeahead } from '@vadem/ui/keyboard';
import { vdTreeAction, vdTreeFocusKey, vdTreeVisible, type VdTreeNode } from './core/tree';
import { vdTexts } from '@vadem/ui/locale';

@Directive({
  selector: 'ul[vdTree]',
  exportAs: 'vdTree',
  host: {
    class: 'vd-tree',
    role: 'tree',
    '[attr.aria-label]': 't().label',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.tabindex]': 'disabled() && items().length ? 0 : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class VdTree {
  readonly value = model<string | null>(null);
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('tree', { label: this.label });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly descendants = contentChildren(VdTreeItem, { descendants: true });
  readonly items = computed(() => this.descendants().filter((item) => item.tree === this));
  readonly nodes = computed(() =>
    this.items().map((item) => ({
      key: item.value(),
      parent: item.parent?.value() ?? null,
      expanded: item.expanded(),
      disabled: item.disabled(),
    })),
  );
  readonly visible = computed(() => vdTreeVisible(this.nodes()));
  readonly focused = linkedSignal<{ nodes: VdTreeNode[]; selected: string | null }, string | null>({
    source: () => ({ nodes: this.nodes(), selected: this.value() }),
    computation: (source, previous) =>
      vdTreeFocusKey(
        source.nodes,
        this.lastFocused ? (previous?.value ?? null) : null,
        source.selected,
      ),
  });
  private readonly typeahead = new VdTypeahead();
  private lastFocused: VdTreeItem | null = null;

  constructor() {
    afterRenderEffect(() => {
      const keys = this.visible().map((item) => item.key);
      const target = this.focused();
      const active = this.document.activeElement;
      if (
        this.lastFocused &&
        !keys.includes(this.lastFocused.value()) &&
        (active === this.document.body || (active && this.element.contains(active)))
      ) {
        if (target) this.focus(target);
      }
    });
  }

  focus(key: string): void {
    const item = this.items().find((item) => item.value() === key);
    if (!item || this.disabled() || !this.visible().some((node) => node.key === key)) return;
    this.focused.set(key);
    item.element.focus();
    if (this.document.activeElement !== item.element) {
      // Expanded descendants may still be hidden until this render completes.
      afterNextRender(
        () => {
          if (
            !this.disabled() &&
            !!this.document.activeElement &&
            this.element.contains(this.document.activeElement) &&
            this.focused() === key &&
            this.visible().some((node) => node.key === key)
          )
            item.element.focus();
        },
        { injector: this.injector },
      );
    }
  }

  remember(item: VdTreeItem): void {
    this.lastFocused = item;
    this.focused.set(item.value());
  }

  select(item: VdTreeItem): void {
    if (!this.disabled() && !item.disabled()) this.value.set(item.value());
  }

  toggle(item: VdTreeItem): void {
    if (!this.disabled() && !item.disabled() && item.branch())
      item.expanded.update((open) => !open);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget && !this.element.contains(event.relatedTarget as Node)) {
      this.lastFocused = null;
      this.typeahead.reset();
      this.focused.set(vdTreeFocusKey(this.nodes(), null, this.value()));
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || this.disabled())
      return;
    const item = this.items().find((item) => item.element === event.target);
    if (!item) return;
    const rtl = this.document.defaultView?.getComputedStyle(this.element).direction === 'rtl';
    if (event.key === '*') {
      event.preventDefault();
      this.items()
        .filter((peer) => peer.parent === item.parent && peer.branch() && !peer.disabled())
        .forEach((peer) => peer.expanded.set(true));
      return;
    }
    const action = vdTreeAction(event.key, item.value(), this.nodes(), rtl);
    if (action) {
      event.preventDefault();
      this.typeahead.reset();
      if (action.type === 'focus') this.focus(action.key);
      else if (action.type === 'select') this.select(item);
      else item.expanded.set(action.expanded);
    } else if (['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
    } else if (VdTypeahead.accepts(event)) {
      event.preventDefault();
      const visible = this.visible();
      const index = this.typeahead.match(
        event.key,
        visible.map((node) =>
          this.items()
            .find((item) => item.value() === node.key)!
            .label(),
        ),
        visible.map(() => false),
        visible.findIndex((node) => node.key === item.value()),
      );
      if (index !== null) this.focus(visible[index].key);
    }
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[vdTreeItem]',
  exportAs: 'vdTreeItem',
  imports: [VdIcon],
  template: `
    <span class="vd-tree-item__row">
      <span class="vd-tree-item__toggle" aria-hidden="true">
        @if (branch()) {
          <vd-icon [name]="expanded() ? 'chevron-down' : 'chevron-right'" />
        }
      </span>
      <span class="vd-tree-item__label" [id]="labelId">{{ label() }}</span>
      <span class="vd-tree-item__check" aria-hidden="true">
        @if (selected()) {
          <vd-icon name="check" />
        }
      </span>
    </span>
    <ng-content />
  `,
  host: {
    class: 'vd-tree-item',
    role: 'treeitem',
    '[attr.aria-labelledby]': 'labelId',
    '[attr.aria-expanded]': 'branch() ? expanded() : null',
    '[attr.aria-selected]': 'isDisabled() ? null : selected()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.aria-level]': 'level()',
    '[attr.aria-posinset]': 'position()',
    '[attr.aria-setsize]': 'siblings().length',
    '[attr.tabindex]': '!tree.disabled() && tree.focused() === value() ? 0 : -1',
    '[attr.data-expanded]': 'branch() ? expanded() : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(focus)': 'tree.remember(this)',
    '(click)': 'onClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdTreeItem {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly tree = inject(VdTree);
  readonly parent = inject(VdTreeItem, { optional: true, skipSelf: true });
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly branch = computed(() => this.tree.items().some((item) => item.parent === this));
  protected readonly labelId = vdUniqueId('vd-tree-label');
  protected readonly selected = computed(() => this.tree.value() === this.value());
  protected readonly isDisabled = computed(() => this.tree.disabled() || this.disabled());
  protected readonly siblings = computed(() =>
    this.tree.items().filter((item) => item.parent === this.parent),
  );
  protected readonly position = computed(() => this.siblings().indexOf(this) + 1);
  readonly level = computed((): number => (this.parent?.level() ?? 0) + 1);

  protected onClick(event: MouseEvent): void {
    const target = event.target as Element;
    if (target.closest('.vd-tree-item') !== this.element) return;
    event.stopPropagation();
    this.tree.focus(this.value());
    if (target.closest('.vd-tree-item__toggle') && this.branch()) this.tree.toggle(this);
    else this.tree.select(this);
  }
}

@Directive({
  selector: 'ul[vdTreeGroup]',
  host: { class: 'vd-tree__group', role: 'group', '[hidden]': '!parent.expanded()' },
})
export class VdTreeGroup {
  protected readonly parent = inject(VdTreeItem);
}
export const VD_TREE = [VdTree, VdTreeItem, VdTreeGroup] as const;
