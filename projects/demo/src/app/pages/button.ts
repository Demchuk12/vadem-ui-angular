import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton, VdButtonSize, VdButtonVariant } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-button',
  imports: [VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Button</p>
      <h1>Button</h1>
      <p>
        <code>button[vdButton]</code> and <code>a[vdButton]</code> keep native semantics. Four
        variants, three sizes, loading that keeps width and focus.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="variants">
      <div class="demo-section__head">
        <p class="vd-eyebrow">variant × size</p>
        <h2 id="variants">Variants</h2>
        <p>One primary per view. Danger only for destructive actions.</p>
      </div>
      <div class="demo-panel demo-matrix" tabindex="0" role="region" aria-label="Розміри кнопок">
        <span></span>
        @for (size of sizes; track size) {
          <span class="vd-eyebrow">{{ size }}</span>
        }
        @for (v of variants; track v) {
          <span class="vd-eyebrow">{{ v }}</span>
          @for (size of sizes; track size) {
            <div>
              <button vdButton [variant]="v" [size]="size">{{ labels[v] }}</button>
            </div>
          }
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">default · disabled · loading</p>
        <h2 id="states">States</h2>
        <p>Hover, focus-visible and press are live: point, tab, and click.</p>
      </div>
      <div
        class="demo-panel demo-matrix demo-matrix--states"
        tabindex="0"
        role="region"
        aria-label="Стани кнопок"
      >
        <span></span>
        <span class="vd-eyebrow">default</span>
        <span class="vd-eyebrow">disabled</span>
        <span class="vd-eyebrow">loading</span>
        @for (v of variants; track v) {
          <span class="vd-eyebrow">{{ v }}</span>
          <div><button vdButton [variant]="v">Надіслати</button></div>
          <div><button vdButton [variant]="v" disabled>Надіслати</button></div>
          <div><button vdButton [variant]="v" loading>Надіслати</button></div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="icons">
      <div class="demo-section__head">
        <p class="vd-eyebrow">slot="start" · slot="end" · iconOnly</p>
        <h2 id="icons">With icons</h2>
        <p>Slot icons get optically tightened padding. Icon-only buttons need an aria-label.</p>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton variant="primary"><vd-icon name="plus" slot="start" />Новий проєкт</button>
        <button vdButton>Далі<vd-icon name="arrow-right" slot="end" /></button>
        <button vdButton variant="ghost"><vd-icon name="copy" slot="start" />Копіювати</button>
        @for (size of sizes; track size) {
          <button vdButton iconOnly [size]="size" aria-label="Пошук">
            <vd-icon name="search" />
          </button>
        }
        <button vdButton iconOnly variant="ghost" aria-label="Закрити"><vd-icon name="x" /></button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="live">
      <div class="demo-section__head">
        <p class="vd-eyebrow">interactive</p>
        <h2 id="live">Loading keeps width</h2>
        <p>Click: the button stays focused and the same size while busy.</p>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton variant="primary" [loading]="saving()" (click)="save()">
          Зберегти зміни
        </button>
        <span class="demo-token" aria-live="polite">{{ status() }}</span>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long, short, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel demo-stack">
          <p class="vd-eyebrow">short</p>
          <div class="demo-row">
            <button vdButton variant="primary">OK</button>
            <button vdButton>Ні</button>
          </div>
        </div>
        <div class="demo-panel demo-stack demo-narrow">
          <p class="vd-eyebrow">long, narrow container</p>
          <button vdButton variant="primary">
            Завантажити звіт про використання за третій квартал 2026 року
          </button>
        </div>
        <div class="demo-panel demo-stack" dir="rtl" lang="ar">
          <p class="vd-eyebrow">rtl</p>
          <div class="demo-row">
            <button vdButton variant="primary">
              التالي<vd-icon name="arrow-right" slot="end" />
            </button>
            <button vdButton variant="ghost">إلغاء</button>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="composition">
      <div class="demo-section__head">
        <p class="vd-eyebrow">composition</p>
        <h2 id="composition">In context</h2>
      </div>
      <div class="demo-panel demo-stack">
        <div class="demo-form-footer">
          <div>
            <strong>Незбережені зміни</strong>
            <p class="demo-muted">У вас 3 зміни в налаштуваннях профілю.</p>
          </div>
          <div class="demo-row">
            <button vdButton variant="ghost">Скасувати</button>
            <button vdButton variant="primary">Зберегти зміни</button>
          </div>
        </div>
        <hr />
        <div class="demo-form-footer">
          <div>
            <strong>Видалити проєкт</strong>
            <p class="demo-muted">Усі дані буде видалено назавжди. Цю дію не можна скасувати.</p>
          </div>
          <button vdButton variant="danger">Видалити проєкт</button>
        </div>
        <hr />
        <div class="demo-row">
          <a vdButton href="#composition"><vd-icon name="info" slot="start" />Посилання-кнопка</a>
          <a vdButton href="#composition" disabled>Недоступне посилання</a>
          <button vdButton size="sm" variant="ghost">
            Детальніше<vd-icon name="chevron-right" slot="end" />
          </button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-matrix {
      display: grid;
      overflow: auto;
      overscroll-behavior-inline: contain;
      grid-template-columns: 6rem repeat(3, max-content);
      align-items: center;
      gap: var(--vd-space-4) var(--vd-space-8);
    }
    .demo-matrix > .vd-eyebrow {
      white-space: nowrap;
    }
    @media (width < 48rem) {
      .demo-matrix {
        grid-template-columns: auto repeat(3, max-content);
        gap: var(--vd-space-3) var(--vd-space-4);
      }
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
      align-content: start;
    }
    .demo-narrow {
      max-inline-size: 18rem;
    }
    .demo-form-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--vd-space-4);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
  `,
})
export default class ButtonPage {
  protected readonly variants: VdButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  protected readonly sizes: VdButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly labels: Record<VdButtonVariant, string> = {
    primary: 'Зберегти',
    secondary: 'Експорт',
    ghost: 'Скасувати',
    danger: 'Видалити',
  };

  protected readonly saving = signal(false);
  protected readonly status = signal('');

  protected save(): void {
    this.saving.set(true);
    this.status.set('Зберігаємо…');
    setTimeout(() => {
      this.saving.set(false);
      this.status.set('Зміни збережено');
    }, 1600);
  }
}
