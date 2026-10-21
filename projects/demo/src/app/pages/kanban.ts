import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge } from '@vadem/ui/badge';
import { VdChoice } from '@vadem/ui/field';
import { VD_KANBAN, VdKanbanColumn, VdKanbanMove, vdKanbanApplyMove } from '@vadem/ui/kanban';
import { VdSwitch } from '@vadem/ui/switch';

interface Deal {
  id: string;
  label: string;
  company: string;
  owner: string;
  amount: number;
  hot?: boolean;
}

const money = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
});

const DEALS: VdKanbanColumn<Deal>[] = [
  {
    id: 'lead',
    title: 'Новий лід',
    cards: [
      {
        id: 'd1',
        label: 'Впровадження CRM',
        company: 'Нова Логістика',
        owner: 'Олена Коваленко',
        amount: 240000,
        hot: true,
      },
      {
        id: 'd2',
        label: 'Аудит безпеки',
        company: 'Фінтех Плюс',
        owner: 'Іван Шевченко',
        amount: 85000,
      },
      {
        id: 'd3',
        label: 'Міграція інфраструктури платіжного шлюзу в хмару з резервуванням у двох регіонах',
        company: 'Державне підприємство «Укрзалізниця Сервіс»',
        owner: 'Євгенія Мельник',
        amount: 1250000,
      },
    ],
  },
  {
    id: 'proposal',
    title: 'Комерційна пропозиція',
    cards: [
      {
        id: 'd4',
        label: 'Річна підтримка',
        company: 'Агро Захід',
        owner: 'Богдан Ткаченко',
        amount: 120000,
      },
    ],
  },
  { id: 'negotiation', title: 'Переговори', cards: [] },
  {
    id: 'won',
    title: 'Виграно',
    cards: [
      {
        id: 'd5',
        label: 'Навчання команди',
        company: 'Кавʼярні «Зерно»',
        owner: 'Ірина Бондаренко',
        amount: 36000,
      },
    ],
  },
];

const SIMPLE: VdKanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 't1', label: 'Write spec' },
      { id: 't2', label: 'Ship' },
    ],
  },
  { id: 'done', title: 'Done', cards: [{ id: 't3', label: 'Plan' }] },
];

const RTL: VdKanbanColumn[] = [
  {
    id: 'r1',
    title: 'جديد',
    cards: [
      { id: 'ra', label: 'عميل جديد' },
      { id: 'rb', label: 'عرض سعر' },
    ],
  },
  { id: 'r2', title: 'مغلق', cards: [] },
];

@Component({
  selector: 'demo-kanban',
  imports: [VD_KANBAN, VdAvatar, VdBadge, VdChoice, VdSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Kanban</p>
      <h1>Kanban</h1>
      <p>
        Columns of cards your application owns. Every card has a Move menu for keyboard and touch; a
        mouse can drag cards between columns. The board emits <code>cardMove</code> requests and
        your code applies them, for example with <code>vdKanbanApplyMove</code>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="pipeline">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vd-kanban · ng-template[vdKanbanCard] · [vdKanbanColumnHeader]</p>
        <h2 id="pipeline">Sales pipeline</h2>
        <p>Custom cards, column totals, an empty column and long Ukrainian content.</p>
      </div>
      <label vdChoice class="demo-kanban-toggle">
        <input type="checkbox" vdSwitch [checked]="locked()" (change)="locked.set(!locked())" />
        Заблокувати переміщення
      </label>
      <vd-kanban
        label="Воронка продажів"
        [columns]="deals()"
        [disabled]="locked()"
        (cardMove)="moveDeal($event)"
      >
        <ng-template vdKanbanColumnHeader let-column>{{ total(column) }}</ng-template>
        <ng-template vdKanbanCard let-deal>
          <div class="demo-deal">
            <a class="demo-deal__title" href="#pipeline" (click)="$event.preventDefault()">{{
              deal.label
            }}</a>
            <span class="demo-deal__company">{{ deal.company }}</span>
            <span class="demo-deal__meta">
              <vd-avatar size="sm" [name]="deal.owner" decorative />
              <span class="demo-deal__amount">{{ format(deal.amount) }}</span>
              @if (deal.hot) {
                <span vdBadge variant="warning">Терміново</span>
              }
            </span>
          </div>
        </ng-template>
      </vd-kanban>
      <p class="demo-token" data-testid="kanban-last">{{ last() }}</p>
    </section>

    <section class="demo-section" aria-labelledby="plain">
      <div class="demo-section__head">
        <p class="vd-eyebrow">defaults · locale strings</p>
        <h2 id="plain">Plain cards</h2>
        <p>
          Without a card template the label is shown; English locale strings come from the pack.
        </p>
      </div>
      <vd-kanban
        label="Tasks"
        [columns]="simple()"
        (cardMove)="simple.set(apply(simple(), $event))"
      />
    </section>

    <section class="demo-section" aria-labelledby="rtl">
      <div class="demo-section__head">
        <p class="vd-eyebrow">dir="rtl"</p>
        <h2 id="rtl">Right to left</h2>
      </div>
      <div dir="rtl" lang="ar">
        <vd-kanban label="لوحة" [columns]="rtl()" (cardMove)="rtl.set(apply(rtl(), $event))" />
      </div>
    </section>
  `,
  styles: `
    .demo-kanban-toggle {
      margin-block-end: var(--vd-space-4);
    }
    .demo-deal {
      display: grid;
      gap: var(--vd-space-1);
    }
    .demo-deal__title {
      color: var(--vd-color-text);
      font-weight: var(--vd-weight-semibold);
      text-decoration: none;
    }
    .demo-deal__title:hover {
      text-decoration: underline;
    }
    .demo-deal__company {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-deal__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-2);
      margin-block-start: var(--vd-space-1);
    }
    .demo-deal__amount {
      font-variant-numeric: tabular-nums;
      font-size: var(--vd-text-sm);
    }
  `,
})
export default class KanbanPage {
  protected readonly deals = signal<readonly VdKanbanColumn<Deal>[]>(DEALS);
  protected readonly simple = signal<readonly VdKanbanColumn[]>(SIMPLE);
  protected readonly rtl = signal<readonly VdKanbanColumn[]>(RTL);
  protected readonly locked = signal(false);
  protected readonly last = signal('Ще нічого не переміщено');

  protected moveDeal(move: VdKanbanMove): void {
    this.deals.set(vdKanbanApplyMove(this.deals(), move));
    const column = this.deals().find((c) => c.id === move.toColumnId)!;
    this.last.set(`${move.cardId} → ${column.title} #${move.toIndex + 1} (${move.method})`);
  }

  protected apply<C extends VdKanbanColumn>(columns: readonly C[], move: VdKanbanMove) {
    return vdKanbanApplyMove(columns, move);
  }

  protected total(column: VdKanbanColumn<Deal>): string {
    return money.format(column.cards.reduce((sum, deal) => sum + deal.amount, 0));
  }

  protected format(amount: number): string {
    return money.format(amount);
  }
}
