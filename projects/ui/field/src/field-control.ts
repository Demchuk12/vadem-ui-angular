import { InjectionToken, Signal } from '@angular/core';

/** What a form control exposes to its surrounding `vd-field`. */
export interface VdFieldControl {
  readonly id: Signal<string>;
  readonly invalid: Signal<boolean>;
  readonly required: Signal<boolean>;
  readonly disabled: Signal<boolean>;
}

/** What `vd-field` exposes to the control inside it. */
export interface VdFieldContext {
  /** Space-separated ids for `aria-describedby` (hint or error), or null. */
  readonly describedBy: Signal<string | null>;
  register(control: VdFieldControl): void;
  unregister(control: VdFieldControl): void;
}

export const VD_FIELD = new InjectionToken<VdFieldContext>('VD_FIELD');

let nextId = 0;
/** Deterministic per-app id. Same creation order on server and client keeps hydration stable. */
export function vdUniqueId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}
