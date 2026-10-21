import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import { vdReorderMove, vdReorderTarget, vdReorderValid } from './core/reorder-list';

export interface VdReorderListItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
}
export interface VdReorderListChange {
  readonly id: string;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly method: 'buttons' | 'pointer';
}
interface Drag {
  pointer: number;
  handle: HTMLElement;
  items: readonly VdReorderListItem[];
  id: string;
  from: number;
  x: number;
  y: number;
  active: boolean;
  to: number;
}
interface Focus {
  element: HTMLElement;
  id: string;
  index: number;
  action: string | undefined;
}

@Component({
  selector: 'vd-reorder-list',
  imports: [VdButton, VdIcon],
  template: `
    <p class="vd-visually-hidden" [id]="instructionsId">{{ t().instructions }}</p>
    <ol
      class="vd-reorder-list__list"
      role="list"
      tabindex="-1"
      [attr.aria-label]="t().label"
      [attr.aria-describedby]="instructionsId"
    >
      @if (!valid()) {
        <li class="vd-reorder-list__empty">{{ t().invalidText }}</li>
      } @else {
        @for (item of items(); track item.id; let index = $index) {
          <li
            class="vd-reorder-list__item"
            tabindex="-1"
            [attr.data-reorder-id]="item.id"
            [attr.data-index]="index"
            [attr.data-dragging]="draggingId() === item.id ? '' : null"
            [attr.data-drop]="drop()?.id === item.id ? drop()?.edge : null"
          >
            <span
              class="vd-reorder-list__grip"
              [attr.data-disabled]="disabled() || items().length < 2 ? '' : null"
              aria-hidden="true"
              (pointerdown)="start($event, item.id)"
              (pointermove)="pointerMove($event)"
              (pointerup)="end($event)"
              (pointercancel)="pointerCancel($event)"
              (lostpointercapture)="pointerCancel($event)"
              ><vd-icon name="arrow-up-down"
            /></span>
            <div class="vd-reorder-list__body">
              <div class="vd-reorder-list__title">
                <span class="vd-reorder-list__position" aria-hidden="true">{{ index + 1 }}</span
                ><bdi>{{ item.label }}</bdi>
              </div>
              @if (item.description) {
                <p class="vd-reorder-list__description">{{ item.description }}</p>
              }
            </div>
            <div class="vd-reorder-list__actions">
              <button
                vdButton
                variant="ghost"
                size="sm"
                type="button"
                data-action="up"
                [disabled]="disabled() || index === 0"
                [attr.aria-label]="t().upText + ': ' + item.label"
                (click)="move(item.id, -1)"
              >
                <vd-icon name="arrow-up" slot="start" />{{ t().upText }}
              </button>
              <button
                vdButton
                variant="ghost"
                size="sm"
                type="button"
                data-action="down"
                [disabled]="disabled() || index === items().length - 1"
                [attr.aria-label]="t().downText + ': ' + item.label"
                (click)="move(item.id, 1)"
              >
                <vd-icon name="arrow-down" slot="start" />{{ t().downText }}
              </button>
            </div>
          </li>
        } @empty {
          <li class="vd-reorder-list__empty">{{ t().emptyText }}</li>
        }
      }
    </ol>
    <p class="vd-visually-hidden" role="status" aria-atomic="true">
      @for (message of messages(); track message.serial) {
        <span>{{ message.text }}</span>
      }
    </p>
  `,
  host: {
    class: 'vd-reorder-list',
    '[attr.data-state]':
      '!valid() ? "invalid" : !items().length ? "empty" : disabled() ? "disabled" : draggingId() ? "dragging" : "idle"',
    '(keydown)': 'key($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdReorderList {
  readonly items = model<readonly VdReorderListItem[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>();
  readonly instructions = input<string>();
  readonly upText = input<string>();
  readonly downText = input<string>();
  readonly emptyText = input<string>();
  readonly invalidText = input<string>();
  readonly movedText = input<(label: string, position: number, total: number) => string>();
  readonly canceledText = input<(label: string) => string>();
  readonly reordered = output<VdReorderListChange>();
  protected readonly t = vdTexts('reorderList', {
    label: this.label,
    instructions: this.instructions,
    upText: this.upText,
    downText: this.downText,
    emptyText: this.emptyText,
    invalidText: this.invalidText,
    movedText: this.movedText,
    canceledText: this.canceledText,
  });
  protected readonly valid = computed(() => vdReorderValid(this.items()));
  protected readonly instructionsId = vdUniqueId('vd-reorder-instructions');
  protected readonly draggingId = signal<string | null>(null);
  protected readonly drop = signal<{ id: string; edge: 'before' | 'after' } | null>(null);
  protected readonly messages = signal<readonly { serial: number; text: string }[]>([]);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private drag: Drag | null = null;
  private focus: Focus | null = null;
  private serial = 0;

  constructor() {
    effect(() => {
      const items = this.items(),
        disabled = this.disabled(),
        valid = this.valid();
      if (this.drag && (disabled || !valid || items !== this.drag.items)) this.finish(true);
      const active = this.host.ownerDocument.activeElement as HTMLElement | null;
      const row =
        active && this.host.contains(active)
          ? active.closest<HTMLElement>('[data-reorder-id]')
          : null;
      this.focus =
        row && active
          ? {
              element: active,
              id: row.dataset['reorderId']!,
              index: Number(row.dataset['index']),
              action: active.dataset['action'],
            }
          : null;
    });
    afterRenderEffect(() => {
      this.items();
      this.disabled();
      this.valid();
      const focus = this.focus;
      this.focus = null;
      if (!focus) return;
      const active = this.host.ownerDocument.activeElement;
      if (active === focus.element && !focus.element.matches(':disabled')) {
        if (focus.action)
          focus.element.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: 'instant',
          });
        return;
      }
      if (active && active !== this.host.ownerDocument.body && active !== focus.element) return;
      const rows = this.rows();
      const row =
        rows.find((row) => row.dataset['reorderId'] === focus.id) ??
        rows[Math.min(focus.index, rows.length - 1)];
      const buttons = row
        ? Array.from(row.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
        : [];
      const action = focus.action
        ? (buttons.find((button) => button.dataset['action'] === focus.action) ?? buttons[0])
        : null;
      const target = action ?? (this.disabled() ? null : row) ?? this.list();
      target?.focus({ preventScroll: true });
      if (focus.action)
        target?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
    inject(DestroyRef).onDestroy(() => this.finish(false));
  }
  protected move(id: string, delta: number): void {
    if (this.disabled() || !this.valid() || this.drag) return;
    const from = this.items().findIndex((item) => item.id === id);
    this.commit(from, from + delta, 'buttons');
  }
  private commit(from: number, to: number, method: VdReorderListChange['method']): void {
    const items = this.items(),
      next = vdReorderMove(items, from, to);
    if (next === items) return;
    const item = items[from];
    this.items.set(next);
    this.announce(this.t().movedText(item.label, to + 1, items.length));
    this.reordered.emit({ id: item.id, fromIndex: from, toIndex: to, method });
  }
  protected start(event: PointerEvent, id: string): void {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      this.disabled() ||
      !this.valid() ||
      this.items().length < 2 ||
      this.drag
    )
      return;
    const handle = event.currentTarget as HTMLElement;
    if (typeof handle.setPointerCapture !== 'function') return;
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    event.preventDefault();
    const row = handle.closest<HTMLElement>('[data-reorder-id]');
    if (row && !row.contains(this.host.ownerDocument.activeElement))
      row.focus({ preventScroll: true });
    const from = this.items().findIndex((item) => item.id === id);
    this.drag = {
      pointer: event.pointerId,
      handle,
      items: this.items(),
      id,
      from,
      x: event.clientX,
      y: event.clientY,
      active: false,
      to: from,
    };
  }
  protected pointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    if (event.buttons === 0 || this.disabled() || this.items() !== drag.items) {
      this.finish(true);
      return;
    }
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
    drag.active = true;
    this.draggingId.set(drag.id);
    drag.to = this.target(event.clientX, event.clientY);
    this.drop.set(
      drag.to < 0 || drag.to === drag.from
        ? null
        : { id: drag.items[drag.to].id, edge: drag.to > drag.from ? 'after' : 'before' },
    );
  }
  protected end(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const to = this.target(event.clientX, event.clientY);
    const commit = drag.active && to >= 0 && !this.disabled() && this.items() === drag.items;
    this.finish(!commit);
    if (commit) this.commit(drag.from, to, 'pointer');
  }
  protected pointerCancel(event: PointerEvent): void {
    if (event.pointerId === this.drag?.pointer) this.finish(true);
  }
  protected key(event: KeyboardEvent): void {
    if (!this.drag || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      this.finish(true);
    }
  }
  private target(x: number, y: number): number {
    const list = this.list();
    if (!list) return -1;
    const rect = list.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return -1;
    return vdReorderTarget(
      y,
      this.rows().map((row) => row.getBoundingClientRect()),
    );
  }
  private finish(announce: boolean): void {
    const drag = this.drag;
    this.drag = null;
    this.draggingId.set(null);
    this.drop.set(null);
    if (!drag) return;
    if (drag.handle.hasPointerCapture?.(drag.pointer))
      drag.handle.releasePointerCapture(drag.pointer);
    if (announce && drag.active) this.announce(this.t().canceledText(drag.items[drag.from].label));
  }
  private announce(text: string): void {
    this.messages.set([{ serial: ++this.serial, text }]);
  }
  private list(): HTMLOListElement | null {
    return this.host.querySelector('ol');
  }
  private rows(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('[data-reorder-id]'));
  }
}
