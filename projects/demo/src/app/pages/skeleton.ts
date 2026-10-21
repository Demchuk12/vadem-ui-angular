import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdCard } from '@vadem/ui/card';
import { VdSkeleton, type VdSkeletonSize } from '@vadem/ui/skeleton';
import { VdTable, VdTableScroll } from '@vadem/ui/table';

@Component({
  imports: [VdButton, VdCard, VdSkeleton, VdTable, VdTableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Skeleton</h1>
      <p>Preserve the shape of content while it loads. One status, no repeated announcements.</p>
    </header>

    <section class="demo-section" aria-labelledby="shapes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">text · circle · rectangle</p>
        <h2 id="shapes">Content shapes</h2>
        <p>Sizes follow existing text and avatar tokens. Widths belong to your layout.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 14rem">
        @for (size of sizes; track size) {
          <article vdCard class="demo-skeleton-stack">
            <p class="demo-token">size="{{ size }}"</p>
            <div class="demo-skeleton-person">
              <span vdSkeleton shape="circle" [size]="size"></span>
              <div class="demo-skeleton-stack">
                <span vdSkeleton shape="text" [size]="size"></span>
                <span vdSkeleton shape="text" [size]="size" class="demo-skeleton-short"></span>
              </div>
            </div>
            <span vdSkeleton shape="rectangle"></span>
          </article>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="table-example">
      <div class="demo-section__head">
        <p class="vd-eyebrow">table · loading → loaded</p>
        <h2 id="table-example">Table loading</h2>
        <p>Keep headers and column widths in place; replace only the placeholder rows.</p>
      </div>
      <div class="demo-skeleton-toolbar">
        <p role="status" data-testid="table-status">
          {{
            loading() ? 'Завантажуємо список проєктів…' : 'Список проєктів завантажено: 4 проєкти.'
          }}
        </p>
        <button vdButton size="sm" (click)="loading.set(!loading())">
          {{ loading() ? 'Показати дані' : 'Показати завантаження' }}
        </button>
      </div>
      <div vdTableScroll aria-label="Список проєктів — горизонтальне прокручування">
        <table
          vdTable
          class="demo-skeleton-table"
          [attr.aria-busy]="loading()"
          data-testid="projects-table"
        >
          <caption class="vd-visually-hidden">
            Проєкти робочого простору
          </caption>
          <colgroup>
            <col class="demo-skeleton-project-col" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Проєкт</th>
              <th scope="col">Відповідальна особа</th>
              <th scope="col">Статус</th>
              <th scope="col" data-numeric>Учасники</th>
            </tr>
          </thead>
          <tbody [attr.aria-hidden]="loading() ? 'true' : null">
            @for (project of projects; track project.name; let i = $index) {
              <tr>
                <td>
                  <div class="demo-skeleton-person">
                    @if (loading()) {
                      <span vdSkeleton shape="circle" size="sm"></span>
                      <div class="demo-skeleton-stack demo-skeleton-cell-lines">
                        <span
                          vdSkeleton
                          shape="text"
                          [class.demo-skeleton-short]="i % 2 === 0"
                        ></span>
                        <span vdSkeleton shape="text" size="sm" class="demo-skeleton-short"></span>
                      </div>
                    } @else {
                      <span class="demo-skeleton-project-mark" aria-hidden="true">{{
                        project.name[0]
                      }}</span>
                      <div class="demo-skeleton-cell-lines">
                        <strong>{{ project.name }}</strong
                        ><small>{{ project.code }}</small>
                      </div>
                    }
                  </div>
                </td>
                <td>
                  @if (loading()) {
                    <span vdSkeleton shape="text" [class.demo-skeleton-short]="i % 2 !== 0"></span>
                  } @else {
                    {{ project.owner }}
                  }
                </td>
                <td>
                  @if (loading()) {
                    <span vdSkeleton shape="text" class="demo-skeleton-short"></span>
                  } @else {
                    {{ project.status }}
                  }
                </td>
                <td data-numeric>
                  @if (loading()) {
                    <span vdSkeleton shape="text" class="demo-skeleton-number"></span>
                  } @else {
                    {{ project.members }}
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="cards">
      <div class="demo-section__head">
        <p class="vd-eyebrow">composition · static</p>
        <h2 id="cards">Cards and readable status</h2>
        <p>Animation can be disabled explicitly; reduced motion always stops it.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 16rem">
        <div>
          <p role="status" class="demo-skeleton-note">
            Завантажуємо огляд довгострокового плану розвитку бібліотеки компонентів…
          </p>
          <article vdCard aria-busy="true" class="demo-skeleton-stack" aria-label="Огляд проєкту">
            <span vdSkeleton shape="rectangle" [animated]="false"></span>
            <span
              vdSkeleton
              shape="text"
              size="lg"
              [animated]="false"
              class="demo-skeleton-short"
            ></span>
            <span vdSkeleton shape="text" [animated]="false"></span>
            <span vdSkeleton shape="text" [animated]="false" class="demo-skeleton-short"></span>
          </article>
        </div>
        <div dir="rtl" lang="ar">
          <p role="status" class="demo-skeleton-note">جارٍ تحميل ملخص المشروع وخطة العمل للفريق…</p>
          <article vdCard aria-busy="true" class="demo-skeleton-stack" aria-label="ملخص المشروع">
            <div class="demo-skeleton-person">
              <span vdSkeleton shape="circle" [animated]="false"></span
              ><span vdSkeleton shape="text" [animated]="false"></span>
            </div>
            <span vdSkeleton shape="rectangle" [animated]="false"></span>
            <span vdSkeleton shape="text" [animated]="false"></span>
            <span vdSkeleton shape="text" [animated]="false" class="demo-skeleton-short"></span>
          </article>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="rtl-table">
      <div class="demo-section__head">
        <p class="vd-eyebrow">compact · RTL</p>
        <h2 id="rtl-table">Compact table</h2>
      </div>
      <div dir="rtl" lang="ar">
        <p role="status" class="demo-skeleton-note">جارٍ تحميل أعضاء الفريق…</p>
        <div vdTableScroll aria-label="أعضاء الفريق">
          <table vdTable size="sm" aria-busy="true" class="demo-skeleton-table">
            <caption class="vd-visually-hidden">
              أعضاء الفريق
            </caption>
            <thead>
              <tr>
                <th scope="col">الاسم</th>
                <th scope="col">الدور</th>
                <th scope="col">الفريق</th>
              </tr>
            </thead>
            <tbody aria-hidden="true">
              @for (row of rows; track row) {
                <tr>
                  <td>
                    <div class="demo-skeleton-person">
                      <span vdSkeleton shape="circle" size="sm"></span
                      ><span vdSkeleton shape="text"></span>
                    </div>
                  </td>
                  <td><span vdSkeleton shape="text" class="demo-skeleton-short"></span></td>
                  <td><span vdSkeleton shape="text"></span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-skeleton-stack {
      display: grid;
      gap: var(--vd-space-3);
      min-inline-size: 0;
    }
    .demo-skeleton-person {
      display: flex;
      align-items: center;
      gap: var(--vd-space-3);
      min-inline-size: 0;
    }
    .demo-skeleton-person > :last-child {
      flex: 1;
      min-inline-size: 0;
    }
    .demo-skeleton-short {
      --vd-skeleton-inline-size: 65%;
    }
    .demo-skeleton-number {
      --vd-skeleton-inline-size: var(--vd-space-8);
      margin-inline-start: auto;
    }
    .demo-skeleton-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--vd-space-3);
      margin-block-end: var(--vd-space-4);
    }
    .demo-skeleton-toolbar p {
      margin: 0;
    }
    .demo-skeleton-table {
      table-layout: fixed;
      min-inline-size: calc(var(--vd-space-24) * 8);
    }
    .demo-skeleton-project-col {
      inline-size: 35%;
    }
    .demo-skeleton-cell-lines {
      min-block-size: calc(var(--vd-text-sm) * 1.5 + var(--vd-text-xs) * 1.5 + var(--vd-space-1-5));
      align-content: center;
      display: grid;
      gap: var(--vd-space-1-5);
    }
    .demo-skeleton-cell-lines strong {
      font-weight: var(--vd-weight-medium);
    }
    .demo-skeleton-cell-lines small {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-xs);
    }
    .demo-skeleton-project-mark {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      inline-size: var(--vd-space-8);
      block-size: var(--vd-space-8);
      border-radius: var(--vd-radius-full);
      background: var(--vd-color-fill-active);
      color: var(--vd-color-text);
    }
    .demo-skeleton-note {
      margin-block: 0 var(--vd-space-4);
      overflow-wrap: anywhere;
    }
  `,
})
export default class SkeletonPage {
  protected readonly sizes: VdSkeletonSize[] = ['sm', 'md', 'lg'];
  protected readonly loading = signal(true);
  protected readonly rows = [0, 1, 2];
  protected readonly projects = [
    {
      name: 'Бібліотека компонентів',
      code: 'VDM-01',
      owner: 'Олена Коваль',
      status: 'У роботі',
      members: 8,
    },
    {
      name: 'Кабінет користувача',
      code: 'VDM-02',
      owner: 'Андрій Мельник',
      status: 'На перевірці',
      members: 5,
    },
    {
      name: 'Планування виробництва',
      code: 'VDM-03',
      owner: 'Марія Шевченко',
      status: 'У роботі',
      members: 12,
    },
    {
      name: 'Звіти та аналітика',
      code: 'VDM-04',
      owner: 'Іван Бондар',
      status: 'Заплановано',
      members: 4,
    },
  ];
}
