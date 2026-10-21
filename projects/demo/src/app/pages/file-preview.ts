import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdFilePreview } from '@vadem/ui/file-preview';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  imports: [VdButton, VdFilePreview],
  providers: [vdLocaleProvider(vdLocaleUk)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <h1>File preview</h1>
      <p>Перегляньте вкладення перед завантаженням. Файл залишається у вашому браузері.</p>
    </header>
    <section class="demo-section" aria-labelledby="preview-files">
      <div class="demo-section__head">
        <h2 id="preview-files">Вкладення проєкту</h2>
        <p>Зображення та PDF відкриваються в діалозі. Для інших форматів доступне завантаження.</p>
      </div>
      <div class="demo-panel">
        <p>План виробничої дільниці та звіт за зміну</p>
        <div class="demo-actions">
          <button vdButton (click)="show('image')">Переглянути зображення</button>
          <button vdButton variant="secondary" (click)="show('pdf')">Переглянути PDF</button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="preview-states">
      <div class="demo-section__head">
        <h2 id="preview-states">Різні файли та стани</h2>
        <p>
          Невідомий формат або пошкоджене зображення не приховують можливість завантажити оригінал.
        </p>
      </div>
      <div class="demo-actions">
        <button vdButton variant="secondary" (click)="show('error')">Пошкоджене зображення</button>
        <button vdButton variant="secondary" (click)="show('unsupported')">Текстовий файл</button>
        <button vdButton variant="secondary" (click)="show('empty')">Без файлу</button>
        <button vdButton variant="secondary" (click)="show('long')">Довга назва</button>
      </div>
      <p>Також можна відкрити власне зображення або PDF. Вибір файлу не надсилає його на сервер.</p>
      <label for="preview-local">Вибрати файл для перегляду</label>
      <input id="preview-local" type="file" (change)="choose($event)" />
    </section>
    <section class="demo-section" dir="rtl" lang="ar" aria-labelledby="preview-rtl">
      <div class="demo-section__head">
        <h2 id="preview-rtl">مرفقات المشروع</h2>
        <p>معاينة الصورة وتنزيل الملف الأصلي.</p>
      </div>
      <button vdButton variant="secondary" (click)="show('rtl')">معاينة الصورة</button>
    </section>
    <vd-file-preview
      [dir]="rtl() ? 'rtl' : 'ltr'"
      [file]="file()"
      [name]="name()"
      [alt]="rtl() ? 'مخطط منطقة الإنتاج' : 'План виробничої дільниці: три позначені зони'"
      [(open)]="open"
      [titleText]="rtl() ? 'معاينة الملف' : undefined"
      [closeLabel]="rtl() ? 'إغلاق' : undefined"
      [downloadLabel]="rtl() ? 'تنزيل' : undefined"
    />
  `,
})
export default class FilePreviewPage {
  private readonly document = inject(DOCUMENT);
  protected readonly file = signal<Blob | null>(null);
  protected readonly name = signal('');
  protected readonly open = signal(false);
  protected readonly rtl = signal(false);
  protected show(kind: string): void {
    this.rtl.set(kind === 'rtl');
    this.name.set(
      kind === 'rtl'
        ? 'مخطط-منطقة-الإنتاج.png'
        : kind === 'long'
          ? 'План_довгострокового_розвитку_виробничої_дільниці_та_перевірки_доступності_компонентів_їєіґ_2026.png'
          : kind === 'pdf'
            ? 'Звіт-за-зміну.pdf'
            : kind === 'unsupported'
              ? 'Нотатки.txt'
              : kind === 'empty'
                ? 'Новий файл'
                : 'План-дільниці.png',
    );
    if (kind === 'empty') this.file.set(null);
    else if (kind === 'pdf') this.file.set(new Blob([samplePdf()], { type: 'application/pdf' }));
    else if (kind === 'unsupported')
      this.file.set(new Blob(['Нотатки проєкту: ї є і ґ'], { type: 'text/plain' }));
    else if (kind === 'error') this.file.set(new Blob(['broken'], { type: 'image/png' }));
    else {
      const canvas = this.document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#e6edf1';
      ctx.fillRect(0, 0, 960, 540);
      ctx.strokeStyle = '#40596a';
      ctx.lineWidth = 4;
      ctx.fillStyle = '#233e50';
      ctx.font = '28px sans-serif';
      ctx.fillText('План дільниці · 2026', 48, 64);
      [
        [48, 112, 390, 160],
        [478, 112, 434, 160],
        [48, 312, 864, 176],
      ].forEach(([x, y, w, h], i) => {
        ctx.strokeRect(x, y, w, h);
        ctx.fillText(String(i + 1), x + 24, y + 48);
      });
      canvas.toBlob((blob) => {
        if (blob) {
          this.file.set(blob);
          this.open.set(true);
        }
      }, 'image/png');
      return;
    }
    this.open.set(true);
  }
  protected choose(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.rtl.set(false);
    this.name.set(file.name);
    this.file.set(file);
    this.open.set(true);
    input.value = '';
  }
}

/** Minimal valid local fixture; no PDF runtime dependency or external asset. */
function samplePdf(): string {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const stream =
    'BT /F1 24 Tf 48 760 Td (Vadem - Shift report) Tj 0 -48 Td /F1 14 Tf (Local PDF preview fixture. No network request.) Tj ET';
  objects.push('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += index + 1 + ' 0 obj\n' + object + '\nendobj\n';
  });
  const xref = pdf.length;
  pdf +=
    'xref\n0 6\n0000000000 65535 f \n' +
    offsets
      .slice(1)
      .map((offset) => String(offset).padStart(10, '0') + ' 00000 n \n')
      .join('');
  return pdf + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
}
