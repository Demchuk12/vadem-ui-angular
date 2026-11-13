import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdBarChart } from './bar-chart';
import { VdLineChart } from './line-chart';
import { VdSparkline } from './sparkline';
import type { VdChartSeries } from './core/chart-math';

@Component({
  imports: [VdBarChart, VdSparkline],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `
    <vd-bar-chart title="Запити" [categories]="categories" [series]="series()" highlight="max" />
    <vd-sparkline label="Дохід" [values]="[10, 14, 12, 18]" />
  `,
})
class Host {
  readonly categories = ['Пн', 'Вт', 'Ср'];
  readonly series = signal<VdChartSeries[]>([{ name: 'Запити', values: [4, 9, null] }]);
}

@Component({
  imports: [VdLineChart],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `
    <vd-line-chart
      title="Пульс"
      [zero]="false"
      [categories]="['0:00', '0:30', '1:00', '1:30']"
      [series]="[{ name: 'Пульс', values: [96, 140, 118, 101] }]"
      [ranges]="[{ from: 1, to: 2, label: 'Підхід 1', tone: 'effort' }]"
    />
  `,
})
class RangesHost {}

describe('Charts', () => {
  it('names the figure, hides the legend for one series and offers a data table', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chart = (fixture.nativeElement as HTMLElement).querySelector('vd-bar-chart')!;
    const figure = chart.querySelector('figure')!;
    const title = chart.querySelector('.vd-chart__title')!;
    expect(figure.getAttribute('aria-labelledby')).toBe(title.id);
    expect(chart.hasAttribute('title')).toBe(false);
    expect(chart.querySelector('.vd-chart__legend')).toBeNull();

    const toggle = chart.querySelector<HTMLButtonElement>('.vd-chart__table-toggle')!;
    expect(toggle.textContent?.trim()).toBe('Таблиця даних');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const rows = [...chart.querySelectorAll('tbody tr')].map((r) =>
      [...r.children].map((c) => c.textContent?.trim()),
    );
    // Missing data is shown as a dash, never as zero.
    expect(rows).toEqual([
      ['Пн', '4'],
      ['Вт', '9'],
      ['Ср', '—'],
    ]);
    expect(chart.querySelector('thead th')?.textContent?.trim()).toBe('Категорія');
  });

  it('shows a legend for two or more series', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.series.set([
      { name: 'Успішні', values: [1, 2, 3] },
      { name: 'З помилками', values: [0, 1, 0] },
    ]);
    await fixture.whenStable();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('.vd-chart__legend-item');
    expect([...items].map((i) => i.textContent?.trim())).toEqual(['Успішні', 'З помилками']);
  });

  it('summarises a sparkline as one image', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const svg = (fixture.nativeElement as HTMLElement).querySelector('vd-sparkline svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Дохід: від 10 до 18, мінімум 10, максимум 18');
  });

  it('lists highlighted ranges in the data table', async () => {
    const fixture = TestBed.createComponent(RangesHost);
    await fixture.whenStable();
    const chart = (fixture.nativeElement as HTMLElement).querySelector('vd-line-chart')!;
    chart.querySelector<HTMLButtonElement>('.vd-chart__table-toggle')!.click();
    await fixture.whenStable();

    const head = [...chart.querySelectorAll('thead th')].map((c) => c.textContent?.trim());
    const rows = [...chart.querySelectorAll('tbody tr')].map((r) =>
      [...r.children].map((c) => c.textContent?.trim()),
    );
    expect(head).toEqual(['Категорія', 'Проміжок', 'Пульс']);
    expect(rows.map((r) => r[1])).toEqual(['—', 'Підхід 1', 'Підхід 1', '—']);
  });
});
