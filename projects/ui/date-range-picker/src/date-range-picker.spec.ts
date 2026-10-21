import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdDateRangePicker } from './date-range-picker';
import { VdDateRange } from './core/range';
@Component({
  imports: [VdDateRangePicker, VdField, ReactiveFormsModule, FormField],
  template: `<vd-field label="Period" hint="Inclusive dates" error="Required"
      ><vd-date-range-picker
        locale="uk"
        [formControl]="period"
        [readonly]="readonly()"
        minDate="2026-10-01"
        maxDate="2026-12-31" /></vd-field
    ><vd-date-range-picker locale="uk" [formField]="signalForm.period" />`,
})
class Host {
  readonly period = new FormControl<VdDateRange | null>(null, {
    validators: [Validators.required],
  });
  readonly readonly = signal(false);
  readonly data = signal<{ period: VdDateRange | null }>({ period: null });
  readonly signalForm = form(this.data);
}
describe('Date range forms', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const fields = Array.from(
      root.querySelectorAll<HTMLInputElement>('.vd-date-range-picker__fields input'),
    );
    return { fixture, root, fields, host: fixture.componentInstance };
  }
  const edit = (field: HTMLInputElement, text: string) => {
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const commit = (field: HTMLInputElement) =>
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  it('registers only the start field and shares descriptions with both fields', async () => {
    const { root, fields } = await setup();
    expect(root.querySelector('label')!.htmlFor).toBe(fields[0].id);
    expect(fields[0].getAttribute('aria-describedby')).toBe(
      root.querySelector('.vd-field__hint')!.id,
    );
    expect(fields[1].getAttribute('aria-describedby')).toBe(
      fields[0].getAttribute('aria-describedby'),
    );
  });
  it('commits localized typing and clears stale model on edit; rejects invalid order and bounds', async () => {
    const { fixture, fields, host } = await setup();
    edit(fields[0], '8.10.26');
    edit(fields[1], '14.10.26');
    commit(fields[1]);
    await fixture.whenStable();
    expect(host.period.value).toEqual({ start: '2026-10-08', end: '2026-10-14' });
    expect(host.period.dirty).toBe(true);
    edit(fields[1], '7.10.26');
    commit(fields[1]);
    await fixture.whenStable();
    expect(host.period.value).toBeNull();
    expect(fields[1].getAttribute('aria-invalid')).toBe('true');
    expect(fields[0].value).toBe('08.10.2026');
    edit(fields[1], '1.1.27');
    commit(fields[1]);
    await fixture.whenStable();
    expect(host.period.value).toBeNull();
    expect(host.period.errors?.['dateRange']).toBeTruthy();
    host.period.reset();
    await fixture.whenStable();
    expect(fields[0].value).toBe('');
    expect(fields[1].value).toBe('');
    expect(fields[1].hasAttribute('aria-invalid')).toBe(false);
  });
  it('reads form reset/disable and preserves readonly inspection', async () => {
    const { fixture, fields, host, root } = await setup();
    host.period.setValue({ start: '2026-10-08', end: '2026-10-14' });
    host.readonly.set(true);
    await fixture.whenStable();
    edit(fields[0], '9.10.26');
    commit(fields[0]);
    await fixture.whenStable();
    expect(host.period.value?.start).toBe('2026-10-08');
    expect(fields[0].readOnly).toBe(true);
    host.period.disable();
    await fixture.whenStable();
    expect(fields.slice(0, 2).every((f) => f.disabled)).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('.vd-date-range-picker__trigger')!.disabled).toBe(
      true,
    );
    host.period.enable();
    host.readonly.set(false);
    host.period.reset();
    await fixture.whenStable();
    expect(fields[0].value).toBe('');
    expect(fields[1].value).toBe('');
  });
  it('supports Signal Forms writes and safe malformed external values', async () => {
    const { fixture, fields, host } = await setup();
    edit(fields[2], '10.10.26');
    edit(fields[3], '12.10.26');
    commit(fields[3]);
    await fixture.whenStable();
    expect(host.data().period).toEqual({ start: '2026-10-10', end: '2026-10-12' });
    host.data.set({ period: { start: '2026-02-30', end: '2026-03-01' } });
    await fixture.whenStable();
    expect(fields[2].value).toBe('');
    expect(fields[3].value).toBe('');
  });
});
