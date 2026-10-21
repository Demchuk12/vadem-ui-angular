# Dialog

Status: draft · Pattern: [APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) on native `<dialog>`

The platform provides top layer, focus trap (inert page), initial focus (first focusable or
`autofocus`), Escape, and focus restoration to the opener. The component adds open state,
dismiss policy, light dismiss, naming, styling and motion.

## Anatomy

```html
<dialog class="vd-dialog" data-size="md" aria-labelledby="t" aria-describedby="d" open>
  <header class="vd-dialog__header">
    <h2 class="vd-dialog__title" id="t">Видалити проєкт?</h2>
    <p class="vd-dialog__description" id="d">Цю дію не можна скасувати.</p>
    <button class="vd-button" data-icon-only aria-label="Закрити">x</button>
    <!-- optional -->
  </header>
  <div class="vd-dialog__body">...</div>
  <!-- scrolls -->
  <footer class="vd-dialog__footer">...actions...</footer>
</dialog>
```

## Props

| Name          | Type                           | Default  | Notes                                                                                                                                                                                 |
| ------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`        | `boolean`                      | `false`  | Two-way. Methods: `show()`, `close(returnValue?)`.                                                                                                                                    |
| `size`        | `'sm' \| 'md' \| 'lg'`         | `md`     | 24 / 32 / 44rem, never wider than the viewport minus margins.                                                                                                                         |
| `placement`   | `'center' \| 'start' \| 'end'` | `center` | `start`/`end`: drawer - full height, attached to that inline edge, slides in from it (mirrored in RTL). Widths 22 / 28 / 40rem by `size`. Below 40rem every dialog is a bottom sheet. |
| `dismissible` | `boolean`                      | `true`   | Escape and backdrop click close it. `false` for flows that need an explicit choice.                                                                                                   |

Close button part: `button[vdDialogClose]="value"` closes with that `returnValue`.

A `<form>` may wrap the parts (header, body, footer) as the dialog's only child: it gets
`display: contents`, so layout, the scrolling body and the sheet handle work unchanged.

## Events

`closed(returnValue: string)` after closing; `''` when dismissed (Escape, backdrop, close
button without value). Each opening resets the previous return value to `''`.
`dismissible=false` blocks Escape, backdrop, and swipe dismissal; explicit `close()`
and close-button actions still work.

## States

| State    | Reflected as                                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| open     | `[open]` - fade + spring scale-in from 96%; backdrop fades in (blurred where supported)                                                                                                 |
| closing  | transitions back (Chromium animates the exit via `overlay`; elsewhere it closes instantly)                                                                                              |
| dragging | `data-dragging` while swiping a sheet; `--vd-sheet-offset` / `--vd-sheet-progress` follow the pointer, transitions off, backdrop fades                                                  |
| phone    | < 40rem: bottom sheet - full width, attached to the bottom edge, top corners rounded, slides up (ease-out, no spring), footer stacked with the primary action on top, safe-area padding |
| scroll   | body scrolls; page scroll is locked (`:root:has(dialog:modal)`); no layout shift because base.css reserves the scrollbar gutter permanently                                             |

## Swipe (bottom sheet)

Dismissible sheets show a grab handle and can be dragged down by the header (not its buttons;
the body keeps scrolling). Release dismisses past 25% of the height or on a downward flick
(> 0.5 px/ms); otherwise the sheet springs back. Non-dismissible sheets show no handle and ignore
the gesture. Swipe is an extra: Escape, close buttons and the backdrop remain the accessible ways
to dismiss.

## Keyboard

| Key                 | Action                           |
| ------------------- | -------------------------------- |
| `Tab` / `Shift+Tab` | Cycle within the dialog (native) |
| `Escape`            | Close if `dismissible`           |

## ARIA contract

- Native `<dialog>` + `showModal()` gives `role="dialog"` and modality.
- `aria-labelledby` / `aria-describedby` set from the title/description parts (component).
- Destructive confirmations: consumer may add `role="alertdialog"`; set `dismissible="false"`
  when a choice is required.
- Focus returns to the opener (native). Initial focus: put `autofocus` on the least destructive
  action if the first focusable element is not right.

## Component tokens

`--vd-dialog-width`, `--vd-dialog-padding`, `--vd-dialog-gap`, `--vd-dialog-radius`
(`--vd-radius-overlay`), `--vd-dialog-bg` (`--vd-color-surface-overlay`), `--vd-dialog-margin`;
backdrop: `--vd-color-backdrop`.

## Core

`core/sheet-drag.ts`: `new VdSheetDrag(el, { isSheet, dismissible, handleSelector, onDismiss })`
and the pure decision `vdSheetShouldDismiss(offset, height, velocity)`. "Is a sheet" is read from
the CSS custom property `--vd-dialog-sheet: 1`, so the breakpoint lives only in CSS.

`core/dialog-controller.ts`: `new VdDialogController(dialog, { onClose, dismissible })` with
`open()`, `close(value)`, `destroy()`. Light dismiss only when the press starts _and_ ends on the
backdrop (dragging a text selection out doesn't close). `vdIsOutside(rect, x, y)`.

## Adapter notes

Angular: `dialog[vdDialog]` (`exportAs: 'vdDialog'`) + parts (`VD_DIALOG`). The controller is
created in `afterRenderEffect`, so nothing runs on the server.
