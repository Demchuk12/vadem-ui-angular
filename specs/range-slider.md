# Range slider

Status: stable · Pattern: [APG multi-thumb slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/).

## Props and events

| Name                                               | Default           | Contract                                             |
| -------------------------------------------------- | ----------------- | ---------------------------------------------------- |
| value                                              | [25,75]           | Nullable readonly [lower,upper], two-way             |
| minValue / maxValue / step                         | 0 / 100 / 1       | Finite bounds; positive numeric step anchored at min |
| label                                              | required          | Visible group label                                  |
| lowerLabel / upperLabel                            | Minimum / Maximum | Visible labels naming the individual sliders         |
| valueText                                          | String            | Formats visible values and aria-valuetext            |
| disabled / readonly / invalid / touched / required | false             | Field and forms state                                |

valueChange emits a new tuple only after a changed user value. touch emits when focus leaves
the composite. A null form reset displays the full range without emitting or mutating null.
Nonfinite bounds fall back to 0/100, max below min collapses to min; nonpositive step becomes 1.
Displayed values snap to min+n×step inside bounds, sort reversed pairs, and clamp bad values.
If max is off the step lattice, the highest valid step is the effective max.

## Anatomy and states

Visible label names a group; lower and upper visible labels name two native buttons with
role slider. Both are separate Tab stops in permanent lower-then-upper order. They expose
aria-valuenow, dependent aria-valuemin/max, aria-valuetext and hint/error aria-describedby.
The shared rail highlights the selected interval. readonly keeps focus and exposes aria-disabled
on sliders while blocking editing; disabled uses native disabled buttons. Invalid is reflected
on each slider and data-invalid on the host. No hidden form inputs or automatic persistence.

## Keyboard and pointer

Arrows adjust by one step (Up increases, Down decreases; horizontal arrows mirror in RTL).
PageUp/Down use ten steps; Home/End select the thumb's dependent bounds. Modified keys are
ignored. Values may meet but cannot cross. Pointer track clicks choose the nearest thumb;
exact ties choose upper. Dragging uses pointer capture and clamps outside the rail. Pointer
cancel or lost capture ends dragging without rollback. Direction uses the host's computed
RTL semantics. Vertical touch scrolling remains available with touch-action pan-y.

## Component tokens and portability

--vd-range-slider-track maps to fill-hover; --vd-range-slider-fill and -border map to action;
-thumb-bg maps to on-action; -ring maps to focus; -thumb-size maps to space-5, -hit-size to
space-8, -track-size to space-1-5. Logical geometry and percentage state custom properties
are shared across adapters. Focus/hover/dragging/disabled/readonly/invalid styles use tokens;
forced colors retains system boundaries; no motion is added.

## Adapter notes

@vadem/ui/range-slider exports VdRangeSlider and VdRangeValue. Angular 22 model integration
supports Reactive Forms and Signal Forms. Field hints/errors register against the lower
slider ID; the component owns the visible group label, so use vd-field without another label.
Pure arithmetic and key logic live in core. Consumer validators own business constraints.
Native DOM measurements occur only during pointer events, keeping construction SSR-safe.

Bound inputs use minValue/maxValue because Signal Forms reserves min/max for validator metadata
matching the complete tuple value, rather than individual numeric bounds.

```html
<vd-field hint="Choose your budget">
  <vd-range-slider
    label="Budget"
    lowerLabel="From"
    upperLabel="To"
    [minValue]="0"
    [maxValue]="10000"
    [step]="100"
    [(value)]="budget"
  />
</vd-field>
```

The summaries stack in a narrow container so long currency values retain readable lines.
