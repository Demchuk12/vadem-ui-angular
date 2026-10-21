import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdToaster } from '@vadem/ui/toast';

@Component({
  selector: 'demo-toast',
  imports: [VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Toast</p>
      <h1>Toast</h1>
      <p>
        Non-blocking feedback in a polite live region. Timers pause while you hover or focus the
        toasts; at most three are shown at once.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="variants">
      <div class="demo-section__head">
        <p class="vd-eyebrow">VdToaster.show()</p>
        <h2 id="variants">Variants</h2>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton (click)="neutral()">Нейтральний</button>
        <button vdButton (click)="success()">Успіх</button>
        <button vdButton (click)="warning()">Попередження</button>
        <button vdButton (click)="danger()">Помилка</button>
        <button vdButton (click)="info()">Інформація</button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="patterns">
      <div class="demo-section__head">
        <p class="vd-eyebrow">actions · long content · stacking</p>
        <h2 id="patterns">Patterns</h2>
      </div>
      <div class="demo-panel demo-row">
        <button vdButton variant="danger" (click)="undo()">Видалити файл</button>
        <button vdButton (click)="long()">Довгий текст</button>
        <button vdButton (click)="burst()">Чотири поспіль</button>
        <button vdButton variant="ghost" (click)="toaster.store.dismissAll()">Закрити всі</button>
      </div>
    </section>
  `,
  styles: `
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
  `,
})
export default class ToastPage {
  protected readonly toaster = inject(VdToaster);

  protected neutral(): void {
    this.toaster.show({ title: 'Посилання скопійовано' });
  }
  protected success(): void {
    this.toaster.success('Зміни збережено', 'Профіль оновлено для всіх учасників.');
  }
  protected warning(): void {
    this.toaster.show({
      variant: 'warning',
      title: 'Ліміт майже вичерпано',
      description: 'Використано 92% місячної квоти.',
    });
  }
  protected danger(): void {
    this.toaster.error('Не вдалося розгорнути', 'Збірка впала на кроці «test». Перевірте логи.');
  }
  protected info(): void {
    this.toaster.show({
      variant: 'info',
      title: 'Доступна нова версія',
      description: 'Vadem 0.0.2 вже на npm.',
    });
  }
  protected undo(): void {
    this.toaster.show({
      title: 'Файл «звіт-жовтень.csv» видалено',
      action: { label: 'Скасувати', onClick: () => this.toaster.success('Файл відновлено') },
    });
  }
  protected long(): void {
    this.toaster.show({
      variant: 'info',
      title: 'Синхронізацію з бухгалтерським обліком завершено з попередженнями',
      description:
        'Імпортовано 1 284 записи, 12 пропущено через некоректний формат дати. Завантажте звіт, щоб побачити подробиці.',
    });
  }
  protected burst(): void {
    ['Перший', 'Другий', 'Третій', 'Четвертий'].forEach((n, i) =>
      setTimeout(() => this.toaster.show({ title: `${n} тост` }), i * 150),
    );
  }
}
