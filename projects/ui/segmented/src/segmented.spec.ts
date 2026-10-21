import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdSegment, VdSegmented } from '@vadem/ui/segmented';

@Component({
  imports: [ReactiveFormsModule, VdSegmented, VdSegment],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-segmented class="model" aria-label="Період" [(value)]="period">
      <vd-segment value="day">День</vd-segment>
      <vd-segment value="week">Тиждень</vd-segment>
      <vd-segment value="year" disabled>Рік</vd-segment>
    </vd-segmented>
    <vd-segmented class="form" aria-label="Вигляд" [formControl]="view">
      <vd-segment value="list" aria-label="Список">L</vd-segment>
      <vd-segment value="grid" aria-label="Сітка">G</vd-segment>
    </vd-segmented>
  `,
})
class Host {
  readonly period = signal<string | null>('week');
  readonly view = new FormControl('list');
}

describe('VdSegmented', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const radios = (group: string) =>
      Array.from(root.querySelectorAll<HTMLInputElement>(`.${group} input[type=radio]`));
    return { fixture, host: fixture.componentInstance, root, radios };
  }

  it('renders a radiogroup of native radios sharing one name', () => {
    const { root, radios } = setup();
    const group = root.querySelector('.model')!;
    expect(group.getAttribute('role')).toBe('radiogroup');
    const [day, week, year] = radios('model');
    expect(new Set([day.name, week.name, year.name]).size).toBe(1);
    expect(radios('form')[0].name).not.toBe(day.name);
    expect(week.checked).toBe(true);
    expect(week.closest('.vd-segment')!.hasAttribute('data-checked')).toBe(true);
    expect(year.disabled).toBe(true);
  });

  it('updates the model when a radio is chosen', () => {
    const { fixture, host, radios } = setup();
    radios('model')[0].click();
    fixture.detectChanges();
    expect(host.period()).toBe('day');
    expect(radios('model')[0].closest('.vd-segment')!.hasAttribute('data-checked')).toBe(true);
  });

  it('works as a form control, including disabled state', () => {
    const { fixture, host, root, radios } = setup();
    radios('form')[1].click();
    fixture.detectChanges();
    expect(host.view.value).toBe('grid');
    host.view.setValue('list');
    fixture.detectChanges();
    expect(radios('form')[0].checked).toBe(true);
    host.view.disable();
    fixture.detectChanges();
    expect(radios('form').every((r) => r.disabled)).toBe(true);
    expect(root.querySelector('.form')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('moves aria-label from the segment host to its radio', () => {
    const { root, radios } = setup();
    const grid = radios('form')[1];
    expect(grid.getAttribute('aria-label')).toBe('Сітка');
    expect(grid.closest('vd-segment')!.hasAttribute('aria-label')).toBe(false);
    expect(grid.hasAttribute('aria-labelledby')).toBe(false);
    const day = radios('model')[0];
    expect(root.querySelector('#' + day.getAttribute('aria-labelledby'))!.textContent).toBe('День');
    expect(root.querySelector('.model')!.getAttribute('aria-label')).toBe('Період');
  });
});
