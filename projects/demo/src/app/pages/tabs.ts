import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdBadge } from '@vadem/ui/badge';
import { VdChoice } from '@vadem/ui/field';
import { VdSwitch } from '@vadem/ui/switch';
import { VD_TABS } from '@vadem/ui/tabs';

@Component({
  selector: 'demo-tabs',
  imports: [VD_TABS, VdBadge, VdChoice, VdSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Tabs</p>
      <h1>Tabs</h1>
      <p>
        APG tabs with roving focus. Arrows move (mirrored in RTL), Home/End jump, disabled tabs are
        skipped. Two looks: an underline and a segmented control.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="line">
      <div class="demo-section__head">
        <p class="vd-eyebrow">variant="line" · activation="automatic"</p>
        <h2 id="line">Line</h2>
      </div>
      <div class="demo-panel">
        <vd-tabs [(value)]="project">
          <div vdTabList aria-label="Розділи проєкту">
            <button vdTab value="overview">Огляд</button>
            <button vdTab value="deploys">Розгортання <span vdBadge>12</span></button>
            <button vdTab value="logs">Логи</button>
            <button vdTab value="billing" disabled>Оплата</button>
            <button vdTab value="settings">Налаштування</button>
          </div>
          <div vdTabPanel value="overview">
            <p class="demo-muted">Огляд: 3 середовища, останнє розгортання 2 хв тому.</p>
          </div>
          <div vdTabPanel value="deploys">
            <p class="demo-muted">12 розгортань за тиждень, усі успішні.</p>
          </div>
          <div vdTabPanel value="logs">
            <pre><code>[12:04:31] build  ✓ compiled in 2.4s
[12:04:33] deploy ✓ eu-central-1</code></pre>
          </div>
          <div vdTabPanel value="billing"><p>Оплата</p></div>
          <div vdTabPanel value="settings"><p class="demo-muted">Налаштування проєкту.</p></div>
        </vd-tabs>
        <p class="demo-token">value: {{ project() }}</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="pill">
      <div class="demo-section__head">
        <p class="vd-eyebrow">variant="pill"</p>
        <h2 id="pill">Segmented</h2>
        <p>For switching views of the same data. Inner radius = outer radius − padding.</p>
      </div>
      <div class="demo-panel">
        <vd-tabs variant="pill" value="week">
          <div vdTabList aria-label="Період">
            <button vdTab value="day">День</button>
            <button vdTab value="week">Тиждень</button>
            <button vdTab value="month">Місяць</button>
            <button vdTab value="year">Рік</button>
          </div>
          <div vdTabPanel value="day"><p class="demo-metric vd-tabular">1 284</p></div>
          <div vdTabPanel value="week"><p class="demo-metric vd-tabular">8 920</p></div>
          <div vdTabPanel value="month"><p class="demo-metric vd-tabular">37 410</p></div>
          <div vdTabPanel value="year"><p class="demo-metric vd-tabular">402 118</p></div>
        </vd-tabs>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="vertical">
      <div class="demo-section__head">
        <p class="vd-eyebrow">orientation="vertical" · activation="manual"</p>
        <h2 id="vertical">Vertical, manual</h2>
        <p>Up/Down move focus; Enter or Space selects.</p>
      </div>
      <div class="demo-panel">
        <vd-tabs orientation="vertical" activation="manual" value="general">
          <div vdTabList aria-label="Налаштування акаунта">
            <button vdTab value="general">Загальні</button>
            <button vdTab value="security">Безпека</button>
            <button vdTab value="notifications">Сповіщення</button>
            <button vdTab value="integrations">Інтеграції</button>
          </div>
          <div vdTabPanel value="general" class="demo-pane">
            <h3>Загальні</h3>
            <label vdChoice><input type="checkbox" vdSwitch checked />Показувати підказки</label>
          </div>
          <div vdTabPanel value="security" class="demo-pane">
            <h3>Безпека</h3>
            <label vdChoice><input type="checkbox" vdSwitch />Двофакторна автентифікація</label>
          </div>
          <div vdTabPanel value="notifications" class="demo-pane">
            <h3>Сповіщення</h3>
            <p class="demo-muted">Email, push і Telegram.</p>
          </div>
          <div vdTabPanel value="integrations" class="demo-pane">
            <h3>Інтеграції</h3>
            <p class="demo-muted">GitHub, Slack, Linear.</p>
          </div>
        </vd-tabs>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Overflow, RTL</h2>
        <p>Many tabs scroll horizontally; focus keeps the active tab in view.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 20rem">
        <div class="demo-panel demo-narrow">
          <vd-tabs value="m1">
            <div vdTabList aria-label="Місяці">
              @for (m of months; track m; let i = $index) {
                <button vdTab [value]="'m' + i">{{ m }}</button>
              }
            </div>
            @for (m of months; track m; let i = $index) {
              <div vdTabPanel [value]="'m' + i">
                <p class="demo-muted">Звіт за {{ m.toLowerCase() }}.</p>
              </div>
            }
          </vd-tabs>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-tabs value="a">
            <div vdTabList aria-label="الأقسام">
              <button vdTab value="a">نظرة عامة</button>
              <button vdTab value="b">النشر</button>
              <button vdTab value="c">الإعدادات</button>
            </div>
            <div vdTabPanel value="a"><p class="demo-muted">محتوى النظرة العامة</p></div>
            <div vdTabPanel value="b"><p class="demo-muted">محتوى النشر</p></div>
            <div vdTabPanel value="c"><p class="demo-muted">محتوى الإعدادات</p></div>
          </vd-tabs>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-muted {
      color: var(--vd-color-text-muted);
    }
    .demo-metric {
      font-size: var(--vd-text-3xl);
      font-weight: var(--vd-weight-extrabold);
      letter-spacing: var(--vd-tracking-tighter);
    }
    .demo-pane {
      display: grid;
      gap: var(--vd-space-3);
      padding-inline: var(--vd-space-6);
    }
    .demo-pane h3 {
      font-size: var(--vd-text-lg);
    }
    .demo-narrow {
      max-inline-size: 24rem;
    }
  `,
})
export default class TabsPage {
  protected readonly project = signal<string | undefined>('deploys');
  protected readonly months = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ];
}
