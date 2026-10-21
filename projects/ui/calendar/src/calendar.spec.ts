import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdCalendar, VdDatePicker } from '@vadem/ui/calendar';
import { VdField } from '@vadem/ui/field';
import { installFakePopover } from '../../test-utils/fake-popover';

installFakePopover();

@Component({
  imports: [VdCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-calendar
      locale="uk"
      min="2026-10-01"
      max="2026-11-15"
      [(value)]="date"
      [dateDisabled]="noSundays"
    />
  `,
})
class CalendarHost {
  readonly date = signal<string | null>('2026-10-02');
  readonly noSundays = (iso: string) => new Date(iso + 'T00:00:00Z').getUTCDay() === 0;
}

@Component({
  imports: [ReactiveFormsModule, VdDatePicker, VdField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Дата" error="Вкажіть дату">
      <vd-date-picker locale="uk" [formControl]="date" />
    </vd-field>
  `,
})
class PickerHost {
  readonly date = new FormControl<string | null>('2026-10-02');
}

const key = (el: Element, k: string, shift = false) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true }));

describe('VdCalendar', () => {
  async function setup() {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.append(root);
    const cell = (iso: string) => root.querySelector<HTMLElement>(`[data-date="${iso}"]`)!;
    const focusable = () => root.querySelector<HTMLElement>('td[tabindex="0"]')!;
    return { fixture, host: fixture.componentInstance, root, cell, focusable };
  }

  it('renders a Monday-first Ukrainian month with the value selected and focusable', async () => {
    const { root, cell, focusable } = await setup();
    expect(root.querySelector('.vd-calendar__title')!.textContent).toMatch(/жовт/i);
    expect(root.querySelector('th')!.textContent!.trim()).toMatch(/^пн/i);
    expect(cell('2026-10-02').getAttribute('aria-selected')).toBe('true');
    expect(focusable().dataset['date']).toBe('2026-10-02');
    expect(cell('2026-10-02').getAttribute('aria-label')).toMatch(/2 жовтня 2026/);
    // Before min, and Sundays, are unavailable.
    expect(cell('2026-09-30').getAttribute('aria-disabled')).toBe('true');
    expect(cell('2026-10-04').getAttribute('aria-disabled')).toBe('true');
    root.remove();
  });

  it('moves focus with the keyboard and chooses with Enter; disabled days are not chosen', async () => {
    const { fixture, host, root, focusable } = await setup();
    const grid = root.querySelector('table')!;
    key(grid, 'ArrowDown');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(focusable().dataset['date']).toBe('2026-10-09');
    expect(document.activeElement).toBe(focusable());
    key(grid, 'PageDown');
    fixture.detectChanges();
    expect(root.querySelector('.vd-calendar__title')!.textContent).toMatch(/листоп/i);
    key(grid, 'Enter');
    fixture.detectChanges();
    expect(host.date()).toBe('2026-11-09');
    // Sunday 2026-11-15 (max) can be focused but not chosen.
    key(grid, 'End');
    fixture.detectChanges();
    key(grid, ' ');
    fixture.detectChanges();
    expect(host.date()).toBe('2026-11-09');
    // Max clamps further moves.
    key(grid, 'PageDown');
    fixture.detectChanges();
    expect(focusable().dataset['date']).toBe('2026-11-15');
    root.remove();
  });

  it('uses the actual focused day for activation and navigation without selecting on focus', async () => {
    const { fixture, host, root, cell, focusable } = await setup();
    cell('2026-10-08').focus();
    fixture.detectChanges();
    expect(host.date()).toBe('2026-10-02');
    expect(focusable()).toBe(cell('2026-10-08'));
    key(cell('2026-10-08'), 'Enter');
    fixture.detectChanges();
    expect(host.date()).toBe('2026-10-08');
    cell('2026-10-04').focus();
    key(cell('2026-10-04'), ' ');
    fixture.detectChanges();
    expect(host.date()).toBe('2026-10-08');
    key(cell('2026-10-04'), 'ArrowRight');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(cell('2026-10-05'));
    root.remove();
  });

  it('keeps adjacent-month focus stable until navigation changes the visible grid', async () => {
    const { fixture, host, root, cell, focusable } = await setup();
    cell('2026-11-01').focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('.vd-calendar__title')!.textContent).toMatch(/жовт/i);
    expect(focusable()).toBe(cell('2026-11-01'));
    expect(document.activeElement).toBe(focusable());
    expect(host.date()).toBe('2026-10-02');
    key(cell('2026-11-01'), 'ArrowRight');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('.vd-calendar__title')!.textContent).toMatch(/листоп/i);
    expect(document.activeElement).toBe(cell('2026-11-02'));
    root.remove();
  });
});

describe('VdCalendar initial focus', () => {
  it('starts on the nearest available date when the default one is unavailable', async () => {
    @Component({
      imports: [VdCalendar],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `<vd-calendar locale="uk" value="2026-10-04" [dateDisabled]="weekend" />`,
    })
    class WeekendHost {
      // 2026-10-04 is a Sunday: Monday 10-05 is one day ahead, Friday 10-02 two days back.
      readonly weekend = (iso: string) => [0, 6].includes(new Date(iso + 'T00:00:00Z').getUTCDay());
    }
    const fixture = TestBed.createComponent(WeekendHost);
    fixture.detectChanges();
    const focusable = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'td[tabindex="0"]',
    )!;
    expect(focusable.dataset['date']).toBe('2026-10-05');
  });
});

describe('VdDatePicker', () => {
  async function setup() {
    const fixture = TestBed.createComponent(PickerHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.append(root);
    const input = root.querySelector<HTMLInputElement>('input')!;
    return { fixture, host: fixture.componentInstance, root, input };
  }

  it('shows the value in the locale format and is labelled by vd-field', async () => {
    const { root, input } = await setup();
    expect(input.value).toBe('02.10.2026');
    expect(root.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(input.placeholder).toMatch(/^31\.12\.\d{4}$/);
    root.remove();
  });

  it('parses typed dates on blur, normalizes them and flags invalid text', async () => {
    const { fixture, host, root, input } = await setup();
    input.value = '5.11.26';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.date.value).toBe('2026-11-05');
    expect(input.value).toBe('05.11.2026');

    input.value = '31.02.2026';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.date.value).toBe('2026-11-05');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.vd-field__error')).not.toBeNull();
    root.remove();
  });

  it('opens the calendar from the button and picks a date', async () => {
    const { fixture, host, root, input } = await setup();
    const button = root.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
    button.click();
    fixture.detectChanges();
    const panel = root.querySelector<HTMLElement>('[popover]')!;
    expect(panel.matches(':popover-open')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    root.querySelector<HTMLElement>('[data-date="2026-10-20"]')!.click();
    fixture.detectChanges();
    expect(host.date.value).toBe('2026-10-20');
    expect(panel.matches(':popover-open')).toBe(false);
    expect(input.value).toBe('20.10.2026');
    expect(document.activeElement).toBe(input);
    root.remove();
  });
});
