import { Directive, input } from '@angular/core';
import { VdFieldControlBase } from '@vadem/ui/field';

export type VdInputSize = 'sm' | 'md' | 'lg';

/**
 * Styles a native `<input>` or `<textarea>`. Value binding stays native (any forms API works);
 * validity is read from Reactive/Template forms (`NgControl`) or Signal Forms (`[formField]`)
 * and shown once the control is touched. Spec: specs/input.md
 */
@Directive({
  selector: 'input[vdInput], textarea[vdInput]',
  host: {
    class: 'vd-input',
    '[attr.data-size]': 'size()',
  },
})
export class VdInput extends VdFieldControlBase {
  readonly size = input<VdInputSize>('md');
}
