import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { VdField } from '@vadem/ui/field';
import { VdKbd } from '@vadem/ui/kbd';
import { vdLocaleEn, vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdNumberInput, VdNumberInputGroup } from '@vadem/ui/number-input';
import { VdPagination } from '@vadem/ui/pagination';
import { VdRating } from '@vadem/ui/rating';

/** The same markup in every panel: no text inputs are set, so all strings come from the locale. */
@Component({
  selector: 'demo-locale-sample',
  imports: [VdField, VdKbd, VdNumberInput, VdNumberInputGroup, VdPagination, VdRating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-pagination [pageCount]="12" [(page)]="page" />
    <vd-field [label]="quantityLabel()">
      <vd-number-input>
        <input vdNumberInput type="number" min="0" max="10" value="3" />
      </vd-number-input>
    </vd-field>
    <vd-rating [label]="ratingLabel()" [(value)]="rating" />
    <p><vd-kbd keys="G D" platform="other" /></p>
  `,
  styles: `
    :host {
      display: grid;
      /* An auto track would grow to the pagination's full width; let it scroll instead. */
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-5);
      justify-items: start;
    }
    p {
      margin: 0;
    }
  `,
})
class LocaleSample {
  readonly quantityLabel = input.required<string>();
  readonly ratingLabel = input.required<string>();
  protected readonly page = signal(4);
  protected readonly rating = signal(3);
}

@Component({
  selector: 'demo-locale-en',
  imports: [LocaleSample],
  providers: [vdLocaleProvider(vdLocaleEn)],
  template: `<demo-locale-sample quantityLabel="Quantity" ratingLabel="Rating" />`,
})
class EnglishPanel {}

@Component({
  selector: 'demo-locale-uk',
  imports: [LocaleSample],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `<demo-locale-sample quantityLabel="Кількість" ratingLabel="Оцінка" />`,
})
class UkrainianPanel {}

@Component({
  selector: 'demo-locale',
  imports: [EnglishPanel, UkrainianPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / Localization</p>
      <h1>Localization</h1>
      <p>
        Component strings (button names, announcements, plural counts) come from one locale. Provide
        it once for the app, or for a single subtree; any text input still overrides it.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="locale-panels">
      <div class="demo-section__head">
        <h2 id="locale-panels">Same markup, two locales</h2>
        <p>
          Hover the pagination arrows or use a screen reader: names, the rating's plural forms and
          the shortcut's spoken "then" follow the panel's locale.
        </p>
      </div>
      <div class="demo-locale-grid">
        <section class="demo-panel" aria-labelledby="locale-en" lang="en">
          <h3 id="locale-en">English · <code>vdLocaleEn</code></h3>
          <demo-locale-en />
        </section>
        <section class="demo-panel" aria-labelledby="locale-uk" lang="uk">
          <h3 id="locale-uk">Українська · <code>vdLocaleUk</code></h3>
          <demo-locale-uk />
        </section>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="locale-setup">
      <div class="demo-section__head">
        <h2 id="locale-setup">Setup</h2>
      </div>
      <pre><code>{{ setup }}</code></pre>
    </section>
  `,
  styles: `
    .demo-locale-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
      gap: var(--vd-space-4);
    }
    .demo-locale-grid h3 {
      margin-block-end: var(--vd-space-5);
      font-size: var(--vd-text-md);
    }
  `,
})
export default class LocalePage {
  protected readonly setup = `// app.config.ts
import { provideVdLocale, vdLocaleUk } from '@vadem/ui/locale';

providers: [provideVdLocale(vdLocaleUk)]

// One subtree only
@Component({ providers: [vdLocaleProvider(vdLocaleEn)] })

// Your own language: a full VdLocale object (TypeScript lists every key)
const pl: VdLocale = { ...vdLocaleEn, code: 'pl', toast: { label: 'Powiadomienia', closeLabel: 'Zamknij' } };`;
}
