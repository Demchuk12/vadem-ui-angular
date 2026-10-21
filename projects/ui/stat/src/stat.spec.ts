import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdStat, type VdStatSentiment, type VdStatTrend } from './stat';

@Component({
  imports: [VdStat],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `<vd-stat
    label="Помилки 5xx"
    [value]="value()"
    [delta]="delta()"
    [trend]="trend()"
    [sentiment]="sentiment()"
    caption="від усіх запитів"
    [loading]="loading()"
  />`,
})
class Host {
  readonly value = signal('0,21%');
  readonly delta = signal<string | undefined>('−0,05');
  readonly trend = signal<VdStatTrend>('down');
  readonly sentiment = signal<VdStatSentiment | undefined>('positive');
  readonly loading = signal(false);
}

describe('Stat', () => {
  it('pairs label and value as a description list and speaks the direction', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const stat = (fixture.nativeElement as HTMLElement).querySelector('vd-stat')!;
    expect(stat.querySelector('dt')?.textContent?.trim()).toBe('Помилки 5xx');
    expect(stat.querySelector('dd.vd-stat__value')?.textContent?.trim()).toBe('0,21%');
    expect(stat.querySelector('.vd-stat__delta .vd-visually-hidden')?.textContent?.trim()).toBe(
      'Падіння',
    );
    // Falling errors are good news.
    expect(stat.getAttribute('data-sentiment')).toBe('positive');
  });

  it('derives sentiment from the trend and isolates numbers left-to-right', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.sentiment.set(undefined);
    fixture.componentInstance.value.set('₴ 48 920');
    await fixture.whenStable();
    const stat = (fixture.nativeElement as HTMLElement).querySelector('vd-stat')!;
    expect(stat.getAttribute('data-sentiment')).toBe('negative');
    expect(stat.querySelector('.vd-stat__value bdi')?.getAttribute('dir')).toBe('ltr');

    fixture.componentInstance.value.set('48 920 ر.س');
    fixture.componentInstance.trend.set('flat');
    await fixture.whenStable();
    expect(stat.querySelector('.vd-stat__value bdi')?.getAttribute('dir')).toBe('rtl');
    expect(stat.getAttribute('data-sentiment')).toBe('neutral');
    expect(stat.querySelector('.vd-stat__delta vd-icon')).toBeNull();
  });

  it('keeps the label and shows placeholders while loading', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    const stat = (fixture.nativeElement as HTMLElement).querySelector('vd-stat')!;
    expect(stat.getAttribute('aria-busy')).toBe('true');
    expect(stat.querySelector('dt')?.textContent?.trim()).toBe('Помилки 5xx');
    expect(stat.querySelectorAll('.vd-skeleton, [vdSkeleton]').length).toBeGreaterThan(0);
    expect(stat.querySelector('.vd-stat__delta')).toBeNull();
  });
});
