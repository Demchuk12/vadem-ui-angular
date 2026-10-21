import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdListTarget } from '@vadem/ui/keyboard';
import { vdActiveCommand, vdFilterCommands } from './core/command';
import { vdTexts } from '@vadem/ui/locale';

/** Searchable actions; modal ownership and shortcut bindings stay with consumers. */
@Component({
  selector: 'vd-command',
  imports: [VdIcon],
  template: `
    <div class="vd-command__search">
      <vd-icon name="search" />
      <!-- Opt-in for modal Dialog initial focus; false for inline use. -->
      <!-- eslint-disable @angular-eslint/template/no-autofocus -->
      <input
        #search
        class="vd-command__input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        autocomplete="off"
        spellcheck="false"
        [value]="query()"
        [placeholder]="t().placeholder"
        [disabled]="disabled()"
        [autofocus]="autofocus()"
        [attr.aria-label]="t().label"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="focused() && expanded() ? activeItem()?.id : null"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="focused.set(false)"
        (keydown)="onKeydown($event)"
      />
      <!-- eslint-enable @angular-eslint/template/no-autofocus -->
    </div>
    <div
      #list
      class="vd-command__list"
      role="listbox"
      [id]="listId"
      [attr.aria-label]="t().label"
      [attr.aria-busy]="loading() || null"
      [hidden]="!expanded()"
    >
      <ng-content />
    </div>
    <p class="vd-command__status" role="status" [hidden]="!expanded()">
      @if (loading()) {
        {{ t().loadingText }}
      } @else if (visibleItems().length === 0) {
        {{ t().emptyText }}
      }
    </p>
  `,
  host: {
    class: 'vd-command',
    '[attr.data-open]': 'expanded() ? "" : null',
    '[attr.data-focused]': 'focused() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdCommand {
  readonly query = model('');
  readonly label = input<string>();
  readonly placeholder = input<string>();
  readonly emptyText = input<string>();
  readonly loadingText = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('command', {
    label: this.label,
    placeholder: this.placeholder,
    emptyText: this.emptyText,
    loadingText: this.loadingText,
  });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly selected = output<string>();
  readonly dismissed = output<void>();

  protected readonly expanded = signal(true);
  protected readonly focused = signal(false);
  protected readonly listId = vdUniqueId('vd-command-list');
  private readonly items = contentChildren(VdCommandItem, { descendants: true });
  private readonly initialized = signal<ReadonlySet<VdCommandItem>>(new Set());
  private readonly activeId = signal<string | null>(null);
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  private readonly records = computed(() =>
    this.items()
      .filter((item) => this.initialized().has(item))
      .map((item) => ({
        id: item.id,
        label: item.label(),
        keywords: item.keywords(),
        disabled: item.disabled(),
        item,
      })),
  );
  protected readonly visibleItems = computed(() => vdFilterCommands(this.records(), this.query()));
  readonly activeItem = computed(() => {
    if (this.disabled() || this.loading() || !this.expanded()) return null;
    return vdActiveCommand(this.visibleItems(), this.activeId())?.item ?? null;
  });

  constructor() {
    afterRenderEffect(() => {
      const active = this.activeItem();
      if (!active || !this.focused()) return;
      const list = this.list().nativeElement;
      const box = list.getBoundingClientRect();
      const item = active.el.getBoundingClientRect();
      // Scroll only the results, not the document or the dialog containing them.
      if (item.top < box.top) list.scrollTop += item.top - box.top;
      else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom;
    });
  }

  focus(): void {
    if (!this.disabled()) this.search().nativeElement.focus();
  }

  /** Only inspect required inputs after item initialization; queries preserve DOM order. */
  register(item: VdCommandItem): () => void {
    this.initialized.update((items) => new Set([...items, item]));
    return () =>
      this.initialized.update((items) => {
        const next = new Set(items);
        next.delete(item);
        return next;
      });
  }

  isVisible(item: VdCommandItem): boolean {
    return !this.loading() && this.visibleItems().some((record) => record.item === item);
  }

  choose(item: VdCommandItem): void {
    if (
      this.disabled() ||
      this.loading() ||
      !this.expanded() ||
      item.disabled() ||
      !this.isVisible(item)
    )
      return;
    this.activeId.set(item.id);
    this.focus();
    const value = item.value();
    item.selected.emit();
    this.selected.emit(value);
  }

  hover(item: VdCommandItem, event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || this.disabled() || this.loading() || item.disabled())
      return;
    if (this.isVisible(item)) this.activeId.set(item.id);
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.expanded.set(true);
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeId.set(null);
    this.expanded.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229 || event.defaultPrevented || this.disabled())
      return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.expanded.set(false);
      this.dismissed.emit();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        const active = this.activeItem();
        if (active) this.choose(active);
      }
      return;
    }
    // Preserve native caret/selection shortcuts, Home/End and horizontal arrows.
    if (event.ctrlKey || event.metaKey || event.altKey || this.loading()) return;
    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
    event.preventDefault();
    const wasExpanded = this.expanded();
    this.expanded.set(true);
    const records = this.visibleItems();
    const active = wasExpanded ? this.activeItem() : null;
    const index = records.findIndex((record) => record.item === active);
    const next = vdListTarget(
      event.key,
      index,
      records.map((record) => record.disabled),
      {
        loop: false,
        pageSize: 10,
      },
    );
    if (next !== null) this.activeId.set(records[next]?.id ?? null);
  }
}

@Directive({
  selector: '[vdCommandDescription]',
  host: { class: 'vd-command-item__description', '[id]': 'id' },
})
export class VdCommandDescription {
  readonly id = vdUniqueId('vd-command-description');
}

/** Display hint only; the consumer owns the shortcut binding. */
@Directive({
  selector: '[vdCommandShortcut]',
  host: { class: 'vd-command-item__shortcut', 'aria-hidden': 'true' },
})
export class VdCommandShortcut {}

@Component({
  selector: 'vd-command-item',
  template: `
    <ng-content select="[slot=start]" />
    <span class="vd-command-item__content">
      <span class="vd-command-item__label">{{ label() }}</span>
      <ng-content select="[vdCommandDescription]" />
    </span>
    <ng-content select="[vdCommandShortcut]" />
  `,
  host: {
    class: 'vd-command-item',
    role: 'option',
    '[id]': 'id',
    '[attr.aria-label]': 'label()',
    '[attr.aria-describedby]': 'description()?.id ?? null',
    '[attr.aria-selected]': 'command.activeItem() === this',
    '[attr.aria-disabled]': 'disabled() || command.disabled() || command.loading() || null',
    '[attr.data-active]': 'command.activeItem() === this ? "" : null',
    '[hidden]': '!command.isVisible(this)',
    '(click)': 'command.choose(this)',
    '(pointermove)': 'command.hover(this, $event)',
    '(pointerdown)': '$event.preventDefault()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdCommandItem implements OnInit {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly keywords = input<readonly string[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly selected = output<void>();
  readonly id = vdUniqueId('vd-command-item');
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly command: VdCommand = inject(forwardRef(() => VdCommand));
  protected readonly description = contentChild(VdCommandDescription);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.destroyRef.onDestroy(this.command.register(this));
  }
}

export const VD_COMMAND = [
  VdCommand,
  VdCommandItem,
  VdCommandDescription,
  VdCommandShortcut,
] as const;
