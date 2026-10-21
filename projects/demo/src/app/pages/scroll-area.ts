import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdInput } from '@vadem/ui/input';
import { VdField } from '@vadem/ui/field';
import { VdScrollArea } from '@vadem/ui/scroll-area';
import { VD_SPLITTER } from '@vadem/ui/splitter';
import { VdTable } from '@vadem/ui/table';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';

@Component({
  selector: 'demo-scroll-area',
  imports: [VdScrollArea, VdButton, VdInput, VdField, VD_SPLITTER, VdTable, VD_EMPTY_STATE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-scroll-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-scroll-stack .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-scroll-viewport {
      block-size: 18rem;
    }
    .demo-scroll-content {
      padding: var(--vd-space-4);
      overflow-wrap: anywhere;
    }
    .demo-scroll-content > * + * {
      margin-block-start: var(--vd-space-4);
    }
    .demo-scroll-list {
      list-style: none;
      padding: 0;
    }
    .demo-scroll-list li {
      display: grid;
      gap: var(--vd-space-1);
      padding-block: var(--vd-space-3);
    }
    .demo-scroll-list li + li {
      border-block-start: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-scroll-list time {
      font-family: var(--vd-font-mono);
      font-size: var(--vd-text-sm);
      color: var(--vd-color-text-muted);
    }
    .demo-scroll-strip {
      display: flex;
      gap: var(--vd-space-4);
      padding: var(--vd-space-4);
      inline-size: max-content;
    }
    .demo-scroll-strip article {
      inline-size: 15rem;
      max-inline-size: 60vw;
      overflow-wrap: anywhere;
    }
    .demo-scroll-strip h3 {
      font-size: var(--vd-text-lg);
    }
    .demo-scroll-wide {
      min-inline-size: 48rem;
    }
    .demo-scroll-workspace {
      block-size: 22rem;
    }
    .demo-scroll-workspace .vd-scroll-area {
      --vd-scroll-area-radius: var(--vd-radius-xs);
    }
    .demo-scroll-content :is(input, button) {
      max-inline-size: 100%;
      min-inline-size: 0;
    }
    .demo-scroll-content button {
      overflow-wrap: anywhere;
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Scroll area</p>
      <h1>Scroll area</h1>
      <p>
        Keep long content within reach. Native scrolling, a clear keyboard target and familiar
        browser behavior.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="scroll-activity-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Activity</p>
        <h2 id="scroll-activity-title">Review the whole conversation</h2>
        <p>
          Tab into the area, then use arrows or Page Down. Tab again to reach the actions inside.
        </p>
      </div>
      <div class="demo-panel demo-scroll-stack">
        <div
          vdScrollArea
          label="Історія змін"
          aria-labelledby="scroll-activity-title"
          class="demo-scroll-viewport"
          data-testid="scroll-activity"
        >
          <div class="demo-scroll-content">
            <ol class="demo-scroll-list">
              @for (event of events; track $index) {
                <li>
                  <time [attr.datetime]="event.date">{{ event.time }}</time>
                  <strong>{{ event.title }}</strong>
                  <p>{{ event.description }}</p>
                </li>
              }
            </ol>
            <button vdButton variant="secondary" type="button" (click)="reviewed.set(!reviewed())">
              Позначити переглянутим
            </button>
          </div>
        </div>
        <p class="demo-token" role="status">
          {{ reviewed() ? 'Історію переглянуто' : 'Є зміни для перегляду' }}
        </p>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="scroll-horizontal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Horizontal</p>
        <h2 id="scroll-horizontal-title">Keep related work on one line</h2>
      </div>
      <div vdScrollArea label="Робочі напрями" data-testid="scroll-horizontal">
        <div class="demo-scroll-strip">
          @for (project of projects; track project) {
            <article>
              <h3>{{ project }}</h3>
              <p>Матеріали української команди та останні зміни робочого простору.</p>
            </article>
          }
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="scroll-table-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Both axes</p>
        <h2 id="scroll-table-title">Inspect every row and column</h2>
      </div>
      <div
        vdScrollArea
        label="Журнал документів"
        aria-labelledby="scroll-table-title"
        class="demo-scroll-viewport"
        data-testid="scroll-table"
      >
        <table vdTable class="demo-scroll-wide">
          <caption>
            Документи української команди
          </caption>
          <thead>
            <tr>
              <th scope="col">Документ</th>
              <th scope="col">Відповідальний</th>
              <th scope="col">Стан</th>
              <th scope="col">Оновлено</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.id) {
              <tr>
                <th scope="row">{{ row.title }}</th>
                <td>{{ row.owner }}</td>
                <td>{{ row.status }}</td>
                <td>{{ row.updated }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="scroll-states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Content states</p>
        <h2 id="scroll-states-title">No overflow, no extra controls</h2>
      </div>
      <div class="demo-grid demo-scroll-stack" style="--demo-min: 22rem">
        <div vdScrollArea label="Коротка нотатка" data-testid="scroll-short">
          <div class="demo-scroll-content">
            <p>Усі зміни збережено. Наступний перегляд — у четвер.</p>
          </div>
        </div>
        <div vdScrollArea label="Черга повідомлень" data-testid="scroll-empty">
          <div vdEmptyState size="sm">
            <h3 vdEmptyStateTitle>Нових повідомлень поки немає</h3>
            <p vdEmptyStateDescription>Тут з’являться наступні оновлення робочого простору.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="scroll-workspace-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Splitter composition</p>
        <h2 id="scroll-workspace-title">One viewport per pane</h2>
      </div>
      <div class="demo-panel demo-scroll-stack">
        <div vdSplitter class="demo-scroll-workspace" [value]="45" [min]="25" [max]="75">
          <section vdSplitterPane vdScrollArea label="Нотатки команди" data-testid="scroll-pane">
            <div class="demo-scroll-content">
              <h3>Нотатки команди</h3>
              <vd-field label="Пошук у нотатках"
                ><input vdInput placeholder="Назва або фраза"
              /></vd-field>
              @for (event of events; track $index) {
                <p>{{ event.description }}</p>
              }
            </div>
          </section>
          <div vdSplitterHandle label="Нотатки команди"></div>
          <section vdSplitterPane vdScrollArea label="Деталі документа">
            <div class="demo-scroll-content">
              <h3>Деталі документа</h3>
              @for (project of projects; track project) {
                <h4>{{ project }}</h4>
                <p>
                  Перевірте доступність для всіх учасників, зокрема і, ї, є, ґ та довгі українські
                  назви.
                </p>
              }
              <button vdButton variant="secondary" type="button">Відкрити документ</button>
            </div>
          </section>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="scroll-rtl-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">RTL content</p>
        <h2 id="scroll-rtl-title">Let the browser handle direction</h2>
      </div>
      <div
        vdScrollArea
        label="سجل الفريق"
        dir="rtl"
        lang="ar"
        class="demo-scroll-viewport"
        data-testid="scroll-rtl"
      >
        <div class="demo-scroll-content">
          @for (event of events; track $index) {
            <h3>تحديث مساحة العمل</h3>
            <p>
              تمت مراجعة المستندات ومشاركة الملاحظات مع أعضاء الفريق. يمكنك التمرير لمتابعة آخر
              التحديثات.
            </p>
          }
        </div>
      </div>
    </section>
  `,
})
export default class ScrollAreaPage {
  readonly reviewed = signal(false);
  readonly projects = [
    'Дизайн бібліотеки',
    'Документація',
    'Доступність',
    'Перевірка форм',
    'Нотатки команди',
    'Наступні завдання',
  ];
  readonly events = Array.from({ length: 12 }, (_, index) => ({
    date: `2026-10-08T${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}:00`,
    time: `${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index % 4) * 15).padStart(2, '0')}`,
    title: [
      'Оновлено вимоги до компонента',
      'Перевірено клавіатурну навігацію',
      'Додано нотатки української команди',
    ][index % 3],
    description:
      'Перегляньте зміни, перевірте довгі назви й переконайтеся, що і, ї, є, ґ відображаються правильно.',
  }));
  readonly rows = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    title: `Документ ${String(index + 1).padStart(2, '0')} — вимоги робочого простору`,
    owner: ['Олена Коваль', 'Андрій Мельник', 'Марія Бондар'][index % 3],
    status: index % 2 ? 'Очікує перегляду' : 'Перевірено',
    updated: '8 жовтня, 10:30',
  }));
}
