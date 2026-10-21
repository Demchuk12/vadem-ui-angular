# Tabs

Status: draft · Pattern: [APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

## Anatomy

```html
<div class="vd-tabs" data-variant="line" data-orientation="horizontal">
  <!-- vd-tabs -->
  <div class="vd-tabs__list" role="tablist" aria-label="..." aria-orientation="horizontal">
    <button
      class="vd-tabs__tab"
      role="tab"
      type="button"
      id="vd-tab-1"
      aria-selected="true"
      aria-controls="vd-tabpanel-1"
      tabindex="0"
      data-state="active"
    >
      Профіль
    </button>
    <button class="vd-tabs__tab" role="tab" aria-selected="false" tabindex="-1" disabled>
      ...
    </button>
  </div>
  <div
    class="vd-tabs__panel"
    role="tabpanel"
    id="vd-tabpanel-1"
    aria-labelledby="vd-tab-1"
    tabindex="0"
    data-state="active"
  >
    ...
  </div>
  <div class="vd-tabs__panel" role="tabpanel" hidden data-state="inactive">...</div>
</div>
```

## Props

| Part  | Name          | Type                         | Default       | Notes                                                                |
| ----- | ------------- | ---------------------------- | ------------- | -------------------------------------------------------------------- |
| tabs  | `value`       | `string \| undefined`        | first enabled | Two-way. Invalid/disabled values fall back to the first enabled tab. |
| tabs  | `variant`     | `'line' \| 'pill'`           | `line`        | `pill` = segmented control (concentric radii).                       |
| tabs  | `orientation` | `'horizontal' \| 'vertical'` | `horizontal`  |                                                                      |
| tabs  | `activation`  | `'automatic' \| 'manual'`    | `automatic`   | Manual when showing a panel is expensive.                            |
| tab   | `value`       | `string`                     | required      |                                                                      |
| tab   | `disabled`    | `boolean`                    | `false`       | Skipped by arrow keys.                                               |
| panel | `value`       | `string`                     | required      |                                                                      |

## Events

`valueChange` (two-way `value`).

## States

| State         | Reflected as                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------- |
| selected      | `aria-selected="true"`, `data-state="active"` - text color, indicator (line) / raised chip (pill) |
| hover         | `:hover` - text color (+ fill on line)                                                            |
| focus-visible | inset outline on the tab; panel outline when focused                                              |
| disabled      | `disabled` - reduced opacity                                                                      |
| overflow      | the tab list scrolls horizontally (no scrollbar); focus scrolls tabs into view                    |

## Keyboard

| Key                        | Action                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `Tab`                      | Into the tab list (selected tab), then into the panel                                   |
| `ArrowRight` / `ArrowLeft` | Next / previous enabled tab (mirrored in RTL), wraps. Vertical: `ArrowDown` / `ArrowUp` |
| `Home` / `End`             | First / last enabled tab                                                                |
| `Enter` / `Space`          | Select the focused tab (manual activation)                                              |

## ARIA contract

- `tablist` needs a name (`aria-label` / `aria-labelledby`) - consumer.
- Roles, `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`, roving
  `tabindex` - component.
- Panels are focusable (`tabindex="0"`) so content without focusable elements is reachable.

## Component tokens

Vertical tab lists and their panels can wrap onto separate rows in constrained containers.
List labels scroll locally when necessary; orientation and arrow-key behavior remain vertical.

`--vd-tabs-gap`, `--vd-tabs-tab-height`, `--vd-tabs-tab-padding`, `--vd-tabs-fg`,
`--vd-tabs-fg-hover`, `--vd-tabs-fg-active`, `--vd-tabs-indicator`, `--vd-tabs-indicator-size`,
`--vd-tabs-radius`.

## Core

`core/roving-keys.ts`: `vdRovingTarget(key, current, disabled[], { orientation, dir, loop })`
returns the index to focus, or `null` for unhandled keys; `vdIsActivationKey(key)`. Pure
functions, reused by future toolbars/segmented controls and other adapters.

## Adapter notes

Angular: `vd-tabs` + `[vdTabList]`, `button[vdTab]`, `[vdTabPanel]` (`VD_TABS`). Tabs register
with the container through DI; order is resolved from the DOM. Direction is read with
`:dir(rtl)`. React/Vue: context/provide-inject with the same registry and core functions.
