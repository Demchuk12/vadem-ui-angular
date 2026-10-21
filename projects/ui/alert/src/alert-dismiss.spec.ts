import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_ALERT } from './alert';

@Component({
  imports: [VD_ALERT],
  template: `<div
    vdAlert
    layout="banner"
    [dismissible]="dismissible()"
    (dismiss)="dismissed = dismissed + 1"
  >
    <p>Технічні роботи</p>
  </div>`,
})
class Host {
  readonly dismissible = signal(false);
  dismissed = 0;
}

describe('Alert banner and dismiss', () => {
  it('reflects the banner layout and adds a localized close button only when dismissible', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const alert = (fixture.nativeElement as HTMLElement).querySelector('.vd-alert')!;
    expect(alert.getAttribute('data-layout')).toBe('banner');
    expect(alert.querySelector('.vd-alert__dismiss')).toBeNull();

    fixture.componentInstance.dismissible.set(true);
    await fixture.whenStable();
    const close = alert.querySelector<HTMLButtonElement>('.vd-alert__dismiss')!;
    expect(close.getAttribute('aria-label')).toBe('Dismiss');
    expect(close.getAttribute('type')).toBe('button');
    close.click();
    expect(fixture.componentInstance.dismissed).toBe(1);
  });
});
