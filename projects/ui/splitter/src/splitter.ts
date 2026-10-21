import {
  booleanAttribute,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { type VdOrientation } from '@vadem/ui/keyboard';
import { vdSplitterBounds, vdSplitterDrag, vdSplitterKey, vdSplitterValue } from './core/splitter';

@Directive({
  selector: '[vdSplitter]',
  exportAs: 'vdSplitter',
  host: {
    class: 'vd-splitter',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-dragging]': 'dragging() ? "" : null',
    '[style.--vd-splitter-first]': 'position() + "fr"',
    '[style.--vd-splitter-second]': '(100 - position()) + "fr"',
  },
})
export class VdSplitter {
  readonly value = model(50);
  readonly min = input(10);
  readonly max = input(90);
  readonly step = input(1);
  /** Layout axis: horizontal means side by side, vertical means stacked panes. */
  readonly orientation = input<VdOrientation>('horizontal');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly dragging = signal(false);
  readonly bounds = computed(() => vdSplitterBounds(this.min(), this.max()));
  readonly position = computed(() => vdSplitterValue(this.value(), this.bounds()));
  private readonly descendants = contentChildren(VdSplitterPane, { descendants: true });
  readonly panes = computed(() => this.descendants().filter((pane) => pane.splitter === this));
  readonly locked = computed(
    () => this.disabled() || this.bounds().min === this.bounds().max || this.panes().length !== 2,
  );
  readonly element: HTMLElement = inject(ElementRef).nativeElement;
  resize(value: number): void {
    if (this.locked()) return;
    const next = vdSplitterValue(value, this.bounds());
    if (next !== this.position()) this.value.set(next);
  }
}

@Directive({
  selector: '[vdSplitterPane]',
  host: { class: 'vd-splitter__pane', '[id]': 'id()', tabindex: '0' },
})
export class VdSplitterPane {
  readonly splitter = inject(VdSplitter);
  readonly id = input(vdUniqueId('vd-splitter-pane'));
  readonly element: HTMLElement = inject(ElementRef).nativeElement;
}

interface Drag {
  id: number;
  start: number;
  value: number;
  orientation: VdOrientation;
  dir: 'ltr' | 'rtl';
  min: number;
  max: number;
}
@Directive({
  selector: '[vdSplitterHandle]',
  host: {
    class: 'vd-splitter__handle',
    role: 'separator',
    '[attr.tabindex]': 'splitter.locked() ? -1 : 0',
    '[attr.aria-label]': 'label()',
    '[attr.aria-controls]': 'splitter.panes()[0]?.id() ?? null',
    '[attr.aria-orientation]':
      'splitter.orientation() === "horizontal" ? "vertical" : "horizontal"',
    '[attr.aria-valuenow]': 'splitter.position()',
    '[attr.aria-valuemin]': 'splitter.bounds().min',
    '[attr.aria-valuemax]': 'splitter.bounds().max',
    '[attr.aria-disabled]': 'splitter.locked() ? "true" : null',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerEnd($event)',
    '(pointercancel)': 'onPointerEnd($event)',
    '(lostpointercapture)': 'onPointerEnd($event)',
  },
})
export class VdSplitterHandle {
  /** Match the primary pane's name; consumers can provide aria-labelledby for its heading. */
  readonly label = input.required<string>();
  readonly splitter = inject(VdSplitter);
  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  private drag: Drag | null = null;
  constructor() {
    inject(DestroyRef).onDestroy(() => this.finish());
    effect(() => {
      const locked = this.splitter.locked();
      const orientation = this.splitter.orientation();
      const { min, max } = this.splitter.bounds();
      if (
        this.drag &&
        (locked ||
          orientation !== this.drag.orientation ||
          min !== this.drag.min ||
          max !== this.drag.max)
      )
        this.finish();
    });
  }
  private direction(): 'ltr' | 'rtl' {
    return this.splitter.element.matches(':dir(rtl)') ? 'rtl' : 'ltr';
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.target !== this.element ||
      this.splitter.locked() ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    const target = vdSplitterKey(
      event.key,
      this.splitter.position(),
      this.splitter.bounds(),
      this.splitter.orientation(),
      this.direction(),
      this.splitter.step(),
    );
    if (target === null) return;
    event.preventDefault();
    this.finish();
    this.splitter.resize(target);
  }
  protected onPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0 || this.splitter.locked() || this.drag) return;
    // Native capture handles mouse/touch/pen beyond the rail; keyboard remains a fallback.
    if (typeof this.element.setPointerCapture !== 'function') return;
    try {
      this.element.setPointerCapture(event.pointerId);
    } catch {
      return;
    }
    event.preventDefault();
    this.element.focus({ preventScroll: true });
    const orientation = this.splitter.orientation();
    this.drag = {
      id: event.pointerId,
      start: orientation === 'horizontal' ? event.clientX : event.clientY,
      value: this.splitter.position(),
      orientation,
      dir: this.direction(),
      ...this.splitter.bounds(),
    };
    this.splitter.dragging.set(true);
  }
  protected onPointerMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (
      this.splitter.locked() ||
      this.direction() !== drag.dir ||
      this.splitter.orientation() !== drag.orientation
    ) {
      this.finish();
      return;
    }
    const span = this.splitter.panes().reduce((size, pane) => {
      const r = pane.element.getBoundingClientRect();
      return size + (drag.orientation === 'horizontal' ? r.width : r.height);
    }, 0);
    const point = drag.orientation === 'horizontal' ? event.clientX : event.clientY;
    this.splitter.resize(
      vdSplitterDrag(
        drag.value,
        point - drag.start,
        span,
        this.splitter.bounds(),
        drag.orientation === 'horizontal' && drag.dir === 'rtl',
      ),
    );
  }
  protected onPointerEnd(event: PointerEvent): void {
    if (event.pointerId === this.drag?.id) this.finish();
  }
  private finish(): void {
    const drag = this.drag;
    this.drag = null;
    this.splitter.dragging.set(false);
    if (drag && this.element.hasPointerCapture?.(drag.id))
      this.element.releasePointerCapture(drag.id);
  }
}
export const VD_SPLITTER = [VdSplitter, VdSplitterPane, VdSplitterHandle] as const;
