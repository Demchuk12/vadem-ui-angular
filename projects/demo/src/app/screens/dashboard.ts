import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge, VdBadgeVariant } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VD_DIALOG, VdDialog } from '@vadem/ui/dialog';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { VD_MENU } from '@vadem/ui/menu';
import { VdStat } from '@vadem/ui/stat';
import { VdBarChart } from '@vadem/ui/chart';
import { VdSegment, VdSegmented } from '@vadem/ui/segmented';
import { VD_TABLE } from '@vadem/ui/table';
import { VdToaster } from '@vadem/ui/toast';

type Period = 'week' | 'month' | 'quarter';

interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  /** Whether the trend is good news (fewer errors going down is good). */
  good: boolean;
  caption: string;
}

interface Deploy {
  id: string;
  project: string;
  branch: string;
  message: string;
  status: { label: string; variant: VdBadgeVariant };
  author: string;
  time: string;
}

const STATUS = {
  live: { label: 'Працює', variant: 'success' },
  building: { label: 'Збирається', variant: 'info' },
  failed: { label: 'Збій', variant: 'danger' },
  queued: { label: 'У черзі', variant: 'neutral' },
} as const satisfies Record<string, { label: string; variant: VdBadgeVariant }>;

const DATA: Record<Period, { kpis: Kpi[]; bars: number[]; labels: string[] }> = {
  week: {
    kpis: [
      {
        label: 'Дохід',
        value: '₴ 48 920',
        delta: '+12,4%',
        trend: 'up',
        good: true,
        caption: 'проти минулого тижня',
      },
      {
        label: 'Активні користувачі',
        value: '8 920',
        delta: '+3,1%',
        trend: 'up',
        good: true,
        caption: 'унікальних за 7 днів',
      },
      {
        label: 'Розгортання',
        value: '64',
        delta: '+8',
        trend: 'up',
        good: true,
        caption: '98,4% успішних',
      },
      {
        label: 'Помилки 5xx',
        value: '0,21%',
        delta: '−0,05',
        trend: 'down',
        good: true,
        caption: 'від усіх запитів',
      },
    ],
    bars: [42, 58, 51, 74, 66, 38, 29],
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
  },
  month: {
    kpis: [
      {
        label: 'Дохід',
        value: '₴ 196 300',
        delta: '+6,2%',
        trend: 'up',
        good: true,
        caption: 'проти вересня',
      },
      {
        label: 'Активні користувачі',
        value: '37 410',
        delta: '−1,8%',
        trend: 'down',
        good: false,
        caption: 'унікальних за 30 днів',
      },
      {
        label: 'Розгортання',
        value: '271',
        delta: '+19',
        trend: 'up',
        good: true,
        caption: '97,8% успішних',
      },
      {
        label: 'Помилки 5xx',
        value: '0,34%',
        delta: '+0,09',
        trend: 'up',
        good: false,
        caption: 'від усіх запитів',
      },
    ],
    bars: [61, 55, 70, 64, 48, 72, 80, 77, 69, 58, 66, 74],
    labels: ['1', '4', '6', '9', '12', '14', '17', '20', '22', '25', '28', '30'],
  },
  quarter: {
    kpis: [
      {
        label: 'Дохід',
        value: '₴ 571 840',
        delta: '+18,0%',
        trend: 'up',
        good: true,
        caption: 'проти II кварталу',
      },
      {
        label: 'Активні користувачі',
        value: '102 118',
        delta: '+9,6%',
        trend: 'up',
        good: true,
        caption: 'унікальних за квартал',
      },
      {
        label: 'Розгортання',
        value: '803',
        delta: '−42',
        trend: 'down',
        good: false,
        caption: '97,1% успішних',
      },
      {
        label: 'Помилки 5xx',
        value: '0,28%',
        delta: '−0,11',
        trend: 'down',
        good: true,
        caption: 'від усіх запитів',
      },
    ],
    bars: [48, 52, 57, 61, 59, 66, 70, 68, 75, 79, 83, 88, 91],
    labels: Array.from({ length: 13 }, (_, i) => `Тиждень ${i + 1}`),
  },
};

@Component({
  selector: 'demo-dashboard',
  imports: [
    VdAvatar,
    VD_CARD,
    VD_DIALOG,
    VD_MENU,
    VD_TABLE,
    VdBadge,
    VdButton,
    VdIcon,
    VdSegment,
    VdSegmented,
    VdStat,
    VdBarChart,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="dash-head">
      <div class="dash-head__text">
        <p class="vd-eyebrow">Огляд · 2 жовтня 2026</p>
        <h1>Доброго ранку, Олено</h1>
        <p class="dash-muted">
          Усе стабільно: 3 сервіси працюють, одне розгортання потребує уваги.
        </p>
      </div>
      <div class="dash-head__actions">
        <!-- A filter, not tabs (no panels): a segmented radio group. -->
        <vd-segmented
          class="dash-period"
          aria-label="Період"
          [value]="period()"
          (valueChange)="setPeriod($any($event))"
        >
          <vd-segment value="week">Тиждень</vd-segment>
          <vd-segment value="month">Місяць</vd-segment>
          <vd-segment value="quarter">Квартал</vd-segment>
        </vd-segmented>
        <button vdButton [vdMenuTrigger]="exportMenu">
          <vd-icon name="download" slot="start" />Експорт
        </button>
        <div vdMenu #exportMenu="vdMenu">
          <button vdMenuItem (click)="exportAs('CSV')">CSV для таблиць</button>
          <button vdMenuItem (click)="exportAs('JSON')">JSON для API</button>
          <button vdMenuItem (click)="exportAs('PDF')">PDF-звіт</button>
        </div>
      </div>
    </header>

    <section class="dash-kpis" aria-label="Ключові показники" [attr.aria-busy]="loading()">
      @for (k of data().kpis; track k.label) {
        <article vdCard class="dash-kpi">
          <vd-stat
            [label]="k.label"
            [value]="k.value"
            [delta]="k.delta"
            [trend]="k.trend"
            [sentiment]="k.good ? 'positive' : 'negative'"
            [caption]="k.caption"
            [loading]="loading()"
          />
        </article>
      }
    </section>

    <div class="dash-grid">
      <article vdCard class="dash-chart-card">
        <vd-bar-chart
          title="Запити до API"
          [description]="'Тисячі запитів · ' + periodLabel() + ' · демо-дані'"
          categoryLabel="Період"
          [categories]="data().labels"
          [series]="[{ name: 'Запити, тис.', values: data().bars }]"
          [height]="300"
          [loading]="loading()"
          highlight="max"
        />
      </article>

      <article vdCard id="activity" class="dash-activity">
        <header vdCardHeader>
          <h2 vdCardTitle>Активність</h2>
          <p vdCardDescription>Останні події команди</p>
        </header>
        <ol class="dash-feed" role="list">
          @for (a of activity; track a.text) {
            <li>
              <span class="dash-feed__icon" [attr.data-tone]="a.tone"
                ><vd-icon [name]="a.icon"
              /></span>
              <p>
                <strong>{{ a.who }}</strong> {{ a.text }}
                <span class="dash-feed__time">{{ a.time }}</span>
              </p>
            </li>
          }
        </ol>
      </article>
    </div>

    <section class="dash-section" aria-labelledby="deploys">
      <div class="dash-section__head">
        <h2 id="deploys">Останні розгортання</h2>
        <button vdButton variant="ghost" size="sm">
          Усі розгортання<vd-icon name="arrow-right" slot="end" />
        </button>
      </div>
      <div vdCard>
        <div vdTableScroll aria-label="Таблиця розгортань">
          <table vdTable>
            <thead>
              <tr>
                <th scope="col">Проєкт</th>
                <th scope="col">Гілка і коміт</th>
                <th scope="col">Статус</th>
                <th scope="col">Автор</th>
                <th scope="col">Час</th>
                <th scope="col"><span class="vd-visually-hidden">Дії</span></th>
              </tr>
            </thead>
            <tbody>
              @for (d of deploys(); track d.id) {
                <tr>
                  <th scope="row" class="dash-nowrap">{{ d.project }}</th>
                  <td>
                    <span class="dash-branch"><vd-icon name="git-branch" />{{ d.branch }}</span>
                    <span class="dash-commit">{{ d.message }}</span>
                  </td>
                  <td>
                    <span vdBadge [variant]="d.status.variant" dot>{{ d.status.label }}</span>
                  </td>
                  <td>
                    <span class="dash-author">
                      <vd-avatar size="sm" [name]="d.author" decorative />
                      {{ d.author }}
                    </span>
                  </td>
                  <td class="dash-time">{{ d.time }}</td>
                  <td class="dash-table__actions">
                    <button
                      vdButton
                      variant="ghost"
                      size="sm"
                      iconOnly
                      [attr.aria-label]="'Дії: ' + d.project + ', ' + d.branch"
                      [vdMenuTrigger]="rowMenu"
                    >
                      <vd-icon name="more-horizontal" />
                    </button>
                    <div vdMenu #rowMenu="vdMenu">
                      <button vdMenuItem (click)="openDetails(d)">
                        <vd-icon name="external-link" />Деталі й логи
                      </button>
                      <button vdMenuItem (click)="redeploy(d)">
                        <vd-icon name="rocket" />Розгорнути повторно
                      </button>
                      <button vdMenuItem (click)="copyId(d)">
                        <vd-icon name="copy" />Копіювати ID
                      </button>
                      <hr vdMenuSeparator />
                      <button
                        vdMenuItem
                        variant="danger"
                        [disabled]="d.status.label !== 'Працює'"
                        (click)="askRollback(d)"
                      >
                        <vd-icon name="arrow-left" />Відкотити
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="dash-section" id="projects" aria-labelledby="projects-title">
      <div class="dash-section__head">
        <h2 id="projects-title">Проєкти</h2>
      </div>
      <ul class="dash-projects" role="list">
        @for (p of projects; track p.name) {
          <li vdCard interactive>
            <header vdCardHeader>
              <h3 vdCardTitle>
                <a vdCardLink href="#projects">{{ p.name }}</a>
              </h3>
              <span vdBadge [variant]="p.status.variant" dot>{{ p.status.label }}</span>
            </header>
            <p class="dash-muted">{{ p.description }}</p>
            <footer vdCardFooter class="dash-project-meta">
              <span class="vd-eyebrow">{{ p.region }}</span>
              <span class="vd-eyebrow">· {{ p.updated }}</span>
            </footer>
          </li>
        }
      </ul>
    </section>

    <dialog vdDialog #detailsDrawer="vdDialog" placement="end" (closed)="onDetailsClosed($event)">
      @if (details(); as d) {
        <header vdDialogHeader>
          <h2 vdDialogTitle>{{ d.project }}</h2>
          <p vdDialogDescription>{{ d.id }} · {{ d.branch }} · {{ d.time }}</p>
          <button vdButton vdDialogClose variant="ghost" iconOnly size="sm" aria-label="Закрити">
            <vd-icon name="x" />
          </button>
        </header>
        <div vdDialogBody>
          <dl class="dash-dl">
            <dt>Статус</dt>
            <dd>
              <span vdBadge [variant]="d.status.variant" dot>{{ d.status.label }}</span>
            </dd>
            <dt>Коміт</dt>
            <dd>{{ d.message }}</dd>
            <dt>Автор</dt>
            <dd class="dash-author">
              <vd-avatar size="sm" [name]="d.author" decorative />{{ d.author }}
            </dd>
          </dl>
          <pre><code>[12:04:31] build  ✓ compiled in 2.4s
[12:04:33] test   ✓ 214 passed
[12:04:41] deploy ✓ eu-central-1
[12:04:42] health ✓ 200 OK</code></pre>
        </div>
        <footer vdDialogFooter>
          <button vdButton variant="ghost" vdDialogClose>Закрити</button>
          <button vdButton variant="primary" vdDialogClose="redeploy">
            <vd-icon name="rocket" slot="start" />Розгорнути повторно
          </button>
        </footer>
      }
    </dialog>

    <dialog
      vdDialog
      #rollback="vdDialog"
      size="sm"
      role="alertdialog"
      [dismissible]="false"
      (closed)="onRollback($event)"
    >
      <header vdDialogHeader>
        <h2 vdDialogTitle>Відкотити «{{ pending()?.project }}»?</h2>
        <p vdDialogDescription>
          Продакшн повернеться до попереднього розгортання. Поточне ({{ pending()?.branch }})
          залишиться в історії, його можна буде повернути.
        </p>
      </header>
      <footer vdDialogFooter>
        <button vdButton vdDialogClose autofocus>Скасувати</button>
        <button vdButton variant="danger" vdDialogClose="rollback">Відкотити</button>
      </footer>
    </dialog>
  `,
  styleUrl: './dashboard.css',
})
export default class DashboardScreen {
  private readonly toaster = inject(VdToaster);

  protected readonly period = signal<Period>('week');
  protected readonly loading = signal(false);
  protected readonly pending = signal<Deploy | null>(null);

  protected readonly data = computed(() => DATA[this.period()]);
  protected readonly periodLabel = computed(
    () => ({ week: 'останні 7 днів', month: 'жовтень', quarter: 'III квартал' })[this.period()],
  );

  protected readonly deploys = signal<Deploy[]>([
    {
      id: 'dpl_8f2a',
      project: 'Платформа оплат',
      branch: 'main',
      message: 'feat: інвойси в гривні',
      status: STATUS.live,
      author: 'Олена Коваленко',
      time: '2 хв тому',
    },
    {
      id: 'dpl_8f29',
      project: 'Мобільний застосунок',
      branch: 'release/4.2',
      message: 'fix: офлайн-кеш маршрутів',
      status: STATUS.building,
      author: 'Тарас Мельник',
      time: '9 хв тому',
    },
    {
      id: 'dpl_8f27',
      project: 'Аналітика',
      branch: 'feat/cohorts',
      message: 'chore: оновлено залежності',
      status: STATUS.failed,
      author: 'Ірина Бондар',
      time: '41 хв тому',
    },
    {
      id: 'dpl_8f21',
      project: 'Сайт',
      branch: 'main',
      message: 'docs: сторінка тарифів',
      status: STATUS.live,
      author: 'Андрій Шевчук',
      time: '3 год тому',
    },
    {
      id: 'dpl_8f1c',
      project: 'Платформа оплат',
      branch: 'feat/refunds',
      message: 'feat: часткові повернення',
      status: STATUS.queued,
      author: 'Олена Коваленко',
      time: '5 год тому',
    },
  ]);

  protected readonly projects = [
    {
      name: 'Платформа оплат',
      description: 'Платежі, рахунки та звіти для B2B-клієнтів.',
      status: STATUS.live,
      region: 'eu-central-1',
      updated: '2 хв тому',
    },
    {
      name: 'Мобільний застосунок',
      description: 'iOS та Android для курʼєрів.',
      status: STATUS.building,
      region: 'eu-west-1',
      updated: '9 хв тому',
    },
    {
      name: 'Аналітика',
      description: 'Дашборди, когорти й експорт у CSV.',
      status: STATUS.failed,
      region: 'eu-central-1',
      updated: '41 хв тому',
    },
    {
      name: 'Сайт',
      description: 'Маркетинговий сайт і документація.',
      status: STATUS.live,
      region: 'edge',
      updated: '3 год тому',
    },
  ];

  protected readonly activity: {
    who: string;
    text: string;
    time: string;
    icon: VdIconName;
    tone: 'accent' | 'success' | 'danger' | 'neutral';
  }[] = [
    {
      who: 'Олена',
      text: 'розгорнула «Платформа оплат» у продакшн',
      time: '2 хв',
      icon: 'rocket',
      tone: 'success',
    },
    {
      who: 'CI',
      text: 'збірка «Аналітика» впала на кроці test',
      time: '41 хв',
      icon: 'alert-triangle',
      tone: 'danger',
    },
    {
      who: 'Тарас',
      text: 'запросив Ірину до команди Mobile',
      time: '2 год',
      icon: 'users',
      tone: 'accent',
    },
    {
      who: 'Андрій',
      text: 'змінив домен сайту на vadem.dev',
      time: '3 год',
      icon: 'globe',
      tone: 'neutral',
    },
    {
      who: 'Ірина',
      text: 'створила API-ключ для аналітики',
      time: 'вчора',
      icon: 'key',
      tone: 'neutral',
    },
  ];

  private readonly rollbackDialog = viewChild<VdDialog>('rollback');
  private readonly detailsDrawer = viewChild<VdDialog>('detailsDrawer');
  protected readonly details = signal<Deploy | null>(null);
  private loadTimer?: ReturnType<typeof setTimeout>;

  protected setPeriod(period: Period): void {
    if (period === this.period()) return;
    this.period.set(period);
    // Simulated fetch: shows skeletons in place of the cards.
    this.loading.set(true);
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.loading.set(false), 600);
  }

  protected exportAs(format: string): void {
    this.toaster.show({
      variant: 'info',
      title: `Готуємо ${format}-експорт`,
      description: `Звіт за період «${this.periodLabel()}» надійде на olena@vadem.dev.`,
    });
  }

  protected redeploy(d: Deploy): void {
    this.deploys.update((list) =>
      list.map((x) => (x.id === d.id ? { ...x, status: STATUS.building, time: 'щойно' } : x)),
    );
    this.toaster.success('Розгортання запущено', `${d.project} · ${d.branch}`);
  }

  protected copyId(d: Deploy): void {
    this.toaster.show({ title: 'ID скопійовано', description: d.id });
  }

  protected openDetails(d: Deploy): void {
    this.details.set(d);
    queueMicrotask(() => this.detailsDrawer()?.show());
  }

  protected onDetailsClosed(result: string): void {
    const d = this.details();
    if (result === 'redeploy' && d) this.redeploy(d);
  }

  protected askRollback(d: Deploy): void {
    this.pending.set(d);
    // The dialog is in this template; open it after the menu has closed.
    queueMicrotask(() => this.rollbackDialog()?.show());
  }

  protected onRollback(result: string): void {
    const d = this.pending();
    if (result === 'rollback' && d) {
      this.toaster.show({
        variant: 'warning',
        title: `«${d.project}» відкочено`,
        description: 'Продакшн працює на попередньому розгортанні.',
        action: {
          label: 'Повернути',
          onClick: () => this.toaster.success('Розгортання повернуто'),
        },
      });
    }
    this.pending.set(null);
  }
}
