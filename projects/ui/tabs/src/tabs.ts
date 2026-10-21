import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdOrientation, vdIsActivationKey, vdRovingTarget } from '@vadem/ui/keyboard';

export type VdTabsVariant = 'line' | 'pill';
export type VdTabsActivation = 'automatic' | 'manual';

/**
 * Tabs container: owns the selected value and keyboard behavior. Compose with
 * `vdTabList`, `vdTab` and `vdTabPanel`. Spec: specs/tabs.md
 */
@Component({
  selector: 'vd-tabs',
  template: '<ng-content />',
  host: {
    class: 'vd-tabs',
    '[attr.data-variant]': 'variant()',
    '[attr.data-orientation]': 'orientation()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdTabs {
  /** Selected tab value. Defaults to the first enabled tab. */
  readonly value = model<string | undefined>(undefined);
  readonly variant = input<VdTabsVariant>('line');
  readonly orientation = input<VdOrientation>('horizontal');
  /** `automatic`: arrows select. `manual`: arrows move focus, Enter/Space select. */
  readonly activation = input<VdTabsActivation>('automatic');

  private readonly tabs = signal<readonly VdTab[]>([]);
  private readonly panels = signal<readonly VdTabPanel[]>([]);

  /** Tabs in DOM order (registration order can differ for dynamic lists). */
  private readonly ordered = computed(() =>
    [...this.tabs()].sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    ),
  );

  readonly selected = computed(() => {
    const value = this.value();
    const tabs = this.ordered();
    if (value !== undefined && tabs.some((t) => t.value() === value && !t.disabled())) return value;
    return tabs.find((t) => !t.disabled())?.value();
  });

  tabId(value: string): string | null {
    return this.tabs().find((t) => t.value() === value)?.id ?? null;
  }

  panelId(value: string): string | null {
    return this.panels().find((p) => p.value() === value)?.id ?? null;
  }

  select(value: string): void {
    this.value.set(value);
  }

  /** Returns the unregister function. */
  registerTab(tab: VdTab): () => void {
    this.tabs.update((items) => [...items, tab]);
    return () => this.tabs.update((items) => items.filter((i) => i !== tab));
  }

  registerPanel(panel: VdTabPanel): () => void {
    this.panels.update((items) => [...items, panel]);
    return () => this.panels.update((items) => items.filter((i) => i !== panel));
  }

  handleKeydown(tab: VdTab, event: KeyboardEvent): void {
    const tabs = this.ordered();
    const current = tabs.indexOf(tab);

    if (this.activation() === 'manual' && vdIsActivationKey(event.key)) {
      event.preventDefault();
      this.select(tab.value());
      return;
    }

    const dir = tab.el.matches(':dir(rtl)') ? 'rtl' : 'ltr';
    const target = vdRovingTarget(
      event.key,
      current,
      tabs.map((t) => t.disabled()),
      { orientation: this.orientation(), dir, loop: true },
    );
    if (target === null) return;

    event.preventDefault();
    const next = tabs[target];
    next.el.focus();
    if (this.activation() === 'automatic') this.select(next.value());
  }
}

/** Container for the tabs. Needs an accessible name (`aria-label` or `aria-labelledby`). */
@Directive({
  selector: '[vdTabList]',
  host: {
    class: 'vd-tabs__list',
    role: 'tablist',
    '[attr.aria-orientation]': 'tabs.orientation()',
  },
})
export class VdTabList {
  protected readonly tabs = inject(VdTabs);
}

@Directive({
  selector: 'button[vdTab]',
  host: {
    class: 'vd-tabs__tab',
    type: 'button',
    role: 'tab',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-controls]': 'tabs.panelId(value())',
    '[attr.tabindex]': 'selected() ? 0 : -1',
    '[attr.data-state]': 'selected() ? "active" : "inactive"',
    '[disabled]': 'disabled()',
    '(click)': 'tabs.select(value())',
    '(keydown)': 'tabs.handleKeydown(this, $event)',
  },
})
export class VdTab implements OnInit {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly tabs = inject(VdTabs);
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  readonly id = vdUniqueId('vd-tab');
  protected readonly selected = computed(() => this.tabs.selected() === this.value());

  private readonly destroyRef = inject(DestroyRef);

  // Register once inputs are set: dynamic `[value]` bindings aren't available in the constructor.
  ngOnInit(): void {
    this.destroyRef.onDestroy(this.tabs.registerTab(this));
  }
}

@Directive({
  selector: '[vdTabPanel]',
  host: {
    class: 'vd-tabs__panel',
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'tabs.tabId(value())',
    '[hidden]': '!selected()',
    '[attr.data-state]': 'selected() ? "active" : "inactive"',
  },
})
export class VdTabPanel implements OnInit {
  readonly value = input.required<string>();

  protected readonly tabs = inject(VdTabs);
  readonly id = vdUniqueId('vd-tabpanel');
  protected readonly selected = computed(() => this.tabs.selected() === this.value());

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.destroyRef.onDestroy(this.tabs.registerPanel(this));
  }
}

export const VD_TABS = [VdTabs, VdTabList, VdTab, VdTabPanel] as const;
