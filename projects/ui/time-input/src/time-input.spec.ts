import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdTimeInput } from './time-input';

@Component({
  imports: [VdTimeInput, VdField, ReactiveFormsModule],
  template: `<vd-field label="Meeting" hint="Quarter-hours" error="Check the time">
    <input
      vdTimeInput
      type="time"
      [formControl]="time"
      [min]="min()"
      max="18:00"
      step="900"
      [readonly]="readonly()"
    />
  </vd-field>`,
})
class Host {
  readonly min = signal('09:00');
  readonly readonly = signal(false);
  readonly time = new FormControl('09:30', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^(?:(?:09|1[0-7]):(?:00|15|30|45)|18:00)$/),
    ],
  });
}

describe('Time input', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, root, input: root.querySelector('input')! };
  }
  it('keeps native time semantics and Field labelling', async () => {
    const { root, input } = await setup();
    expect(input.type).toBe('time');
    expect(input.value).toBe('09:30');
    expect(input.min).toBe('09:00');
    expect(input.max).toBe('18:00');
    expect(input.step).toBe('900');
    expect(input.classList.contains('vd-input')).toBe(true);
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')!.id);
    expect(input.hasAttribute('role')).toBe(false);
  });
  it('preserves string values, dynamic native constraints and form reset', async () => {
    const { fixture, host, input } = await setup();
    input.value = '10:15';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(host.time.value).toBe('10:15');
    expect(host.time.dirty).toBe(true);
    host.min.set('11:00');
    await fixture.whenStable();
    expect(input.min).toBe('11:00');
    expect(input.value).toBe('10:15');
    host.time.reset();
    await fixture.whenStable();
    expect(input.value).toBe('09:30');
    expect(host.time.pristine).toBe(true);
  });
  it('shows touched model errors and switches Field descriptions after correction', async () => {
    const { fixture, host, input, root } = await setup();
    host.time.setValue('08:00');
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    host.time.markAsTouched();
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__error')!.id);
    host.time.setValue('18:00');
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });
  it('preserves native readonly and form-controlled disabled state', async () => {
    const { fixture, host, input } = await setup();
    host.readonly.set(true);
    host.time.disable();
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('09:30');
    host.time.enable();
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
  });
});
