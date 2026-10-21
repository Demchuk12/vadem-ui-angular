# Alert dialog

Status: stable · Pattern: [APG alert dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).

## Props

| Name                                              | Type                        | Default                                | Meaning                                              |
| ------------------------------------------------- | --------------------------- | -------------------------------------- | ---------------------------------------------------- |
| open                                              | boolean, two-way            | false                                  | Modal visibility                                     |
| title                                             | string                      | required                               | Short decision question                              |
| description                                       | string                      | required                               | Consequence of the action; plain text                |
| action                                            | () => void or Promise<void> | required                               | Application-owned operation; throw/reject on failure |
| variant                                           | primary or danger           | danger                                 | Confirmation button treatment                        |
| confirmLabel, cancelLabel, pendingText, errorText | string                      | locale: alertDialog corresponding keys | Consumer overrides                                   |

`confirmed`: void after successful action, after requesting close. `canceled`: void on explicit
Cancel or idle Escape. `actionFailed`: unknown on current-session failure. External open changes
emit no cancellation/success. `openChange`: boolean, normal two-way state.
No global confirmation service, implicit deletion, typed confirmation, form or transport API.

## Anatomy and states

`vd-alert-dialog` contains `dialog.vd-dialog.vd-alert-dialog__dialog` with role=alertdialog,
aria-modal=true, title and description references supplied by Dialog title/description parts.
A named, focusable body region contains the title, consequence and persistent polite status.
Footer contains Cancel then Confirm, in both DOM and visual order. Both buttons are type=button.
`data-state` on the dialog is closed, idle, pending or error. Confirmation uses existing Button
loading state; Cancel uses aria-disabled while pending and guards activation, preserving focus.
No redundant alert live region is added. Error copy is localized, not an exception rendered as HTML.

## Keyboard and focus

Native Dialog owns modal containment, inert background and trigger focus restoration.
Initial focus is always Cancel (autofocus), including on reopen. Tab/Shift+Tab reach the body
scroll region and actions. Enter/Space activate only the focused button; Enter in the message
never confirms implicitly. Escape cancels when idle/error; during pending it is prevented.
Backdrop click and sheet drag never dismiss this decision dialog. Pending cannot be canceled by
UI and duplicate activation is ignored synchronously. Focus stays on its current action on
failure; neither status changes nor retry steal focus. Cancel remains possible after failure.
Long titles/descriptions scroll in the body while both actions stay reachable at 320px/200%.

## Async lifetime

The operation callback is captured at activation. Success closes and emits once; synchronous
throws and Promise rejection retain the dialog and emit actionFailed. Each rendered open/close
transition invalidates previous results. External close or destruction does not abort an
application operation: its later completion cannot close a new session or emit stale results.
Applications must not replace the confirmed record/action while a visible session is pending;
close the session first when the target changes. No cancellation support is implied.

## Tokens and adapter notes

--vd-alert-dialog-gap → space-4; --vd-alert-dialog-status-fg → color-text-muted;
--vd-alert-dialog-error-fg → color-danger-text. Existing Dialog/Button own surfaces, focus,
loading and motion tokens. No new animation or token scale. Text is interpolated as plain text.
Angular: OnPush, signal inputs/model/outputs and cleanup; native Dialog's browser-only controller
preserves SSR safety. No component-created browser globals or document listeners.
