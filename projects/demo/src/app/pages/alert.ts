import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VD_ALERT, VdAlertVariant } from '@vadem/ui/alert';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-alert',
  imports: [VD_ALERT, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Alert</p>
      <h1>Alert & Banner</h1>
      <p>
        Inline message in the page flow. Tinted, never loud: the text carries the meaning, the icon
        and border are extra cues. Add <code>role="alert"</code> only when it appears after an
        action.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="variants">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdAlert] · variant</p>
        <h2 id="variants">Variants</h2>
      </div>
      <div class="demo-stack">
        @for (a of variants; track a.variant) {
          <div vdAlert [variant]="a.variant">
            <p vdAlertTitle>{{ a.title }}</p>
            <p>{{ a.text }}</p>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="parts">
      <div class="demo-section__head">
        <p class="vd-eyebrow">slot="end" · title only · no icon</p>
        <h2 id="parts">Actions and compact forms</h2>
      </div>
      <div class="demo-stack">
        <div vdAlert variant="warning">
          <p vdAlertTitle>Використано 92% місячної квоти</p>
          <p>Після 100% нові розгортання стануть у чергу до 1 листопада.</p>
          <button vdButton size="sm" slot="end">Змінити план</button>
        </div>
        @if (shown()) {
          <div vdAlert variant="info">
            <p>Нова версія API доступна з 1 листопада. Стара працюватиме ще 6 місяців.</p>
            <button
              vdButton
              variant="ghost"
              size="sm"
              iconOnly
              slot="end"
              aria-label="Закрити повідомлення"
              (click)="shown.set(false)"
            >
              <vd-icon name="x" />
            </button>
          </div>
        } @else {
          <div><button vdButton size="sm" (click)="shown.set(true)">Показати знову</button></div>
        }
        <div vdAlert variant="success"><p vdAlertTitle>Домен vadem.dev підтверджено</p></div>
        <div vdAlert [icon]="null">
          <p>Без іконки: для довідкових приміток усередині форм.</p>
        </div>
        <div vdAlert variant="info" icon="rocket">
          <p>Власна іконка: розгортання триває, це займе близько хвилини.</p>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="live">
      <div class="demo-section__head">
        <p class="vd-eyebrow">role="alert"</p>
        <h2 id="live">After an action</h2>
        <p>The alert is inserted when the error happens, so screen readers announce it.</p>
      </div>
      <div class="demo-panel demo-stack">
        <div>
          <button vdButton (click)="failed.set(!failed())">Імітувати помилку збереження</button>
        </div>
        @if (failed()) {
          <div vdAlert variant="danger" role="alert">
            <p vdAlertTitle>Не вдалося зберегти зміни</p>
            <p>Сервер не відповідає. Ваші дані збережено локально — спробуйте ще раз за хвилину.</p>
          </div>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="banner">
      <div class="demo-section__head">
        <p class="vd-eyebrow">layout="banner"</p>
        <h2 id="banner">Banner</h2>
        <p>
          A full-width strip above the page. With <code>dismissible</code> the alert adds a close
          button; when it is pressed, focus moves to the next control before the app removes the
          banner, so keyboard users are not dropped to the top of the page.
        </p>
      </div>
      <div class="demo-banner-frame">
        @if (maintenance()) {
          <div
            vdAlert
            layout="banner"
            variant="warning"
            dismissible
            (dismiss)="maintenance.set(false)"
            data-testid="banner-maintenance"
          >
            <p vdAlertTitle>Технічні роботи в неділю, 02:00–03:00.</p>
            <p>Розгортання будуть недоступні.</p>
            <a vdButton variant="ghost" size="sm" slot="end" href="#banner">Детальніше</a>
          </div>
        }
        @if (cookies()) {
          <div vdAlert layout="banner" [icon]="null" data-testid="banner-cookies">
            <p>Ми використовуємо лише необхідні cookies, щоб ви лишалися в системі.</p>
            <button vdButton size="sm" slot="end" (click)="cookies.set(false)">Зрозуміло</button>
          </div>
        }
        <div class="demo-banner-page">
          <p class="demo-banner-page__title">Проєкти</p>
          <a href="#banner" data-testid="banner-next">Перший проєкт після банера</a>
        </div>
      </div>
      <div class="demo-row">
        <button
          vdButton
          variant="secondary"
          size="sm"
          (click)="maintenance.set(true); cookies.set(true)"
        >
          Показати банери знову
        </button>
      </div>
      <div vdAlert variant="info" dismissible (dismiss)="tip.set(false)" [hidden]="!tip()">
        <p vdAlertTitle>Порада</p>
        <p>Inline alerts can be dismissible too.</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long text, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div vdAlert variant="danger">
          <p vdAlertTitle>
            Синхронізацію з бухгалтерським обліком завершено з помилками в 12 записах із 1 284
          </p>
          <p>
            Записи з некоректним форматом дати пропущено. Завантажте звіт, виправте дати у форматі
            ДД.ММ.РРРР і повторіть імпорт.
          </p>
        </div>
        <div vdAlert variant="warning" dir="rtl" lang="ar">
          <p vdAlertTitle>اقتربت من الحد</p>
          <p>استخدمت 92٪ من الحصة الشهرية.</p>
          <button vdButton size="sm" slot="end">ترقية</button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-banner-frame {
      overflow: hidden;
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-lg);
    }
    .demo-banner-page {
      display: grid;
      gap: var(--vd-space-2);
      padding: var(--vd-space-6);
    }
    .demo-banner-page__title {
      margin: 0;
      font-size: var(--vd-text-xl);
      font-weight: var(--vd-weight-bold);
    }
    .demo-row {
      display: flex;
      gap: var(--vd-space-2);
      margin-block: var(--vd-space-4);
    }
    .demo-panel .vd-button {
      max-inline-size: 100%;
    }
  `,
})
export default class AlertPage {
  protected readonly shown = signal(true);
  protected readonly maintenance = signal(true);
  protected readonly cookies = signal(true);
  protected readonly tip = signal(true);
  protected readonly failed = signal(false);
  protected readonly variants: { variant: VdAlertVariant; title: string; text: string }[] = [
    {
      variant: 'neutral',
      title: 'Технічні роботи в неділю',
      text: 'З 02:00 до 03:00 за Києвом API може відповідати повільніше.',
    },
    {
      variant: 'info',
      title: 'Доступна нова версія CLI',
      text: 'Оновіться до vadem 2.4, щоб отримати швидші збірки.',
    },
    {
      variant: 'success',
      title: 'Платіж отримано',
      text: 'Рахунок INV-2026-0142 оплачено, квитанцію надіслано на пошту.',
    },
    {
      variant: 'warning',
      title: 'Сертифікат спливає через 7 днів',
      text: 'Автоматичне оновлення вимкнено для api.vadem.dev.',
    },
    {
      variant: 'danger',
      title: 'Розгортання не вдалося',
      text: 'Збірка впала на кроці «test». Відкрийте логи, щоб побачити причину.',
    },
  ];
}
