import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdTagInput } from '@vadem/ui/tag-input';

@Component({
  selector: 'demo-tag-input',
  imports: [VdTagInput, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Tag input</p>
      <h1>Tag input</h1>
      <p>
        Create your own labels. Enter or the add button commits a tag; explicit remove actions keep
        editing predictable. Draft text stays separate from saved tags.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="project-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">reactive forms</p>
        <h2 id="project-title">Project labels</h2>
        <p>
          Case and surrounding whitespace do not create duplicates. An unfinished draft is preserved
          when a duplicate is detected.
        </p>
      </div>
      <form
        class="demo-panel demo-tag-stack"
        (submit)="$event.preventDefault(); submitted.set(submitted() + 1)"
      >
        <vd-field
          label="Теги проєкту"
          hint="Введіть тег і натисніть Enter. Backspace у порожньому полі переходить до останнього видалення."
          error="Додайте хоча б один тег"
        >
          <vd-tag-input
            [formControl]="project"
            placeholder="Наприклад, Доступність"
            addLabel="Додати"
            tagsLabel="Теги проєкту"
            [removeLabel]="removeLabel"
            [addedMessage]="addedMessage"
            [removedMessage]="removedMessage"
            [duplicateMessage]="duplicateMessage"
          />
        </vd-field>
        <p class="demo-token" data-testid="project-value">
          Tags: {{ project.value?.join(' · ') || 'empty' }}
        </p>
        <div class="demo-tag-actions">
          <button
            vdButton
            variant="secondary"
            type="button"
            (click)="project.setValue(['Реліз', 'Перевірка'])"
          >
            Завантажити теги</button
          ><button vdButton variant="ghost" type="button" (click)="project.reset()">Очистити</button
          ><button
            vdButton
            variant="ghost"
            type="button"
            (click)="project.disabled ? project.enable() : project.disable()"
          >
            Перемкнути доступність
          </button>
        </div>
        <p class="demo-token" data-testid="submit-count">Form submits: {{ submitted() }}</p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="sizes-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size</p>
        <h2 id="sizes-title">Three sizes</h2>
      </div>
      <div class="demo-panel demo-tag-grid">
        @for (size of sizes; track size) {
          <vd-field [label]="'Розмір ' + size"
            ><vd-tag-input
              [size]="size"
              [value]="['UI', 'Angular']"
              addLabel="Додати"
              [removeLabel]="removeLabel"
              placeholder="Новий тег"
          /></vd-field>
        }
      </div>
    </section>
    <section class="demo-section" aria-labelledby="states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">states</p>
        <h2 id="states-title">Available and protected values</h2>
      </div>
      <div class="demo-panel demo-tag-grid">
        <vd-field label="Порожній список" hint="Додайте перший тег"
          ><vd-tag-input addLabel="Додати" placeholder="Новий тег"
        /></vd-field>
        <vd-field label="Недоступне"
          ><vd-tag-input
            [value]="['Архів', '2026']"
            disabled
            addLabel="Додати"
            [removeLabel]="removeLabel"
        /></vd-field>
        <vd-field label="Лише читання" hint="Теги можна переглянути й скопіювати"
          ><vd-tag-input
            [value]="['Опубліковано', 'Документація']"
            readonly
            addLabel="Додати"
            [removeLabel]="removeLabel"
        /></vd-field>
        <vd-field label="Потребує перевірки" error="Перевірте теги перед публікацією"
          ><vd-tag-input
            [value]="['Неперевірено']"
            invalid
            addLabel="Додати"
            [removeLabel]="removeLabel"
        /></vd-field>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="signals-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">signal forms</p>
        <h2 id="signals-title">Skills in a form</h2>
        <p>
          Committed tags update the form model. Leaving the whole control marks it touched; moving
          between its input and buttons does not.
        </p>
      </div>
      <div class="demo-panel demo-tag-stack">
        <vd-field
          label="Навички команди"
          hint="Додайте хоча б одну навичку"
          error="Список навичок не може бути порожнім"
          ><vd-tag-input
            [formField]="skillsForm.skills"
            addLabel="Додати навичку"
            tagsLabel="Навички команди"
            [removeLabel]="removeLabel"
            [addedMessage]="addedMessage"
            [removedMessage]="removedMessage"
            [duplicateMessage]="duplicateMessage"
        /></vd-field>
        <p class="demo-token" data-testid="signal-value">
          Skills: {{ skillsModel().skills.join(' · ') || 'empty' }}
        </p>
        <div class="demo-tag-actions">
          <button
            vdButton
            variant="secondary"
            (click)="skillsModel.set({ skills: ['TypeScript', 'Дизайн'] })"
          >
            Завантажити навички</button
          ><button vdButton variant="ghost" (click)="skillsForm().reset({ skills: [] })">
            Скинути навички
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">real content · rtl</p>
        <h2 id="content-title">Labels that keep their meaning</h2>
        <p>
          Long labels wrap inside the tag, so their full text and removal action stay available.
        </p>
      </div>
      <div class="demo-panel demo-tag-grid">
        <vd-field label="Напрями роботи української команди з покращення доступності інтерфейсів"
          ><vd-tag-input
            [(value)]="workTags"
            addLabel="Додати напрям"
            [removeLabel]="removeLabel"
            [addedMessage]="addedMessage"
            [removedMessage]="removedMessage"
            [duplicateMessage]="duplicateMessage"
        /></vd-field>
        <div dir="rtl" lang="ar">
          <vd-field label="موضوعات المشروع" hint="أدخل موضوعًا واضغط Enter"
            ><vd-tag-input
              [(value)]="arabicTags"
              addLabel="إضافة"
              tagsLabel="موضوعات المشروع"
              [removeLabel]="arabicRemove"
              [addedMessage]="arabicAdded"
              [removedMessage]="arabicRemoved"
              [duplicateMessage]="arabicDuplicate"
          /></vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-tag-stack {
      display: grid;
      gap: var(--vd-space-5);
    }
    .demo-tag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-tag-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
  `,
})
export default class TagInputPage {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly project = new FormControl<string[]>(
    ['Дизайн', 'Українська'],
    Validators.required,
  );
  protected readonly submitted = signal(0);
  protected readonly skillsModel = signal({ skills: ['Angular'] });
  protected readonly skillsForm = form(this.skillsModel, (p) => {
    required(p.skills);
    minLength(p.skills, 1);
  });
  protected readonly workTags = signal([
    'Перевірка доступності для користувачів клавіатури',
    'ДужеДовгийНерозділенийІдентифікаторДляПеревіркиПеренесенняТексту',
    'і ї є ґ',
  ]);
  protected readonly arabicTags = signal(['تصميم', 'إمكانية الوصول']);
  protected readonly removeLabel = (tag: string) => `Видалити ${tag}`;
  protected readonly addedMessage = (tag: string) => `Додано «${tag}».`;
  protected readonly removedMessage = (tag: string) => `Видалено «${tag}».`;
  protected readonly duplicateMessage = (tag: string) => `Тег «${tag}» уже є у списку.`;
  protected readonly arabicRemove = (tag: string) => `إزالة ${tag}`;
  protected readonly arabicAdded = (tag: string) => `تمت إضافة ${tag}.`;
  protected readonly arabicRemoved = (tag: string) => `تمت إزالة ${tag}.`;
  protected readonly arabicDuplicate = (tag: string) => `${tag} موجود بالفعل.`;
}
