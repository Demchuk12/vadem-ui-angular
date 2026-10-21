# Rating

Status: stable · Pattern: [APG Rating radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio-rating/)

## Anatomy

A native fieldset and legend name a radiogroup of five native buttons with role=radio.
Each button contains a decorative vendored Lucide star. Filled prefixes show the rating;
only the chosen value has aria-checked=true. No half-star editor or variable maximum.

```html
<fieldset class="vd-rating__group" role="radiogroup" aria-labelledby="rating-label">
  <legend class="vd-rating__label" id="rating-label">Rate the consultation</legend>
  <div class="vd-rating__stars">
    <button
      class="vd-rating__star"
      type="button"
      role="radio"
      aria-label="1 out of 5 stars"
      aria-checked="true"
      tabindex="0"
      data-filled
    >
      ...
    </button>
    <!-- Four remaining radio buttons, tabindex=-1 -->
  </div>
</fieldset>
```

## Props

| Name      | Type                     | Default          | Notes                                                                                                               |
| --------- | ------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| value     | number                   | 0                | 0 means unrated; whole values 1..5. External invalid/noninteger values display unrated without rewriting the model. |
| label     | string                   | required         | Visible legend and accessible group name.                                                                           |
| starLabel | function(number): string | n out of 5 stars | Localized accessible name for each choice.                                                                          |
| size      | sm / md / lg             | md               | Existing control/icon sizes.                                                                                        |
| disabled  | boolean                  | false            | All choices disabled, removed from Tab order.                                                                       |
| readonly  | boolean                  | false            | Current choice stays focusable, group aria-readonly; all editing blocked.                                           |
| invalid   | boolean                  | false            | Explicit invalid state; forms display after touch.                                                                  |
| touched   | boolean                  | false            | Form error display gate.                                                                                            |
| required  | boolean                  | false            | Required marker and aria-required. Applications configure matching validators.                                      |

## Events and content

valueChange emits the whole-star value on explicit pointer, Space/Enter or arrow selection.
touch emits only when focus leaves the entire control. Hover previews fill without changing
value or aria-checked. No auto-submit, auto-clear on repeated selection, network or live region.
Consumers can reset value externally to 0. No projected slots. Use Field without its label:
Rating supplies its own legend; Field supplies hints/errors and validity registration.

## States

Default/unrated, selected (cumulative solid fill), hover preview, keyboard focus, invalid,
disabled and readonly. Host data-size/data-invalid/data-disabled/data-readonly; buttons
use data-filled/data-preview. Filled versus outlined shapes retain meaning without color.
No loading state; use disabled while saving.

## Keyboard

Tab enters at the selected choice or first star when unrated; one Tab stop. Shift+Tab exits.
ArrowRight/Left move and select in visual direction, mirrored in RTL. ArrowDown/Up move
forward/backward in reading order. Arrows wrap from 5 to 1 and vice versa. Home/End select
1/5. Space or Enter selects the focused native button. Readonly blocks edits but retains
one inspection stop; disabled has no stop. Modified keys remain available to the browser.

## ARIA contract

Named radiogroup, exactly one checked radio for rated values and none for 0. Localized radio
names identify value and scale. The legend is explicitly referenced by aria-labelledby.
Field hint/error switches aria-describedby on the group. aria-invalid/required/readonly/
disabled reflect group state. Internal buttons supply native activation with radio semantics;
no redundant hidden native inputs. Focus outline is inset to avoid clipping at narrow widths. Stars wrap to a second row rather than overflow when the
container is narrower than five stars (e.g. 320px at 200% text); reading and keyboard order
are unchanged.
Focus order follows DOM/reading order and does not depend on hover.

## Component tokens

--vd-rating-hit-size maps to control-height-md (sm/lg use matching control heights).
--vd-rating-icon-size maps to space-6 (sm space-5, lg space-8).
--vd-rating-gap maps to space-1, --vd-rating-radius to radius-control.
--vd-rating-color maps to border-control; --vd-rating-selected to action-text;
--vd-rating-hover to fill-hover. Icons shrink within constrained hit areas; labels reflow.
Forced colors uses CanvasText outlines and Highlight fill with a visible focus outline.
Existing token durations remove transitions under reduced motion. No new scale or signature.

## Adapter notes

Angular: VdRating from @vadem/ui/rating; standalone, OnPush, encapsulation None.
FormValueControl<number>, model value and touch output work with Angular 22 Reactive/Template
and Signal Forms. Existing NgControl state bridge and Field registration are reused. No
custom CVA provider or Angular Aria dependency. 0 is nonempty to Validators.required, so
required ratings need min(1), with max(5) for model constraints. Demo shows both form APIs.
Core value normalization/navigation is pure TypeScript. No DOM globals or render-time effects.
SSR/hydration and actual screen readers must be verified in consumer applications.
