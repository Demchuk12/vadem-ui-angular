import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { VD_LOCALE, vdTexts } from '@vadem/ui/locale';
import { vdAreaPath, vdLinePath, vdLinearScale, type VdPoint } from './core/chart-math';
import type { VdChartFormat } from './chart-frame';

/** Fixed drawing box; the SVG scales to its container without distorting strokes. */
const W = 120;
const H = 32;
const INSET = 4;

/**
 * Word-sized trend: line in the de-emphasis ink, current (last) point in the accent.
 * A single image with a spoken summary. Spec: specs/chart.md
 */
@Component({
  selector: 'vd-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vd-sparkline' },
  template: `
    <svg
      class="vd-sparkline__svg"
      [attr.viewBox]="'0 0 ' + W + ' ' + H"
      preserveAspectRatio="none"
      role="img"
      [attr.aria-label]="summary()"
    >
      <path class="vd-sparkline__area" [attr.d]="area()" />
      <path class="vd-sparkline__line" [attr.d]="line()" vector-effect="non-scaling-stroke" />
    </svg>
    @if (last(); as p) {
      <span
        class="vd-sparkline__dot"
        aria-hidden="true"
        [style.--vd-sparkline-x.%]="(p[0] / W) * 100"
        [style.--vd-sparkline-y.%]="(p[1] / H) * 100"
      ></span>
    }
  `,
})
export class VdSparkline {
  readonly values = input<readonly (number | null)[]>([]);
  /** What the trend shows, e.g. "Дохід за 12 тижнів". */
  readonly label = input.required<string>();
  readonly format = input<VdChartFormat>();
  readonly trendSummary =
    input<(first: string, last: string, min: string, max: string) => string>();

  protected readonly W = W;
  protected readonly H = H;
  protected readonly t = vdTexts('chart', { trendSummary: this.trendSummary });
  private readonly locale = inject(VD_LOCALE);

  private readonly numbers = computed(() =>
    this.values().filter((v): v is number => v !== null && Number.isFinite(v)),
  );

  private readonly points = computed<VdPoint[]>(() => {
    const values = this.values();
    const nums = this.numbers();
    if (!nums.length) return [];
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const y = vdLinearScale(min === max ? [min - 1, max + 1] : [min, max], [H - INSET, INSET]);
    const n = values.length;
    return values.map((v, i) =>
      v === null || !Number.isFinite(v) ? null : [n > 1 ? (i * W) / (n - 1) : W / 2, y(v)],
    );
  });

  protected readonly line = computed(() => vdLinePath(this.points()));
  protected readonly area = computed(() => vdAreaPath(this.points(), H));
  protected readonly last = computed(() => [...this.points()].reverse().find((p) => p) ?? null);

  protected readonly summary = computed(() => {
    const nums = this.numbers();
    if (!nums.length) return this.label();
    const fmt = this.format() ?? ((v: number) => new Intl.NumberFormat(this.locale.code).format(v));
    const text = this.t().trendSummary(
      fmt(nums[0]),
      fmt(nums[nums.length - 1]),
      fmt(Math.min(...nums)),
      fmt(Math.max(...nums)),
    );
    return `${this.label()}: ${text}`;
  });
}
