import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import {
  VdReorderList,
  type VdReorderListChange,
  type VdReorderListItem,
} from '@vadem/ui/reorder-list';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
const initial: readonly VdReorderListItem[] = [
  {
    id: 'report',
    label: 'Перевірити звіт за зміну',
    description: 'Звірити підсумки та записи перед передаванням команді.',
  },
  {
    id: 'quality',
    label: 'Узгодити перевірку якості',
    description: 'Підтвердити відповідальних і час перевірки.',
  },
  {
    id: 'plan',
    label: 'Оновити план виробництва',
    description: 'Врахувати зміни й погоджені пріоритети.',
  },
  {
    id: 'archive',
    label: 'Передати документи до архіву',
    description: 'Зберегти завершені документи за поточний місяць.',
  },
];
@Component({
  imports: [VdButton, VdReorderList],
  providers: [vdLocaleProvider(vdLocaleUk)],
  host: { class: 'demo-reorder' },
  encapsulation: ViewEncapsulation.None,
  styles: `
    .demo-reorder .demo-panel {
      padding: min(var(--vd-space-6), 5%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Reorder list</h1>
      <p>
        Розставте пріоритети: перетягніть за маркер або скористайтеся кнопками «Вище» й «Нижче».
      </p>
    </header>
    <section class="demo-section" aria-labelledby="priority-list">
      <div class="demo-section__head">
        <h2 id="priority-list">Порядок завдань на зміну</h2>
        <p>
          Відпустіть у списку, щоб застосувати нову позицію. Escape або відпускання поза списком
          скасовує переміщення.
        </p>
      </div>
      <div class="demo-panel">
        <vd-reorder-list
          data-testid="priority-list"
          [(items)]="items"
          [disabled]="disabled()"
          label="Пріоритети зміни"
          (reordered)="record($event)"
        />
      </div>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="reset()">Відновити порядок</button
        ><button vdButton variant="secondary" (click)="disabled.set(!disabled())">
          {{ disabled() ? 'Увімкнути зміни' : 'Заблокувати зміни' }}</button
        ><button vdButton variant="ghost" (click)="items.set(items().slice(1))">
          Прибрати перший елемент
        </button>
      </div>
      <p data-testid="reorder-result">{{ result() }}</p>
    </section>
    <section class="demo-section" aria-labelledby="list-states">
      <div class="demo-section__head">
        <h2 id="list-states">Короткий та порожній список</h2>
        <p>На межах кнопки не змінюють порядок. Єдиний елемент залишається на місці.</p>
      </div>
      <div class="demo-panel">
        <vd-reorder-list data-testid="single-list" [items]="single" label="Один документ" />
      </div>
      <div class="demo-panel">
        <vd-reorder-list data-testid="empty-list" label="Порожній список" />
      </div>
    </section>
    <section class="demo-section" aria-labelledby="invalid-list">
      <div class="demo-section__head">
        <h2 id="invalid-list">Некоректні дані</h2>
        <p>Неоднозначні елементи не можна переміщувати.</p>
      </div>
      <div class="demo-panel">
        <vd-reorder-list
          data-testid="invalid-list"
          [items]="invalidItems"
          label="Некоректний список"
        />
      </div>
    </section>
    <section class="demo-section" aria-labelledby="long-list">
      <div class="demo-section__head">
        <h2 id="long-list">Довгі назви</h2>
        <p>Назви й дії переносяться на вузькому екрані.</p>
      </div>
      <div class="demo-panel">
        <vd-reorder-list
          data-testid="long-list"
          [(items)]="longItems"
          label="Документи з довгими назвами"
        />
      </div>
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="arabic-list">
      <div class="demo-section__head">
        <h2 id="arabic-list">أولويات الفريق</h2>
        <p>غيّر الترتيب بالأزرار أو اسحب المقبض.</p>
      </div>
      <div class="demo-panel">
        <vd-reorder-list
          data-testid="rtl-list"
          [(items)]="arabic"
          label="أولويات الفريق"
          instructions="انقل العناصر بالأزرار أو اسحب المقبض. يلغي Escape السحب."
          upText="لأعلى"
          downText="لأسفل"
          [movedText]="arabicMoved"
          [canceledText]="arabicCanceled"
          emptyText="لا توجد عناصر."
        />
      </div>
    </section>
  `,
})
export default class ReorderListPage {
  protected readonly items = signal(initial);
  protected readonly disabled = signal(false);
  protected readonly result = signal('Порядок змінюється лише в цьому прикладі.');
  protected readonly invalidItems = [
    { id: 'duplicate', label: 'Перший запис' },
    { id: 'duplicate', label: 'Другий запис' },
  ];
  protected readonly single = [{ id: 'only', label: 'Погоджений документ' }];
  protected readonly longItems = signal<readonly VdReorderListItem[]>([
    {
      id: 'long',
      label: 'Документ_довгострокового_розвитку_виробничої_дільниці_їєіґ_2026',
      description: 'Довга назва з українськими літерами ї, є, і, ґ та поясненням для команди.',
    },
    { id: 'short', label: 'Короткий звіт' },
  ]);
  protected readonly arabic = signal<readonly VdReorderListItem[]>([
    { id: 'ar-report', label: 'مراجعة تقرير الوردية' },
    { id: 'ar-plan', label: 'تحديث خطة الإنتاج' },
    { id: 'ar-quality', label: 'تأكيد فحص الجودة' },
  ]);
  protected readonly arabicMoved = (label: string, position: number, total: number) =>
    `${label}. الموضع ${position} من ${total}.`;
  protected readonly arabicCanceled = (label: string) => `تم إلغاء النقل: ${label}.`;
  protected record(change: VdReorderListChange): void {
    this.result.set(`Змінено позицію: ${change.fromIndex + 1} → ${change.toIndex + 1}.`);
  }
  protected reset(): void {
    this.items.set([...initial]);
    this.disabled.set(false);
    this.result.set('Початковий порядок відновлено.');
  }
}
