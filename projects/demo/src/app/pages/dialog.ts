import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_DIALOG } from '@vadem/ui/dialog';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';

@Component({
  selector: 'demo-dialog',
  imports: [VD_DIALOG, VdButton, VdField, VdIcon, VdInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Dialog</p>
      <h1>Dialog</h1>
      <p>
        Native <code>&lt;dialog&gt;</code> with <code>showModal()</code>: top layer, focus trap and
        focus return come from the platform. Spring entrance via <code>@starting-style</code>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="examples">
      <div class="demo-section__head">
        <p class="vd-eyebrow">dialog[vdDialog]</p>
        <h2 id="examples">Examples</h2>
        <p>Escape and backdrop click dismiss, unless the dialog needs an explicit choice.</p>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton (click)="edit.show()">Редагувати профіль</button>
        <button vdButton variant="danger" (click)="confirm.show()">Видалити проєкт</button>
        <button vdButton variant="ghost" (click)="terms.show()">Умови використання</button>
        <button vdButton variant="ghost" (click)="small.show()">Маленький діалог</button>
        <span class="demo-token" aria-live="polite">{{ result() }}</span>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="drawers">
      <div class="demo-section__head">
        <p class="vd-eyebrow">placement="end | start"</p>
        <h2 id="drawers">Drawers</h2>
        <p>
          The same dialog attached to an edge: details, filters, secondary navigation. Mirrored in
          RTL; on phones it becomes the bottom sheet.
        </p>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton (click)="details.show()">
          Деталі розгортання<vd-icon name="arrow-right" slot="end" />
        </button>
        <button vdButton variant="ghost" (click)="filters.show()">
          <vd-icon name="arrow-left" slot="start" />Фільтри (start)
        </button>
      </div>
    </section>

    <dialog vdDialog #details="vdDialog" placement="end" (closed)="report('Деталі', $event)">
      <header vdDialogHeader>
        <h2 vdDialogTitle>dpl_8f2a · Платформа оплат</h2>
        <p vdDialogDescription>main · feat: інвойси в гривні · 2 хв тому</p>
        <button vdButton vdDialogClose variant="ghost" iconOnly size="sm" aria-label="Закрити">
          <vd-icon name="x" />
        </button>
      </header>
      <div vdDialogBody>
        <dl class="demo-dl">
          <dt>Статус</dt>
          <dd>Працює</dd>
          <dt>Регіон</dt>
          <dd>eu-central-1</dd>
          <dt>Тривалість збірки</dt>
          <dd>41 с</dd>
          <dt>Автор</dt>
          <dd>Олена Коваленко</dd>
        </dl>
        <pre><code>[12:04:31] build  ✓ compiled in 2.4s
[12:04:33] test   ✓ 214 passed
[12:04:41] deploy ✓ eu-central-1
[12:04:42] health ✓ 200 OK</code></pre>
      </div>
      <footer vdDialogFooter>
        <button vdButton variant="ghost" vdDialogClose>Закрити</button>
        <button vdButton variant="primary" vdDialogClose="redeploy">Розгорнути повторно</button>
      </footer>
    </dialog>

    <dialog
      vdDialog
      #filters="vdDialog"
      placement="start"
      size="sm"
      (closed)="report('Фільтри', $event)"
    >
      <form method="dialog">
        <header vdDialogHeader>
          <h2 vdDialogTitle>Фільтри</h2>
          <button
            vdButton
            vdDialogClose
            variant="ghost"
            iconOnly
            size="sm"
            aria-label="Закрити"
            type="button"
          >
            <vd-icon name="x" />
          </button>
        </header>
        <div vdDialogBody>
          <vd-field label="Проєкт">
            <input vdInput placeholder="Назва проєкту" />
          </vd-field>
          <vd-field label="Гілка">
            <input vdInput placeholder="main" />
          </vd-field>
        </div>
        <footer vdDialogFooter>
          <button vdButton variant="ghost" vdDialogClose type="button">Скинути</button>
          <button vdButton variant="primary" type="submit" value="applied">Застосувати</button>
        </footer>
      </form>
    </dialog>

    <dialog vdDialog #edit="vdDialog" (closed)="report('Профіль', $event)">
      <header vdDialogHeader>
        <h2 vdDialogTitle>Редагувати профіль</h2>
        <p vdDialogDescription>Зміни побачать усі учасники робочого простору.</p>
        <button vdButton vdDialogClose variant="ghost" iconOnly size="sm" aria-label="Закрити">
          <vd-icon name="x" />
        </button>
      </header>
      <div vdDialogBody>
        <vd-field label="Імʼя">
          <input vdInput value="Олена Коваленко" autofocus />
        </vd-field>
        <vd-field label="Посада" hint="Необовʼязково">
          <input vdInput value="Дизайнерка інтерфейсів" />
        </vd-field>
      </div>
      <footer vdDialogFooter>
        <button vdButton variant="ghost" vdDialogClose>Скасувати</button>
        <button vdButton variant="primary" vdDialogClose="saved">Зберегти</button>
      </footer>
    </dialog>

    <dialog
      vdDialog
      #confirm="vdDialog"
      size="sm"
      role="alertdialog"
      [dismissible]="false"
      (closed)="report('Видалення', $event)"
    >
      <header vdDialogHeader>
        <h2 vdDialogTitle>Видалити «Платформа оплат»?</h2>
        <p vdDialogDescription>
          Проєкт, 12 розгортань і всі логи буде видалено назавжди. Цю дію не можна скасувати.
        </p>
      </header>
      <footer vdDialogFooter>
        <button vdButton vdDialogClose autofocus>Залишити</button>
        <button vdButton variant="danger" vdDialogClose="deleted">Видалити</button>
      </footer>
    </dialog>

    <dialog vdDialog #terms="vdDialog" size="lg" (closed)="report('Умови', $event)">
      <header vdDialogHeader>
        <h2 vdDialogTitle>Умови використання</h2>
        <button vdButton vdDialogClose variant="ghost" iconOnly size="sm" aria-label="Закрити">
          <vd-icon name="x" />
        </button>
      </header>
      <div vdDialogBody>
        @for (n of paragraphs; track n) {
          <p class="demo-muted">
            {{ n }}. Користуючись сервісом, ви погоджуєтеся дотримуватися цих умов. Ми можемо
            оновлювати їх, повідомивши вас електронною поштою щонайменше за 14 днів. Довгий вміст
            прокручується всередині діалогу, а сторінка позаду лишається нерухомою.
          </p>
        }
      </div>
      <footer vdDialogFooter>
        <button vdButton variant="primary" vdDialogClose="accepted">Прийняти</button>
      </footer>
    </dialog>

    <dialog vdDialog #small="vdDialog" size="sm" (closed)="report('Маленький', $event)">
      <header vdDialogHeader>
        <h2 vdDialogTitle>Посилання скопійовано</h2>
        <p vdDialogDescription>Ним можна поділитися з командою.</p>
      </header>
      <footer vdDialogFooter>
        <button vdButton variant="primary" vdDialogClose>Добре</button>
      </footer>
    </dialog>
  `,
  styles: `
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
    }
    .demo-dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--vd-space-2) var(--vd-space-6);
      margin: 0;
      font-size: var(--vd-text-sm);
    }
    .demo-dl dt {
      color: var(--vd-color-text-muted);
    }
    .demo-dl dd {
      margin: 0;
      font-weight: var(--vd-weight-medium);
    }
  `,
})
export default class DialogPage {
  protected readonly result = signal('');
  protected readonly paragraphs = Array.from({ length: 14 }, (_, i) => i + 1);

  protected report(name: string, value: string): void {
    this.result.set(`${name}: ${value || 'закрито без дії'}`);
  }
}
