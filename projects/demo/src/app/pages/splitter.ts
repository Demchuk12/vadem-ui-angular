import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_SPLITTER } from '@vadem/ui/splitter';

@Component({
  selector: 'demo-splitter',
  imports: [VD_SPLITTER, VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-splitter-frame {
      block-size: 22rem;
    }
    .demo-splitter-frame--stacked {
      block-size: 26rem;
    }
    .demo-splitter-content {
      display: grid;
      align-content: start;
      gap: var(--vd-space-3);
      padding: var(--vd-space-4);
      padding-inline: min(var(--vd-space-4), 8%);
      overflow-wrap: anywhere;
    }
    .demo-splitter-content h3 {
      font-size: var(--vd-text-lg);
    }
    .demo-splitter-content button {
      max-inline-size: 100%;
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .demo-splitter-content pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-family: var(--vd-font-mono);
      font-size: var(--vd-text-sm);
    }
    .demo-splitter-actions {
      margin-block-start: var(--vd-space-4);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Splitter</p>
      <h1>Splitter</h1>
      <p>
        Two panes, room to work. Drag the separator or use its arrow keys and Home/End to adjust the
        layout.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="splitter-workspace">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Workspace</p>
        <h2 id="splitter-workspace">Make room for the task</h2>
        <p>
          Tab to the separator. Left/Right changes the file pane by one percentage point; Home/End
          reaches its limits.
        </p>
      </div>
      <div class="demo-panel">
        <div
          vdSplitter
          class="demo-splitter-frame"
          [(value)]="files"
          [min]="limited() ? 40 : 20"
          [max]="limited() ? 60 : 80"
          [disabled]="disabled()"
        >
          <section vdSplitterPane aria-labelledby="splitter-files-title">
            <div class="demo-splitter-content">
              <h3 id="splitter-files-title">Файли</h3>
              <button vdButton variant="secondary">Вимоги проєкту</button
              ><button vdButton variant="ghost">Нотатки української команди</button>
              <p>і · ї · є · ґ</p>
            </div>
          </section>
          <div vdSplitterHandle label="Файли" aria-labelledby="splitter-files-title"></div>
          <section vdSplitterPane aria-labelledby="splitter-document-title">
            <div class="demo-splitter-content">
              <h3 id="splitter-document-title">Вимоги проєкту</h3>
              <p>Дайте документу більше місця, щоб переглянути зміни та залишити коментарі.</p>
              <pre>
project: vadem
status: ready for review
team: українська команда</pre>
              <button vdButton variant="secondary">Відкрити документ</button>
            </div>
          </section>
        </div>
        <div class="demo-row demo-splitter-actions">
          <button vdButton variant="secondary" (click)="files.set(30)">Установити 30%</button
          ><button vdButton variant="ghost" (click)="limited.set(!limited())">
            Перемкнути межі 40–60%</button
          ><button vdButton variant="ghost" (click)="disabled.set(!disabled())">
            Перемкнути доступність
          </button>
        </div>
        <p class="demo-token demo-splitter-actions" data-testid="splitter-value">
          Requested: {{ files() }}% · Bounds: {{ limited() ? '40–60' : '20–80' }}%
        </p>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="splitter-vertical">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Stacked panes</p>
        <h2 id="splitter-vertical">Keep the output nearby</h2>
        <p>Up/Down adjusts the upper pane. Vertical layouts keep a defined height.</p>
      </div>
      <div class="demo-panel">
        <div
          vdSplitter
          orientation="vertical"
          class="demo-splitter-frame--stacked"
          [min]="25"
          [max]="75"
          [step]="2.5"
        >
          <section vdSplitterPane aria-labelledby="splitter-preview-title">
            <div class="demo-splitter-content">
              <h3 id="splitter-preview-title">Попередній перегляд</h3>
              <p>Перевірте компонування та підписи перед публікацією.</p>
              <button vdButton variant="secondary">Оновити перегляд</button>
            </div>
          </section>
          <div
            vdSplitterHandle
            label="Попередній перегляд"
            aria-labelledby="splitter-preview-title"
          ></div>
          <section vdSplitterPane aria-labelledby="splitter-log-title">
            <div class="demo-splitter-content">
              <h3 id="splitter-log-title">Журнал перевірки</h3>
              <pre>
✓ Компоненти зібрані
✓ Підписи перевірені
Очікуємо підтвердження команди</pre>
            </div>
          </section>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="splitter-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Fixed bounds</p>
        <h2 id="splitter-states">Content stays available</h2>
        <p>Equal limits disable resizing while the controls inside remain usable.</p>
      </div>
      <div class="demo-panel">
        <div vdSplitter class="demo-splitter-frame" [min]="35" [max]="35">
          <section vdSplitterPane>
            <div class="demo-splitter-content">
              <h3>Навігація</h3>
              <button vdButton variant="secondary">Документи</button>
            </div>
          </section>
          <div vdSplitterHandle label="Навігація"></div>
          <section vdSplitterPane>
            <div class="demo-splitter-content">
              <h3>Порожній робочий простір</h3>
              <p>Виберіть документ у навігації, щоб почати роботу.</p>
            </div>
          </section>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="splitter-rtl">
      <div class="demo-section__head">
        <p class="vd-eyebrow">RTL</p>
        <h2 id="splitter-rtl">Follow the reading direction</h2>
        <p>
          The primary pane starts on the right. Arrow keys move the separator physically left or
          right.
        </p>
      </div>
      <div class="demo-panel" dir="rtl" lang="ar">
        <div vdSplitter class="demo-splitter-frame" [min]="20" [max]="80">
          <section vdSplitterPane aria-labelledby="splitter-ar-files">
            <div class="demo-splitter-content">
              <h3 id="splitter-ar-files">الملفات</h3>
              <button vdButton variant="secondary">ملاحظات الفريق</button>
            </div>
          </section>
          <div vdSplitterHandle label="الملفات" aria-labelledby="splitter-ar-files"></div>
          <section vdSplitterPane>
            <div class="demo-splitter-content">
              <h3>مساحة العمل</h3>
              <p>اسحب الفاصل لتغيير مساحة الملفات والمستند.</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  `,
})
export default class SplitterPage {
  readonly files = signal(40);
  readonly limited = signal(false);
  readonly disabled = signal(false);
}
