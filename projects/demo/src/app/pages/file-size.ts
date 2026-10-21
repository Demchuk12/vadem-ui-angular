import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdFileSizePipe } from '@vadem/ui/file-size';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdDescriptionList } from '@vadem/ui/description-list';
import { VdButton } from '@vadem/ui/button';
import { VdUploadList } from '@vadem/ui/upload-list';

@Component({
  imports: [VdFileSizePipe, VdButton, VdUploadList, VdDescriptionList],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>File size</h1>
      <p>Розміри вкладень у десяткових або двійкових одиницях.</p>
    </header>
    <section class="demo-section" aria-labelledby="size-compare">
      <div class="demo-section__head">
        <h2 id="size-compare">Одна кількість байтів — дві системи</h2>
        <p>1 kB = 1000 байтів, 1 KiB = 1024 байти.</p>
      </div>
      <dl vdDescriptionList>
        <div>
          <dt>Десяткова система</dt>
          <dd>
            <bdi data-testid="decimal">{{ bytes() | vdFileSize }}</bdi>
          </dd>
        </div>
        <div>
          <dt>Двійкова система</dt>
          <dd>
            <bdi data-testid="binary">{{ bytes() | vdFileSize: 'binary' }}</bdi>
          </dd>
        </div>
        <div>
          <dt>Точна кількість байтів</dt>
          <dd>{{ bytes() }}</dd>
        </div>
      </dl>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="bytes.set(1536000)">
          Приклад: 1 536 000 байтів
        </button>
        <button vdButton variant="secondary" (click)="bytes.set(0)">Порожній файл</button>
        <button vdButton variant="secondary" (click)="bytes.set(999950)">Біля межі одиниці</button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="size-states">
      <div class="demo-section__head"><h2 id="size-states">Нуль і невідомий розмір</h2></div>
      <dl vdDescriptionList data-testid="size-states">
        <div>
          <dt>Нуль байтів</dt>
          <dd>{{ 0 | vdFileSize }}</dd>
        </div>
        <div>
          <dt>Немає значення</dt>
          <dd>{{ null | vdFileSize }}</dd>
        </div>
        <div>
          <dt>Некоректне від’ємне значення</dt>
          <dd>{{ -1 | vdFileSize }}</dd>
        </div>
        <div>
          <dt>Великий архів</dt>
          <dd>
            <bdi>{{ 9007199254740991 | vdFileSize }}</bdi>
          </dd>
        </div>
        <div>
          <dt>English</dt>
          <dd lang="en">
            <bdi>{{ 1536000 | vdFileSize: 'decimal' : 2 : 'en' }}</bdi>
          </dd>
        </div>
      </dl>
    </section>
    <section class="demo-section" aria-labelledby="size-files">
      <div class="demo-section__head">
        <h2 id="size-files">Вкладення проєкту</h2>
        <p>Розмір береться з числових даних файлу.</p>
      </div>
      <ul vdUploadList label="Вкладення проєкту" [files]="files" disabled></ul>
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="size-rtl">
      <div class="demo-section__head"><h2 id="size-rtl">حجم المرفق</h2></div>
      <p>
        تقرير-الإنتاج.pdf —
        <bdi data-testid="rtl-size">{{ 1536000 | vdFileSize: 'binary' : 1 : 'ar' }}</bdi>
      </p>
      <p>الحجم غير متاح: {{ null | vdFileSize: 'decimal' : 1 : 'ar' : 'الحجم غير معروف' }}</p>
    </section>
  `,
})
export default class FileSizePage {
  protected readonly bytes = signal(1536000);
  protected readonly files = [
    {
      id: 'a',
      name: 'Звіт_виробничої_дільниці_їєіґ_2026.pdf',
      size: 1536000,
      status: 'success' as const,
    },
    { id: 'b', name: 'Порожній_файл.txt', size: 0, status: 'queued' as const },
    { id: 'c', name: 'Архів_без_даних.zip', size: null, status: 'queued' as const },
  ];
}
