import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleUk } from './core/locale';
import { provideVdLocale, vdLocaleProvider, vdTexts } from './locale';

@Component({
  selector: 'vd-probe',
  template: `{{ t().closeLabel }}|{{ t().label }}`,
})
class Probe {
  readonly closeLabel = input<string>();
  readonly label = input<string>();
  protected readonly t = vdTexts('toast', { closeLabel: this.closeLabel, label: this.label });
}

@Component({
  selector: 'vd-uk-subtree',
  imports: [Probe],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `<vd-probe />`,
})
class UkSubtree {}

@Component({
  imports: [Probe, UkSubtree],
  template: `<vd-probe /><vd-probe closeLabel="Сховати" /><vd-uk-subtree />`,
})
class Host {}

const texts = (root: HTMLElement) =>
  [...root.querySelectorAll('vd-probe')].map((el) => el.textContent?.trim());

describe('vdTexts', () => {
  it('uses English by default, inputs override, and a subtree can provide another locale', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(texts(fixture.nativeElement)).toEqual([
      'Close|Notifications',
      'Сховати|Notifications',
      'Закрити|Сповіщення',
    ]);
  });

  it('provideVdLocale switches the application default', async () => {
    TestBed.configureTestingModule({ providers: [provideVdLocale(vdLocaleUk)] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(texts(fixture.nativeElement)[0]).toBe('Закрити|Сповіщення');
  });
});
