import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VdSchedule,
  VdScheduleEvent,
  VdScheduleEventChange,
  VdScheduleSlot,
  VdScheduleView,
  vdScheduleApplyChange,
} from '@vadem/ui/schedule';

const EVENTS: VdScheduleEvent[] = [
  {
    id: 'e1',
    title: 'Дзвінок: Нова Логістика',
    start: '2026-10-21T09:30',
    end: '2026-10-21T10:00',
    color: 'accent',
  },
  {
    id: 'e2',
    title: 'Демо CRM для Фінтех Плюс',
    start: '2026-10-21T10:00',
    end: '2026-10-21T11:30',
    color: 'success',
  },
  {
    id: 'e3',
    title: 'Узгодження договору',
    start: '2026-10-21T10:30',
    end: '2026-10-21T12:00',
    color: 'warning',
  },
  {
    id: 'e4',
    title: 'Обід з командою',
    start: '2026-10-21T13:00',
    end: '2026-10-21T14:00',
    color: 'neutral',
  },
  {
    id: 'e5',
    title: 'Підготовка комерційної пропозиції для Державного підприємства «Укрзалізниця Сервіс»',
    start: '2026-10-22T14:00',
    end: '2026-10-22T16:30',
    color: 'info',
  },
  {
    id: 'e6',
    title: 'Виставка «Агро Захід»',
    start: '2026-10-20',
    end: '2026-10-22',
    allDay: true,
    color: 'info',
  },
  {
    id: 'e7',
    title: 'Нічний реліз',
    start: '2026-10-23T22:00',
    end: '2026-10-24T01:00',
    color: 'danger',
  },
  { id: 'e8', title: 'Ретро', start: '2026-10-24T11:00', end: '2026-10-24T12:00' },
  {
    id: 'e9',
    title: 'Відпустка Олени',
    start: '2026-10-27',
    end: '2026-10-30',
    allDay: true,
    color: 'neutral',
  },
  {
    id: 'e10',
    title: 'Зустріч з інвестором',
    start: '2026-10-21T16:00',
    end: '2026-10-21T17:00',
    color: 'accent',
  },
  {
    id: 'e11',
    title: 'Онбординг клієнта',
    start: '2026-10-21T17:30',
    end: '2026-10-21T18:15',
    color: 'success',
  },
  { id: 'e12', title: 'Планування спринту', start: '2026-10-05T10:00', end: '2026-10-05T11:00' },
  {
    id: 'e13',
    title: 'Квартальний звіт',
    start: '2026-10-14',
    end: '2026-10-14',
    allDay: true,
    color: 'warning',
  },
];

const RTL_EVENTS: VdScheduleEvent[] = [
  { id: 'r1', title: 'اجتماع مع العميل', start: '2026-10-21T10:00', end: '2026-10-21T11:00' },
  {
    id: 'r2',
    title: 'مراجعة العقد',
    start: '2026-10-22',
    end: '2026-10-22',
    allDay: true,
    color: 'success',
  },
];

@Component({
  selector: 'demo-schedule',
  imports: [VdSchedule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Schedule</p>
      <h1>Schedule</h1>
      <p>
        Month, week, day and agenda views of events your application owns. Click an event to open
        it, click empty space to create one, drag to move and drag the bottom edge to resize: the
        schedule emits requests and your code applies them with <code>vdScheduleApplyChange</code>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="activities">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-schedule · [(view)] · [(date)] · eventChange</p>
        <h2 id="activities">CRM activities</h2>
        <p>
          Overlapping meetings, multi-day all-day events, an event across midnight, long Ukrainian
          titles and the current-time line.
        </p>
      </div>
      <vd-schedule
        locale="uk"
        label="Активності"
        now="2026-10-21T13:20"
        [events]="events()"
        [(view)]="view"
        [(date)]="date"
        (eventActivate)="last.set('Відкрито: ' + $event.title)"
        (slotActivate)="create($event)"
        (eventChange)="change($event)"
      />
      <p class="demo-token" data-testid="schedule-last">{{ last() }}</p>
    </section>

    <section class="demo-section" aria-labelledby="readonly">
      <div class="demo-section__head">
        <p class="vd-eyebrow">editable="false" · agenda · English locale</p>
        <h2 id="readonly">Read-only agenda</h2>
      </div>
      <vd-schedule
        locale="en-GB"
        view="agenda"
        date="2026-10-20"
        [agendaDays]="7"
        [editable]="false"
        [events]="events()"
      />
    </section>

    <section class="demo-section" aria-labelledby="rtl">
      <div class="demo-section__head">
        <p class="vd-eyebrow">dir="rtl"</p>
        <h2 id="rtl">Right to left</h2>
      </div>
      <div dir="rtl" lang="ar">
        <vd-schedule locale="ar" view="week" date="2026-10-21" [events]="rtlEvents" />
      </div>
    </section>
  `,
})
export default class SchedulePage {
  protected readonly events = signal<readonly VdScheduleEvent[]>(EVENTS);
  protected readonly rtlEvents = RTL_EVENTS;
  protected readonly view = signal<VdScheduleView>('week');
  protected readonly date = signal('2026-10-21');
  protected readonly last = signal('Ще нічого не сталося');
  private serial = 0;

  protected change(change: VdScheduleEventChange): void {
    this.events.set(vdScheduleApplyChange(this.events(), change));
    this.last.set(`${change.kind}: ${change.id} → ${change.start} – ${change.end}`);
  }

  protected create(slot: VdScheduleSlot): void {
    const id = `new-${++this.serial}`;
    const event: VdScheduleEvent = slot.time
      ? {
          id,
          title: 'Нова подія',
          start: `${slot.date}T${slot.time}`,
          end: `${slot.date}T${this.plus30(slot.time)}`,
        }
      : { id, title: 'Нова подія', start: slot.date, end: slot.date, allDay: true };
    this.events.set([...this.events(), event]);
    this.last.set(`Створено: ${event.start}`);
  }

  private plus30(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const total = Math.min(h * 60 + m + 30, 23 * 60 + 59);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
