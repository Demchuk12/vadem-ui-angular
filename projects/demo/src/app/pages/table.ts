import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { VdActiveFilters, type VdActiveFilter } from '@vadem/ui/active-filters';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge, VdBadgeVariant } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';
import { VdPagination } from '@vadem/ui/pagination';
import {
  VdDataTable,
  VdTableColumn,
  VdTableRowId,
  VD_TABLE,
  VdSort,
  vdSortRows,
} from '@vadem/ui/table';

import { VD_POPOVER } from '@vadem/ui/popover';
import { VdSelect, VdOption } from '@vadem/ui/select';
import { VdChoice } from '@vadem/ui/field';

interface Invoice {
  id: string;
  client: string;
  owner: string;
  amount: number;
  due: Date;
  status: { label: string; variant: VdBadgeVariant };
}

const PAGE_SIZE = 4;

const PAID = { label: 'Оплачено', variant: 'success' } as const;
const DUE = { label: 'Очікує', variant: 'warning' } as const;
const LATE = { label: 'Прострочено', variant: 'danger' } as const;
const DRAFT = { label: 'Чернетка', variant: 'neutral' } as const;

const INVOICES: Invoice[] = [
  {
    id: 'INV-0142',
    client: 'Ромашка Лабс',
    owner: 'Олена Коваленко',
    amount: 48920,
    due: new Date(2026, 9, 12),
    status: DUE,
  },
  {
    id: 'INV-0141',
    client: 'Єдиний Простір',
    owner: 'Тарас Мельник',
    amount: 12500,
    due: new Date(2026, 8, 28),
    status: LATE,
  },
  {
    id: 'INV-0140',
    client: 'Атлас Логістик',
    owner: 'Ірина Бондар',
    amount: 196300.5,
    due: new Date(2026, 8, 20),
    status: PAID,
  },
  {
    id: 'INV-0139',
    client: 'Іскра Медіа',
    owner: 'Андрій Шевчук',
    amount: 8400,
    due: new Date(2026, 9, 30),
    status: DRAFT,
  },
  {
    id: 'INV-0138',
    client: 'Бджілка',
    owner: 'Олена Коваленко',
    amount: 3150,
    due: new Date(2026, 8, 2),
    status: PAID,
  },
  {
    id: 'INV-0137',
    client: 'Ярмарок Онлайн',
    owner: 'Тарас Мельник',
    amount: 71200,
    due: new Date(2026, 9, 5),
    status: DUE,
  },
];

@Component({
  selector: 'demo-table',
  imports: [
    VdActiveFilters,
    VD_CARD,
    VdSelect,
    VdOption,
    VdDataTable,
    VdTableColumn,
    VD_POPOVER,
    VdChoice,
    VD_EMPTY_STATE,
    VdPagination,
    VD_TABLE,
    VdAvatar,
    VdBadge,
    VdButton,
    VdCheckbox,
    VdIcon,
    VdInput,
    VdInputGroup,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Table</p>
      <h1>Table</h1>
      <p>
        A native table with mono headers, sortable columns (APG), row selection and an empty state.
        Your code renders the rows; <code>vdSortRows</code> sorts them with
        <code>Intl.Collator</code>, so «Є» and «І» land where Ukrainian readers expect.
      </p>
    </header>

    <section
      class="demo-section"
      aria-labelledby="full"
      vdDataTable
      #data="vdDataTable"
      [rowIds]="pageIds()"
      [columns]="columns"
      [columnOffset]="1"
      [(selected)]="selected"
    >
      <div class="demo-section__head">
        <p class="vd-eyebrow">[(sort)] · vdSortHeader · vdRow [selected] · vdTableEmpty</p>
        <h2 id="full">Data table</h2>
        <p>
          Combine a status with search. Selection survives filtering; changing a filter returns to
          page one.
        </p>
      </div>

      <div class="demo-table-controls">
        <div class="demo-toolbar">
          <vd-input-group class="demo-search">
            <vd-icon name="search" slot="start" />
            <input
              vdInput
              #filterSearch
              size="sm"
              type="search"
              placeholder="Клієнт або номер"
              aria-label="Фільтр рахунків"
              [value]="query()"
              (input)="setQuery($any($event.target).value)"
            />
          </vd-input-group>
          <vd-select
            class="demo-status-filter"
            size="sm"
            aria-label="Статус рахунку"
            [value]="statusFilter()"
            (valueChange)="setStatus($event)"
          >
            <vd-option value="all">Усі статуси</vd-option>
            @for (status of statuses; track status.variant) {
              <vd-option [value]="status.variant">{{ status.label }}</vd-option>
            }
          </vd-select>
          <button
            vdButton
            size="sm"
            variant="ghost"
            [disabled]="!filtersActive()"
            (click)="resetFilters()"
          >
            Скинути фільтри
          </button>
        </div>
        @if (activeFilters().length) {
          <vd-active-filters
            label="Застосовані фільтри рахунків"
            clearText="Очистити всі"
            [filters]="activeFilters()"
            [removeLabel]="removeFilterLabel"
            (filterRemove)="removeFilter($event, filterSearch)"
            (clearAll)="resetFilters(); filterSearch.focus()"
          />
        }
        <div class="demo-toolbar">
          <span class="demo-token" role="status">Знайдено: {{ rows().length }} з {{ total }}</span>
          <span class="demo-token" aria-live="polite"> Вибрано: {{ selected().size }} </span>
          @if (selected().size) {
            <button vdButton size="sm" variant="ghost" (click)="data.clearSelection()">
              Скасувати вибір
            </button>
          }
          <button vdButton size="sm" variant="secondary" [vdPopoverTrigger]="chooser">
            Колонки
          </button>
          <div
            class="demo-table-chooser"
            vdPopover
            #chooser="vdPopover"
            aria-label="Видимість колонок"
          >
            <p class="vd-eyebrow">Видимість колонок</p>
            <p>Клієнт — основна колонка, завжди видима.</p>
            <div class="demo-column-choices">
              @for (column of columns; track column.key) {
                <label vdChoice>
                  <input
                    vdCheckbox
                    type="checkbox"
                    [checked]="data.isColumnVisible(column.key)"
                    [disabled]="!data.canHideColumn(column.key)"
                    (change)="data.setColumnVisible(column.key, $any($event.target).checked)"
                  />
                  {{ column.label }}
                </label>
              }
            </div>
            <button vdButton variant="ghost" size="sm" (click)="data.resetColumns()">
              Показати всі
            </button>
          </div>
        </div>
      </div>
      <div vdCard>
        <div vdTableScroll aria-label="Рахунки">
          <table vdTable [(sort)]="sort" [attr.aria-colcount]="data.columnCount()">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    vdCheckbox
                    aria-label="Вибрати всі видимі рахунки"
                    [checked]="data.allSelected()"
                    [indeterminate]="data.someSelected()"
                    [disabled]="!pageRows().length"
                    (change)="data.selectAll($any($event.target).checked)"
                  />
                </th>
                <th scope="col" vdSortHeader="id" vdTableColumn="id">Номер</th>
                <th scope="col" vdSortHeader="client" vdTableColumn="client">Клієнт</th>
                <th scope="col" vdSortHeader="owner" vdTableColumn="owner">Відповідальний</th>
                <th scope="col" vdSortHeader="due" vdTableColumn="due">Термін</th>
                <th scope="col" vdTableColumn="status">Статус</th>
                <th scope="col" vdSortHeader="amount" vdTableColumn="amount" data-numeric>
                  Сума, ₴
                </th>
              </tr>
            </thead>
            <tbody>
              @for (inv of pageRows(); track inv.id) {
                <tr vdRow [selected]="selected().has(inv.id)">
                  <td>
                    <input
                      type="checkbox"
                      vdCheckbox
                      [attr.aria-label]="'Вибрати ' + inv.id"
                      [checked]="selected().has(inv.id)"
                      (change)="data.setSelected(inv.id, $any($event.target).checked)"
                    />
                  </td>
                  <td vdTableColumn="id" class="demo-mono">{{ inv.id }}</td>
                  <th vdTableColumn="client" scope="row">{{ inv.client }}</th>
                  <td vdTableColumn="owner">
                    <span class="demo-person">
                      <vd-avatar size="sm" [name]="inv.owner" decorative />{{ inv.owner }}
                    </span>
                  </td>
                  <td vdTableColumn="due" class="demo-nowrap">{{ date.format(inv.due) }}</td>
                  <td vdTableColumn="status">
                    <span vdBadge [variant]="inv.status.variant" dot>{{ inv.status.label }}</span>
                  </td>
                  <td vdTableColumn="amount" data-numeric>{{ money.format(inv.amount) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td vdTableEmpty [attr.colspan]="data.visibleColumns().length + 1">
                    <div vdEmptyState icon="search" size="sm">
                      <p vdEmptyStateTitle>Нічого не знайдено</p>
                      <p vdEmptyStateDescription>Немає рахунків за запитом «{{ query() }}».</p>
                      <div slot="actions">
                        <button vdButton size="sm" (click)="resetFilters()">
                          Показати всі рахунки
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (pageCount() > 1) {
        <div class="demo-footer">
          <span class="demo-token">{{ rangeLabel() }}</span>
          <vd-pagination
            size="sm"
            label="Сторінки рахунків"
            previousLabel="Попередня сторінка"
            nextLabel="Наступна сторінка"
            [pageLabel]="pageLabel"
            [pageCount]="pageCount()"
            [(page)]="page"
          />
        </div>
      }
    </section>

    <section class="demo-section" aria-labelledby="compact">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size="sm" · stickyHeader · vdTableScroll</p>
        <h2 id="compact">Compact, scrolling</h2>
        <p>The header stays put while the region scrolls; the region is focusable for keyboards.</p>
      </div>
      <div vdCard>
        <div vdTableScroll class="demo-tall" aria-label="Журнал подій">
          <table vdTable size="sm" stickyHeader>
            <thead>
              <tr>
                <th scope="col">Час</th>
                <th scope="col">Подія</th>
                <th scope="col">Сервіс</th>
                <th scope="col" data-numeric>Тривалість, мс</th>
              </tr>
            </thead>
            <tbody>
              @for (e of events; track $index) {
                <tr>
                  <td class="demo-mono">{{ e.time }}</td>
                  <td>{{ e.event }}</td>
                  <td class="demo-mono">{{ e.service }}</td>
                  <td data-numeric>{{ e.ms }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">plain · caption · RTL</p>
        <h2 id="content">Outside cards, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 20rem">
        <div vdTableScroll aria-label="Тарифи">
          <table vdTable>
            <caption>
              Тарифи · ціни без ПДВ
            </caption>
            <thead>
              <tr>
                <th scope="col">План</th>
                <th scope="col" data-numeric>Учасники</th>
                <th scope="col" data-numeric>Ціна, ₴/міс</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Free</th>
                <td data-numeric>3</td>
                <td data-numeric>0</td>
              </tr>
              <tr>
                <th scope="row">Team</th>
                <td data-numeric>25</td>
                <td data-numeric>1 200</td>
              </tr>
              <tr>
                <th scope="row">Business</th>
                <td data-numeric>∞</td>
                <td data-numeric>4 800</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div vdTableScroll dir="rtl" lang="ar" aria-label="الخطط">
          <table vdTable>
            <caption>
              الخطط
            </caption>
            <thead>
              <tr>
                <th scope="col">الخطة</th>
                <th scope="col" data-numeric>الأعضاء</th>
                <th scope="col" data-numeric>السعر</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">مجاني</th>
                <td data-numeric>3</td>
                <td data-numeric>0</td>
              </tr>
              <tr>
                <th scope="row">فريق</th>
                <td data-numeric>25</td>
                <td data-numeric>1200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: `
    @position-try --demo-table-center {
      position-area: none;
      inset: 0;
      margin: auto;
    }
    .demo-table-chooser {
      position-try-fallbacks:
        flip-block,
        flip-inline,
        flip-block flip-inline,
        --demo-table-center;
      block-size: fit-content;
    }
    .demo-column-choices {
      display: grid;
      gap: var(--vd-space-3);
      margin-block: var(--vd-space-4);
    }
    .demo-table-controls {
      display: grid;
      gap: var(--vd-space-3);
    }
    .demo-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-status-filter {
      flex: 0 1 12rem;
      min-inline-size: 0;
      max-inline-size: 100%;
    }
    .demo-search {
      flex: 0 1 18rem;
    }
    .demo-mono {
      font-family: var(--vd-font-mono);
      font-size: var(--vd-text-xs);
      white-space: nowrap;
    }
    .demo-nowrap {
      white-space: nowrap;
    }
    .demo-person {
      display: inline-flex;
      align-items: center;
      gap: var(--vd-space-2);
      white-space: nowrap;
    }
    .demo-tall {
      max-block-size: 16rem;
    }
    .demo-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--vd-space-3);
    }
  `,
})
export default class TablePage {
  protected readonly sort = signal<VdSort | null>({ key: 'due', direction: 'descending' });
  protected readonly query = signal('');
  protected readonly statusFilter = signal('all');
  protected readonly statuses = [DUE, PAID, LATE, DRAFT];
  protected readonly total = INVOICES.length;
  protected readonly filtersActive = computed(
    () => !!this.query() || this.statusFilter() !== 'all',
  );
  protected readonly activeFilters = computed<readonly VdActiveFilter[]>(() => {
    const filters: VdActiveFilter[] = [];
    if (this.query()) filters.push({ id: 'query', label: 'Пошук', value: this.query() });
    const status = this.statuses.find((status) => status.variant === this.statusFilter());
    if (status) filters.push({ id: 'status', label: 'Статус', value: status.label });
    return filters;
  });
  protected readonly removeFilterLabel = (label: string, value: string) =>
    `Прибрати фільтр ${label}: ${value}`;
  protected removeFilter(id: string, search: HTMLInputElement): void {
    if (id === 'query') this.setQuery('');
    if (id === 'status') this.setStatus('all');
    if (!this.filtersActive()) search.focus();
  }
  protected readonly selected = signal<ReadonlySet<VdTableRowId>>(new Set(['INV-0141']));

  protected readonly money = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2 });
  protected readonly date = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLocaleLowerCase('uk');
    const status = this.statusFilter();
    const filtered = INVOICES.filter(
      (invoice) =>
        (!q || `${invoice.id} ${invoice.client}`.toLocaleLowerCase('uk').includes(q)) &&
        (status === 'all' || invoice.status.variant === status),
    );
    return vdSortRows(filtered, this.sort(), { locale: 'uk' });
  });

  protected readonly page = signal(1);
  protected readonly pageCount = computed(() => Math.ceil(this.rows().length / PAGE_SIZE));
  protected readonly pageRows = computed(() =>
    this.rows().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
  );
  protected readonly rangeLabel = computed(() => {
    const from = (this.page() - 1) * PAGE_SIZE + 1;
    const to = from + this.pageRows().length - 1;
    return `${from}–${to} з ${this.rows().length}`;
  });
  protected readonly pageLabel = (n: number) => `Сторінка ${n}`;

  protected readonly pageIds = computed(() => this.pageRows().map((row) => row.id));
  protected readonly columns = [
    { key: 'id', label: 'Номер' },
    { key: 'client', label: 'Клієнт', required: true },
    { key: 'owner', label: 'Відповідальний' },
    { key: 'due', label: 'Термін' },
    { key: 'status', label: 'Статус' },
    { key: 'amount', label: 'Сума, ₴' },
  ];

  protected readonly events = Array.from({ length: 24 }, (_, i) => ({
    time: `12:${String(4 + i).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`,
    event: ['Збірка завершена', 'Запит до API', 'Кеш оновлено', 'Деплой у eu-central-1'][i % 4],
    service: ['build', 'api', 'cdn', 'deploy'][i % 4],
    ms: ((i * 137) % 900) + 40,
  }));

  protected setStatus(value: string | null): void {
    this.statusFilter.set(value ?? 'all');
    this.page.set(1);
  }

  protected resetFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.page.set(1);
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }
}
