import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { VD_MENU, VdContextMenu } from '@vadem/ui/menu';
import { VdToaster } from '@vadem/ui/toast';

@Component({
  selector: 'demo-menu',
  imports: [VdButton, VdIcon, VD_MENU, VdContextMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Menu</p>
      <h1>Menu & Context menu</h1>
      <p>
        APG menu button: focus moves into the menu, arrows loop, letters jump, Escape returns to the
        trigger. Anchored with CSS and flipped when it would overflow.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="actions">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdMenuTrigger] · [vdMenu]</p>
        <h2 id="actions">Actions</h2>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton [vdMenuTrigger]="project">
          Дії з проєктом <vd-icon name="chevron-down" slot="end" />
        </button>
        <div vdMenu #project="vdMenu">
          <div vdMenuLabel>Проєкт</div>
          <button vdMenuItem (click)="done('Відкрито редактор')">
            <vd-icon name="info" />Редагувати<kbd slot="end">E</kbd>
          </button>
          <button vdMenuItem (click)="done('Скопійовано')">
            <vd-icon name="copy" />Дублювати<kbd slot="end">⌘D</kbd>
          </button>
          <button vdMenuItem disabled><vd-icon name="arrow-right" />Перенести (немає прав)</button>
          <hr vdMenuSeparator />
          <div vdMenuLabel>Небезпечна зона</div>
          <button vdMenuItem variant="danger" (click)="done('Проєкт видалено')">
            <vd-icon name="x-circle" />Видалити
          </button>
        </div>

        <button vdButton variant="ghost" iconOnly aria-label="Більше дій" [vdMenuTrigger]="more">
          <vd-icon name="plus" />
        </button>
        <div vdMenu #more="vdMenu">
          <button vdMenuItem (click)="done('Створено задачу')">Нова задача</button>
          <button vdMenuItem (click)="done('Створено документ')">Новий документ</button>
          <button vdMenuItem (click)="done('Запрошення надіслано')">Запросити учасника</button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="edge">
      <div class="demo-section__head">
        <p class="vd-eyebrow">position-try-fallbacks</p>
        <h2 id="edge">At the edge, RTL</h2>
        <p>
          Near the inline end the menu flips to stay on screen; in RTL it opens toward the left.
        </p>
      </div>
      <div class="demo-panel demo-edge">
        <button vdButton [vdMenuTrigger]="edge">Біля краю</button>
        <div vdMenu #edge="vdMenu">
          <button vdMenuItem>Експорт у CSV</button>
          <button vdMenuItem>Експорт у JSON із вкладеними обʼєктами</button>
        </div>
      </div>
      <div class="demo-panel demo-row" dir="rtl" lang="ar">
        <button vdButton [vdMenuTrigger]="rtl">الإجراءات</button>
        <div vdMenu #rtl="vdMenu">
          <button vdMenuItem>تعديل</button>
          <button vdMenuItem>نسخ</button>
          <button vdMenuItem variant="danger">حذف</button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="context">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vdContextMenu</p>
        <h2 id="context">Context menu</h2>
        <p>
          Right-click a file, long-press on touch, or focus a row and press Shift+F10 or the Menu
          key. Every row shares one menu. Each action is also reachable from the row's own button,
          because a context menu is invisible until you know it exists.
        </p>
      </div>
      <ul class="demo-panel demo-files" role="list">
        @for (file of files; track file.name) {
          <li class="demo-file" [class.demo-file--active]="active() === file.name">
            <span
              class="demo-file__name"
              tabindex="0"
              [vdContextMenu]="fileMenu"
              [label]="'Дії з файлом ' + file.name"
              (opened)="active.set(file.name)"
            >
              <vd-icon name="file" />{{ file.name }}
            </span>
            <span class="demo-file__meta">{{ file.size }}</span>
            <button
              vdButton
              variant="ghost"
              size="sm"
              iconOnly
              [vdMenuTrigger]="rowMenu"
              [attr.aria-label]="'Дії з файлом ' + file.name"
              (click)="active.set(file.name)"
            >
              <vd-icon name="more-horizontal" />
            </button>
            <div vdMenu #rowMenu="vdMenu">
              <button vdMenuItem (click)="done('Відкрито ' + file.name)">
                <vd-icon name="external-link" />Відкрити
              </button>
              <button vdMenuItem (click)="done('Скопійовано посилання')">
                <vd-icon name="copy" />Копіювати посилання
              </button>
              <hr vdMenuSeparator />
              <button vdMenuItem variant="danger" (click)="done('Видалено ' + file.name)">
                <vd-icon name="trash" />Видалити
              </button>
            </div>
          </li>
        }
      </ul>
      <div vdMenu #fileMenu="vdMenu">
        <div vdMenuLabel>{{ active() }}</div>
        <button vdMenuItem (click)="done('Відкрито ' + active())">
          <vd-icon name="external-link" />Відкрити
        </button>
        <button vdMenuItem (click)="done('Скопійовано посилання')">
          <vd-icon name="copy" />Копіювати посилання
        </button>
        <button vdMenuItem (click)="done('Перейменування ' + active())">
          <vd-icon name="pencil" />Перейменувати
        </button>
        <button vdMenuItem disabled><vd-icon name="lock" />Захистити паролем</button>
        <hr vdMenuSeparator />
        <button vdMenuItem variant="danger" (click)="done('Видалено ' + active())">
          <vd-icon name="trash" />Видалити
        </button>
      </div>
    </section>
  `,
  styles: `
    .demo-files {
      display: grid;
      gap: var(--vd-space-1);
      margin: 0;
      padding: var(--vd-space-2);
      list-style: none;
    }
    .demo-file {
      display: flex;
      align-items: center;
      gap: var(--vd-space-3);
      padding-inline-start: var(--vd-space-2);
      border-radius: var(--vd-radius-control);
    }
    .demo-file--active {
      background: var(--vd-color-fill);
    }
    .demo-file__name {
      display: flex;
      flex: 1;
      align-items: center;
      gap: var(--vd-space-2);
      min-inline-size: 0;
      padding-block: var(--vd-space-2);
      border-radius: var(--vd-radius-sm);
      overflow-wrap: anywhere;
    }
    .demo-file__name:focus-visible {
      outline: var(--vd-focus-ring-width) solid var(--vd-color-focus);
      outline-offset: var(--vd-focus-ring-offset);
    }
    .demo-file__meta {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
      font-variant-numeric: tabular-nums;
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-edge {
      display: flex;
      justify-content: flex-end;
      margin-block-end: var(--vd-space-4);
    }
  `,
})
export default class MenuPage {
  private readonly toaster = inject(VdToaster);
  protected readonly active = signal('');
  protected readonly files = [
    { name: 'Кошторис_2026.xlsx', size: '84 КБ' },
    { name: 'Договір з постачальником (підписаний).pdf', size: '1,2 МБ' },
    { name: 'logo-vadem.svg', size: '3 КБ' },
  ];

  protected done(message: string): void {
    this.toaster.show({ title: message });
  }
}
