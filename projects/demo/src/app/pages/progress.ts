import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VdMeter, VdProgress, VdProgressRing, VdProgressVariant } from '@vadem/ui/progress';

@Component({
  selector: 'demo-progress',
  imports: [VD_CARD, VdButton, VdMeter, VdProgress, VdProgressRing],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Progress · Meter</p>
      <h1>Progress, Spinner & Meter</h1>
      <p>
        Native <code>&lt;progress&gt;</code> for how far a task has got, and
        <code>&lt;meter&gt;</code> for a value in a known range. Labels and values stay native; the
        meter colors itself from <code>low</code>, <code>high</code> and <code>optimum</code>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="progress">
      <div class="demo-section__head">
        <p class="vd-eyebrow">progress[vdProgress] · variant · size</p>
        <h2 id="progress">Progress</h2>
      </div>
      <div class="demo-panel demo-stack">
        <div class="demo-labelled">
          <div class="demo-labelled__head">
            <label for="upload">Завантаження «звіт-жовтень.csv»</label>
            <span class="vd-tabular">{{ upload() }}%</span>
          </div>
          <progress id="upload" vdProgress max="100" [value]="upload()">{{ upload() }}%</progress>
        </div>
        <div>
          <button vdButton size="sm" (click)="run()" [disabled]="running()">
            {{ upload() === 100 ? 'Ще раз' : 'Почати' }}
          </button>
        </div>

        @for (v of variants; track v) {
          <div class="demo-labelled">
            <div class="demo-labelled__head">
              <label [for]="'v-' + v" class="demo-token">variant="{{ v }}"</label>
            </div>
            <progress [id]="'v-' + v" vdProgress [variant]="v" value="64" max="100"></progress>
          </div>
        }
        <div class="demo-labelled">
          <div class="demo-labelled__head">
            <label for="small" class="demo-token">size="sm"</label>
          </div>
          <progress id="small" vdProgress size="sm" value="30" max="100"></progress>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="indeterminate">
      <div class="demo-section__head">
        <p class="vd-eyebrow">:indeterminate</p>
        <h2 id="indeterminate">Indeterminate</h2>
        <p>No value: the amount of work is unknown. Under reduced motion it is a steady bar.</p>
      </div>
      <div class="demo-panel demo-labelled">
        <div class="demo-labelled__head">
          <label for="sync">Синхронізація з бухгалтерським обліком…</label>
        </div>
        <progress id="sync" vdProgress></progress>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="ring">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-progress-ring</p>
        <h2 id="ring">Progress ring and spinner</h2>
        <p>
          Without a value it is a spinner. With reduced motion it stops and becomes a dashed ring,
          so it reads as waiting rather than a quarter done.
        </p>
      </div>
      <div class="demo-panel demo-ring-grid">
        <div class="demo-ring-cell">
          <vd-progress-ring size="sm" />
          <vd-progress-ring />
          <vd-progress-ring size="lg" />
          <span>Spinner · sm, md, lg</span>
        </div>
        <div class="demo-ring-cell">
          <vd-progress-ring [value]="0" label="Імпорт" />
          <vd-progress-ring [value]="upload()" label="Імпорт" />
          <vd-progress-ring [value]="upload()" size="lg" label="Імпорт" showValue />
          <span>Determinate · {{ upload() }}% (follows the upload above)</span>
        </div>
        <div class="demo-ring-cell">
          <vd-progress-ring [value]="100" variant="success" label="Готово" showValue size="lg" />
          <vd-progress-ring [value]="62" variant="warning" label="Квота" showValue size="lg" />
          <vd-progress-ring [value]="93" variant="danger" label="Диск" showValue size="lg" />
          <span>Variants</span>
        </div>
        <div class="demo-ring-cell" role="status">
          <vd-progress-ring size="sm" label="Збереження змін" />
          <span>Збереження змін…</span>
        </div>
        <div class="demo-ring-cell" dir="rtl" lang="ar">
          <vd-progress-ring [value]="40" size="lg" label="التحميل" showValue />
          <span>RTL fills counter-clockwise</span>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="meter">
      <div class="demo-section__head">
        <p class="vd-eyebrow">meter[vdMeter] · low · high · optimum</p>
        <h2 id="meter">Meter</h2>
        <p>
          Quota: low = 70, high = 90, optimum = 0. Accent while fine, then warning, then danger.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: 16rem">
        @for (q of quotas; track q.label) {
          <article vdCard>
            <div class="demo-labelled">
              <div class="demo-labelled__head">
                <label [for]="q.id">{{ q.label }}</label>
                <span class="vd-tabular demo-strong">{{ q.value }}%</span>
              </div>
              <meter
                [id]="q.id"
                vdMeter
                min="0"
                max="100"
                low="70"
                high="90"
                optimum="0"
                [value]="q.value"
              ></meter>
              <p class="demo-muted">{{ q.note }}</p>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel demo-labelled">
          <div class="demo-labelled__head">
            <label for="long">Перенесення архіву проєктів з минулого робочого простору</label>
            <span class="vd-tabular">3 / 12</span>
          </div>
          <progress id="long" vdProgress value="3" max="12"></progress>
        </div>
        <div class="demo-panel demo-labelled" dir="rtl" lang="ar">
          <div class="demo-labelled__head">
            <label for="rtl">التخزين</label>
            <span class="vd-tabular">45%</span>
          </div>
          <meter
            id="rtl"
            vdMeter
            min="0"
            max="100"
            low="70"
            high="90"
            optimum="0"
            value="45"
          ></meter>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-ring-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
      gap: var(--vd-space-8);
    }
    .demo-ring-cell {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-4);
    }
    .demo-ring-cell > span {
      flex-basis: 100%;
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-stack {
      display: grid;
      gap: var(--vd-space-5);
    }
    .demo-labelled {
      display: grid;
      gap: var(--vd-space-2);
    }
    .demo-labelled__head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--vd-space-3);
      font-size: var(--vd-text-sm);
    }
    .demo-labelled__head label {
      font-weight: var(--vd-weight-medium);
    }
    .demo-labelled__head > span {
      white-space: nowrap;
    }
    .demo-strong {
      font-weight: var(--vd-weight-bold);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-xs);
    }
  `,
})
export default class ProgressPage {
  protected readonly variants: VdProgressVariant[] = ['accent', 'success', 'warning', 'danger'];
  protected readonly upload = signal(40);
  protected readonly running = signal(false);
  protected readonly quotas = [
    { id: 'q1', label: 'Сховище', value: 42, note: '4,2 з 10 ГБ' },
    { id: 'q2', label: 'Хвилини збірки', value: 78, note: '3 120 з 4 000 хв' },
    { id: 'q3', label: 'Запити до API', value: 96, note: 'Ліміт майже вичерпано' },
  ];

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected run(): void {
    this.upload.set(0);
    this.running.set(true);
    this.timer = setInterval(() => {
      const next = Math.min(100, this.upload() + 7);
      this.upload.set(next);
      if (next === 100) {
        clearInterval(this.timer);
        this.running.set(false);
      }
    }, 180);
  }
}
