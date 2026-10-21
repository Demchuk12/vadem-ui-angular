import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { VD_DIALOG, VdDialog } from '@vadem/ui/dialog';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VD_TOOLTIP_DEFAULTS, VdTooltipController } from '@vadem/ui/tooltip';
import { vdTexts } from '@vadem/ui/locale';

export type VdSidebarMode = 'docked' | 'drawer';

/** Sidebar content, authored once and rendered either docked or inside the drawer. */
@Directive({ selector: 'ng-template[vdSidebar]' })
export class VdSidebar {
  readonly template = inject(TemplateRef);
}

/**
 * App shell: docked sidebar (collapsible to an icon rail) on wide viewports, start-edge
 * Dialog drawer on narrow ones. The breakpoint lives in CSS. Spec: specs/sidebar.md
 */
@Component({
  selector: 'vd-sidebar-layout',
  imports: [NgTemplateOutlet, VD_DIALOG, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-sidebar-layout',
    '[attr.data-mode]': 'mode()',
    '[attr.data-collapsed]': 'rail() ? "" : null',
  },
  template: `
    @if (mode() === 'docked') {
      <div #docked class="vd-sidebar" [id]="sidebarId">
        <ng-container [ngTemplateOutlet]="content()?.template ?? null" />
      </div>
    }
    <div class="vd-sidebar-layout__body"><ng-content /></div>
    <dialog
      vdDialog
      #drawer="vdDialog"
      class="vd-sidebar-drawer"
      placement="start"
      size="sm"
      [(open)]="drawerOpen"
    >
      <header vdDialogHeader>
        <h2 vdDialogTitle>{{ t().label }}</h2>
        <button
          vdButton
          vdDialogClose
          variant="ghost"
          iconOnly
          size="sm"
          [attr.aria-label]="t().closeLabel"
        >
          <vd-icon name="x" />
        </button>
      </header>
      <div #drawerBody vdDialogBody class="vd-sidebar">
        @if (mode() === 'drawer') {
          <ng-container [ngTemplateOutlet]="content()?.template ?? null" />
        }
      </div>
    </dialog>
  `,
})
export class VdSidebarLayout {
  /** Drawer dialog title. */
  readonly label = input<string>();
  /** Accessible name of the drawer close button. */
  readonly closeLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('sidebar', { label: this.label, closeLabel: this.closeLabel });
  /** Docked rail state. */
  readonly collapsed = model(false);

  readonly sidebarId = vdUniqueId('vd-sidebar');
  readonly mode = signal<VdSidebarMode>('docked');
  readonly drawerOpen = signal(false);
  /** Collapsed rail is only visible while docked; the drawer always shows full content. */
  readonly rail = computed(() => this.collapsed() && this.mode() === 'docked');

  protected readonly content = contentChild(VdSidebar);
  private readonly docked = viewChild<ElementRef<HTMLElement>>('docked');
  private readonly drawer = viewChild.required<VdDialog>('drawer');
  private readonly drawerBody = viewChild.required<ElementRef<HTMLElement>>('drawerBody');
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Browser-only: CSS sets --vd-sidebar-drawer below the breakpoint; follow it on resize.
    afterNextRender(() => {
      const view = this.el.ownerDocument.defaultView;
      if (!view) return;
      const sync = () => {
        const drawer = view.getComputedStyle(this.el).getPropertyValue('--vd-sidebar-drawer');
        const mode: VdSidebarMode = drawer.trim() === '1' ? 'drawer' : 'docked';
        if (mode === this.mode()) return;
        // Dialog returns focus to the opening toggle, which stays visible in both modes.
        this.drawer().close();
        this.mode.set(mode);
      };
      // Delegated: Enter on a link also dispatches click, so keyboard navigation is covered.
      const body = this.drawerBody().nativeElement;
      const onClick = (event: MouseEvent) => this.closeOnNavigate(event);
      body.addEventListener('click', onClick);
      destroyRef.onDestroy(() => body.removeEventListener('click', onClick));
      sync();
      if (!view.ResizeObserver) return;
      const observer = new view.ResizeObserver(sync);
      observer.observe(this.el);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // Rail tooltips: visual duplicates of link text while collapsed.
    afterRenderEffect((onCleanup) => {
      const host = this.docked()?.nativeElement;
      if (!host || !this.rail()) return;
      const tips = new RailTooltips(host);
      onCleanup(() => tips.destroy());
    });
  }

  /** Collapses/expands the rail when docked, opens the drawer otherwise. */
  toggle(): void {
    if (this.mode() === 'drawer') this.drawer().show();
    else this.collapsed.update((value) => !value);
  }

  /** Following a link closes the drawer; modified clicks open elsewhere and keep it open. */
  private closeOnNavigate(event: MouseEvent): void {
    // Router links call preventDefault() for in-app navigation, so that flag is not checked.
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest('a[href]');
    if (link && link.getAttribute('target') !== '_blank') this.drawer().close();
  }
}

/** Toggles the rail (docked) or opens the drawer (narrow viewports). */
@Directive({
  selector: 'button[vdSidebarToggle]',
  host: {
    class: 'vd-sidebar-toggle',
    type: 'button',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': 'layout.mode() === "docked" ? layout.sidebarId : null',
    '[attr.aria-haspopup]': 'layout.mode() === "drawer" ? "dialog" : null',
    '(click)': 'layout.toggle()',
  },
})
export class VdSidebarToggle {
  protected readonly layout = inject(VdSidebarLayout);
  protected readonly expanded = computed(() =>
    this.layout.mode() === 'drawer' ? this.layout.drawerOpen() : !this.layout.collapsed(),
  );
}

/** One aria-hidden tooltip per navigation link, kept in sync with the sidebar's content. */
class RailTooltips {
  private readonly entries = new Map<HTMLElement, { tip: HTMLElement; ctl: VdTooltipController }>();
  private readonly observer: MutationObserver;

  constructor(private readonly host: HTMLElement) {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(host, { childList: true, subtree: true, characterData: true });
    this.sync();
  }

  destroy(): void {
    this.observer.disconnect();
    for (const link of [...this.entries.keys()]) this.remove(link);
  }

  private sync(): void {
    const links = new Set(this.host.querySelectorAll<HTMLElement>('.vd-navigation-link'));
    for (const link of [...this.entries.keys()]) if (!links.has(link)) this.remove(link);
    for (const link of links) {
      const text = (link.querySelector(':scope > :not([slot])') ?? link).textContent?.trim() ?? '';
      const entry = this.entries.get(link) ?? this.add(link);
      if (entry.tip.textContent !== text) entry.tip.textContent = text;
    }
  }

  private add(link: HTMLElement) {
    const doc = link.ownerDocument;
    const tip = doc.createElement('div');
    const anchor = `--${vdUniqueId('vd-sidebar-tip')}`;
    tip.className = 'vd-tooltip';
    tip.dataset['placement'] = 'end';
    tip.setAttribute('popover', 'manual');
    // The link keeps its own (visually hidden) name; the tooltip only repeats it visually.
    tip.setAttribute('aria-hidden', 'true');
    tip.style.setProperty('position-anchor', anchor);
    link.style.setProperty('anchor-name', anchor);
    doc.body.appendChild(tip);
    const entry = { tip, ctl: new VdTooltipController(link, tip, VD_TOOLTIP_DEFAULTS) };
    this.entries.set(link, entry);
    return entry;
  }

  private remove(link: HTMLElement): void {
    const entry = this.entries.get(link);
    if (!entry) return;
    entry.ctl.destroy();
    entry.tip.remove();
    link.style.removeProperty('anchor-name');
    this.entries.delete(link);
  }
}

export const VD_SIDEBAR = [VdSidebarLayout, VdSidebar, VdSidebarToggle] as const;
