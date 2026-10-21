# OTP input

Status: stable · Pattern: native text input (no dedicated APG pattern)

## Anatomy

```html
<input
  class="vd-input vd-otp-input"
  type="text"
  inputmode="numeric"
  autocomplete="one-time-code"
  maxlength="6"
  pattern="[0-9]{6}"
  dir="ltr"
  data-size="md"
  style="--vd-otp-input-length: 6"
/>
```

One visible, labelled native field. No hidden input, per-digit focus targets or duplicated
code text. Labels, hints and errors belong to Field or native label/description markup.

## Props

| Name                            | Type                | Default   | Notes                                                                                                                       |
| ------------------------------- | ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| length                          | number              | 6         | Finite lengths are truncated and clamped to 1..12; nonfinite falls back to 6. Owns maxlength and exact ASCII-digit pattern. |
| size                            | sm / md / lg        | md        | Existing Input sizes; mono tabular digits and token spacing.                                                                |
| invalid                         | boolean             | false     | Explicit server/error display; inherited Input contract.                                                                    |
| touched                         | boolean / undefined | undefined | Inherited error display gate.                                                                                               |
| required                        | boolean             | false     | Empty input remains valid unless required.                                                                                  |
| id                              | string              | generated | Consumer can supply a stable id.                                                                                            |
| value, disabled, readonly, name | native              | native    | Native value and submission semantics, leading zeros preserved.                                                             |

The directive owns type=text, inputmode=numeric, autocomplete=one-time-code, spellcheck=false,
maxlength, pattern and dir=ltr. Digit order remains LTR within an RTL-labelled field.
Consumers must not bind conflicting attributes. No placeholder is supplied; use a localized hint.

## Events and content

Native input/change/focus/blur/submit events. No additional output or content slots.
Pasting replaces the selection using native editing. The value is never normalized, stripped,
numerically parsed, copied into a live region or truncated on programmatic writes/length changes.
Native maxlength limits user entry; pattern validates ASCII digits and exact length, rather than
blocking keys or rewriting clipboard data. A spaced code must be edited to remove separators.
A full code does not move focus or automatically submit.

## States

Default/empty, hover, focus-visible, disabled, readonly and invalid reuse Input CSS and Field
ARIA. Invalid uses data-invalid and aria-invalid=true after touch or explicit invalid input.
No loading state: the application can disable the field during a request.

## Keyboard

All keys retain native text editing: Tab/Shift+Tab, arrows, Home/End, Backspace/Delete,
selection, clipboard shortcuts, undo/redo and IME. Enter retains native form submission.

## ARIA contract

Native textbox semantics; no custom role or live region. Field labels the input through its id
and supplies aria-describedby for hints/errors. A standalone field needs its own accessible label.
Only one tab stop. readonly remains focusable; disabled uses native form exclusion.

## Component tokens

| Token                    | Default                               |
| ------------------------ | ------------------------------------- |
| --vd-otp-input-font      | --vd-font-mono                        |
| --vd-otp-input-font-size | --vd-text-lg (sm: --vd-text-md)       |
| --vd-otp-input-tracking  | --vd-space-2                          |
| --vd-otp-input-length    | Normalized length supplied by adapter |

Boundary, background, height, padding, radius, invalid and focus tokens are inherited from Input.
Width is capped to its container. Narrow fields retain native horizontal editing/scrolling.
No new global scale or motion. Forced colors and reduced motion reuse Input behavior.

## Adapter notes

Angular: `VdOtpInput` from `@vadem/ui/otp-input`, extends VdInput; native accessors serve
Reactive/Template and Signal Forms. There is no CVA or NG_VALIDATORS provider. Native pattern
validity does not add a validator to a Reactive/Signal Forms model: configure matching form
validators explicitly (e.g. Validators.pattern(/^[0-9]{6}$/), or Signal Forms pattern()).
The gallery demonstrates both. Native required/pattern form submission validation is preserved.
No DOM globals or after-render work. Autocomplete is a platform hint, not a guarantee: unsupported
or unavailable OTP suggestions fall back to manual typing/paste. No WebOTP API or SMS retrieval.

References: [MDN OTP](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/OTP),
[Angular Aria overview](https://angular.dev/guide/aria/overview) (no OTP pattern listed).
