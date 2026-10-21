import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdColorPicker } from './color-picker';

@Component({
  imports: [VdColorPicker, VdField, ReactiveFormsModule, FormField],
  template: `<vd-field label="Workspace" hint="Choose color" error="Required"
      ><vd-color-picker
        [formControl]="color"
        [readonly]="readonly()"
        [swatches]="swatches" /></vd-field
    ><vd-color-picker aria-label="Category" [formField]="categoryForm.color" />`,
})
class Host {
  readonly color = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly readonly = signal(false);
  readonly swatches = [
    { value: '#abc', label: 'First' },
    { value: '#AABBCC', label: 'Duplicate' },
    { value: 'url(x)', label: 'Unsafe' },
  ];
  readonly category = signal({ color: '#123456' });
  readonly categoryForm = form(this.category);
}

describe('Color picker integration', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('.vd-color-picker__trigger')!;
    return { fixture, root, trigger, host: fixture.componentInstance };
  }
  it('registers one Field control, normalizes and deduplicates palette data', async () => {
    const { root, trigger } = await setup();
    expect(root.querySelector('label')!.htmlFor).toBe(trigger.id);
    expect(trigger.getAttribute('aria-describedby')).toBe(
      root.querySelector('.vd-field__hint')!.id,
    );
    expect(root.querySelectorAll('[role=radio]')).toHaveLength(1);
    expect(root.querySelector('[role=radio]')!.getAttribute('aria-label')).toBe('First');
  });
  it('reads Reactive Forms values, required touch state, disabled and reset', async () => {
    const { fixture, root, trigger, host } = await setup();
    host.color.markAsTouched();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    host.color.setValue('#abc');
    await fixture.whenStable();
    expect(trigger.textContent).toContain('#AABBCC');
    expect(host.color.value).toBe('#abc');
    host.color.disable();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
    host.color.enable();
    host.color.reset();
    await fixture.whenStable();
    expect(trigger.textContent).toContain('Choose color');
    expect(root.querySelector('.vd-field__error')).toBeNull();
  });
  it('rejects unsafe external preview data and keeps readonly focusable', async () => {
    const { fixture, trigger, host } = await setup();
    host.color.setValue('url(https://example.com)');
    host.readonly.set(true);
    await fixture.whenStable();
    expect(trigger.textContent).toContain('Choose color');
    expect(
      trigger
        .querySelector<HTMLElement>('.vd-color-picker__preview')!
        .style.getPropertyValue('--vd-color-picker-value'),
    ).toBe('');
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
  });
  it('reads external Signal Forms replacement and forwards the accessible name', async () => {
    const { fixture, root, host } = await setup();
    const trigger = root.querySelectorAll('.vd-color-picker__trigger')[1];
    expect(trigger.getAttribute('aria-label')).toBe('Category');
    host.category.set({ color: '#FEDCBA' });
    await fixture.whenStable();
    expect(trigger.textContent).toContain('#FEDCBA');
  });
});
