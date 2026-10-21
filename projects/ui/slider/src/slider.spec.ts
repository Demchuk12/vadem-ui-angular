import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdSlider, vdSliderFill } from '@vadem/ui/slider';

@Component({
  imports: [ReactiveFormsModule, VdField, VdSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Гучність">
      <input type="range" vdSlider min="0" max="200" [formControl]="volume" />
    </vd-field>
  `,
})
class Host {
  readonly volume = new FormControl(50);
}

describe('vdSliderFill', () => {
  it('maps value to percent, clamped', () => {
    expect(vdSliderFill(50, 0, 200)).toBe(25);
    expect(vdSliderFill(-10, 0, 100)).toBe(0);
    expect(vdSliderFill(150, 0, 100)).toBe(100);
    expect(vdSliderFill(5, 5, 5)).toBe(0);
    expect(vdSliderFill(NaN, 0, 100)).toBe(0);
  });
});

describe('VdSlider', () => {
  it('is labelled by vd-field and keeps the fill in sync with form writes and input', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const range = root.querySelector<HTMLInputElement>('input[type=range]')!;
    expect(root.querySelector('label')!.getAttribute('for')).toBe(range.id);
    expect(range.style.getPropertyValue('--vd-slider-fill')).toBe('25%');

    fixture.componentInstance.volume.setValue(150);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(range.style.getPropertyValue('--vd-slider-fill')).toBe('75%');

    range.value = '200';
    range.dispatchEvent(new Event('input'));
    expect(range.style.getPropertyValue('--vd-slider-fill')).toBe('100%');
    expect(fixture.componentInstance.volume.value).toBe(200);
  });
});
