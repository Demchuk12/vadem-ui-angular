import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  Signal,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField, FormValueControl } from '@angular/forms/signals';
import {
  VD_FIELD,
  VdFieldControl,
  VdNgControlState,
  vdNgControlState,
  vdUniqueId,
} from '@vadem/ui/field';
import {
  VdRangeValue,
  vdRangeBounds,
  vdRangeValue,
  vdRangeMove,
  vdRangeKey,
} from './core/range-slider';
import { vdTexts } from '@vadem/ui/locale';

@Component({
  selector: 'vd-range-slider',
  template: `
    <div class="vd-range-slider__group" role="group" [attr.aria-labelledby]="labelId">
      <p class="vd-field__label" [id]="labelId">{{ label() }}</p>
      <div class="vd-range-slider__values">
        @for (index of indices; track index) {
          <span
            ><span [id]="controlId + '-label-' + index">{{
              index === 0 ? t().lowerLabel : t().upperLabel
            }}</span>
            <span class="vd-range-slider__number">{{ valueText()(selected()[index]) }}</span></span
          >
        }
      </div>
      <div
        #rail
        class="vd-range-slider__rail"
        [style.--vd-range-start]="percent(0) + '%'"
        [style.--vd-range-end]="percent(1) + '%'"
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="endDrag($event)"
        (pointercancel)="endDrag($event)"
        (lostpointercapture)="endDrag($event)"
      >
        <span class="vd-range-slider__track" aria-hidden="true"></span>
        <span class="vd-range-slider__fill" aria-hidden="true"></span>
        @for (index of indices; track index) {
          <button
            type="button"
            role="slider"
            class="vd-range-slider__thumb"
            [attr.data-index]="index"
            [id]="index === 0 ? controlId : controlId + '-upper'"
            [style.inset-inline-start]="percent(index) + '%'"
            [attr.aria-labelledby]="labelId + ' ' + controlId + '-label-' + index"
            [attr.aria-valuenow]="selected()[index]"
            [attr.aria-valuemin]="index === 0 ? bounds().min : selected()[0]"
            [attr.aria-valuemax]="index === 0 ? selected()[1] : bounds().max"
            [attr.aria-valuetext]="valueText()(selected()[index])"
            [attr.aria-describedby]="field?.describedBy() ?? null"
            [attr.aria-invalid]="showInvalid() || null"
            [attr.aria-disabled]="locked() || null"
            [disabled]="isDisabled()"
            (keydown)="onKeydown($event, index)"
          >
            <span class="vd-visually-hidden">{{
              index === 0 ? t().lowerLabel : t().upperLabel
            }}</span>
          </button>
        }
      </div>
    </div>
  `,
  host: {
    class: 'vd-range-slider',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-dragging]': 'dragging() ? "" : null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdRangeSlider implements FormValueControl<VdRangeValue | null>, OnInit {
  readonly value = model<VdRangeValue | null>([25, 75]);
  readonly minValue = input(0);
  readonly maxValue = input(100);
  readonly step = input(1);
  readonly label = input.required<string>();
  readonly lowerLabel = input<string>();
  readonly upperLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('rangeSlider', {
    lowerLabel: this.lowerLabel,
    upperLabel: this.upperLabel,
  });
  readonly valueText = input<(value: number) => string>(String);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly controlId = vdUniqueId('vd-range-slider');
  protected readonly labelId = this.controlId + '-group-label';
  protected readonly indices = [0, 1] as const;
  protected readonly bounds = computed(() =>
    vdRangeBounds(this.minValue(), this.maxValue(), this.step()),
  );
  protected readonly selected = computed(() => vdRangeValue(this.value(), this.bounds()));
  protected readonly dragging = signal(false);
  protected readonly field = inject(VD_FIELD, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private drag: { pointer: number; index: 0 | 1 } | null = null;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBound = signal(false);
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly ngState = computed(
    () =>
      this.ngSource()?.() ?? { invalid: false, touched: false, disabled: false, required: false },
  );
  protected readonly isDisabled = computed(() => this.disabled() || this.ngState().disabled);
  protected readonly locked = computed(() => this.isDisabled() || this.readonly());
  protected readonly isRequired = computed(() => this.required() || this.ngState().required);
  protected readonly showInvalid = computed(
    () =>
      (this.invalid() && (!this.formBound() || this.touched())) ||
      (this.ngState().invalid && this.ngState().touched),
  );

  constructor() {
    const control: VdFieldControl = {
      id: signal(this.controlId),
      invalid: this.showInvalid,
      required: this.isRequired,
      disabled: this.isDisabled,
    };
    this.field?.register(control);
    this.destroyRef.onDestroy(() => this.field?.unregister(control));
  }
  ngOnInit(): void {
    const ng = this.injector.get(NgControl, null, { self: true, optional: true });
    this.formBound.set(
      !!ng || !!this.injector.get(FormField, null, { self: true, optional: true }),
    );
    this.ngSource.set(vdNgControlState(ng, this.destroyRef));
  }

  protected percent(index: 0 | 1): number {
    const { min, max } = this.bounds();
    return max > min ? ((this.selected()[index] - min) / (max - min)) * 100 : 0;
  }
  private choose(index: 0 | 1, next: number): void {
    if (this.locked()) return;
    const current = this.selected();
    const value = vdRangeMove(current, index, next, this.bounds());
    if (current[0] !== value[0] || current[1] !== value[1]) this.value.set(value);
  }
  protected onKeydown(event: KeyboardEvent, index: 0 | 1): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const next = vdRangeKey(
      event.key,
      this.selected()[index],
      index === 0 ? this.bounds().min : this.selected()[0],
      index === 0 ? this.selected()[1] : this.bounds().max,
      this.bounds().step,
      this.host.matches(':dir(rtl)'),
    );
    if (next === null) return;
    event.preventDefault();
    this.choose(index, next);
  }
  private pointerValue(event: PointerEvent): number {
    const rect = this.rail().nativeElement.getBoundingClientRect();
    const fraction = rect.width ? (event.clientX - rect.x) / rect.width : 0;
    const position = this.host.matches(':dir(rtl)') ? 1 - fraction : fraction;
    return this.bounds().min + position * (this.bounds().max - this.bounds().min);
  }
  protected onPointerDown(event: PointerEvent): void {
    if (this.locked() || this.drag || !event.isPrimary || event.button !== 0) return;
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-index]');
    const next = this.pointerValue(event);
    const index: 0 | 1 = target
      ? (Number(target.dataset['index']) as 0 | 1)
      : Math.abs(next - this.selected()[0]) < Math.abs(next - this.selected()[1])
        ? 0
        : 1;
    event.preventDefault();
    this.host.querySelectorAll<HTMLButtonElement>('button')[index].focus();
    this.rail().nativeElement.setPointerCapture(event.pointerId);
    this.drag = { pointer: event.pointerId, index };
    this.dragging.set(true);
    // Pressing a thumb should not jump to the pointer's offset within its hit area.
    if (!target) this.choose(index, next);
  }
  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerId === this.drag?.pointer)
      this.choose(this.drag.index, this.pointerValue(event));
  }
  protected endDrag(event: PointerEvent): void {
    if (event.pointerId !== this.drag?.pointer) return;
    this.drag = null;
    this.dragging.set(false);
    const rail = this.rail().nativeElement;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  }
  protected onFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.contains(event.relatedTarget as Node)) this.touch.emit();
  }
}
