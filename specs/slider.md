# Slider

Status: draft · Pattern: native `<input type="range">`

Pick a number in a range where the exact value matters less than its position (volume,
opacity, a price filter). Show the value next to it; offer a number input when precision matters.

## Anatomy

```html
<input
  type="range"
  class="vd-slider"
  min="0"
  max="100"
  step="5"
  value="40"
  style="--vd-slider-fill: 40%"
/>
```

## Props

Native: `min`, `max`, `step`, `value`, `disabled`, `list` (datalist ticks, browser-styled).
Shared control inputs (`invalid`, `touched`, `required`, `id`); works inside `vd-field` (label
`for`, hint, error) and with every forms API through the native element.

The directive writes `--vd-slider-fill` (percent) after input and after every render (forms set
`value` without an event). Firefox paints the filled part natively (`::-moz-range-progress`).

## Keyboard

Native: arrows by `step`, PageUp/PageDown by larger steps, Home/End to min/max. RTL mirrors.

## States

| State         | Reflected as                                              |
| ------------- | --------------------------------------------------------- |
| filled range  | accent from the start to the thumb                        |
| focus-visible | 2px ring around the thumb (with a background-colored gap) |
| active        | thumb scales 1.1 (off under reduced motion)               |
| invalid       | `data-invalid` - danger range and thumb border            |
| disabled      | reduced opacity                                           |
| forced colors | native rendering                                          |

## ARIA contract

- Native `slider` role with value, min, max. Name from `vd-field` label or `aria-label`.
- If the number alone is unclear, set `aria-valuetext` (e.g. "40 відсотків", "₴ 1 200").

## Component tokens

`--vd-slider-track-size`, `--vd-slider-thumb-size`, `--vd-slider-track`, `--vd-slider-range`,
`--vd-slider-thumb-bg`, `--vd-slider-thumb-border`, `--vd-slider-ring`.

## Adapter notes

Angular: `input[type=range][vdSlider]`. React/Vue: same markup; set `--vd-slider-fill` from the
value (`vdSliderFill(value, min, max)`).
