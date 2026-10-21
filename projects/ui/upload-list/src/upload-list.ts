import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdFileSizePipe } from '@vadem/ui/file-size';
import { VdIcon } from '@vadem/ui/icon';
import { VdProgress } from '@vadem/ui/progress';
import { vdTexts } from '@vadem/ui/locale';

export type VdUploadStatus = 'queued' | 'uploading' | 'success' | 'error' | 'canceled';
export interface VdUploadFile {
  readonly id: string;
  readonly name: string;
  readonly status: VdUploadStatus;
  readonly sizeText?: string;
  readonly size?: number | null;
  readonly progress?: number | null;
  readonly message?: string;
}
export interface VdUploadListLabels {
  readonly status: Readonly<Record<VdUploadStatus, string>>;
  readonly cancel: string;
  readonly retry: string;
  readonly remove: string;
  readonly empty: string;
}
const DEFAULT_LABELS: VdUploadListLabels = {
  status: {
    queued: 'Queued',
    uploading: 'Uploading',
    success: 'Uploaded',
    error: 'Upload failed',
    canceled: 'Canceled',
  },
  cancel: 'Cancel',
  retry: 'Retry',
  remove: 'Remove',
  empty: 'Choose files to start uploading.',
};

/** Controlled upload presentation. Consumers own requests and state transitions. */
@Component({
  // Preserve native list semantics while rendering controlled file rows.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ul[vdUploadList]',
  imports: [VdButton, VdIcon, VdProgress, VdFileSizePipe],
  template: `
    @for (file of files(); track file.id; let index = $index) {
      @let progress = progressValue(file);
      <li class="vd-upload-list__item" [attr.data-state]="file.status">
        <span class="vd-upload-list__icon" aria-hidden="true">
          <vd-icon
            [name]="
              file.status === 'success'
                ? 'check-circle'
                : file.status === 'error'
                  ? 'alert-circle'
                  : 'file'
            "
          />
        </span>
        <div class="vd-upload-list__body">
          <bdi class="vd-upload-list__name">{{ file.name }}</bdi>
          <div class="vd-upload-list__meta">
            @if (file.sizeText) {
              <bdi>{{ file.sizeText }}</bdi>
            } @else if (file.size !== undefined) {
              <bdi>{{ file.size | vdFileSize }}</bdi>
            }
            <span class="vd-upload-list__status" role="status" aria-atomic="true">
              <span class="vd-visually-hidden">{{ file.name }}: </span
              >{{ labels().status[file.status] }}
              @if (file.message) {
                <span class="vd-upload-list__message">{{ file.message }}</span>
              }
            </span>
            @if (file.status === 'uploading' && progress !== null) {
              <span class="vd-upload-list__percent">{{ progress }}%</span>
            }
          </div>
          @if (file.status === 'uploading') {
            <progress
              vdProgress
              size="sm"
              max="100"
              [attr.value]="progress"
              [attr.aria-label]="labels().status.uploading + ' ' + file.name"
            ></progress>
          }
        </div>
        <div class="vd-upload-list__actions">
          <button
            vdButton
            variant="ghost"
            size="sm"
            [disabled]="disabled()"
            [attr.aria-label]="actionLabel(file) + ' ' + file.name"
            (focus)="rememberFocus($event, index)"
            (click)="act(file)"
          >
            <vd-icon
              slot="start"
              [name]="file.status === 'success' ? 'trash' : canRetry(file) ? 'upload' : 'x'"
            />
            {{ actionLabel(file) }}
          </button>
          @if (canRetry(file)) {
            <button
              vdButton
              variant="ghost"
              size="sm"
              iconOnly
              [disabled]="disabled()"
              [attr.aria-label]="labels().remove + ' ' + file.name"
              (focus)="rememberFocus($event, index)"
              (click)="remove(file)"
            >
              <vd-icon name="trash" />
            </button>
          }
        </div>
      </li>
    } @empty {
      <li class="vd-upload-list__empty">{{ labels().empty }}</li>
    }
  `,
  host: {
    class: 'vd-upload-list',
    role: 'list',
    tabindex: '-1',
    '[attr.aria-label]': 't().label',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdUploadList {
  readonly files = input<readonly VdUploadFile[]>([]);
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('uploadList', { label: this.label });
  readonly labels = input<VdUploadListLabels>(DEFAULT_LABELS);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fileCancel = output<string>();
  readonly fileRetry = output<string>();
  readonly fileRemove = output<string>();
  private readonly el: HTMLUListElement = inject(ElementRef).nativeElement;
  private focusedAction: HTMLButtonElement | null = null;
  private focusedIndex = 0;

  constructor() {
    afterRenderEffect(() => {
      this.files();
      const previous = this.focusedAction;
      if (!previous) return;
      const rows = this.el.querySelectorAll<HTMLElement>('.vd-upload-list__item');
      if (previous.isConnected) {
        // Other rows may disappear while this action stays focused.
        this.focusedIndex = Array.from(rows).findIndex((row) => row.contains(previous));
        return;
      }
      this.focusedAction = null;
      const doc = this.el.ownerDocument;
      if (doc.activeElement && doc.activeElement !== doc.body) return;
      const row = rows[Math.min(this.focusedIndex, rows.length - 1)];
      (row?.querySelector<HTMLButtonElement>('button:not(:disabled)') ?? this.el).focus();
    });
  }
  protected progressValue(file: VdUploadFile): number | null {
    return typeof file.progress === 'number' && Number.isFinite(file.progress)
      ? Math.round(Math.min(100, Math.max(0, file.progress)))
      : null;
  }
  protected canRetry(file: VdUploadFile): boolean {
    return file.status === 'error' || file.status === 'canceled';
  }
  protected actionLabel(file: VdUploadFile): string {
    return file.status === 'success'
      ? this.labels().remove
      : this.canRetry(file)
        ? this.labels().retry
        : this.labels().cancel;
  }
  protected rememberFocus(event: FocusEvent, index: number): void {
    this.focusedAction = event.target as HTMLButtonElement;
    this.focusedIndex = index;
  }
  protected act(file: VdUploadFile): void {
    if (this.disabled()) return;
    if (file.status === 'success') this.fileRemove.emit(file.id);
    else if (this.canRetry(file)) this.fileRetry.emit(file.id);
    else this.fileCancel.emit(file.id);
  }
  protected remove(file: VdUploadFile): void {
    if (!this.disabled() && (file.status === 'success' || this.canRetry(file)))
      this.fileRemove.emit(file.id);
  }
}
