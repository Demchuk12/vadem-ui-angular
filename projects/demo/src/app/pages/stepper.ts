import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
import { VD_STEPPER } from '@vadem/ui/stepper';

@Component({
  selector: 'demo-stepper',
  imports: [ReactiveFormsModule, VdButton, VdField, VdInput, ...VD_STEPPER],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Stepper</p>
      <h1>Stepper</h1>
      <p>
        Ordered stages of a process. Native buttons navigate; the application owns validation,
        completed stages and the content below. Horizontal steps stack in narrow containers.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="wizard">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[(value)] · validation · focus</p>
        <h2 id="wizard">Create a workspace</h2>
        <p>Complete each stage to unlock the next. Previous stages stay available for editing.</p>
      </div>
      <div class="demo-panel demo-stepper-stack">
        <nav
          vdStepper
          label="Створення робочого простору"
          [(value)]="stage"
          [disabled]="finished()"
          completedLabel="Завершено"
          errorLabel="Потрібно виправити"
        >
          <ol>
            <li>
              <button vdStep value="name" [completed]="nameDone()" [invalid]="nameError()">
                <span vdStepTitle>Робочий простір</span
                ><span vdStepDescription>Назва для вашої команди</span>
              </button>
            </li>
            <li>
              <button
                vdStep
                value="contact"
                [disabled]="!nameDone()"
                [completed]="contactDone()"
                [invalid]="contactError()"
              >
                <span vdStepTitle>Контакт</span><span vdStepDescription>Адреса для сповіщень</span>
              </button>
            </li>
            <li>
              <button vdStep value="review" [disabled]="!contactDone()" [completed]="finished()">
                <span vdStepTitle>Підтвердження</span
                ><span vdStepDescription>Перевірте деталі</span>
              </button>
            </li>
          </ol>
        </nav>
        <form class="demo-stepper-form" [formGroup]="details" (ngSubmit)="next()" novalidate>
          <h3 #stageHeading tabindex="-1">
            {{
              finished()
                ? 'Усе готово'
                : stage() === 'name'
                  ? 'Назвіть робочий простір'
                  : stage() === 'contact'
                    ? 'Додайте контакт'
                    : 'Перевірте дані'
            }}
          </h3>
          @if (finished()) {
            <p role="status">
              Робочий простір «{{ name.value }}» готовий. Це локальне демо без збереження даних.
            </p>
            <button vdButton type="button" variant="secondary" (click)="reset()">
              Почати знову
            </button>
          } @else {
            @switch (stage()) {
              @case ('name') {
                <vd-field
                  label="Назва простору"
                  hint="Щонайменше 3 символи"
                  error="Введіть назву: щонайменше 3 символи"
                >
                  <input vdInput [formControl]="name" autocomplete="organization" />
                </vd-field>
              }
              @case ('contact') {
                <vd-field label="Контактний email" error="Введіть коректну електронну адресу">
                  <input vdInput type="email" [formControl]="email" autocomplete="email" />
                </vd-field>
              }
              @case ('review') {
                <dl class="demo-stepper-summary">
                  <dt>Робочий простір</dt>
                  <dd>{{ name.value }}</dd>
                  <dt>Контактний email</dt>
                  <dd>{{ email.value }}</dd>
                </dl>
              }
            }
            <div class="demo-stepper-actions">
              @if (stage() !== 'name') {
                <button
                  vdButton
                  type="button"
                  variant="secondary"
                  (click)="move(stage() === 'review' ? 'contact' : 'name')"
                >
                  Назад
                </button>
              }
              <button vdButton type="submit" variant="primary">
                {{ stage() === 'review' ? 'Створити простір' : 'Продовжити' }}
              </button>
            </div>
          }
        </form>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">completed · current · invalid · disabled</p>
        <h2 id="states">Process states</h2>
      </div>
      <div class="demo-panel demo-stepper-stack">
        <nav
          vdStepper
          label="Публікація"
          value="review"
          completedLabel="Завершено"
          errorLabel="Потрібно виправити"
        >
          <ol>
            <li>
              <button vdStep value="draft" completed>
                <span vdStepTitle>Чернетка</span><span vdStepDescription>Матеріали зібрано</span>
              </button>
            </li>
            <li>
              <button vdStep value="review" invalid>
                <span vdStepTitle>Перевірка</span><span vdStepDescription>Додайте обкладинку</span>
              </button>
            </li>
            <li>
              <button vdStep value="publish" disabled>
                <span vdStepTitle>Публікація</span><span vdStepDescription>Після перевірки</span>
              </button>
            </li>
          </ol>
        </nav>
        <nav vdStepper label="Завершений процес" value="done" disabled completedLabel="Завершено">
          <ol>
            <li>
              <button vdStep value="sent" completed><span vdStepTitle>Надіслано</span></button>
            </li>
            <li>
              <button vdStep value="done" completed>
                <span vdStepTitle>Підтверджено</span
                ><span vdStepDescription>Процес завершений, зміни недоступні</span>
              </button>
            </li>
          </ol>
        </nav>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">vertical · realistic content · RTL</p>
        <h2 id="content">Content and direction</h2>
      </div>
      <div class="demo-grid" style="--demo-min: min(18rem, 100%)">
        <div class="demo-panel">
          <nav
            vdStepper
            orientation="vertical"
            label="Підготовка документів"
            value="approval"
            completedLabel="Завершено"
          >
            <ol>
              <li>
                <button vdStep value="documents" completed>
                  <span vdStepTitle
                    >Завантаження всіх супровідних документів для міжнародної співпраці</span
                  ><span vdStepDescription>Договір, додатки та підтвердження реквізитів</span>
                </button>
              </li>
              <li>
                <button vdStep value="approval">
                  <span vdStepTitle>Погодження відповідальними учасниками команди</span
                  ><span vdStepDescription>Кожен учасник перевіряє свою частину</span>
                </button>
              </li>
              <li>
                <button vdStep value="sign"><span vdStepTitle>Підпис</span></button>
              </li>
            </ol>
          </nav>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <nav vdStepper label="إنشاء مساحة العمل" value="team" completedLabel="مكتمل">
            <ol>
              <li>
                <button vdStep value="account" completed>
                  <span vdStepTitle>الحساب</span><span vdStepDescription>بيانات الاتصال</span>
                </button>
              </li>
              <li>
                <button vdStep value="team">
                  <span vdStepTitle>الفريق</span
                  ><span vdStepDescription>إضافة أعضاء مساحة العمل</span>
                </button>
              </li>
              <li>
                <button vdStep value="confirm"><span vdStepTitle>التأكيد</span></button>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-page-head {
      overflow-wrap: anywhere;
    }
    .demo-stepper-stack {
      display: grid;
      gap: var(--vd-space-8);
    }
    .demo-stepper-stack > * {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .demo-stepper-form {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 32rem;
      padding-block-start: var(--vd-space-6);
      border-block-start: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-stepper-form h3:focus-visible {
      outline: var(--vd-focus-ring-width) solid var(--vd-color-focus);
      outline-offset: var(--vd-focus-ring-offset);
    }
    .demo-stepper-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-stepper-summary {
      display: grid;
      gap: var(--vd-space-2);
      overflow-wrap: anywhere;
    }
    .demo-stepper-summary dt {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-stepper-summary dd + dt {
      margin-block-start: var(--vd-space-3);
    }
  `,
})
export default class StepperPage {
  protected readonly stage = signal<string | undefined>('name');
  protected readonly nameDone = signal(false);
  protected readonly contactDone = signal(false);
  protected readonly nameError = signal(false);
  protected readonly contactError = signal(false);
  protected readonly finished = signal(false);
  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly details = new FormGroup({ name: this.name, email: this.email });
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('stageHeading');
  private readonly injector = inject(Injector);

  protected next(): void {
    if (this.stage() === 'name') {
      this.name.markAsTouched();
      this.nameError.set(this.name.invalid);
      if (this.name.invalid) return;
      this.nameDone.set(true);
      this.move('contact');
    } else if (this.stage() === 'contact') {
      this.email.markAsTouched();
      this.contactError.set(this.email.invalid);
      if (this.email.invalid) return;
      this.contactDone.set(true);
      this.move('review');
    } else {
      // Earlier stages can be edited after unlocking review; revalidate before completion.
      if (this.name.invalid) {
        this.move('name');
        this.next();
        return;
      }
      if (this.email.invalid) {
        this.move('contact');
        this.next();
        return;
      }
      this.finished.set(true);
      this.focusHeading();
    }
  }

  protected move(stage: string): void {
    this.stage.set(stage);
    this.focusHeading();
  }
  protected reset(): void {
    this.name.reset();
    this.email.reset();
    this.nameDone.set(false);
    this.contactDone.set(false);
    this.nameError.set(false);
    this.contactError.set(false);
    this.finished.set(false);
    this.move('name');
  }
  private focusHeading(): void {
    afterNextRender(() => this.heading().nativeElement.focus(), { injector: this.injector });
  }
}
