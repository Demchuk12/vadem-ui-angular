# Toast

Status: draft · Pattern: status messages in a live region (WCAG 4.1.3)

Brief, non-blocking feedback. Not for information the user must act on (use a dialog).

## Anatomy

```html
<section class="vd-toaster" popover="manual" role="region" aria-label="Сповіщення">
  <ol class="vd-toaster__list" aria-live="polite" aria-relevant="additions">
    <li class="vd-toast" data-variant="success" data-state="open" aria-atomic="true">
      <svg class="vd-toast__icon" .../>
      <div class="vd-toast__content">
        <p class="vd-toast__title">Зміни збережено</p>
        <p class="vd-toast__description">...</p>
      </div>
      <button class="vd-button vd-toast__action">Скасувати</button>      <!-- optional -->
      <button class="vd-button vd-toast__close" aria-label="Закрити">x</button>
    </li>
  </ol>
</section>
```

## API

Service: `show({ title, description?, variant?, action?: { label, onClick }, duration? })`
returns an id; shortcuts `success(title, description?)`, `error(...)`; `dismiss(id)`.
Outlet: `<vd-toaster label="Сповіщення" closeLabel="Закрити" />`, once per app.

| Option     | Default | Notes |
| ---------- | ------- | ----- |
| `variant`  | `neutral` | `success`, `warning`, `danger`, `info` add a status icon. |
| `duration` | 5000ms (10000 with an action) | `Infinity` = until dismissed. |
| max shown  | 3       | The oldest leaves when a fourth arrives. |

## States

| State | Reflected as |
| ----- | ------------ |
| entering | `@starting-style`: fade + slide up with the spring |
| open | `data-state="open"` |
| leaving | `data-state="leaving"`: fade + slide toward the inline end (down on phones), then removed |
| paused | timers pause while the pointer or focus is inside the toaster (WCAG 2.2.1) |

## Keyboard

Toasts don't steal focus. Action and close buttons are reachable with Tab when the user moves
into the region (it's a named landmark).

## ARIA contract

- Region: `role="region"` + `aria-label` (consumer localizes).
- The list is a polite live region that exists before any toast, so additions are announced.
- `danger` toasts get `role="alert"` (assertive).
- Close button needs a localized `closeLabel`.

## Component tokens

`--vd-toaster-gap`, `--vd-toaster-margin`, `--vd-toaster-width`, `--vd-toast-icon`.

## Core

`core/toast-store.ts`: `VdToastStore` - queue, timers with pause/resume, cap, two-phase exit;
`subscribe(listener)` for adapters.

## Adapter notes

Angular: `VdToaster` (root service, signal of toasts) + `vd-toaster` outlet. The outlet is a
`popover="manual"` so it renders above sticky/positioned page content. While a modal dialog is
open, page content (including the toaster) is inert: toasts are visible but not interactive.
