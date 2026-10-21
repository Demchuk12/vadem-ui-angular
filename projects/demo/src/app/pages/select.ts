import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdCombobox, VdOption, VdSelect } from '@vadem/ui/select';

@Component({
  selector: 'demo-select',
  imports: [ReactiveFormsModule, VdButton, VdField, VdIcon, VdCombobox, VdOption, VdSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Select · Combobox</p>
      <h1>Select</h1>
      <p>
        APG combobox patterns on the Popover API: focus stays on the field, the list is anchored
        under it and flips up when there's no room. No CDK.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="select">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-select · reactive forms</p>
        <h2 id="select">Select</h2>
        <p>Arrows, Home/End, typeahead (try «л» twice), Enter, Escape.</p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Місто" hint="Відображається у профілі" error="Оберіть місто">
          <vd-select [formControl]="city" placeholder="Оберіть місто">
            @for (c of cities; track c.value) {
              <vd-option [value]="c.value" [disabled]="c.disabled ?? false">{{
                c.label
              }}</vd-option>
            }
          </vd-select>
        </vd-field>
        <vd-field label="Роль">
          <vd-select [(value)]="role">
            <vd-option value="owner"><vd-icon name="check-circle" />Власник</vd-option>
            <vd-option value="admin"><vd-icon name="info" />Адміністратор</vd-option>
            <vd-option value="member">Учасник</vd-option>
            <vd-option value="viewer">Спостерігач</vd-option>
          </vd-select>
        </vd-field>
        <vd-field label="Недоступний">
          <vd-select value="a" disabled>
            <vd-option value="a">Заблоковано політикою</vd-option>
          </vd-select>
        </vd-field>
      </div>
      <div class="demo-actions">
        <button vdButton size="sm" (click)="city.markAsTouched()">Перевірити</button>
        <span class="demo-token">city: {{ cityValue() }} · role: {{ role() }}</span>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size</p>
        <h2 id="sizes">Sizes</h2>
      </div>
      <div class="demo-panel demo-stack">
        @for (s of sizes; track s) {
          <div class="demo-inline">
            <vd-select [size]="s" value="week" [aria-label]="'Період ' + s">
              <vd-option value="day">День</vd-option>
              <vd-option value="week">Тиждень</vd-option>
              <vd-option value="month">Місяць</vd-option>
            </vd-select>
            <button vdButton [size]="s">Застосувати</button>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="combobox">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-combobox · list autocomplete</p>
        <h2 id="combobox">Combobox</h2>
        <p>Type to filter: case- and accent-insensitive, every word must match («кам под»).</p>
      </div>
      <div class="demo-panel demo-form-grid">
        <vd-field label="Населений пункт" hint="Почніть вводити назву">
          <vd-combobox [(value)]="town" placeholder="Пошук міста" emptyText="Нічого не знайдено">
            @for (t of towns; track t) {
              <vd-option [value]="t">{{ t }}</vd-option>
            }
          </vd-combobox>
        </vd-field>
        <p class="demo-token">town: {{ town() }}</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-field label="Тарифний план для робочого простору з кількома командами">
            <vd-select value="team" placeholder="Оберіть план">
              <vd-option value="free">Безкоштовний — до 3 учасників і 1 проєкту</vd-option>
              <vd-option value="team"
                >Команда — необмежені проєкти, пріоритетна підтримка та аналітика</vd-option
              >
              <vd-option value="enterprise">Корпоративний</vd-option>
            </vd-select>
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="المدينة">
            <vd-select placeholder="اختر مدينة">
              <vd-option value="1">القاهرة</vd-option>
              <vd-option value="2">دبي</vd-option>
              <vd-option value="3">الرياض</vd-option>
            </vd-select>
          </vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-actions {
      display: flex;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-inline {
      display: flex;
      gap: var(--vd-space-2);
      max-inline-size: 26rem;
    }
  `,
})
export default class SelectPage {
  protected readonly cities = [
    { value: 'kyiv', label: 'Київ' },
    { value: 'kharkiv', label: 'Харків' },
    { value: 'lviv', label: 'Львів' },
    { value: 'lutsk', label: 'Луцьк' },
    { value: 'odesa', label: 'Одеса' },
    { value: 'dnipro', label: 'Дніпро', disabled: true },
    { value: 'zaporizhzhia', label: 'Запоріжжя' },
    { value: 'vinnytsia', label: 'Вінниця' },
    { value: 'ivano', label: 'Івано-Франківськ' },
    { value: 'uzhhorod', label: 'Ужгород' },
    { value: 'chernivtsi', label: 'Чернівці' },
    { value: 'poltava', label: 'Полтава' },
  ];
  protected readonly towns = [
    'Біла Церква',
    'Бровари',
    'Житомир',
    'Кам’янець-Подільський',
    'Кременчук',
    'Кропивницький',
    'Мукачево',
    'Ніжин',
    'Рівне',
    'Суми',
    'Тернопіль',
    'Умань',
    'Хмельницький',
    'Черкаси',
    'Чернігів',
    'Ізмаїл',
    'Ірпінь',
    'Їжакевичі',
  ];
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly city = new FormControl<string | null>(null, Validators.required);
  protected readonly cityValue = signal<string | null>(null);
  protected readonly role = signal<string | null>('member');
  protected readonly town = signal<string | null>(null);

  constructor() {
    this.city.valueChanges.subscribe((v) => this.cityValue.set(v));
  }
}
