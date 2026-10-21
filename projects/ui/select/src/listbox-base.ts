import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  ModelSignal,
  OnInit,
  Signal,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  VD_FIELD,
  VdFieldControl,
  VdNgControlState,
  vdNgControlState,
  vdUniqueId,
} from '@vadem/ui/field';
import { VdTypeahead, vdListTarget } from '@vadem/ui/keyboard';
import { VdListboxHost } from './listbox-host';
import type { VdOption } from './option';
import { vdTexts } from '@vadem/ui/locale';

export type VdSelectSize = 'sm' | 'md' | 'lg';

const NO_NG_STATE: VdNgControlState = {
  invalid: false,
  touched: false,
  disabled: false,
  required: false,
};

/**
 * Shared behavior of select, combobox, and multi-select: option registry, active option
 * (aria-activedescendant - focus stays on the combobox element), popover listbox anchored to
 * the field, value + ControlValueAccessor, and `vd-field` wiring.
 */
@Directive()
export abstract class VdListboxBase<T = string | null>
  implements VdListboxHost, ControlValueAccessor, OnInit
{
  /** Concrete controls define a single-value or array-valued selection model. */
  abstract readonly value: ModelSignal<T>;
  readonly placeholder = input('');
  readonly size = input<VdSelectSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state (e.g. server error); form validity is detected after touch. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Gate for `invalid`; Signal Forms binds it (FormUiControl contract). */
  readonly touched = input<boolean | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  /** Shown when no option is visible (e.g. nothing matches the filter). */
  readonly emptyText = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('select', { emptyText: this.emptyText });
  /** Accessible name when there's no `vd-field` label; applied to the inner combobox element. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  readonly listboxId = vdUniqueId('vd-listbox');
  readonly controlId = vdUniqueId('vd-combobox');

  protected readonly field = inject(VD_FIELD, { optional: true });
  protected readonly hostEl: HTMLElement = inject(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly options = signal<readonly VdOption[]>([]);
  protected readonly open = signal(false);
  protected readonly activeId = signal<string | null>(null);
  private readonly formDisabled = signal(false);
  private readonly ngSource = signal<Signal<VdNgControlState> | null>(null);
  private readonly typeahead = new VdTypeahead();

  /** The popover listbox element. */
  protected abstract listEl(): HTMLElement | undefined;
  /** What the listbox is anchored to (the visible field). */
  protected abstract anchorEl(): HTMLElement | undefined;

  protected readonly ordered = computed(() =>
    [...this.options()].sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & a.el.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    ),
  );
  protected readonly visibleOptions = computed(() =>
    this.ordered().filter((o) => this.isVisible(o)),
  );
  protected readonly selectedOption = computed(() =>
    this.ordered().find((o) => this.isSelected(o)),
  );
  protected readonly selectedLabel = computed(() => this.selectedOption()?.textLabel() ?? '');
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private readonly ngState = computed(() => this.ngSource()?.() ?? NO_NG_STATE);

  protected readonly showInvalid = computed(() => {
    if (this.invalid() && this.touched() !== false) return true;
    const ng = this.ngState();
    return ng.invalid && ng.touched;
  });
  protected readonly isRequired = computed(() => this.required() || this.ngState().required);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);

  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    const fieldControl: VdFieldControl = {
      id: signal(this.controlId),
      invalid: this.showInvalid,
      required: this.isRequired,
      disabled: this.isDisabled,
    };
    this.field?.register(fieldControl);
    this.destroyRef.onDestroy(() => this.field?.unregister(fieldControl));

    // Browser-only: anchor the listbox and keep `open` in sync with light dismiss / Escape.
    afterNextRender(() => {
      const list = this.listEl();
      const anchor = this.anchorEl();
      if (!list || !anchor) return;
      const name = `--${this.listboxId}`;
      anchor.style.setProperty('anchor-name', name);
      list.style.setProperty('position-anchor', name);
      const onToggle = (e: Event) => {
        if ((e as ToggleEvent).newState === 'closed') this.afterClose();
      };
      list.addEventListener('toggle', onToggle);
      this.destroyRef.onDestroy(() => list.removeEventListener('toggle', onToggle));
    });

    // Keep the active option visible while navigating.
    afterRenderEffect(() => {
      const id = this.activeId();
      if (!this.open() || !id) return;
      this.ordered()
        .find((o) => o.id === id)
        ?.el.scrollIntoView({ block: 'nearest' });
    });
  }

  ngOnInit(): void {
    // Can't inject NgControl in the constructor: it depends on this value accessor.
    const ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    this.ngSource.set(vdNgControlState(ngControl, this.destroyRef));
  }

  // ------------------------------------------------------------- VdListboxHost

  abstract isSelected(option: VdOption): boolean;

  isActive(option: VdOption): boolean {
    return option.id === this.activeId();
  }

  isVisible(_option: VdOption): boolean {
    return true;
  }

  abstract choose(option: VdOption): void;

  hover(option: VdOption): void {
    if (!option.disabled()) this.activeId.set(option.id);
  }

  register(option: VdOption): () => void {
    this.options.update((list) => [...list, option]);
    return () => this.options.update((list) => list.filter((o) => o !== option));
  }

  // --------------------------------------------------------- ControlValueAccessor

  abstract writeValue(value: T | null): void;

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // ------------------------------------------------------------------ internals

  /** Hook for subclasses after an option was chosen. */
  protected onChosen(_option: VdOption): void {
    /* default: nothing */
  }

  /** Hook for subclasses after the list closed (any reason). */
  protected onClosed(): void {
    /* default: nothing */
  }

  protected setValue(value: T): void {
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }

  protected openList(start: 'selected' | 'first' | 'last' = 'selected'): void {
    if (this.isDisabled() || this.open()) return;
    const list = this.listEl();
    if (!list) return;
    this.open.set(true);
    // `source` ties the popover to its field: clicks on the field don't light-dismiss it.
    // Engines without the option ignore it.
    list.showPopover({ source: this.anchorEl() } as ShowPopoverOptions);
    this.activate(start);
  }

  protected closeList(): void {
    const list = this.listEl();
    if (list?.matches(':popover-open')) list.hidePopover();
    else this.afterClose();
  }

  protected activate(start: 'selected' | 'first' | 'last'): void {
    const visible = this.visibleOptions();
    const enabled = visible.filter((o) => !o.disabled());
    const pick =
      start === 'selected'
        ? (enabled.find((o) => this.isSelected(o)) ?? enabled[0])
        : start === 'first'
          ? enabled[0]
          : enabled[enabled.length - 1];
    this.activeId.set(pick?.id ?? null);
  }

  /** Handles list navigation keys. Returns true when the key was used. */
  protected navigate(event: KeyboardEvent): boolean {
    const visible = this.visibleOptions();
    const current = visible.findIndex((o) => o.id === this.activeId());
    const target = vdListTarget(
      event.key,
      current,
      visible.map((o) => o.disabled()),
      { loop: false, pageSize: 10 },
    );
    if (target === null) return false;
    event.preventDefault();
    this.activeId.set(visible[target]?.id ?? null);
    return true;
  }

  /** Feeds a printable key to typeahead. Returns the matched option, if any. */
  protected typeaheadMatch(event: KeyboardEvent): VdOption | undefined {
    if (!VdTypeahead.accepts(event)) return undefined;
    const visible = this.visibleOptions();
    const current = visible.findIndex(
      (o) => o.id === (this.activeId() ?? this.selectedOption()?.id),
    );
    const idx = this.typeahead.match(
      event.key,
      visible.map((o) => o.textLabel()),
      visible.map((o) => o.disabled()),
      current,
    );
    return idx === null ? undefined : visible[idx];
  }

  protected activeOption(): VdOption | undefined {
    return this.visibleOptions().find((o) => o.id === this.activeId());
  }

  private afterClose(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.activeId.set(null);
    this.typeahead.reset();
    this.onClosed();
  }
}
