import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { VdButton } from '@vadem/ui/button';
import { vdUniqueId } from '@vadem/ui/field';
import { VD_LOCALE, vdTexts } from '@vadem/ui/locale';
import type { VdChartSeries } from './core/chart-math';

export type VdChartKind = 'bar' | 'line';

/** Formats a value for tooltips and the table (full precision, locale-aware). */
export type VdChartFormat = (value: number) => string;

/** Series identity: slot 1..8 for categorical, "accent" for a single series. */
export function seriesSlot(index: number, count: number): string {
  return count === 1 ? 'accent' : String((index % 8) + 1);
}

/**
 * Shared chart chrome: figure with title, legend (2+ series), data-table toggle, tooltip and
 * plot measurement. Charts project their SVG into it. Spec: specs/chart.md
 */
@Component({
  selector: 'vd-chart-frame',
  imports: [VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'vd-chart' },
  template: `
    <figure
      class="vd-chart__figure"
      [attr.aria-labelledby]="titleId"
      [attr.aria-busy]="loading() || null"
      [attr.data-loading]="loading() ? '' : null"
    >
      <figcaption class="vd-chart__head">
        <span class="vd-chart__title" [id]="titleId">{{ title() }}</span>
        @if (description()) {
          <span class="vd-chart__description">{{ description() }}</span>
        }
      </figcaption>
      <div class="vd-chart__toolbar">
        @if (series().length > 1) {
          <ul class="vd-chart__legend" role="list">
            @for (s of series(); track $index) {
              <li class="vd-chart__legend-item">
                <span
                  class="vd-chart__key"
                  aria-hidden="true"
                  [attr.data-series]="slot($index)"
                  [attr.data-kind]="kind()"
                ></span>
                {{ s.name }}
              </li>
            }
          </ul>
        }
        <button
          vdButton
          type="button"
          variant="ghost"
          size="sm"
          class="vd-chart__table-toggle"
          [attr.aria-pressed]="tableShown()"
          [attr.aria-controls]="tableId"
          (click)="tableShown.set(!tableShown())"
        >
          {{ t().tableLabel }}
        </button>
      </div>

      <div #plot class="vd-chart__plot" [hidden]="tableShown()" (pointerleave)="leave()">
        <ng-content />
        @if (active() >= 0 && tooltipX() !== null) {
          <div
            class="vd-chart__tooltip"
            role="presentation"
            aria-hidden="true"
            [attr.data-side]="tooltipSide()"
            [style.--vd-chart-tip-x.px]="tooltipX()"
            [style.--vd-chart-tip-y.px]="tooltipY()"
          >
            <span class="vd-chart__tooltip-category" dir="auto">{{ categories()[active()] }}</span>
            @for (s of series(); track $index) {
              <span class="vd-chart__tooltip-row">
                <span
                  class="vd-chart__key"
                  [attr.data-series]="slot($index)"
                  data-kind="line"
                ></span>
                <strong class="vd-chart__tooltip-value">{{ valueText(s.values[active()]) }}</strong>
                <span class="vd-chart__tooltip-name" dir="auto">{{ s.name }}</span>
              </span>
            }
          </div>
        }
      </div>

      <div
        class="vd-chart__table-wrap"
        role="region"
        tabindex="0"
        [id]="tableId"
        [attr.aria-labelledby]="titleId"
        [hidden]="!tableShown()"
      >
        @if (tableShown()) {
          <table class="vd-chart__table">
            <thead>
              <tr>
                <th scope="col">{{ t().categoryLabel }}</th>
                @for (s of series(); track $index) {
                  <th scope="col">{{ s.name }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (c of categories(); track $index; let i = $index) {
                <tr>
                  <th scope="row">{{ c }}</th>
                  @for (s of series(); track $index) {
                    <td>{{ valueText(s.values[i]) }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </figure>
  `,
})
export class VdChartFrame {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly categories = input<readonly string[]>([]);
  readonly series = input<readonly VdChartSeries[]>([]);
  readonly kind = input<VdChartKind>('bar');
  readonly format = input<VdChartFormat>();
  readonly categoryLabel = input<string>();
  /** Highlighted category, driven by the chart (pointer or keyboard). */
  readonly active = input(-1);
  /** Tooltip anchor in plot pixels; null hides it. */
  readonly tooltipX = input<number | null>(null);
  readonly tooltipY = input(0);
  readonly tableLabel = input<string>();
  readonly loading = input(false);

  protected readonly t = vdTexts('chart', {
    tableLabel: this.tableLabel,
    categoryLabel: this.categoryLabel,
  });
  private readonly locale = inject(VD_LOCALE);
  readonly titleId = vdUniqueId('vd-chart-title');
  readonly tableId = vdUniqueId('vd-chart-table');
  readonly tableShown = signal(false);
  /** Measured plot width in CSS pixels (0 until the browser lays it out). */
  readonly width = signal(0);
  /** Fired when the pointer leaves the plot; charts clear their highlight. */
  readonly pointerLeave = output<void>();

  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly numberFormat = computed(() => new Intl.NumberFormat(this.locale.code));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.plot().nativeElement;
      const view = el.ownerDocument.defaultView;
      const measure = () => this.width.set(el.clientWidth);
      measure();
      if (!view?.ResizeObserver) return;
      const observer = new view.ResizeObserver(measure);
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected slot(index: number): string {
    return seriesSlot(index, this.series().length);
  }

  valueText(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    return (this.format() ?? ((v: number) => this.numberFormat().format(v)))(value);
  }

  protected leave(): void {
    this.pointerLeave.emit();
  }

  /** The tooltip sits on the roomier side of its anchor. */
  protected readonly tooltipSide = computed(() =>
    (this.tooltipX() ?? 0) > this.width() / 2 ? 'start' : 'end',
  );
}
