import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, pattern, required } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdTimeInput } from '@vadem/ui/time-input';

// This demo's business rule matches min=09:00, max=18:00 and step=900 (quarter-hours).
const MEETING_TIMES = /^(?:(?:09|1[0-7]):(?:00|15|30|45)|18:00)$/;

@Component({
  selector: 'demo-time-input',
  imports: [VdTimeInput, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-time-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-time-stack .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Time input</p>
      <h1>Time input</h1>
      <p>Choose a time from a styled list, or edit it directly in the field.</p>
    </header>
    <section class="demo-section" aria-labelledby="time-meeting-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Scheduling</p>
        <h2 id="time-meeting-title">Make time for the next conversation</h2>
        <p>Available times follow your schedule. Open the list with a click or Alt + ↓.</p>
      </div>
      <form class="demo-panel demo-time-stack" (submit)="confirm($event)">
        <vd-field
          label="Час зустрічі"
          hint="Від 09:00 до 18:00, з кроком 15 хвилин"
          error="Оберіть час від 09:00 до 18:00 з кроком 15 хвилин"
        >
          <input
            vdTimeInput
            hoursLabel="Год"
            minutesLabel="Хв"
            pickerLabel="Оберіть час"
            emptyLabel="Немає доступного часу"
            type="time"
            [formControl]="meeting"
            min="09:00"
            max="18:00"
            step="900"
            name="meeting-time"
            required
            (input)="submitted.set(false)"
          />
        </vd-field>
        <div class="demo-row">
          <button vdButton type="submit">Зберегти час</button>
          <button
            vdButton
            variant="secondary"
            type="button"
            (click)="meeting.disabled ? meeting.enable() : meeting.disable()"
          >
            Перемкнути доступність
          </button>
          <button
            vdButton
            variant="ghost"
            type="button"
            (click)="meeting.reset(); submitted.set(false)"
          >
            Скинути час
          </button>
        </div>
        <p class="demo-token" role="status" data-testid="time-status">
          {{ submitted() ? 'Демонстраційний час збережено' : 'Оберіть час і збережіть зміни' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="time-states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="time-states-title">Clear boundaries for every schedule</h2>
      </div>
      <div class="demo-grid demo-time-stack" style="--demo-min: 20rem">
        <div class="demo-panel">
          <vd-field label="Початок дня" hint="Компактне поле"
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              size="sm"
              value="08:30"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Час нагадування" hint="Велике поле"
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              size="lg"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Час тільки для перегляду" hint="Редагування вимкнено"
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              readonly
              value="14:45"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Недоступний час" hint="Поле тимчасово заблоковане"
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              disabled
              value="10:30"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Перевірте час" error="Цей час уже зайнятий. Оберіть інший."
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              invalid
              value="11:00"
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Нічна зміна" hint="Від 22:00 до 06:00 наступного дня"
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              min="22:00"
              max="06:00"
              value="23:30"
          /></vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="time-signal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="time-signal-title">Keep schedule rules with the form</h2>
      </div>
      <div class="demo-panel demo-time-stack">
        <vd-field
          label="Час консультації"
          hint="Від 09:00 до 18:00, з кроком 15 хвилин"
          error="Оберіть доступний час з кроком 15 хвилин"
        >
          <input
            vdTimeInput
            hoursLabel="Год"
            minutesLabel="Хв"
            pickerLabel="Оберіть час"
            emptyLabel="Немає доступного часу"
            type="time"
            [formField]="consultationForm.time"
            min="09:00"
            max="18:00"
            step="900"
          />
        </vd-field>
        <button
          vdButton
          variant="secondary"
          type="button"
          (click)="consultation.set({ time: '14:30' })"
        >
          Установити 14:30
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="time-content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="time-content-title">Readable labels in either direction</h2>
      </div>
      <div class="demo-grid demo-time-stack" style="--demo-min: 22rem">
        <div class="demo-panel">
          <vd-field
            label="Час початку спільного перегляду документів української команди"
            hint="Час місцевий: оберіть зручну годину для всіх учасників. І, ї, є, ґ."
            ><input
              vdTimeInput
              hoursLabel="Год"
              minutesLabel="Хв"
              pickerLabel="Оберіть час"
              emptyLabel="Немає доступного часу"
              type="time"
              value="09:15"
          /></vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="وقت الاجتماع" hint="اختر وقتًا مناسبًا للفريق"
            ><input
              vdTimeInput
              hoursLabel="الساعات"
              minutesLabel="الدقائق"
              pickerLabel="اختر الوقت"
              emptyLabel="لا توجد أوقات متاحة"
              type="time"
              value="14:30"
          /></vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class TimeInputPage {
  readonly meeting = new FormControl('09:30', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(MEETING_TIMES)],
  });
  readonly submitted = signal(false);
  readonly consultation = signal({ time: '' });
  readonly consultationForm = form(this.consultation, (path) => {
    required(path.time);
    pattern(path.time, MEETING_TIMES);
  });
  confirm(event: Event): void {
    event.preventDefault();
    this.meeting.markAsTouched();
    this.submitted.set(this.meeting.enabled && this.meeting.valid);
  }
}
