import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'demo-motion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 05</p>
      <h1>Motion</h1>
      <p>
        Three durations, named easings, and a damped spring via <code>linear()</code>. Under reduced
        motion every duration collapses to zero.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="easing">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Durations × easings</p>
        <h2 id="easing">Play</h2>
      </div>
      <div>
        <button
          type="button"
          class="demo-button"
          (click)="played.update((v) => !v)"
          [attr.aria-pressed]="played()"
        >
          {{ played() ? 'Reset' : 'Play' }}
        </button>
      </div>
      <div class="demo-panel demo-tracks" [class.is-played]="played()">
        @for (e of easings; track e.token) {
          @for (d of durations; track d) {
            <span class="demo-token">{{ e.label }} · {{ d.replace('--vd-duration-', '') }}</span>
            <div class="demo-track">
              <span
                class="demo-dot"
                [style.transition-timing-function]="'var(' + e.token + ')'"
                [style.transition-duration]="'var(' + d + ')'"
              ></span>
            </div>
          }
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="press">
      <div class="demo-section__head">
        <p class="vd-eyebrow">--vd-press-scale</p>
        <h2 id="press">Press feedback</h2>
        <p>Interactive elements scale to 0.98 while pressed. Hold the button.</p>
      </div>
      <div><button type="button" class="demo-button">Натисни й тримай</button></div>
    </section>
  `,
  styles: `
    .demo-tracks {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: var(--vd-space-3) var(--vd-space-6);
    }
    .demo-track {
      position: relative;
      block-size: var(--vd-space-6);
      border-radius: var(--vd-radius-full);
      background: var(--vd-color-fill);
    }
    .demo-dot {
      position: absolute;
      inset-block: var(--vd-space-1);
      inset-inline-start: var(--vd-space-1);
      aspect-ratio: 1;
      border-radius: var(--vd-radius-full);
      background: var(--vd-color-action);
      box-shadow: var(--vd-highlight-top);
      transition-property: translate;
    }
    .is-played .demo-dot {
      translate: calc(var(--demo-track-w, 30cqi)) 0;
    }
    :dir(rtl) .is-played .demo-dot {
      translate: calc(var(--demo-track-w, 30cqi) * -1) 0;
    }
    .demo-tracks {
      container-type: inline-size;
    }
  `,
})
export default class MotionPage {
  protected readonly played = signal(false);
  protected readonly durations = ['--vd-duration-fast', '--vd-duration-base', '--vd-duration-slow'];
  protected readonly easings = [
    { label: 'out', token: '--vd-ease-out' },
    { label: 'in-out', token: '--vd-ease-in-out' },
    { label: 'spring', token: '--vd-ease-spring' },
  ];
}
