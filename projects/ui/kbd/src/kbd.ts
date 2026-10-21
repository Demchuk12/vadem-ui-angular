import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { type VdPlatform, vdDetectPlatform, vdParseShortcut } from './core/shortcut';
import { vdTexts } from '@vadem/ui/locale';

/**
 * Keyboard shortcut with platform-aware symbols and spoken key names. Spec: specs/kbd.md
 */
@Component({
  selector: 'vd-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vd-kbd-host' },
  // Layout spacing comes from CSS gap; spoken separators are explicit interpolated spaces,
  // so template formatting never changes the result.
  template: `
    <kbd class="vd-kbd" [attr.data-platform]="resolvedPlatform()">
      @for (step of steps(); track $index; let lastStep = $last) {
        @for (key of step; track $index; let last = $last) {
          <kbd>
            @if (key.label === key.name) {
              {{ key.label }}
            } @else {
              <span aria-hidden="true">{{ key.label }}</span>
              <span class="vd-visually-hidden">{{ key.name }}</span>
            }
          </kbd>
          @if (!last) {
            <span class="vd-kbd__plus" aria-hidden="true">+</span>
            <span class="vd-visually-hidden">{{ ' ' }}</span>
          }
        }
        @if (!lastStep) {
          <span class="vd-kbd__then"
            >{{ ' ' }}<span class="vd-visually-hidden">{{ t().thenLabel }}</span
            >{{ ' ' }}</span
          >
        }
      }
    </kbd>
  `,
})
export class VdKbd {
  /** Keys joined with "+", sequence steps separated by spaces: "Mod+K", "G D". */
  readonly keys = input.required<string>();
  /** Spoken between steps of a sequence. */
  readonly thenLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('kbd', { thenLabel: this.thenLabel });

  /** "auto" detects the viewer's platform; set it to document one platform explicitly. */
  readonly platform = input<VdPlatform | 'auto'>('auto');

  /** Server rendering detects "other"; the browser corrects it after the first render. */
  private readonly detected = signal<VdPlatform>('other');
  readonly resolvedPlatform = computed(() => {
    const chosen = this.platform();
    return chosen === 'auto' ? this.detected() : chosen;
  });
  protected readonly steps = computed(() => vdParseShortcut(this.keys(), this.resolvedPlatform()));

  constructor() {
    const doc = inject(DOCUMENT);
    afterNextRender(() => this.detected.set(vdDetectPlatform(doc.defaultView?.navigator)));
  }
}
