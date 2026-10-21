import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdFormErrorSummary, type VdFormError } from '@vadem/ui/form-error-summary';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  selector: 'demo-form-error-summary',
  imports: [VdFormErrorSummary, VdField, VdInput, VdButton],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Form error summary</p>
      <h1>Form error summary</h1>
      <p>
        A clear route back to the fields that need attention. Submit this local form to see the
        summary; each link focuses its field.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="summary-form-heading">
      <div class="demo-section__head">
        <h2 id="summary-form-heading">Заявка на доступ</h2>
        <p>Перевірте контактні дані та вкажіть, для чого потрібен доступ до виробничих звітів.</p>
      </div>
      <form
        class="demo-panel demo-error-form"
        novalidate
        (submit)="$event.preventDefault(); submit()"
      >
        <vd-form-error-summary #summary data-testid="live-summary" [errors]="errors()" />
        <vd-field label="Ім’я та прізвище" [error]="nameError() || undefined">
          <input
            vdInput
            id="request-name"
            autocomplete="name"
            required
            [value]="name()"
            [invalid]="submitted() && !!nameError()"
            (input)="name.set($any($event.target).value); saved.set(false)"
          />
        </vd-field>
        <vd-field label="Робоча електронна пошта" [error]="emailError() || undefined">
          <input
            vdInput
            id="request:email"
            type="email"
            autocomplete="email"
            required
            [value]="email()"
            [invalid]="submitted() && !!emailError()"
            (input)="email.set($any($event.target).value); saved.set(false)"
          />
        </vd-field>
        <vd-field
          label="Мета доступу до виробничих звітів і відповідальний підрозділ"
          [error]="reasonError() || undefined"
          hint="Наприклад, щотижневий аналіз якості на дільниці фасування."
        >
          <textarea
            vdInput
            id="request-reason"
            required
            rows="3"
            [value]="reason()"
            [invalid]="submitted() && !!reasonError()"
            (input)="reason.set($any($event.target).value); saved.set(false)"
          ></textarea>
        </vd-field>
        <button vdButton variant="primary" type="submit">Надіслати заявку</button>
        <p role="status" data-testid="request-result">
          {{ saved() ? 'Дані перевірено. Це демонстрація — заявку нікуди не надіслано.' : '' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="summary-content-heading">
      <div class="demo-section__head">
        <h2 id="summary-content-heading">Long content and RTL</h2>
        <p>
          Messages match the corresponding inline error. The form owns validation and when focus
          moves.
        </p>
      </div>
      <div class="demo-panel demo-error-form">
        <vd-form-error-summary
          [errors]="longErrors"
          title="Уточніть дані відповідального за виробничу дільницю"
          description="Виберіть повідомлення, щоб повернутися до поля."
        />
        <vd-field
          label="Повна назва підрозділу"
          error="Укажіть повну назву підрозділу, відповідального за перевірку щотижневих виробничих звітів."
        >
          <input vdInput id="department-name" invalid />
        </vd-field>
        <div dir="rtl" lang="ar" class="demo-error-form">
          <vd-form-error-summary
            [errors]="arabicErrors"
            title="تحقق من النموذج"
            description="صحح الحقول التالية قبل المتابعة."
          />
          <vd-field label="اسم القسم" error="أدخل اسم القسم المسؤول عن التقارير."
            ><input vdInput id="arabic-department" invalid
          /></vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-error-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-5);
      max-inline-size: 40rem;
    }
    .demo-error-form.demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-error-form vd-form-error-summary {
      scroll-margin-block-start: var(--vd-space-16);
    }
    .demo-error-form > button {
      justify-self: start;
      max-inline-size: 100%;
      white-space: normal;
    }
    .demo-error-form .vd-field__label {
      overflow-wrap: anywhere;
    }
    .demo-error-form .vd-field__error > span {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .demo-error-form .vd-field__hint {
      overflow-wrap: anywhere;
    }
    .demo-error-form [role='status']:empty {
      display: none;
    }
  `,
})
export default class FormErrorSummaryPage {
  readonly name = signal('');
  readonly email = signal('');
  readonly reason = signal('');
  readonly submitted = signal(false);
  readonly saved = signal(false);
  readonly nameError = computed(() => (this.name().trim() ? '' : 'Введіть ім’я та прізвище.'));
  readonly emailError = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())
      ? ''
      : 'Введіть робочу електронну пошту, наприклад name@example.com.',
  );
  readonly reasonError = computed(() =>
    this.reason().trim() ? '' : 'Опишіть мету доступу до виробничих звітів.',
  );
  readonly errors = computed<readonly VdFormError[]>(() =>
    !this.submitted()
      ? []
      : [
          { target: 'request-name', message: this.nameError() },
          { target: 'request:email', message: this.emailError() },
          { target: 'request-reason', message: this.reasonError() },
        ].filter((error) => !!error.message),
  );
  readonly longErrors = [
    {
      target: 'department-name',
      message:
        'Укажіть повну назву підрозділу, відповідального за перевірку щотижневих виробничих звітів.',
    },
  ];
  readonly arabicErrors = [
    { target: 'arabic-department', message: 'أدخل اسم القسم المسؤول عن التقارير.' },
  ];
  private readonly summary = viewChild<VdFormErrorSummary>('summary');

  submit(): void {
    this.submitted.set(true);
    this.saved.set(!this.errors().length);
    if (this.errors().length) this.summary()?.focus();
  }
}
