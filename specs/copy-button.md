# Copy button

Status: implemented · Pattern: native button with a separate polite result status

## Anatomy

A host `.vd-copy-button` contains one native `.vd-button.vd-copy-button__button` and a
visually-hidden `role=status` sibling. Decorative icons and reserved label slots are hidden
from assistive technology. Button has a persistent action-name prefix and type=button.

## Props

| Name         | Type           | Default                                               | Notes                                                                   |
| ------------ | -------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| value        | string         | required                                              | Exact text to copy; whitespace/newlines preserved, empty string allowed |
| variant      | Button variant | secondary                                             | Existing primary/secondary/ghost/danger                                 |
| size         | sm/md/lg       | md                                                    | Existing Button sizes                                                   |
| disabled     | boolean        | false                                                 | Native disabled; blocks copying                                         |
| iconOnly     | boolean        | false                                                 | Icon presentation with the same required accessible action name         |
| label        | string         | Copy                                                  | Persistent action-name prefix; localize or add specific object context  |
| copyingLabel | string         | Copying…                                              | Localized progress announcement/reserved text                           |
| copiedLabel  | string         | Copied                                                | Visible success label and result announcement                           |
| errorLabel   | string         | Try again                                             | Visible retry label after failure                                       |
| errorMessage | string         | Could not copy. Select the text and copy it manually. | Polite error announcement and icon-only title                           |

No projected content. Visible state labels reserve shared geometry; icon-only has fixed Button
geometry. Long localized text wraps within the available width. Consumers keep the source text
selectable when possible, especially if Clipboard API is unavailable or denied.

## Events

| Name       | Payload | When                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------- |
| copied     | void    | Browser write completes successfully for the current value                |
| copyFailed | void    | API unavailable or write rejects; no raw exception or copied text emitted |

## States and keyboard

Idle / copying / copied / error via data-state. During copying, the native button remains
focusable with aria-disabled=true and aria-busy=true; repeated activation is guarded. Disabled
uses native disabled and is skipped in Tab order. Enter/Space activate naturally; Tab/Shift+Tab
move normally. No shortcuts, document listeners, focus movement, toggle or pressed semantics.

Success/error persists until another attempt or value change. No reset timer. Changes to value
invalidate stale UI results; a pending browser write cannot be cancelled, and a second write
waits until it settles. A stale settlement is not announced or emitted for the new value.
Destroyed controls ignore later results. Disabled does not cancel an already-authorized write.

## ARIA contract

Button action name starts with label across states. For text buttons, the visible state label
is appended to preserve label-in-name; icon-only keeps label. One polite atomic role=status sibling announces
progress/result outside the busy button. Icons do not duplicate names. Color is supplementary:
check/alert shapes and text communicate result. No redundant button role, aria-pressed or alert.

## Platform behavior

Call navigator.clipboard.writeText directly during native activation, before asynchronous work,
without permission preflight or clipboard reads. Secure contexts and browser policy govern access.
No execCommand fallback, hidden textareas, automatic writes or global clipboard interception.
Missing/denied APIs leave a retryable error; consumer can supply selectable text/manual copying.
References: [Clipboard writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText),
[Button APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Component tokens

Button owns geometry, variant, focus, loading and motion tokens. Copy-specific tokens:
--vd-copy-button-success-ink=color-success-text; --vd-copy-button-error-ink=color-danger-text.
State ink is limited to the decorative result icon, preserving Button text contrast for every
variant. Forced colors uses ButtonText, system boundaries and the existing focus outline.
No new token scale or effect. Reduced motion uses existing Button/Icon rules.

## Usage

```html
<vd-copy-button
  [value]="project.id"
  label="Copy project ID"
  copiedLabel="Copied"
  errorLabel="Try again"
  (copied)="onCopied()"
  (copyFailed)="onCopyFailed()"
/>
```

In a table, use iconOnly with a specific label for each source. Localize all state labels and
errorMessage. Do not pass secret text in event/log payloads; the component emits only void.

## Adapter notes

Angular: VdCopyButton from @vadem/ui/copy-button, standalone/OnPush/None. Wraps existing native
VdButton and VdIcon without inheritance or shared Button changes. Model-free inputs and void
outputs; no CVA. Access navigator through injected DOCUMENT.defaultView only at activation;
DestroyRef guards asynchronous settlement. Signal input effects reset feedback when value changes.
No browser globals, lifecycle clipboard reads, timers or Angular-independent core required.
