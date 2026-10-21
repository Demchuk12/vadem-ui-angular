import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { VdAlertDialog } from '@vadem/ui/alert-dialog';
import { VdButton } from '@vadem/ui/button';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  imports: [VdAlertDialog, VdButton],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Alert dialog</h1>
      <p>Важлива дія починається з усвідомленого вибору. Початковий фокус завжди на скасуванні.</p>
    </header>
    <section class="demo-section" aria-labelledby="delete-record">
      <div class="demo-section__head">
        <h2 id="delete-record">Видалення звіту</h2>
        <p>
          Після підтвердження діалог дочекається результату. Це локальна демонстрація — справжні
          файли не видаляються.
        </p>
      </div>
      <div class="demo-panel">
        <p>Звіт за виробничу зміну · 18 жовтня 2026</p>
        <div class="demo-actions">
          <button vdButton variant="danger" (click)="show('success')">Видалити звіт</button>
          <button vdButton (click)="show('retry')">Помилка й повторна спроба</button>
          <button vdButton variant="secondary" (click)="show('pending')">Тривале виконання</button>
        </div>
      </div>
      <p role="status" data-testid="alert-result">{{ result() }}</p>
    </section>
    <section class="demo-section" aria-labelledby="other-decisions">
      <div class="demo-section__head">
        <h2 id="other-decisions">Інші важливі рішення</h2>
        <p>Текст пояснює наслідок, а назва кнопки — конкретну дію.</p>
      </div>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="show('publish')">Опублікувати зміни</button
        ><button vdButton variant="secondary" (click)="show('long')">Довгий опис</button
        ><button vdButton variant="secondary" (click)="show('sync')">Синхронна помилка</button>
      </div>
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="alert-arabic">
      <div class="demo-section__head">
        <h2 id="alert-arabic">حذف التقرير</h2>
        <p>يبقى التركيز أولاً على الإلغاء.</p>
      </div>
      <button vdButton variant="danger" (click)="show('rtl')">حذف التقرير</button>
    </section>
    <vd-alert-dialog
      [dir]="mode() === 'rtl' ? 'rtl' : 'ltr'"
      [(open)]="open"
      [title]="title()"
      [description]="description()"
      [action]="perform"
      [variant]="mode() === 'publish' ? 'primary' : 'danger'"
      [confirmLabel]="mode() === 'rtl' ? 'حذف' : mode() === 'publish' ? 'Опублікувати' : 'Видалити'"
      [cancelLabel]="mode() === 'rtl' ? 'إلغاء' : undefined"
      [pendingText]="mode() === 'rtl' ? 'جارٍ التنفيذ… يرجى الانتظار.' : undefined"
      [errorText]="mode() === 'rtl' ? 'تعذّر إكمال الإجراء. حاول مرة أخرى أو ألغِ.' : undefined"
      (confirmed)="result.set('Дію виконано. Це лише демонстрація.')"
      (canceled)="result.set('Дію скасовано. Звіт збережено.')"
      (actionFailed)="failures.set(failures() + 1)"
    />
  `,
})
export default class AlertDialogPage {
  protected readonly open = signal(false);
  protected readonly mode = signal('success');
  protected readonly result = signal('Звіт доступний для перегляду.');
  protected readonly failures = signal(0);
  protected readonly title = signal('');
  protected readonly description = signal('');
  private attempt = 0;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((timer) => clearTimeout(timer)));
  }
  protected show(mode: string): void {
    this.mode.set(mode);
    this.attempt = 0;
    this.failures.set(0);
    this.title.set(
      mode === 'rtl'
        ? 'حذف تقرير الوردية؟'
        : mode === 'publish'
          ? 'Опублікувати зміни?'
          : 'Видалити звіт за зміну?',
    );
    const text =
      mode === 'rtl'
        ? 'سيُحذف التقرير نهائيًا. لن تتمكن من استعادته بعد التأكيد.'
        : mode === 'publish'
          ? 'Оновлені дані одразу стануть доступними всій команді. Перевірте зміни перед публікацією.'
          : 'Звіт «Виробнича зміна — ї, є, і, ґ» буде видалено без можливості відновлення. Інші звіти залишаться доступними.';
    this.description.set(
      mode === 'long'
        ? text + ' ' + 'Документ_довгострокового_розвитку_виробничої_дільниці_2026 '.repeat(12)
        : text,
    );
    this.open.set(true);
  }
  protected readonly perform = (): void | Promise<void> => {
    const mode = this.mode();
    const attempt = ++this.attempt;
    if (mode === 'sync') throw new Error('Demonstration synchronous error');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => {
          this.timers.delete(timer);
          if (mode === 'retry' && attempt === 1) reject(new Error('Demonstration failure'));
          else resolve();
        },
        mode === 'pending' ? 5000 : 450,
      );
      this.timers.add(timer);
    });
  };
}
