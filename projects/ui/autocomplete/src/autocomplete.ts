import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import {
  vdAutocompleteActive,
  vdAutocompleteMove,
  vdAutocompletePlacement,
  type VdAutocompleteOption,
} from './core/autocomplete';
import { vdTexts } from '@vadem/ui/locale';
import { VdTextHighlight } from '@vadem/ui/text-highlight';

/** Internal connection: the native input keeps its existing forms accessor. */
export interface VdAutocompleteOwner {
  readonly element: HTMLInputElement;
  locked(): boolean;
  accept(option: VdAutocompleteOption): void;
}

@Component({
  selector: 'vd-autocomplete',
  imports: [VdTextHighlight],
  template: `
    <div
      #popup
      class="vd-autocomplete__popup"
      popover="auto"
      role="listbox"
      [id]="listboxId"
      [attr.aria-label]="t().label"
      [attr.aria-busy]="loading()"
      [attr.data-open]="expanded() ? '' : null"
      [attr.data-fallback]="fallback() ? '' : null"
      [attr.data-state]="loading() ? 'loading' : errorText() ? 'error' : 'ready'"
      (toggle)="syncToggle()"
      (mousedown)="$event.preventDefault()"
    >
      @for (option of availableOptions(); track option.id) {
        <!-- Options are operated from the input through aria-activedescendant. -->
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div
          class="vd-autocomplete__option"
          role="option"
          [id]="optionId(option)"
          [attr.aria-label]="option.label"
          [attr.aria-describedby]="option.description ? optionId(option) + '-description' : null"
          [attr.aria-selected]="active()?.id === option.id"
          [attr.aria-disabled]="option.disabled || null"
          [attr.data-active]="active()?.id === option.id ? '' : null"
          (pointermove)="hover(option)"
          (click)="choose(option.id)"
        >
          <span class="vd-autocomplete__label">
            @if (highlightQuery()) {
              <vd-text-highlight [text]="option.label" [query]="highlightQuery()" />
            } @else {
              <ng-container>{{ option.label }}</ng-container>
            }
          </span>
          @if (option.description) {
            <span class="vd-autocomplete__description" [id]="optionId(option) + '-description'">{{
              option.description
            }}</span>
          }
        </div>
      }
      @if (loading() || errorText() || !availableOptions().length) {
        <p class="vd-autocomplete__message" aria-hidden="true">{{ message() }}</p>
      }
    </div>
    <p class="vd-visually-hidden" role="status" aria-atomic="true">
      {{ expanded() ? message() : '' }}
    </p>
  `,
  host: { class: 'vd-autocomplete' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdAutocomplete {
  readonly options = input<readonly VdAutocompleteOption[]>([]);
  /** Optional literal query for visual label matches; filtering remains application-owned. */
  readonly highlightQuery = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly errorText = input('');
  readonly label = input<string>();
  readonly loadingText = input<string>();
  readonly emptyText = input<string>();
  readonly resultsText = input<(count: number) => string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('autocomplete', {
    label: this.label,
    loadingText: this.loadingText,
    emptyText: this.emptyText,
    resultsText: this.resultsText,
  });
  readonly optionSelected = output<VdAutocompleteOption>();
  readonly listboxId = vdUniqueId('vd-autocomplete');
  readonly expanded = signal(false);
  protected readonly fallback = signal(false);
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private readonly activeKey = signal<string | null>(null);
  private owner: VdAutocompleteOwner | null = null;
  private cleanup: (() => void) | null = null;

  protected readonly availableOptions = computed(() =>
    this.loading() || this.errorText() ? [] : this.options(),
  );
  readonly active = computed(() => vdAutocompleteActive(this.availableOptions(), this.activeKey()));
  readonly activeId = computed(() =>
    this.expanded() && this.active() ? this.optionId(this.active()!) : null,
  );
  protected readonly message = computed(() =>
    this.loading()
      ? this.t().loadingText
      : this.errorText() ||
        (this.availableOptions().length
          ? this.t().resultsText(this.availableOptions().filter((o) => !o.disabled).length)
          : this.t().emptyText),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.close();
      this.cleanup?.();
      this.owner = null;
    });
    afterRenderEffect(() => {
      const active = this.active();
      if (!active && this.activeKey() !== null) this.activeKey.set(null);
      if (this.expanded() && active)
        this.popup()
          .nativeElement.ownerDocument.getElementById(this.optionId(active))
          ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    afterEveryRender(() => {
      if (this.expanded()) this.position();
    });
  }

  /** Browser-only connection, installed by the input's after-render hook. */
  connect(owner: VdAutocompleteOwner): () => void {
    if (this.owner && this.owner !== owner)
      throw new Error('An autocomplete panel requires a single input.');
    this.owner = owner;
    const popup = this.popup().nativeElement;
    const doc = owner.element.ownerDocument;
    const win = doc.defaultView;
    this.fallback.set(typeof popup.showPopover !== 'function');
    const outside = (event: Event) => {
      const path = event.composedPath();
      if (!path.includes(owner.element) && !path.includes(popup)) this.close();
    };
    const reposition = () => {
      if (this.expanded()) this.position();
    };
    doc.addEventListener('pointerdown', outside, true);
    doc.addEventListener('scroll', reposition, true);
    win?.addEventListener('resize', reposition);
    win?.visualViewport?.addEventListener('resize', reposition);
    const observer = win?.ResizeObserver ? new win.ResizeObserver(reposition) : null;
    observer?.observe(owner.element);
    const cleanup = () => {
      doc.removeEventListener('pointerdown', outside, true);
      doc.removeEventListener('scroll', reposition, true);
      win?.removeEventListener('resize', reposition);
      win?.visualViewport?.removeEventListener('resize', reposition);
      observer?.disconnect();
    };
    this.cleanup = cleanup;
    return () => {
      if (this.owner !== owner) return;
      this.close();
      cleanup();
      this.cleanup = null;
      this.owner = null;
    };
  }

  open(): void {
    if (!this.owner || this.owner.locked() || this.expanded()) return;
    this.activeKey.set(null);
    this.expanded.set(true);
    const popup = this.popup().nativeElement;
    if (!this.fallback()) popup.showPopover({ source: this.owner.element } as ShowPopoverOptions);
    this.position();
  }

  close(): void {
    if (!this.expanded()) return;
    this.expanded.set(false);
    this.activeKey.set(null);
    const popup = this.popup().nativeElement;
    if (!this.fallback() && popup.matches(':popover-open')) popup.hidePopover();
  }

  resetActive(): void {
    this.activeKey.set(null);
  }

  navigate(key: 'ArrowDown' | 'ArrowUp'): void {
    this.open();
    if (!this.expanded() || this.owner?.locked()) return;
    if (!this.availableOptions().some((option) => !option.disabled)) {
      const popup = this.popup().nativeElement;
      const line = Number.parseFloat(
        popup.ownerDocument.defaultView!.getComputedStyle(popup).lineHeight,
      );
      popup.scrollBy?.({ top: (key === 'ArrowDown' ? 1 : -1) * line });
    }
    this.activeKey.set(vdAutocompleteMove(this.availableOptions(), this.active()?.id ?? null, key));
  }

  choose(id: string): void {
    if (!this.expanded() || !this.owner || this.owner.locked()) return;
    const option = vdAutocompleteActive(this.availableOptions(), id);
    if (!option) return;
    this.close();
    this.owner.accept(option);
    this.optionSelected.emit(option);
  }

  protected hover(option: VdAutocompleteOption): void {
    if (!option.disabled) this.activeKey.set(option.id);
  }

  protected optionId(option: VdAutocompleteOption): string {
    return `${this.listboxId}-${encodeURIComponent(option.id)}`;
  }

  protected syncToggle(): void {
    if (!this.fallback() && !this.popup().nativeElement.matches(':popover-open')) this.close();
  }

  private position(): void {
    const input = this.owner?.element;
    const popup = this.popup().nativeElement;
    const win = input?.ownerDocument.defaultView;
    if (!input || !win) return;
    popup.dir = win.getComputedStyle(input).direction;
    const style = win.getComputedStyle(popup);
    const gap = Number.parseFloat(style.paddingInlineStart) || 0;
    // Measure the CSS cap through computed max-height before imposing the available viewport space.
    popup.style.removeProperty('--vd-autocomplete-available-block');
    const cap = Number.parseFloat(win.getComputedStyle(popup).maxBlockSize);
    const rect = vdAutocompletePlacement(
      input.getBoundingClientRect(),
      {
        width: input.ownerDocument.documentElement.getBoundingClientRect().width,
        height: win.visualViewport?.height ?? win.innerHeight,
      },
      Math.min(popup.scrollHeight, Number.isFinite(cap) ? cap : popup.scrollHeight),
      gap,
      win.getComputedStyle(input).direction === 'rtl',
    );
    popup.style.setProperty('inset-block-start', `${rect.top}px`);
    popup.style.setProperty('inset-inline-start', `${rect.inline}px`);
    popup.style.setProperty('inline-size', `${rect.width}px`);
    popup.style.setProperty('--vd-autocomplete-available-block', `${rect.available}px`);
  }
}
