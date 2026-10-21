import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton, type VdButtonSize, type VdButtonVariant } from '@vadem/ui/button';
import { VdCopyButton } from '@vadem/ui/copy-button';
import { VdTable, VdTableScroll } from '@vadem/ui/table';

@Component({
  imports: [VdButton, VdCopyButton, VdTable, VdTableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Copy button</h1>
      <p>
        Copy an exact value and confirm the result, without moving focus or replacing the source.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="code-example">
      <div class="demo-section__head">
        <p class="vd-eyebrow">code · exact text</p>
        <h2 id="code-example">Installation command</h2>
        <p>
          Success appears after the browser confirms the clipboard write. Denied access remains
          retryable.
        </p>
      </div>
      <div class="demo-copy-code">
        <div class="demo-copy-code__head">
          <span class="demo-token">Terminal</span
          ><vd-copy-button
            data-testid="command-copy"
            [value]="command"
            copyingLabel="Копіюємо…"
            copiedLabel="Скопійовано"
            errorLabel="Спробувати ще раз"
            errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
            label="Копіювати команду"
            (copied)="lastEvent.set('Команду скопійовано')"
            (copyFailed)="lastEvent.set('Команду не скопійовано')"
          />
        </div>
        <pre><code>{{ command }}</code></pre>
      </div>
      <p class="demo-copy-note">
        {{ lastEvent() || 'Текст команди також можна виділити й скопіювати вручну.' }}
      </p>
    </section>
    <section class="demo-section" aria-labelledby="table-example">
      <div class="demo-section__head">
        <p class="vd-eyebrow">table · icon only</p>
        <h2 id="table-example">Project references</h2>
        <p>Each row copies its own identifier. The action name identifies the source.</p>
      </div>
      <div vdTableScroll aria-label="Ідентифікатори проєктів">
        <table vdTable class="demo-copy-table">
          <caption class="vd-visually-hidden">
            Ідентифікатори проєктів
          </caption>
          <thead>
            <tr>
              <th scope="col">Проєкт</th>
              <th scope="col">Ідентифікатор</th>
              <th scope="col">Дія</th>
            </tr>
          </thead>
          <tbody>
            @for (project of projects; track project.id) {
              <tr>
                <td>{{ project.name }}</td>
                <td>
                  <code>{{ project.id }}</code>
                </td>
                <td>
                  <vd-copy-button
                    [value]="project.id"
                    iconOnly
                    variant="ghost"
                    size="sm"
                    copyingLabel="Копіюємо…"
                    copiedLabel="Скопійовано"
                    errorLabel="Спробувати ще раз"
                    errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
                    [label]="'Копіювати ID: ' + project.name"
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">sm · md · lg</p>
        <h2 id="sizes">Sizes and variants</h2>
      </div>
      <div class="demo-panel demo-copy-stack">
        <div class="demo-copy-row">
          @for (size of sizes; track size) {
            <div class="demo-copy-sample">
              <span class="demo-token">size="{{ size }}"</span
              ><vd-copy-button
                value="VDM-2026"
                [size]="size"
                copyingLabel="Копіюємо…"
                copiedLabel="Скопійовано"
                errorLabel="Спробувати ще раз"
                errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
                label="Копіювати"
              />
            </div>
          }
        </div>
        <div class="demo-copy-row">
          @for (variant of variants; track variant) {
            <div class="demo-copy-sample">
              <span class="demo-token">{{ variant }}</span
              ><vd-copy-button
                value="VDM-2026"
                [variant]="variant"
                copyingLabel="Копіюємо…"
                copiedLabel="Скопійовано"
                errorLabel="Спробувати ще раз"
                errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
                label="Копіювати"
              />
            </div>
          }
        </div>
        <div class="demo-copy-row">
          <vd-copy-button
            value=""
            disabled
            copyingLabel="Копіюємо…"
            copiedLabel="Скопійовано"
            errorLabel="Спробувати ще раз"
            errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
            label="Копіювати недоступний код"
          /><vd-copy-button
            value="VDM-2026"
            disabled
            iconOnly
            copyingLabel="Копіюємо…"
            copiedLabel="Скопійовано"
            errorLabel="Спробувати ще раз"
            errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
            label="Копіювати недоступний ID"
          />
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="changing">
      <div class="demo-section__head">
        <p class="vd-eyebrow">value changes</p>
        <h2 id="changing">Current source</h2>
        <p>A new value clears the previous result; labels do not change the copied text.</p>
      </div>
      <div class="demo-panel demo-copy-stack">
        <code data-testid="current-source">{{ source() }}</code>
        <div class="demo-copy-row">
          <vd-copy-button
            data-testid="changing-copy"
            [value]="source()"
            copyingLabel="Копіюємо…"
            copiedLabel="Скопійовано"
            errorLabel="Спробувати ще раз"
            errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
            label="Копіювати поточний ID"
          /><button
            vdButton
            size="sm"
            (click)="source.set(source() === 'VDM-001' ? 'VDM-002' : 'VDM-001')"
          >
            Змінити ID
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Ukrainian · RTL</p>
        <h2 id="content">Real content</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel demo-copy-stack">
          <p>Посилання на довгостроковий план розвитку бібліотеки компонентів</p>
          <code class="demo-copy-source">{{ link }}</code
          ><vd-copy-button
            [value]="link"
            copyingLabel="Копіюємо…"
            copiedLabel="Скопійовано"
            errorLabel="Спробувати ще раз"
            errorMessage="Не вдалося скопіювати. Виділіть текст і скопіюйте вручну."
            label="Копіювати посилання на план розвитку бібліотеки"
          />
        </div>
        <div class="demo-panel demo-copy-stack" dir="rtl" lang="ar">
          <p>معرّف المشروع</p>
          <code dir="ltr">VDM-AR-2026</code
          ><vd-copy-button
            value="VDM-AR-2026"
            label="نسخ معرّف المشروع"
            copyingLabel="جارٍ النسخ…"
            copiedLabel="تم النسخ"
            errorLabel="حاول مرة أخرى"
            errorMessage="تعذّر النسخ. حدّد النص وانسخه يدويًا."
          />
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-copy-stack {
      display: grid;
      gap: var(--vd-space-4);
      min-inline-size: 0;
    }
    .demo-copy-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-4);
      align-items: center;
    }
    .demo-copy-sample {
      display: grid;
      gap: var(--vd-space-2);
      min-inline-size: 0;
      max-inline-size: 100%;
    }
    .demo-copy-code {
      overflow: hidden;
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-lg);
      background: var(--vd-color-surface-sunken);
    }
    .demo-copy-code__head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--vd-space-3);
      padding: var(--vd-space-4);
      border-block-end: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-copy-code pre {
      border: 0;
      border-radius: 0;
      background: transparent;
      margin: 0;
      padding: var(--vd-space-5);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    @media (width < 30rem) {
      .demo-copy-code__head {
        padding: var(--vd-space-2);
      }
      .demo-copy-code pre {
        padding: var(--vd-space-3);
      }
    }
    .demo-copy-note {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
      margin-block-start: var(--vd-space-3);
    }
    .demo-copy-table {
      min-inline-size: calc(var(--vd-space-24) * 6);
    }
    .demo-copy-source {
      overflow-wrap: anywhere;
    }
  `,
})
export default class CopyButtonPage {
  protected readonly command = 'npm install @vadem/ui';
  protected readonly link = 'https://example.com/projects/vadem/roadmap?language=uk';
  protected readonly lastEvent = signal('');
  protected readonly source = signal('VDM-001');
  protected readonly sizes: VdButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly variants: VdButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  protected readonly projects = [
    { name: 'Бібліотека компонентів', id: 'VDM-UI-2026' },
    { name: 'Кабінет користувача', id: 'VDM-ACCOUNT-2026' },
    { name: 'Звіти та аналітика', id: 'VDM-REPORTS-2026' },
  ];
}
