import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { VD_AUTOCOMPLETE, type VdAutocompleteOption } from '@vadem/ui/autocomplete';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { vdMatchesQuery } from '@vadem/ui/keyboard';

const PLACES: readonly VdAutocompleteOption[] = [
  {
    id: 'kyiv-hub',
    label: 'Київ, вулиця Січових Стрільців, 24',
    description: 'Основний склад · вхід із двору',
  },
  {
    id: 'kyiv-office',
    label: 'Київ, вулиця Січових Стрільців, 24',
    description: 'Офіс · другий поверх',
  },
  {
    id: 'kyiv-closed',
    label: 'Київ, проспект Берестейський, 10',
    description: 'Тимчасово не приймає відправлення',
    disabled: true,
  },
  { id: 'lviv', label: 'Львів, вулиця Зелена, 115', description: 'Виробнича дільниця' },
  { id: 'dnipro', label: 'Дніпро, вулиця Робоча, 8', description: 'Регіональне відділення' },
];
const TAGS: readonly VdAutocompleteOption[] = [
  { id: 'production', label: 'Виробництво', description: 'Основний виробничий процес' },
  {
    id: 'quality',
    label: 'Контроль якості',
    description: 'Перевірка продукції та супровідної документації перед відправленням замовнику',
  },
  { id: 'archive', label: 'Архів', description: 'Доступний лише для перегляду', disabled: true },
  { id: 'delivery', label: 'Доставка' },
];

@Component({
  selector: 'demo-autocomplete',
  imports: [VD_AUTOCOMPLETE, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Autocomplete</p>
      <h1>Autocomplete</h1>
      <p>
        Keep your own text or choose a suggestion. Browsing suggestions never replaces what you
        typed.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="address-title">
      <div class="demo-section__head">
        <h2 id="address-title">Delivery address</h2>
        <p>Suggestions are optional. Enter a new address when the destination is missing.</p>
      </div>
      <form class="demo-panel demo-autocomplete-stack" (submit)="submit($event)">
        <vd-field
          label="Адреса доставки"
          hint="Введіть щонайменше 2 символи. Можна залишити власну адресу."
          error="Вкажіть адресу доставки"
        >
          <input
            [vdAutocomplete]="addresses"
            [formControl]="address"
            name="address"
            required
            [readOnly]="addressReadonly()"
            (queryChange)="search($event)"
            placeholder="Наприклад, Київ"
          />
          <vd-autocomplete
            #addresses
            [options]="results()"
            [loading]="loading()"
            [errorText]="error()"
            label="Знайдені адреси"
            loadingText="Шукаємо адреси…"
            [emptyText]="
              query().trim().length < 2
                ? 'Введіть щонайменше 2 символи для пошуку.'
                : 'Адресу не знайдено. Залиште введений текст або уточніть пошук.'
            "
            [resultsText]="resultText"
            (optionSelected)="selectedId.set($event.id)"
          />
        </vd-field>
        <p class="demo-autocomplete-note">
          Демонстраційний пошук працює локально із затримкою. Запит «помилка» показує недоступність
          підказок, «повільно» — довгу відповідь.
        </p>
        @if (error()) {
          <div>
            <button vdButton variant="secondary" type="button" (click)="search(address.value)">
              Повторити пошук
            </button>
          </div>
        }
        <div class="demo-actions">
          <button vdButton type="submit">Зберегти адресу</button>
          <button vdButton type="button" variant="secondary" (click)="reset()">
            Очистити адресу
          </button>
          <button vdButton type="button" variant="ghost" (click)="toggleDisabled()">
            {{ address.disabled ? 'Увімкнути поле' : 'Вимкнути поле' }}
          </button>
          <button
            vdButton
            type="button"
            variant="ghost"
            (click)="addressReadonly.set(!addressReadonly())"
          >
            {{ addressReadonly() ? 'Дозволити редагування' : 'Лише читання' }}
          </button>
        </div>
        <p class="demo-token" data-testid="address-value">Текст: {{ address.value || '—' }}</p>
        <p class="demo-token" data-testid="address-id">
          Підказка: {{ selectedId() || 'не вибрана' }}
        </p>
        <p role="status" data-testid="address-submitted">{{ saved() }}</p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="local-title">
      <div class="demo-section__head">
        <h2 id="local-title">Local suggestions and Signal Forms</h2>
        <p>Native text editing, validation and form updates work with the same input.</p>
      </div>
      <div class="demo-panel demo-autocomplete-stack">
        <vd-field
          label="Напрям роботи української команди"
          hint="Оберіть наявний напрям або введіть власний."
          error="Вкажіть напрям роботи"
        >
          <input [vdAutocomplete]="local" [formField]="organization.name" />
          <vd-autocomplete
            #local
            [options]="localOptions()"
            label="Напрями роботи"
            emptyText="Такого напряму ще немає. Можна використати введену назву."
            [resultsText]="resultText"
          />
        </vd-field>
        <p class="demo-token" data-testid="signal-value">
          Напрям: {{ organizationModel().name || '—' }}
        </p>
        <div>
          <button
            vdButton
            variant="secondary"
            (click)="organizationModel.set({ name: 'Власний напрям' })"
          >
            Установити власний напрям
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="autocomplete-sizes">
      <div class="demo-section__head"><h2 id="autocomplete-sizes">Sizes and native states</h2></div>
      <div class="demo-panel demo-autocomplete-grid">
        @for (size of sizes; track size) {
          <vd-field [label]="'Розмір ' + size"
            ><input
              [vdAutocomplete]="sized"
              [size]="size"
              placeholder="Власний напрям" /><vd-autocomplete
              #sized
              [options]="tags"
              label="Приклади напрямів"
              [resultsText]="resultText"
          /></vd-field>
        }
        <vd-field label="Недоступне поле"
          ><input [vdAutocomplete]="disabledPanel" value="Доставка" disabled /><vd-autocomplete
            #disabledPanel
            [options]="tags"
        /></vd-field>
        <vd-field label="Збережене значення"
          ><input
            [vdAutocomplete]="readonlyPanel"
            value="Контроль якості"
            readonly /><vd-autocomplete #readonlyPanel [options]="tags"
        /></vd-field>
        <vd-field label="Поле з помилкою перевірки" error="Уточніть назву напряму"
          ><input [vdAutocomplete]="invalidPanel" invalid value="Неповна назва" /><vd-autocomplete
            #invalidPanel
            [options]="tags"
            [resultsText]="resultText"
        /></vd-field>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="autocomplete-rtl">
      <div class="demo-section__head">
        <h2 id="autocomplete-rtl">RTL content</h2>
        <p>Text editing and list navigation follow the native input direction.</p>
      </div>
      <div class="demo-panel" dir="rtl" lang="ar">
        <vd-field label="اسم المؤسسة" hint="اختر اقتراحًا أو أدخل اسمًا جديدًا">
          <input [vdAutocomplete]="arabicPanel" [formControl]="arabic" />
          <vd-autocomplete
            #arabicPanel
            [options]="arabicOptions()"
            label="اقتراحات المؤسسات"
            emptyText="لا توجد اقتراحات. يمكنك الاحتفاظ بالنص الذي أدخلته."
            [resultsText]="arabicResultText"
          />
        </vd-field>
      </div>
    </section>
  `,
  styles: `
    .demo-autocomplete-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-autocomplete-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-autocomplete-note {
      font-size: var(--vd-text-sm);
      color: var(--vd-color-text-muted);
      max-inline-size: 70ch;
    }
    demo-autocomplete .demo-token {
      overflow-wrap: anywhere;
    }
  `,
})
export default class AutocompletePage {
  protected readonly address = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly addressReadonly = signal(false);
  protected readonly results = signal<readonly VdAutocompleteOption[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly saved = signal('');
  protected readonly tags = TAGS;
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly organizationModel = signal({ name: '' });
  protected readonly organization = form(this.organizationModel, (p) => required(p.name));
  protected readonly localOptions = computed(() =>
    TAGS.filter((o) => vdMatchesQuery(o.label, this.organizationModel().name)),
  );
  protected readonly arabic = new FormControl('', { nonNullable: true });
  private readonly arabicQuery = signal('');
  protected readonly arabicOptions = computed(() =>
    [
      { id: 'food', label: 'شركة الصناعات الغذائية', description: 'الإنتاج ومراقبة الجودة' },
      {
        id: 'supply',
        label: 'مؤسسة التوريد والتوزيع',
        description: 'خدمة المستودعات والفروع الإقليمية',
      },
    ].filter((o) => vdMatchesQuery(o.label, this.arabicQuery())),
  );
  protected readonly resultText = (count: number) =>
    `Доступних підказок: ${count}. Стрілками оберіть підказку або залиште власний текст.`;
  protected readonly arabicResultText = (count: number) => `عدد الاقتراحات المتاحة: ${count}`;
  private generation = 0;
  private debounce: ReturnType<typeof setTimeout> | null = null;
  private readonly requests = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    const destroy = inject(DestroyRef);
    const arabicSubscription = this.arabic.valueChanges.subscribe((value) =>
      this.arabicQuery.set(value),
    );
    destroy.onDestroy(() => {
      this.generation++;
      if (this.debounce) clearTimeout(this.debounce);
      for (const request of this.requests) clearTimeout(request);
      arabicSubscription.unsubscribe();
    });
  }

  protected search(value: string): void {
    const generation = ++this.generation;
    if (this.debounce) clearTimeout(this.debounce);
    this.query.set(value);
    this.results.set([]);
    this.error.set('');
    this.selectedId.set(null);
    if (value.trim().length < 2) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.debounce = setTimeout(() => {
      this.debounce = null;
      const request = setTimeout(
        () => {
          this.requests.delete(request);
          if (generation !== this.generation) return;
          this.loading.set(false);
          if (value.trim().toLowerCase() === 'помилка')
            this.error.set(
              'Підказки тимчасово недоступні. Спробуйте ще раз або залиште введену адресу.',
            );
          else
            this.results.set(
              value === 'повільно'
                ? [{ id: 'slow', label: 'Повільний результат' }]
                : PLACES.filter((p) => vdMatchesQuery(p.label, value)),
            );
        },
        value === 'повільно' ? 1500 : 450,
      );
      this.requests.add(request);
    }, 200);
  }

  protected reset(): void {
    this.generation++;
    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = null;
    this.address.reset();
    this.query.set('');
    this.results.set([]);
    this.loading.set(false);
    this.error.set('');
    this.selectedId.set(null);
    this.saved.set('');
  }

  protected toggleDisabled(): void {
    if (this.address.disabled) this.address.enable();
    else this.address.disable();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    this.saved.set(`Збережена адреса: ${data.get('address') ?? 'поле недоступне'}`);
  }
}
