import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VD_PASSWORD_INPUT } from './password-input';

@Component({
  imports: [VD_PASSWORD_INPUT, VdField, ReactiveFormsModule],
  template: `<form (submit)="$event.preventDefault(); submitted = true">
    <vd-field label="Password" hint="Demo only" error="Check the password">
      <vd-password-input revealLabel="Reveal password">
        <input
          vdPasswordInput
          type="password"
          size="lg"
          [formControl]="value"
          [readonly]="readonly()"
          [invalid]="invalid()"
          autocomplete="current-password"
          name="password"
        />
      </vd-password-input>
    </vd-field>
  </form>`,
})
class Host {
  readonly value = new FormControl('Демо-іЇєҐ-2026', { nonNullable: true });
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  submitted = false;
}

describe('Password input', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      root,
      host: fixture.componentInstance,
      input: root.querySelector('input')!,
      button: root.querySelector('button')!,
    };
  }
  it('registers native input with Field and exposes a named non-submitting toggle', async () => {
    const { root, input, button } = await setup();
    expect(input.type).toBe('password');
    expect(input.classList.contains('vd-input')).toBe(true);
    expect(input.getAttribute('data-size')).toBe('lg');
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')!.id);
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-controls')).toBe(input.id);
    expect(button.getAttribute('aria-label')).toBe('Reveal password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
  it('preserves value, selection direction and keyboard button focus without value events', async () => {
    const { fixture, host, input, button } = await setup();
    const onInput = vi.fn();
    const onChange = vi.fn();
    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);
    input.setSelectionRange(2, 7, 'backward');
    button.focus();
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([
      2,
      7,
      'backward',
    ]);
    expect(document.activeElement).toBe(button);
    expect(input.value).toBe(host.value.value);
    expect(host.value.dirty).toBe(false);
    expect(host.submitted).toBe(false);
    expect(onInput).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-label')).toBe('Reveal password');
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('password');
  });
  it('prevents primary pointer focus transfer only while editing', async () => {
    const { input, button } = await setup();
    input.focus();
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    button.focus();
    const other = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
    button.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
  });
  it('blocks disabled activation and masks a revealed field when disabled externally', async () => {
    const { fixture, host, input, button } = await setup();
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    host.value.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    expect(input.type).toBe('password');
    host.value.enable();
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
  });
  it('allows readonly reveal and follows model writes/reset without a second value accessor', async () => {
    const { fixture, host, input, button } = await setup();
    host.readonly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(button.disabled).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
    host.value.setValue('replacement');
    await fixture.whenStable();
    expect(input.value).toBe('replacement');
    host.value.reset();
    await fixture.whenStable();
    expect(input.value).toBe('Демо-іЇєҐ-2026');
  });
  it('inherits Field error association on the input without exposing the value as status', async () => {
    const { fixture, host, root, input } = await setup();
    host.invalid.set(true);
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__error')!.id);
    expect(root.textContent).not.toContain(host.value.value);
  });
});
