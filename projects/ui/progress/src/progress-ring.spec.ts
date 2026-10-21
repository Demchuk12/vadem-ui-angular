import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdProgressRing } from './progress-ring';

@Component({
  imports: [VdProgressRing],
  template: `<vd-progress-ring [value]="value()" [max]="max()" size="lg" showValue />`,
})
class Host {
  readonly value = signal<number | null>(null);
  readonly max = signal(100);
}

describe('Progress ring', () => {
  it('is an indeterminate progressbar without a value, determinate with one', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const ring = (fixture.nativeElement as HTMLElement).querySelector('vd-progress-ring')!;
    expect(ring.getAttribute('role')).toBe('progressbar');
    expect(ring.getAttribute('aria-label')).toBe('Loading');
    expect(ring.hasAttribute('data-indeterminate')).toBe(true);
    expect(ring.hasAttribute('aria-valuenow')).toBe(false);
    expect(ring.querySelector('.vd-progress-ring__value')).toBeNull();

    fixture.componentInstance.value.set(30);
    fixture.componentInstance.max.set(60);
    await fixture.whenStable();
    expect(ring.hasAttribute('data-indeterminate')).toBe(false);
    expect(ring.getAttribute('aria-valuenow')).toBe('30');
    expect(ring.getAttribute('aria-valuemax')).toBe('60');
    expect(ring.querySelector('.vd-progress-ring__value')?.textContent).toBe('50%');
    expect(ring.getAttribute('style')).toContain('--vd-progress-ring-value: 50');
  });

  it('clamps out-of-range values', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.value.set(140);
    await fixture.whenStable();
    const ring = (fixture.nativeElement as HTMLElement).querySelector('vd-progress-ring')!;
    expect(ring.getAttribute('aria-valuenow')).toBe('100');
    fixture.componentInstance.value.set(-5);
    await fixture.whenStable();
    expect(ring.getAttribute('aria-valuenow')).toBe('0');
  });

  it('takes its default name from the locale', async () => {
    TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const ring = (fixture.nativeElement as HTMLElement).querySelector('vd-progress-ring')!;
    expect(ring.getAttribute('aria-label')).toBe('Завантаження');
  });
});
