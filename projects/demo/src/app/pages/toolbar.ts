import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VD_TOOLBAR } from '@vadem/ui/toolbar';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-toolbar',
  imports: [VD_TOOLBAR, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-toolbar-status {
      margin-block: var(--vd-space-3);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Toolbar</p>
      <h1>Toolbar</h1>
      <p>
        Related actions, one keyboard stop. Arrows move between buttons; Enter and Space run the
        focused action.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="toolbar-document">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Groups · native actions · toggle state</p>
        <h2 id="toolbar-document">Document actions</h2>
        <p>
          Try Tab, Left/Right and Home/End. Returning to the toolbar remembers your last action.
        </p>
      </div>
      <div class="demo-panel">
        <div vdToolbar label="Дії з документом">
          <div vdToolbarGroup label="Редагування">
            <button vdButton vdToolbarItem variant="ghost" (click)="lastAction.set('Редагування')">
              <vd-icon slot="start" name="pencil" />Редагувати
            </button>
            @if (showCopy()) {
              <button
                vdButton
                vdToolbarItem
                variant="ghost"
                [disabled]="copyDisabled()"
                (click)="lastAction.set('Копіювання')"
              >
                <vd-icon slot="start" name="copy" />Копіювати
              </button>
            }
          </div>
          <span vdToolbarSeparator></span>
          <div vdToolbarGroup label="Експорт" [hidden]="exportHidden()">
            <button
              vdButton
              vdToolbarItem
              variant="ghost"
              [loading]="busy()"
              (click)="lastAction.set('Завантаження')"
            >
              <vd-icon slot="start" name="download" />Завантажити
            </button>
            <button
              vdButton
              vdToolbarItem
              variant="ghost"
              [attr.aria-pressed]="protected()"
              (click)="protected.set(!protected())"
            >
              <vd-icon slot="start" [name]="protected() ? 'check' : 'shield'" />Захист документа
            </button>
          </div>
        </div>
        <p role="status" class="demo-token demo-toolbar-status">
          Остання дія: {{ lastAction() }} · Захист: {{ protected() ? 'увімкнено' : 'вимкнено' }}
        </p>
        <div class="demo-row">
          <button vdButton variant="secondary" (click)="copyDisabled.set(!copyDisabled())">
            Перемкнути доступність копіювання
          </button>
          <button vdButton variant="ghost" (click)="showCopy.set(!showCopy())">
            Перемкнути кнопку копіювання
          </button>
          <button vdButton variant="ghost" (click)="exportHidden.set(!exportHidden())">
            Перемкнути групу експорту
          </button>
          <button vdButton variant="ghost" (click)="busy.set(!busy())">
            Перемкнути завантаження
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="toolbar-orientation">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Icon-only · vertical</p>
        <h2 id="toolbar-orientation">Match the working space</h2>
        <p>Vertical actions use Up/Down. Icon buttons keep localized accessible names.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 22rem">
        <div class="demo-panel">
          <div vdToolbar label="Швидкі дії">
            <button
              vdButton
              vdToolbarItem
              size="sm"
              variant="ghost"
              iconOnly
              aria-label="Створити"
              (click)="quickAction.set('Створити')"
            >
              <vd-icon slot="start" name="plus" />
            </button>
            <button
              vdButton
              vdToolbarItem
              size="sm"
              variant="ghost"
              iconOnly
              aria-label="Пошук"
              (click)="quickAction.set('Пошук')"
            >
              <vd-icon slot="start" name="search" />
            </button>
            <span vdToolbarSeparator></span>
            <button
              vdButton
              vdToolbarItem
              size="sm"
              variant="ghost"
              iconOnly
              aria-label="Налаштування"
              (click)="quickAction.set('Налаштування')"
            >
              <vd-icon slot="start" name="settings" />
            </button>
          </div>
          <p role="status" class="demo-token demo-toolbar-status">
            Швидка дія: {{ quickAction() }}
          </p>
        </div>
        <div class="demo-panel">
          <div vdToolbar label="Інструменти перегляду" orientation="vertical">
            <div vdToolbarGroup label="Перегляд">
              <button vdButton vdToolbarItem variant="ghost" (click)="viewAction.set('Огляд')">
                <vd-icon slot="start" name="eye" />Огляд
              </button>
              <button vdButton vdToolbarItem variant="ghost" disabled>
                <vd-icon slot="start" name="lock" />Обмежений доступ
              </button>
              <button vdButton vdToolbarItem variant="ghost" (click)="viewAction.set('Історія')">
                <vd-icon slot="start" name="activity" />Історія
              </button>
            </div>
            <span vdToolbarSeparator></span>
            <button vdButton vdToolbarItem variant="ghost" (click)="viewAction.set('Експорт')">
              <vd-icon slot="start" name="download" />Експорт
            </button>
          </div>
          <p role="status" class="demo-token demo-toolbar-status">Перегляд: {{ viewAction() }}</p>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="toolbar-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Unavailable · empty</p>
        <h2 id="toolbar-states">Keep unavailable actions honest</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 22rem">
        <div class="demo-panel">
          <div vdToolbar label="Недоступні дії">
            <button vdButton vdToolbarItem size="sm" variant="ghost" disabled>Редагувати</button>
            <button vdButton vdToolbarItem size="sm" variant="ghost" disabled>Копіювати</button>
            <button vdButton vdToolbarItem size="sm" variant="ghost" loading>Збереження</button>
          </div>
          <p>Документ заблокований. Дочекайтеся завершення збереження.</p>
        </div>
        <div class="demo-panel">
          <div vdToolbar label="Дії нового документа"></div>
          <p>Оберіть документ, щоб побачити доступні дії.</p>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="toolbar-content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content · RTL</p>
        <h2 id="toolbar-content">Labels stay readable</h2>
        <p>Long labels and groups wrap; navigation follows their logical order.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 24rem">
        <div class="demo-panel">
          <div vdToolbar label="Дії української команди">
            <button vdButton vdToolbarItem variant="ghost">
              Перевірити доступність для користувачів клавіатури
            </button>
            <button vdButton vdToolbarItem variant="ghost">
              ДужеДовгийНерозділенийІдентифікаторДляПеревіркиПеренесенняТексту
            </button>
            <button vdButton vdToolbarItem variant="ghost">і ї є ґ</button>
          </div>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <div vdToolbar label="إجراءات المستند">
            <div vdToolbarGroup label="التحرير">
              <button vdButton vdToolbarItem variant="ghost" (click)="arabicAction.set('تحرير')">
                تحرير
              </button>
              <button vdButton vdToolbarItem variant="ghost" (click)="arabicAction.set('نسخ')">
                نسخ
              </button>
            </div>
            <span vdToolbarSeparator></span>
            <button vdButton vdToolbarItem variant="ghost" (click)="arabicAction.set('تنزيل')">
              تنزيل
            </button>
          </div>
          <p role="status" class="demo-token demo-toolbar-status">الإجراء: {{ arabicAction() }}</p>
        </div>
      </div>
    </section>
  `,
})
export default class ToolbarPage {
  protected readonly lastAction = signal('—');
  protected readonly protected = signal(true);
  protected readonly showCopy = signal(true);
  protected readonly copyDisabled = signal(false);
  protected readonly exportHidden = signal(false);
  protected readonly busy = signal(false);
  protected readonly quickAction = signal('—');
  protected readonly viewAction = signal('—');
  protected readonly arabicAction = signal('—');
}
