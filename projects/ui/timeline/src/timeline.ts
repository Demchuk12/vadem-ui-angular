import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';

export type VdTimelineStatus = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const STATUS: Record<VdTimelineStatus, { label: string; icon: VdIconName | null }> = {
  neutral: { label: 'Event', icon: null },
  success: { label: 'Completed', icon: 'check' },
  warning: { label: 'Attention required', icon: 'alert-triangle' },
  danger: { label: 'Error', icon: 'x' },
  info: { label: 'Update', icon: 'info' },
};

/** Named chronological list; consumers own ordering and timestamps. */
@Directive({
  selector: 'ol[vdTimeline]',
  host: { class: 'vd-timeline', role: 'list', '[attr.aria-label]': 't().label' },
})
export class VdTimeline {
  readonly label = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('timeline', { label: this.label });
}

/** Native list item with a decorative marker and visible localized status text. */
@Component({
  // Native li preserves list semantics without adding a wrapper between ol and li.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[vdTimelineItem]',
  imports: [VdIcon],
  template: `
    <span class="vd-timeline-item__marker" aria-hidden="true">
      @if (icon(); as name) {
        <vd-icon [name]="name" />
      } @else {
        <span class="vd-timeline-item__dot"></span>
      }
    </span>
    <div class="vd-timeline-item__content">
      <div class="vd-timeline-item__meta">
        <ng-content select="[vdTimelineTime]" />
        <span class="vd-timeline-item__status">{{ resolvedLabel() }}</span>
      </div>
      <ng-content select="[vdTimelineTitle]" />
      <ng-content select="[vdTimelineDescription]" />
      <ng-content />
    </div>
  `,
  host: { class: 'vd-timeline-item', '[attr.data-status]': 'status()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdTimelineItem {
  readonly status = input<VdTimelineStatus>('neutral');
  readonly statusLabel = input<string>();
  protected readonly icon = computed(() => STATUS[this.status()].icon);
  protected readonly resolvedLabel = computed(
    () => this.statusLabel()?.trim() || STATUS[this.status()].label,
  );
}

/** Keep the consumer's heading level and any native link semantics. */
@Directive({ selector: '[vdTimelineTitle]', host: { class: 'vd-timeline-item__title' } })
export class VdTimelineTitle {}

@Directive({
  selector: '[vdTimelineDescription]',
  host: { class: 'vd-timeline-item__description' },
})
export class VdTimelineDescription {}

/** Native datetime and localized text are supplied by the consumer. */
@Directive({ selector: 'time[vdTimelineTime]', host: { class: 'vd-timeline-item__time' } })
export class VdTimelineTime {}

export const VD_TIMELINE = [
  VdTimeline,
  VdTimelineItem,
  VdTimelineTitle,
  VdTimelineDescription,
  VdTimelineTime,
] as const;
