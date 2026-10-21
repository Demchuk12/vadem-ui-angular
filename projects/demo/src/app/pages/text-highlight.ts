import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VD_AUTOCOMPLETE, type VdAutocompleteOption } from '@vadem/ui/autocomplete';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VD_SEARCH_INPUT } from '@vadem/ui/search-input';
import { VD_TABLE } from '@vadem/ui/table';
import { VdTextHighlight } from '@vadem/ui/text-highlight';

@Component({
  selector: 'demo-text-highlight',
  imports: [
    ReactiveFormsModule,
    VdField,
    VdInput,
    VD_SEARCH_INPUT,
    VD_AUTOCOMPLETE,
    VD_TABLE,
    VdTextHighlight,
  ],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Text highlight</p>
      <h1>Text highlight</h1>
      <p>
        Literal search matches in their original context. Every match keeps its spelling, text
        direction and place in the sentence.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="highlight-results-heading">
      <div class="demo-section__head">
        <h2 id="highlight-results-heading">Знайти в тексті</h2>
        <p>Збіги підсвічуються без урахування регістру. Усі записи залишаються видимими.</p>
      </div>
      <div class="demo-panel demo-highlight">
        <vd-field label="Що підсвітити?">
          <vd-search-input
            ><input vdSearchInput type="search" [formControl]="query"
          /></vd-search-input>
        </vd-field>
        <ul class="demo-highlight__results" role="list" data-testid="highlight-results">
          @for (record of records; track record.id) {
            <li>
              <a href="#highlight-table"
                ><vd-text-highlight [text]="record.title" [query]="queryValue()"
              /></a>
              <p><vd-text-highlight [text]="record.description" [query]="queryValue()" /></p>
            </li>
          }
        </ul>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="highlight-table-heading" id="highlight-table">
      <div class="demo-section__head">
        <h2 id="highlight-table-heading">У таблиці</h2>
        <p>Той самий запит, без зміни сортування чи вмісту клітинок.</p>
      </div>
      <div vdTableScroll aria-label="Звіти виробництва" tabindex="0">
        <table vdTable>
          <caption class="vd-visually-hidden">
            Звіти виробництва
          </caption>
          <thead>
            <tr>
              <th scope="col">Документ</th>
              <th scope="col">Відповідальний підрозділ</th>
            </tr>
          </thead>
          <tbody>
            @for (record of records; track record.id) {
              <tr>
                <td><vd-text-highlight [text]="record.title" [query]="queryValue()" /></td>
                <td>{{ record.team }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="highlight-autocomplete-heading">
      <div class="demo-section__head">
        <h2 id="highlight-autocomplete-heading">У підказках Autocomplete</h2>
        <p>
          Підсвічування не змінює набір підказок. Стрілки обирають підказку, Enter підтверджує її.
        </p>
      </div>
      <div class="demo-panel demo-highlight">
        <vd-field label="Знайти документ">
          <input [vdAutocomplete]="suggestions" [formControl]="documentQuery" />
          <vd-autocomplete #suggestions [options]="options" [highlightQuery]="documentValue()" />
        </vd-field>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="highlight-content-heading">
      <div class="demo-section__head">
        <h2 id="highlight-content-heading">Literal and multilingual content</h2>
      </div>
      <div class="demo-panel demo-highlight">
        <vd-field label="Текст прикладу">
          <textarea vdInput rows="2" [formControl]="source"></textarea>
        </vd-field>
        <vd-field label="Дослівний запит"><input vdInput [formControl]="literalQuery" /></vd-field>
        <p class="demo-highlight__literal">
          <vd-text-highlight
            data-testid="literal-highlight"
            [text]="sourceValue()"
            [query]="literalValue()"
          />
        </p>
        <p>
          <vd-text-highlight
            data-testid="ukrainian-highlight"
            text="ҐАНОК і ґанок. ЇЖАК, їжак. ЄДНІСТЬ, єдність. ІНЖЕНЕР, інженер."
            query="їжак"
          />
        </p>
        <p dir="rtl" lang="ar">
          <vd-text-highlight
            data-testid="arabic-highlight"
            text="تقرير جودة الإنتاج وتقرير متابعة التعبئة"
            query="تقرير"
          />
        </p>
        <p><vd-text-highlight text="This text has no match." query="звіт" /></p>
        <p><vd-text-highlight text="An empty query leaves this text intact." /></p>
        <p>
          <vd-text-highlight
            data-testid="long-highlight"
            [text]="longText"
            query="відповідальність"
          />
        </p>
      </div>
    </section>
  `,
  styles: `
    .demo-highlight {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-5);
      max-inline-size: 42rem;
    }
    .demo-highlight.demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-highlight__results {
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--vd-space-5);
    }
    .demo-highlight__results li {
      display: grid;
      gap: var(--vd-space-1);
    }
    .demo-highlight__results a {
      font-weight: var(--vd-weight-semibold);
    }
    .demo-highlight__results p {
      color: var(--vd-color-text-muted);
    }
    .demo-highlight p,
    .demo-highlight a,
    .demo-highlight .vd-field__label {
      overflow-wrap: anywhere;
    }
    .demo-highlight__literal {
      white-space: pre-wrap;
    }
  `,
})
export default class TextHighlightPage {
  readonly query = new FormControl('звіт', { nonNullable: true });
  readonly queryValue = toSignal(this.query.valueChanges, { initialValue: this.query.value });
  readonly records = [
    {
      id: 'shift',
      title: 'Звіт за виробничу зміну',
      description: 'Перевірте звіт перед передаванням наступній команді.',
      team: 'Фасування',
    },
    {
      id: 'quality',
      title: 'Щотижневий звіт з якості',
      description: 'ЗВІТ містить результати перевірки продукції та звіт про відхилення.',
      team: 'Контроль якості',
    },
    {
      id: 'maintenance',
      title: 'Журнал технічного обслуговування',
      description: 'Огляд обладнання, налаштування лінії та виконані роботи.',
      team: 'Служба обладнання',
    },
  ];
  readonly documentQuery = new FormControl('звіт', { nonNullable: true });
  readonly documentValue = toSignal(this.documentQuery.valueChanges, {
    initialValue: this.documentQuery.value,
  });
  readonly options: readonly VdAutocompleteOption[] = this.records.map((record) => ({
    id: record.id,
    label: record.title,
    description: record.id === 'maintenance' ? 'Архівний документ' : record.team,
    disabled: record.id === 'maintenance',
  }));
  readonly source = new FormControl(
    'Позначення [line].* у звіті. Повтор: [LINE].*\n<strong>Це звичайний текст.</strong>',
    { nonNullable: true },
  );
  readonly sourceValue = toSignal(this.source.valueChanges, { initialValue: this.source.value });
  readonly literalQuery = new FormControl('[line].*', { nonNullable: true });
  readonly literalValue = toSignal(this.literalQuery.valueChanges, {
    initialValue: this.literalQuery.value,
  });
  readonly longText = 'ВідповідальністьЗаЯкістьВиробничоїДільниці'.repeat(3);
}
