import {
  Directive,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';

/**
 * Group of `details[vdAccordionItem]`. With `exclusive`, the items share a `name`, so the
 * browser keeps at most one open. Spec: specs/accordion.md
 */
@Directive({
  selector: '[vdAccordion]',
  host: { class: 'vd-accordion' },
})
export class VdAccordion {
  /** At most one item open at a time (native `<details name>`). */
  readonly exclusive = input(false, { transform: booleanAttribute });
  readonly name = vdUniqueId('vd-accordion');
}

/**
 * One disclosure on a native `<details>` with a `<summary>`: keyboard, find-in-page (opens the
 * matching item) and state stay native. `open` works as a plain attribute (`<details open>`)
 * and two-way (`[(open)]`).
 */
@Directive({
  selector: 'details[vdAccordionItem]',
  host: {
    class: 'vd-accordion__item',
    '[attr.name]': 'groupName()',
    '[open]': 'isOpen()',
    '(toggle)': 'onToggle($event)',
  },
})
export class VdAccordionItem {
  readonly open = input(false, { transform: booleanAttribute });
  readonly openChange = output<boolean>();
  /** Follows the input, and the browser's own toggles in between. */
  protected readonly isOpen = linkedSignal(() => this.open());

  private readonly group = inject(VdAccordion, { optional: true });
  protected readonly groupName = computed(() => (this.group?.exclusive() ? this.group.name : null));

  protected onToggle(event: Event): void {
    // The browser toggles (summary click, find-in-page, exclusive siblings): mirror it.
    const open = (event.target as HTMLDetailsElement).open;
    if (open === this.isOpen()) return;
    this.isOpen.set(open);
    this.openChange.emit(open);
  }
}

export const VD_ACCORDION = [VdAccordion, VdAccordionItem] as const;
