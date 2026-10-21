import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdCombobox, VdOption, VdSelect } from '@vadem/ui/select';

const CITIES = [
  { value: 'kyiv', label: 'Київ — основний офіс', disabled: false },
  { value: 'lviv', label: 'Львів — команда підтримки клієнтів', disabled: false },
  { value: 'odesa', label: 'Одеса — регіональне представництво', disabled: false },
];

/** Test consumer for programmatic mutations while the native popover stays open. */
@Component({
  selector: 'app-select-lifecycle',
  imports: [ReactiveFormsModule, VdButton, VdField, VdSelect, VdCombobox, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="select-lifecycle-title" data-testid="select-lifecycle">
      <h2 id="select-lifecycle-title">Міста обслуговування</h2>
      <vd-field label="Місто доставки" hint="Оберіть відділення" error="Вкажіть місто доставки">
        <vd-select [formControl]="city" placeholder="Оберіть місто">
          @for (option of options(); track option.value) {
            <vd-option [value]="option.value" [label]="option.label" [disabled]="option.disabled">{{
              option.label
            }}</vd-option>
          }
        </vd-select>
      </vd-field>
      <vd-field label="Пошук міста" hint="Введіть частину назви" error="Вкажіть місто пошуку">
        <vd-combobox [formControl]="search" placeholder="Почніть вводити назву">
          @for (option of options(); track option.value) {
            <vd-option [value]="option.value" [label]="option.label" [disabled]="option.disabled">{{
              option.label
            }}</vd-option>
          }
        </vd-combobox>
      </vd-field>
      <p data-testid="selection">{{ city.value }} / {{ search.value }}</p>
      <button vdButton (click)="setDisabled(true)">Вимкнути поля</button>
      <button vdButton (click)="setDisabled(false)">Увімкнути поля</button>
      <button vdButton (click)="reset()">Скинути вибір</button>
      <button vdButton (click)="restore()">Відновити міста</button>
      <button vdButton (click)="removeLviv()">Прибрати Львів</button>
      <button vdButton (click)="disableKyiv()">Вимкнути Київ</button>
      <button vdButton (click)="options.set([])">Очистити міста</button>
      <button vdButton (click)="setRequired(false)">Зняти обов’язковість</button>
      <button vdButton (click)="setRequired(true)">Зробити обов’язковими</button>
    </section>
  `,
})
export class SelectLifecycle {
  readonly city = new FormControl<string | null>('kyiv', Validators.required);
  readonly search = new FormControl<string | null>('kyiv', Validators.required);
  readonly options = signal(CITIES);

  setDisabled(disabled: boolean): void {
    for (const control of [this.city, this.search]) {
      if (disabled) control.disable();
      else control.enable();
    }
  }

  reset(): void {
    this.city.reset();
    this.search.reset();
  }

  restore(): void {
    this.options.set(CITIES);
  }

  removeLviv(): void {
    this.options.update((options) => options.filter((option) => option.value !== 'lviv'));
  }

  disableKyiv(): void {
    this.options.update((options) =>
      options.map((option) => ({ ...option, disabled: option.value === 'kyiv' })),
    );
  }

  setRequired(required: boolean): void {
    for (const control of [this.city, this.search]) {
      control.setValidators(required ? Validators.required : null);
      control.updateValueAndValidity();
    }
  }
}
