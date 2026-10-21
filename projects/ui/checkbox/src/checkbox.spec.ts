import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VdChoice, VdField } from '@vadem/ui/field';
import { VdSwitch } from '@vadem/ui/switch';

@Component({
  imports: [ReactiveFormsModule, VdCheckbox, VdSwitch, VdChoice, VdField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label vdChoice>
      <input type="checkbox" vdCheckbox class="all" [(indeterminate)]="mixed" />
      Усі
    </label>
    <vd-field hint="Обовʼязково" error="Потрібна згода">
      <label vdChoice>
        <input type="checkbox" vdCheckbox class="terms" [formControl]="terms" />
        Погоджуюсь
      </label>
    </vd-field>
    <label vdChoice
      ><input type="checkbox" vdSwitch class="sw" [formControl]="dark" />Темна тема</label
    >
  `,
})
class Host {
  readonly mixed = signal(true);
  readonly terms = new FormControl(false, Validators.requiredTrue);
  readonly dark = new FormControl(true);
}

@Component({
  imports: [VdCheckbox, VdChoice, VdField, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field error="Потрібна згода">
      <label vdChoice>
        <input type="checkbox" vdCheckbox [formField]="f.terms" />
        Погоджуюсь
      </label>
    </vd-field>
  `,
})
class SignalHost {
  readonly locked = signal(false);
  readonly model = signal({ terms: false });
  readonly f = form(this.model, (p) => {
    required(p.terms);
    disabled(p.terms, () => this.locked());
  });
}

describe('VdCheckbox (signal forms)', () => {
  it('reads required, touched and disabled from [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const box = root.querySelector<HTMLInputElement>('input')!;
    expect(box.required).toBe(true);
    expect(box.hasAttribute('data-invalid')).toBe(false);

    fixture.componentInstance.f.terms().markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(box.hasAttribute('data-invalid')).toBe(true);
    expect(root.querySelector('.vd-field__error')?.textContent).toContain('Потрібна згода');

    box.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().terms).toBe(true);
    expect(box.hasAttribute('data-invalid')).toBe(false);

    fixture.componentInstance.locked.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(box.disabled).toBe(true);
    expect(root.querySelector('.vd-field')?.hasAttribute('data-disabled')).toBe(true);
  });
});

describe('VdCheckbox / VdSwitch', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const q = (s: string) => root.querySelector<HTMLInputElement>(s)!;
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      all: q('.all'),
      terms: q('.terms'),
      sw: q('.sw'),
    };
  }

  it('applies and clears the indeterminate state two-way', () => {
    const { fixture, host, all } = setup();
    expect(all.indeterminate).toBe(true);
    all.click();
    fixture.detectChanges();
    expect(all.indeterminate).toBe(false);
    expect(host.mixed()).toBe(false);
    expect(all.checked).toBe(true);
  });

  it('works with reactive forms and requiredTrue', async () => {
    const { fixture, host, terms, root } = setup();
    // requiredTrue is announced via aria-required (no native constraint validation side effects).
    expect(terms.hasAttribute('required')).toBe(false);
    expect(terms.getAttribute('aria-required')).toBe('true');
    expect(root.querySelector<HTMLInputElement>('.sw')!.hasAttribute('aria-required')).toBe(false);
    expect(terms.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')!.id);

    host.terms.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(terms.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.vd-field__error')?.textContent).toContain('Потрібна згода');

    terms.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.terms.value).toBe(true);
    expect(terms.getAttribute('aria-invalid')).toBeNull();
  });

  it('exposes the switch role and binds checked state', () => {
    const { fixture, host, sw } = setup();
    expect(sw.getAttribute('role')).toBe('switch');
    expect(sw.classList).toContain('vd-switch');
    expect(sw.checked).toBe(true);
    sw.click();
    fixture.detectChanges();
    expect(host.dark.value).toBe(false);
  });

  it('wraps controls in a vd-choice label', () => {
    const { root } = setup();
    expect(root.querySelectorAll('label.vd-choice').length).toBe(3);
  });
});
