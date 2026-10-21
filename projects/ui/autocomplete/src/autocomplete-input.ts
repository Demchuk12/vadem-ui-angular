import {
  DestroyRef,
  Directive,
  ElementRef,
  afterEveryRender,
  afterRenderEffect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormResetEvent, NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { VdInput } from '@vadem/ui/input';
import { VdAutocomplete } from './autocomplete';
import type { VdAutocompleteOption } from './core/autocomplete';

/** Native text accessor and Field wiring; the panel only offers optional completions. */
@Directive({
  selector: 'input[vdAutocomplete]',
  host: {
    class: 'vd-autocomplete-input',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    autocomplete: 'off',
    '[attr.aria-expanded]': 'vdAutocomplete().expanded()',
    '[attr.aria-controls]': 'vdAutocomplete().listboxId',
    '[attr.aria-activedescendant]': 'vdAutocomplete().activeId()',
    '(input)': 'onInput($event)',
    '(focus)': 'show()',
    '(click)': 'show()',
    '(blur)': 'vdAutocomplete().close()',
    '(keydown)': 'onKeydown($event)',
    '(compositionstart)': 'startComposition()',
    '(compositionend)': 'endComposition()',
  },
})
export class VdAutocompleteInput extends VdInput {
  readonly vdAutocomplete = input.required<VdAutocomplete>();
  readonly queryChange = output<string>();
  readonly element: HTMLInputElement = inject(ElementRef).nativeElement;
  private readonly autocompleteNgControl = inject(NgControl, { self: true, optional: true });
  private readonly autocompleteFormField = inject(FormField, { self: true, optional: true });
  private readonly autocompleteDestroyRef = inject(DestroyRef);
  private composing = false;
  private accepting = false;
  private lastQuery: string | null = null;
  private snapshot: string | null = null;

  constructor() {
    super();
    afterRenderEffect((cleanup) => {
      const panel = this.vdAutocomplete();
      const disconnect = untracked(() => panel.connect(this));
      const form = this.element.form;
      const reset = () => panel.close();
      form?.addEventListener('reset', reset);
      cleanup(() => {
        form?.removeEventListener('reset', reset);
        disconnect();
      });
    });
    afterEveryRender(() => {
      const snapshot = JSON.stringify([
        this.element.value,
        this.element.disabled,
        this.element.readOnly,
      ]);
      if (this.snapshot !== null && this.snapshot !== snapshot) {
        this.vdAutocomplete().close();
        this.lastQuery = null;
      }
      this.snapshot = snapshot;
    });
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.composing = false;
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Signal Forms uses the native input path; do not read its NgControl compatibility shim.
    if (this.autocompleteFormField) return;
    const subscription = this.autocompleteNgControl?.control?.events.subscribe((event) => {
      if (event instanceof FormResetEvent) {
        this.lastQuery = null;
        this.vdAutocomplete().close();
      }
    });
    this.autocompleteDestroyRef.onDestroy(() => subscription?.unsubscribe());
  }

  locked(): boolean {
    return this.element.disabled || this.element.readOnly;
  }

  accept(option: VdAutocompleteOption): void {
    if (this.locked()) return;
    this.element.value = option.label;
    this.remember();
    this.lastQuery = option.label;
    this.accepting = true;
    try {
      const EventType = this.element.ownerDocument.defaultView!.Event;
      this.element.dispatchEvent(new EventType('input', { bubbles: true }));
      this.element.dispatchEvent(new EventType('change', { bubbles: true }));
    } finally {
      this.accepting = false;
    }
    this.element.focus({ preventScroll: true });
    if (['text', 'search', 'tel', 'url', 'password'].includes(this.element.type))
      this.element.setSelectionRange(this.element.value.length, this.element.value.length);
  }

  protected show(): void {
    if (!this.composing && !this.locked()) this.vdAutocomplete().open();
  }

  protected onInput(event: Event): void {
    this.remember();
    if (this.accepting || this.composing || (event as InputEvent).isComposing || this.locked())
      return;
    this.publish();
  }

  protected startComposition(): void {
    this.composing = true;
    this.vdAutocomplete().close();
  }

  protected endComposition(): void {
    this.composing = false;
    this.remember();
    if (!this.locked()) this.publish();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.locked() || this.composing || event.isComposing || event.keyCode === 229) return;
    const panel = this.vdAutocomplete();
    if (event.key === 'Tab') {
      panel.close();
      return;
    }
    if (event.key === 'Escape' && panel.expanded()) {
      event.preventDefault();
      panel.close();
      return;
    }
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault();
      panel.close();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      panel.open();
      return;
    }
    if (event.altKey) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      panel.navigate(event.key);
    } else if (event.key === 'Enter' && panel.expanded() && panel.active()) {
      event.preventDefault();
      panel.choose(panel.active()!.id);
    }
  }

  private remember(): void {
    this.snapshot = JSON.stringify([
      this.element.value,
      this.element.disabled,
      this.element.readOnly,
    ]);
  }

  private publish(): void {
    const panel = this.vdAutocomplete();
    panel.resetActive();
    const value = this.element.value;
    if (value !== this.lastQuery) {
      this.lastQuery = value;
      this.queryChange.emit(value);
    }
    panel.open();
  }
}
