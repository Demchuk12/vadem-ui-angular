# Tooltip

Status: stable · Pattern: [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) on Popover API + CSS anchor positioning

Short, plain-text hint for a control. Not for rich or interactive content (use a popover/menu).

## Anatomy

```html
<button aria-describedby="vd-tooltip-3" style="anchor-name: --vd-tooltip-3">Експорт</button>
<!-- appended to <body>, or to the nearest <dialog> so it isn't inert -->
<div class="vd-tooltip" id="vd-tooltip-3" role="tooltip" popover="manual"
     data-placement="top" style="position-anchor: --vd-tooltip-3">Завантажити CSV</div>
```

## Props

| Name                  | Type                                   | Default | Notes |
| --------------------- | -------------------------------------- | ------- | ----- |
| `vdTooltip`           | `string`                               | required | Text content. |
| `vdTooltipPlacement`  | `'top' \| 'bottom' \| 'start' \| 'end'` | `top`   | Logical sides; flips automatically when there's no room (`position-try-fallbacks`). |
| `vdTooltipDelay`      | `number` (ms)                          | `500`   | Hover delay. Keyboard focus shows immediately. |

## Behavior

| Trigger | Result |
| ------- | ------ |
| Pointer enters trigger (mouse/pen) | Shows after the delay; instantly if another tooltip closed < 600ms ago ("warm") |
| Pointer leaves trigger | Hides after 120ms grace, unless the pointer moved onto the tooltip (hoverable, WCAG 1.4.13) |
| Keyboard focus (`:focus-visible`) | Shows immediately; hides on blur |
| `Escape` | Hides; focus stays (dismissible, WCAG 1.4.13) |
| Press on trigger | Hides |
| Touch | Never shows - don't put essential information in tooltips |

## States

`:popover-open` - fade + 4px slide from the anchor side; geometry lives on the base rule.

## ARIA contract

- `role="tooltip"` + `id` on the tooltip (component).
- Trigger with its own accessible name: `aria-describedby` -> tooltip. Trigger without one
  (icon-only): `aria-labelledby` -> tooltip, so the tooltip *is* its name (component).

## Component tokens

`--vd-tooltip-bg` (`--vd-color-surface-strong`, dark in both themes), `--vd-tooltip-fg`,
`--vd-tooltip-offset`, `--vd-tooltip-shift`, `--vd-tooltip-max-width`.

## Core

`core/tooltip-controller.ts`: `new VdTooltipController(trigger, tooltipEl, { showDelay, hideDelay })`
with `show()`, `hide()`, `destroy()`; uses `showPopover()` / `hidePopover()`.

## Adapter notes

Angular: `[vdTooltip]` directive creates the element after render (browser only), sets
`anchor-name`/`position-anchor` inline with a unique name. Requires CSS anchor positioning
(Baseline 2026, see DECISIONS D2).
