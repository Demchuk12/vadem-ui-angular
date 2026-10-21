import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';
import { VdSkeleton } from '@vadem/ui/skeleton';
import { VD_TIMELINE, VdTimelineStatus } from '@vadem/ui/timeline';

@Component({
  selector: 'demo-timeline',
  imports: [VD_TIMELINE, VD_EMPTY_STATE, VdButton, VdSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Timeline</p>
      <h1>Timeline</h1>
      <p>
        A chronological record of events. Native list items preserve reading order; dates, status
        labels and actions belong to the application.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="timeline-activity">
      <div class="demo-section__head">
        <h2 id="timeline-activity">Release history</h2>
        <p>One readable sequence, with explicit status text and optional event details.</p>
      </div>
      <div class="demo-panel demo-timeline-sample">
        <ol vdTimeline label="Історія публікації VA-24">
          @for (event of events; track event.datetime) {
            <li vdTimelineItem [status]="event.status" [statusLabel]="event.statusLabel">
              <time vdTimelineTime [attr.datetime]="event.datetime">{{ event.time }}</time>
              <h3 vdTimelineTitle>{{ event.title }}</h3>
              <p vdTimelineDescription>{{ event.description }}</p>
              @if (event.status === 'success') {
                <div class="demo-timeline-extra">
                  <div class="demo-timeline-actions">
                    <button
                      vdButton
                      variant="secondary"
                      size="sm"
                      [attr.aria-expanded]="details()"
                      aria-controls="timeline-release-details"
                      (click)="details.set(!details())"
                    >
                      Переглянути зміни
                    </button>
                  </div>
                  <p id="timeline-release-details" [hidden]="!details()" vdTimelineDescription>
                    Виправлено пошук проєктів і додано українські підказки для швидких дій.
                  </p>
                </div>
              }
            </li>
          }
        </ol>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="timeline-content">
      <div class="demo-section__head">
        <h2 id="timeline-content">Real content and direction</h2>
        <p>
          Long Ukrainian labels wrap. RTL follows the document direction without reversing data.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: min(20rem, 100%)">
        <div class="demo-panel">
          <ol vdTimeline label="Історія погодження документів">
            <li vdTimelineItem status="info" statusLabel="На перевірці у відповідальної команди">
              <time vdTimelineTime datetime="2026-10-08T10:05:00+03:00">8 жовтня, 10:05</time>
              <h3 vdTimelineTitle>
                Передано всі супровідні документи для погодження міжнародної співпраці
              </h3>
              <p vdTimelineDescription>
                Договір, додатки та підтвердження реквізитів отримали відповідальні учасники
                фінансової й юридичної команд. Наступне оновлення з’явиться після їхньої перевірки.
              </p>
            </li>
            <li vdTimelineItem status="success" statusLabel="Погоджено">
              <h3 vdTimelineTitle>Готово</h3>
            </li>
          </ol>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <ol vdTimeline label="سجل تحديثات المشروع">
            <li vdTimelineItem status="info" statusLabel="تحديث">
              <time vdTimelineTime datetime="2026-10-08T11:00:00+03:00">٨ أكتوبر، ١١:٠٠</time>
              <h3 vdTimelineTitle>تمت إضافة أعضاء الفريق إلى مساحة العمل</h3>
              <p vdTimelineDescription>يمكن للفريق الآن مراجعة المستندات والتعاون في المشروع.</p>
            </li>
            <li vdTimelineItem status="success" statusLabel="مكتمل">
              <time vdTimelineTime datetime="2026-10-08T11:30:00+03:00">٨ أكتوبر، ١١:٣٠</time>
              <h3 vdTimelineTitle>تم نشر التحديث</h3>
              <p vdTimelineDescription>جميع التغييرات متاحة للفريق.</p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="timeline-composition">
      <div class="demo-section__head">
        <h2 id="timeline-composition">Single, empty and loading</h2>
        <p>Empty state and Skeleton are composed outside the event list.</p>
      </div>
      <div class="demo-grid" style="--demo-min: min(18rem, 100%)">
        <div class="demo-panel">
          <h3 class="demo-timeline-example-title">Single event</h3>
          <ol vdTimeline label="Історія нового проєкту">
            <li vdTimelineItem statusLabel="Створено">
              <h4 vdTimelineTitle>Проєкт VA-25</h4>
            </li>
          </ol>
        </div>
        <div class="demo-panel">
          <h3 class="demo-timeline-example-title">Empty history</h3>
          <div vdEmptyState size="sm" icon="folder">
            <h4 vdEmptyStateTitle>Подій ще немає</h4>
            <p vdEmptyStateDescription>Зміни проєкту з’являться тут після першої дії.</p>
          </div>
        </div>
        <div class="demo-panel">
          <h3 class="demo-timeline-example-title">Loading history</h3>
          <p role="status" class="demo-timeline-loading-label">Завантажуємо історію…</p>
          <div
            role="region"
            aria-busy="true"
            aria-label="Завантаження історії"
            class="demo-timeline-loading"
          >
            <div vdSkeleton class="demo-timeline-skeleton"></div>
            <div vdSkeleton class="demo-timeline-skeleton"></div>
            <div vdSkeleton class="demo-timeline-skeleton"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-timeline-sample {
      max-inline-size: 44rem;
    }
    .demo-timeline-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-2);
    }
    .demo-timeline-actions .vd-button {
      max-inline-size: 100%;
      white-space: normal;
    }
    .demo-timeline-extra {
      display: grid;
      gap: var(--vd-space-2);
    }
    .demo-timeline-example-title {
      margin-block-end: var(--vd-space-5);
      font-size: var(--vd-text-sm);
    }
    .demo-timeline-loading-label {
      margin-block-end: var(--vd-space-4);
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-timeline-loading {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-timeline-skeleton {
      block-size: var(--vd-space-8);
    }
  `,
})
export default class TimelinePage {
  protected readonly details = signal(false);
  protected readonly events: readonly {
    status: VdTimelineStatus;
    statusLabel: string;
    datetime: string;
    time: string;
    title: string;
    description: string;
  }[] = [
    {
      status: 'neutral',
      statusLabel: 'Створено',
      datetime: '2026-10-08T08:40:00+03:00',
      time: '8 жовтня, 08:40',
      title: 'Підготовлено випуск VA-24',
      description: 'Олена зібрала зміни та передала їх на перевірку.',
    },
    {
      status: 'info',
      statusLabel: 'Оновлено',
      datetime: '2026-10-08T09:00:00+03:00',
      time: '8 жовтня, 09:00',
      title: 'Додано український переклад',
      description: 'Назви дій і підказки тепер доступні українською.',
    },
    {
      status: 'warning',
      statusLabel: 'Потребує уваги',
      datetime: '2026-10-08T09:12:00+03:00',
      time: '8 жовтня, 09:12',
      title: 'Виявлено неповні дані про автора',
      description: 'До публікації потрібно додати контакт відповідального учасника.',
    },
    {
      status: 'danger',
      statusLabel: 'Помилка перевірки',
      datetime: '2026-10-08T09:18:00+03:00',
      time: '8 жовтня, 09:18',
      title: 'Публікацію призупинено',
      description: 'Контакт не пройшов перевірку. Марко виправив адресу й повторив перевірку.',
    },
    {
      status: 'success',
      statusLabel: 'Опубліковано',
      datetime: '2026-10-08T09:24:00+03:00',
      time: '8 жовтня, 09:24',
      title: 'Оновлення доступне всій команді',
      description: 'Повторна перевірка успішна. Випуск VA-24 завершено.',
    },
  ];
}
