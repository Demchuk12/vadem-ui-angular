import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdChoice, VdFieldset } from '@vadem/ui/field';
import { VdRadio } from '@vadem/ui/radio';

@Component({
  imports: [ReactiveFormsModule, VdChoice, VdFieldset, VdRadio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset vdFieldset legend="План" hint="Можна змінити пізніше" error="Оберіть план">
      <label vdChoice
        ><input type="radio" vdRadio name="plan" value="free" [formControl]="plan" />Free</label
      >
      <label vdChoice
        ><input type="radio" vdRadio name="plan" value="team" [formControl]="plan" />Team</label
      >
    </fieldset>
  `,
})
class Host {
  readonly plan = new FormControl<string | null>(null, Validators.required);
}

describe('VdRadio + VdFieldset', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const fieldset = root.querySelector('fieldset')!;
    const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[type=radio]'));
    return { fixture, host: fixture.componentInstance, fieldset, radios };
  }

  it('names the group with a legend and describes the fieldset, not each radio', () => {
    const { fieldset, radios } = setup();
    expect(fieldset.querySelector('legend')!.textContent).toContain('План');
    expect(fieldset.querySelector('.vd-field__required')).not.toBeNull();
    const hintId = fieldset.querySelector('.vd-field__hint')!.id;
    expect(fieldset.getAttribute('aria-describedby')).toBe(hintId);
    expect(radios.every((r) => !r.hasAttribute('aria-describedby'))).toBe(true);
    expect(radios.every((r) => r.classList.contains('vd-radio'))).toBe(true);
  });

  it('announces a validator-derived required group with the native attribute, not aria-required', () => {
    const { radios } = setup();
    // aria-required is not supported on role=radio; the native attribute is.
    expect(radios.every((r) => r.hasAttribute('required'))).toBe(true);
    expect(radios.every((r) => !r.hasAttribute('aria-required'))).toBe(true);
  });

  it('shows the group error after touch and clears it on choice', () => {
    const { fixture, host, fieldset, radios } = setup();
    expect(fieldset.hasAttribute('data-invalid')).toBe(false);
    host.plan.markAsTouched();
    fixture.detectChanges();
    expect(fieldset.hasAttribute('data-invalid')).toBe(true);
    const errorId = fieldset.querySelector('.vd-field__error')!.id;
    expect(fieldset.getAttribute('aria-describedby')).toContain(errorId);
    expect(radios[0].getAttribute('aria-invalid')).toBe('true');

    radios[1].click();
    fixture.detectChanges();
    expect(host.plan.value).toBe('team');
    expect(fieldset.hasAttribute('data-invalid')).toBe(false);
  });
});
