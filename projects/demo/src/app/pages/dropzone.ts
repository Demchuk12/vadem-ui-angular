import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { VD_ALERT } from '@vadem/ui/alert';
import { VdButton } from '@vadem/ui/button';
import { VdDropzone, VdRejectedFile } from '@vadem/ui/dropzone';
import { VdIcon } from '@vadem/ui/icon';
import { VdProgress } from '@vadem/ui/progress';

interface Upload {
  id: number;
  name: string;
  size: number;
  progress: number;
}

const REASONS: Record<VdRejectedFile['reason'], string> = {
  type: 'непідтримуваний формат',
  size: 'більше 2 МБ',
  count: 'можна лише один файл',
};

@Component({
  selector: 'demo-dropzone',
  imports: [VD_ALERT, VdButton, VdDropzone, VdIcon, VdProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / File upload</p>
      <h1>File upload</h1>
      <p>
        A native file input inside its label: click or press Enter to open the picker, or drop
        files. Dropped files are checked like picked ones and written back to the input.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="multi">
      <div class="demo-section__head">
        <p class="vd-eyebrow">label[vdDropzone] · multiple · accept · maxSize</p>
        <h2 id="multi">Multiple files</h2>
        <p>Upload progress is simulated with <code>vdProgress</code>.</p>
      </div>
      <div class="demo-stack">
        <label
          vdDropzone
          maxSize="2097152"
          (filesSelected)="add($event)"
          (filesRejected)="reject($event)"
        >
          <input type="file" multiple accept="image/*,.pdf,.csv" />
          <vd-icon name="upload" />
          <span><strong>Перетягніть файли</strong> або натисніть, щоб обрати</span>
          <span>PNG, JPG, PDF або CSV до 2 МБ</span>
        </label>

        @if (rejected().length) {
          <div vdAlert variant="warning" role="status">
            <p vdAlertTitle>Не всі файли додано</p>
            <ul class="demo-list">
              @for (r of rejected(); track $index) {
                <li>{{ r.file.name }}: {{ reasons[r.reason] }}</li>
              }
            </ul>
            <button
              vdButton
              variant="ghost"
              size="sm"
              iconOnly
              slot="end"
              aria-label="Закрити повідомлення"
              (click)="rejected.set([])"
            >
              <vd-icon name="x" />
            </button>
          </div>
        }

        @if (uploads().length) {
          <ul class="demo-files" role="list" aria-label="Завантаження">
            @for (u of uploads(); track u.id) {
              <li class="demo-file">
                <span class="demo-file__icon"><vd-icon name="file" /></span>
                <div class="demo-file__body">
                  <div class="demo-file__head">
                    <span class="demo-file__name">{{ u.name }}</span>
                    <span class="demo-file__meta"
                      >{{ size(u.size) }} ·
                      {{ u.progress === 100 ? 'готово' : u.progress + '%' }}</span
                    >
                  </div>
                  <progress
                    vdProgress
                    size="sm"
                    max="100"
                    [value]="u.progress"
                    [variant]="u.progress === 100 ? 'success' : 'accent'"
                    [attr.aria-label]="'Завантаження ' + u.name"
                  ></progress>
                </div>
                <button
                  vdButton
                  variant="ghost"
                  size="sm"
                  iconOnly
                  [attr.aria-label]="'Видалити ' + u.name"
                  (click)="remove(u.id)"
                >
                  <vd-icon name="trash" />
                </button>
              </li>
            }
          </ul>
        }
        <p class="vd-visually-hidden" role="status">{{ status() }}</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="single">
      <div class="demo-section__head">
        <p class="vd-eyebrow">single file · compact · disabled</p>
        <h2 id="single">Single file</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <label vdDropzone class="demo-compact" (filesSelected)="avatar.set($event[0].name)">
          <input type="file" accept="image/png,image/jpeg" />
          <span
            ><strong>{{ avatar() || 'Оберіть фото профілю' }}</strong></span
          >
          <span>Квадратне, PNG або JPG</span>
        </label>
        <label vdDropzone class="demo-compact">
          <input type="file" disabled />
          <span><strong>Завантаження вимкнено</strong></span>
          <span>Сховище заповнене на 100%</span>
        </label>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">RTL</p>
        <h2 id="content">RTL</h2>
      </div>
      <label vdDropzone dir="rtl" lang="ar">
        <input type="file" multiple />
        <vd-icon name="upload" />
        <span><strong>اسحب الملفات هنا</strong> أو انقر للاختيار</span>
      </label>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
      max-inline-size: 40rem;
    }
    .demo-list {
      margin: 0;
      padding-inline-start: var(--vd-space-4);
    }
    .demo-files {
      display: grid;
      gap: var(--vd-space-2);
      margin: 0;
      padding: 0;
    }
    .demo-file {
      display: flex;
      align-items: center;
      gap: var(--vd-space-3);
      padding: var(--vd-space-3);
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-lg);
      background: var(--vd-color-surface);
    }
    .demo-file__icon {
      display: grid;
      place-items: center;
      inline-size: var(--vd-space-10);
      block-size: var(--vd-space-10);
      border-radius: var(--vd-radius-md);
      background: var(--vd-color-fill);
      color: var(--vd-color-text-muted);
    }
    .demo-file__body {
      display: grid;
      flex: 1;
      gap: var(--vd-space-2);
      min-inline-size: 0;
    }
    .demo-file__head {
      display: flex;
      justify-content: space-between;
      gap: var(--vd-space-3);
      font-size: var(--vd-text-sm);
    }
    .demo-file__name {
      overflow: hidden;
      font-weight: var(--vd-weight-medium);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .demo-file__meta {
      color: var(--vd-color-text-muted);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .demo-compact {
      --vd-dropzone-padding: var(--vd-space-5);
    }
  `,
})
export default class DropzonePage {
  protected readonly reasons = REASONS;
  protected readonly uploads = signal<Upload[]>([]);
  protected readonly rejected = signal<VdRejectedFile[]>([]);
  protected readonly avatar = signal('');
  protected readonly status = signal('');
  private nextId = 0;
  private readonly timers = new Set<ReturnType<typeof setInterval>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearInterval));
  }

  protected add(files: File[]): void {
    const added = files.map((f) => ({
      id: this.nextId++,
      name: f.name,
      size: f.size,
      progress: 0,
    }));
    this.uploads.update((list) => [...list, ...added]);
    this.status.set(`Додано файлів: ${files.length}`);
    for (const upload of added) this.simulate(upload.id);
  }

  protected reject(files: VdRejectedFile[]): void {
    this.rejected.set(files);
  }

  protected remove(id: number): void {
    const name = this.uploads().find((u) => u.id === id)?.name;
    this.uploads.update((list) => list.filter((u) => u.id !== id));
    this.status.set(`Видалено: ${name}`);
  }

  protected size(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
      : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;
  }

  private simulate(id: number): void {
    const timer = setInterval(() => {
      let done = false;
      this.uploads.update((list) =>
        list.map((u) => {
          if (u.id !== id) return u;
          const progress = Math.min(100, u.progress + 9 + Math.round(Math.random() * 12));
          done = progress === 100;
          return { ...u, progress };
        }),
      );
      if (done || !this.uploads().some((u) => u.id === id)) {
        clearInterval(timer);
        this.timers.delete(timer);
      }
    }, 200);
    this.timers.add(timer);
  }
}
