import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { VdButton } from '@vadem/ui/button';
import { VdFileSizePipe } from '@vadem/ui/file-size';
import { VD_DIALOG } from '@vadem/ui/dialog';
import { vdTexts } from '@vadem/ui/locale';

type PreviewState = 'empty' | 'preparing' | 'loading' | 'ready' | 'error' | 'unsupported' | 'pdf';
interface PreviewSource {
  file: Blob;
  url: string;
  pdf: SafeResourceUrl | null;
}

/** Local file presentation. The caller owns file acquisition and validation. */
@Component({
  selector: 'vd-file-preview',
  imports: [VdButton, VD_DIALOG, VdFileSizePipe],
  template: `
    <dialog
      vdDialog
      size="lg"
      class="vd-file-preview__dialog"
      [open]="open()"
      (openChange)="open.set($event)"
    >
      <header vdDialogHeader>
        <span class="vd-file-preview__heading">{{ title() }}</span>
        <button
          vdButton
          variant="ghost"
          size="sm"
          type="button"
          autofocus
          (click)="open.set(false)"
        >
          {{ t().closeLabel }}
        </button>
      </header>
      <div
        vdDialogBody
        class="vd-file-preview__body"
        tabindex="0"
        role="region"
        [attr.aria-label]="filename()"
        [attr.data-state]="state()"
      >
        <h2 vdDialogTitle class="vd-file-preview__filename">
          <bdi>{{ filename() }}</bdi>
        </h2>
        @if (file(); as file) {
          <p class="vd-file-preview__size">
            <bdi>{{ file.size | vdFileSize }}</bdi>
          </p>
        }
        @if (open()) {
          @for (source of sources(); track source.url) {
            @if (kind() === 'image') {
              <p class="vd-file-preview__notice" role="status">
                {{
                  state() === 'loading' ? t().loadingText : state() === 'error' ? t().errorText : ''
                }}
              </p>
              @if (state() !== 'error') {
                <img
                  class="vd-file-preview__image"
                  [src]="source.url"
                  [alt]="alt() ?? filename()"
                  [hidden]="state() !== 'ready'"
                  (load)="imageState(source, 'ready')"
                  (error)="imageState(source, 'error')"
                />
              }
            } @else if (kind() === 'pdf') {
              <p class="vd-file-preview__notice">{{ t().pdfText }}</p>
              <object
                class="vd-file-preview__pdf"
                [data]="source.pdf"
                type="application/pdf"
                [attr.aria-label]="filename()"
              >
                <p>{{ t().pdfText }}</p>
              </object>
            } @else {
              <p class="vd-file-preview__notice">{{ t().unsupportedText }}</p>
            }
          } @empty {
            <p class="vd-file-preview__notice" role="status">
              {{ file() ? t().loadingText : t().emptyText }}
            </p>
          }
        }
      </div>
      @if (source(); as source) {
        <footer vdDialogFooter>
          <a vdButton variant="secondary" [href]="source.url" [download]="filename()">{{
            t().downloadLabel
          }}</a>
        </footer>
      }
    </dialog>
  `,
  host: { class: 'vd-file-preview' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdFilePreview {
  readonly open = model(false);
  readonly file = input<Blob | null>(null);
  readonly name = input<string>();
  readonly alt = input<string>();
  readonly closeLabel = input<string>();
  readonly downloadLabel = input<string>();
  readonly loadingText = input<string>();
  readonly errorText = input<string>();
  readonly emptyText = input<string>();
  readonly unsupportedText = input<string>();
  readonly pdfText = input<string>();
  readonly titleText = input<string>();
  protected readonly t = vdTexts('filePreview', {
    title: this.titleText,
    closeLabel: this.closeLabel,
    downloadLabel: this.downloadLabel,
    loadingText: this.loadingText,
    errorText: this.errorText,
    emptyText: this.emptyText,
    unsupportedText: this.unsupportedText,
    pdfText: this.pdfText,
  });
  protected readonly title = computed(() => this.t().title);
  protected readonly filename = computed(
    () =>
      this.name()?.trim() ||
      (this.file() as (Blob & { name?: string }) | null)?.name?.trim() ||
      this.title(),
  );
  protected readonly kind = computed(() => {
    const type = this.file()?.type.toLowerCase();
    return type === 'application/pdf'
      ? 'pdf'
      : ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'].includes(type ?? '')
        ? 'image'
        : 'unsupported';
  });
  private readonly allocated = signal<PreviewSource | null>(null);
  protected readonly source = computed(() => {
    const source = this.allocated();
    return this.open() && source?.file === this.file() ? source : null;
  });
  protected readonly sources = computed(() => (this.source() ? [this.source()!] : []));
  private readonly imageResult = signal<PreviewState>('loading');
  protected readonly state = computed<PreviewState>(() =>
    !this.file()
      ? 'empty'
      : !this.source()
        ? 'preparing'
        : this.kind() === 'image'
          ? this.imageResult()
          : this.kind() === 'pdf'
            ? 'pdf'
            : 'unsupported',
  );

  constructor() {
    const document = inject(DOCUMENT);
    const sanitizer = inject(DomSanitizer);
    let release: (() => void) | undefined;
    inject(DestroyRef).onDestroy(() => release?.());
    afterRenderEffect(() => {
      const file = this.file();
      const open = this.open();
      release?.();
      release = undefined;
      this.allocated.set(null);
      this.imageResult.set('loading');
      const urlApi = document.defaultView?.URL;
      if (!open || !file || !urlApi?.createObjectURL) return;
      // Explicit PDF MIME prevents resource embedding as HTML, including mislabeled input.
      const blob =
        file.type.toLowerCase() === 'application/pdf'
          ? file.slice(0, file.size, 'application/pdf')
          : file;
      const url = urlApi.createObjectURL(blob);
      release = () => urlApi.revokeObjectURL(url);
      this.allocated.set({
        file,
        url,
        pdf:
          file.type.toLowerCase() === 'application/pdf'
            ? sanitizer.bypassSecurityTrustResourceUrl(url)
            : null,
      });
    });
  }
  protected imageState(source: PreviewSource, state: 'ready' | 'error'): void {
    if (this.source() === source) this.imageResult.set(state);
  }
}
