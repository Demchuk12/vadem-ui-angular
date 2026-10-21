import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VD_ACCORDION } from '@vadem/ui/accordion';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-accordion',
  imports: [VD_ACCORDION, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Accordion</p>
      <h1>Accordion</h1>
      <p>
        Native <code>&lt;details&gt;</code>: keyboard, state and find-in-page come from the browser.
        Exclusive groups share a <code>name</code>. Height animates where the platform can
        interpolate to <code>auto</code>.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="faq">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdAccordion] exclusive · details[vdAccordionItem]</p>
        <h2 id="faq">FAQ (one open at a time)</h2>
        <p>Try Ctrl+F “гривні”: the matching item opens.</p>
      </div>
      <div vdAccordion exclusive class="demo-narrow">
        @for (q of faq; track q.q; let first = $first) {
          <details vdAccordionItem [open]="first">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        }
      </div>
    </section>

    <section class="demo-section" aria-labelledby="multi">
      <div class="demo-section__head">
        <p class="vd-eyebrow">independent items · [(open)] · icons</p>
        <h2 id="multi">Independent sections</h2>
      </div>
      <div vdAccordion class="demo-narrow">
        <details vdAccordionItem [(open)]="billing">
          <summary><vd-icon name="credit-card" />Оплата</summary>
          <p>Картка закінчується на 4242. Наступне списання 1 листопада, ₴ 1 200.</p>
        </details>
        <details vdAccordionItem>
          <summary><vd-icon name="shield" />Безпека</summary>
          <p>Двофакторна автентифікація вимкнена. Рекомендуємо увімкнути її для всіх власників.</p>
        </details>
        <details vdAccordionItem>
          <summary><vd-icon name="users" />Учасники</summary>
          <p>5 учасників, 2 запрошення очікують відповіді.</p>
        </details>
      </div>
      <p class="demo-token">billing open: {{ billing() }}</p>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">standalone · long title · RTL</p>
        <h2 id="content">Real content</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <details vdAccordionItem>
          <summary>
            Чому розгортання в регіоні eu-central-1 займає більше часу, ніж у eu-west-1?
          </summary>
          <p>
            Збірки кешуються в регіоні, де виконувались востаннє. Перше розгортання в новому регіоні
            прогріває кеш і триває до двох хвилин.
          </p>
        </details>
        <div vdAccordion dir="rtl" lang="ar">
          <details vdAccordionItem open>
            <summary>كيف أغير خطتي؟</summary>
            <p>من الإعدادات، ثم الفوترة.</p>
          </details>
          <details vdAccordionItem>
            <summary>هل يمكنني الإلغاء؟</summary>
            <p>نعم، في أي وقت.</p>
          </details>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-narrow {
      max-inline-size: 44rem;
    }
  `,
})
export default class AccordionPage {
  protected readonly billing = signal(false);
  protected readonly faq = [
    {
      q: 'Як змінити тарифний план?',
      a: 'Відкрийте Налаштування → Оплата і оберіть новий план. Різниця розраховується пропорційно до кінця місяця.',
    },
    {
      q: 'Чи можна платити в гривнях?',
      a: 'Так, рахунки виставляються в гривнях або доларах, оплата карткою чи за рахунком для юросіб.',
    },
    {
      q: 'Що буде з даними після скасування?',
      a: 'Проєкти зберігаються ще 30 днів, потім видаляються назавжди. Експорт доступний увесь цей час.',
    },
    {
      q: 'Чи є знижки для освіти й неприбуткових організацій?',
      a: 'Так, 50% на план Team. Напишіть нам з корпоративної пошти організації.',
    },
  ];
}
