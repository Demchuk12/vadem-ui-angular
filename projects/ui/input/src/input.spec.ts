import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdInput, VdInputGroup } from '@vadem/ui/input';

@Component({
  imports: [VdField, VdInput, VdInputGroup, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Email" hint="Без спаму" error="Вкажіть email">
      <input vdInput type="email" [formControl]="email" />
    </vd-field>
    <input vdInput class="forced" [invalid]="forced()" size="sm" />
    <vd-input-group><span class="pad">icon</span><input vdInput class="grouped" /></vd-input-group>
  `,
})
class ReactiveHost {
  readonly email = new FormControl('', Validators.required);
  readonly forced = signal(false);
}

@Component({
  imports: [VdField, VdInput, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Імʼя" error="Обовʼязкове поле">
      <input vdInput [formField]="profile.name" />
    </vd-field>
  `,
})
class SignalHost {
  readonly model = signal({ name: '' });
  readonly profile = form(this.model, (p) => required(p.name));
}

describe('VdInput + VdField (reactive forms)', () => {
  function setup() {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      input: root.querySelector<HTMLInputElement>('input[type=email]')!,
      label: root.querySelector('label')!,
    };
  }

  it('links the label to the input and describes it with the hint', () => {
    const { input, label, root } = setup();
    expect(input.id).toMatch(/^vd-control-/);
    expect(label.getAttribute('for')).toBe(input.id);
    const hint = root.querySelector('.vd-field__hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows the required marker from the required validator', () => {
    const { label } = setup();
    expect(label.querySelector('.vd-field__required')).not.toBeNull();
  });

  it('stays valid until touched, then shows the error', async () => {
    const { fixture, input, root } = setup();
    expect(input.getAttribute('aria-invalid')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.hasAttribute('data-invalid')).toBe(true);
    const error = root.querySelector('.vd-field__error')!;
    expect(error.textContent).toContain('Вкажіть email');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(root.querySelector('.vd-field__hint')).toBeNull();
  });

  it('clears the error once the value becomes valid', async () => {
    const { fixture, host, input, root } = setup();
    host.email.markAsTouched();
    host.email.setValue('a@b.ua');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(root.querySelector('.vd-field__error')).toBeNull();
  });

  it('supports a forced invalid state and size', () => {
    const { fixture, host, root } = setup();
    const forced = root.querySelector<HTMLInputElement>('.forced')!;
    expect(forced.dataset['size']).toBe('sm');
    host.forced.set(true);
    fixture.detectChanges();
    expect(forced.getAttribute('aria-invalid')).toBe('true');
  });

  it('focuses the input when the group padding/icon is clicked', () => {
    const { root } = setup();
    document.body.appendChild(root);
    root.querySelector<HTMLElement>('.pad')!.click();
    expect(document.activeElement).toBe(root.querySelector('.grouped'));
    root.remove();
  });
});

describe('VdInput + VdField (signal forms)', () => {
  it('reads required and invalid from [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;
    expect(root.querySelector('.vd-field__required')).not.toBeNull();
    // Signal Forms owns aria-invalid on native elements (set immediately); visuals wait for touch.
    expect(input.hasAttribute('data-invalid')).toBe(false);
    expect(root.querySelector('.vd-field__error')).toBeNull();

    fixture.componentInstance.profile.name().markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.hasAttribute('data-invalid')).toBe(true);
    expect(root.querySelector('.vd-field__error')?.textContent).toContain('Обовʼязкове поле');
  });
});
