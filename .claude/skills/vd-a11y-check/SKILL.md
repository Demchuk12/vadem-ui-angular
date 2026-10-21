---
name: vd-a11y-check
description: Use before calling any interactive Vadem component done, or when touching focus, keyboard, ARIA, or contrast - keyboard walkthrough, focus management, ARIA contract check, axe run, reduced-motion, forced-colors and contrast checks.
---

# Vadem accessibility check

Source of truth for behavior: the component spec (`specs/<component>.md`) and the WAI-ARIA APG.

## Procedure

1. **Keyboard walkthrough** in the demo (Playwright or manually described): Tab into, through,
   and out of the component; every key in the spec's keyboard map; Escape closes overlays and
   returns focus to the trigger; no focus traps except modal dialogs; focus order = visual order
   (check RTL too).
2. **Focus visibility**: every focusable state shows the ring (`:focus-visible`), the ring is
   not clipped by `overflow`, and has >= 3:1 against adjacent colors in both themes.
3. **ARIA contract**: inspect the DOM (role, name, state attributes) against the spec in each
   state. Prefer native semantics; no redundant roles. Disabled vs `aria-disabled` is deliberate.
   Verify additional Field.descriptionIds remain beside the current hint/error, without duplicates.
4. **axe**: `npm run e2e` runs `e2e/a11y.spec.ts` on every route in `tools/gallery-routes.json`
   in dark and light (tags `wcag2a, wcag2aa, wcag21aa, wcag22aa`). Zero violations. Keyboard and
   focus assertions for the component live in `e2e/<component>.spec.ts`.
5. **Hover/focus close-ups**: Playwright `hover()` / `focus()` + element screenshot, both themes.
6. **Reduced motion**: emulate `prefers-reduced-motion: reduce`; nothing moves, state changes
   still visible.
7. **Forced colors**: emulate `forced-colors: active`; boundaries, focus, checked/selected
   states still visible (use `outline`/borders, `CanvasText`, `Highlight` system colors if needed).
8. **Contrast**: text 4.5:1 (3:1 large), UI boundaries and focus 3:1, in both themes, including
   disabled-adjacent and placeholder text.
9. **Zoom**: 200% zoom and 320px width - no clipped or overlapping content.

## Checklist

- [ ] Keyboard map complete, focus returns correctly
- [ ] Focus ring visible everywhere, both themes
- [ ] ARIA matches the spec in every state
- [ ] axe: 0 violations, dark + light
- [ ] Reduced motion and forced colors OK
- [ ] Contrast and 200% zoom OK
