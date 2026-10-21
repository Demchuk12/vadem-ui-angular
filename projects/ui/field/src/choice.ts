import { Directive } from '@angular/core';

/**
 * Label that wraps a checkbox, switch or radio and its text. The whole label is the hit area;
 * the text is the control's accessible name. Spec: specs/checkbox.md
 */
@Directive({
  selector: 'label[vdChoice]',
  host: { class: 'vd-choice' },
})
export class VdChoice {}
