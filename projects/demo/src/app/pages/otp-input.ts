import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, pattern, required } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdOtpInput } from '@vadem/ui/otp-input';

@Component({
  selector: 'demo-otp-input',
  imports: [VdOtpInput, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-otp-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-otp-stack .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / OTP input</p>
      <h1>OTP input</h1>
      <p>A short code, one familiar field. Paste, select and edit without moving between digits.</p>
    </header>
    <section class="demo-section" aria-labelledby="otp-confirmation">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Confirmation</p>
        <h2 id="otp-confirmation">Enter the code in one step</h2>
        <p>Leading zeros stay intact. Enter the full code, then confirm when you are ready.</p>
      </div>
      <form class="demo-panel demo-otp-stack" (submit)="confirm($event)">
        <vd-field
          label="Код підтвердження"
          hint="Уведіть 6 цифр із повідомлення. Можна вставити весь код."
          error="Укажіть рівно 6 цифр без пробілів"
        >
          <input vdOtpInput [formControl]="code" name="verification-code" required />
        </vd-field>
        <div class="demo-row">
          <button vdButton type="submit">Підтвердити код</button>
          <button
            vdButton
            variant="secondary"
            type="button"
            (click)="code.disabled ? code.enable() : code.disable()"
          >
            Перемкнути доступність
          </button>
          <button
            vdButton
            variant="ghost"
            type="button"
            (click)="code.reset(); submitted.set(false)"
          >
            Очистити
          </button>
        </div>
        <p role="status" class="demo-token" data-testid="otp-status">
          {{ submitted() ? 'Демонстраційний код прийнято' : 'Очікуємо підтвердження' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="otp-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="otp-states">Short codes, clear feedback</h2>
      </div>
      <div class="demo-grid demo-otp-stack" style="--demo-min: 20rem">
        <div class="demo-panel">
          <vd-field label="Код із 4 цифр" hint="Компактний розмір">
            <input vdOtpInput length="4" size="sm" value="0042" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Код із 8 цифр" hint="Великий розмір">
            <input vdOtpInput length="8" size="lg" value="01234567" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Код тільки для перегляду" hint="Можна виділити та скопіювати">
            <input vdOtpInput readonly value="004281" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Недоступний код" hint="Поле тимчасово заблоковане">
            <input vdOtpInput disabled value="004281" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field
            label="Перевірте код"
            error="Код не збігається. Перевірте останнє повідомлення."
          >
            <input vdOtpInput invalid value="004281" />
          </vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="otp-signal">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="otp-signal">Keep validation with your form</h2>
      </div>
      <div class="demo-panel demo-otp-stack">
        <vd-field label="Код запрошення" hint="4 цифри" error="Укажіть рівно 4 цифри">
          <input vdOtpInput length="4" [formField]="invitationForm.code" />
        </vd-field>
        <button
          vdButton
          variant="secondary"
          type="button"
          (click)="invitation.set({ code: '0042' })"
        >
          Заповнити прикладом
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="otp-content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="otp-content">A stable digit order in either direction</h2>
      </div>
      <div class="demo-grid demo-otp-stack" style="--demo-min: 22rem">
        <div class="demo-panel">
          <vd-field
            label="Код для підтвердження доступу до спільного простору української команди"
            hint="Уведіть 6 цифр з останнього повідомлення для вашого облікового запису."
          >
            <input vdOtpInput value="012345" />
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="رمز التحقق" hint="أدخل الرمز المكون من ستة أرقام">
            <input vdOtpInput value="012345" />
          </vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class OtpInputPage {
  readonly code = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
  });
  readonly submitted = signal(false);
  readonly invitation = signal({ code: '' });
  readonly invitationForm = form(this.invitation, (path) => {
    required(path.code);
    pattern(path.code, /^[0-9]{4}$/);
  });

  confirm(event: Event): void {
    event.preventDefault();
    this.code.markAsTouched();
    this.submitted.set(this.code.enabled && this.code.valid);
  }
}
