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
import { VdIcon } from '@vadem/ui/icon';
import { vdRatingKey, vdRatingValue } from './core/rating';
import { vdTexts } from '@vadem/ui/locale';

export type VdRatingSize = 'sm' | 'md' | 'lg';

/** Whole-star rating. The legend names the group; Field supplies hints/errors. */
@Component({
  selector: 'vd-rating',
  imports: [VdIcon],
  template: `
    <fieldset
      class="vd-rating__group"
      role="radiogroup"
      [id]="controlId"
      [attr.aria-required]="isRequired() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-readonly]="readonly() || null"
      [attr.aria-disabled]="isDisabled() || null"
      [attr.aria-describedby]="field?.describedBy() ?? null"
      [attr.aria-labelledby]="labelId"
    >
      <legend class="vd-rating__label vd-field__label" [id]="labelId">
        {{ label() }}
        @if (isRequired()) {
          <span class="vd-field__required" aria-hidden="true">*</span>
        }
      </legend>
      <div class="vd-rating__stars" (pointerleave)="preview.set(0)">
        @for (star of stars; track star) {
          <button
            type="button"
            class="vd-rating__star"
            role="radio"
            [attr.aria-label]="t().starLabel(star)"
            [attr.aria-checked]="selected() === star"
            [attr.tabindex]="(selected() || 1) === star ? 0 : -1"
            [disabled]="isDisabled()"
            [attr.data-filled]="star <= filled() ? '' : null"
            [attr.data-preview]="!locked() && preview() > 0 ? '' : null"
            (pointerenter)="preview.set(star)"
            (click)="choose(star)"
            (keydown)="onKeydown($event, star)"
          >
            <vd-icon name="star" />
          </button>
        }
      </div>
    </fieldset>
  `,
  host: {
    class: 'vd-rating',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdRating implements FormValueControl<number>, OnInit {
  readonly value = model(0);
  readonly label = input.required<string>();
  readonly starLabel = input<(value: number) => string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('rating', { starLabel: this.starLabel });
  readonly size = input<VdRatingSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly controlId = vdUniqueId('vd-rating');
  protected readonly labelId = `${this.controlId}-label`;
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly preview = signal(0);
  protected readonly selected = computed(() => vdRatingValue(this.value()));
  protected readonly filled = computed(() =>
    !this.locked() && this.preview() ? this.preview() : this.selected(),
  );
  protected readonly field = inject(VD_FIELD, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
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
  protected choose(value: number): void {
    if (!this.locked()) {
      this.preview.set(0);
      this.value.set(value);
    }
  }
  protected onKeydown(event: KeyboardEvent, star: number): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const next = vdRatingKey(star, event.key, this.host.matches(':dir(rtl)'));
    if (next === null) return;
    event.preventDefault();
    if (this.locked()) return;
    this.choose(next);
    this.host.querySelectorAll<HTMLButtonElement>('button')[next - 1]?.focus();
  }
  protected onFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.contains(event.relatedTarget as Node)) this.touch.emit();
  }
}
