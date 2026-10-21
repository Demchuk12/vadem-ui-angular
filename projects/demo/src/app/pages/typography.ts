import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'demo-typography',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 02</p>
      <h1>Typography</h1>
      <p>
        Manrope for interface and headings, JetBrains Mono for code and labels. A 1.25 modular
        scale, fluid from <code>xl</code> up, with tracking tuned per size.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="scale">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Scale · ratio 1.25</p>
        <h2 id="scale">Type scale</h2>
      </div>
      <div class="demo-panel demo-scale">
        @for (s of scale; track s.token) {
          <div class="demo-scale__row">
            <span class="demo-token">{{ s.token }}</span>
            <span
              class="demo-scale__sample"
              [style.font-size]="'var(' + s.token + ')'"
              [style.font-weight]="s.weight"
              [style.letter-spacing]="s.tracking"
              [style.line-height]="'var(--vd-leading-tight)'"
              >{{ s.sample }}</span
            >
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="hierarchy">
      <div class="demo-section__head">
        <p class="vd-eyebrow">In composition</p>
        <h2 id="hierarchy">Hierarchy</h2>
      </div>
      <article class="demo-panel demo-article" lang="uk">
        <p class="vd-eyebrow">Реліз · 2 жовтня 2026</p>
        <h3>Швидкі інтерфейси без зайвих залежностей</h3>
        <p>
          Vadem — це бібліотека компонентів, у якій кожен стан продуманий: наведення, фокус,
          завантаження й помилка. Ґрунтовна типографіка, їжакові голки акуратних меж і єдина система
          токенів — щоб інтерфейс читався навіть у відтінках сірого.
        </p>
        <p class="demo-muted">
          Довгі слова на кшталт «найвисокопродуктивніший» або «електрокардіографічний» не мають
          ламати верстку.
        </p>
      </article>
      <article class="demo-panel demo-article" lang="en">
        <p class="vd-eyebrow">Changelog · v0.1</p>
        <h3>Designed states, not decorated defaults</h3>
        <p>
          Every component ships with hover, focus, loading and invalid states that share one
          vocabulary of tokens. The quick brown fox jumps over the lazy dog.
        </p>
      </article>
    </section>

    <section class="demo-section" aria-labelledby="weights">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Variable · 200–800</p>
        <h2 id="weights">Weights & glyphs</h2>
      </div>
      <div class="demo-panel demo-weights" lang="uk">
        @for (w of weights; track w.token) {
          <div class="demo-weights__row">
            <span class="demo-token">{{ w.token }}</span>
            <span [style.font-weight]="'var(' + w.token + ')'"
              >Ґанок їжака є, і ґудзик — Aa Gg 0123 ₴ №</span
            >
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="numbers">
      <div class="demo-section__head">
        <p class="vd-eyebrow">font-variant-numeric</p>
        <h2 id="numbers">Tabular figures</h2>
        <p>Tables, prices and counters use tabular figures so columns line up.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 16rem">
        <div class="demo-panel">
          <p class="vd-eyebrow">proportional</p>
          @for (n of numbers; track n) {
            <p class="demo-number">{{ n }}</p>
          }
        </div>
        <div class="demo-panel">
          <p class="vd-eyebrow">tabular</p>
          @for (n of numbers; track n) {
            <p class="demo-number vd-tabular">{{ n }}</p>
          }
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="mono">
      <div class="demo-section__head">
        <p class="vd-eyebrow">JetBrains Mono</p>
        <h2 id="mono">Code & labels</h2>
        <p>
          Inline <code>--vd-hue-accent</code>, keyboard keys <kbd>Ctrl</kbd> + <kbd>K</kbd>, and
          blocks:
        </p>
      </div>
      <pre><code>{{ code }}</code></pre>
      <div class="demo-eyebrows">
        <span class="vd-eyebrow">Eyebrow label</span>
        <span class="vd-eyebrow" lang="uk">Мітка розділу</span>
        <span class="vd-eyebrow">v0.0.1 · MIT</span>
      </div>
    </section>
  `,
  styles: `
    .demo-scale {
      display: grid;
      gap: var(--vd-space-5);
      overflow: hidden;
    }
    .demo-scale__row {
      display: grid;
      grid-template-columns: 9rem minmax(0, 1fr);
      align-items: baseline;
      gap: var(--vd-space-4);
    }
    .demo-scale__sample {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .demo-article {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-3);
      max-inline-size: 44rem;
    }
    .demo-article p {
      color: var(--vd-color-text-muted);
      max-inline-size: 65ch;
    }
    .demo-article .vd-eyebrow {
      color: var(--vd-color-text-accent);
    }
    .demo-weights {
      display: grid;
      gap: var(--vd-space-3);
      font-size: var(--vd-text-xl);
    }
    .demo-weights__row {
      display: grid;
      grid-template-columns: 12rem minmax(0, 1fr);
      align-items: baseline;
      gap: var(--vd-space-4);
    }
    .demo-number {
      font-size: var(--vd-text-lg);
      font-weight: var(--vd-weight-semibold);
      text-align: end;
    }
    .demo-eyebrows {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-6);
    }
    @container (width < 36rem) {
      .demo-scale__row,
      .demo-weights__row {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--vd-space-1);
      }
    }
  `,
})
export default class TypographyPage {
  protected readonly scale = [
    {
      token: '--vd-text-4xl',
      sample: 'Інтерфейс, що дихає',
      weight: 800,
      tracking: 'var(--vd-tracking-tighter)',
    },
    {
      token: '--vd-text-3xl',
      sample: 'Bold hierarchy, quiet surfaces',
      weight: 700,
      tracking: 'var(--vd-tracking-tight)',
    },
    {
      token: '--vd-text-2xl',
      sample: 'Налаштування профілю',
      weight: 700,
      tracking: 'var(--vd-tracking-tight)',
    },
    {
      token: '--vd-text-xl',
      sample: 'Section heading',
      weight: 700,
      tracking: 'var(--vd-tracking-tight)',
    },
    {
      token: '--vd-text-lg',
      sample: 'Лід-абзац і заголовок картки',
      weight: 600,
      tracking: 'var(--vd-tracking-normal)',
    },
    {
      token: '--vd-text-md',
      sample: 'Body text — основний текст інтерфейсу',
      weight: 400,
      tracking: 'var(--vd-tracking-normal)',
    },
    {
      token: '--vd-text-sm',
      sample: 'Controls, labels, secondary text — підписи',
      weight: 500,
      tracking: 'var(--vd-tracking-normal)',
    },
    {
      token: '--vd-text-xs',
      sample: 'Captions and metadata — дрібні примітки',
      weight: 500,
      tracking: 'var(--vd-tracking-normal)',
    },
  ];

  protected readonly weights = [
    { token: '--vd-weight-regular' },
    { token: '--vd-weight-medium' },
    { token: '--vd-weight-semibold' },
    { token: '--vd-weight-bold' },
    { token: '--vd-weight-extrabold' },
  ];

  protected readonly numbers = ['₴ 1 111,11', '₴ 98 404,00', '₴ 7 777,70', '₴ 120 000,01'];

  protected readonly code = `:root {
  /* Re-theme the whole library with one value */
  --vd-hue-accent: 285;
}

const greeting = 'Привіт, світе'; // => 0O 1lI {}[] != === ->`;
}
