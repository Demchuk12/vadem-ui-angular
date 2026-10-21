import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
} from '@angular/core';
import { vdInitials } from './core/initials';

export type VdAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * A person or team picture with an initials fallback (no image, or it failed to load).
 * Spec: specs/avatar.md
 */
@Component({
  selector: 'vd-avatar',
  template: `
    <span class="vd-avatar__initials" aria-hidden="true">{{ text() }}</span>
    @if (src() && !failed()) {
      <img
        class="vd-avatar__img"
        [src]="src()"
        alt=""
        loading="lazy"
        decoding="async"
        (error)="failed.set(true)"
      />
    }
  `,
  host: {
    class: 'vd-avatar',
    '[attr.data-size]': 'size()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : name()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdAvatar {
  /** Who it is: the accessible name and the source of the initials. */
  readonly name = input.required<string>();
  readonly src = input<string>();
  readonly size = input<VdAvatarSize>('md');
  /** Overrides the computed initials (e.g. "+3" in a group). */
  readonly initials = input<string>();
  /** Hide from assistive tech when the name is already shown next to the avatar. */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly text = computed(() => this.initials() ?? vdInitials(this.name()));
  /** Reset whenever the source changes. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
}

/** Overlapping stack of avatars. */
@Directive({ selector: '[vdAvatarGroup]', host: { class: 'vd-avatar-group', role: 'group' } })
export class VdAvatarGroup {}
