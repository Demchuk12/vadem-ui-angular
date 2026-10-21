import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdCalendar, VdDatePicker, vdAddDays, vdToday } from '@vadem/ui/calendar';
import { VdField } from '@vadem/ui/field';

const today = vdToday();
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso + 'T00:00:00Z').getUTCDay());

@Component({
  selector: 'demo-calendar',
  imports: [ReactiveFormsModule, VdButton, VdCalendar, VdDatePicker, VdField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Calendar · Date picker</p>
      <h1>Date picker</h1>
      <p>
        Type a date in your locale's format or pick it from the calendar. Values are plain ISO
        dates, so they never shift by a day across time zones. Arrows, PageUp/PageDown and
        Shift+PageUp/PageDown move around the grid.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="picker">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-date-picker · reactive forms · min · dateDisabled</p>
        <h2 id="picker">In a form</h2>
        <p>
          Delivery: working days only, from tomorrow, at most 60 days ahead. Try typing “5.11.26”.
        </p>
      </div>
      <form class="demo-panel demo-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <vd-field
          label="Дата доставки"
          hint="Лише робочі дні, найпізніше за 60 днів"
          error="Оберіть доступну робочу дату"
        >
          <vd-date-picker
            locale="uk"
            [formControl]="delivery"
            [min]="tomorrow"
            [max]="limit"
            [dateDisabled]="weekend"
            openLabel="Відкрити календар"
            dialogLabel="Оберіть дату доставки"
            previousLabel="Попередній місяць"
            nextLabel="Наступний місяць"
          />
        </vd-field>
        <div><button vdButton variant="primary" type="submit">Підтвердити</button></div>
        <p class="demo-token" aria-live="polite">
          value: {{ delivery.value ?? 'null' }} {{ result() }}
        </p>
      </form>
    </section>

    <section class="demo-section" aria-labelledby="inline">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-calendar · inline · [(value)]</p>
        <h2 id="inline">Inline calendar</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-calendar
            locale="uk"
            [(value)]="meeting"
            previousLabel="Попередній місяць"
            nextLabel="Наступний місяць"
          />
          <p class="demo-token">value: {{ meeting() }}</p>
        </div>
        <div class="demo-panel">
          <vd-calendar locale="en-US" [(value)]="us" />
          <p class="demo-token">en-US · week starts Sunday · {{ us() }}</p>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">disabled · RTL</p>
        <h2 id="states">States, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-field label="Дата підписання" hint="Документ уже підписано">
            <vd-date-picker locale="uk" value="2026-09-14" disabled openLabel="Відкрити календар" />
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-calendar
            locale="ar-EG"
            [(value)]="ar"
            previousLabel="الشهر السابق"
            nextLabel="الشهر التالي"
          />
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-form {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 28rem;
    }
  `,
})
export default class CalendarPage {
  protected readonly tomorrow = vdAddDays(today, 1);
  protected readonly limit = vdAddDays(today, 60);
  protected readonly weekend = isWeekend;
  protected readonly delivery = new FormControl<string | null>(null, Validators.required);
  protected readonly meeting = signal<string | null>(today);
  protected readonly us = signal<string | null>(null);
  protected readonly ar = signal<string | null>(today);
  protected readonly result = signal('');

  protected submit(): void {
    this.delivery.markAsTouched();
    this.result.set(this.delivery.valid ? '· підтверджено' : '· помилка');
  }
}
