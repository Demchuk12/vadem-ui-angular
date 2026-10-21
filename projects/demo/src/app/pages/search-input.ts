import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdKbd } from '@vadem/ui/kbd';
import { VD_SEARCH_INPUT } from '@vadem/ui/search-input';

const CITIES = [
  'Київ',
  'Харків',
  'Одеса',
  'Дніпро',
  'Львів',
  'Запоріжжя',
  'Кривий Ріг',
  'Миколаїв',
  'Вінниця',
  'Херсон',
  'Полтава',
  'Чернігів',
  'Черкаси',
  'Житомир',
  'Суми',
  'Хмельницький',
  'Чернівці',
  'Рівне',
  'Івано-Франківськ',
  'Тернопіль',
  'Луцьк',
  'Ужгород',
];

@Component({
  selector: 'demo-search-input',
  imports: [ReactiveFormsModule, VD_SEARCH_INPUT, VdField, VdKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The page owns its shortcut; the library never binds document keys.
  host: { '(document:keydown)': 'onShortcut($event)' },
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Search input</p>
      <h1>Search input</h1>
      <p>
        A native search field with a clear action, Escape to clear, and a loading state. The value,
        forms and the <code>search</code> event stay native.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="search-filter">
      <div class="demo-section__head">
        <h2 id="search-filter">Filter a list</h2>
        <p>
          Type to filter, press Escape to clear (a second Escape is left to the page). Results are
          announced politely.
        </p>
      </div>
      <form class="demo-panel demo-search" role="search" (submit)="$event.preventDefault()">
        <vd-field label="Місто">
          <vd-search-input [loading]="loading()">
            <input
              #city
              vdSearchInput
              type="search"
              aria-keyshortcuts="/"
              [formControl]="query"
              placeholder="Наприклад, Львів"
              autocomplete="off"
            />
            <vd-kbd slot="end" keys="/" />
          </vd-search-input>
        </vd-field>
        <p class="demo-search__status" role="status" data-testid="search-status">
          {{ statusText() }}
        </p>
        <ul class="demo-search__results" role="list">
          @for (city of results(); track city) {
            <li>{{ city }}</li>
          }
        </ul>
      </form>
    </section>

    <section class="demo-section" aria-labelledby="search-states">
      <div class="demo-section__head">
        <h2 id="search-states">Sizes and states</h2>
      </div>
      <div class="demo-panel demo-search-states">
        <vd-field label="Small">
          <vd-search-input>
            <input vdSearchInput type="search" size="sm" value="Звіт за жовтень" />
          </vd-search-input>
        </vd-field>
        <vd-field label="Loading">
          <vd-search-input loading>
            <input vdSearchInput type="search" value="Кошторис" />
          </vd-search-input>
        </vd-field>
        <vd-field label="Read-only">
          <vd-search-input>
            <input vdSearchInput type="search" readonly value="Збережений запит" />
          </vd-search-input>
        </vd-field>
        <vd-field label="Disabled">
          <vd-search-input>
            <input vdSearchInput type="search" disabled value="Недоступно" />
          </vd-search-input>
        </vd-field>
        <vd-field label="Large">
          <vd-search-input>
            <input
              vdSearchInput
              type="search"
              size="lg"
              placeholder="Пошук документів, проєктів і людей"
            />
          </vd-search-input>
        </vd-field>
        <vd-field label="بحث" dir="rtl" lang="ar">
          <vd-search-input>
            <input vdSearchInput type="search" value="تقرير" />
          </vd-search-input>
        </vd-field>
      </div>
    </section>
  `,
  styles: `
    .demo-search {
      display: grid;
      gap: var(--vd-space-3);
      max-inline-size: 28rem;
    }
    .demo-search__status {
      margin: 0;
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-search__results {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .demo-search__results li {
      padding: var(--vd-space-1) var(--vd-space-2);
      border-radius: var(--vd-radius-sm);
      background: var(--vd-color-fill);
      font-size: var(--vd-text-sm);
    }
    .demo-search-states {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: var(--vd-space-5);
    }
  `,
})
export default class SearchInputPage {
  protected readonly query = new FormControl('', { nonNullable: true });
  /** Applied query lags the typed one, like a server round-trip. */
  private readonly applied = signal('');
  protected readonly loading = signal(false);
  private readonly city = viewChild.required<ElementRef<HTMLInputElement>>('city');
  protected readonly results = computed(() => {
    const q = this.applied().trim().toLocaleLowerCase('uk');
    return q ? CITIES.filter((c) => c.toLocaleLowerCase('uk').includes(q)) : CITIES;
  });
  protected readonly statusText = computed(() => {
    if (this.loading()) return 'Пошук…';
    const n = this.results().length;
    return this.applied().trim() ? `Знайдено: ${n}` : `Усього міст: ${n}`;
  });

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = this.query.valueChanges.subscribe((q) => {
      clearTimeout(timer);
      this.loading.set(q.trim() !== '');
      timer = setTimeout(
        () => {
          this.applied.set(q);
          this.loading.set(false);
        },
        q.trim() ? 400 : 0,
      );
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(timer);
      sub.unsubscribe();
    });
  }

  protected onShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable]');
    if (event.key !== '/' || typing || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    this.city().nativeElement.focus();
  }
}
