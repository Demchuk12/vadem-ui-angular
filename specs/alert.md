# Alert

Status: stable · Pattern: static callout; `role="alert"` / `role="status"` when dynamic

Inline message in the page flow: form-level errors, warnings about the current page, success
after a flow. Non-blocking and in place (toasts are transient; dialogs block).

## Anatomy

```html
<div class="vd-alert" data-variant="danger" role="alert">
  <vd-icon class="vd-alert__icon" name="alert-circle" />
  <div class="vd-alert__content">
    <p class="vd-alert__title">Невірний email або пароль</p>
    <p>Перевірте розкладку клавіатури.</p>
  </div>
  <button class="vd-button" slot="end" ...>Повторити</button>
  <!-- optional -->
</div>
```

## Props

| Name      | Type                                                        | Default     | Notes                                                                        |
| --------- | ----------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `variant` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `neutral`   | Subtle tinted fill, status border and icon; text stays neutral for contrast. |
| `icon`    | `VdIconName \| null`                                        | per variant | `null` hides the icon.                                                       |
| `layout`  | `'inline' \| 'banner'`                                      | `inline`    | `banner`: full-width strip at the top of a page or region (see Banner).      |
| `dismissible` | `boolean`                                               | `false`     | Adds a close button; emits `dismiss`. The consumer removes the alert.        |
| `dismissLabel` | `string`                                               | locale: `alert.dismissLabel` | Close button name.                                    |

Parts: `[vdAlertTitle]` (bold first line). Anything else in the content is body text.
Event `dismiss` (void): the close button was activated. If focus was inside the alert, it has
already moved to the next tabbable element after it (or the previous one at the end of the
page), so removing the alert does not drop focus to `<body>`. Remembering the choice (storage,
cookies) is the application's job.

## Banner

`layout="banner"` (`data-layout="banner"`): no radius, no side or top border, one bottom rule,
responsive inline padding, title and text on one line when there is room. Place it first in the
page or app shell. In containers narrower than 36rem it becomes a grid: icon, text and close on
the first row, end actions on a row below the text, so the message is never squeezed into a
one-word column. Use `role="status"`/`role="alert"` only when it appears after load.
Slot `end`: actions or a ghost icon-only close button (the consumer removes the alert).

## States

`data-variant`. Not interactive itself.

## ARIA contract

- Static callouts (present on load): no role.
- Shown in response to an action: `role="alert"` for errors that need attention now,
  `role="status"` for confirmations. Insert the element when the message appears (live regions
  announce changes, not initial content).
- Meaning is in the text; color and icon are redundant cues. The icon is decorative.
- Close buttons need `aria-label` and should move focus somewhere sensible after removal.

## Component tokens

End actions wrap onto an additional line when text enlargement leaves insufficient width.
They remain within the alert's content width; message content and icon retain their order.

`--vd-alert-bg`, `--vd-alert-border`, `--vd-alert-icon`, `--vd-alert-fg`, `--vd-alert-title`,
`--vd-alert-radius`, `--vd-alert-padding`.

## Adapter notes

Angular: `[vdAlert]` attribute component on any block element, plus `[vdAlertTitle]`.
React/Vue: `<Alert variant>` rendering the same markup.
