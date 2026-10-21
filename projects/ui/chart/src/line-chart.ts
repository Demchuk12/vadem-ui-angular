import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { vdAreaPath, vdExtent, vdLinePath, type VdPoint } from './core/chart-math';
import { VdChartBase } from './chart-base';
import { VdChartFrame } from './chart-frame';

const PAD = 12;
const AXIS_BAND = 22;
/** Direct end labels only while they stay sparing (dataviz: <= 4 series). */
const MAX_END_LABELS = 4;
const END_LABEL_GAP = 14;

/**
 * Line chart for trends over ordered categories. One series gets a soft area wash; several use
 * the categorical palette with a legend and direct end labels. Spec: specs/chart.md
 */
@Component({
  selector: 'vd-line-chart',
  imports: [VdChartFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // The `title` input would otherwise also stay as a native tooltip on the host.
    '[attr.title]': 'null',
    class: 'vd-line-chart',
  },
  template: `
    <vd-chart-frame
      kind="line"
      [title]="title()"
      [description]="description()"
      [categories]="categories()"
      [series]="series()"
      [format]="format()"
      [categoryLabel]="categoryLabel()"
      [loading]="loading()"
      [active]="active()"
      [tooltipX]="tooltip()?.x ?? null"
      [tooltipY]="tooltip()?.y ?? 0"
      (pointerLeave)="active.set(-1)"
    >
      @if (width() > 0) {
        <svg
          class="vd-chart__svg"
          [attr.width]="width()"
          [attr.height]="height()"
          [attr.viewBox]="'0 0 ' + width() + ' ' + height()"
          role="group"
          [attr.aria-labelledby]="frame().titleId"
          (pointermove)="onPointer($event)"
        >
          <g class="vd-chart__grid" aria-hidden="true">
            @for (t of tickMarks(); track t.value) {
              <line
                [attr.x1]="box().x0"
                [attr.x2]="box().x1"
                [attr.y1]="t.y"
                [attr.y2]="t.y"
                [attr.data-zero]="t.value === 0 ? '' : null"
              />
              <text
                [attr.x]="box().x0 - 6"
                [attr.y]="t.y"
                text-anchor="end"
                dominant-baseline="middle"
              >
                {{ tickText(t.value) }}
              </text>
            }
          </g>
          <g class="vd-chart__marks" aria-hidden="true">
            @if (showArea()) {
              <path class="vd-chart__area" [attr.d]="areaD()" [attr.data-series]="slot(0)" />
            }
            @for (l of lines(); track $index) {
              <path class="vd-chart__line" [attr.d]="l" [attr.data-series]="slot($index)" />
            }
            @if (active() >= 0) {
              <line
                class="vd-chart__crosshair"
                [attr.x1]="xs()[active()]"
                [attr.x2]="xs()[active()]"
                [attr.y1]="box().y0"
                [attr.y2]="box().y1"
              />
            }
            @for (d of dots(); track $index) {
              <circle
                class="vd-chart__dot"
                [attr.cx]="d.x"
                [attr.cy]="d.y"
                r="4"
                [attr.data-series]="slot(d.series)"
              />
            }
          </g>
          <g class="vd-chart__end-labels" aria-hidden="true">
            @for (e of endLabels(); track e.series) {
              <text [attr.x]="e.x" [attr.y]="e.y" dominant-baseline="middle">
                {{ series()[e.series].name }}
              </text>
            }
          </g>
          <g class="vd-chart__axis" aria-hidden="true">
            @for (c of categoryTicks(); track c.index) {
              <text
                [attr.x]="c.x"
                [attr.y]="box().y1 + 13"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {{ categories()[c.index] }}
              </text>
            }
          </g>
          <g class="vd-chart__hits">
            @for (x of xs(); track $index; let i = $index) {
              <rect
                class="vd-chart__hit"
                rx="6"
                role="img"
                [attr.data-index]="i"
                [attr.tabindex]="i === focusIndex() ? 0 : -1"
                [attr.aria-label]="pointLabel(i)"
                [attr.x]="x - step() / 2"
                [attr.y]="box().y0"
                [attr.width]="step()"
                [attr.height]="box().y1 - box().y0"
                (focus)="onFocus(i)"
                (blur)="onBlur($event)"
                (keydown)="onKeydown($event, i)"
              />
            }
          </g>
        </svg>
      }
    </vd-chart-frame>
  `,
})
export class VdLineChart extends VdChartBase {
  /** Soft area under a single series; ignored with several series. */
  readonly area = input(true, { transform: booleanAttribute });

  protected readonly stackedValues = () => false;
  protected extentOf() {
    return vdExtent(this.series(), this.count(), false);
  }

  protected readonly showArea = computed(() => this.area() && this.series().length === 1);
  private readonly labelled = computed(
    () => this.series().length > 1 && this.series().length <= MAX_END_LABELS,
  );

  protected readonly box = computed(() => {
    const longest = Math.max(...this.series().map((s) => s.name.length), 0);
    const end = this.labelled() ? Math.min(longest * 6.8 + END_LABEL_GAP, this.width() * 0.3) : PAD;
    return { x0: this.tickWidth(), x1: this.width() - end, y0: PAD, y1: this.height() - AXIS_BAND };
  });

  private readonly scale = computed(() => this.valueScale([this.box().y1, this.box().y0]));

  /** Point positions: first and last categories sit on the plot edges. */
  protected readonly xs = computed(() => {
    const { x0, x1 } = this.box();
    const n = this.count();
    if (n <= 1) return [(x0 + x1) / 2];
    return Array.from({ length: n }, (_, i) => x0 + (i * (x1 - x0)) / (n - 1));
  });
  protected readonly step = computed(() => {
    const xs = this.xs();
    return xs.length > 1 ? xs[1] - xs[0] : this.box().x1 - this.box().x0;
  });

  private readonly points = computed(() =>
    this.series().map((s) =>
      this.xs().map((x, i): VdPoint => {
        const v = s.values[i];
        return v === null || v === undefined || !Number.isFinite(v) ? null : [x, this.scale()(v)];
      }),
    ),
  );

  protected readonly lines = computed(() => this.points().map((p) => vdLinePath(p)));
  protected readonly areaD = computed(() => vdAreaPath(this.points()[0] ?? [], this.scale()(0)));

  protected readonly tickMarks = computed(() =>
    this.ticks().map((value) => ({ value, y: this.scale()(value) })),
  );

  protected readonly categoryTicks = computed(() => {
    const every = this.labelEvery(this.box().x1 - this.box().x0);
    return this.xs()
      .map((x, index) => ({ index, x }))
      .filter((c) => c.index % every === 0 || c.index === this.count() - 1)
      .filter((c, i, all) => i === all.length - 1 || all[all.length - 1].index - c.index >= every);
  });

  /** Active point of every series, else the last point (current period). */
  protected readonly dots = computed(() => {
    const at = this.active() >= 0 ? this.active() : this.count() - 1;
    return this.points().flatMap((p, series) => {
      const point = p[at];
      return point ? [{ x: point[0], y: point[1], series }] : [];
    });
  });

  /** Names at line ends; labels that would collide fall back to the legend. */
  protected readonly endLabels = computed(() => {
    if (!this.labelled()) return [];
    const x = this.box().x1 + 8;
    const placed: { series: number; x: number; y: number }[] = [];
    this.points()
      .map((p, series) => ({ series, y: [...p].reverse().find((q) => q)?.[1] }))
      .filter((e): e is { series: number; y: number } => e.y !== undefined)
      .sort((a, b) => a.y - b.y)
      .forEach((e) => {
        if (placed.every((p) => Math.abs(p.y - e.y) >= 14)) placed.push({ ...e, x });
      });
    return placed;
  });

  protected readonly tooltip = computed(() => {
    const x = this.xs()[this.active()];
    return x === undefined ? null : { x, y: this.box().y0 };
  });

  protected onPointer(event: PointerEvent): void {
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const { x0, x1 } = this.box();
    const half = this.step() / 2;
    this.pointerAt(event.clientX - rect.left, [x0 - half, x1 + half]);
  }
}
