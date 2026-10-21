import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  Signal,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { VD_FIELD, VdFieldControl, vdUniqueId } from './field-control';
import { VdNgControlState, vdNgControlState } from './ng-control-state';

/**
 * Shared behavior for controls on native form elements (input, checkbox, switch):
 * displayed validity from Reactive/Template forms or Signal Forms, `vd-field` registration,
 * and the ARIA/data attributes that go with it. Not part of the styling contract.
 */
@Directive({
  host: {
    '[id]': 'id()',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.aria-invalid]': 'showInvalid() ? "true" : null',
    '[attr.aria-describedby]': 'field?.describedBy() ?? null',
    '[attr.required]': 'required() || (requiredByValidator() && isRadio) ? "" : null',
    // Reactive/Template validators don't add the native attribute. Announce them with
    // aria-required (not supported on role=radio, which gets the native attribute instead).
    '[attr.aria-required]': 'requiredByValidator() && !isRadio ? "true" : null',
  },
})
export abstract class VdFieldControlBase implements OnInit {
  /** Invalid state (e.g. a server error). Reactive/Template form validity is detected on its own. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Optional gate for `invalid`: when explicitly false the error isn't shown yet. Signal Forms
   * binds `invalid`, `touched` and `required` here automatically (FormUiControl contract).
   */
  readonly touched = input<boolean | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input(vdUniqueId('vd-control'));

  protected readonly field = inject(VD_FIELD, { optional: true });
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly formField = inject(FormField, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  /** Mirrored Reactive/Template forms state; set once the control is resolved (ngOnInit). */
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly ngState = computed(
    () =>
      this.ngSource()?.() ?? { invalid: false, touched: false, disabled: false, required: false },
  );

  protected readonly isRadio =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.getAttribute('type') === 'radio';
  /** Required by a Reactive/Template validator while the `required` input is unset. */
  protected readonly requiredByValidator = computed(
    () => !this.required() && this.ngState().required,
  );

  /** Invalid as displayed: forced, or form-invalid after the user has touched the control. */
  readonly showInvalid = computed(() => {
    if (this.invalid() && this.touched() !== false) return true;
    const ng = this.ngState();
    return ng.invalid && ng.touched;
  });

  private readonly fieldControl: VdFieldControl = {
    id: this.id,
    invalid: this.showInvalid,
    required: computed(
      () => this.required() || this.ngState().required || !!this.formField?.state().required(),
    ),
    disabled: computed(() => this.ngState().disabled || !!this.formField?.state().disabled()),
  };

  constructor() {
    this.field?.register(this.fieldControl);
    this.destroyRef.onDestroy(() => this.field?.unregister(this.fieldControl));
  }

  ngOnInit(): void {
    // NgControl resolves its control only after init. Signal Forms provides an NgControl shim
    // too; its state arrives through the inputs instead.
    if (!this.formField) this.ngSource.set(vdNgControlState(this.ngControl, this.destroyRef));
  }
}
