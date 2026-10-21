import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdDescriptionList } from '@vadem/ui/description-list';
import { VdRelativeTime, VdRelativeTimePipe } from '@vadem/ui/relative-time';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VD_TIMELINE } from '@vadem/ui/timeline';
import { VdTable, VdTableScroll } from '@vadem/ui/table';

const REFERENCE = Date.parse('2026-10-18T12:00:00Z');
@Component({
  imports: [
    VdButton,
    VdDescriptionList,
    VdRelativeTime,
    VdRelativeTimePipe,
    VD_TIMELINE,
    VdTable,
    VdTableScroll,
  ],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Relative time</h1>
      <p>«Щойно», «5 хвилин тому» або «через 2 години» для подій і сповіщень.</p>
    </header>
    <section class="demo-section" aria-labelledby="relative-clock">
      <div class="demo-section__head">
        <h2 id="relative-clock">Один момент відліку</h2>
        <p>
          Приклад починається 18 жовтня 2026 року о 12:00 UTC. Змініть відлік, щоб оновити підписи.
        </p>
      </div>
      <dl vdDescriptionList>
        <div>
          <dt>Поточний відлік (UTC)</dt>
          <dd>
            <time data-testid="reference" [attr.datetime]="referenceIso()"
              ><bdi>{{ referenceText() }}</bdi></time
            >
          </dd>
        </div>
        <div>
          <dt>Останнє оновлення</dt>
          <dd>
            <time data-testid="main-relative" [vdRelativeTime]="base - 300000" [now]="now()"></time>
          </dd>
        </div>
      </dl>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="now.update(addMinute)">Додати хвилину</button>
        <button vdButton variant="secondary" (click)="now.set(base)">Відновити відлік</button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="relative-timeline">
      <div class="demo-section__head"><h2 id="relative-timeline">Події зміни</h2></div>
      <ol vdTimeline label="Події виробничої зміни">
        <li vdTimelineItem status="success" statusLabel="Збережено">
          <time
            vdTimelineTime
            [vdRelativeTime]="base - 2000"
            [now]="now()"
            data-testid="recent"
          ></time>
          <h3 vdTimelineTitle>Звіт збережено</h3>
          <p vdTimelineDescription>18 жовтня 2026, 11:59:58 UTC</p>
        </li>
        <li vdTimelineItem status="info" statusLabel="Заплановано">
          <time
            vdTimelineTime
            [vdRelativeTime]="base + 7200000"
            [now]="now()"
            data-testid="future"
          ></time>
          <h3 vdTimelineTitle>Перевірка виробничої дільниці та супровідних документів їєіґ</h3>
          <p vdTimelineDescription>18 жовтня 2026, 14:00:00 UTC</p>
        </li>
      </ol>
    </section>
    <section class="demo-section" aria-labelledby="relative-states">
      <div class="demo-section__head">
        <h2 id="relative-states">Давні та невідомі події</h2>
        <p>Місяці й роки — наближені проміжки: 30 і 365 днів.</p>
      </div>
      <div vdTableScroll tabindex="0" role="region" aria-label="Приклади відносного часу">
        <table vdTable>
          <caption>
            Час оновлення документів
          </caption>
          <thead>
            <tr>
              <th scope="col">Документ</th>
              <th scope="col">Оновлено</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Протокол перевірки</td>
              <td><time [vdRelativeTime]="base - 86400000" [now]="now()"></time></td>
            </tr>
            <tr>
              <td>Архів за минулий місяць</td>
              <td><time [vdRelativeTime]="base - 2592000000" [now]="now()"></time></td>
            </tr>
            <tr>
              <td>Дата не вказана</td>
              <td><time data-testid="unknown" [vdRelativeTime]="null" [now]="now()"></time></td>
            </tr>
            <tr>
              <td>Некоректний час</td>
              <td><time data-testid="invalid" [vdRelativeTime]="invalid" [now]="now()"></time></td>
            </tr>
            <tr>
              <td lang="en">English label</td>
              <td lang="en">
                <time [vdRelativeTime]="base - 300000" [now]="now()" locale="en"></time>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="relative-rtl">
      <div class="demo-section__head"><h2 id="relative-rtl">آخر تحديث</h2></div>
      <p>
        تقرير الإنتاج:
        <time
          data-testid="rtl-time"
          [vdRelativeTime]="base - 300000"
          [now]="now()"
          locale="ar"
        ></time>
      </p>
      <p>
        وقت الحفظ:
        <time [vdRelativeTime]="base - 2000" [now]="now()" locale="ar" justNowText="الآن"></time>
      </p>
      <p>
        الوقت غير متاح:
        <time [vdRelativeTime]="null" [now]="now()" unknownText="الوقت غير معروف"></time>
      </p>
    </section>
    <section class="demo-section" aria-labelledby="relative-pipe">
      <div class="demo-section__head"><h2 id="relative-pipe">Текст у повідомленні</h2></div>
      <p>
        {{ 'Синхронізація завершена ' }}
        <bdi data-testid="pipe">{{ base - 3600000 | vdRelativeTime: now() }}</bdi
        >.
      </p>
    </section>
  `,
})
export default class RelativeTimePage {
  protected readonly base = REFERENCE;
  protected readonly now = signal(REFERENCE);
  protected readonly invalid = NaN;
  protected readonly addMinute = (value: number) => value + 60000;
  protected referenceIso(): string {
    return new Date(this.now()).toISOString();
  }
  protected referenceText(): string {
    return (
      new Intl.DateTimeFormat('uk', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'UTC',
      }).format(this.now()) + ' UTC'
    );
  }
}
