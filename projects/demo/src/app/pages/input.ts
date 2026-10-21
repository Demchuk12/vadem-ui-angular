import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup, VdInputSize } from '@vadem/ui/input';

@Component({
  selector: 'demo-input',
  imports: [ReactiveFormsModule, FormField, VdButton, VdField, VdIcon, VdInput, VdInputGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Input · Field</p>
      <h1>Input</h1>
      <p>
        <code>input[vdInput]</code> styles the native element; <code>vd-field</code> wires label,
        hint and error; <code>vd-input-group</code> adds icons and buttons. Errors wait until the
        user leaves the field.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size</p>
        <h2 id="sizes">Sizes</h2>
        <p>Same heights as buttons, so they line up in toolbars.</p>
      </div>
      <div class="demo-panel demo-stack">
        @for (size of sizes; track size) {
          <div class="demo-inline">
            <input
              vdInput
              [size]="size"
              placeholder="Пошук проєктів"
              [attr.aria-label]="'Пошук ' + size"
            />
            <button vdButton [size]="size">Знайти</button>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">states</p>
        <h2 id="states">States</h2>
        <p>Hover and focus are live.</p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Порожнє" hint="Плейсхолдер — лише приклад, не підпис">
          <input vdInput placeholder="name@company.ua" />
        </vd-field>
        <vd-field label="Заповнене">
          <input vdInput value="olena.kovalenko@vadem.dev" />
        </vd-field>
        <vd-field label="Недоступне" hint="Змінюється адміністратором">
          <input vdInput value="Vadem Studio" disabled />
        </vd-field>
        <vd-field label="Лише читання">
          <input vdInput value="vd_live_3f9a…c21" readonly />
        </vd-field>
        <vd-field label="З помилкою" error="Такий субдомен уже зайнятий">
          <input vdInput value="vadem" invalid />
        </vd-field>
        <vd-field label="Обовʼязкове" hint="Позначене зірочкою">
          <input vdInput required />
        </vd-field>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="group">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-input-group · slot="start|end"</p>
        <h2 id="group">With icons and actions</h2>
        <p>Buttons inside keep a concentric radius. Click the icon area to focus the input.</p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Пошук">
          <vd-input-group>
            <vd-icon name="search" slot="start" />
            <input
              vdInput
              type="search"
              placeholder="Назва, тег або ID"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
            @if (query()) {
              <button
                vdButton
                variant="ghost"
                iconOnly
                size="sm"
                slot="end"
                aria-label="Очистити"
                (click)="query.set('')"
              >
                <vd-icon name="x" />
              </button>
            }
          </vd-input-group>
        </vd-field>
        <vd-field label="Email">
          <vd-input-group>
            <vd-icon name="mail" slot="start" />
            <input vdInput type="email" value="team@vadem.dev" />
          </vd-input-group>
        </vd-field>
        <vd-field label="API-ключ" hint="Показуємо лише один раз">
          <vd-input-group>
            <input vdInput readonly value="vd_live_3f9a8e1b7c21" class="demo-mono" />
            <button
              vdButton
              variant="ghost"
              size="sm"
              iconOnly
              slot="end"
              aria-label="Копіювати API-ключ"
            >
              <vd-icon name="copy" />
            </button>
          </vd-input-group>
        </vd-field>
        <vd-field label="Розмір lg">
          <vd-input-group>
            <vd-icon name="search" slot="start" />
            <input vdInput size="lg" placeholder="Що шукаємо?" />
          </vd-input-group>
        </vd-field>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="reactive">
      <div class="demo-section__head">
        <p class="vd-eyebrow">reactive forms</p>
        <h2 id="reactive">Validation in a form</h2>
        <p>Tab through without typing, or press “Увійти”: errors appear after touch.</p>
      </div>
      <form class="demo-panel demo-login" [formGroup]="login" (ngSubmit)="submit()" novalidate>
        <vd-field label="Email" error="Вкажіть email у форматі name@company.ua">
          <vd-input-group>
            <vd-icon name="mail" slot="start" />
            <input
              vdInput
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="name@company.ua"
            />
          </vd-input-group>
        </vd-field>
        <vd-field
          label="Пароль"
          hint="Щонайменше 8 символів"
          error="Пароль занадто короткий — потрібно 8+ символів"
        >
          <vd-input-group>
            <input
              vdInput
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
        <button vdButton variant="primary" type="submit" [loading]="signingIn()">Увійти</button>
        <p class="demo-token" aria-live="polite">{{ result() }}</p>
      </form>
    </section>

    <section class="demo-section" aria-labelledby="signal">
      <div class="demo-section__head">
        <p class="vd-eyebrow">signal forms · [formField]</p>
        <h2 id="signal">Signal Forms</h2>
        <p>
          Same component, no extra wiring: <code>[formField]</code> feeds invalid, touched and
          required.
        </p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Назва команди" hint="Видно всім учасникам" error="Мінімум 3 символи">
          <input vdInput [formField]="team.name" />
        </vd-field>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="textarea">
      <div class="demo-section__head">
        <p class="vd-eyebrow">textarea[vdInput]</p>
        <h2 id="textarea">Textarea</h2>
        <p>Grows with content where <code>field-sizing</code> is supported.</p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Опис проєкту" hint="Markdown підтримується">
          <textarea vdInput placeholder="Коротко: що це і для кого?"></textarea>
        </vd-field>
        <vd-field label="Коментар рецензента" error="Коментар не може бути порожнім">
          <textarea vdInput invalid></textarea>
        </vd-field>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-field
            label="Електронна адреса для отримання щомісячних звітів про використання ресурсів"
            hint="Ми надсилатимемо звіт першого числа кожного місяця, і ви зможете відписатися будь-коли."
          >
            <input
              vdInput
              type="email"
              value="finance.department.long.address@example-company.com.ua"
            />
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="البريد الإلكتروني" hint="لن نشارك بريدك مع أحد" error="البريد غير صالح">
            <vd-input-group>
              <vd-icon name="mail" slot="start" />
              <input vdInput type="email" placeholder="name@example.com" />
              <vd-icon name="arrow-right" slot="end" />
            </vd-input-group>
          </vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-inline {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-2);
      max-inline-size: 28rem;
    }
    .demo-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-login {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 24rem;
    }
    .demo-mono {
      font-family: var(--vd-font-mono);
      font-size: var(--vd-text-sm);
    }
  `,
})
export default class InputPage {
  protected readonly sizes: VdInputSize[] = ['sm', 'md', 'lg'];
  protected readonly query = signal('дизайн-система');
  protected readonly reveal = signal(false);
  protected readonly signingIn = signal(false);
  protected readonly result = signal('');

  protected readonly login = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  private readonly teamModel = signal({ name: 'UI' });
  protected readonly team = form(this.teamModel, (p) => {
    required(p.name);
    minLength(p.name, 3);
  });

  protected submit(): void {
    this.login.markAllAsTouched();
    if (this.login.invalid) {
      this.result.set('Перевірте поля з помилками');
      return;
    }
    this.signingIn.set(true);
    this.result.set('');
    setTimeout(() => {
      this.signingIn.set(false);
      this.result.set('Вхід виконано');
    }, 1200);
  }
}
