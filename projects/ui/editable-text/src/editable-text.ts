import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  Injector,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';
import { vdTexts } from '@vadem/ui/locale';
import { vdEditableTextIssue, vdEditableTextLimit } from './core/editable-text';

export type VdEditableTextSave = (value: string) => void | Promise<void>;

/** A committed value with a separate draft and explicit application-owned persistence. */
@Component({
  selector: 'vd-editable-text',
  imports: [VdButton, VdField, VdIcon, VdInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-editable-text',
    '[attr.data-state]': 'editing() ? saving() ? "saving" : issue() ? "error" : "editing" : "idle"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  template: `
    @if (editing()) {
      <vd-field [label]="label()" [hint]="hint()" [error]="feedback() || undefined">
        <input
          #editor
          vdInput
          type="text"
          [value]="draft()"
          [required]="required()"
          [attr.maxlength]="limit()"
          [disabled]="disabled()"
          [readOnly]="saving()"
          [invalid]="!!issue()"
          (input)="changeDraft($event)"
          (keydown)="onKeydown($event)"
          (compositionstart)="composing = true"
          (compositionend)="composing = false"
        />
      </vd-field>
      <div class="vd-editable-text__actions">
        <button
          vdButton
          variant="primary"
          [disabled]="disabled()"
          [loading]="saving()"
          (click)="commit()"
        >
          {{ t().saveLabel }}
        </button>
        <button vdButton variant="ghost" [disabled]="disabled() || saving()" (click)="cancel()">
          {{ t().cancelLabel }}
        </button>
      </div>
    } @else {
      <span class="vd-editable-text__label">{{ label() }}</span>
      <button
        #trigger
        vdButton
        variant="ghost"
        class="vd-editable-text__trigger"
        [disabled]="disabled()"
        [attr.aria-label]="t().editLabel(label(), value() || t().emptyText)"
        (click)="begin()"
      >
        <span class="vd-editable-text__value" [attr.data-empty]="value() ? null : ''">{{
          value() || t().emptyText
        }}</span>
        <vd-icon name="pencil" slot="end" />
      </button>
    }
    <span class="vd-visually-hidden" role="status" aria-atomic="true">{{ announcement() }}</span>
  `,
})
export class VdEditableText {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly save = input<VdEditableTextSave>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly maxLength = input<number | null>(null);
  readonly hint = input<string>();
  readonly emptyText = input<string>();
  readonly editLabel = input<(label: string, value: string) => string>();
  readonly saveLabel = input<string>();
  readonly cancelLabel = input<string>();
  readonly savingText = input<string>();
  readonly savedText = input<string>();
  readonly saveErrorText = input<string>();
  readonly requiredText = input<string>();
  readonly tooLongText = input<(limit: number) => string>();
  readonly saveFailed = output<unknown>();
  protected readonly t = vdTexts('editableText', {
    emptyText: this.emptyText,
    editLabel: this.editLabel,
    saveLabel: this.saveLabel,
    cancelLabel: this.cancelLabel,
    savingText: this.savingText,
    savedText: this.savedText,
    saveErrorText: this.saveErrorText,
    requiredText: this.requiredText,
    tooLongText: this.tooLongText,
  });
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly draft = signal('');
  protected readonly issue = signal<'required' | 'tooLong' | 'save' | null>(null);
  protected readonly limit = computed(() => vdEditableTextLimit(this.maxLength()));
  protected readonly feedback = computed(() => {
    const text = this.t();
    switch (this.issue()) {
      case 'required':
        return text.requiredText;
      case 'tooLong':
        return text.tooLongText(this.limit() ?? 0);
      case 'save':
        return text.saveErrorText;
      default:
        return '';
    }
  });
  protected readonly announcement = signal('');
  protected composing = false;
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly editor = viewChild('editor', { read: ElementRef });
  private readonly trigger = viewChild('trigger', {
    read: ElementRef,
  });
  private readonly injector = inject(Injector);
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
    });
  }

  private focusAfterRender(target: 'editor' | 'trigger'): void {
    afterNextRender(
      () => {
        const element =
          target === 'editor' ? this.editor()?.nativeElement : this.trigger()?.nativeElement;
        element?.focus();
        if (target === 'editor') (element as HTMLInputElement | undefined)?.select();
      },
      { injector: this.injector },
    );
  }

  protected begin(): void {
    if (this.disabled() || this.editing()) return;
    this.draft.set(this.value());
    this.issue.set(null);
    this.announcement.set('');
    this.composing = false;
    this.editing.set(true);
    this.focusAfterRender('editor');
  }

  protected changeDraft(event: Event): void {
    if (this.saving() || this.disabled()) return;
    this.draft.set((event.target as HTMLInputElement).value);
    this.issue.set(null);
    this.announcement.set('');
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.composing || event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!this.saving()) void this.commit();
    }
    if (event.key === 'Escape' && !this.saving()) {
      event.preventDefault();
      event.stopPropagation();
      this.cancel();
    }
  }

  protected cancel(): void {
    if (this.saving() || this.disabled()) return;
    this.finish();
    this.issue.set(null);
    this.announcement.set('');
  }

  protected async commit(): Promise<void> {
    if (!this.editing() || this.saving() || this.disabled() || this.composing) return;
    const candidate = this.draft();
    const issue = vdEditableTextIssue(candidate, this.required(), this.limit());
    this.issue.set(issue);
    if (issue) {
      this.announcement.set(this.feedback());
      this.focusAfterRender('editor');
      return;
    }
    const previous = this.value();
    if (candidate === previous) {
      this.finish();
      return;
    }
    this.saving.set(true);
    this.announcement.set(this.t().savingText);
    try {
      await this.save()?.(candidate);
      if (this.destroyed) return;
      if (this.value() === previous) this.value.set(candidate);
      this.announcement.set(this.t().savedText);
      this.finish();
    } catch (error: unknown) {
      if (this.destroyed) return;
      this.issue.set('save');
      this.announcement.set(this.t().saveErrorText);
      this.saveFailed.emit(error);
    } finally {
      if (!this.destroyed) this.saving.set(false);
    }
  }

  private finish(): void {
    const hadFocus = this.host.contains(this.host.ownerDocument.activeElement);
    this.editing.set(false);
    if (hadFocus) this.focusAfterRender('trigger');
  }
}
