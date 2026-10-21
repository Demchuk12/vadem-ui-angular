import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdOtpInput } from './otp-input';

@Component({
  imports: [VdOtpInput, VdField, ReactiveFormsModule],
  template: `<vd-field label="Code" hint="Six digits" error="Check the code">
    <input
      vdOtpInput
      [length]="length()"
      [formControl]="code"
      [readonly]="readonly()"
      [invalid]="invalid()"
    />
  </vd-field>`,
})
class Host {
  readonly length = signal(6);
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  readonly code = new FormControl('001234', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)],
  });
}

describe('OTP input', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.componentInstance,
      root: fixture.nativeElement as HTMLElement,
      input: fixture.nativeElement.querySelector('input') as HTMLInputElement,
    };
  }
  it('exposes a single labelled native text input with OTP platform hints', async () => {
    const { root, input } = await setup();
    expect(root.querySelectorAll('input')).toHaveLength(1);
    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('numeric');
    expect(input.autocomplete).toBe('one-time-code');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.dir).toBe('ltr');
    expect(input.classList.contains('vd-input')).toBe(true);
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')!.id);
  });
  it('normalizes configured lengths without modifying the model', async () => {
    const { fixture, host, input } = await setup();
    for (const [length, normalized] of [
      [4.9, 4],
      [0, 1],
      [99, 12],
      [NaN, 6],
      [Infinity, 6],
    ]) {
      host.length.set(length);
      await fixture.whenStable();
      expect(input.maxLength).toBe(normalized);
      expect(input.pattern).toBe(`[0-9]{${normalized}}`);
      expect(input.style.getPropertyValue('--vd-otp-input-length')).toBe(String(normalized));
      expect(host.code.value).toBe('001234');
      expect(input.value).toBe('001234');
    }
  });
  it('preserves leading zeros and native reactive forms value/reset state', async () => {
    const { fixture, host, input } = await setup();
    input.value = '000042';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(host.code.value).toBe('000042');
    expect(host.code.dirty).toBe(true);
    host.code.reset();
    await fixture.whenStable();
    expect(input.value).toBe('001234');
    expect(host.code.pristine).toBe(true);
  });
  it('does not sanitize programmatic values; native validity detects nondigits and wrong length', async () => {
    const { fixture, host, input } = await setup();
    for (const value of ['abcdef', '12 345', '123', '1234567', '١٢٣٤٥٦']) {
      host.code.setValue(value);
      await fixture.whenStable();
      expect(input.value).toBe(value);
      expect(input.validity.patternMismatch).toBe(true);
      expect(host.code.invalid).toBe(true);
    }
  });
  it('shows touched form errors and returns to the hint after a valid value', async () => {
    const { fixture, host, root, input } = await setup();
    host.code.setValue('12');
    await fixture.whenStable();
    expect(input.hasAttribute('data-invalid')).toBe(false);
    host.code.markAsTouched();
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__error')!.id);
    host.code.setValue('001234');
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(root.querySelector('.vd-field__error')).toBeNull();
  });
  it('uses native disabled and readonly states without changing the value', async () => {
    const { fixture, host, input } = await setup();
    host.readonly.set(true);
    host.code.disable();
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('001234');
    host.code.enable();
    await fixture.whenStable();
    expect(input.disabled).toBe(false);
    host.invalid.set(true);
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
