import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VdChoice, VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';
import { VD_POPOVER, VdPopoverPlacement } from '@vadem/ui/popover';
import { VdToaster } from '@vadem/ui/toast';

@Component({
  selector: 'demo-popover',
  imports: [VD_POPOVER, VdButton, VdCheckbox, VdChoice, VdField, VdIcon, VdInput, VdInputGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Popover</p>
      <h1>Popover</h1>
      <p>
        A non-modal panel with any content, anchored to its button. Click outside or press Escape to
        close; focus goes in on open and back to the button on close.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="examples">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdPopoverTrigger] · [vdPopover]</p>
        <h2 id="examples">Examples</h2>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton [vdPopoverTrigger]="share">
          <vd-icon name="external-link" slot="start" />Поділитися
        </button>
        <div vdPopover #share="vdPopover" aria-labelledby="share-title" class="demo-pop">
          <h3 id="share-title" class="demo-pop__title">Поділитися проєктом</h3>
          <p class="demo-muted">Кожен із посиланням зможе переглядати, але не редагувати.</p>
          <vd-input-group>
            <input vdInput readonly value="https://vadem.dev/p/payments" aria-label="Посилання" />
            <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -- popovers focus [autofocus] on show, like dialogs -->
            <button vdButton size="sm" variant="ghost" slot="end" autofocus (click)="copy(share)">
              <vd-icon name="copy" slot="start" />Копіювати
            </button>
          </vd-input-group>
        </div>

        <button vdButton variant="ghost" [vdPopoverTrigger]="filters">
          Фільтри{{ active().length ? ' · ' + active().length : '' }}
          <vd-icon name="chevron-down" slot="end" />
        </button>
        <div vdPopover #filters="vdPopover" aria-label="Фільтри статусу" class="demo-pop">
          <p class="vd-eyebrow">Статус</p>
          @for (s of statuses; track s) {
            <label vdChoice>
              <input
                type="checkbox"
                vdCheckbox
                [checked]="active().includes(s)"
                (change)="toggle(s)"
              />{{ s }}
            </label>
          }
          <div class="demo-pop__actions">
            <button vdButton size="sm" variant="ghost" (click)="active.set([])">Скинути</button>
            <button vdButton size="sm" variant="primary" (click)="filters.hide()">Готово</button>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="placement">
      <div class="demo-section__head">
        <p class="vd-eyebrow">placement · flips at the edges</p>
        <h2 id="placement">Placement</h2>
      </div>
      <div class="demo-panel demo-placements">
        @for (p of placements; track p) {
          <button vdButton size="sm" [vdPopoverTrigger]="pop">{{ p }}</button>
          <div
            vdPopover
            #pop="vdPopover"
            [placement]="p"
            [attr.aria-label]="'Popover ' + p"
            class="demo-pop demo-pop--small"
          >
            <p>placement="{{ p }}"</p>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">form inside · RTL</p>
        <h2 id="content">Form, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <button vdButton [vdPopoverTrigger]="rename">Перейменувати</button>
          <div vdPopover #rename="vdPopover" aria-label="Перейменувати проєкт" class="demo-pop">
            <form
              class="demo-pop__form"
              (submit)="$event.preventDefault(); rename.hide(); renamed()"
            >
              <vd-field label="Назва проєкту">
                <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -- popovers focus [autofocus] on show, like dialogs -->
                <input vdInput value="Платформа оплат" autofocus />
              </vd-field>
              <div class="demo-pop__actions">
                <button vdButton size="sm" variant="primary" type="submit">Зберегти</button>
              </div>
            </form>
          </div>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <button vdButton [vdPopoverTrigger]="ar">مشاركة</button>
          <div vdPopover #ar="vdPopover" aria-label="مشاركة" class="demo-pop">
            <p>أي شخص لديه الرابط يمكنه العرض.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-placements {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--vd-space-3);
      padding-block: var(--vd-space-12);
    }
    .demo-pop {
      display: grid;
      gap: var(--vd-space-3);
    }
    .demo-pop:not(:popover-open) {
      display: none;
    }
    .demo-pop--small {
      --vd-popover-width: 12rem;
    }
    .demo-pop__title {
      font-size: var(--vd-text-md);
    }
    .demo-pop__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--vd-space-2);
    }
    .demo-pop__form {
      display: grid;
      gap: var(--vd-space-3);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
    }
  `,
})
export default class PopoverPage {
  private readonly toaster = inject(VdToaster);
  protected readonly placements: VdPopoverPlacement[] = ['bottom', 'top', 'start', 'end'];
  protected readonly statuses = ['Працює', 'Збирається', 'Збій', 'У черзі'];
  protected readonly active = signal<string[]>(['Збій']);

  protected toggle(status: string): void {
    this.active.update((list) =>
      list.includes(status) ? list.filter((s) => s !== status) : [...list, status],
    );
  }

  protected copy(popover: { hide(): void }): void {
    popover.hide();
    this.toaster.show({ title: 'Посилання скопійовано' });
  }

  protected renamed(): void {
    this.toaster.success('Проєкт перейменовано');
  }
}
