import { DestroyRef, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';

export interface VdNgControlState {
  invalid: boolean;
  touched: boolean;
  disabled: boolean;
  required: boolean;
}

const EMPTY: VdNgControlState = {
  invalid: false,
  touched: false,
  disabled: false,
  required: false,
};

/**
 * Mirrors a Reactive/Template forms control into a signal (NgControl isn't signal-based).
 * Call once the control is resolved (ngOnInit or later). Returns a static empty state when
 * there's no control or it's a Signal Forms shim without `events`.
 */
export function vdNgControlState(
  ngControl: NgControl | null,
  destroyRef: DestroyRef,
): Signal<VdNgControlState> {
  const control = ngControl?.control;
  const state = signal(EMPTY);
  if (!control?.events) return state;
  const sync = () =>
    state.set({
      invalid: control.invalid,
      touched: control.touched,
      disabled: control.disabled,
      required:
        control.hasValidator(Validators.required) || control.hasValidator(Validators.requiredTrue),
    });
  sync();
  control.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(sync);
  return state;
}
