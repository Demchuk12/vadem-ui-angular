# Stepper

Status: implemented · Pattern: ordered process navigation with native buttons

Show the stages of a multi-step task and let the user visit available stages. The consumer
owns form validation, availability, completion, and content. Reference:
[WAI technique ARIA26](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA26).

## Anatomy

```html
<nav class="vd-stepper" aria-label="Створення проєкту" data-orientation="horizontal">
  <ol>
    <li>
      <button
        type="button"
        class="vd-step"
        data-state="complete"
        data-completed
        aria-labelledby="account-title"
        aria-describedby="account-description account-state"
      >
        <span class="vd-step__indicator" aria-hidden="true">✓</span>
        <span class="vd-step__content">
          <span class="vd-step__title" id="account-title">Профіль</span>
          <span class="vd-step__description" id="account-description">Основні дані</span>
        </span>
        <span class="vd-visually-hidden" id="account-state">Завершено</span>
      </button>
    </li>
    <li>
      <button type="button" class="vd-step" data-state="current" aria-current="step">…</button>
    </li>
  </ol>
</nav>
```

## Props

| Part    | Name             | Type                         | Default           | Notes                                                                                                        |
| ------- | ---------------- | ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| Stepper | `value`          | `string \| undefined`        | `undefined`       | Two-way current key. Omitted value displays the first step. Unknown explicit values display no current step. |
| Stepper | `label`          | `string`                     | `Steps`           | Localized navigation landmark name.                                                                          |
| Stepper | `orientation`    | `'horizontal' \| 'vertical'` | `horizontal`      | Horizontal becomes vertical below a 30rem container width.                                                   |
| Stepper | `disabled`       | `boolean`                    | `false`           | Disables every step without changing current progress.                                                       |
| Stepper | `completedLabel` | `string`                     | `Completed`       | Accessible description of completed steps.                                                                   |
| Stepper | `errorLabel`     | `string`                     | `Needs attention` | Accessible description of invalid steps.                                                                     |
| Step    | `value`          | `string`                     | required          | Unique stable key within the stepper.                                                                        |
| Step    | `completed`      | `boolean`                    | `false`           | Explicit completion, never inferred from position.                                                           |
| Step    | `invalid`        | `boolean`                    | `false`           | Shows an attention icon and error styling; overrides completion visually.                                    |
| Step    | `disabled`       | `boolean`                    | `false`           | Native disabled button, excluded from Tab navigation.                                                        |

Availability is explicit. The consumer may mark future steps disabled until a previous form
is valid, allow revisiting a completed step, or show completed progress independently of the
current step. Disabling the current step does not move progress to a different stage.

## Events

`valueChange`: new key when an enabled step is activated. Activating the current key is a no-op.
Changing the bound value is allowed even when the navigation is disabled; disabled restricts
user activation, not the consumer's workflow state.

## Slots / content

Each step accepts a title and optional description. Prefer explicit title/description parts to
keep the accessible name short. Labels and descriptions wrap, including long unbroken words.
Do not nest interactive elements inside a step button. The content for the selected stage is
rendered by the consumer outside the navigation.

## States

| State                  | Representation                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| current                | `aria-current="step"`, `data-current`, underlined title; accent number indicator when neither completed nor invalid |
| upcoming               | Number indicator, `data-state="upcoming"`                                                                           |
| completed              | `data-completed`, check icon, accessible completed description, accent connector                                    |
| invalid                | `data-invalid`, attention icon, danger text and accessible error description                                        |
| disabled               | Native `disabled`; no activation; current status stays meaningful                                                   |
| hover / focus / active | Subtle fill, visible outline, token-based press feedback                                                            |
| no steps               | Empty ordered list; no invented progress or placeholder copy                                                        |

Numbering follows rendered order and updates when steps are added, removed, or reordered.
Connector lines are decorative; status is also conveyed by text/icon and accessible descriptions.

## Keyboard

| Key                          | Action                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| Tab / Shift+Tab              | Move through enabled step buttons in DOM order, then leave navigation. |
| Enter / Space                | Activate the focused step through native button behavior.              |
| Arrows / Home / End / Escape | Native page behavior; no custom interception.                          |

RTL mirrors the layout through logical CSS; keyboard order remains DOM order.

## ARIA contract

Native named `nav`, `ol`, `li`, and button semantics; no tablist, panels, selection, or custom
button roles. Exactly one button has `aria-current="step"` when the selected key exists.
Indicator numbers and icons are decorative. A title part supplies `aria-labelledby`; a
description part and the localized status supply `aria-describedby`. Without a title part,
the native button content supplies its name.

Activating a step does not move focus. When switching stage content in a real wizard, the
consumer should focus the new stage heading or first invalid field as appropriate and announce
completion. The demo exercises heading focus after advancing with Next.

## Component tokens

`--vd-stepper-gap`, `--vd-stepper-padding`, `--vd-stepper-indicator-size`,
`--vd-stepper-radius`, `--vd-stepper-connector`, `--vd-stepper-connector-complete`,
`--vd-stepper-fg`, `--vd-stepper-fg-muted`, `--vd-stepper-current-bg`,
`--vd-stepper-current-fg`, `--vd-stepper-complete-bg`, `--vd-stepper-complete-fg`,
`--vd-stepper-error-bg`, `--vd-stepper-error-fg`, `--vd-stepper-hover`.
Existing semantic colors, spacing, control heights, radii, focus and motion tokens supply defaults.
Below a 12rem container width, indicators sit above text and connectors are hidden to preserve
label width, including when text is enlarged.

## Adapter notes

Angular: `nav[vdStepper]`, `button[vdStep]`, `[vdStepTitle]`, `[vdStepDescription]` from
`@vadem/ui/stepper`; `VD_STEPPER` imports all parts. Content queries track steps in DOM order
without manual registration or browser globals. No CVA: this is navigation, not a form control.

```html
<nav
  vdStepper
  [(value)]="stage"
  label="Створення проєкту"
  completedLabel="Завершено"
  errorLabel="Потрібна увага"
>
  <ol>
    <li>
      <button vdStep value="profile" completed>
        <span vdStepTitle>Профіль</span><span vdStepDescription>Основні дані</span>
      </button>
    </li>
    <li>
      <button vdStep value="team"><span vdStepTitle>Команда</span></button>
    </li>
  </ol>
</nav>
```

Other adapters can reuse this markup and CSS with idiomatic current-key and state APIs.
