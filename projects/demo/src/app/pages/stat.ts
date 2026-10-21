import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VdStat } from '@vadem/ui/stat';

@Component({
  selector: 'demo-stat',
  imports: [VD_CARD, VdButton, VdStat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Stat</p>
      <h1>Stat</h1>
      <p>
        A key figure with its change. The direction is spoken ("Increase"), colour only says whether
        it is good news, so falling errors can be green. Values arrive formatted by your app.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="stat-sentiment">
      <div class="demo-section__head">
        <h2 id="stat-sentiment">Trend and sentiment</h2>
        <p>Sentiment defaults from the trend; set it when down is good.</p>
      </div>
      <div class="demo-stat-grid">
        <article vdCard>
          <vd-stat label="Дохід" value="₴ 48 920" delta="+12,4%" caption="проти минулого тижня" />
        </article>
        <article vdCard>
          <vd-stat
            label="Помилки 5xx"
            value="0,21%"
            delta="−0,05"
            trend="down"
            sentiment="positive"
            caption="від усіх запитів"
          />
        </article>
        <article vdCard>
          <vd-stat
            label="Відтік клієнтів"
            value="3,8%"
            delta="+0,6"
            caption="за місяць"
            sentiment="negative"
          />
        </article>
        <article vdCard>
          <vd-stat
            label="Час відповіді"
            value="182 мс"
            delta="0 мс"
            trend="flat"
            caption="медіана"
          />
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="stat-states">
      <div class="demo-section__head">
        <h2 id="stat-states">Loading, small, long content</h2>
      </div>
      <div class="demo-stat-grid">
        <article vdCard>
          <vd-stat
            label="Активні користувачі"
            [value]="loading() ? '' : '8 920'"
            delta="+3,1%"
            [loading]="loading()"
          />
          <button vdButton size="sm" variant="secondary" (click)="loading.set(!loading())">
            {{ loading() ? 'Показати дані' : 'Показати завантаження' }}
          </button>
        </article>
        <article vdCard>
          <vd-stat size="sm" label="Розгортання" value="64" delta="+8" caption="98,4% успішних" />
        </article>
        <article vdCard>
          <vd-stat
            label="Середня тривалість збірки фронтенду для мобільного застосунку"
            value="12 хв 48 с"
            delta="−1 хв 12 с"
            trend="down"
            sentiment="positive"
            caption="після переходу на кешування залежностей у CI"
          />
        </article>
        <article vdCard>
          <vd-stat label="Без зміни" value="1 024" />
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="stat-rtl">
      <div class="demo-section__head">
        <h2 id="stat-rtl">RTL</h2>
        <p>Numbers keep their order; values with Arabic letters stay right-to-left.</p>
      </div>
      <div class="demo-stat-grid" dir="rtl" lang="ar">
        <article vdCard>
          <vd-stat
            label="الإيرادات"
            value="48&nbsp;920 ر.س"
            delta="+12,4%"
            caption="مقارنة بالأسبوع الماضي"
            increaseLabel="ارتفاع"
          />
        </article>
        <article vdCard>
          <vd-stat
            label="الطلبات"
            value="₴&nbsp;1&nbsp;280"
            delta="−4%"
            trend="down"
            decreaseLabel="انخفاض"
          />
        </article>
      </div>
    </section>
  `,
  styles: `
    .demo-stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
      gap: var(--vd-space-4);
    }
    .demo-stat-grid .vd-button {
      justify-self: start;
    }
  `,
})
export default class StatPage {
  protected readonly loading = signal(false);
}
