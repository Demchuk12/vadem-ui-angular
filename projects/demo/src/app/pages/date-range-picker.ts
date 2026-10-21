import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { VdDateRangePicker, VdDateRange } from '@vadem/ui/date-range-picker';
import { VdField } from '@vadem/ui/field';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'demo-date-range-picker',
  imports: [VdDateRangePicker, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-range-stack {
      display: grid;
      gap: var(--vd-space-4);
      min-inline-size: 0;
    }
    .demo-range-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-range-value {
      font-family: var(--vd-font-mono);
      overflow-wrap: anywhere;
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Date range picker</p>
      <h1>Date range picker</h1>
      <p>Two dates, one clear period. Type each boundary or choose them in the calendar.</p>
    </header>
    <section class="demo-section" aria-labelledby="range-main-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Reporting period</p>
        <h2 id="range-main-title">Focus your report on the right days</h2>
        <p>October through December 2026. Choose a start, then an end; both dates are included.</p>
      </div>
      <form class="demo-panel demo-range-stack" novalidate (submit)="save($event)">
        <vd-field
          label="Період звіту"
          hint="Від 01.10.2026 до 31.12.2026 включно"
          error="Укажіть коректний період звіту"
        >
          <vd-date-range-picker
            [formControl]="period"
            minDate="2026-10-01"
            maxDate="2026-12-31"
            locale="uk"
            groupLabel="Період звіту"
            startLabel="Початок"
            endLabel="Кінець"
            openLabel="Відкрити календар періоду"
            pickerLabel="Період звіту"
            previousLabel="Попередній місяць"
            nextLabel="Наступний місяць"
            startInstruction="Оберіть дату початку"
            endInstruction="Оберіть дату кінця"
            errorLabel="Укажіть дві доступні дати: кінець не раніше початку"
            (valueChange)="saved.set(false)"
          />
        </vd-field>
        <p class="demo-range-value" data-testid="range-value">{{ display(period.value) }}</p>
        <div class="demo-row demo-range-actions">
          <button vdButton type="submit">Зберегти період</button
          ><button
            vdButton
            type="button"
            variant="secondary"
            (click)="period.disabled ? period.enable() : period.disable()"
          >
            Перемкнути доступність</button
          ><button
            vdButton
            type="button"
            variant="ghost"
            (click)="period.reset(); saved.set(false)"
          >
            Скинути період
          </button>
        </div>
        <p role="status" data-testid="range-status">
          {{ saved() ? 'Демонстраційний період збережено' : 'Оберіть період і підтвердьте його' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="range-states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="range-states-title">One interval, every form state</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 25rem">
        @for (size of sizes; track size) {
          <div class="demo-panel">
            <vd-field [label]="'Розмір ' + size"
              ><vd-date-range-picker
                [size]="size"
                [value]="sample"
                locale="uk"
                startLabel="Початок"
                endLabel="Кінець"
            /></vd-field>
          </div>
        }
        <div class="demo-panel">
          <vd-field label="Опублікований період"
            ><vd-date-range-picker
              [value]="sample"
              readonly
              locale="uk"
              startLabel="Початок"
              endLabel="Кінець"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Недоступний період"
            ><vd-date-range-picker
              [value]="sample"
              disabled
              locale="uk"
              startLabel="Початок"
              endLabel="Кінець"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Період потрібен" error="Додайте період"
            ><vd-date-range-picker
              invalid
              required
              locale="uk"
              startLabel="Початок"
              endLabel="Кінець"
          /></vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="range-signal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="range-signal-title">Keep the range with your form</h2>
      </div>
      <div class="demo-panel demo-range-stack">
        <vd-field label="Період відпустки" error="Оберіть період відпустки"
          ><vd-date-range-picker
            [formField]="leaveForm.period"
            locale="uk"
            groupLabel="Відпустка"
            startLabel="З"
            endLabel="До"
            openLabel="Календар відпустки"
            pickerLabel="Відпустка"
            startInstruction="Оберіть перший день"
            endInstruction="Оберіть останній день"
            previousLabel="Попередній місяць"
            nextLabel="Наступний місяць"
        /></vd-field>
        <p class="demo-range-value" data-testid="range-signal-value">
          {{ display(leave().period) }}
        </p>
        <button vdButton type="button" variant="secondary" (click)="leave.set({ period: sample })">
          Установити приклад періоду
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="range-content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="range-content-title">A period everyone can read</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 25rem">
        <div class="demo-panel">
          <vd-field
            label="Період опрацювання українськомовних матеріалів для спільної роботи команди"
            hint="І, ї, є, ґ. Початкова й кінцева дати включені."
            ><vd-date-range-picker
              locale="uk"
              startLabel="Перший день опрацювання матеріалів"
              endLabel="Останній день роботи над матеріалами"
          /></vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="فترة التقرير"
            ><vd-date-range-picker
              [value]="sample"
              locale="ar-EG"
              groupLabel="فترة التقرير"
              startLabel="البداية"
              endLabel="النهاية"
              openLabel="افتح تقويم الفترة"
              pickerLabel="اختر الفترة"
              startInstruction="اختر تاريخ البداية"
              endInstruction="اختر تاريخ النهاية"
              previousLabel="الشهر السابق"
              nextLabel="الشهر التالي"
              errorLabel="أدخل فترة صالحة"
          /></vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class DateRangePickerPage {
  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly sample: VdDateRange = { start: '2026-10-08', end: '2026-10-14' };
  readonly period = new FormControl<VdDateRange | null>(null, {
    validators: [Validators.required],
  });
  readonly saved = signal(false);
  readonly leave = signal<{ period: VdDateRange | null }>({ period: null });
  readonly leaveForm = form(this.leave, (p) => required(p.period));
  display(range: VdDateRange | null): string {
    return range ? `${range.start} → ${range.end}` : 'Період ще не обрано';
  }
  save(event: Event): void {
    event.preventDefault();
    this.period.markAsTouched();
    this.saved.set(this.period.enabled && this.period.valid);
  }
}
