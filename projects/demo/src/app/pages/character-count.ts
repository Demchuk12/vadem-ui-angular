import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, maxLength } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdCharacterCount } from '@vadem/ui/character-count';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  selector: 'demo-character-count',
  imports: [ReactiveFormsModule, FormField, VdCharacterCount, VdField, VdInput, VdButton],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Character count</p>
      <h1>Character count</h1>
      <p>
        Used, remaining and excess characters. A quiet description below the field, with
        announcements after a pause in typing.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="count-details">
      <div class="demo-section__head">
        <h2 id="count-details">Опис виробничої зміни</h2>
        <p>
          Лічильник не обрізає текст. Вставте довгий опис, а потім скоротіть його до 120 символів.
        </p>
      </div>
      <form class="demo-panel demo-count" novalidate (submit)="$event.preventDefault(); check()">
        <vd-field
          label="Що змінилося на виробничій дільниці?"
          hint="Коротко опишіть зміну для наступної команди."
          error="Скоротіть опис до 120 символів."
          [descriptionIds]="detailsCount.descriptionId()"
        >
          <textarea vdInput id="shift-details" rows="3" [formControl]="details"></textarea>
          <vd-character-count
            #detailsCount
            data-testid="details-count"
            controlId="shift-details"
            [value]="detailsValue()"
            [maxLength]="120"
          />
        </vd-field>
        <div class="demo-count__actions">
          <button vdButton variant="primary" type="submit">Перевірити опис</button>
          <button vdButton type="button" (click)="details.reset(''); result.set('')">
            Очистити
          </button>
        </div>
        <p role="status" data-testid="count-result">{{ result() }}</p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="count-forms">
      <div class="demo-section__head"><h2 id="count-forms">Input and Signal Forms</h2></div>
      <div class="demo-panel demo-count">
        <vd-field
          label="Коротка назва звіту"
          hint="До 24 символів."
          error="Скоротіть назву до 24 символів."
          [descriptionIds]="titleCount.descriptionId()"
        >
          <input vdInput id="report-title" [formField]="titleForm.title" />
          <vd-character-count
            #titleCount
            data-testid="title-count"
            controlId="report-title"
            [value]="titleModel().title"
            [maxLength]="24"
          />
        </vd-field>
        <button
          vdButton
          type="button"
          (click)="titleModel.set({ title: 'Звіт із дуже довгою назвою виробничого підрозділу' })"
        >
          Завантажити довгу назву
        </button>
        <vd-field
          label="Додаткові нотатки без ліміту"
          [descriptionIds]="notesCount.descriptionId()"
        >
          <textarea vdInput id="notes-unlimited" rows="2" [formControl]="notes"></textarea>
          <vd-character-count #notesCount controlId="notes-unlimited" [value]="notesValue()" />
        </vd-field>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="count-states">
      <div class="demo-section__head"><h2 id="count-states">Limits and content</h2></div>
      <div class="demo-panel demo-count">
        <vd-field label="Незмінний код" [descriptionIds]="readonlyCount.descriptionId()">
          <input vdInput id="count-readonly" readonly value="Лінія № 4" />
          <vd-character-count
            #readonlyCount
            controlId="count-readonly"
            value="Лінія № 4"
            [maxLength]="20"
          />
        </vd-field>
        <vd-field label="Недоступний запис" [descriptionIds]="disabledCount.descriptionId()">
          <input vdInput id="count-disabled" disabled value="Архів" />
          <vd-character-count
            #disabledCount
            controlId="count-disabled"
            value="Архів"
            [maxLength]="20"
          />
        </vd-field>
        <div class="demo-count" aria-label="Limit examples">
          <vd-character-count data-testid="exact-count" value="Зміна" [maxLength]="5" />
          <vd-character-count data-testid="zero-count" value="" [maxLength]="0" />
          <vd-character-count
            data-testid="over-count"
            value="Коментар до виробничого звіту"
            [maxLength]="12"
          />
        </div>
        <div class="demo-count" dir="rtl" lang="ar">
          <vd-field label="ملاحظات التقرير" [descriptionIds]="arabicCount.descriptionId()">
            <textarea vdInput id="count-arabic" rows="2" [formControl]="arabic"></textarea>
            <vd-character-count
              #arabicCount
              controlId="count-arabic"
              [value]="arabicValue()"
              [maxLength]="40"
              [remainingText]="arabicRemaining"
              [overText]="arabicOver"
              limitText="تم بلوغ الحد المسموح"
            />
          </vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-count {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-5);
      max-inline-size: 40rem;
    }
    .demo-count.demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-count__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-count button {
      max-inline-size: 100%;
      white-space: normal;
    }
    .demo-count .vd-field__label,
    .demo-count .vd-field__hint {
      overflow-wrap: anywhere;
    }
    .demo-count .vd-field__error > span {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .demo-count p[role='status']:empty {
      display: none;
    }
  `,
})
export default class CharacterCountPage {
  readonly details = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(120)],
  });
  readonly detailsValue = toSignal(this.details.valueChanges, { initialValue: this.details.value });
  readonly notes = new FormControl('', { nonNullable: true });
  readonly notesValue = toSignal(this.notes.valueChanges, { initialValue: this.notes.value });
  readonly titleModel = signal({ title: 'Звіт за зміну' });
  readonly titleForm = form(this.titleModel, (path) => maxLength(path.title, 24));
  readonly result = signal('');
  readonly arabic = new FormControl('ملاحظات حول جودة الإنتاج', { nonNullable: true });
  readonly arabicValue = toSignal(this.arabic.valueChanges, { initialValue: this.arabic.value });
  readonly arabicRemaining = (count: number) => `عدد الأحرف المتبقية: ${count}`;
  readonly arabicOver = (count: number) => `عدد الأحرف الزائدة: ${count}`;

  check(): void {
    this.details.markAsTouched();
    this.result.set(
      this.details.invalid
        ? 'Скоротіть опис, щоб продовжити.'
        : 'Опис готовий. Це локальна перевірка — дані нікуди не надіслано.',
    );
  }
}
