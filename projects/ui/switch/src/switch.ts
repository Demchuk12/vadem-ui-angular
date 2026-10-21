import { Directive } from '@angular/core';
import { VdFieldControlBase } from '@vadem/ui/field';

/**
 * A native `<input type="checkbox">` exposed as `role="switch"` (on/off, takes effect
 * immediately). Forms and keyboard stay native. Spec: specs/switch.md
 */
@Directive({
  selector: 'input[type=checkbox][vdSwitch]',
  host: {
    class: 'vd-switch',
    role: 'switch',
  },
})
export class VdSwitch extends VdFieldControlBase {}
