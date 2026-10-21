import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VdChoice, VdFieldset } from '@vadem/ui/field';
import { VdRadio } from '@vadem/ui/radio';

@Component({
  selector: 'demo-radio',
  imports: [ReactiveFormsModule, VdButton, VdCheckbox, VdChoice, VdFieldset, VdRadio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Radio · Fieldset</p>
      <h1>Radio & Fieldset</h1>
      <p>
        Native radios in a <code>fieldset</code>: the legend names the group, arrows move the
        choice, and the hint and error are announced once for the whole group.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">input[type=radio][vdRadio]</p>
        <h2 id="states">States</h2>
      </div>
      <div class="demo-panel demo-row">
        <label vdChoice><input type="radio" vdRadio name="s" />Не вибрано</label>
        <label vdChoice><input type="radio" vdRadio name="s2" checked />Вибрано</label>
        <label vdChoice><input type="radio" vdRadio name="s3" disabled />Недоступно</label>
        <label vdChoice
          ><input type="radio" vdRadio name="s4" disabled checked />Недоступно, вибрано</label
        >
        <label vdChoice><input type="radio" vdRadio name="s5" invalid />З помилкою</label>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="form">
      <div class="demo-section__head">
        <p class="vd-eyebrow">fieldset[vdFieldset] · reactive forms · required</p>
        <h2 id="form">In a form</h2>
        <p>Press “Продовжити” without choosing: the group error appears under the legend.</p>
      </div>
      <form class="demo-panel demo-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <fieldset
          vdFieldset
          legend="Тарифний план"
          hint="Змінити план можна будь-коли в налаштуваннях"
          error="Оберіть план, щоб продовжити"
        >
          @for (p of plans; track p.value) {
            <label vdChoice class="demo-option">
              <input type="radio" vdRadio name="plan" [value]="p.value" [formControl]="plan" />
              <span>
                <strong>{{ p.label }}</strong>
                <span class="demo-muted">{{ p.note }}</span>
              </span>
            </label>
          }
        </fieldset>
        <div><button vdButton variant="primary" type="submit">Продовжити</button></div>
        <p class="demo-token" aria-live="polite">{{ result() }}</p>
      </form>
    </section>

    <section class="demo-section" aria-labelledby="horizontal">
      <div class="demo-section__head">
        <p class="vd-eyebrow">orientation="horizontal" · checkbox groups</p>
        <h2 id="horizontal">Horizontal, checkboxes</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <fieldset vdFieldset legend="Розмір команди" orientation="horizontal">
            <label vdChoice><input type="radio" vdRadio name="team" value="1" checked />1–5</label>
            <label vdChoice><input type="radio" vdRadio name="team" value="2" />6–20</label>
            <label vdChoice><input type="radio" vdRadio name="team" value="3" />21–100</label>
            <label vdChoice><input type="radio" vdRadio name="team" value="4" />100+</label>
          </fieldset>
        </div>
        <div class="demo-panel">
          <fieldset vdFieldset legend="Канали сповіщень" hint="Оберіть один або кілька">
            <label vdChoice><input type="checkbox" vdCheckbox checked />Email</label>
            <label vdChoice><input type="checkbox" vdCheckbox />Push у браузері</label>
            <label vdChoice><input type="checkbox" vdCheckbox disabled />SMS (план Business)</label>
          </fieldset>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL, disabled group</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <fieldset vdFieldset legend="Що робити з проєктами, які не оновлювались понад 90 днів">
            <label vdChoice
              ><input type="radio" vdRadio name="old" checked />Архівувати й сповіщати власників за
              тиждень до архівації</label
            >
            <label vdChoice><input type="radio" vdRadio name="old" />Нічого не робити</label>
          </fieldset>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <fieldset vdFieldset legend="الخطة">
            <label vdChoice><input type="radio" vdRadio name="ar" checked />مجاني</label>
            <label vdChoice><input type="radio" vdRadio name="ar" />فريق</label>
          </fieldset>
        </div>
        <div class="demo-panel">
          <fieldset vdFieldset legend="Регіон (заблоковано адміністратором)" disabled>
            <label vdChoice><input type="radio" vdRadio name="reg" checked />Європа</label>
            <label vdChoice><input type="radio" vdRadio name="reg" />США</label>
          </fieldset>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-4) var(--vd-space-8);
    }
    .demo-form {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 32rem;
    }
    .demo-option > span {
      display: grid;
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
    }
  `,
})
export default class RadioPage {
  protected readonly plans = [
    { value: 'free', label: 'Free', note: 'До 3 учасників і 1 проєкту' },
    { value: 'team', label: 'Team', note: 'Необмежені проєкти, ₴ 1 200 на місяць' },
    { value: 'business', label: 'Business', note: 'SSO, аудит, SLA 99,99%' },
  ];
  protected readonly plan = new FormControl<string | null>(null, Validators.required);
  protected readonly result = signal('');

  protected submit(): void {
    this.plan.markAsTouched();
    this.result.set(this.plan.valid ? `Обрано: ${this.plan.value}` : 'Оберіть план');
  }
}
