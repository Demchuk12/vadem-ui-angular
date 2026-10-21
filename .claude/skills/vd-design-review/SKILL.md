---
name: vd-design-review
description: Use after any visual change in Vadem (component, token, demo screen) and before calling it done - runs the demo, takes Playwright screenshots in dark and light, applies squint/grayscale tests and the design-principles checklist, and produces a concrete fix list.
---

# Vadem design review

## Procedure

1. Make sure the demo is running (`npm start`, http://localhost:4200). If not, start it in the
   background and wait for it to answer. If a library change doesn't show up (stale chunk names
   in console stack traces, no "Changes detected" in the server log), restart the dev server:
   its watcher sometimes misses files in newly added entry points.
2. Check the browser console for errors on the page before judging visuals (a runtime error can
   leave the page unstyled).
3. Screenshots: `npm run screenshots -- <route> [<route>...]` (default: all gallery routes).
   It writes `screenshots/<route>-<theme>.png` for dark and light, plus `-gray` (grayscale)
   and `-squint` (blurred) variants. Read the PNGs.
4. Look as a designer, in this order:
   1. **Squint** (`-squint`): is the hierarchy obvious? One focal point per view?
   2. **Grayscale** (`-gray`): do states and hierarchy survive without color?
   3. **Consistency**: same radius, spacing rhythm, border weight, type scale everywhere?
   4. **Signature moves**: present where they belong, absent where they don't, identical everywhere.
   5. **Both themes**: light is not an inverted afterthought; surfaces, borders, shadows balanced.
   6. **Content**: long/short labels, Ukrainian, RTL samples render without overflow or clipping.
   7. Walk the `vd-design-principles` checklist.
5. Write the critique: what works (briefly), then a numbered fix list. Each fix is concrete:
   element, problem, proposed token/value change.
6. Apply fixes through tokens first, component CSS second. Re-shoot and compare. Repeat until
   no fix is worth making.
7. Show the user the final screenshots (dark + light) and the list of changes.
8. Run `npm run visual`. Diffs on pages you did not mean to change are regressions: fix them.
   Diffs you intended: after the user accepts the screenshots, run
   `npm run visual -- --update-snapshots` and commit the new baselines with the change.

## Checklist

- [ ] Dark and light screenshots read
- [ ] Squint + grayscale tests pass
- [ ] Principles checklist walked
- [ ] Realistic + RTL content checked
- [ ] Fixes applied via tokens, re-shot, shown to the user
