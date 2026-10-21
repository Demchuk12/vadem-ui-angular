import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdMultiSelect, VdOption } from '@vadem/ui/select';

@Component({
  selector: 'demo-multi-select',
  imports: [ReactiveFormsModule, FormField, VdButton, VdField, VdMultiSelect, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Selection</p>
      <h1>Multi-select</h1>
      <p>Оберіть кілька значень. Знайдіть потрібне пошуком і видаліть зайве одним натисканням.</p>
    </header>

    <section class="demo-section" aria-labelledby="multi-primary">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Reactive forms</p>
        <h2 id="multi-primary">Міста доставки</h2>
        <p>Стрілки переміщують фокус, Enter змінює вибір, Escape закриває список.</p>
      </div>
      <div class="demo-multi-layout">
        <vd-field
          label="Міста"
          hint="Додайте міста, у яких працює ваша команда"
          error="Оберіть хоча б одне місто"
        >
          <vd-multi-select
            [formControl]="cities"
            placeholder="Знайти місто"
            emptyText="Міст не знайдено"
            [removeLabel]="removeLabel"
            [selectionLabel]="selectionLabel"
          >
            @for (city of options; track city.value) {
              <vd-option
                [value]="city.value"
                [label]="city.label"
                [disabled]="city.disabled ?? false"
                >{{ city.label }}</vd-option
              >
            }
          </vd-multi-select>
        </vd-field>
        <div class="demo-multi-actions">
          <button vdButton size="sm" (click)="cities.markAsTouched()">Перевірити</button>
          <button vdButton size="sm" variant="ghost" (click)="cities.reset()">Скинути</button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="multi-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">States</p>
        <h2 id="multi-states">Вибір і валідація</h2>
      </div>
      <div class="demo-multi-grid">
        <vd-field label="Порожній вибір" hint="Можна вибрати кілька напрямів">
          <vd-multi-select
            placeholder="Знайти напрям"
            emptyText="Нічого не знайдено"
            [removeLabel]="removeLabel"
            [selectionLabel]="selectionLabel"
          >
            <vd-option value="design">Дизайн</vd-option>
            <vd-option value="engineering">Розробка</vd-option>
            <vd-option value="research" disabled>Дослідження — недоступно</vd-option>
          </vd-multi-select>
        </vd-field>
        <vd-field label="Обов’язкові напрями" error="Додайте напрям роботи">
          <vd-multi-select
            invalid
            required
            placeholder="Оберіть напрями"
            [removeLabel]="removeLabel"
            [selectionLabel]="selectionLabel"
          >
            <vd-option value="support">Підтримка</vd-option>
          </vd-multi-select>
        </vd-field>
        <vd-field label="Недоступний вибір" hint="Керується адміністратором">
          <vd-multi-select
            disabled
            [value]="['security', 'billing']"
            placeholder="Додати доступ"
            [removeLabel]="removeLabel"
            [selectionLabel]="selectionLabel"
          >
            <vd-option value="security">Безпека</vd-option>
            <vd-option value="billing">Оплата</vd-option>
          </vd-multi-select>
        </vd-field>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="multi-sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">sm / md / lg</p>
        <h2 id="multi-sizes">Розміри</h2>
      </div>
      <div class="demo-multi-grid">
        @for (size of sizes; track size) {
          <vd-field [label]="'Команда ' + size">
            <vd-multi-select
              [size]="size"
              [value]="['design']"
              placeholder="Додати команду"
              [removeLabel]="removeLabel"
              [selectionLabel]="selectionLabel"
            >
              <vd-option value="design">Дизайн</vd-option>
              <vd-option value="engineering">Розробка</vd-option>
              <vd-option value="support">Підтримка</vd-option>
            </vd-multi-select>
          </vd-field>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="multi-content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Content / model binding</p>
        <h2 id="multi-content">Довгі назви та RTL</h2>
      </div>
      <div class="demo-multi-grid">
        <vd-field label="Робочі напрями">
          <vd-multi-select
            [(value)]="departments"
            placeholder="Додати напрям"
            emptyText="Напрямів не знайдено"
            [removeLabel]="removeLabel"
            [selectionLabel]="selectionLabel"
          >
            <vd-option value="long" [label]="longLabel">{{ longLabel }}</vd-option>
            <vd-option value="qa">QA</vd-option>
            <vd-option value="support">Підтримка клієнтів</vd-option>
          </vd-multi-select>
        </vd-field>
        <div dir="rtl" lang="ar">
          <vd-field label="الفرق">
            <vd-multi-select
              [(value)]="rtlTeams"
              placeholder="إضافة فريق"
              emptyText="لا توجد نتائج"
              [removeLabel]="rtlRemoveLabel"
              [selectionLabel]="rtlSelectionLabel"
            >
              <vd-option value="design">التصميم</vd-option>
              <vd-option value="engineering">الهندسة</vd-option>
              <vd-option value="support">الدعم</vd-option>
            </vd-multi-select>
          </vd-field>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="multi-signal">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal forms</p>
        <h2 id="multi-signal">Сповіщення команди</h2>
      </div>
      <vd-field label="Канали" hint="Оберіть канали для робочих сповіщень" error="Оберіть канал">
        <vd-multi-select
          [formField]="notificationForm.channels"
          placeholder="Знайти канал"
          [removeLabel]="removeLabel"
          [selectionLabel]="selectionLabel"
        >
          <vd-option value="email">Email</vd-option>
          <vd-option value="app">У застосунку</vd-option>
        </vd-multi-select>
      </vd-field>
    </section>
  `,
  styles: `
    .demo-multi-layout {
      display: grid;
      gap: var(--vd-space-4);
      max-inline-size: 42rem;
    }
    .demo-multi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-multi-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-2);
    }
  `,
})
export default class MultiSelectPage {
  protected readonly options = [
    { value: 'kyiv', label: 'Київ' },
    { value: 'lviv', label: 'Львів' },
    { value: 'lutsk', label: 'Луцьк' },
    { value: 'dnipro', label: 'Дніпро — тимчасово недоступно', disabled: true },
    { value: 'kamianets', label: 'Кам’янець-Подільський' },
    { value: 'odesa', label: 'Одеса' },
    { value: 'kharkiv', label: 'Харків' },
  ];
  protected readonly cities = new FormControl<string[]>(['kyiv', 'lviv'], Validators.required);
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly longLabel =
    'Дослідження користувацького досвіду та розвиток міжнародних продуктів';
  protected readonly departments = signal(['long', 'qa']);
  protected readonly rtlTeams = signal(['design', 'engineering']);
  protected readonly notificationModel = signal({ channels: ['email'] });
  protected readonly notificationForm = form(this.notificationModel, (path) => {
    required(path.channels);
    minLength(path.channels, 1);
  });
  protected readonly removeLabel = (label: string) => `Видалити ${label}`;
  protected readonly selectionLabel = (count: number) => `Вибрано: ${count}`;
  protected readonly rtlRemoveLabel = (label: string) => `إزالة ${label}`;
  protected readonly rtlSelectionLabel = (count: number) => `المحدد: ${count}`;
}
