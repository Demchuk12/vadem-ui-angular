# Vadem

Personal UI component library. Angular first (`@vadem/ui`), later React/Vue/Svelte adapters
with idiomatic APIs. Facts and rules for every task live here; procedures live in skills
(`.claude/skills/`). Reasoning behind choices: `DECISIONS.md`.

Current user brief: `docs/PROJECT_BRIEF.md`; Codex entry point: `AGENTS.md`.
Approved design skill routing: `docs/DESIGN_WORKFLOW.md` (2026-10-07).
Pinned external skills: `docs/DESIGN_SKILL_SOURCES.md` (Impeccable + frontend-design).
The brief overrides conflicting historical rules/decisions below; it does not authorize
an implementation migration. Existing icons, signature moves, and reduced-motion behavior
have differences recorded in the brief. Obtain approval before creating new skills.

## Working agreement

- Talk to the user in **Ukrainian**. Code, comments, commits, docs, specs: **English**.
- **Ask before adding any dependency**, feature, or abstraction that wasn't requested. Explain why.
- Be honest: if a request is a bad idea, say so and propose an alternative.
- Work in small steps. After each step the demo builds and runs; show what changed (screenshots).
- Record non-obvious choices in `DECISIONS.md`. When a convention changes, update this file and
  the affected skills in the same change. Propose a skill when a procedure repeats a third time.

## Repo layout

```
projects/ui/<entry>/      library, one secondary entry point per component group (@vadem/ui/button)
projects/ui/<entry>/src/core/  framework-agnostic logic and data (no @angular/*, enforced by ESLint)
projects/ui/keyboard/      framework-agnostic keyboard helpers (roving, list nav, typeahead)
projects/demo/            gallery + demo screens (prefix `demo`)
src/styles/               plain CSS: tokens/, fonts, reset, base, components/ (copied into the package)
src/fonts/                self-hosted woff2 subsets + OFL licenses (see src/fonts/README.md)
specs/<component>.md      framework-agnostic component specs
tools/                    dev scripts (screenshots, icons, brand export)
brand/logo/               logo set; its README is the source of truth (geometry, colors, rules)
```

Commands: `npm start` (demo, :4200) · `npm run lint` · `npm test` · `npm run build:ui` ·
`npm run screenshots` (Playwright, dark + light) · `npm run e2e` (axe + keyboard) ·
`npm run visual` (baseline diff in the Playwright Docker image; `-- --update-snapshots` to accept) ·
`npm run brand:export` (logo rasters).
Package checks after `build:ui`: `npm run check:package` (version/exports/assets),
`npm run check:api` (public API snapshot `docs/api-surface.json`; `npm run update:api` after an
intentional change) and `npm run check:consumer` (isolated tarball app + Chromium). See
`docs/PUBLISHING.md`.
Support and public API policy: `docs/COMPATIBILITY.md`.
Gallery routes are listed once in `tools/gallery-routes.json`.

## Naming

| What                | Convention                                         | Example                                                   |
| ------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| Component selector  | kebab-case, `vd-`                                  | `<vd-card>`                                               |
| Directive selector  | camelCase, `vd`                                    | `<button vdButton>`                                       |
| TS class            | `Vd` prefix                                        | `VdButton`                                                |
| CSS class           | `.vd-*`; modifiers only if data-attr is not enough | `.vd-button`                                              |
| CSS custom property | `--vd-*`                                           | `--vd-button-bg`                                          |
| State               | data attributes, no prefix                         | `data-variant`, `data-size`, `data-state`, `data-invalid` |

The prefix lives in `angular.json` (`prefix`) and `eslint.config.js` (`PREFIX`). Brand/prefix
appear nowhere else as configuration.

## Hard constraints

1. **Own CSS only.** No Tailwind, CSS-in-JS, UI kits, utility libraries.
2. **Runtime peer dependency: Angular only.** Angular CDK only for genuinely hard parts, always
   wrapped (CDK types never in the public API). Native first: `<dialog>`, `inert`, Popover API,
   CSS anchor positioning - so far nothing needed CDK (D52). `@angular/aria` is a behavior
   reference, not a dependency.
3. **Modern Angular:** standalone, signals, `input()`/`output()`/`model()`, OnPush, zoneless,
   SSR-safe (no `window`/`document` globals; inject `DOCUMENT`). Prefer attribute directives on
   native elements over wrapper components.
4. **Accessibility is a requirement:** WAI-ARIA APG patterns, full keyboard support,
   `:focus-visible`, `prefers-reduced-motion`, `forced-colors`, WCAG AA contrast, axe-clean.
5. **Portable:** styles are plain global CSS (no `:host`, no reliance on ViewEncapsulation;
   components use `ViewEncapsulation.None` and no inline styles). State goes to `data-*`.
   Complex logic (select, tabs, dialog, menu) lives in `core/` as pure TS. Simple components stay
   plain Angular. Don't freeze the core API before two adapters exist.
6. **No external runtime assets.** Self-hosted fonts. Icons: a vendored subset of Lucide (ISC),
   compiled to path data in `@vadem/ui/icon` - add icons via `tools/icons.json` + `npm run icons`,
   never hand-draw or mix sets.

Browser targets: last 2 Chrome/Edge/Firefox, Safari 26+ (macOS + iOS). Features outside that
baseline (e.g. `corner-shape`) are progressive enhancement behind `@supports`.

## Styling architecture

- Layers: `@layer vd.reset, vd.tokens, vd.base, vd.components;` Everything ships inside `vd`, so
  any unlayered consumer CSS wins.
- Tokens: **primitives → semantic → component**. Themes swap only the semantic layer. Components
  read semantic tokens through their own component tokens (`--vd-button-bg`). Never hard-code
  colors, sizes, durations, easings in component CSS. Token reference: `src/styles/tokens/`.
- Colors in `oklch()`. One hue drives the theme: `--vd-hue-accent`. Light/dark via `light-dark()`
  and `color-scheme`; `data-theme="dark|light|auto"` on any element (dark by default).
- Re-scoping (`data-theme`, `data-density`, or overriding `--vd-hue-accent`) works on `:root` or
  on an element that carries `data-theme` or `data-density` (derived tokens are re-declared there).
- Modern CSS is welcome: `color-mix()`, `:has()`, container queries, logical properties only
  (no `left`/`right`/`margin-left`; sole exception: compensating the physical scrollbar gutter,
  D59), `@starting-style`.

## Design direction

Dark-first, bold type hierarchy, generous whitespace, thin translucent borders, restrained depth.
Full checklist: skill `vd-design-principles`. The essentials:

1. Restraint and consistency beat effects; apply polish through tokens, never one-off tweaks.
2. Fewer variants, better polished. Every component defines all relevant states (default, hover,
   focus-visible, active, disabled, loading, invalid, empty).
3. Hierarchy must survive the squint and grayscale tests; accent used sparingly (60-30-10).
4. Motion is short (100/200/300 ms), uses token easings, never shifts layout, and is off under
   `prefers-reduced-motion`.
5. Components survive real content: long/short labels, Ukrainian, RTL.

**Signature moves** (apply identically everywhere, never all on one element):
tinted neutrals · concentric radii · 1px inner top highlight on raised dark surfaces ·
cursor-following glow on interactive cards only · mono eyebrow labels (JetBrains Mono, uppercase).

Fonts: Manrope (UI, headings), JetBrains Mono (code, eyebrows, kbd). Focus ring: 2px accent
`outline` with 2px offset (survives `forced-colors`).

## API conventions

- Small surface, sensible defaults, one obvious way. Shared names: `variant`, `size`, `disabled`,
  `invalid`, `loading`.
- Compositional APIs for complex components (`<vd-select><vd-option/></vd-select>`) plus shortcuts.
- Escape hatches: class passthrough, CSS custom properties.
- User-facing default strings live in the locale (`@vadem/ui/locale`, `specs/locale.md`), never as
  literal input defaults: declare `input<string>()` and resolve with `vdTexts('<component>', ...)`.
  Add the entry to `VdLocale` and to every pack (`en`, `uk`); counts use `vdPlural`.
- Forms: native-element controls use the platform value binding (no custom CVA) and read
  validity from `NgControl` / Signal Forms; custom CVAs only for non-native controls.
  Labels/hints/errors go through `vd-field` (`VD_FIELD` contract, see `specs/field.md`). Additional
  descriptions use Field.descriptionIds, preserving hint/error rather than overwriting aria-describedby.
- Every component has `specs/<component>.md` (skill `vd-component-spec`).

## Definition of done (per component)

- [ ] Keyboard-only usable; axe passes (`vd-a11y-check`).
- [ ] All states in the demo gallery, both themes.
- [ ] Tokens only, no hard-coded values.
- [ ] Passes `vd-design-principles` and a `vd-design-review` pass with screenshots.
- [ ] Survives long/short labels, Ukrainian, RTL.
- [ ] Spec file + minimal logic test.
- [ ] Public API follows conventions and the `vd` prefix.
