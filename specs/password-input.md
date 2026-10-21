# Password input

Status: implemented · Pattern: native password input + [toggle button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

## Anatomy

```html
<div class="vd-input-group vd-password-input">
  <input
    class="vd-input vd-password-input__input"
    type="password"
    id="password"
    autocomplete="current-password"
  />
  <button
    class="vd-button"
    type="button"
    slot="end"
    aria-label="Show password"
    aria-pressed="false"
    aria-controls="password"
  >
    ...
  </button>
</div>
```

## Props and content

One native input and an optional decorative start icon. Input retains size (sm/md/lg),
invalid/touched/required/id from Input; disabled, readonly, name, autocomplete, placeholder,
minlength and maxlength stay native. Consumers own the value and validation. The control owns
input type: do not bind another type or add vdInput beside vdPasswordInput.

The group accepts revealLabel (string, default "Show password"). Localize its stable accessible
name; aria-pressed reports state. A readonly password can still be inspected; disabled blocks
both editing and revealing, and changing to disabled masks any revealed text. An absent input
keeps the reveal button disabled. No strength meter, generator, clipboard or Caps Lock detector.

## Events and states

Native input/change/blur events and native forms bindings. Revealing never changes value,
marks a control dirty or submits a form; no extra value accessor or synthetic input event.
Hidden by default. Revealing sets type=text, aria-pressed=true and group data-revealed.
The icon changes eye/eye-off. Disabled/readonly/invalid inherit Input behavior; the empty field
still offers a toggle. No loading state: revealing is synchronous.

## Keyboard and focus

Tab traverses input, reveal button, then outside; Shift+Tab reverses it. Enter/Space on the
button toggle; typing, selection, IME, paste, Enter in the field and native shortcuts stay native.
Changing type preserves selection direction/range and horizontal scroll. Pointer activation
while the input is focused retains editing focus; keyboard activation retains button focus.
Group spacing does not introduce an extra Tab stop. No global shortcuts or focus trap.

## ARIA contract

Field supplies native label-for and hint/error descriptions to the input. Button has a stable
localized label, aria-pressed and aria-controls pointing to the input. Icons are decorative.
Native disabled removes the button from Tab order. No live region ever repeats the password.
No redundant textbox role is required on a password input.

## Component tokens

--vd-password-input-button-size: input height minus space-2;
--vd-password-input-gap: space-2. Input/Button provide existing surface, border, font, radius,
focus, invalid, hover and disabled tokens. The reveal target caps at 25% of available width
for narrow/enlarged-text layouts; logical layout supports RTL.

## Adapter notes

Angular exports VD_PASSWORD_INPUT, VdPasswordInput and VdPasswordInputGroup from
@vadem/ui/password-input. Use `<vd-password-input revealLabel="Показати пароль"><input
vdPasswordInput type="password" ... /></vd-password-input>` inside vd-field. The directive
extends Input, with Reactive/Template Forms and Signal Forms using the native text accessor.
After-render callbacks inspect native disabled state and do not execute during SSR. Actual
SSR/hydration and password-manager/autofill execution require dedicated validation.

Selection restoration uses the standard [setSelectionRange](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange)
API supported for password/text inputs. [Angular Aria](https://angular.dev/guide/aria) was
checked as a behavior reference; no dependency is needed for this native input/button pair.
