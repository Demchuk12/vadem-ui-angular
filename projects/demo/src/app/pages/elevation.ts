import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'demo-elevation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 04</p>
      <h1>Elevation</h1>
      <p>
        Layered shadows with tinted ink, a 1px top highlight on dark surfaces, and glass only where
        content scrolls underneath.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="shadows">
      <div class="demo-section__head">
        <p class="vd-eyebrow">2–3 layers each</p>
        <h2 id="shadows">Shadows</h2>
      </div>
      <div class="demo-elev-stage">
        @for (s of shadows; track s.token) {
          <div
            class="demo-elev"
            [style.box-shadow]="'var(--vd-highlight-top), var(' + s.token + ')'"
            [style.background]="'var(' + s.surface + ')'"
          >
            <strong>{{ s.label }}</strong>
            <span class="demo-token">{{ s.token }}</span>
            <span class="demo-token">{{ s.surface }}</span>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="highlight">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signature</p>
        <h2 id="highlight">Top highlight</h2>
        <p>
          <code>inset 0 1px 0</code> with low-alpha white catches light on the top edge of raised
          dark surfaces. Transparent in the light theme.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: 14rem">
        <div
          class="demo-elev"
          style="background: var(--vd-color-surface-raised); box-shadow: var(--vd-shadow-md)"
        >
          <strong>Without</strong>
        </div>
        <div
          class="demo-elev"
          style="background: var(--vd-color-surface-raised); box-shadow: var(--vd-highlight-top), var(--vd-shadow-md)"
        >
          <strong>With highlight</strong>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="glass">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Overlays only</p>
        <h2 id="glass">Glass & backdrop</h2>
      </div>
      <div class="demo-glass-stage">
        <div class="demo-glass-blob"></div>
        <div class="demo-glass">
          <strong>Popover surface</strong>
          <p>Blur with a solid fallback. Used for popovers and sticky headers.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-elev-stage {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
      gap: var(--vd-space-8);
      padding: var(--vd-space-10);
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-bg);
      border: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-elev {
      display: grid;
      gap: var(--vd-space-1);
      align-content: end;
      min-block-size: 9rem;
      padding: var(--vd-space-5);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-surface);
    }
    .demo-glass-stage {
      position: relative;
      display: grid;
      place-items: center;
      min-block-size: 18rem;
      overflow: hidden;
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-surface-sunken);
      border: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-glass-blob {
      position: absolute;
      inset-block-start: 15%;
      inset-inline-start: 30%;
      inline-size: 14rem;
      aspect-ratio: 1;
      border-radius: var(--vd-radius-full);
      background: radial-gradient(circle, var(--vd-accent-500), transparent 70%);
    }
    .demo-glass {
      position: relative;
      display: grid;
      gap: var(--vd-space-2);
      max-inline-size: 20rem;
      padding: var(--vd-space-5);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-overlay);
      background: var(--vd-color-surface-overlay);
      box-shadow: var(--vd-highlight-top), var(--vd-shadow-lg);
    }
    .demo-glass p {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    @supports (backdrop-filter: blur(1px)) {
      .demo-glass {
        background: var(--vd-color-surface-glass);
        backdrop-filter: var(--vd-backdrop-glass);
      }
    }
  `,
})
export default class ElevationPage {
  protected readonly shadows = [
    { label: 'Small', token: '--vd-shadow-sm', surface: '--vd-color-surface' },
    { label: 'Medium', token: '--vd-shadow-md', surface: '--vd-color-surface-raised' },
    { label: 'Large', token: '--vd-shadow-lg', surface: '--vd-color-surface-overlay' },
  ];
}
