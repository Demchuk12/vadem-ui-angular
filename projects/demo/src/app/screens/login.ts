import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VD_ALERT } from '@vadem/ui/alert';
import { VdButton } from '@vadem/ui/button';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VdChoice, VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';

@Component({
  selector: 'demo-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    VD_ALERT,
    VdButton,
    VdCheckbox,
    VdChoice,
    VdField,
    VdIcon,
    VdInput,
    VdInputGroup,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <main class="login__main">
        <a class="login__back" routerLink="/colors">
          <vd-icon name="arrow-left" />Галерея компонентів
        </a>

        <div class="login__panel">
          <a class="login__brand" routerLink="/screens/dashboard" aria-label="Vadem Cloud">
            <img
              class="login__mark demo-on-dark"
              src="brand/vadem-mark-dark.svg"
              alt=""
              width="42"
              height="40"
            />
            <img
              class="login__mark demo-on-light"
              src="brand/vadem-mark-light.svg"
              alt=""
              width="42"
              height="40"
            />
          </a>
          <header class="login__head">
            <h1>Вхід у Vadem Cloud</h1>
            <p>Раді бачити знову. Увійдіть, щоб продовжити роботу з проєктами.</p>
          </header>

          <button vdButton size="lg" class="login__wide" type="button" (click)="sso()">
            <vd-icon name="key" slot="start" />Увійти через SSO
          </button>

          <p class="login__divider"><span>або з email</span></p>

          <form class="login__form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (error()) {
              <div vdAlert variant="danger" role="alert">
                <p vdAlertTitle>{{ error() }}</p>
                <p>Перевірте розкладку клавіатури та Caps Lock.</p>
              </div>
            }

            <vd-field label="Email" error="Вкажіть email у форматі name@company.ua">
              <vd-input-group>
                <vd-icon name="mail" slot="start" />
                <input
                  vdInput
                  size="lg"
                  type="email"
                  formControlName="email"
                  autocomplete="username"
                  placeholder="name@company.ua"
                />
              </vd-input-group>
            </vd-field>

            <vd-field label="Пароль" error="Пароль має містити щонайменше 8 символів">
              <vd-input-group>
                <vd-icon name="lock" slot="start" />
                <input
                  vdInput
                  size="lg"
                  [type]="reveal() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                />
                <button
                  vdButton
                  type="button"
                  variant="ghost"
                  iconOnly
                  size="sm"
                  slot="end"
                  [attr.aria-pressed]="reveal()"
                  aria-label="Показати пароль"
                  (click)="reveal.set(!reveal())"
                >
                  <vd-icon [name]="reveal() ? 'eye-off' : 'eye'" />
                </button>
              </vd-input-group>
            </vd-field>

            <div class="login__row">
              <label vdChoice>
                <input type="checkbox" vdCheckbox formControlName="remember" />
                Запамʼятати мене
              </label>
              <a href="#" (click)="$event.preventDefault()">Забули пароль?</a>
            </div>

            <button
              vdButton
              variant="primary"
              size="lg"
              type="submit"
              class="login__wide"
              [loading]="busy()"
            >
              Увійти
            </button>
          </form>

          <p class="login__foot">
            Немає акаунта? <a href="#" (click)="$event.preventDefault()">Створити безкоштовно</a>
          </p>
          <p class="login__hint">
            Демо: будь-який email і пароль від 8 символів. Пароль <code>password</code> покаже
            помилку входу.
          </p>
        </div>
      </main>

      <aside class="login__aside" aria-hidden="true">
        <div class="login__glow"></div>
        <div class="login__quote">
          <p class="vd-eyebrow">Vadem Cloud · 2026</p>
          <p class="login__quote-text">
            Розгортання за 40 секунд, відкат за одну. Команда перестала боятися пʼятниць.
          </p>
          <p class="login__quote-author">Ірина Бондар, техлідка «Аналітики»</p>
        </div>
        <ul class="login__stats">
          <li><span class="vd-tabular">99,99%</span>доступність</li>
          <li><span class="vd-tabular">40 с</span>медіанне розгортання</li>
          <li><span class="vd-tabular">12</span>регіонів</li>
        </ul>
      </aside>
    </div>
  `,
  styleUrl: './login.css',
})
export default class LoginScreen {
  private readonly router = inject(Router);

  protected readonly reveal = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    remember: new FormControl(true, { nonNullable: true }),
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    this.error.set('');
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      if (this.form.controls.password.value === 'password') {
        this.error.set('Невірний email або пароль');
        return;
      }
      void this.router.navigateByUrl('/screens/dashboard');
    }, 900);
  }

  protected sso(): void {
    this.error.set('');
    this.busy.set(true);
    setTimeout(() => void this.router.navigateByUrl('/screens/dashboard'), 600);
  }
}
