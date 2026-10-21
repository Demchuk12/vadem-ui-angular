import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-empty-state',
  imports: [VD_CARD, VD_EMPTY_STATE, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Empty state</p>
      <h1>Empty state</h1>
      <p>
        What to show when there is nothing: first run, no results, or all done. Say what happened in
        plain words and offer one next step.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="kinds">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdEmptyState] · icon · slot="actions"</p>
        <h2 id="kinds">Three kinds</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <article vdCard>
          <div vdEmptyState icon="folder">
            <h3 vdEmptyStateTitle>Ще немає проєктів</h3>
            <p vdEmptyStateDescription>
              Створіть перший проєкт або імпортуйте наявний репозиторій.
            </p>
            <div slot="actions">
              <button vdButton variant="primary" size="sm">
                <vd-icon name="plus" slot="start" />Створити проєкт
              </button>
              <button vdButton variant="ghost" size="sm">Імпортувати</button>
            </div>
          </div>
        </article>
        <article vdCard>
          <div vdEmptyState icon="search">
            <h3 vdEmptyStateTitle>Нічого не знайдено</h3>
            <p vdEmptyStateDescription>Немає розгортань за запитом «feat/payments» у гілці main.</p>
            <div slot="actions">
              <button vdButton size="sm">Скинути фільтри</button>
            </div>
          </div>
        </article>
        <article vdCard>
          <div vdEmptyState icon="check-circle">
            <h3 vdEmptyStateTitle>Усе прочитано</h3>
            <p vdEmptyStateDescription>Нові сповіщення з'являться тут.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="small">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size="sm" · no icon</p>
        <h2 id="small">Small, text only</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <div vdEmptyState icon="bell" size="sm">
            <h3 vdEmptyStateTitle>Сповіщень немає</h3>
            <p vdEmptyStateDescription>Ми повідомимо, коли щось зміниться.</p>
          </div>
        </div>
        <div class="demo-panel">
          <div vdEmptyState size="sm">
            <h3 vdEmptyStateTitle>Без іконки</h3>
            <p vdEmptyStateDescription>Для тісних місць: випадаючих списків, бічних панелей.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long text, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <article vdCard>
          <div vdEmptyState icon="credit-card">
            <h3 vdEmptyStateTitle>
              Немає рахунків за обраний період для робочого простору «Платформа оплат»
            </h3>
            <p vdEmptyStateDescription>
              Рахунки формуються першого числа місяця. Якщо ви змінили план посеред місяця,
              перерахунок з'явиться в наступному рахунку разом із пропорційним кредитом.
            </p>
          </div>
        </article>
        <article vdCard dir="rtl" lang="ar">
          <div vdEmptyState icon="folder">
            <h3 vdEmptyStateTitle>لا توجد مشاريع</h3>
            <p vdEmptyStateDescription>أنشئ مشروعك الأول.</p>
            <div slot="actions"><button vdButton variant="primary" size="sm">إنشاء</button></div>
          </div>
        </article>
      </div>
    </section>
  `,
})
export default class EmptyStatePage {}
