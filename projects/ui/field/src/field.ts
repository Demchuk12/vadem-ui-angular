import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  signal,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';
import { VD_FIELD, VdFieldContext, VdFieldControl, vdUniqueId } from './field-control';

/**
 * Label, hint and error around one form control. Wires `for`, `aria-describedby`,
 * and the required marker automatically. Spec: specs/field.md
 */
@Component({
  selector: 'vd-field',
  imports: [VdIcon],
  template: `
    @if (label()) {
      <label class="vd-field__label" [attr.for]="control()?.id()">
        {{ label() }}
        @if (control()?.required()) {
          <span class="vd-field__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <ng-content />
    @if (showError()) {
      <p class="vd-field__error" [id]="errorId">
        <vd-icon name="alert-circle" />
        <span>{{ error() }}</span>
      </p>
    } @else if (hint()) {
      <p class="vd-field__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
  host: {
    class: 'vd-field',
    '[attr.data-invalid]': 'showError() ? "" : null',
    '[attr.data-disabled]': 'control()?.disabled() ? "" : null',
  },
  providers: [{ provide: VD_FIELD, useExisting: VdField }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdField implements VdFieldContext {
  readonly label = input<string>();
  readonly hint = input<string>();
  /** Additional descriptive IDs, e.g. a character counter; retained beside hint/error. */
  readonly descriptionIds = input<string>();
  /** Message shown while the control is invalid. Replaces the hint. */
  readonly error = input<string>();

  protected readonly control = signal<VdFieldControl | null>(null);
  protected readonly hintId = vdUniqueId('vd-field-hint');
  protected readonly errorId = vdUniqueId('vd-field-error');

  protected readonly showError = computed(() => !!this.error() && !!this.control()?.invalid());

  readonly describedBy = computed(() => {
    const primary = this.showError() ? this.errorId : this.hint() ? this.hintId : '';
    const ids = [primary, this.descriptionIds() ?? ''].join(' ').split(/\s+/).filter(Boolean);
    return [...new Set(ids)].join(' ') || null;
  });

  register(control: VdFieldControl): void {
    this.control.set(control);
  }

  unregister(control: VdFieldControl): void {
    if (this.control() === control) this.control.set(null);
  }
}
