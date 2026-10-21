import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdEditableText } from '@vadem/ui/editable-text';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  selector: 'demo-editable-text',
  imports: [VdEditableText, VdButton],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Editable text</p>
      <h1>Editable text</h1>
      <p>
        Edit a value in place. Enter saves, Escape cancels; leaving the field keeps the draft open.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="editable-save">
      <div class="demo-section__head">
        <h2 id="editable-save">Save and retry</h2>
        <p>
          This local simulation rejects the first save. Your draft stays available for another
          attempt.
        </p>
      </div>
      <form
        class="demo-panel demo-editable"
        (submit)="$event.preventDefault(); submissions.set(submissions() + 1)"
      >
        <vd-editable-text
          data-testid="project-editor"
          label="Назва проєкту"
          [(value)]="name"
          [save]="persist"
          required
          [maxLength]="80"
          hint="До 80 символів. Enter — зберегти, Escape — скасувати."
        />
        <p data-testid="committed-value">Збережене значення: {{ name() }}</p>
        <p data-testid="save-attempts">Спроб збереження: {{ attempts() }}</p>
        <p data-testid="form-submissions">Надсилань форми: {{ submissions() }}</p>
        <button vdButton type="button" (click)="failNext.set(true)">
          Наступне збереження з помилкою
        </button>
        <button vdButton type="button" data-testid="outside-action">Наступна дія</button>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="editable-states">
      <div class="demo-section__head"><h2 id="editable-states">Local values and content</h2></div>
      <div class="demo-panel demo-editable">
        <vd-editable-text label="Примітка" />
        <vd-editable-text label="Архівний запис" value="Редагування недоступне" disabled />
        <vd-editable-text
          label="Повна назва виробничого підрозділу та відповідального за зміни"
          value="Виробнича дільниця підготовки й фасування молочної продукції"
        />
        <vd-editable-text
          dir="rtl"
          lang="ar"
          label="اسم المشروع"
          value="خط تعبئة المنتجات"
          emptyText="إضافة قيمة"
          [editLabel]="arabicEditLabel"
          saveLabel="حفظ"
          cancelLabel="إلغاء"
          savingText="جارٍ الحفظ"
          savedText="تم الحفظ"
        />
      </div>
    </section>
  `,
  styles: `
    .demo-editable {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 36rem;
    }
    .demo-editable > * {
      min-inline-size: 0;
    }
    .demo-editable p {
      overflow-wrap: anywhere;
    }
    .demo-editable > button {
      white-space: normal;
    }
  `,
})
export default class EditableTextPage {
  readonly name = signal('Лінія фасування № 4');
  readonly attempts = signal(0);
  readonly submissions = signal(0);
  readonly failNext = signal(true);
  readonly arabicEditLabel = (label: string, value: string) => `تعديل ${label}: ${value}`;
  readonly persist = async (_value: string): Promise<void> => {
    this.attempts.update((count) => count + 1);
    const fail = this.failNext();
    this.failNext.set(false);
    await new Promise<void>((resolve) => setTimeout(resolve, 650));
    if (fail) throw new Error('Simulated persistence failure');
  };
}
