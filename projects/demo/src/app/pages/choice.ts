import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VdChoice, VdField } from '@vadem/ui/field';
import { VdSwitch } from '@vadem/ui/switch';

interface Channel {
  id: string;
  label: string;
  on: boolean;
}

@Component({
  selector: 'demo-choice',
  imports: [ReactiveFormsModule, VdButton, VdCheckbox, VdChoice, VdField, VdSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Checkbox · Switch</p>
      <h1>Checkbox & Switch</h1>
      <p>
        Native checkboxes with a drawn mark, and the same element as <code>role="switch"</code>. The
        whole label is the hit area.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="cb-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">input[type=checkbox][vdCheckbox]</p>
        <h2 id="cb-states">Checkbox states</h2>
        <p>Hover, focus and press are live.</p>
      </div>
      <div class="demo-panel demo-choices">
        <label vdChoice><input type="checkbox" vdCheckbox />Не вибрано</label>
        <label vdChoice><input type="checkbox" vdCheckbox checked />Вибрано</label>
        <label vdChoice><input type="checkbox" vdCheckbox [indeterminate]="true" />Частково</label>
        <label vdChoice><input type="checkbox" vdCheckbox disabled />Недоступно</label>
        <label vdChoice
          ><input type="checkbox" vdCheckbox disabled checked />Недоступно, вибрано</label
        >
        <label vdChoice><input type="checkbox" vdCheckbox invalid />З помилкою</label>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="group">
      <div class="demo-section__head">
        <p class="vd-eyebrow">indeterminate</p>
        <h2 id="group">Select all</h2>
        <p>The parent shows a mixed state when only some channels are on.</p>
      </div>
      <fieldset class="demo-panel demo-fieldset">
        <legend class="vd-eyebrow">Канали сповіщень</legend>
        <label vdChoice>
          <input
            type="checkbox"
            vdCheckbox
            [checked]="allOn()"
            [indeterminate]="someOn()"
            (change)="toggleAll($any($event.target).checked)"
          />
          <strong>Усі канали</strong>
        </label>
        <div class="demo-children">
          @for (c of channels(); track c.id) {
            <label vdChoice>
              <input type="checkbox" vdCheckbox [checked]="c.on" (change)="toggle(c.id)" />
              {{ c.label }}
            </label>
          }
        </div>
      </fieldset>
    </section>

    <section class="demo-section" aria-labelledby="sw-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">input[type=checkbox][vdSwitch] · role="switch"</p>
        <h2 id="sw-states">Switch states</h2>
      </div>
      <div class="demo-panel demo-choices">
        <label vdChoice><input type="checkbox" vdSwitch />Вимкнено</label>
        <label vdChoice><input type="checkbox" vdSwitch checked />Увімкнено</label>
        <label vdChoice><input type="checkbox" vdSwitch disabled />Недоступно</label>
        <label vdChoice
          ><input type="checkbox" vdSwitch disabled checked />Недоступно, увімкнено</label
        >
      </div>
    </section>

    <section class="demo-section" aria-labelledby="settings">
      <div class="demo-section__head">
        <p class="vd-eyebrow">composition</p>
        <h2 id="settings">Settings</h2>
        <p>Switches apply immediately. Descriptions are wired with <code>vd-field</code> hints.</p>
      </div>
      <div class="demo-panel demo-settings">
        @for (s of settings; track s.title) {
          <vd-field [hint]="s.hint">
            <label vdChoice class="demo-setting">
              <span class="demo-setting__title">{{ s.title }}</span>
              <input type="checkbox" vdSwitch [checked]="s.on" />
            </label>
          </vd-field>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="form">
      <div class="demo-section__head">
        <p class="vd-eyebrow">reactive forms · requiredTrue</p>
        <h2 id="form">Consent in a form</h2>
      </div>
      <form class="demo-panel demo-consent" (submit)="$event.preventDefault(); submit()" novalidate>
        <vd-field error="Щоб продовжити, прийміть умови використання">
          <label vdChoice>
            <input type="checkbox" vdCheckbox [formControl]="terms" />
            Я приймаю умови використання та політику конфіденційності
          </label>
        </vd-field>
        <label vdChoice>
          <input type="checkbox" vdCheckbox [formControl]="news" />
          Надсилати новини продукту (не частіше ніж раз на місяць)
        </label>
        <div><button vdButton variant="primary" type="submit">Створити акаунт</button></div>
        <p class="demo-token" aria-live="polite">{{ result() }}</p>
      </form>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel demo-choices demo-choices--column">
          <label vdChoice>
            <input type="checkbox" vdCheckbox checked />
            Автоматично архівувати проєкти, у яких не було активності понад дев'яносто днів, і
            сповіщати власників за тиждень до архівації
          </label>
          <label vdChoice><input type="checkbox" vdSwitch />Двофакторна автентифікація</label>
        </div>
        <div class="demo-panel demo-choices demo-choices--column" dir="rtl" lang="ar">
          <label vdChoice><input type="checkbox" vdCheckbox checked />تذكرني</label>
          <label vdChoice><input type="checkbox" vdSwitch checked />الوضع الداكن</label>
          <label vdChoice><input type="checkbox" vdSwitch />الإشعارات</label>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-choices {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-4) var(--vd-space-8);
    }
    .demo-choices--column {
      flex-direction: column;
      align-items: flex-start;
    }
    .demo-fieldset {
      display: grid;
      gap: var(--vd-space-3);
      margin: 0;
      min-inline-size: 0;
    }
    .demo-fieldset legend {
      float: inline-start;
      inline-size: 100%;
      margin-block-end: var(--vd-space-3);
    }
    .demo-children {
      display: grid;
      gap: var(--vd-space-3);
      padding-inline-start: var(--vd-space-6);
    }
    .demo-settings {
      display: grid;
      padding-block: var(--vd-space-2);
      max-inline-size: 40rem;
    }
    .demo-settings > vd-field {
      padding-block: var(--vd-space-4);
    }
    .demo-settings > vd-field + vd-field {
      border-block-start: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-setting {
      display: flex;
      justify-content: space-between;
      inline-size: 100%;
      gap: var(--vd-space-6);
    }
    .demo-setting__title {
      font-weight: var(--vd-weight-semibold);
    }
    .demo-consent {
      display: grid;
      gap: var(--vd-space-4);
      max-inline-size: 32rem;
    }
  `,
})
export default class ChoicePage {
  protected readonly channels = signal<Channel[]>([
    { id: 'email', label: 'Email', on: true },
    { id: 'push', label: 'Push-сповіщення', on: false },
    { id: 'telegram', label: 'Telegram', on: true },
  ]);
  protected readonly allOn = computed(() => this.channels().every((c) => c.on));
  protected readonly someOn = computed(() => !this.allOn() && this.channels().some((c) => c.on));

  protected readonly settings = [
    { title: 'Автозбереження', hint: 'Зміни зберігаються кожні 30 секунд.', on: true },
    { title: 'Компактний режим', hint: 'Менші відступи в таблицях і списках.', on: false },
    {
      title: 'Публічний профіль',
      hint: 'Ваше імʼя та аватар бачитимуть усі учасники робочого простору.',
      on: false,
    },
  ];

  protected readonly terms = new FormControl(false, {
    nonNullable: true,
    validators: Validators.requiredTrue,
  });
  protected readonly news = new FormControl(false, { nonNullable: true });
  protected readonly result = signal('');

  protected toggle(id: string): void {
    this.channels.update((list) => list.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
  }

  protected toggleAll(on: boolean): void {
    this.channels.update((list) => list.map((c) => ({ ...c, on })));
  }

  protected submit(): void {
    this.terms.markAsTouched();
    this.result.set(this.terms.valid ? 'Акаунт створено' : 'Потрібна згода з умовами');
  }
}
