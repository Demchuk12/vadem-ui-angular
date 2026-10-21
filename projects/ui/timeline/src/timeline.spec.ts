import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_TIMELINE, VdTimelineStatus } from './timeline';

@Component({
  imports: [VD_TIMELINE],
  template: `
    <ol vdTimeline label="Історія проєкту">
      @for (event of events(); track event.id) {
        <li vdTimelineItem [status]="event.status" [statusLabel]="event.label">
          <time vdTimelineTime [attr.datetime]="event.datetime">8 жовтня, 09:24</time>
          <h2 vdTimelineTitle>{{ event.id }}</h2>
          <p vdTimelineDescription>Опис події</p>
          <button type="button" (click)="clicks = clicks + 1">Деталі</button>
        </li>
      }
    </ol>
  `,
})
class Host {
  readonly events = signal<
    { id: string; status: VdTimelineStatus; label: string | undefined; datetime: string }[]
  >([
    { id: 'a', status: 'neutral', label: 'Створено', datetime: '2026-10-08T09:00:00+03:00' },
    { id: 'b', status: 'success', label: 'Опубліковано', datetime: '2026-10-08T09:24:00+03:00' },
  ]);
  clicks = 0;
}

describe('Timeline', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, host: fixture.componentInstance };
  }

  it('preserves named native list, heading, time and action semantics', () => {
    const { root, host } = setup();
    const list = root.querySelector('ol')!;
    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-label')).toBe('Історія проєкту');
    expect([...list.children].map((el) => el.tagName)).toEqual(['LI', 'LI']);
    expect(root.querySelector('h2')?.textContent).toBe('a');
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-08T09:00:00+03:00');
    expect(root.querySelector('[tabindex]')).toBeNull();
    expect(root.querySelector('[aria-live]')).toBeNull();
    root.querySelector('button')!.click();
    expect(host.clicks).toBe(1);
  });

  it('updates visible status text and decorative icon together without changing event order', () => {
    const { fixture, root, host } = setup();
    host.events.update((events) => [
      { ...events[0], status: 'warning', label: 'Потрібна перевірка' },
      events[1],
    ]);
    fixture.detectChanges();
    const first = root.querySelector('li')!;
    expect(first.getAttribute('data-status')).toBe('warning');
    expect(first.querySelector('.vd-timeline-item__status')?.textContent).toBe(
      'Потрібна перевірка',
    );
    expect(first.querySelector('.vd-timeline-item__marker')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(first.querySelector('vd-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect([...root.querySelectorAll('h2')].map((el) => el.textContent)).toEqual(['a', 'b']);
  });

  it('keeps a non-color status fallback and reflects removal, reordering and empty history', () => {
    const { fixture, root, host } = setup();
    host.events.update((events) => [{ ...events[1], status: 'danger', label: '  ' }, events[0]]);
    fixture.detectChanges();
    expect(root.querySelector('.vd-timeline-item__status')?.textContent).toBe('Error');
    expect(root.querySelector('h2')?.textContent).toBe('b');
    host.events.update((events) => [events[1]]);
    fixture.detectChanges();
    expect(root.querySelectorAll('li')).toHaveLength(1);
    host.events.set([]);
    fixture.detectChanges();
    expect(root.querySelectorAll('li')).toHaveLength(0);
  });
});
