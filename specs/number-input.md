# Number input

Status: implemented · Pattern: native `input[type=number]` with explicit step buttons.

## Anatomy

```html
<div class="vd-input-group vd-number-input">
  <button type="button" aria-label="Зменшити кількість" aria-controls="quantity">
    <svg aria-hidden="true"></svg>
  </button>
  <input
    type="number"
    class="vd-input vd-number-input__input"
    id="quantity"
    min="0"
    max="10"
    step="1"
  />
  <button type="button" aria-label="Збільшити кількість" aria-controls="quantity">
    <svg aria-hidden="true"></svg>
  </button>
</div>
```

Exactly one direct native numeric input is projected into the group. Its native value,
constraints and validity remain authoritative. Label/hint/error use the existing Field.

## Props

| Part  | Name                                                                                | Default                 | Contract                                                           |
| ----- | ----------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------ |
| Group | `decreaseLabel`                                                                     | `Decrease value`        | Accessible button name; localize and include context               |
| Group | `increaseLabel`                                                                     | `Increase value`        | Accessible button name; localize and include context               |
| Input | `size`                                                                              | `md`                    | Existing Input sizes `sm`, `md`, `lg`; group follows input         |
| Input | `invalid`, `touched`, `required`, `id`                                              | Existing Input defaults | Existing Field/Input validity and labeling contract                |
| Input | Native `min`, `max`, `step`, `value`, `disabled`, `readonly`, `placeholder`, `name` | Native defaults         | Supplied on the native input; no mirrored value model on the group |

## Value and stepping

- Empty is distinct from zero. Clearing follows the native numeric form accessor (null in
  Reactive Forms). No implicit value initialization, rounding or clamping while typing.
- A step action uses native `stepUp` / `stepDown` semantics, including decimal alignment,
  the native step base and bounds. Availability is probed on a detached clone so probing
  cannot change the real field or emit events. It never moves opposite to the requested
  direction, including recovering from out-of-range values.
- Empty stepping follows the platform's zero-based starting behavior with native constraints.
  An unsupported `step="any"`, bad native numeric input or inconsistent min/max makes step
  actions unavailable; editing remains native. No custom locale parser or currency mask.
- Input changes, programmatic form values and dynamic constraints refresh availability after
  browser render. Direct DOM writes outside the framework require the usual input event or
  a subsequent render; the component does not poll the DOM with timers.
- Successful step changes emit bubbling `input` then `change` exactly once each. No change,
  unavailable, disabled or readonly steps emit nothing. Native blur controls touched state;
  step actions do not fabricate a blur. The group adds no form accessor or submit behavior.

## Events

Native input/change/blur on the input. No group value event. Consumer forms own validation.

## States

Disabled and readonly inputs block stepping; step buttons are natively disabled. At a bound,
bad input or `step="any"`, step buttons use `aria-disabled` and guarded activation so a
keyboard user can retain focus when reaching a limit. Input displayed-invalid and group
focus/hover styling reuse Input. An empty placeholder is not a label.

## Keyboard / focus

Tab/Shift+Tab visit decrease, input and increase in DOM order, skipping natively disabled
controls. Enter/Space on enabled buttons steps once through native button activation.
ArrowUp/Down on the input, caret/editing/IME keys and wheel behavior remain native. No custom
Home/End/PageUp/PageDown shortcuts or press-and-hold acceleration. Button activation retains
button focus. The native input exposes spinbutton semantics; do not duplicate its role or
aria-valuemin/max/now. Icons are decorative; buttons are named and reference the input ID.
RTL mirrors geometry through logical CSS, while decrease/increase meaning stays unchanged.

## Component tokens

The group reuses existing `--vd-input-*` and `--vd-button-*` tokens and concentric group
geometry. `--vd-number-input-button-size` defaults to Input height minus space-2 and is capped
at 20% of the group width to preserve the editable area. `--vd-number-input-gap` and
`--vd-number-input-padding` reuse space-1. Icons fit the resulting buttons. Input
native spinner appearance is suppressed visually; native number editing/keyboard remain.
Forced colors retain boundaries and focus. No new primitive/semantic scale or extra motion.

## Adapter notes

Angular exports `VdNumberInputGroup` (`vd-number-input`), `VdNumberInput`
(`input[type=number][vdNumberInput]`, exportAs `vdNumberInput`) and `VD_NUMBER_INPUT` from
`@vadem/ui/number-input`. The input extends existing Input, including Field registration and
validity, without applying `vdInput` again. Native Reactive/Template accessors and Signal Forms
bind directly to it. Standalone/OnPush, browser-only post-render availability reconciliation,
global CSS. Step buttons are native buttons styled with shared Button CSS; the group owns
their ARIA availability so competing Button host bindings cannot overwrite the initial state.
The DOM step probe is framework-independent, with no new runtime dependency.

References checked 2026-10-08:
[HTML number stepping](https://html.spec.whatwg.org/multipage/input.html#dom-input-stepup),
[Angular NumberValueAccessor](https://angular.dev/api/forms/NumberValueAccessor),
[Signal Forms](https://angular.dev/guide/forms/signals/overview).

## Angular usage

```ts
import { VD_NUMBER_INPUT } from '@vadem/ui/number-input';
// Add VD_NUMBER_INPUT, VdField and ReactiveFormsModule to the consumer imports.
```

```html
<vd-field label="Кількість" hint="Від 0 до 10">
  <vd-number-input decreaseLabel="Зменшити кількість" increaseLabel="Збільшити кількість">
    <input vdNumberInput type="number" min="0" max="10" step="1" [formControl]="quantity" />
  </vd-number-input>
</vd-field>
```
