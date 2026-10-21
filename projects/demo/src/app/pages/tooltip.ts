import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_DIALOG } from '@vadem/ui/dialog';
import { VdIcon } from '@vadem/ui/icon';
import { VdTooltip } from '@vadem/ui/tooltip';

@Component({
  selector: 'demo-tooltip',
  imports: [VdButton, VdIcon, VdTooltip, VD_DIALOG],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Tooltip</p>
      <h1>Tooltip</h1>
      <p>
        <code>popover="manual"</code> in the top layer, placed with CSS anchor positioning and
        flipped when there's no room. Hover (with delay) or keyboard focus; Escape hides it.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="toolbar">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdTooltip] · icon buttons</p>
        <h2 id="toolbar">Toolbar</h2>
        <p>
          Icon-only buttons are named by their tooltip. Move between them: after the first one, the
          rest show instantly.
        </p>
      </div>
      <div class="demo-panel">
        <div class="demo-toolbar" role="toolbar" aria-label="Форматування">
          <button vdButton variant="ghost" iconOnly vdTooltip="Копіювати посилання">
            <vd-icon name="copy" />
          </button>
          <button vdButton variant="ghost" iconOnly vdTooltip="Пошук (Ctrl + K)">
            <vd-icon name="search" />
          </button>
          <button vdButton variant="ghost" iconOnly vdTooltip="Додати учасника">
            <vd-icon name="plus" />
          </button>
          <button vdButton variant="ghost" iconOnly vdTooltip="Інформація про проєкт">
            <vd-icon name="info" />
          </button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="placement">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vdTooltipPlacement</p>
        <h2 id="placement">Placement</h2>
        <p>Logical sides: start/end follow the writing direction.</p>
      </div>
      <div class="demo-panel demo-placements">
        <button vdButton vdTooltip="Зверху" vdTooltipPlacement="top">top</button>
        <button vdButton vdTooltip="Знизу" vdTooltipPlacement="bottom">bottom</button>
        <button vdButton vdTooltip="На початку рядка" vdTooltipPlacement="start">start</button>
        <button vdButton vdTooltip="В кінці рядка" vdTooltipPlacement="end">end</button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Descriptions, long text, dialogs</h2>
      </div>
      <div class="demo-panel demo-placements">
        <button
          vdButton
          variant="primary"
          vdTooltip="Експорт усіх рядків таблиці у CSV-файл з урахуванням поточних фільтрів і сортування"
        >
          Експорт
        </button>
        <button vdButton vdTooltip="Доступно на тарифі Pro" aria-disabled="true">Аналітика</button>
        <button vdButton (click)="dlg.show()">Тултип у діалозі</button>
      </div>
    </section>

    <dialog vdDialog #dlg="vdDialog" size="sm">
      <header vdDialogHeader>
        <h2 vdDialogTitle>Тултипи в діалозі</h2>
        <p vdDialogDescription>Наведіть курсор або перейдіть клавішею Tab.</p>
      </header>
      <footer vdDialogFooter>
        <button vdButton variant="ghost" iconOnly vdTooltip="Довідка">
          <vd-icon name="info" />
        </button>
        <button vdButton variant="primary" vdDialogClose>Готово</button>
      </footer>
    </dialog>
  `,
  styles: `
    .demo-toolbar {
      display: flex;
      gap: var(--vd-space-1);
    }
    .demo-placements {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--vd-space-4);
      padding-block: var(--vd-space-10);
    }
  `,
})
export default class TooltipPage {}
