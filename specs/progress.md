# Progress, progress ring and meter

Status: draft · Pattern: native `<progress>` and `<meter>`

- **Progress**: completion of a task (upload, import, onboarding steps). Indeterminate when the
  amount is unknown.
- **Meter**: a scalar within a known range (quota used, disk, password strength). Not progress.

## Anatomy

```html
<label for="up">Завантаження звіту</label>
<progress id="up" class="vd-progress" data-size="md" data-variant="accent" value="40" max="100">
  40%
</progress>

<meter
  class="vd-meter"
  aria-label="Квота"
  min="0"
  max="100"
  low="70"
  high="90"
  optimum="0"
  value="72"
></meter>
```

## Props

| Part                   | Inputs                                                                          | Notes                                              |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| `progress[vdProgress]` | `size: 'sm' \| 'md'`, `variant: 'accent' \| 'success' \| 'warning' \| 'danger'` | `value`/`max` native; no `value` = indeterminate.  |
| `meter[vdMeter]`       | `size`                                                                          | `min`/`max`/`low`/`high`/`optimum`/`value` native. |

Meter color comes from the native region: optimum -> accent, sub-optimum -> warning,
worst -> danger. Example quota: `low=70 high=90 optimum=0` - up to 70 accent, 70-90 warning,
above 90 danger.

Height 8px (`md`) / 4px (`sm`), pill radius, track `--vd-color-fill-hover`. Value text (e.g.
"72%") is rendered by the consumer next to it.

## States

Determinate, indeterminate (`:indeterminate`: a sweeping segment; under reduced motion a steady
half-tone bar), meter regions. Value changes animate the fill width (WebKit/Blink).

## ARIA contract

- Native roles (`progressbar`, `meter`) and values come from the elements.
- Name: `<label for>` or `aria-label`/`aria-labelledby` - required.
- Long tasks: announce milestones/completion separately (e.g. a toast or `role="status"`);
  value changes are not reliably announced.
- Text fallback inside `<progress>` is optional; the value is exposed natively.

## Component tokens

`--vd-progress-height`, `--vd-progress-radius`, `--vd-progress-track`, `--vd-progress-fill`.

## Adapter notes

Angular: attribute directives on the native elements. React/Vue: same markup and classes.
Styling uses `::-webkit-progress-*`, `::-moz-progress-bar`, `::-webkit-meter-*`,
`::-moz-meter-bar` (+ `:-moz-meter-*` regions), in separate rules per engine.

## Progress ring

`<vd-progress-ring>`: circular progress. Without `value` it is the library's spinner
(indeterminate); with `value` it shows completion.

```html
<vd-progress-ring
  class="vd-progress-ring"
  role="progressbar"
  aria-label="Імпорт"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="40"
  data-size="lg"
  data-variant="accent"
  style="--vd-progress-ring-value: 40"
>
  <svg class="vd-progress-ring__svg" aria-hidden="true">track + indicator circles</svg>
  <span class="vd-progress-ring__value" aria-hidden="true">40%</span>
</vd-progress-ring>
```

| Name      | Type                                             | Default                      | Notes                                        |
| --------- | ------------------------------------------------ | ---------------------------- | -------------------------------------------- |
| value     | `number \| null`                                 | `null`                       | Empty = indeterminate; clamped to 0..max     |
| max       | `number`                                         | `100`                        |                                              |
| size      | `'sm' \| 'md' \| 'lg'`                           | `md`                         | 16 / 24 / 64 px; sm fits inline text         |
| variant   | `'accent' \| 'success' \| 'warning' \| 'danger'` | `accent`                     | Same as linear progress                      |
| showValue | `boolean`                                        | `false`                      | Percentage in the centre, size lg only       |
| label     | `string`                                         | locale: `progressRing.label` | Accessible name ("Loading" / "Завантаження") |

States: determinate → `aria-valuenow` (min/max set); indeterminate → `data-indeterminate`, no
value attributes (ARIA indeterminate progressbar). Zero shows the bare track. The ring fills
clockwise from 12 o'clock and counter-clockwise in RTL.

Motion: the indeterminate arc spins with `--vd-duration-spin`. Under reduced motion nothing
moves: the ring becomes a dashed, half-strength circle, which reads as waiting and cannot be
mistaken for a partial value; determinate changes jump without transition. Pair a spinner with
visible text when the wait is long ("Збереження змін…"), inside a `role="status"` region if the
start of loading should be announced.

Tokens: `--vd-progress-ring-size` (space-4 / space-6 / space-16), `--vd-progress-ring-stroke`
(viewBox units, thinner at larger sizes), `--vd-progress-ring-track` → color-fill-hover,
`--vd-progress-ring-fill` → color-action (variant colors as linear progress). Forced colors:
track GrayText, indicator Highlight.
