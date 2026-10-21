import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdKbd } from '@vadem/ui/kbd';

@Component({
  selector: 'demo-kbd',
  imports: [VdKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Kbd</p>
      <h1>Kbd</h1>
      <p>
        Keyboard shortcuts with platform symbols and spoken key names. A single literal key in prose
        can stay a plain <kbd>kbd</kbd>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="kbd-platforms">
      <div class="demo-section__head">
        <h2 id="kbd-platforms">Platforms</h2>
        <p>
          The same keys render as symbols on Apple devices and as names elsewhere. On this device:
          <vd-kbd keys="Mod+K" />
        </p>
      </div>
      <div class="demo-kbd-table" role="table" aria-label="Shortcuts by platform">
        <div role="row" class="demo-kbd-row demo-kbd-row--head">
          <span role="columnheader">Keys</span>
          <span role="columnheader">macOS, iOS</span>
          <span role="columnheader">Windows, Linux</span>
        </div>
        @for (keys of samples; track keys) {
          <div role="row" class="demo-kbd-row">
            <code role="cell">{{ keys }}</code>
            <span role="cell"><vd-kbd [keys]="keys" platform="apple" /></span>
            <span role="cell"><vd-kbd [keys]="keys" platform="other" /></span>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="kbd-context">
      <div class="demo-section__head">
        <h2 id="kbd-context">In context</h2>
        <p>Shortcuts inherit the surrounding text size.</p>
      </div>
      <div class="demo-panel demo-kbd-context">
        <p>Відкрийте палітру команд: <vd-kbd keys="Mod+K" /></p>
        <p>Перейти до дашборду: <vd-kbd keys="G D" thenLabel="потім" /></p>
        <p class="demo-kbd-small">
          <vd-kbd keys="Up" /> <vd-kbd keys="Down" /> обрати · <vd-kbd keys="Enter" /> виконати ·
          <vd-kbd keys="Esc" /> закрити
        </p>
        <p dir="rtl" lang="ar">لفتح لوحة الأوامر اضغط <vd-kbd keys="Mod+K" /></p>
      </div>
    </section>
  `,
  styles: `
    .demo-kbd-table {
      display: grid;
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-surface);
    }
    .demo-kbd-row {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
      align-items: center;
      gap: var(--vd-space-4);
      padding: var(--vd-space-3) var(--vd-space-4);
    }
    .demo-kbd-row + .demo-kbd-row {
      border-block-start: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-kbd-row--head {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
      font-weight: var(--vd-weight-semibold);
    }
    @media (width < 40rem) {
      .demo-kbd-row {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--vd-space-2);
      }
      .demo-kbd-row--head {
        display: none;
      }
    }
    .demo-kbd-context {
      display: grid;
      gap: var(--vd-space-3);
    }
    .demo-kbd-context p {
      margin: 0;
    }
    .demo-kbd-small {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
  `,
})
export default class KbdPage {
  protected readonly samples = [
    'Mod+K',
    'Mod+Shift+P',
    'Alt+Enter',
    'Ctrl+Alt+Delete',
    'Shift+Tab',
    'Mod+Backspace',
    'G D',
    'Mod+Plus',
  ];
}
