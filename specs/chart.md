# Charts

Status: draft · Pattern: SVG figure with a data-table twin; method: dataviz (form, color, marks,
interaction, accessibility)

`vd-bar-chart`, `vd-line-chart` and `vd-sparkline` render data the application already has.
Values are plain numbers; text comes from `format` (default `Intl.NumberFormat` in the locale).

## Choosing a form

| Job | Use |
| --- | --- |
| One current value + change | Stat (`vd-stat`), optionally with a sparkline |
| Compare magnitude across categories | Bar chart, one series (accent); `highlight` for emphasis |
| Distinct series side by side | Bar chart, grouped (2–8 series, categorical palette) |
| Part-to-whole | Bar chart, `stacked` (no donut: angles compare worse than lengths) |
| Trend over ordered categories | Line chart; one series gets an area wash |
| Long category names | Bar chart, `orientation="horizontal"` |

Never two value axes. Two measures of different scale are two charts.

## Anatomy

```html
<vd-bar-chart class="vd-bar-chart" data-orientation="vertical">
  <vd-chart-frame class="vd-chart">
    <figure class="vd-chart__figure" aria-labelledby="title-id" [aria-busy] [data-loading]>
      <figcaption class="vd-chart__head">
        <span class="vd-chart__title" id="title-id">Запити до API</span>
        <span class="vd-chart__description">Тисячі запитів за день</span>
      </figcaption>
      <div class="vd-chart__toolbar">
        <ul class="vd-chart__legend">…</ul>                 <!-- 2+ series only -->
        <button class="vd-chart__table-toggle" aria-pressed aria-controls="table-id">Таблиця даних</button>
      </div>
      <div class="vd-chart__plot">                          <!-- LTR geometry -->
        <svg role="group" aria-labelledby="title-id">
          <g class="vd-chart__grid" aria-hidden="true" />   <!-- hairline solid grid + ticks -->
          <g class="vd-chart__marks" aria-hidden="true" />  <!-- bars / lines / dots -->
          <g class="vd-chart__axis" aria-hidden="true" />   <!-- category labels, thinned -->
          <g class="vd-chart__hits">                        <!-- one rect per category -->
            <rect role="img" tabindex="0|-1" aria-label="Пн: Запити 4,2" data-index="0" />
          </g>
        </svg>
        <div class="vd-chart__tooltip" aria-hidden="true" data-side="start|end">…</div>
      </div>
      <div class="vd-chart__table-wrap" role="region" id="table-id">  <!-- when toggled -->
        <table class="vd-chart__table">…</table>
      </div>
    </figure>
  </vd-chart-frame>
</vd-bar-chart>
```

## Props

| Name | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| title | string | required | Figure name (not left as a native `title` tooltip on the host) |
| description | string | — | Caption: unit, period |
| categories | `string[]` | `[]` | Full labels; the axis thins them, tooltip and table keep all |
| series | `{ name, values: (number \| null)[] }[]` | `[]` | `null` = missing: a gap, a dash in the table |
| height | number (px) | 240 | Includes the category axis band |
| format | `(n) => string` | Intl in locale | Tooltip, labels, table |
| axisFormat | `(n) => string` | compact Intl | Ticks (0 / 2,5K / 5K) |
| categoryLabel | string | locale: `chart.categoryLabel` | Table's first column header |
| tableLabel | string | locale: `chart.tableLabel` | Toggle name |
| loading | boolean | false | Refetch: previous render muted, `aria-busy`; nothing is destroyed |
| orientation (bar) | `'vertical' \| 'horizontal'` | vertical | |
| stacked (bar) | boolean | false | Positives stack up, negatives down |
| highlight (bar) | `number \| 'max' \| null` | null | Emphasis, one series only: the rest is muted |
| area (line) | boolean | true | Area wash under a single series |
| values, label (sparkline) | `number[]`, string | required label | `role="img"`, spoken summary (locale `chart.trendSummary`) |

## Color

One series uses the accent. Several use `--vd-color-chart-1..8` in order, never cycled; an
entity keeps its slot when others are filtered out (pass series in a stable order). The palette
is validated for color-vision deficiency in both themes (D106). Slot 4 is 2.3:1 on the light
surface, which the always-present legend and data table relieve. Text never takes a series
color: values, labels and legends use text tokens; identity sits in the key beside the text.

## Marks

Bars at most 24px thick with a 4px rounded data end and a square baseline; 2px surface gaps
between grouped bars and stacked segments. Lines 2px with round joins; dots 8px with a 2px
surface ring. Grid lines are 1px solid in the border color; zero is a step stronger. Category
labels are thinned so they never overlap; horizontal bars reserve up to 40% for names.
Lines get direct end labels for 2–4 series; labels that would collide are dropped (the legend
still names every series).

## Interaction

| Input | Result |
| ----- | ------ |
| Pointer over the plot | Nearest category highlighted (band behind bars, crosshair on lines), tooltip |
| Tab | One stop per chart (the current category) |
| Arrow keys, Home, End | Move between categories; tooltip follows focus |
| Leaving | Tooltip hides |
| Table toggle | Swaps the plot for a data table (`aria-pressed`), the same values in full |

Tooltips list every series at that category, value first (strong) then name (muted), keyed by a
short line. They are visual only (`aria-hidden`); the focused category's accessible name carries
the same values, and the table carries all of them.

## Accessibility

Figure named by its title; plot `role="group"`; each category a focusable `role="img"` with its
values. The data table is the full equivalent and keeps its state across refetches. Missing
values read as "—", never as zero. Plot geometry stays LTR in RTL pages (like numbers); text,
legend and toolbar follow the page. Reduced motion: no animation is used. Forced colors: series
hues are kept (`forced-color-adjust: none`) while legend and table carry identity as text.

## Component tokens

`--vd-chart-surface` (gaps, rings) → color-surface; `--vd-chart-grid` → color-border;
`--vd-chart-axis` → color-text-muted; `--vd-chart-band` → color-fill; `--vd-chart-crosshair` →
color-border-strong; `--vd-chart-area-opacity` 0.12; `--vd-sparkline-ink` → color-text-subtle;
`--vd-sparkline-block-size` → space-8.

## Adapter notes

Core (`core/chart-math.ts`, no Angular): `linearScale`, `niceTicks`, `bands`, `nearestIndex`,
`stack`, `extent`, `barPath`, `linePath`, `areaPath`. Angular: `@vadem/ui/chart` exports
`VdBarChart`, `VdLineChart`, `VdSparkline` and the frame.
