import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VD_NUMBER_INPUT } from './number-input';

@Component({
  imports: [VD_NUMBER_INPUT, ReactiveFormsModule, VdField],
  template: `
    <vd-field label="Quantity"
      ><vd-number-input decreaseLabel="Less" increaseLabel="More">
        <input
          vdNumberInput
          type="number"
          min="0"
          [max]="max()"
          step="0.1"
          [formControl]="value"
        /> </vd-number-input
    ></vd-field>
  `,
})
class Host {
  readonly value = new FormControl<number | null>(0.2);
  readonly max = signal(0.3);
}

describe('Number input forms integration', () => {
  async function setup(value = 0.2) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.value.setValue(value);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;
    const buttons = root.querySelectorAll('button');
    return {
      fixture,
      host: fixture.componentInstance,
      input,
      minus: buttons[0],
      plus: buttons[1],
      root,
    };
  }
  it('uses the numeric native accessor, emits one pair of events and preserves untouched state', async () => {
    const { fixture, host, input, plus } = await setup();
    const onInput = vi.fn();
    const onChange = vi.fn();
    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);
    plus.click();
    await fixture.whenStable();
    expect(host.value.value).toBe(0.3);
    expect(host.value.dirty).toBe(true);
    expect(host.value.touched).toBe(false);
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(plus.getAttribute('aria-disabled')).toBe('true');
    plus.click();
    expect(onInput).toHaveBeenCalledTimes(1);
    input.dispatchEvent(new Event('blur'));
    expect(host.value.touched).toBe(true);
  });
  it('updates availability after programmatic values, constraints, reset and disable', async () => {
    const { fixture, host, input, minus, plus } = await setup();
    host.value.setValue(0.3);
    await fixture.whenStable();
    expect(plus.getAttribute('aria-disabled')).toBe('true');
    host.max.set(1);
    await fixture.whenStable();
    expect(plus.hasAttribute('aria-disabled')).toBe(false);
    host.value.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(host.value.value).toBeNull();
    host.value.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(minus.disabled).toBe(true);
    expect(plus.disabled).toBe(true);
    plus.click();
    expect(host.value.value).toBeNull();
  });
  it('registers with Field and forwards inherited Input size and label semantics', async () => {
    const { root, input, plus } = await setup(0.3);
    expect(plus.getAttribute('aria-disabled')).toBe('true');
    expect(input.classList.contains('vd-input')).toBe(true);
    expect(input.getAttribute('data-size')).toBe('md');
    expect(root.querySelector('label')?.htmlFor).toBe(input.id);
    expect(plus.getAttribute('aria-controls')).toBe(input.id);
    expect(plus.getAttribute('aria-label')).toBe('More');
    expect(plus.type).toBe('button');
    expect(input.hasAttribute('role')).toBe(false);
  });
});
