import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdExpandableText } from '@vadem/ui/expandable-text';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  imports: [VdButton, VdExpandableText, VdField, VdInput],
  providers: [vdLocaleProvider(vdLocaleUk)],
  host: { class: 'demo-expandable' },
  encapsulation: ViewEncapsulation.None,
  styles: `
    .demo-expandable .demo-panel {
      padding: min(var(--vd-space-6), 5%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>Expandable text</h1>
      <p>Короткий опис залишається компактним. Довгий можна розгорнути й прочитати повністю.</p>
    </header>
    <section class="demo-section" aria-labelledby="project-description">
      <div class="demo-section__head">
        <h2 id="project-description">Опис проєкту</h2>
        <p>
          Перші 180 графем дають уявлення про зміст. Кнопка відкриває решту без заміни оригіналу.
        </p>
      </div>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="main-description"
          [text]="description"
          [previewLength]="180"
        />
      </div>
    </section>
    <section class="demo-section" aria-labelledby="source-example">
      <div class="demo-section__head">
        <h2 id="source-example">Зміна тексту</h2>
        <p>
          Спробуйте короткий текст, порожнє значення або кілька абзаців. Вони залишаться звичайним
          текстом.
        </p>
      </div>
      <vd-field label="Текст опису">
        <textarea
          vdInput
          [value]="source()"
          (input)="source.set($any($event.target).value)"
          rows="4"
        ></textarea>
      </vd-field>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="changing-description"
          [text]="source()"
          [previewLength]="80"
          [(expanded)]="expanded"
          expandLabel="Показати більше зміненого опису"
          collapseLabel="Згорнути змінений опис"
        />
      </div>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="expanded.set(!expanded())">
          Змінити стан ззовні</button
        ><span class="demo-token">expanded: {{ expanded() }}</span>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="short-text">
      <div class="demo-section__head">
        <h2 id="short-text">Короткий та порожній текст</h2>
        <p>Коли приховувати нічого, зайва кнопка не з’являється.</p>
      </div>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="short-description"
          text="Дані збережено. Перевірено літери ї, є, і, ґ."
        /><vd-expandable-text data-testid="empty-description" text="" />
      </div>
    </section>
    <section class="demo-section" aria-labelledby="unicode-example">
      <div class="demo-section__head">
        <h2 id="unicode-example">Цілі символи й довгі рядки</h2>
        <p>Emoji та комбіновані знаки не розриваються на межі скорочення.</p>
      </div>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="unicode-description"
          [text]="unicode"
          [previewLength]="5"
          expandLabel="Показати весь Unicode-приклад"
          collapseLabel="Згорнути Unicode-приклад"
        />
      </div>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="unbroken-description"
          [text]="unbroken"
          [previewLength]="90"
          expandLabel="Показати довгий ідентифікатор"
          collapseLabel="Згорнути довгий ідентифікатор"
        />
      </div>
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="rtl-description">
      <div class="demo-section__head">
        <h2 id="rtl-description">وصف المشروع</h2>
        <p>يمكن قراءة الوصف الكامل ثم طيّه مع بقاء التركيز على الزر.</p>
      </div>
      <div class="demo-panel">
        <vd-expandable-text
          data-testid="rtl-description"
          [text]="arabic"
          [previewLength]="90"
          expandLabel="عرض المزيد"
          collapseLabel="عرض أقل"
        />
      </div>
    </section>
  `,
})
export default class ExpandableTextPage {
  protected readonly description =
    'Бібліотека Vadem допомагає будувати доступні інтерфейси для щоденної роботи команди. Ми перевіряємо українські літери ї, є, і, ґ, клавіатурну навігацію та читабельність у світлій і темній темах.\n\nКожен компонент має зрозумілий контракт і приклади з реальним вмістом. Повний опис можна виділити й скопіювати після розгортання; початкові пробіли, абзаци та пунктуація зберігаються.';
  protected readonly source = signal(this.description);
  protected readonly expanded = signal(false);
  protected readonly unicode =
    'Ї 👨‍👩‍👧‍👦 е́ 🇺🇦 ✨ — ці символи залишаються цілими. <strong>Це текст, а не HTML.</strong>';
  protected readonly unbroken =
    'Документ_довгострокового_розвитку_виробничої_дільниці_їєіґ_2026_'.repeat(8);
  protected readonly arabic =
    'تساعد مكتبة المكونات الفريق على بناء واجهات واضحة وسهلة الاستخدام. يمكن الوصول إلى الأزرار باستخدام لوحة المفاتيح وقراءة الوصف في الوضعين الفاتح والداكن. تبقى جميع الكلمات وعلامات الترقيم محفوظة عند عرض النص الكامل ثم طيّه.';
}
