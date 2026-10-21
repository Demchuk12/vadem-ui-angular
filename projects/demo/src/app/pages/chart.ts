import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VD_CARD } from '@vadem/ui/card';
import { VdBarChart, VdLineChart, VdSparkline } from '@vadem/ui/chart';
import { VdStat } from '@vadem/ui/stat';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const WEEKS = Array.from({ length: 12 }, (_, i) => `Т${i + 1}`);

@Component({
  selector: 'demo-chart',
  imports: [VD_CARD, VdBarChart, VdLineChart, VdSparkline, VdStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Charts</p>
      <h1>Charts</h1>
      <p>
        Bar, line and sparkline on SVG and tokens. Hover or tab into a chart and use the arrow keys;
        every chart has a data table. One series uses the accent, several the validated categorical
        palette in a fixed order.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="chart-bars">
      <div class="demo-section__head">
        <h2 id="chart-bars">Bars</h2>
      </div>
      <div class="demo-chart-grid">
        <article vdCard>
          <vd-bar-chart
            title="Запити до API"
            description="Тисячі запитів за день, останні 7 днів"
            categoryLabel="День"
            [categories]="days"
            [series]="[{ name: 'Запити, тис.', values: [4.2, 5.1, 4.6, 6.4, 5.9, 3.1, 2.4] }]"
          />
        </article>
        <article vdCard>
          <vd-bar-chart
            title="Збірки за статусом"
            description="Grouped: two series side by side"
            [categories]="days"
            [series]="builds"
          />
        </article>
        <article vdCard>
          <vd-bar-chart
            title="Витрати на хмару"
            description="Stacked: part-to-whole per month, ₴ тис."
            [categories]="['Лип', 'Сер', 'Вер', 'Жов']"
            [series]="costs"
            stacked
          />
        </article>
        <article vdCard>
          <vd-bar-chart
            title="Найповільніші сервіси"
            description="Horizontal for long names; p95, мс"
            orientation="horizontal"
            [height]="260"
            [categories]="services"
            [series]="[{ name: 'p95, мс', values: [842, 615, 498, 377, 214] }]"
          />
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="chart-lines">
      <div class="demo-section__head">
        <h2 id="chart-lines">Lines</h2>
      </div>
      <div class="demo-chart-grid">
        <article vdCard>
          <vd-line-chart
            title="Активні користувачі"
            description="Один ряд: лінія з легкою заливкою"
            [categories]="weeks"
            [series]="[{ name: 'Користувачі', values: users }]"
          />
        </article>
        <article vdCard>
          <vd-line-chart
            title="Час відповіді за регіонами"
            description="Кілька рядів: легенда та підписи на кінцях; пропуск даних — розрив"
            [categories]="weeks"
            [series]="latency"
            [format]="ms"
          />
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="chart-spark">
      <div class="demo-section__head">
        <h2 id="chart-spark">Sparklines in stats</h2>
        <p>
          Trend in muted ink, the current period in the accent. Read as one image with a summary.
        </p>
      </div>
      <div class="demo-chart-stats">
        <article vdCard>
          <vd-stat label="Дохід" value="₴ 48 920" delta="+12,4%" caption="за тиждень">
            <vd-sparkline label="Дохід за 12 тижнів, ₴ тис." [values]="revenue" />
          </vd-stat>
        </article>
        <article vdCard>
          <vd-stat
            label="Помилки 5xx"
            value="0,21%"
            delta="−0,05"
            trend="down"
            sentiment="positive"
          >
            <vd-sparkline label="Частка помилок за 12 тижнів, %" [values]="errors" />
          </vd-stat>
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="chart-rtl">
      <div class="demo-section__head">
        <h2 id="chart-rtl">RTL</h2>
        <p>The plot keeps its left-to-right axis like numbers; text around it follows the page.</p>
      </div>
      <article vdCard dir="rtl" lang="ar">
        <vd-bar-chart
          title="الطلبات اليومية"
          description="آخر 7 أيام"
          [categories]="['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']"
          [series]="[
            { name: 'الويب', values: [120, 180, 160, 210, 190, 90, 70] },
            { name: 'الجوال', values: [80, 95, 110, 130, 120, 140, 100] },
          ]"
        />
      </article>
    </section>
  `,
  styles: `
    .demo-chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
      gap: var(--vd-space-4);
    }
    .demo-chart-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: var(--vd-space-4);
    }
  `,
})
export default class ChartPage {
  protected readonly days = DAYS;
  protected readonly weeks = WEEKS;
  protected readonly services = [
    'Платіжний шлюз (ПриватБанк, monobank)',
    'Пошук по каталогу',
    'Генерація PDF-рахунків',
    'Авторизація',
    'Сповіщення',
  ];
  protected readonly builds = [
    { name: 'Успішні', values: [42, 51, 38, 60, 55, 12, 8] },
    { name: 'З помилками', values: [3, 6, 2, 9, 4, 1, 0] },
  ];
  protected readonly costs = [
    { name: 'Обчислення', values: [62, 64, 71, 69] },
    { name: 'Сховище', values: [21, 23, 24, 26] },
    { name: 'Трафік', values: [14, 18, 15, 22] },
  ];
  protected readonly users = [
    6100, 6400, 6250, 6900, 7300, 7150, 7600, 8100, 7900, 8400, 8700, 8920,
  ];
  protected readonly latency = [
    { name: 'Київ', values: [182, 175, 190, 168, 160, 172, 158, 150, 162, 149, 141, 138] },
    { name: 'Варшава', values: [210, 205, 220, 214, null, null, 198, 190, 201, 188, 180, 176] },
    { name: 'Франкфурт', values: [240, 236, 228, 232, 225, 219, 230, 221, 215, 212, 208, 202] },
  ];
  protected readonly revenue = [31, 33, 32, 36, 38, 37, 41, 40, 43, 45, 44, 48.9];
  protected readonly errors = [
    0.42, 0.39, 0.4, 0.35, 0.33, 0.36, 0.3, 0.28, 0.27, 0.25, 0.26, 0.21,
  ];
  protected readonly ms = (v: number) => `${new Intl.NumberFormat('uk').format(v)} мс`;
}
