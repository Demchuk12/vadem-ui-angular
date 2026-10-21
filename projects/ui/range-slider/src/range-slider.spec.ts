import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdRangeSlider } from './range-slider';
import { VdRangeValue } from './core/range-slider';

@Component({
  imports: [VdRangeSlider, VdField, ReactiveFormsModule, FormField],
  template: `<vd-field hint="Adjust bounds" error="Choose an interval">
      <vd-range-slider label="Budget" [formControl]="control" [readonly]="readonly()" /> </vd-field
    ><vd-range-slider label="Signal interval" [formField]="fields.range" />`,
})
class Host {
  readonly control = new FormControl<VdRangeValue | null>([20, 80], Validators.required);
  readonly readonly = signal(false);
  readonly data = signal({ range: [10, 30] as VdRangeValue | null });
  readonly fields = form(this.data);
}

describe('Range slider integration', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const thumbs = Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
    return { fixture, root, thumbs, host: fixture.componentInstance };
  }
  it('writes Reactive Forms, prevents crossing, and announces dependent bounds', async () => {
    const { fixture, thumbs, host } = await setup();
    thumbs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(host.control.value).toEqual([80, 80]);
    expect(host.control.dirty).toBe(true);
    expect(thumbs[1].getAttribute('aria-valuemin')).toBe('80');
    expect(thumbs.slice(0, 2).every((thumb) => thumb.tabIndex === 0)).toBe(true);
  });
  it('keeps null resets and exposes touched errors through Field', async () => {
    const { fixture, root, thumbs, host } = await setup();
    host.control.reset();
    host.control.markAsTouched();
    await fixture.whenStable();
    expect(host.control.value).toBeNull();
    expect(thumbs[0].getAttribute('aria-valuenow')).toBe('0');
    expect(thumbs[1].getAttribute('aria-valuenow')).toBe('100');
    expect(thumbs[0].getAttribute('aria-invalid')).toBe('true');
    expect(thumbs[0].getAttribute('aria-describedby')).toBe(
      root.querySelector('.vd-field__error')!.id,
    );
  });
  it('blocks readonly and form-disabled edits; touches only on leaving the composite', async () => {
    const { fixture, thumbs, host } = await setup();
    host.readonly.set(true);
    await fixture.whenStable();
    thumbs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.control.value).toEqual([20, 80]);
    thumbs[0].dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: thumbs[1], bubbles: true }),
    );
    expect(host.control.touched).toBe(false);
    thumbs[1].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);
    host.control.disable();
    await fixture.whenStable();
    expect(thumbs.slice(0, 2).every((thumb) => thumb.disabled)).toBe(true);
  });
  it('updates Signal Forms and leaves modified keys to the browser', async () => {
    const { fixture, thumbs, host } = await setup();
    thumbs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.data().range).toEqual([11, 30]);
    thumbs[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', ctrlKey: true, bubbles: true }),
    );
    await fixture.whenStable();
    expect(host.data().range).toEqual([11, 30]);
  });
});
