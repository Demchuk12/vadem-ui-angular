---
name: vd-new-component
description: Use when creating a new Vadem component or directive end to end - library files in a secondary entry point, token-only styles, demo gallery entry with all states, spec, logic test, a11y check, and design review.
---

# New Vadem component

Rules in `CLAUDE.md` win. Build one component at a time; show the user screenshots at the end.

## Procedure

1. **Spec first** (`vd-component-spec`): props, events, states, keyboard map, ARIA contract,
   component tokens. Pick the APG pattern; check `@angular/aria` for behavioral reference.
2. **Entry point** `projects/ui/<name>/`:
   - `ng-package.json` (`{ "lib": { "entryFile": "src/public-api.ts" } }`)
   - `src/public-api.ts` exporting only the public API
   - `src/<name>.ts` - directive on a native element when it preserves semantics, otherwise a
     component. `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.None`, no `styles`.
     Inputs via `input()`/`model()`, outputs via `output()`; reflect state to `data-*` via `host`.
   - User-facing text inputs have no literal default: add a section to `VdLocale` with the
     English and Ukrainian packs (`@vadem/ui/locale`) and resolve with `vdTexts` (see CLAUDE.md).
   - Form controls on native elements extend `VdFieldControlBase` (`@vadem/ui/field`) for
     validity, `vd-field` wiring and ARIA; checkbox-like controls go inside `label[vdChoice]`.
     Additional descriptive content uses Field.descriptionIds; keep the active hint/error association.
   - `core/` only for complex logic (state machine, keyboard, typeahead) - pure TS, no Angular.
3. **Styles** `src/styles/components/<name>.css` inside `@layer vd.components`, imported from
   `src/styles/components/index.css`. Start with the component token block, then states via
   `[data-*]`, `:hover`, `:focus-visible`, `:active`, `:disabled`/`[aria-disabled]`. Logical
   properties only. Tokens only (`vd-tokens`), principles applied (`vd-design-principles`).
4. **Demo**: gallery page `projects/demo/src/app/pages/<name>.ts`, route + nav entry in
   `app.routes.ts`, and the route in `tools/gallery-routes.json` (screenshots + axe pick it up).
   Show every variant x size x state, plus realistic content: long and short labels, Ukrainian,
   an RTL (`dir="rtl"`) block. Use `.vd-eyebrow` section labels.
5. **Tests**: `<name>.spec.ts` (Vitest) for logic and ARIA/data-attribute reflection; core logic
   tested without TestBed. Keyboard/focus behavior goes into `e2e/<name>.spec.ts`.
6. **Checks**: `npm run lint`, `npm test`, `npm run e2e`, `npm run build:ui`, `ng build demo`.
7. **a11y** (`vd-a11y-check`) and **design review** (`vd-design-review`); iterate.
8. Update `DECISIONS.md` for any non-obvious choice. Commit.

## Checklist

- [ ] Spec written and matches the code
- [ ] Secondary entry point builds; public API is minimal and `vd`-prefixed
- [ ] OnPush, signals, SSR-safe, encapsulation None, state in `data-*`
- [ ] CSS uses tokens only, logical properties, all states
- [ ] Gallery shows all states, both themes, Ukrainian + RTL + long/short content
- [ ] Logic test + axe test pass
- [ ] a11y check and design review done, screenshots shown
