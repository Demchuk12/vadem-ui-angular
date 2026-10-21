import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { vdBands, vdBarPath, vdExtent, vdStack } from './core/chart-math';
import { VdChartBase } from './chart-base';
import { VdChartFrame } from './chart-frame';

export type VdBarOrientation = 'vertical' | 'horizontal';

/** Mark specs (dataviz): bars at most 24px thick, 4px rounded data end, 2px surface gap. */
const MAX_THICKNESS = 24;
const RADIUS = 4;
const GAP = 2;
const PAD = 8;
const AXIS_BAND = 22;

interface Mark {
  d: string;
  series: number;
  category: number;
}

/**
 * Bar / column chart: one series in the accent, several grouped or stacked in the categorical
 * palette. Spec: specs/chart.md
 */
@Component({
  selector: 'vd-bar-chart',
  imports: [VdChartFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // The `title` input would otherwise also stay as a native tooltip on the host.
    '[attr.title]': 'null',
    class: 'vd-bar-chart',
    '[attr.data-orientation]': 'orientation()',
  },
  template: `
    <vd-chart-frame
      kind="bar"
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
                [attr.x1]="t.x1"
                [attr.x2]="t.x2"
                [attr.y1]="t.y1"
                [attr.y2]="t.y2"
                [attr.data-zero]="t.value === 0 ? '' : null"
              />
              <text
                [attr.x]="t.tx"
                [attr.y]="t.ty"
                [attr.text-anchor]="t.anchor"
                dominant-baseline="middle"
              >
                {{ tickText(t.value) }}
              </text>
            }
          </g>
          @if (active() >= 0) {
            <rect
              class="vd-chart__band"
              aria-hidden="true"
              [attr.x]="bandRect().x"
              [attr.y]="bandRect().y"
              [attr.width]="bandRect().w"
              [attr.height]="bandRect().h"
              rx="4"
            />
          }
          <g class="vd-chart__marks" aria-hidden="true">
            @for (m of marks(); track $index) {
              <path
                class="vd-chart__bar"
                [attr.d]="m.d"
                [attr.data-series]="slot(m.series)"
                [attr.data-muted]="highlighted() >= 0 && m.category !== highlighted() ? '' : null"
              />
            }
          </g>
          <g class="vd-chart__axis" aria-hidden="true">
            @for (c of categoryTicks(); track c.index) {
              <text
                [attr.x]="c.x"
                [attr.y]="c.y"
                [attr.text-anchor]="c.anchor"
                dominant-baseline="middle"
              >
                {{ categories()[c.index] }}
              </text>
            }
          </g>
          <g class="vd-chart__hits">
            @for (h of hits(); track h.index) {
              <rect
                class="vd-chart__hit"
                rx="6"
                role="img"
                [attr.data-index]="h.index"
                [attr.tabindex]="h.index === focusIndex() ? 0 : -1"
                [attr.aria-label]="pointLabel(h.index)"
                [attr.x]="h.x"
                [attr.y]="h.y"
                [attr.width]="h.w"
                [attr.height]="h.h"
                (focus)="onFocus(h.index)"
                (blur)="onBlur($event)"
                (keydown)="onKeydown($event, h.index)"
              />
            }
          </g>
        </svg>
      }
    </vd-chart-frame>
  `,
})
export class VdBarChart extends VdChartBase {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Stack series (part-to-whole) instead of grouping them side by side. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /**
   * Emphasis form for a single series: keep one category in full colour and mute the rest.
   * `'max'` picks the largest value.
   */
  readonly highlight = input<number | 'max' | null>(null);

  protected readonly highlighted = computed(() => {
    const h = this.highlight();
    const values = this.series()[0]?.values ?? [];
    if (h === null || this.series().length !== 1) return -1;
    if (h !== 'max') return h;
    let best = -1;
    values.forEach((v, i) => {
      if (v !== null && Number.isFinite(v) && (best < 0 || v > (values[best] ?? -Infinity)))
        best = i;
    });
    return best;
  });

  protected readonly stackedValues = () => this.stacked();
  protected extentOf() {
    return vdExtent(this.series(), this.count(), this.stacked());
  }

  private readonly vertical = computed(() => this.orientation() === 'vertical');

  /** Plot box inside the SVG: [start, end] on each axis. */
  protected readonly box = computed(() => {
    const w = this.width();
    const h = this.height();
    if (this.vertical()) {
      return { x0: this.tickWidth(), x1: w - PAD, y0: PAD, y1: h - AXIS_BAND };
    }
    const labels = Math.min(this.categoryWidth(), w * 0.4);
    return { x0: labels, x1: w - PAD - this.tickWidth() / 2, y0: PAD, y1: h - AXIS_BAND };
  });

  private readonly scale = computed(() => {
    const b = this.box();
    return this.vertical() ? this.valueScale([b.y1, b.y0]) : this.valueScale([b.x0, b.x1]);
  });

  private readonly categoryRange = computed<[number, number]>(() => {
    const b = this.box();
    return this.vertical() ? [b.x0, b.x1] : [b.y0, b.y1];
  });

  private readonly bandList = computed(() => vdBands(this.count(), this.categoryRange()));

  protected readonly marks = computed<Mark[]>(() => {
    const series = this.series();
    const n = series.length;
    if (!n || !this.count()) return [];
    const scale = this.scale();
    const zero = scale(0);
    const orient = this.orientation();
    const marks: Mark[] = [];
    if (this.stacked()) {
      const segments = vdStack(series, this.count());
      // Rounded only on the outermost segment of each direction.
      const outer = this.bandList().map((_, c) => {
        let top = -1;
        let bottom = -1;
        segments.forEach((s, i) => {
          if (s[c].to > s[c].from) top = i;
          if (s[c].to < s[c].from) bottom = i;
        });
        return { top, bottom };
      });
      this.bandList().forEach((band, c) => {
        const thickness = Math.min(MAX_THICKNESS, band.step * 0.6);
        segments.forEach((s, i) => {
          const seg = s[c];
          if (seg.to === seg.from) return;
          const rounded = i === outer[c].top || i === outer[c].bottom;
          const from = scale(seg.from);
          const to = scale(seg.to);
          // 2px surface gap between stacked segments, taken from the far end.
          const dir = Math.sign(to - from);
          const end = rounded ? to : to - dir * GAP;
          marks.push({
            d: vdBarPath(band.center, thickness, from, end, rounded ? RADIUS : 0, orient),
            series: i,
            category: c,
          });
        });
      });
      return marks;
    }
    this.bandList().forEach((band, c) => {
      const thickness = Math.min(MAX_THICKNESS, (band.step * 0.7 - GAP * (n - 1)) / n);
      const group = thickness * n + GAP * (n - 1);
      series.forEach((s, i) => {
        const v = s.values[c];
        if (v === null || v === undefined || !Number.isFinite(v)) return;
        const center = band.center - group / 2 + thickness / 2 + i * (thickness + GAP);
        marks.push({
          d: vdBarPath(center, thickness, zero, scale(v), RADIUS, orient),
          series: i,
          category: c,
        });
      });
    });
    return marks;
  });

  protected readonly tickMarks = computed(() => {
    const b = this.box();
    const scale = this.scale();
    return this.ticks().map((value) =>
      this.vertical()
        ? {
            value,
            x1: b.x0,
            x2: b.x1,
            y1: scale(value),
            y2: scale(value),
            tx: b.x0 - 6,
            ty: scale(value),
            anchor: 'end',
          }
        : {
            value,
            x1: scale(value),
            x2: scale(value),
            y1: b.y0,
            y2: b.y1,
            tx: scale(value),
            ty: b.y1 + AXIS_BAND / 2 + 2,
            anchor: 'middle',
          },
    );
  });

  protected readonly categoryTicks = computed(() => {
    const b = this.box();
    const list = this.bandList();
    if (this.vertical()) {
      const every = this.labelEvery(b.x1 - b.x0);
      return list
        .map((band, index) => ({
          index,
          x: band.center,
          y: b.y1 + AXIS_BAND / 2 + 2,
          anchor: 'middle',
        }))
        .filter((c) => c.index % every === 0);
    }
    return list.map((band, index) => ({ index, x: b.x0 - 8, y: band.center, anchor: 'end' }));
  });

  /** Hit targets cover the whole band, bigger than the marks. */
  protected readonly hits = computed(() => {
    const b = this.box();
    return this.bandList().map((band, index) =>
      this.vertical()
        ? { index, x: band.start, y: b.y0, w: band.step, h: b.y1 - b.y0 }
        : { index, x: b.x0, y: band.start, w: b.x1 - b.x0, h: band.step },
    );
  });

  protected readonly bandRect = computed(() => {
    const hit = this.hits()[this.active()];
    if (!hit) return { x: 0, y: 0, w: 0, h: 0 };
    const inset = 2;
    return {
      x: hit.x + inset,
      y: hit.y + inset,
      w: Math.max(0, hit.w - inset * 2),
      h: Math.max(0, hit.h - inset * 2),
    };
  });

  protected readonly tooltip = computed(() => {
    const i = this.active();
    const band = this.bandList()[i];
    if (!band) return null;
    const b = this.box();
    return this.vertical()
      ? { x: band.center, y: b.y0 }
      : { x: b.x0 + (b.x1 - b.x0) / 2, y: band.center };
  });

  protected onPointer(event: PointerEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const pos = this.vertical() ? event.clientX - rect.left : event.clientY - rect.top;
    this.pointerAt(pos, this.categoryRange());
  }
}
