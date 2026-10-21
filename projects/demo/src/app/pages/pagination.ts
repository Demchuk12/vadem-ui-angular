import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { VdPagination } from '@vadem/ui/pagination';

@Component({
  selector: 'demo-pagination',
  imports: [VdPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Pagination</p>
      <h1>Pagination</h1>
      <p>
        Constant width while you page (no jumping buttons), ellipses only where they hide two or
        more pages, and steps that keep focus at the edges.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="basic">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[(page)] · pageCount · siblings</p>
        <h2 id="basic">Basic</h2>
      </div>
      <div class="demo-panel demo-stack">
        <vd-pagination
          label="Приклад: 24 сторінки"
          previousLabel="Попередня сторінка"
          nextLabel="Наступна сторінка"
          [pageLabel]="pageLabel"
          [pageCount]="24"
          [(page)]="page"
        />
        <p class="demo-token" aria-live="polite">{{ range() }}</p>
        <vd-pagination
          label="Приклад: дві сусідні сторінки"
          previousLabel="Попередня сторінка"
          nextLabel="Наступна сторінка"
          [pageLabel]="pageLabel"
          [pageCount]="24"
          [siblings]="2"
          [(page)]="page"
        />
        <vd-pagination
          label="Приклад: 5 сторінок"
          previousLabel="Попередня сторінка"
          nextLabel="Наступна сторінка"
          [pageLabel]="pageLabel"
          [pageCount]="5"
          [(page)]="few"
        />
      </div>
    </section>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size="sm" · compact</p>
        <h2 id="sizes">Small and compact</h2>
        <p>Compact fits phones and card footers.</p>
      </div>
      <div class="demo-panel demo-stack">
        <vd-pagination
          size="sm"
          label="Приклад: малий розмір"
          previousLabel="Попередня сторінка"
          nextLabel="Наступна сторінка"
          [pageLabel]="pageLabel"
          [pageCount]="24"
          [(page)]="page"
        />
        <vd-pagination
          compact
          label="Приклад: компактний"
          previousLabel="Попередня сторінка"
          nextLabel="Наступна сторінка"
          [pageCount]="24"
          [(page)]="page"
        />
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">RTL</p>
        <h2 id="content">RTL</h2>
      </div>
      <div class="demo-panel" dir="rtl" lang="ar">
        <vd-pagination
          label="الصفحات"
          previousLabel="السابق"
          nextLabel="التالي"
          [pageLabel]="arabicPage"
          [pageCount]="9"
          [(page)]="rtl"
        />
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      justify-items: start;
      gap: var(--vd-space-5);
    }
  `,
})
export default class PaginationPage {
  protected readonly page = signal(6);
  protected readonly few = signal(2);
  protected readonly rtl = signal(4);
  protected readonly pageLabel = (n: number) => `Сторінка ${n}`;
  protected readonly arabicPage = (n: number) => `الصفحة ${n}`;
  protected readonly range = computed(() => {
    const from = (this.page() - 1) * 20 + 1;
    return `Показано ${from}–${Math.min(from + 19, 472)} з 472`;
  });
}
