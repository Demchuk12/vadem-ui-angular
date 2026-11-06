# Buzzer

Status: stable · Pattern: native `<button>` ([APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/))

A large press-to-answer button for live games and polls where the first press wins. It reacts on
pointer down instead of on release, and a press never turns into a scroll or a zoom.

## Anatomy

```html
<button class="vd-buzzer" data-state="ready" type="button">
  <span class="vd-buzzer__label">Answer</span>
</button>
```

## Props

| Name    | Type                                     | Default  | Notes |
| ------- | ---------------------------------------- | -------- | ----- |
| `state` | `'locked' \| 'ready' \| 'won' \| 'spent'` | `locked` | Only `ready` accepts a press. |

## Events

| Name   | Payload | Notes |
| ------ | ------- | ----- |
| `buzz` | none    | Fires on primary-button pointer down, or on a click that no pointer press preceded (keyboard, assistive technology). The click ending a pointer press is not counted again. |

## Slots / content

Default: the label. The application changes it with the state, because color is not enough to tell
states apart and the wording belongs to the game.

## States

| State    | Meaning                                  | Reflected as                               |
| -------- | ---------------------------------------- | ------------------------------------------ |
| `locked` | Presses are not open yet, or someone won | `data-state`, `aria-disabled="true"`       |
| `ready`  | A press counts                           | `data-state`                               |
| `won`    | This person pressed first                | `data-state`, `aria-disabled="true"`       |
| `spent`  | This person already used their attempt   | `data-state`, `aria-disabled="true"`, dashed border |

## Keyboard

Native: `Enter` and `Space` press. The button stays focusable in every state (no native `disabled`),
so focus survives the state changing between questions.

## ARIA contract

- Accessible name comes from content.
- `aria-disabled="true"` in every state but `ready`.
- Announcing state changes is the application's job (a live region), since a changed name on the
  focused button is not reliably spoken.

## What the application owns

- The authoritative result. `buzz` only reports a press: a server decides who was first.
- Blocking repeat presses while a request is in flight (set `locked`, or ignore `buzz`).
- Haptics (`navigator.vibrate`) and sound.

## Component tokens

| Token                    | Default                    |
| ------------------------ | -------------------------- |
| `--vd-buzzer-size`       | `18rem` (never wider than its container) |
| `--vd-buzzer-font-size`  | `--vd-text-2xl`            |
| `--vd-buzzer-bg`         | `--vd-color-fill`          |
| `--vd-buzzer-fg`         | `--vd-color-text-muted`    |
| `--vd-buzzer-border`     | `--vd-color-border-strong` |
| `--vd-buzzer-shadow`     | `none`                     |
| `--vd-buzzer-sheen`      | `none`                     |

## Adapter notes

- Angular: `button[vdBuzzer]`, output `buzz`.
- React/Vue: same markup; handle `pointerdown` and `click` with the same de-duplication.
