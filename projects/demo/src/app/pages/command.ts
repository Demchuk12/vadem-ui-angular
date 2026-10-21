import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_COMMAND, VdCommand } from '@vadem/ui/command';
import { VD_DIALOG, VdDialog } from '@vadem/ui/dialog';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { DemoPreferences } from '../shell/preferences';

interface DemoAction {
  value: string;
  label: string;
  description: string;
  icon: VdIconName;
  keywords: readonly string[];
  disabled?: boolean;
}

@Component({
  selector: 'demo-command',
  imports: [VD_COMMAND, VD_DIALOG, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onShortcut($event)' },
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Command</p>
      <h1>Command palette</h1>
      <p>Search for an action, move through results with arrows, then press Enter to run it.</p>
    </header>

    <section class="demo-section" aria-labelledby="palette">
      <div class="demo-section__head">
        <h2 id="palette">Quick actions</h2>
        <p>The app owns its shortcut and actions. Search aliases also work: try “settings”.</p>
      </div>
      <div class="demo-command-launch">
        <button vdButton variant="primary" (click)="openPalette()">
          <vd-icon name="search" slot="start" />Відкрити палітру
        </button>
        <span class="demo-command-muted">або <kbd>Ctrl / Cmd K</kbd></span>
      </div>
      <p class="demo-command-feedback" role="status">{{ result() }}</p>
      <dialog
        vdDialog
        #paletteDialog="vdDialog"
        class="demo-command-dialog"
        (closed)="onPaletteClosed()"
      >
        <h2 vdDialogTitle class="vd-visually-hidden">Швидкі дії</h2>
        <vd-command
          #modalCommand
          autofocus
          label="Пошук швидкої дії"
          placeholder="Назва дії або ключове слово"
          emptyText="Немає збігів. Спробуйте інше слово."
          [(query)]="modalQuery"
          (selected)="runModal($event)"
          (dismissed)="closePalette()"
        >
          @for (action of actions; track action.value) {
            <vd-command-item
              [value]="action.value"
              [label]="action.label"
              [keywords]="action.keywords"
              [disabled]="action.disabled ?? false"
            >
              <vd-icon [name]="action.icon" slot="start" />
              <span vdCommandDescription>{{ action.description }}</span>
            </vd-command-item>
          }
        </vd-command>
        <footer class="demo-command-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> Обрати <kbd>Enter</kbd> Виконати</span>
          <button vdButton variant="ghost" size="sm" (click)="closePalette()">Закрити</button>
        </footer>
      </dialog>
    </section>

    <section class="demo-section" aria-labelledby="inline">
      <div class="demo-section__head">
        <p class="vd-eyebrow">inline · keyboard · aliases</p>
        <h2 id="inline">Searchable actions</h2>
        <p>Options are not Tab stops. Editing the text, Tab and Escape never run an action.</p>
      </div>
      <vd-command
        class="demo-command-inline"
        label="Пошук дій у списку"
        placeholder="Пошук дій…"
        emptyText="Немає збігів. Спробуйте інше слово."
        (selected)="runInline($event)"
      >
        @for (action of actions; track action.value) {
          <vd-command-item
            [value]="action.value"
            [label]="action.label"
            [keywords]="action.keywords"
            [disabled]="action.disabled ?? false"
          >
            <vd-icon [name]="action.icon" slot="start" />
            <span vdCommandDescription>{{ action.description }}</span>
          </vd-command-item>
        }
      </vd-command>
      <p class="demo-command-feedback" role="status">{{ inlineResult() }}</p>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">empty · loading · disabled</p>
        <h2 id="states">Availability states</h2>
        <p>Loading pauses activation while keeping the search editable.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-command-stack">
          <h3 class="demo-command-caption">No results</h3>
          <vd-command
            label="Пошук без результатів"
            query="невідома дія"
            emptyText="Такої дії немає. Змініть запит."
          >
            <vd-command-item value="project" label="Відкрити проєкт" />
          </vd-command>
        </div>
        <div class="demo-command-stack">
          <h3 class="demo-command-caption">Loading</h3>
          <vd-command label="Пошук доступних дій" loading loadingText="Завантажуємо доступні дії…">
            <vd-command-item value="stale" label="Попередня дія" />
          </vd-command>
        </div>
        <div class="demo-command-stack">
          <h3 class="demo-command-caption">Disabled</h3>
          <vd-command label="Недоступний пошук" disabled placeholder="Пошук вимкнено">
            <vd-command-item value="locked" label="Створити проєкт" />
          </vd-command>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="scrolling">
      <div class="demo-section__head">
        <p class="vd-eyebrow">dynamic content · PageUp / PageDown</p>
        <h2 id="scrolling">Long action lists</h2>
        <p>Only the results scroll when the active action moves out of view.</p>
      </div>
      <vd-command
        class="demo-command-inline"
        label="Пошук проєкту"
        placeholder="Знайти проєкт…"
        emptyText="Проєкт не знайдено. Змініть запит."
        (selected)="inlineResult.set('Обрано: ' + $event)"
      >
        @for (project of projects; track project) {
          <vd-command-item [value]="project" [label]="'Відкрити проєкт ' + project">
            <vd-icon name="folder" slot="start" />
          </vd-command-item>
        }
      </vd-command>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">long labels · shortcut hints · RTL</p>
        <h2 id="content">Real content</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 20rem">
        <vd-command
          label="Пошук українських дій"
          placeholder="Що потрібно зробити?"
          emptyText="Дію не знайдено. Уточніть запит."
          (selected)="inlineResult.set('Обрано: ' + $event)"
        >
          <vd-command-item value="short" label="Додому">
            <vd-icon name="layout-dashboard" slot="start" />
          </vd-command-item>
          <vd-command-item
            value="long"
            label="Переглянути всі розгортання команди міжнародної підтримки користувачів"
            [keywords]="['deployments', 'команда']"
          >
            <vd-icon name="rocket" slot="start" />
            <span vdCommandDescription>Останні зміни, відповідальні та стан перевірок</span>
            <kbd vdCommandShortcut>G D</kbd>
          </vd-command-item>
        </vd-command>
        <vd-command
          dir="rtl"
          lang="ar"
          label="البحث عن إجراء"
          placeholder="ابحث عن إجراء…"
          emptyText="لا توجد نتائج. جرّب كلمة أخرى."
          (selected)="inlineResult.set('Обрано: ' + $event)"
        >
          <vd-command-item value="rtl-projects" label="فتح المشاريع">
            <vd-icon name="folder" slot="start" />
            <span vdCommandDescription>عرض مشاريع الفريق</span>
          </vd-command-item>
          <vd-command-item value="rtl-settings" label="إعدادات الحساب">
            <vd-icon name="settings" slot="start" />
            <kbd vdCommandShortcut>G S</kbd>
          </vd-command-item>
        </vd-command>
      </div>
    </section>
  `,
  styles: `
    .demo-command-inline {
      max-inline-size: 36rem;
    }
    .demo-command-launch,
    .demo-command-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-command-muted,
    .demo-command-footer {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-command-feedback {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
      min-block-size: var(--vd-space-5);
    }
    .demo-command-stack {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-content: start;
      gap: var(--vd-space-3);
    }
    .demo-command-caption {
      font-size: var(--vd-text-md);
      font-weight: var(--vd-weight-semibold);
    }
    .demo-command-dialog .vd-command {
      --vd-command-border: transparent;
      --vd-command-radius: var(--vd-radius-overlay);
      --vd-command-bg: var(--vd-color-surface-overlay);
      flex: 1;
    }
    .demo-command-footer {
      justify-content: space-between;
      padding: var(--vd-space-2) var(--vd-space-3);
      border-block-start: var(--vd-border-width) solid var(--vd-color-border);
    }
  `,
})
export default class CommandPage {
  private readonly prefs = inject(DemoPreferences);
  private readonly dialog = viewChild.required<VdDialog>('paletteDialog');
  private readonly modal = viewChild.required<VdCommand>('modalCommand');
  private closing = false;
  private reopenRequested = false;
  protected readonly modalQuery = signal('');
  protected readonly result = signal('Палітра запускає дію лише після вашого вибору.');
  protected readonly inlineResult = signal('Дію ще не обрано.');
  protected readonly projects = Array.from(
    { length: 24 },
    (_, index) => `VA-${String(index + 1).padStart(2, '0')}`,
  );
  protected readonly actions: readonly DemoAction[] = [
    {
      value: 'projects',
      label: 'Відкрити проєкти',
      description: 'Обрати робочий проєкт',
      icon: 'folder',
      keywords: ['projects', 'workspace'],
    },
    {
      value: 'restricted',
      label: 'Керувати оплатою',
      description: 'Доступно лише власнику робочого простору',
      icon: 'credit-card',
      keywords: ['billing'],
      disabled: true,
    },
    {
      value: 'settings',
      label: 'Відкрити налаштування',
      description: 'Профіль, сповіщення та безпека',
      icon: 'settings',
      keywords: ['settings', 'profile'],
    },
    {
      value: 'theme',
      label: 'Змінити тему',
      description: 'Перемкнути світлу або темну тему',
      icon: 'sun',
      keywords: ['theme', 'dark', 'light'],
    },
    {
      value: 'help',
      label: 'Відкрити довідку',
      description: 'Підказки про компоненти та клавіатуру',
      icon: 'info',
      keywords: ['help', 'docs'],
    },
  ];

  protected openPalette(): void {
    if (this.closing) {
      this.reopenRequested = true;
      return;
    }
    this.modalQuery.set('');
    this.dialog().show();
  }

  protected onShortcut(event: KeyboardEvent): void {
    if (event.isComposing || event.repeat || event.defaultPrevented) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.dialog().open()) this.modal().focus();
      else this.openPalette();
    }
  }

  protected closePalette(): void {
    // Finish the queued native close event before handling an immediate reopen request.
    this.closing = true;
    this.dialog().open.set(false);
    this.dialog().close();
  }

  protected onPaletteClosed(): void {
    this.closing = false;
    if (this.reopenRequested) {
      this.reopenRequested = false;
      this.openPalette();
    }
  }

  protected runModal(value: string): void {
    this.run(value, this.result);
    this.closePalette();
  }

  protected runInline(value: string): void {
    this.run(value, this.inlineResult);
  }

  private run(value: string, feedback: WritableSignal<string>): void {
    const action = this.actions.find((item) => item.value === value);
    if (!action || action.disabled) return;
    if (value === 'theme')
      this.prefs.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
    // Navigation examples show the selected intent; only the theme action changes app state.
    feedback.set(value === 'theme' ? 'Тему змінено.' : 'Обрано: ' + action.label + '.');
  }
}
