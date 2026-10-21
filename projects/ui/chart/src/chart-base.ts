import {
  Directive,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { VD_LOCALE } from '@vadem/ui/locale';
import { vdLinearScale, vdNiceTicks, vdNearestIndex, type VdChartSeries } from './core/chart-math';
import { VdChartFrame, type VdChartFormat, seriesSlot } from './chart-frame';

/** Average glyph width of 12px UI text, used to reserve room for axis labels. */
const CHAR_PX = 6.8;
const AXIS_FONT_GAP = 8;

/**
 * Inputs, value scale and keyboard/pointer exploration shared by bar and line charts.
 * Rendering stays in each chart's template.
 */
@Directive()
export abstract class VdChartBase {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Category labels (x for columns and lines, y for horizontal bars). */
  readonly categories = input<readonly string[]>([]);
  readonly series = input<readonly VdChartSeries[]>([]);
  /** Plot height in pixels, including the category axis band. */
  readonly height = input(240, { transform: numberAttribute });
  /** Full value text for tooltips, labels and the table. Defaults to Intl in the locale. */
  readonly format = input<VdChartFormat>();
  /** Short value text for axis ticks. Defaults to compact Intl notation. */
  readonly axisFormat = input<VdChartFormat>();
  readonly categoryLabel = input<string>();
  /**
   * Refetching: keep the previous render, muted and `aria-busy`, so the table view, focus and
   * layout survive (dataviz: refetch keeps the frame, no skeleton).
   */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly frame = viewChild.required(VdChartFrame);
  /** Highlighted category (pointer or keyboard), -1 when none. */
  protected readonly active = signal(-1);
  /** Roving tab stop among category hit targets. */
  protected readonly focusIndex = signal(0);

  protected readonly count = computed(() => this.categories().length);
  protected readonly width = computed(() => this.frame().width());

  protected abstract readonly stackedValues: () => boolean;
  protected abstract extentOf(): readonly [number, number];

  protected readonly ticks = computed(() => {
    const [min, max] = this.extentOf();
    return vdNiceTicks(min, max, Math.max(2, Math.round(this.height() / 60)));
  });

  private readonly compact = computed(
    () =>
      new Intl.NumberFormat(this.localeCode(), { notation: 'compact', maximumFractionDigits: 1 }),
  );
  private readonly locale = inject(VD_LOCALE);
  protected localeCode(): string {
    return this.locale.code;
  }

  protected tickText(value: number): string {
    return (this.axisFormat() ?? ((v: number) => this.compact().format(v)))(value);
  }

  /** Room for the widest tick label. */
  protected readonly tickWidth = computed(
    () =>
      Math.max(...this.ticks().map((t) => this.tickText(t).length), 1) * CHAR_PX + AXIS_FONT_GAP,
  );
  protected readonly categoryWidth = computed(
    () => Math.max(...this.categories().map((c) => c.length), 1) * CHAR_PX + AXIS_FONT_GAP,
  );

  protected valueScale(range: readonly [number, number]) {
    const ticks = this.ticks();
    return vdLinearScale([ticks[0], ticks[ticks.length - 1]], range);
  }

  protected slot(index: number): string {
    return seriesSlot(index, this.series().length);
  }

  /** "Пн: Запити 4 200, Помилки 12" - the accessible name of one category. */
  protected pointLabel(index: number): string {
    const values = this.series()
      .map((s) => `${s.name} ${this.frame().valueText(s.values[index])}`)
      .join(', ');
    return `${this.categories()[index]}: ${values}`;
  }

  /** Every `k`-th category label so labels never overlap. */
  protected labelEvery(available: number): number {
    const per = this.categoryWidth();
    const fit = Math.max(1, Math.floor(available / per));
    return Math.max(1, Math.ceil(this.count() / fit));
  }

  protected pointerAt(position: number, range: readonly [number, number]): void {
    this.active.set(vdNearestIndex(position, this.count(), range));
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.count() - 1;
    const next =
      {
        ArrowRight: index + 1,
        ArrowDown: index + 1,
        ArrowLeft: index - 1,
        ArrowUp: index - 1,
        Home: 0,
        End: last,
      }[event.key] ?? null;
    if (next === null) return;
    event.preventDefault();
    const target = Math.min(last, Math.max(0, next));
    this.focusIndex.set(target);
    const hits = (event.currentTarget as Element).parentElement;
    (hits?.querySelector(`[data-index="${target}"]`) as SVGElement | null)?.focus();
  }

  protected onFocus(index: number): void {
    this.focusIndex.set(index);
    this.active.set(index);
  }

  protected onBlur(event: FocusEvent): void {
    const next = event.relatedTarget as Element | null;
    if (!next?.closest('.vd-chart__hits')) this.active.set(-1);
  }
}
