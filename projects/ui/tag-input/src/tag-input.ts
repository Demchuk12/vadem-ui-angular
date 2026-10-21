import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  Signal,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField, FormValueControl } from '@angular/forms/signals';
import {
  VD_FIELD,
  VdFieldControl,
  VdNgControlState,
  vdNgControlState,
  vdUniqueId,
} from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { vdAddTag, vdNormalizeTags, vdTagKey } from './core/tags';
import { vdTexts } from '@vadem/ui/locale';

export type VdTagInputSize = 'sm' | 'md' | 'lg';

/** User-defined tags with explicit editing actions. Spec: specs/tag-input.md. */
@Component({
  selector: 'vd-tag-input',
  imports: [VdIcon],
  template: `
    <div class="vd-input-group vd-tag-input__field" (pointerdown)="onFieldPointerDown($event)">
      @if (tags().length) {
        <ul class="vd-tag-input__tags" role="list" [attr.aria-label]="t().tagsLabel">
          @for (tag of tags(); track tagKey(tag)) {
            <li class="vd-tag-input__tag">
              <span class="vd-tag-input__label">{{ tag }}</span>
              <button
                #removeButton
                class="vd-tag-input__remove"
                type="button"
                [disabled]="locked()"
                [attr.aria-label]="t().removeLabel(tag)"
                (click)="remove(tag)"
                (keydown.escape)="returnToInput($event)"
              >
                <vd-icon name="x" />
              </button>
            </li>
          }
        </ul>
      }
      <input
        #draftInput
        type="text"
        class="vd-input vd-tag-input__input"
        autocomplete="off"
        [id]="controlId"
        [attr.data-size]="size()"
        [value]="draft()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [attr.data-invalid]="showInvalid() ? '' : null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="isRequired() || null"
        [attr.aria-describedby]="descriptionIds()"
        [attr.aria-label]="ariaLabel() ?? null"
        [attr.aria-labelledby]="ariaLabelledby() ?? null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (compositionstart)="composing = true"
        (compositionend)="composing = false"
      />
      <button
        class="vd-button vd-tag-input__add"
        type="button"
        data-variant="ghost"
        [attr.data-size]="size()"
        [disabled]="locked() || !draft().trim()"
        (click)="add()"
      >
        {{ t().addLabel }}
      </button>
    </div>
    <p
      class="vd-tag-input__feedback"
      [id]="feedbackId"
      role="status"
      aria-atomic="true"
      [textContent]="feedback()"
    ></p>
  `,
  host: {
    class: 'vd-tag-input',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdTagInput implements FormValueControl<string[]>, OnInit {
  readonly value = model<string[]>([]);
  readonly size = input<VdTagInputSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly addLabel = input<string>();
  readonly tagsLabel = input<string>();
  readonly removeLabel = input<(tag: string) => string>();
  readonly addedMessage = input<(tag: string) => string>();
  readonly removedMessage = input<(tag: string) => string>();
  readonly duplicateMessage = input<(tag: string) => string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('tagInput', {
    addLabel: this.addLabel,
    tagsLabel: this.tagsLabel,
    removeLabel: this.removeLabel,
    addedMessage: this.addedMessage,
    removedMessage: this.removedMessage,
    duplicateMessage: this.duplicateMessage,
  });
  readonly touch = output<void>();

  readonly controlId = vdUniqueId('vd-tags');
  protected readonly feedbackId = vdUniqueId('vd-tags-feedback');
  protected readonly tagKey = vdTagKey;
  protected readonly tags = computed(() => vdNormalizeTags(this.value()));
  protected readonly draft = signal('');
  protected readonly feedback = signal('');
  protected composing = false;
  private readonly pendingFeedback = signal<string | null>(null);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('draftInput');
  private readonly removeButtons = viewChildren<ElementRef<HTMLButtonElement>>('removeButton');
  private readonly hostEl: HTMLElement = inject(ElementRef).nativeElement;
  private readonly field = inject(VD_FIELD, { optional: true });
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBound = signal(false);
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly ngState = computed(
    () =>
      this.ngSource()?.() ?? { invalid: false, touched: false, disabled: false, required: false },
  );
  protected readonly isDisabled = computed(() => this.disabled() || this.ngState().disabled);
  protected readonly locked = computed(() => this.isDisabled() || this.readonly());
  protected readonly showInvalid = computed(
    () =>
      (this.invalid() && (!this.formBound() || this.touched())) ||
      (this.ngState().invalid && this.ngState().touched),
  );
  protected readonly isRequired = computed(() => this.required() || this.ngState().required);
  protected readonly descriptionIds = computed(
    () =>
      [this.field?.describedBy(), this.feedback() ? this.feedbackId : null]
        .filter(Boolean)
        .join(' ') || null,
  );
  private lastValue: string[] | null = null;

  constructor() {
    const control: VdFieldControl = {
      id: signal(this.controlId),
      invalid: this.showInvalid,
      required: this.isRequired,
      disabled: this.isDisabled,
    };
    this.field?.register(control);
    this.destroyRef.onDestroy(() => this.field?.unregister(control));
    // All form APIs bind the model directly. External replacements clear pending editing.
    afterRenderEffect(() => {
      const value = this.value();
      if (value !== this.lastValue) {
        this.lastValue = value;
        untracked(() => this.reset());
      }
    });
    // An empty render separates repeated identical status messages; no timers or SSR DOM access.
    afterRenderEffect(() => {
      const message = this.pendingFeedback();
      if (message !== null) {
        this.pendingFeedback.set(null);
        this.feedback.set(message);
      }
    });
  }

  ngOnInit(): void {
    const ng = this.injector.get(NgControl, null, { self: true, optional: true });
    this.formBound.set(
      !!ng || !!this.injector.get(FormField, null, { self: true, optional: true }),
    );
    this.ngSource.set(vdNgControlState(ng, this.destroyRef));
  }

  focus(options?: FocusOptions): void {
    this.inputRef()?.nativeElement.focus(options);
  }
  reset(): void {
    this.draft.set('');
    // Reset the native draft even if input and reset happened before a binding render.
    const input = this.inputRef()?.nativeElement;
    if (input) input.value = '';
    this.feedback.set('');
    this.pendingFeedback.set(null);
    this.composing = false;
  }
  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    this.feedback.set('');
    this.pendingFeedback.set(null);
  }
  protected add(): void {
    if (this.locked() || this.composing) return;
    const result = vdAddTag(this.tags(), this.draft());
    if (result.kind === 'empty') return;
    if (result.kind === 'duplicate') this.announce(this.t().duplicateMessage(result.tag));
    else {
      this.commit(result.value);
      this.draft.set('');
      this.announce(this.t().addedMessage(result.tag));
    }
    this.focus();
  }
  protected remove(tag: string): void {
    if (this.locked() || !this.tags().includes(tag)) return;
    this.commit(this.tags().filter((item) => item !== tag));
    this.focus();
    this.announce(this.t().removedMessage(tag));
  }
  protected returnToInput(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.focus();
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.isComposing ||
      this.composing ||
      this.locked() ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.add();
    } else if (event.key === 'Backspace' && this.draft() === '') {
      const last = this.removeButtons().at(-1);
      if (last) {
        event.preventDefault();
        last.nativeElement.focus();
      }
    }
  }
  protected onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget && this.hostEl.contains(event.relatedTarget as Node)) return;
    this.touch.emit();
  }
  protected onFieldPointerDown(event: PointerEvent): void {
    if (!this.isDisabled() && event.target === event.currentTarget) {
      event.preventDefault();
      this.focus();
    }
  }
  private commit(value: string[]): void {
    this.lastValue = value;
    this.value.set(value);
  }
  private announce(message: string): void {
    this.feedback.set('');
    this.pendingFeedback.set(message);
  }
}
