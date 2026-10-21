# Popover

Status: draft · Pattern: non-modal dialog on the Popover API, anchored with CSS

A floating panel with arbitrary content tied to a button: quick filters, share options, a small
form, details. Not a menu (actions list: `vdMenu`), not a tooltip (text only: `vdTooltip`), not
a modal (blocking: `vdDialog`).

## Anatomy

```html
<button aria-haspopup="dialog" aria-expanded="true" aria-controls="vd-popover-4">Поділитися</button>
<div class="vd-popover" id="vd-popover-4" popover="auto" role="dialog"
     aria-label="Поділитися проєктом" data-placement="bottom">...</div>
```

## API

| Part                          | Inputs | Notes |
| ----------------------------- | ------ | ----- |
| `[vdPopover]`                 | `placement: 'bottom' \| 'top' \| 'start' \| 'end'` | `exportAs: 'vdPopover'`, `hide()`. |
| `button[vdPopoverTrigger]`    | the popover (required) | Toggles it; reflects `aria-expanded`, `data-state`. |

Placement flips when there is no room (`position-try-fallbacks`). Width 20rem
(`--vd-popover-width`), never wider than the viewport.

## Behavior

- Opens on trigger click (`showPopover({ source })`); the trigger becomes the invoker: clicking it
  again closes instead of light-dismiss + reopen, and closing returns focus to it.
- On open, focus moves to `[autofocus]` inside, else the first focusable element.
- Light dismiss (click outside) and Escape are native. Another `popover="auto"` opening closes it
  unless nested.
- Tab moves through its content; it does not trap focus (non-modal).

## States

Closed/open (`:popover-open`): fade + slight scale from the anchor side (fade only under reduced
motion). Trigger: `aria-expanded`, `data-state`.

## ARIA contract

- `role="dialog"` with a name (`aria-label` / `aria-labelledby` a heading inside) - required.
- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.

## Component tokens

`--vd-popover-width`, `--vd-popover-padding`, `--vd-popover-radius`, `--vd-popover-offset`.

## Adapter notes

Angular: two directives (`VD_POPOVER`). React/Vue: same markup; the trigger calls
`showPopover({ source })` and listens to `toggle`.
