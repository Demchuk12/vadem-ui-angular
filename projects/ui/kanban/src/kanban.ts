import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
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
  x: number;
  y: number;
  active: boolean;
}
interface Drop {
  columnId: string;
  index: number;
  cardId: string | null;
  edge: 'before' | 'after' | null;
}

/** Elements inside a card that keep their own pointer behavior (no drag starts there). */
const INTERACTIVE = 'a, button, input, select, textarea, label, [contenteditable], [tabindex]';

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
    inject(DestroyRef).onDestroy(() => this.finish(false));
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
    // Touch keeps native scrolling; the Move menu is the touch and keyboard path.
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      event.pointerType === 'touch' ||
      this.disabled() ||
      !this.valid() ||
      this.drag
    )
      return;
    const element = event.currentTarget as HTMLElement;
    // Links, buttons and fields inside the card keep their own behavior (the card itself
    // matches [tabindex], so it is excluded).
    const hit = (event.target as Element | null)?.closest(INTERACTIVE);
    if (hit && hit !== element && element.contains(hit)) return;
    if (typeof element.setPointerCapture !== 'function') return;
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    event.preventDefault();
    // preventDefault keeps focus where it was; Escape/Tab must reach the board to cancel.
    if (!element.contains(this.host.ownerDocument.activeElement))
      element.focus({ preventScroll: true });
    this.drag = {
      pointer: event.pointerId,
      element,
      columns: this.columns(),
      cardId: card.id,
      label: card.label,
      x: event.clientX,
      y: event.clientY,
      active: false,
    };
  }

  protected pointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    if (event.buttons === 0) {
      this.finish(true);
      return;
    }
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
    drag.active = true;
    this.draggingId.set(drag.cardId);
    this.drop.set(this.target(event.clientX, event.clientY));
  }

  protected end(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const drop = drag.active ? this.target(event.clientX, event.clientY) : null;
    this.finish(!drop);
    if (drop) {
      this.request(vdKanbanMoveRequest(this.columns(), drag.cardId, drop, 'pointer'));
    }
  }

  protected pointerCancel(event: PointerEvent): void {
    if (event.pointerId === this.drag?.pointer) this.finish(true);
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
