import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'demo-space',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 03</p>
      <h1>Space & shape</h1>
      <p>A 4px spacing scale, a small radius scale, and density as a single multiplier.</p>
    </header>

    <section class="demo-section" aria-labelledby="spacing">
      <div class="demo-section__head">
        <p class="vd-eyebrow">4px base</p>
        <h2 id="spacing">Spacing</h2>
      </div>
      <div class="demo-panel demo-spaces" role="region" aria-label="Шкала відступів" tabindex="0">
        @for (s of spaces; track s.token) {
          <span class="demo-token">{{ s.token }}</span>
          <span class="demo-token vd-tabular">{{ s.px }}px</span>
          <span class="demo-space-bar" [style.inline-size]="'var(' + s.token + ')'"></span>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="radius">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Radius</p>
        <h2 id="radius">Radii</h2>
        <p>
          Semantic radii: <code>control</code> (8), <code>surface</code> (12),
          <code>overlay</code> (16). Squircle corners apply where the browser supports
          <code>corner-shape</code>.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: 8rem">
        @for (r of radii; track r) {
          <div class="demo-radius" [style.border-radius]="'var(' + r + ')'">
            <span class="demo-token">{{ r.replace('--vd-radius-', '') }}</span>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="concentric">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signature</p>
        <h2 id="concentric">Concentric radii</h2>
        <p>Inner radius = outer radius − padding. The right one keeps the curves parallel.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 16rem">
        <figure class="demo-concentric">
          <div class="demo-concentric__outer">
            <div class="demo-concentric__inner" style="border-radius: var(--vd-radius-2xl)"></div>
          </div>
          <figcaption class="demo-token">same radius · wrong</figcaption>
        </figure>
        <figure class="demo-concentric">
          <div class="demo-concentric__outer">
            <div
              class="demo-concentric__inner"
              style="border-radius: calc(var(--vd-radius-2xl) - var(--vd-space-3))"
            ></div>
          </div>
          <figcaption class="demo-token">outer − padding · right</figcaption>
        </figure>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="density">
      <div class="demo-section__head">
        <p class="vd-eyebrow">--vd-density</p>
        <h2 id="density">Control heights & density</h2>
        <p>
          Control heights scale with density. Switch density in the header, or set it per subtree.
        </p>
      </div>
      <div class="demo-panel demo-density">
        @for (d of densities; track d) {
          <div class="demo-density__col" [attr.data-density]="d === 'default' ? null : d">
            <p class="vd-eyebrow">{{ d }}</p>
            @for (h of heights; track h) {
              <div class="demo-control" [style.block-size]="'var(--vd-control-height-' + h + ')'">
                <span>{{ h }}</span>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .demo-spaces {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      align-items: center;
      gap: var(--vd-space-2) var(--vd-space-6);
      overflow: auto;
    }
    .demo-spaces:focus-visible {
      outline: var(--vd-focus-ring-width) solid var(--vd-color-focus);
      outline-offset: var(--vd-focus-ring-offset);
    }
    .demo-space-bar {
      block-size: var(--vd-space-3);
      border-radius: var(--vd-radius-xs);
      background: linear-gradient(90deg, var(--vd-accent-500), var(--vd-accent-700));
    }
    .demo-radius {
      display: grid;
      place-items: end start;
      aspect-ratio: 1;
      padding: var(--vd-space-3);
      border: var(--vd-border-width) solid var(--vd-color-border-strong);
      background: var(--vd-color-surface);
      box-shadow: var(--vd-highlight-top);
    }
    @supports (corner-shape: squircle) {
      .demo-radius {
        corner-shape: squircle;
      }
    }
    .demo-concentric {
      display: grid;
      gap: var(--vd-space-3);
      margin: 0;
    }
    .demo-concentric__outer {
      padding: var(--vd-space-3);
      border-radius: var(--vd-radius-2xl);
      background: var(--vd-color-surface-raised);
      border: var(--vd-border-width) solid var(--vd-color-border);
      box-shadow: var(--vd-highlight-top), var(--vd-shadow-md);
    }
    .demo-concentric__inner {
      block-size: var(--vd-space-24);
      background: var(--vd-color-action-subtle);
      border: var(--vd-border-width) solid var(--vd-color-border-strong);
    }
    .demo-density {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
      gap: var(--vd-space-6);
    }
    .demo-density__col {
      display: grid;
      gap: var(--vd-space-3);
      align-content: start;
    }
    .demo-control {
      display: flex;
      align-items: center;
      padding-inline: var(--vd-space-3);
      border: var(--vd-border-width) solid var(--vd-color-border-control);
      border-radius: var(--vd-radius-control);
      font-size: var(--vd-text-sm);
      color: var(--vd-color-text-muted);
    }
  `,
})
export default class SpacePage {
  protected readonly spaces = [
    ['0-5', 2],
    ['1', 4],
    ['1-5', 6],
    ['2', 8],
    ['3', 12],
    ['4', 16],
    ['5', 20],
    ['6', 24],
    ['8', 32],
    ['10', 40],
    ['12', 48],
    ['16', 64],
    ['20', 80],
    ['24', 96],
  ].map(([k, px]) => ({ token: `--vd-space-${k}`, px }));

  protected readonly radii = [
    '--vd-radius-xs',
    '--vd-radius-sm',
    '--vd-radius-md',
    '--vd-radius-lg',
    '--vd-radius-xl',
    '--vd-radius-2xl',
    '--vd-radius-full',
  ];

  protected readonly densities = ['compact', 'default', 'comfortable'];
  protected readonly heights = ['sm', 'md', 'lg'];
}
