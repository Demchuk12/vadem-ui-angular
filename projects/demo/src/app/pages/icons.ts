import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VD_ICON_NAMES, VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-icons',
  imports: [VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Foundations / 06</p>
      <h1>Icons</h1>
      <p>
        One set: Lucide geometry (vendored, ISC) on a 24px grid, rendered at 1.5 stroke with round
        caps and joins in <code>currentColor</code>. Directional icons mirror in RTL.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="set">
      <div class="demo-section__head">
        <p class="vd-eyebrow">{{ names.length }} icons</p>
        <h2 id="set">Set</h2>
      </div>
      <ul class="demo-icons" role="list">
        @for (name of names; track name) {
          <li class="demo-icon-cell">
            <vd-icon [name]="name" />
            <span class="demo-token">{{ name }}</span>
          </li>
        }
      </ul>
    </section>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">1.25em by default</p>
        <h2 id="sizes">Sizes & color</h2>
        <p>Icons follow the font size and text color of their context.</p>
      </div>
      <div class="demo-panel demo-icon-sizes">
        @for (s of sizes; track s) {
          <span [style.font-size]="'var(' + s + ')'" class="demo-icon-inline">
            <vd-icon name="search" /> Пошук
          </span>
        }
        <span class="demo-icon-inline" style="color: var(--vd-color-success-text)">
          <vd-icon name="check" /> Збережено
        </span>
        <span class="demo-icon-inline" style="color: var(--vd-color-danger-text)">
          <vd-icon name="alert-circle" /> Помилка
        </span>
        <span class="demo-icon-inline" style="color: var(--vd-color-text-muted)">
          <vd-icon name="loader" label="Завантаження" /> Завантаження…
        </span>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="rtl">
      <div class="demo-section__head">
        <p class="vd-eyebrow">dir="rtl"</p>
        <h2 id="rtl">Mirroring</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 14rem">
        <div class="demo-panel demo-icon-inline" dir="ltr">
          Next <vd-icon name="arrow-right" /> <vd-icon name="chevron-right" />
        </div>
        <div class="demo-panel demo-icon-inline" dir="rtl" lang="ar">
          التالي <vd-icon name="arrow-right" /> <vd-icon name="chevron-right" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-icons {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
      gap: var(--vd-space-2);
      padding: 0;
    }
    .demo-icon-cell {
      display: grid;
      justify-items: center;
      gap: var(--vd-space-3);
      padding: var(--vd-space-5) var(--vd-space-2) var(--vd-space-3);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-surface);
      background: var(--vd-color-surface);
      box-shadow: var(--vd-highlight-top);
    }
    .demo-icon-cell .vd-icon {
      --vd-icon-size: var(--vd-space-6);
    }
    .demo-icon-sizes {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-8);
    }
    .demo-icon-inline {
      display: inline-flex;
      align-items: center;
      gap: var(--vd-space-2);
      font-weight: var(--vd-weight-medium);
    }
  `,
})
export default class IconsPage {
  protected readonly names = VD_ICON_NAMES;
  protected readonly sizes = ['--vd-text-sm', '--vd-text-md', '--vd-text-lg', '--vd-text-2xl'];
}
