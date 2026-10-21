import { Directive } from '@angular/core';
import { VdFieldControlBase } from '@vadem/ui/field';

/**
 * Styles a native `<input type="radio">`. Grouping (shared `name`), arrow keys and form values
 * stay native; wrap each in `label[vdChoice]` and the group in `fieldset[vdFieldset]`.
 * Spec: specs/radio.md
 */
@Directive({
  selector: 'input[type=radio][vdRadio]',
  host: { class: 'vd-radio' },
})
export class VdRadio extends VdFieldControlBase {}
