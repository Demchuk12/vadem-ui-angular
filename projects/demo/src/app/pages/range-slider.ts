import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { VdRangeSlider, VdRangeValue } from '@vadem/ui/range-slider';
import { VdField } from '@vadem/ui/field';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'demo-range-slider',
  imports: [VdRangeSlider, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-range-stack {
      display: grid;
      gap: var(--vd-space-5);
      min-inline-size: 0;
    }
    .demo-range-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-range-stack .demo-panel {
      min-inline-size: 0;
      padding-inline: min(var(--vd-space-6), 5%);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Range slider</p>
      <h1>Range slider</h1>
      <p>Two bounds on one scale. Drag either handle or adjust it with the keyboard.</p>
    </header>
    <section class="demo-section" aria-labelledby="range-price-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Reactive Forms</p>
        <h2 id="range-price-title">Set a comfortable budget</h2>
        <p>The lower limit never passes the upper. Arrow keys use one step; Page keys use ten.</p>
      </div>
      <div class="demo-panel demo-range-stack">
        <vd-field hint="Від 0 до 10 000 ₴ · крок 100 ₴" error="Вкажіть бюджет">
          <vd-range-slider
            data-testid="price-range"
            label="Бюджет за ніч"
            lowerLabel="Від"
            upperLabel="До"
            [maxValue]="10000"
            [step]="100"
            [valueText]="money"
            [formControl]="budget"
            required
          />
        </vd-field>
        <p class="demo-token" data-testid="budget-value">
          {{ budget.value ? budget.value[0] + '–' + budget.value[1] : 'Бюджет не задано' }}
        </p>
        <div class="demo-range-actions">
          <button vdButton variant="secondary" (click)="budget.reset()">Скинути бюджет</button>
          <button
            vdButton
            variant="ghost"
            (click)="budget.disabled ? budget.enable() : budget.disable()"
          >
            Перемкнути доступність
          </button>
          <button vdButton variant="ghost" (click)="budget.markAsTouched()">
            Перевірити бюджет
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="range-state-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Bounds and states</p>
        <h2 id="range-state-title">A precise interval</h2>
      </div>
      <div class="demo-grid demo-range-stack" style="--demo-min: 20rem">
        <div class="demo-panel">
          <vd-field hint="Крок 0,1 · можна вибрати однакові межі">
            <vd-range-slider
              data-testid="decimal-range"
              label="Тривалість консультації, год"
              lowerLabel="Мінімум"
              upperLabel="Максимум"
              [minValue]="0.1"
              [maxValue]="2.1"
              [step]="0.1"
              [value]="[0.5, 1.5]"
            />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field hint="Редагування вимкнено, значення можна переглянути">
            <vd-range-slider
              label="Погоджений діапазон"
              lowerLabel="Від"
              upperLabel="До"
              [value]="[20, 80]"
              readonly
            />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-range-slider label="Тимчасово недоступно" lowerLabel="Від" upperLabel="До" disabled />
        </div>
        <div class="demo-panel">
          <vd-field error="Перевірте встановлені межі">
            <vd-range-slider
              label="Діапазон із помилкою"
              lowerLabel="Від"
              upperLabel="До"
              invalid
            />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field hint="Обидві межі збігаються; Tab перемикає ручки">
            <vd-range-slider
              data-testid="equal-range"
              label="Однакові значення"
              lowerLabel="Від"
              upperLabel="До"
              [value]="[50, 50]"
            />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-range-slider
            label="Фіксований інтервал"
            lowerLabel="Від"
            upperLabel="До"
            [minValue]="5"
            [maxValue]="5"
            [value]="[5, 5]"
          />
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="range-signal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms · long content · RTL</p>
        <h2 id="range-signal-title">Labels follow your language</h2>
      </div>
      <div class="demo-grid demo-range-stack" style="--demo-min: 20rem">
        <div class="demo-panel">
          <vd-field hint="Значення зберігається у Signal Forms">
            <vd-range-slider
              data-testid="signal-range"
              label="Рекомендована кількість учасників навчальної програми з розробки інтерфейсів"
              lowerLabel="Мінімальна кількість"
              upperLabel="Максимальна кількість"
              [formField]="participantsForm.range"
            />
          </vd-field>
          <p class="demo-token" data-testid="signal-value">
            {{ participants().range?.[0] }}–{{ participants().range?.[1] }}
          </p>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field hint="استخدم الأسهم لتغيير الحدود">
            <vd-range-slider
              data-testid="rtl-range"
              label="نطاق السعر"
              lowerLabel="الحد الأدنى"
              upperLabel="الحد الأعلى"
              [value]="[20, 80]"
            />
          </vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class RangeSliderPage {
  protected readonly budget = new FormControl<VdRangeValue | null>(
    [2000, 7000],
    Validators.required,
  );
  protected readonly money = (value: number) =>
    new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      maximumFractionDigits: 0,
    }).format(value);
  protected readonly participants = signal({ range: [10, 30] as VdRangeValue | null });
  protected readonly participantsForm = form(this.participants);
}
