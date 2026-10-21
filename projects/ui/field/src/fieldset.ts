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

export type VdFieldsetOrientation = 'vertical' | 'horizontal';

/**
 * Legend, hint and error around a group of choices (radios, checkboxes). The group is named by
 * the legend; hint and error describe the fieldset itself, so they are announced once when the
 * group is entered, not on every option. Spec: specs/field.md
 */
@Component({
  // Attribute selector: the native fieldset keeps its group semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fieldset[vdFieldset]',
  imports: [VdIcon],
  template: `
    @if (legend()) {
      <legend class="vd-fieldset__legend">
        {{ legend() }}
        @if (required()) {
          <span class="vd-field__required" aria-hidden="true">*</span>
        }
      </legend>
    }
    @if (hint()) {
      <p class="vd-field__hint" [id]="hintId">{{ hint() }}</p>
    }
    @if (showError()) {
      <p class="vd-field__error" [id]="errorId">
        <vd-icon name="alert-circle" />
        <span>{{ error() }}</span>
      </p>
    }
    <div class="vd-fieldset__options"><ng-content /></div>
  `,
  host: {
    class: 'vd-fieldset',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'showError() ? "" : null',
    '[attr.aria-describedby]': 'groupDescribedBy()',
  },
  providers: [{ provide: VD_FIELD, useExisting: VdFieldset }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdFieldset implements VdFieldContext {
  readonly legend = input<string>();
  readonly hint = input<string>();
  /** Shown while any control in the group is displayed invalid. */
  readonly error = input<string>();
  readonly orientation = input<VdFieldsetOrientation>('vertical');

  protected readonly controls = signal<readonly VdFieldControl[]>([]);
  protected readonly hintId = vdUniqueId('vd-fieldset-hint');
  protected readonly errorId = vdUniqueId('vd-fieldset-error');

  protected readonly required = computed(() => this.controls().some((c) => c.required()));
  protected readonly showError = computed(
    () => !!this.error() && this.controls().some((c) => c.invalid()),
  );
  protected readonly groupDescribedBy = computed(
    () =>
      [this.hint() ? this.hintId : null, this.showError() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );

  /** Controls aren't described individually: the fieldset carries the description. */
  readonly describedBy = signal<string | null>(null).asReadonly();

  register(control: VdFieldControl): void {
    this.controls.update((list) => [...list, control]);
  }

  unregister(control: VdFieldControl): void {
    this.controls.update((list) => list.filter((c) => c !== control));
  }
}
