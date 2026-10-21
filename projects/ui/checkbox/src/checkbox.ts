import { Directive, model } from '@angular/core';
import { VdFieldControlBase } from '@vadem/ui/field';

/**
 * Styles a native `<input type="checkbox">`. Checked state, keyboard and forms stay native.
 * Spec: specs/checkbox.md
 */
@Directive({
  selector: 'input[type=checkbox][vdCheckbox]',
  host: {
    class: 'vd-checkbox',
    '[indeterminate]': 'indeterminate()',
    // The browser clears the mixed state on click; keep the model in sync.
    '(change)': 'indeterminate.set(false)',
  },
})
export class VdCheckbox extends VdFieldControlBase {
  /** Mixed state (e.g. "select all" with some items selected). Two-way bindable. */
  readonly indeterminate = model(false);
}
