import {
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { VdFileRejection, vdCheckFiles } from './core/accept';

export interface VdRejectedFile {
  file: File;
  reason: VdFileRejection;
}

/**
 * File picker and drop target on a `<label>` that wraps a native `<input type="file">`.
 * The input stays the control (keyboard, `accept`, `multiple`, form submission); the label is
 * the click and drop area. Dropped files are checked against `accept` (the picker does that
 * for chosen files), `maxSize` and `multiple`, and written back to the input.
 * Spec: specs/dropzone.md
 */
@Directive({
  selector: 'label[vdDropzone]',
  host: {
    class: 'vd-dropzone',
    '[attr.data-dragover]': 'dragging() ? "" : null',
    '(dragenter)': 'onDragEnter($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave()',
    '(drop)': 'onDrop($event)',
    '(change)': 'onChange($event)',
  },
})
export class VdDropzone {
  /** Largest accepted file in bytes. */
  readonly maxSize = input(undefined, { transform: numberAttribute });
  /** Accepted files, after each pick or drop. */
  readonly filesSelected = output<File[]>();
  /** Files that didn't pass `accept`, `maxSize` or the single-file limit. */
  readonly filesRejected = output<VdRejectedFile[]>();

  protected readonly dragging = signal(false);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  /** dragenter/leave fire for every child; count to know when the pointer really left. */
  private depth = 0;

  private get control(): HTMLInputElement | null {
    return this.el.querySelector('input[type=file]');
  }

  protected onDragEnter(event: DragEvent): void {
    if (!this.acceptsDrag(event)) return;
    event.preventDefault();
    this.depth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.acceptsDrag(event)) return;
    // Required for the drop event; also shows the copy cursor.
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected onDragLeave(): void {
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth === 0) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    this.depth = 0;
    this.dragging.set(false);
    if (!this.acceptsDrag(event)) return;
    event.preventDefault();
    const accepted = this.emit(Array.from(event.dataTransfer?.files ?? []));
    // Keep the native input in sync so a plain form submit sends the dropped files.
    const input = this.control;
    if (input && typeof DataTransfer !== 'undefined') {
      const transfer = new DataTransfer();
      accepted.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    }
  }

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.type !== 'file') return;
    this.emit(Array.from(input.files ?? []));
  }

  private emit(files: File[]): File[] {
    const input = this.control;
    const { accepted, rejected } = vdCheckFiles(files, {
      accept: input?.accept ?? '',
      maxSize: this.maxSize(),
      maxFiles: input?.multiple ? undefined : 1,
    });
    if (rejected.length) this.filesRejected.emit(rejected);
    if (accepted.length) this.filesSelected.emit(accepted);
    return accepted;
  }

  private acceptsDrag(event: DragEvent): boolean {
    const input = this.control;
    return (
      !!input && !input.disabled && Array.from(event.dataTransfer?.types ?? []).includes('Files')
    );
  }
}
