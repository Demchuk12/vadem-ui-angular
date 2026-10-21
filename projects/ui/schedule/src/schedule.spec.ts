import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdSchedule, VdScheduleEvent, VdScheduleSlot, VdScheduleView } from '@vadem/ui/schedule';

@Component({
  imports: [VdSchedule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-schedule
      locale="en-GB"
      date="2026-10-21"
      [events]="events()"
      [(view)]="view"
      (eventActivate)="opened.push($event.id)"
      (slotActivate)="slots.push($event)"
    />
  `,
})
class Host {
  readonly view = signal<VdScheduleView>('month');
  readonly events = signal<readonly VdScheduleEvent[]>([
    { id: 'a', title: 'Call', start: '2026-10-21T09:00', end: '2026-10-21T09:30' },
    { id: 'b', title: 'Fair', start: '2026-10-20', end: '2026-10-22', allDay: true },
  ]);
  readonly opened: string[] = [];
  readonly slots: VdScheduleSlot[] = [];
}

describe('VdSchedule', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('renders a 6-week month with Monday first for en-GB and labelled days', () => {
    const { root } = setup();
    expect(root.querySelectorAll('.vd-schedule__cell')).toHaveLength(42);
    expect(root.querySelector('th abbr')?.getAttribute('title')).toBe('Monday');
    const day = root.querySelector('[data-date="2026-10-21"] .vd-schedule__day')!;
    expect(day.getAttribute('aria-label')).toContain('2 events');
    expect(root.querySelectorAll('[data-date="2026-10-22"] .vd-schedule__event')).toHaveLength(1);
  });

  it('emits activation for events and empty month cells', () => {
    const { fixture, root } = setup();
    root.querySelector<HTMLButtonElement>('[data-date="2026-10-21"] .vd-schedule__event')!.click();
    expect(fixture.componentInstance.opened).toEqual(['b']);
    root.querySelector<HTMLElement>('[data-date="2026-10-23"]')!.click();
    expect(fixture.componentInstance.slots).toEqual([{ date: '2026-10-23', time: null }]);
  });

  it('lays out timed events in the week grid and all-day events in their row', () => {
    const { fixture, root } = setup();
    fixture.componentInstance.view.set('week');
    fixture.detectChanges();
    const block = root.querySelector<HTMLElement>('.vd-schedule__block')!;
    expect(block.style.getPropertyValue('--vd-schedule-top')).toBe('540');
    expect(block.style.getPropertyValue('--vd-schedule-span')).toBe('30');
    expect(root.querySelectorAll('.vd-schedule__allday-cell .vd-schedule__event')).toHaveLength(3);
  });

  it('shows the invalid state for malformed events', () => {
    const { fixture, root } = setup();
    fixture.componentInstance.events.set([{ id: 'x', title: 'x', start: 'soon', end: 'later' }]);
    fixture.detectChanges();
    expect(root.querySelector('vd-schedule')?.getAttribute('data-state')).toBe('invalid');
  });
});
