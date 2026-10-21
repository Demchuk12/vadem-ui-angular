import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { VD_DIRECTIONAL_ICONS, VD_ICONS, VdIconName } from './core/icons';

/**
 * Inline SVG icon from the Vadem set. Decorative by default (hidden from assistive tech);
 * pass `label` when the icon carries meaning on its own.
 */
@Component({
  selector: 'vd-icon',
  template: `
    <svg
      class="vd-icon__svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
      aria-hidden="true"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  host: {
    class: 'vd-icon',
    '[attr.data-name]': 'name()',
    '[attr.data-directional]': 'directional() ? "" : null',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdIcon {
  readonly name = input.required<VdIconName>();
  /** Accessible name. Omit for decorative icons next to visible text. */
  readonly label = input<string>();

  protected readonly paths = computed(() => VD_ICONS[this.name()]);
  protected readonly directional = computed(() => VD_DIRECTIONAL_ICONS.has(this.name()));
}
