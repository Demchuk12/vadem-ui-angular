import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdBadge, VdBadgeVariant } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VdIcon } from '@vadem/ui/icon';
import { VdSkeleton } from '@vadem/ui/skeleton';

interface Project {
  name: string;
  description: string;
  status: { label: string; variant: VdBadgeVariant };
  stack: string;
  updated: string;
}

@Component({
  selector: 'demo-card',
  imports: [VD_CARD, VdBadge, VdButton, VdIcon, VdSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Badge · Card · Skeleton</p>
      <h1>Badge & Card</h1>
      <p>
        Badges use the mono eyebrow style. Cards carry the top highlight and concentric radii;
        interactive cards add the cursor glow. Move the pointer over the project cards.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="badges">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdBadge]</p>
        <h2 id="badges">Badges</h2>
      </div>
      <div class="demo-panel demo-stack">
        <div class="demo-row">
          @for (v of badgeVariants; track v) {
            <span vdBadge [variant]="v">{{ v }}</span>
          }
        </div>
        <div class="demo-row">
          <span vdBadge variant="success" dot>Активний</span>
          <span vdBadge variant="warning" dot>Очікує оплати</span>
          <span vdBadge variant="danger" dot>Збій</span>
          <span vdBadge variant="info" dot>Розгортається</span>
          <span vdBadge dot>Архів</span>
        </div>
        <div class="demo-row">
          <span vdBadge variant="accent"><vd-icon name="check" />Перевірено</span>
          <span vdBadge>v0.0.1</span>
          <span vdBadge>12 / 128</span>
          <span vdBadge variant="accent">Beta</span>
          <button vdButton size="sm">Вхідні <span vdBadge variant="accent">24</span></button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="static">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdCard] · variant</p>
        <h2 id="static">Cards</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <article vdCard>
          <header vdCardHeader>
            <h3 vdCardTitle>Використання</h3>
            <p vdCardDescription>Жовтень 2026 · робочий простір Vadem</p>
            <span vdBadge variant="success" dot>У межах</span>
          </header>
          <p class="demo-metric vd-tabular">₴ 12 480,00</p>
          <p class="demo-muted">72% від місячного ліміту. Наступне списання 1 листопада.</p>
          <footer vdCardFooter>
            <button vdButton size="sm">Деталі</button>
            <button vdButton size="sm" variant="ghost">Змінити план</button>
          </footer>
        </article>
        <article vdCard variant="raised">
          <header vdCardHeader>
            <h3 vdCardTitle>Raised</h3>
            <p vdCardDescription>Світліша поверхня і середня тінь — для акцентних блоків.</p>
          </header>
          <div class="demo-inner">
            <span class="vd-eyebrow">concentric</span>
            <p class="demo-muted">Внутрішній радіус = радіус картки − padding.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="interactive">
      <div class="demo-section__head">
        <p class="vd-eyebrow">interactive · vdCardLink</p>
        <h2 id="interactive">Interactive cards</h2>
        <p>One tab stop per card (stretched link); inner buttons stay clickable.</p>
      </div>
      <ul class="demo-grid demo-cards" style="--demo-min: 17rem" role="list">
        @for (p of projects; track p.name) {
          <li vdCard interactive>
            <header vdCardHeader>
              <h3 vdCardTitle>
                <a vdCardLink href="#interactive">{{ p.name }}</a>
              </h3>
              <span vdBadge [variant]="p.status.variant" dot>{{ p.status.label }}</span>
            </header>
            <p class="demo-muted">{{ p.description }}</p>
            <footer vdCardFooter class="demo-meta">
              <span class="vd-eyebrow">{{ p.stack }}</span>
              <span class="vd-eyebrow">· {{ p.updated }}</span>
              <button
                vdButton
                size="sm"
                variant="ghost"
                iconOnly
                class="demo-push"
                [attr.aria-label]="'Копіювати посилання на ' + p.name"
              >
                <vd-icon name="copy" />
              </button>
            </footer>
          </li>
        }
        <li class="demo-cards__item">
          <a vdCard href="#interactive" class="demo-new">
            <vd-icon name="plus" />
            <span class="vd-card__title">Новий проєкт</span>
            <span class="demo-muted">Шаблон або з нуля</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">loading · empty</p>
        <h2 id="states">Loading and empty</h2>
        <p>Skeletons keep the layout; the card announces itself as busy.</p>
      </div>
      <div>
        <button vdButton size="sm" (click)="loading.set(!loading())">
          {{ loading() ? 'Показати дані' : 'Показати завантаження' }}
        </button>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <article vdCard [attr.aria-busy]="loading()">
          @if (loading()) {
            <div vdSkeleton class="demo-sk-title"></div>
            <div vdSkeleton class="demo-sk-text"></div>
            <div vdSkeleton class="demo-sk-metric"></div>
            <div vdSkeleton></div>
            <div vdSkeleton class="demo-sk-short"></div>
          } @else {
            <header vdCardHeader>
              <h3 vdCardTitle>Активні користувачі</h3>
              <p vdCardDescription>Останні 7 днів</p>
            </header>
            <p class="demo-metric vd-tabular">1 284</p>
            <p class="demo-muted">+12% порівняно з попереднім тижнем.</p>
          }
        </article>
        <article vdCard class="demo-empty">
          <span class="demo-empty__icon"><vd-icon name="search" /></span>
          <h3 vdCardTitle>Тут поки порожньо</h3>
          <p class="demo-muted">Створіть перший проєкт — це займе менше хвилини.</p>
          <div>
            <button vdButton variant="primary" size="sm">
              <vd-icon name="plus" slot="start" />Створити проєкт
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long content, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <article vdCard interactive>
          <header vdCardHeader>
            <h3 vdCardTitle>
              <a vdCardLink href="#content"
                >Міграція платіжного шлюзу на нову версію API з підтримкою гривні</a
              >
            </h3>
            <span vdBadge variant="warning" dot>Очікує рев'ю</span>
          </header>
          <p class="demo-muted">
            Довгі заголовки балансуються; якщо місця замало, бейдж переноситься під заголовок.
          </p>
        </article>
        <article vdCard interactive dir="rtl" lang="ar">
          <header vdCardHeader>
            <h3 vdCardTitle><a vdCardLink href="#content">لوحة التحكم</a></h3>
            <span vdBadge variant="success" dot>نشط</span>
          </header>
          <p class="demo-muted">تحديث منذ ساعتين</p>
        </article>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-metric {
      font-size: var(--vd-text-3xl);
      font-weight: var(--vd-weight-extrabold);
      letter-spacing: var(--vd-tracking-tighter);
      line-height: var(--vd-leading-tight);
    }
    .demo-inner {
      display: grid;
      gap: var(--vd-space-1);
      padding: var(--vd-space-4);
      border-radius: var(--vd-card-inner-radius);
      background: var(--vd-color-surface-sunken);
      border: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-cards {
      padding: 0;
    }
    .demo-cards__item {
      display: grid;
    }
    .demo-meta {
      gap: var(--vd-space-1-5);
    }
    .demo-push {
      margin-inline-start: auto;
    }
    .demo-new {
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--vd-space-1);
      color: var(--vd-color-text-muted);
      border-style: dashed;
    }
    .demo-new .vd-icon {
      --vd-icon-size: var(--vd-space-6);
      margin-block-end: var(--vd-space-2);
    }
    .demo-sk-title {
      inline-size: 55%;
      block-size: var(--vd-space-5);
    }
    .demo-sk-text {
      inline-size: 35%;
    }
    .demo-sk-metric {
      inline-size: 45%;
      block-size: var(--vd-space-10);
    }
    .demo-sk-short {
      inline-size: 70%;
    }
    .demo-empty {
      align-items: center;
      text-align: center;
      justify-content: center;
    }
    .demo-empty__icon {
      display: grid;
      place-items: center;
      inline-size: var(--vd-space-12);
      block-size: var(--vd-space-12);
      border-radius: var(--vd-radius-full);
      background: var(--vd-color-action-subtle);
      color: var(--vd-color-text-accent);
    }
  `,
})
export default class CardPage {
  protected readonly badgeVariants: VdBadgeVariant[] = [
    'neutral',
    'accent',
    'success',
    'warning',
    'danger',
    'info',
  ];
  protected readonly loading = signal(true);
  protected readonly projects: Project[] = [
    {
      name: 'Платформа оплат',
      description: 'Платежі, рахунки та звіти для B2B-клієнтів.',
      status: { label: 'Активний', variant: 'success' },
      stack: 'Angular · Nest',
      updated: '2 год тому',
    },
    {
      name: 'Мобільний застосунок',
      description: 'iOS та Android для курʼєрів.',
      status: { label: 'Розгортається', variant: 'info' },
      stack: 'React Native',
      updated: '5 хв тому',
    },
    {
      name: 'Аналітика',
      description: 'Дашборди, когорти й експорт у CSV.',
      status: { label: 'Збій', variant: 'danger' },
      stack: 'Svelte · Go',
      updated: 'вчора',
    },
  ];
}
