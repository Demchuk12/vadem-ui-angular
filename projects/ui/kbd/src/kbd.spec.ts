import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdKbd } from './kbd';

@Component({
  imports: [VdKbd],
  template: `<vd-kbd [keys]="keys()" thenLabel="потім" />`,
})
class Host {
  readonly keys = signal('Mod+Shift+K');
}

describe('Kbd', () => {
  it('renders nested kbd per key with hidden separators and spoken names', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const outer = root.querySelector('kbd.vd-kbd')!;
    // jsdom is not an Apple platform.
    expect(outer.getAttribute('data-platform')).toBe('other');
    const keys = [...outer.querySelectorAll(':scope > kbd')];
    const visible = (k: Element) =>
      (k.querySelector('[aria-hidden="true"]') ?? k).textContent?.trim();
    const spoken = (k: Element) =>
      (k.querySelector('.vd-visually-hidden') ?? k).textContent?.trim();
    expect(keys.map(visible)).toEqual(['Ctrl', 'Shift', 'K']);
    expect(keys.map(spoken)).toEqual(['Control', 'Shift', 'K']);
    const pluses = outer.querySelectorAll('.vd-kbd__plus');
    expect(pluses.length).toBe(2);
    pluses.forEach((p) => expect(p.getAttribute('aria-hidden')).toBe('true'));

    fixture.componentInstance.keys.set('G D');
    await fixture.whenStable();
    expect(outer.querySelectorAll(':scope > kbd').length).toBe(2);
    expect(outer.querySelector('.vd-kbd__then')?.textContent).toContain('потім');
  });

  it('hides symbols from assistive technology and exposes the key name', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.keys.set('Up');
    await fixture.whenStable();
    const key = (fixture.nativeElement as HTMLElement).querySelector('kbd.vd-kbd > kbd')!;
    expect(key.querySelector('[aria-hidden="true"]')?.textContent).toBe('↑');
    expect(key.querySelector('.vd-visually-hidden')?.textContent).toBe('Up arrow');
  });
});
