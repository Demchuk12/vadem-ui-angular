import { ChangeDetectionStrategy, Component } from '@angular/core';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const NEUTRAL_STEPS = [
  0, 50, 100, 150, 200, 300, 400, 500, 550, 600, 700, 800, 850, 900, 925, 950, 975, 1000,
];

interface Swatch {
  label: string;
  token: string;
  text?: string;
}

@Component({
  selector: 'demo-colors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 01</p>
      <h1>Color</h1>
      <p>
        One hue drives everything. Neutrals carry a hint of it, statuses share the same lightness
        curve, and themes only swap the semantic layer. Drag the hue slider to re-theme.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="ramps">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Primitives</p>
        <h2 id="ramps">Ramps</h2>
        <p>
          <code>oklch()</code> ramps built from one shared lightness and chroma curve. Components
          never use these directly.
        </p>
      </div>

      <div class="demo-ramp">
        <p class="demo-ramp__name vd-eyebrow">neutral</p>
        <div class="demo-ramp__row demo-ramp__row--neutral">
          @for (s of neutralSteps; track s) {
            <div
              class="demo-ramp__chip"
              [class.is-dark]="s >= 500"
              [style.background]="'var(--vd-neutral-' + s + ')'"
            >
              <span>{{ s }}</span>
            </div>
          }
        </div>
      </div>

      @for (family of families; track family) {
        <div class="demo-ramp">
          <p class="demo-ramp__name vd-eyebrow">{{ family }}</p>
          <div class="demo-ramp__row">
            @for (s of steps; track s) {
              <div
                class="demo-ramp__chip"
                [class.is-dark]="s >= 500"
                [style.background]="'var(--vd-' + family + '-' + s + ')'"
              >
                <span>{{ s }}</span>
              </div>
            }
          </div>
        </div>
      }
    </section>

    <section class="demo-section" aria-labelledby="surfaces">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Semantic</p>
        <h2 id="surfaces">Surfaces</h2>
        <p>In the dark theme elevation reads through lightness: each level is a step brighter.</p>
      </div>
      <div class="demo-surfaces">
        @for (s of surfaces; track s.token) {
          <div class="demo-surface" [style.background]="'var(' + s.token + ')'">
            <strong>{{ s.label }}</strong>
            <span class="demo-token">{{ s.token }}</span>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="text">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Semantic</p>
        <h2 id="text">Text & borders</h2>
      </div>
      <div class="demo-panel demo-text-samples">
        @for (t of texts; track t.token) {
          <div class="demo-text-sample">
            <span [style.color]="'var(' + t.token + ')'">{{ t.text }}</span>
            <span class="demo-token">{{ t.token }}</span>
          </div>
        }
        <hr />
        <div class="demo-borders">
          @for (b of borders; track b.token) {
            <div class="demo-border" [style.border-color]="'var(' + b.token + ')'">
              <span class="demo-token">{{ b.token }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="status">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Semantic</p>
        <h2 id="status">Action & status</h2>
        <p>
          Accent stays rare: one solid action per view. Statuses pair a subtle fill with strong
          text.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: 15rem">
        <div
          class="demo-status"
          style="--s: var(--vd-color-action); --s-text: var(--vd-color-text-accent); --s-subtle: var(--vd-color-action-subtle); --s-on: var(--vd-color-on-action)"
        >
          <span class="demo-status__solid">Зберегти зміни</span>
          <span class="demo-status__subtle">action · дія</span>
        </div>
        @for (s of statuses; track s.name) {
          <div
            class="demo-status"
            [style.--s]="'var(--vd-color-' + s.name + ')'"
            [style.--s-text]="'var(--vd-color-' + s.name + '-text)'"
            [style.--s-subtle]="'var(--vd-color-' + s.name + '-subtle)'"
            [style.--s-border]="'var(--vd-color-' + s.name + '-border)'"
            [style.--s-on]="
              s.name === 'warning' ? 'var(--vd-color-on-warning)' : 'var(--vd-color-on-status)'
            "
          >
            <span class="demo-status__solid">{{ s.solid }}</span>
            <span class="demo-status__subtle">{{ s.subtle }}</span>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="chart">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Semantic</p>
        <h2 id="chart">Chart series</h2>
        <p>
          Eight categorical slots in a fixed order, validated for colour-vision deficiency in both
          themes. Charts take them in sequence and never cycle; single-series charts use the accent.
        </p>
      </div>
      <ol class="demo-chart-slots" role="list">
        @for (name of chartSlots; track name; let i = $index) {
          <li>
            <span
              class="demo-chart-slots__swatch"
              [style.background]="'var(--vd-color-chart-' + (i + 1) + ')'"
            ></span>
            <span class="demo-chart-slots__label"
              ><code>chart-{{ i + 1 }}</code> {{ name }}</span
            >
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    .demo-chart-slots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
      gap: var(--vd-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .demo-chart-slots li {
      display: grid;
      gap: var(--vd-space-2);
    }
    .demo-chart-slots__swatch {
      block-size: var(--vd-space-12);
      border-radius: var(--vd-radius-control);
    }
    .demo-chart-slots__label {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-ramp {
      display: grid;
      grid-template-columns: 6rem minmax(0, 1fr);
      align-items: center;
      gap: var(--vd-space-4);
    }
    .demo-ramp__row {
      display: grid;
      grid-template-columns: repeat(11, minmax(0, 1fr));
      border-radius: var(--vd-radius-control);
      overflow: hidden;
      border: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-ramp__row--neutral {
      grid-template-columns: repeat(18, minmax(0, 1fr));
    }
    .demo-ramp__chip {
      display: flex;
      align-items: end;
      block-size: var(--vd-space-12);
      padding: var(--vd-space-1);
    }
    .demo-ramp__chip span {
      font-family: var(--vd-font-mono);
      font-size: var(--vd-text-xs);
      color: var(--vd-neutral-900);
    }
    .demo-ramp__chip.is-dark span {
      color: var(--vd-neutral-50);
    }
    .demo-surfaces {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
      padding: var(--vd-space-4);
      gap: var(--vd-space-3);
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-bg);
      border: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-surface {
      display: grid;
      gap: var(--vd-space-1);
      align-content: end;
      min-block-size: 7rem;
      padding: var(--vd-space-4);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-control);
      box-shadow: var(--vd-highlight-top);
    }
    .demo-text-samples {
      display: grid;
      gap: var(--vd-space-3);
    }
    .demo-text-sample {
      display: flex;
      justify-content: space-between;
      gap: var(--vd-space-4);
      flex-wrap: wrap;
      font-size: var(--vd-text-lg);
      font-weight: var(--vd-weight-medium);
    }
    .demo-borders {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
      gap: var(--vd-space-3);
    }
    .demo-border {
      padding: var(--vd-space-4);
      border: var(--vd-border-width) solid;
      border-radius: var(--vd-radius-control);
    }
    .demo-status {
      display: grid;
      gap: var(--vd-space-2);
      padding: var(--vd-space-3);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-surface);
    }
    .demo-status__solid,
    .demo-status__subtle {
      padding: var(--vd-space-2) var(--vd-space-3);
      border-radius: max(var(--vd-radius-xs), calc(var(--vd-radius-surface) - var(--vd-space-3)));
      font-size: var(--vd-text-sm);
      font-weight: var(--vd-weight-semibold);
    }
    .demo-status__solid {
      background: var(--s);
      color: var(--s-on);
    }
    .demo-status__subtle {
      background: var(--s-subtle);
      color: var(--s-text);
      box-shadow: inset 0 0 0 var(--vd-border-width) var(--s-border, transparent);
    }
  `,
})
export default class ColorsPage {
  protected readonly chartSlots = [
    'violet',
    'orange',
    'teal',
    'amber',
    'magenta',
    'green',
    'blue',
    'red',
  ];
  protected readonly steps = STEPS;
  protected readonly neutralSteps = NEUTRAL_STEPS;
  protected readonly families = ['accent', 'success', 'warning', 'danger', 'info'];

  protected readonly surfaces: Swatch[] = [
    { label: 'Sunken', token: '--vd-color-surface-sunken' },
    { label: 'Background', token: '--vd-color-bg' },
    { label: 'Surface', token: '--vd-color-surface' },
    { label: 'Raised', token: '--vd-color-surface-raised' },
    { label: 'Overlay', token: '--vd-color-surface-overlay' },
  ];

  protected readonly texts: Swatch[] = [
    { label: 'Text', token: '--vd-color-text', text: 'Основний текст — primary' },
    { label: 'Muted', token: '--vd-color-text-muted', text: 'Другорядний текст — muted' },
    { label: 'Subtle', token: '--vd-color-text-subtle', text: 'Підказка, placeholder — subtle' },
    { label: 'Disabled', token: '--vd-color-text-disabled', text: 'Недоступно — disabled' },
    { label: 'Accent', token: '--vd-color-text-accent', text: 'Посилання — accent' },
  ];

  protected readonly borders: Swatch[] = [
    { label: 'Border', token: '--vd-color-border' },
    { label: 'Strong', token: '--vd-color-border-strong' },
    { label: 'Control', token: '--vd-color-border-control' },
  ];

  protected readonly statuses = [
    { name: 'success', solid: 'Оплату отримано', subtle: 'success · успіх' },
    { name: 'warning', solid: 'Ліміт майже вичерпано', subtle: 'warning · увага' },
    { name: 'danger', solid: 'Видалити проєкт', subtle: 'danger · небезпека' },
    { name: 'info', solid: 'Нова версія', subtle: 'info · інформація' },
  ];
}
