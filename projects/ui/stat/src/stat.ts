import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { VdBadge, type VdBadgeVariant } from '@vadem/ui/badge';
import { VdIcon } from '@vadem/ui/icon';
import { vdTexts } from '@vadem/ui/locale';
import { VdSkeleton } from '@vadem/ui/skeleton';

export type VdStatTrend = 'up' | 'down' | 'flat';
/** Whether the change is good news; defaults from the trend (up = positive). */
export type VdStatSentiment = 'positive' | 'negative' | 'neutral';
export type VdStatSize = 'sm' | 'md';

/** Hebrew and Arabic-script letters (incl. presentation forms). */
const RTL_LETTER = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

/**
 * A key figure: label, value, optional change and caption. Values arrive formatted by the
 * application (Intl). Spec: specs/stat.md
 */
@Component({
  selector: 'vd-stat',
  imports: [VdBadge, VdIcon, VdSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'vd-stat',
    '[attr.data-size]': 'size()',
    '[attr.data-sentiment]': 'delta() ? resolvedSentiment() : null',
    '[attr.aria-busy]': 'loading() || null',
  },
  template: `
    <dl class="vd-stat__list">
      <dt class="vd-stat__label">{{ label() }}</dt>
      @if (loading()) {
        <dd class="vd-stat__value"><span vdSkeleton class="vd-stat__skeleton-value"></span></dd>
        <dd class="vd-stat__meta">
          <span vdSkeleton size="sm" class="vd-stat__skeleton-meta"></span>
        </dd>
      } @else {
        <dd class="vd-stat__value">
          <bdi [attr.dir]="directionOf(value())">{{ value() }}</bdi>
        </dd>
        @if (delta() || caption()) {
          <dd class="vd-stat__meta">
            @if (delta()) {
              <span vdBadge class="vd-stat__delta" [variant]="badgeVariant()">
                @if (trend() !== 'flat') {
                  <vd-icon [name]="trend() === 'up' ? 'trending-up' : 'trending-down'" />
                }
                <span class="vd-visually-hidden">{{ trendName() }} </span>
                <bdi class="vd-stat__delta-value" [attr.dir]="directionOf(delta() ?? '')">{{
                  delta()
                }}</bdi>
              </span>
            }
            @if (caption()) {
              <span class="vd-stat__caption">{{ caption() }}</span>
            }
          </dd>
        }
      }
    </dl>
    <ng-content />
  `,
})
export class VdStat {
  readonly label = input.required<string>();
  /** Formatted value, e.g. "₴ 48 920". */
  readonly value = input<string>('');
  /** Formatted change, e.g. "+12,4%". */
  readonly delta = input<string>();
  readonly trend = input<VdStatTrend>('up');
  readonly sentiment = input<VdStatSentiment>();
  readonly caption = input<string>();
  readonly size = input<VdStatSize>('md');
  /** Placeholders while the figure loads; the label stays visible. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly increaseLabel = input<string>();
  readonly decreaseLabel = input<string>();
  readonly unchangedLabel = input<string>();

  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('stat', {
    increaseLabel: this.increaseLabel,
    decreaseLabel: this.decreaseLabel,
    unchangedLabel: this.unchangedLabel,
  });

  protected readonly resolvedSentiment = computed<VdStatSentiment>(() => {
    const explicit = this.sentiment();
    if (explicit) return explicit;
    return { up: 'positive', down: 'negative', flat: 'neutral' }[this.trend()] as VdStatSentiment;
  });

  /** The change uses the library's Badge, coloured by sentiment. */
  protected readonly badgeVariant = computed<VdBadgeVariant>(
    () =>
      ({ positive: 'success', negative: 'danger', neutral: 'neutral' })[
        this.resolvedSentiment()
      ] as VdBadgeVariant,
  );

  /**
   * Numbers and currency signs have no strong direction, so an isolated value would inherit the
   * page's RTL and reverse "₴ 48 920". Values with RTL letters ("48 ر.س") stay RTL.
   */
  protected directionOf(text: string): 'ltr' | 'rtl' {
    return RTL_LETTER.test(text) ? 'rtl' : 'ltr';
  }

  /** Direction in words: color and arrow are only extra cues. */
  protected readonly trendName = computed(() => {
    const t = this.t();
    return { up: t.increaseLabel, down: t.decreaseLabel, flat: t.unchangedLabel }[this.trend()];
  });
}
