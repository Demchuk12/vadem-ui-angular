import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import { VD_MENU } from '@vadem/ui/menu';
import {
  VdKanbanCardData,
  VdKanbanColumn,
  VdKanbanMove,
  vdKanbanColumnAt,
  vdKanbanFind,
  vdKanbanInsertIndex,
  vdKanbanMoveRequest,
  vdKanbanValid,
} from './core/kanban';

/** Template context for `ng-template[vdKanbanCard]` and `ng-template[vdKanbanColumnHeader]`. */
export interface VdKanbanCardContext<T extends VdKanbanCardData = VdKanbanCardData> {
  $implicit: T;
  column: VdKanbanColumn<T>;
  index: number;
}
export interface VdKanbanColumnContext<T extends VdKanbanCardData = VdKanbanCardData> {
  $implicit: VdKanbanColumn<T>;
}

/** Card content. Without it, a card shows its `label`. */
@Directive({ selector: 'ng-template[vdKanbanCard]' })
export class VdKanbanCard {
  readonly template = inject<TemplateRef<VdKanbanCardContext>>(TemplateRef);
}

/** Extra column header content after the title and count (for example a total). */
@Directive({ selector: 'ng-template[vdKanbanColumnHeader]' })
export class VdKanbanColumnHeader {
  readonly template = inject<TemplateRef<VdKanbanColumnContext>>(TemplateRef);
}

interface Drag {
  pointer: number;
  element: HTMLElement;
  columns: readonly VdKanbanColumn[];
  cardId: string;
  label: string;
  touch: boolean;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  active: boolean;
  /** Long-press timer for touch. */
  timer: ReturnType<typeof setTimeout> | null;
  ghost: HTMLElement | null;
  offsetX: number;
  offsetY: number;
  /** Horizontal auto-scroll direction while the pointer rests near a board edge. */
  scroll: -1 | 0 | 1;
  frame: number | null;
}
interface Drop {
  columnId: string;
  index: number;
  cardId: string | null;
  edge: 'before' | 'after' | null;
}

/** Elements inside a card that keep their own pointer behavior (no drag starts there). */
const INTERACTIVE = 'a, button, input, select, textarea, label, [contenteditable], [tabindex]';
const INTERACTIVE_TOUCH = 'button, input, select, textarea, label, [contenteditable]';
/** Touch: hold still this long to pick a card up; moving earlier scrolls instead. */
const LONG_PRESS_MS = 400;
const TOUCH_SLOP = 8;
const EDGE = 48;
const EDGE_STEP = 14;

/**
 * A board of columns and cards. The application owns the data: the board never changes
 * `columns` itself, it emits `cardMove` requests (from the Move menu or a pointer drag) and the
 * application applies them (for example with `vdKanbanApplyMove`). Spec: specs/kanban.md
 */
@Component({
  selector: 'vd-kanban',
  imports: [NgTemplateOutlet, VdButton, VdIcon, VD_MENU],
  template: `
    <p class="vd-visually-hidden" [id]="instructionsId">{{ t().instructions }}</p>
    @if (!valid()) {
      <p class="vd-kanban__invalid">{{ t().invalidText }}</p>
    } @else {
      <div
        class="vd-kanban__columns"
        role="group"
        [attr.aria-label]="t().label"
        [attr.aria-describedby]="instructionsId"
      >
        @for (column of columns(); track column.id; let c = $index) {
          <section
            class="vd-kanban__column"
            [attr.aria-labelledby]="baseId + '-title-' + c"
            [attr.data-column-id]="column.id"
            [attr.data-drop-target]="drop()?.columnId === column.id ? '' : null"
          >
            <header class="vd-kanban__header">
              <p class="vd-kanban__title" [id]="baseId + '-title-' + c">
                <bdi>{{ column.title }}</bdi>
                <span class="vd-kanban__count" aria-hidden="true">{{ column.cards.length }}</span>
                <span class="vd-visually-hidden">, {{ t().countText(column.cards.length) }}</span>
              </p>
              @if (columnHeader(); as header) {
                <div class="vd-kanban__header-extra">
                  <ng-container
                    [ngTemplateOutlet]="header.template"
                    [ngTemplateOutletContext]="{ $implicit: column }"
                  />
                </div>
              }
            </header>
            <ul
              class="vd-kanban__cards"
              role="list"
              [attr.aria-labelledby]="baseId + '-title-' + c"
            >
              @for (card of column.cards; track card.id; let i = $index, last = $last) {
                <li
                  class="vd-kanban__card"
                  tabindex="-1"
                  [attr.data-card-id]="card.id"
                  [attr.data-dragging]="draggingId() === card.id ? '' : null"
                  [attr.data-drop]="drop()?.cardId === card.id ? drop()?.edge : null"
                  (pointerdown)="start($event, card)"
                  (pointermove)="pointerMove($event)"
                  (pointerup)="end($event)"
                  (pointercancel)="pointerCancel($event)"
                  (lostpointercapture)="pointerCancel($event)"
                >
                  <div class="vd-kanban__content">
                    @if (cardTemplate(); as tpl) {
                      <ng-container
                        [ngTemplateOutlet]="tpl.template"
                        [ngTemplateOutletContext]="{ $implicit: card, column, index: i }"
                      />
                    } @else {
                      <bdi>{{ card.label }}</bdi>
                    }
                  </div>
                  <button
                    vdButton
                    class="vd-kanban__move"
                    variant="ghost"
                    size="sm"
                    iconOnly
                    type="button"
                    [disabled]="disabled()"
                    [attr.aria-label]="t().moveLabel(card.label)"
                    [vdMenuTrigger]="menu"
                  >
                    <vd-icon name="more-horizontal" />
                  </button>
                  <div vdMenu #menu="vdMenu">
                    <button
                      vdMenuItem
                      [disabled]="i === 0"
                      (click)="moveTo(card.id, column.id, i - 1)"
                    >
                      <vd-icon name="arrow-up" />{{ t().upText }}
                    </button>
                    <button
                      vdMenuItem
                      [disabled]="last"
                      (click)="moveTo(card.id, column.id, i + 1)"
                    >
                      <vd-icon name="arrow-down" />{{ t().downText }}
                    </button>
                    @if (columns().length > 1) {
                      <div vdMenuSeparator></div>
                      <p vdMenuLabel>{{ t().moveToText }}</p>
                      @for (target of columns(); track target.id) {
                        @if (target.id !== column.id) {
                          <button
                            vdMenuItem
                            (click)="moveTo(card.id, target.id, target.cards.length)"
                          >
                            <bdi>{{ target.title }}</bdi>
                          </button>
                        }
                      }
                    }
                  </div>
                </li>
              } @empty {
                <li class="vd-kanban__empty">{{ t().emptyText }}</li>
              }
            </ul>
          </section>
        }
      </div>
    }
    <p class="vd-visually-hidden" role="status" aria-atomic="true">
      @for (message of messages(); track message.serial) {
        <span>{{ message.text }}</span>
      }
    </p>
  `,
  host: {
    class: 'vd-kanban',
    '[attr.data-state]':
      '!valid() ? "invalid" : disabled() ? "disabled" : draggingId() ? "dragging" : "idle"',
    '(keydown)': 'key($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdKanban<T extends VdKanbanCardData = VdKanbanCardData> {
  readonly columns = input<readonly VdKanbanColumn<T>[]>([]);
  /** Disables every move (menus and dragging). Card content stays interactive. */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>();
  readonly instructions = input<string>();
  readonly emptyText = input<string>();
  readonly invalidText = input<string>();
  readonly countText = input<(count: number) => string>();
  readonly moveLabel = input<(card: string) => string>();
  readonly upText = input<string>();
  readonly downText = input<string>();
  readonly moveToText = input<string>();
  readonly movedText =
    input<(card: string, column: string, position: number, total: number) => string>();
  readonly canceledText = input<(card: string) => string>();
  /** A move request. Apply it to `columns` to make it happen; ignore it to reject it. */
  readonly cardMove = output<VdKanbanMove>();

  protected readonly t = vdTexts('kanban', {
    label: this.label,
    instructions: this.instructions,
    emptyText: this.emptyText,
    invalidText: this.invalidText,
    countText: this.countText,
    moveLabel: this.moveLabel,
    upText: this.upText,
    downText: this.downText,
    moveToText: this.moveToText,
    movedText: this.movedText,
    canceledText: this.canceledText,
  });
  protected readonly cardTemplate = contentChild(VdKanbanCard);
  protected readonly columnHeader = contentChild(VdKanbanColumnHeader);
  protected readonly valid = computed(() => vdKanbanValid(this.columns()));
  protected readonly baseId = vdUniqueId('vd-kanban');
  protected readonly instructionsId = this.baseId + '-instructions';
  protected readonly draggingId = signal<string | null>(null);
  protected readonly drop = signal<Drop | null>(null);
  protected readonly messages = signal<readonly { serial: number; text: string }[]>([]);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private drag: Drag | null = null;
  /** Card whose Move button should get focus once the moved card renders in its new place. */
  private pendingFocus: string | null = null;
  /** The click that follows a finished drag must not follow a link or activate content. */
  private suppressClick = false;
  private serial = 0;

  constructor() {
    effect(() => {
      const columns = this.columns(),
        disabled = this.disabled();
      if (this.drag && (disabled || columns !== this.drag.columns)) this.finish(true);
    });
    afterRenderEffect(() => {
      this.columns();
      const id = this.pendingFocus;
      if (!id) return;
      const card = this.cardElement(id);
      if (!card) return;
      this.pendingFocus = null;
      const active = this.host.ownerDocument.activeElement;
      const lost = !active || active === this.host.ownerDocument.body || !active.isConnected;
      if (!lost && !this.host.contains(active)) return;
      if (card.contains(active)) return;
      const target = card.querySelector<HTMLElement>('.vd-kanban__move:not(:disabled)') ?? card;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.finish(false));
    afterNextRender(() => {
      // Non-passive so a lifted card stops the page from scrolling under the finger; the
      // long-press context menu is suppressed while a touch drag is pending or active.
      const touchMove = (event: TouchEvent) => {
        if (this.drag?.touch && this.drag.active) event.preventDefault();
      };
      const contextMenu = (event: Event) => {
        if (this.drag?.touch) event.preventDefault();
      };
      const click = (event: Event) => {
        if (!this.suppressClick) return;
        this.suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      };
      this.host.addEventListener('touchmove', touchMove, { passive: false });
      this.host.addEventListener('contextmenu', contextMenu);
      this.host.addEventListener('click', click, true);
      destroyRef.onDestroy(() => {
        this.host.removeEventListener('touchmove', touchMove);
        this.host.removeEventListener('contextmenu', contextMenu);
        this.host.removeEventListener('click', click, true);
      });
    });
  }

  protected moveTo(cardId: string, columnId: string, index: number): void {
    if (this.disabled() || !this.valid() || this.drag) return;
    this.request(vdKanbanMoveRequest(this.columns(), cardId, { columnId, index }, 'menu'));
  }

  private request(move: VdKanbanMove | null): void {
    if (!move) return;
    const columns = this.columns();
    const target = columns.find((column) => column.id === move.toColumnId)!;
    const card = columns.find((c) => c.id === move.fromColumnId)!.cards[move.fromIndex];
    const total = target.cards.length + (move.fromColumnId === move.toColumnId ? 0 : 1);
    this.pendingFocus = move.cardId;
    this.announce(this.t().movedText(card.label, target.title, move.toIndex + 1, total));
    this.cardMove.emit(move);
  }

  protected start(event: PointerEvent, card: T): void {
    this.suppressClick = false;
    if (!event.isPrimary || event.button !== 0 || this.disabled() || !this.valid() || this.drag)
      return;
    const element = event.currentTarget as HTMLElement;
    // Links, buttons and fields inside the card keep their own behavior (the card itself
    // matches [tabindex], so it is excluded).
    const touch = event.pointerType === 'touch';
    // On touch a long press may start on a link too: a short tap still follows it.
    const hit = (event.target as Element | null)?.closest(touch ? INTERACTIVE_TOUCH : INTERACTIVE);
    if (hit && hit !== element && element.contains(hit)) return;
    if (typeof element.setPointerCapture !== 'function') return;
    this.drag = {
      pointer: event.pointerId,
      element,
      columns: this.columns(),
      cardId: card.id,
      label: card.label,
      touch,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      active: false,
      timer: null,
      ghost: null,
      offsetX: 0,
      offsetY: 0,
      scroll: 0,
      frame: null,
    };
    if (touch) {
      // No preventDefault: a swipe must still scroll. Holding still picks the card up.
      const drag = this.drag;
      drag.timer = setTimeout(() => {
        drag.timer = null;
        if (this.drag !== drag) return;
        try {
          element.setPointerCapture(drag.pointer);
        } catch {
          this.finish(false);
          return;
        }
        this.activate(drag);
      }, LONG_PRESS_MS);
      return;
    }
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      this.drag = null;
      return;
    }
    event.preventDefault();
  }

  protected pointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y);
    if (!drag.active) {
      // Touch moving before the long press is a scroll; mouse needs a small dead zone.
      if (drag.touch) {
        if (distance > TOUCH_SLOP) this.finish(false);
        return;
      }
      if (event.buttons === 0) {
        this.finish(false);
        return;
      }
      if (distance < 4) return;
      this.activate(drag);
    }
    this.track(drag);
  }

  protected end(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const drop = drag.active ? this.target(event.clientX, event.clientY) : null;
    this.suppressClick = drag.active;
    this.finish(drag.active && !drop);
    if (drop) {
      this.request(vdKanbanMoveRequest(this.columns(), drag.cardId, drop, 'pointer'));
    }
  }

  protected pointerCancel(event: PointerEvent): void {
    if (event.pointerId === this.drag?.pointer) this.finish(!!this.drag?.active);
  }

  protected key(event: KeyboardEvent): void {
    if (!this.drag || event.isComposing) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      this.finish(true);
    }
  }

  /** Lifts the card: a floating copy follows the pointer, the card itself becomes a slot. */
  private activate(drag: Drag): void {
    drag.active = true;
    const { element } = drag;
    // Focus lets Escape/Tab reach the board (pointerdown was prevented for mouse).
    if (!element.contains(this.host.ownerDocument.activeElement))
      element.focus({ preventScroll: true });
    const rect = element.getBoundingClientRect();
    drag.offsetX = drag.x - rect.left;
    drag.offsetY = drag.y - rect.top;
    const ghost = element.cloneNode(true) as HTMLElement;
    ghost.querySelectorAll('[popover]').forEach((node) => node.remove());
    ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    for (const name of ['data-card-id', 'data-dragging', 'data-drop', 'tabindex'])
      ghost.removeAttribute(name);
    ghost.className = 'vd-kanban__card vd-kanban__ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    ghost.style.setProperty('inline-size', `${rect.width}px`);
    ghost.setAttribute('popover', 'manual');
    this.host.append(ghost);
    ghost.showPopover?.();
    drag.ghost = ghost;
    this.draggingId.set(drag.cardId);
    this.track(drag);
  }

  /** Moves the floating copy, updates the drop marker and edge auto-scroll. */
  private track(drag: Drag): void {
    const ghost = drag.ghost;
    if (ghost) {
      // Physical viewport coordinates; the copy is anchored at the inline start, so RTL
      // measures from the right edge.
      const rtl =
        this.host.ownerDocument.defaultView?.getComputedStyle(this.host).direction === 'rtl';
      const left = drag.lastX - drag.offsetX;
      const x = rtl
        ? left + ghost.offsetWidth - this.host.ownerDocument.documentElement.clientWidth
        : left;
      ghost.style.setProperty('--vd-kanban-ghost-x', `${x}px`);
      ghost.style.setProperty('--vd-kanban-ghost-y', `${drag.lastY - drag.offsetY}px`);
    }
    this.drop.set(this.target(drag.lastX, drag.lastY));
    const scroller = this.host.querySelector<HTMLElement>('.vd-kanban__columns');
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    drag.scroll = drag.lastX < rect.left + EDGE ? -1 : drag.lastX > rect.right - EDGE ? 1 : 0;
    if (drag.scroll && drag.frame === null) {
      const view = this.host.ownerDocument.defaultView;
      const step = () => {
        if (this.drag !== drag || !drag.scroll || !view) {
          drag.frame = null;
          return;
        }
        scroller.scrollBy({ left: drag.scroll * EDGE_STEP, behavior: 'instant' });
        this.drop.set(this.target(drag.lastX, drag.lastY));
        drag.frame = view.requestAnimationFrame(step);
      };
      drag.frame = view?.requestAnimationFrame(step) ?? null;
    }
  }

  /** Column and insertion index under the pointer, with the card that shows the marker. */
  private target(x: number, y: number): Drop | null {
    const drag = this.drag;
    if (!drag) return null;
    const sections = Array.from(
      this.host.querySelectorAll<HTMLElement>('.vd-kanban__column[data-column-id]'),
    );
    const index = vdKanbanColumnAt(
      x,
      sections.map((s) => s.getBoundingClientRect()),
    );
    if (index < 0) return null;
    const section = sections[index];
    const rect = section.getBoundingClientRect();
    if (y < rect.top || y > rect.bottom) return null;
    const others = Array.from(
      section.querySelectorAll<HTMLElement>('.vd-kanban__card[data-card-id]'),
    ).filter((el) => el.dataset['cardId'] !== drag.cardId);
    const at = vdKanbanInsertIndex(
      y,
      others.map((el) => el.getBoundingClientRect()),
    );
    const columnId = section.dataset['columnId']!;
    const from = vdKanbanFind(this.columns(), drag.cardId);
    if (from && from.columnId === columnId && from.index === at) return null;
    const marker = others[at] ?? others[others.length - 1] ?? null;
    return {
      columnId,
      index: at,
      cardId: marker?.dataset['cardId'] ?? null,
      edge: marker ? (others[at] ? 'before' : 'after') : null,
    };
  }

  private finish(announce: boolean): void {
    const drag = this.drag;
    this.drag = null;
    this.draggingId.set(null);
    this.drop.set(null);
    if (!drag) return;
    if (drag.timer !== null) clearTimeout(drag.timer);
    if (drag.frame !== null) this.host.ownerDocument.defaultView?.cancelAnimationFrame(drag.frame);
    drag.ghost?.remove();
    if (drag.element.hasPointerCapture?.(drag.pointer))
      drag.element.releasePointerCapture(drag.pointer);
    if (announce && drag.active) this.announce(this.t().canceledText(drag.label));
  }

  private announce(text: string): void {
    this.messages.set([{ serial: ++this.serial, text }]);
  }

  private cardElement(id: string): HTMLElement | null {
    return (
      Array.from(this.host.querySelectorAll<HTMLElement>('.vd-kanban__card[data-card-id]')).find(
        (el) => el.dataset['cardId'] === id,
      ) ?? null
    );
  }
}

export const VD_KANBAN = [VdKanban, VdKanbanCard, VdKanbanColumnHeader] as const;
