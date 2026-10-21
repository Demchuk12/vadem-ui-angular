import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, VdButton, VdField, VdInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="profile" (ngSubmit)="save()" novalidate>
      <vd-field
        label="Ім’я"
        hint="Як до вас звертатися"
        error="Введіть ім’я (щонайменше 2 символи)"
      >
        <input vdInput formControlName="name" autocomplete="given-name" />
      </vd-field>
      <vd-field label="Електронна пошта" error="Введіть коректну адресу електронної пошти">
        <input vdInput type="email" formControlName="email" autocomplete="email" />
      </vd-field>
      <button vdButton variant="primary" type="submit">Зберегти</button>
      <p role="status">{{ status() }}</p>
    </form>
  `,
})
export class ProfileForm {
  protected readonly profile = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  protected readonly status = signal('');

  protected save(): void {
    this.profile.markAllAsTouched();
    this.status.set('');
    if (this.profile.invalid) return;
    // Pass this.profile.getRawValue() to the application's persistence layer.
    this.status.set('Форму перевірено. Приклад не надсилає дані на сервер.');
  }
}
