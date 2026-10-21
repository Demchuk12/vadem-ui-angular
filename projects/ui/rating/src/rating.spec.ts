import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, min } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdRating } from './rating';

@Component({
  imports: [VdRating, VdField, ReactiveFormsModule, FormField],
  template: `<vd-field hint="Choose stars" error="Choose at least one star">
      <vd-rating label="Experience" [formControl]="rating" [readonly]="readonly()" />
    </vd-field>
    <vd-rating label="Delivery" [formField]="deliveryForm.rating" />`,
})
class Host {
  readonly rating = new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] });
  readonly readonly = signal(false);
  readonly delivery = signal({ rating: 0 });
  readonly deliveryForm = form(this.delivery, (p) => min(p.rating, 1));
}

describe('Rating integration', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const group = root.querySelector('fieldset')!;
    const buttons = Array.from(group.querySelectorAll('button'));
    return { fixture, root, group, buttons, host: fixture.componentInstance };
  }
  it('names the group and choices with one keyboard entry, and preserves the empty model', async () => {
    const { group, buttons, root, host } = await setup();
    expect(group.getAttribute('aria-labelledby')).toBe(root.querySelector('legend')!.id);
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    expect(buttons.every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(host.rating.value).toBe(0);
    expect(group.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')!.id);
  });
  it('integrates Reactive Forms, reset, dirty state and touched Field errors', async () => {
    const { fixture, host, group, buttons, root } = await setup();
    host.rating.markAsTouched();
    await fixture.whenStable();
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__error')!.id);
    buttons[3].click();
    await fixture.whenStable();
    expect(host.rating.value).toBe(4);
    expect(host.rating.dirty).toBe(true);
    expect(group.hasAttribute('aria-invalid')).toBe(false);
    expect(buttons[3].getAttribute('aria-checked')).toBe('true');
    host.rating.reset();
    await fixture.whenStable();
    expect(host.rating.value).toBe(0);
    expect(buttons.every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
  });
  it('blocks readonly and form-disabled writes without clearing a rating', async () => {
    const { fixture, host, group, buttons } = await setup();
    host.rating.setValue(3);
    host.readonly.set(true);
    await fixture.whenStable();
    buttons[4].click();
    await fixture.whenStable();
    expect(host.rating.value).toBe(3);
    expect(group.getAttribute('aria-readonly')).toBe('true');
    host.rating.disable();
    await fixture.whenStable();
    expect(buttons.every((b) => b.disabled)).toBe(true);
    host.rating.enable();
    await fixture.whenStable();
    expect(host.rating.value).toBe(3);
  });
  it('integrates Signal Forms writes and external replacement', async () => {
    const { fixture, root, host } = await setup();
    const buttons = root.querySelectorAll('fieldset')[1].querySelectorAll('button');
    buttons[1].click();
    await fixture.whenStable();
    expect(host.delivery().rating).toBe(2);
    host.delivery.set({ rating: 5 });
    await fixture.whenStable();
    expect(buttons[4].getAttribute('aria-checked')).toBe('true');
  });
});
