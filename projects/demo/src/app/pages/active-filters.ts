import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdActiveFilters, type VdActiveFilter } from '@vadem/ui/active-filters';
import { VdButton } from '@vadem/ui/button';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
const INITIAL: readonly VdActiveFilter[] = [
  { id: 'status', label: 'Статус', value: 'очікує' },
  { id: 'client', label: 'Клієнт', value: 'Іскра' },
  { id: 'owner', label: 'Відповідальний', value: 'Андрій Шевчук' },
];
@Component({
  imports: [VdActiveFilters, VdButton, VdInput],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Active filters</h1>
      <p>Перегляньте застосовані умови та приберіть зайві окремо або всі разом.</p>
    </header>
    <section class="demo-section" aria-labelledby="active-main">
      <div class="demo-section__head">
        <h2 id="active-main">Фільтри рахунків</h2>
        <p>Видалення умови залишає решту фільтрів без змін.</p>
      </div>
      <vd-active-filters
        data-testid="main-filters"
        [filters]="filters()"
        [disabled]="disabled()"
        (filterRemove)="remove($event)"
        (clearAll)="filters.set([])"
      />
      <p role="status" data-testid="filter-count">Застосовано умов: {{ filters().length }}</p>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="reset()">Відновити фільтри</button>
        <button vdButton variant="secondary" (click)="disabled.set(!disabled())">
          {{ disabled() ? 'Увімкнути зміни' : 'Заблокувати зміни' }}
        </button>
        <button vdButton variant="ghost" (click)="filters.set(filters().slice(1))">
          Прибрати першу умову ззовні
        </button>
      </div>
      <p><label for="filters-note">Нотатка поза фільтрами</label></p>
      <input
        vdInput
        id="filters-note"
        placeholder="Фокус залишається тут під час зовнішніх оновлень"
      />
    </section>
    <section class="demo-section" aria-labelledby="active-request">
      <div class="demo-section__head">
        <h2 id="active-request">Запит без негайної зміни</h2>
        <p>Поки застосунок не оновить список, умова залишається видимою.</p>
      </div>
      <vd-active-filters
        data-testid="request-filters"
        [filters]="initial.slice(0, 1)"
        (filterRemove)="requests.update(increment)"
        (clearAll)="requests.update(increment)"
      />
      <p role="status" data-testid="request-count">Отримано запитів: {{ requests() }}</p>
    </section>
    <section class="demo-section" aria-labelledby="active-empty">
      <div class="demo-section__head"><h2 id="active-empty">Без умов і некоректні дані</h2></div>
      <vd-active-filters data-testid="empty-filters" />
      <vd-active-filters data-testid="invalid-filters" [filters]="invalid" />
    </section>
    <section class="demo-section" aria-labelledby="active-long">
      <div class="demo-section__head"><h2 id="active-long">Довгі значення</h2></div>
      <vd-active-filters
        data-testid="long-filters"
        [filters]="long()"
        (filterRemove)="long.set([])"
        (clearAll)="long.set([])"
      />
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="active-rtl">
      <div class="demo-section__head"><h2 id="active-rtl">عوامل التصفية النشطة</h2></div>
      <vd-active-filters
        data-testid="rtl-filters"
        [filters]="arabic()"
        label="عوامل التصفية النشطة"
        clearText="مسح الكل"
        emptyText="لا توجد عوامل تصفية"
        [removeLabel]="removeArabic"
        (filterRemove)="removeRtl($event)"
        (clearAll)="arabic.set([])"
      />
    </section>
  `,
})
export default class ActiveFiltersPage {
  protected readonly initial = INITIAL;
  protected readonly filters = signal(INITIAL);
  protected readonly disabled = signal(false);
  protected readonly requests = signal(0);
  protected readonly increment = (n: number) => n + 1;
  protected readonly invalid = [INITIAL[0], INITIAL[0]];
  protected readonly long = signal<readonly VdActiveFilter[]>([
    {
      id: 'long',
      label: 'Документ',
      value: 'Звіт_довгострокового_розвитку_виробничої_дільниці_їєіґ_та_перевірки_документів_2026',
    },
  ]);
  protected readonly arabic = signal<readonly VdActiveFilter[]>([
    { id: 'status', label: 'الحالة', value: 'في الانتظار' },
    { id: 'client', label: 'العميل', value: 'شركة الإنتاج' },
  ]);
  protected readonly removeArabic = (label: string, value: string) => `إزالة ${label}: ${value}`;
  protected remove(id: string): void {
    this.filters.update((filters) => filters.filter((filter) => filter.id !== id));
  }
  protected removeRtl(id: string): void {
    this.arabic.update((filters) => filters.filter((filter) => filter.id !== id));
  }
  protected reset(): void {
    this.filters.set(INITIAL);
    this.disabled.set(false);
  }
}
