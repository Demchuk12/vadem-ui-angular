import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';

export type VdPopoverPlacement = 'bottom' | 'top' | 'start' | 'end';

/**
 * Non-modal floating panel with any content (filters, a share form, details): a
 * `popover="auto"` in the top layer, anchored to its trigger with CSS anchor positioning.
 * Light dismiss and Escape are native. Give it a name (`aria-label` / `aria-labelledby`).
 * Spec: specs/popover.md
 */
@Directive({
  selector: '[vdPopover]',
  exportAs: 'vdPopover',
  host: {
    class: 'vd-popover',
    popover: 'auto',
    role: 'dialog',
    '[id]': 'id',
    '[attr.data-placement]': 'placement()',
  },
})
export class VdPopover {
  readonly placement = input<VdPopoverPlacement>('bottom');
  readonly id = vdUniqueId('vd-popover');
  readonly el: HTMLElement = inject(ElementRef).nativeElement;

  hide(): void {
    if (this.el.matches(':popover-open')) this.el.hidePopover();
  }
}

/**
 * Toggles a `vdPopover` from a button. On open, focus moves to the popover's `[autofocus]`
 * element or its first focusable one; closing returns focus to the trigger (the trigger is the
 * popover's invoker).
 */
@Directive({
  selector: 'button[vdPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'vdPopoverTrigger().id',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '(pointerdown)': 'rememberState()',
    '(click)': 'toggle()',
  },
})
export class VdPopoverTrigger {
  readonly vdPopoverTrigger = input.required<VdPopover>();
  protected readonly open = signal(false);
  private readonly el: HTMLButtonElement = inject(ElementRef).nativeElement;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const popover = this.vdPopoverTrigger();
      const name = `--${popover.id}`;
      this.el.style.setProperty('anchor-name', name);
      popover.el.style.setProperty('position-anchor', name);
      const onToggle = (event: Event) => {
        const opened = (event as ToggleEvent).newState === 'open';
        this.open.set(opened);
        if (opened) this.focusInside(popover.el);
      };
      popover.el.addEventListener('toggle', onToggle);
      destroyRef.onDestroy(() => popover.el.removeEventListener('toggle', onToggle));
    });
  }

  /** Open state when the press started: light dismiss may already have closed it by click. */
  private openAtPress: boolean | null = null;

  protected rememberState(): void {
    this.openAtPress = this.vdPopoverTrigger().el.matches(':popover-open');
  }

  protected toggle(): void {
    const popover = this.vdPopoverTrigger().el;
    // Keyboard activation has no pointerdown: use the current state.
    const wasOpen = this.openAtPress ?? popover.matches(':popover-open');
    this.openAtPress = null;
    if (wasOpen) {
      if (popover.matches(':popover-open')) popover.hidePopover();
    }
    // `source` makes the trigger the invoker (focus returns to it on close). Some engines still
    // light-dismiss on the trigger's pointerdown; `openAtPress` keeps the toggle correct then.
    else popover.showPopover({ source: this.el } as ShowPopoverOptions);
  }

  private focusInside(panel: HTMLElement): void {
    const target =
      panel.querySelector<HTMLElement>('[autofocus]') ??
      panel.querySelector<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
    target?.focus();
  }
}

export const VD_POPOVER = [VdPopover, VdPopoverTrigger] as const;
