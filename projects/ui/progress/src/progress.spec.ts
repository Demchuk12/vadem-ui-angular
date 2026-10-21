import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdMeter, VdProgress } from '@vadem/ui/progress';

@Component({
  imports: [VdProgress, VdMeter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label for="p">Завантаження</label>
    <progress id="p" vdProgress value="40" max="100" variant="success" size="sm"></progress>
    <progress vdProgress aria-label="Обробка"></progress>
    <meter vdMeter aria-label="Квота" value="0.9" low="0.7" high="0.85" optimum="0.2"></meter>
  `,
})
class Host {}

describe('VdProgress / VdMeter', () => {
  it('keeps native semantics and reflects variant and size', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const [determinate, indeterminate] = Array.from(root.querySelectorAll('progress'));
    expect(determinate.classList).toContain('vd-progress');
    expect(determinate.value).toBe(40);
    expect(determinate.getAttribute('data-variant')).toBe('success');
    expect(determinate.getAttribute('data-size')).toBe('sm');
    expect(indeterminate.hasAttribute('value')).toBe(false);
    expect(indeterminate.getAttribute('data-variant')).toBe('accent');
    const meter = root.querySelector('meter')!;
    expect(meter.classList).toContain('vd-meter');
    expect(meter.getAttribute('data-size')).toBe('md');
  });
});
