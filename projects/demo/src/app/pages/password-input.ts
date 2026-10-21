import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, minLength } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VD_PASSWORD_INPUT } from '@vadem/ui/password-input';

@Component({
  selector: 'demo-password-input',
  imports: [VD_PASSWORD_INPUT, VdButton, VdField, VdIcon, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-password-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-password-stack .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Password input</p>
      <h1>Password input</h1>
      <p>
        Keep typing, reveal when needed. Native password entry with a named toggle and familiar form
        behavior.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="password-editing">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Editing</p>
        <h2 id="password-editing">Inspect without losing your place</h2>
        <p>
          Reveal preserves your selection. Keyboard activation keeps focus on the button; a pointer
          click while typing keeps focus in the field.
        </p>
      </div>
      <form
        class="demo-panel demo-password-stack"
        (submit)="$event.preventDefault(); submissions.set(submissions() + 1)"
      >
        <vd-field
          label="Пароль облікового запису"
          hint="Демонстраційні дані: використовуйте вигаданий пароль."
          error="Укажіть щонайменше 8 символів"
        >
          <vd-password-input revealLabel="Показати пароль облікового запису">
            <vd-icon slot="start" name="lock" />
            <input
              vdPasswordInput
              type="password"
              [formControl]="password"
              autocomplete="current-password"
              name="account-password"
              required
            />
          </vd-password-input>
        </vd-field>
        <div class="demo-row">
          <button
            vdButton
            variant="secondary"
            type="button"
            (click)="password.disabled ? password.enable() : password.disable()"
          >
            Перемкнути доступність
          </button>
          <button vdButton variant="ghost" type="button" (click)="password.reset()">
            Очистити пароль
          </button>
          <button vdButton type="submit">Перевірити форму</button>
        </div>
        <p role="status" class="demo-token" data-testid="password-form-status">
          {{ password.dirty ? 'Змінено' : 'Без змін' }} ·
          {{ password.touched ? 'Поле відвідане' : 'Поле не відвідане' }} · Відправлень:
          {{ submissions() }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="password-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="password-states">Same control, clear boundaries</h2>
      </div>
      <div class="demo-grid demo-password-stack" style="--demo-min: 20rem">
        <div class="demo-panel">
          <vd-field label="Короткий код" hint="Компактне поле">
            <vd-password-input revealLabel="Показати короткий код"
              ><input
                vdPasswordInput
                type="password"
                size="sm"
                value="demo-code"
                autocomplete="off"
            /></vd-password-input>
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Новий пароль для робочого простору" hint="Велике поле">
            <vd-password-input revealLabel="Показати новий пароль"
              ><input
                vdPasswordInput
                type="password"
                size="lg"
                placeholder="Введіть новий пароль"
                autocomplete="new-password"
            /></vd-password-input>
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field
            label="Пароль тільки для перегляду"
            hint="Редагування вимкнено; показ доступний."
          >
            <vd-password-input revealLabel="Показати пароль тільки для перегляду"
              ><input
                vdPasswordInput
                type="password"
                readonly
                value="ЛишеДемо-іЇєҐ-2026"
                autocomplete="off"
            /></vd-password-input>
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field
            label="Недоступний пароль"
            hint="Спочатку відновіть доступ до облікового запису."
          >
            <vd-password-input revealLabel="Показати недоступний пароль"
              ><input
                vdPasswordInput
                type="password"
                disabled
                value="demo-disabled"
                autocomplete="off"
            /></vd-password-input>
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field
            label="Повторіть пароль"
            error="Паролі не збігаються. Перевірте введені символи."
          >
            <vd-password-input revealLabel="Показати повторений пароль"
              ><input
                vdPasswordInput
                type="password"
                invalid
                value="demo-mismatch"
                autocomplete="new-password"
            /></vd-password-input>
          </vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="password-signal">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="password-signal">Validation stays with the form</h2>
      </div>
      <div class="demo-panel demo-password-stack">
        <vd-field
          label="Пароль нового учасника"
          hint="Щонайменше 8 символів"
          error="Додайте щонайменше 8 символів"
        >
          <vd-password-input revealLabel="Показати пароль нового учасника"
            ><input
              vdPasswordInput
              type="password"
              [formField]="memberForm.password"
              autocomplete="new-password"
          /></vd-password-input>
        </vd-field>
        <button
          vdButton
          variant="secondary"
          (click)="member.set({ password: 'ЛишеДемо-іЇєҐ-2026' })"
        >
          Заповнити демонстраційним паролем
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="password-content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="password-content">Readable labels in either direction</h2>
      </div>
      <div class="demo-grid demo-password-stack" style="--demo-min: 22rem">
        <div class="demo-panel">
          <vd-field
            label="Пароль для підтвердження доступу до спільного простору української команди"
            hint="Українські символи і, ї, є, ґ зберігаються без перетворень."
          >
            <vd-password-input revealLabel="Показати пароль української команди"
              ><input vdPasswordInput type="password" value="ЛишеДемо-іЇєҐ-2026" autocomplete="off"
            /></vd-password-input>
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="كلمة مرور الحساب" hint="بيانات تجريبية فقط">
            <vd-password-input revealLabel="إظهار كلمة المرور"
              ><input vdPasswordInput type="password" value="تجربة-2026" autocomplete="off"
            /></vd-password-input>
          </vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class PasswordInputPage {
  readonly password = new FormControl('ЛишеДемо-іЇєҐ-2026', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(8)],
  });
  readonly submissions = signal(0);
  readonly member = signal({ password: '' });
  readonly memberForm = form(this.member, (path) => {
    required(path.password);
    minLength(path.password, 8);
  });
}
