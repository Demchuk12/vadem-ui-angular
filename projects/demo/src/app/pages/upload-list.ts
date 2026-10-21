import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdButton } from '@vadem/ui/button';
import { VdDropzone, type VdRejectedFile } from '@vadem/ui/dropzone';
import { VdIcon } from '@vadem/ui/icon';
import { VdUploadList, type VdUploadFile, type VdUploadListLabels } from '@vadem/ui/upload-list';

const UK: VdUploadListLabels = {
  status: {
    queued: 'У черзі',
    uploading: 'Завантажується',
    success: 'Завантажено',
    error: 'Не вдалося завантажити',
    canceled: 'Скасовано',
  },
  cancel: 'Скасувати',
  retry: 'Повторити',
  remove: 'Видалити',
  empty: 'Додайте перший файл — він з’явиться тут.',
};
const AR: VdUploadListLabels = {
  status: {
    queued: 'في الانتظار',
    uploading: 'جارٍ الرفع',
    success: 'تم الرفع',
    error: 'تعذر الرفع',
    canceled: 'تم الإلغاء',
  },
  cancel: 'إلغاء',
  retry: 'إعادة المحاولة',
  remove: 'حذف',
  empty: 'أضف ملفًا للبدء.',
};
const EXAMPLE: readonly VdUploadFile[] = [
  { id: 'brief', name: 'Технічне_завдання.pdf', size: 1200000, status: 'success' },
  {
    id: 'budget',
    name: 'Кошторис_жовтень_2026.csv',
    size: 42000,
    status: 'error',
    message: 'З’єднання перервано. Спробуйте ще раз.',
  },
  {
    id: 'photo',
    name: 'Фото_виробничої_лінії_після_модернізації.png',
    size: 1800000,
    status: 'uploading',
    progress: 38,
  },
  {
    id: 'unknown',
    name: 'Протокол_випробувань.pdf',
    size: 280000,
    status: 'uploading',
    progress: null,
  },
  { id: 'queue', name: 'Контрагенти.csv', size: 18000, status: 'queued' },
  {
    id: 'canceled',
    name: 'Архів_погоджених_документів.pdf',
    size: 940000,
    status: 'canceled',
  },
];
type Uploads = WritableSignal<readonly VdUploadFile[]>;

@Component({
  selector: 'demo-upload-list',
  providers: [vdLocaleProvider(vdLocaleUk)],
  imports: [VdButton, VdDropzone, VdIcon, VdUploadList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / File upload list</p>
      <h1>File upload list</h1>
      <p>Keep filenames, transfer progress and recovery actions together.</p>
    </header>
    <section class="demo-section" aria-labelledby="attachments">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Dropzone + Upload list</p>
        <h2 id="attachments">Вкладення проєкту</h2>
        <p>Скасуйте, повторіть або додайте файл. Це демонстрація: файли нікуди не надсилаються.</p>
      </div>
      <div class="demo-upload-workspace">
        <label
          vdDropzone
          [maxSize]="2097152"
          (filesSelected)="add($event)"
          (filesRejected)="reject($event)"
        >
          <input type="file" multiple accept=".pdf,.csv,.png,.jpg" data-testid="upload-input" />
          <vd-icon name="upload" />
          <span><strong>Додати файли</strong> або перетягнути сюди</span>
          <span>PDF, CSV, PNG або JPG до 2 МБ</span>
        </label>
        <p class="demo-upload-feedback" role="status" data-testid="upload-event">
          {{ feedback() }}
        </p>
        <ul
          vdUploadList
          label="Файли проєкту"
          [files]="files()"
          [labels]="uk"
          (fileCancel)="cancel($event)"
          (fileRetry)="retry($event)"
          (fileRemove)="remove($event)"
        ></ul>
        <div>
          <button vdButton variant="secondary" size="sm" (click)="reset()">
            Відновити приклад
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="locked">
      <div class="demo-section__head">
        <p class="vd-eyebrow">disabled</p>
        <h2 id="locked">Лише перегляд</h2>
        <p>Вкладення закритого проєкту доступні для перегляду; змінювати їх не можна.</p>
      </div>
      <ul
        vdUploadList
        label="Вкладення закритого проєкту"
        [files]="lockedFiles"
        [labels]="uk"
        disabled
      ></ul>
    </section>
    <section class="demo-section" aria-labelledby="empty">
      <div class="demo-section__head">
        <p class="vd-eyebrow">empty</p>
        <h2 id="empty">Перший файл ще попереду</h2>
      </div>
      <ul vdUploadList label="Новий проєкт" [labels]="uk"></ul>
    </section>
    <section class="demo-section" aria-labelledby="rtl">
      <div class="demo-section__head">
        <p class="vd-eyebrow">RTL · mixed filenames</p>
        <h2 id="rtl">Labels follow your language</h2>
      </div>
      <div dir="rtl" lang="ar">
        <ul
          vdUploadList
          label="مرفقات المشروع"
          [files]="rtlFiles()"
          [labels]="ar"
          (fileCancel)="cancel($event, rtlFiles)"
          (fileRetry)="retry($event, rtlFiles)"
          (fileRemove)="remove($event, rtlFiles)"
        ></ul>
      </div>
    </section>
  `,
  styles: `
    .demo-upload-workspace {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--vd-space-3);
    }
    .demo-upload-feedback {
      min-block-size: 1lh;
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
      overflow-wrap: anywhere;
    }
  `,
})
export default class UploadListPage {
  protected readonly uk = UK;
  protected readonly ar = AR;
  protected readonly files = signal<readonly VdUploadFile[]>(EXAMPLE);
  protected readonly lockedFiles = EXAMPLE.slice(0, 2);
  protected readonly rtlFiles = signal<readonly VdUploadFile[]>([
    { id: 'ar-report', name: 'تقرير_المشروع_النهائي.pdf', sizeText: '1.2 MB', status: 'success' },
    {
      id: 'ar-data',
      name: 'بيانات_المشروع_2026.csv',
      sizeText: '42 KB',
      status: 'error',
      message: 'انقطع الاتصال. حاول مرة أخرى.',
    },
  ]);
  protected readonly feedback = signal('');
  private nextId = 0;
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearInterval));
  }
  protected add(files: File[]): void {
    const added: VdUploadFile[] = files.map((file) => ({
      id: 'picked-' + this.nextId++,
      name: file.name,
      size: file.size,
      status: 'queued',
    }));
    this.files.update((current) => [...current, ...added]);
    this.feedback.set(`Додано файлів: ${added.length}`);
    for (const file of added) this.simulate(file.id, this.files);
  }
  protected reject(files: VdRejectedFile[]): void {
    this.feedback.set(
      `Не додано: ${files.map((item) => item.file.name).join(', ')}. Перевірте формат і розмір файлів.`,
    );
  }
  protected cancel(id: string, target = this.files): void {
    this.stop(id);
    target.update((files) =>
      files.map((file) =>
        file.id === id
          ? { ...file, status: 'canceled', progress: undefined, message: undefined }
          : file,
      ),
    );
  }
  protected retry(id: string, target = this.files): void {
    this.stop(id);
    target.update((files) =>
      files.map((file) =>
        file.id === id ? { ...file, status: 'uploading', progress: 0, message: undefined } : file,
      ),
    );
    this.simulate(id, target);
  }
  protected remove(id: string, target = this.files): void {
    this.stop(id);
    const name = target().find((file) => file.id === id)?.name;
    target.update((files) => files.filter((file) => file.id !== id));
    this.feedback.set(`Видалено: ${name}`);
  }
  protected reset(): void {
    this.files().forEach((file) => this.stop(file.id));
    this.files.set(EXAMPLE);
    this.feedback.set('Приклад відновлено');
  }
  private stop(id: string): void {
    clearInterval(this.timers.get(id));
    this.timers.delete(id);
  }
  private simulate(id: string, target: Uploads): void {
    const timer = setInterval(() => {
      const file = target().find((item) => item.id === id);
      if (!file || !['queued', 'uploading'].includes(file.status)) {
        this.stop(id);
        return;
      }
      const progress = Math.min(100, (file.progress ?? 0) + 20);
      target.update((files) =>
        files.map((item) =>
          item.id === id
            ? { ...item, progress, status: progress === 100 ? 'success' : 'uploading' }
            : item,
        ),
      );
      if (progress === 100) this.stop(id);
    }, 300);
    this.timers.set(id, timer);
  }
}
