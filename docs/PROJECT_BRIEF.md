# Vadem project brief

Saved from the user's project instructions on 2026-10-02. This is an English preservation of
the requirements, including proposals that still require approval, not a claim that the
existing implementation meets them. Current explicit user instructions take precedence.
Where historical repository rules conflict with this brief, follow this brief for future work
and surface the discrepancy before a related implementation change.

## Role and working agreement

Act as a senior front-end engineer and product/UI designer together. Do not deliver generic
visuals, inaccessible designs, or fragile code. Speak Ukrainian; code, comments, commits,
and documentation are English. Be honest about poor ideas and propose alternatives.

Inspect existing work before changing it. Ask concise questions about essential unknowns:
Angular version, browser targets, and accent preference. Do not ask about the decided fonts.
Verify current support for Popover API, anchor positioning, `corner-shape`, CSS `linear()`,
`@starting-style`, `text-wrap: pretty`, and `light-dark()`, plus the state of Angular Aria.
Explain findings before adopting these features and provide graceful fallbacks.

Propose a short plan, token scales, and signature moves for approval. Propose the shared
memory outline and skill list before creating them. Existing files are not evidence that
the user approved a conflicting choice. Work in small steps; after each implementation step,
build and run the demo and show changes. Check real dark/light Playwright screenshots and
iterate after a designer's critique. Record non-obvious decisions in `DECISIONS.md`.

Do not add dependencies, unrequested features, or abstractions without explaining the need
and waiting for the user's answer. Saving this brief authorizes documentation changes only.

## Product and naming

Personal component library for the user's apps, possibly open-sourced later. Angular first;
future React, Vue, and Svelte adapters must offer idiomatic, familiar APIs.

- Brand: **Vadem**. Package: `@vadem/ui`; future packages: `@vadem/react`, `@vadem/vue`,
  `@vadem/core`, `@vadem/tokens`.
- Component selectors: kebab-case `vd-`, such as `<vd-card>` and `<vd-tabs>`.
- Directive selectors: camelCase `vd`, such as `<button vdButton>` and `<input vdInput>`.
- TypeScript classes: `Vd` prefix. CSS classes: `.vd-*`; modifiers only when data attributes
  are insufficient. CSS custom properties: `--vd-*`.
- State attributes have no prefix: `data-variant`, `data-size`, `data-state`, `data-invalid`.
- Enforce selectors with Angular ESLint. Centralize configurable prefix and brand in workspace
  configuration and tokens to make renaming cheap.

## Architecture constraints

1. Own CSS only: no Tailwind, CSS-in-JS, UI kits, or utility libraries.
2. Minimal dependencies: Angular-only runtime peers; dev tooling is allowed after approval.
   CDK only for genuinely hard select/combobox, menu, overlay, or virtual-scroll behavior.
   Wrap it behind Vadem services/directives; no public CDK types. Prefer native `<dialog>`,
   `inert`, Popover API, and anchor positioning with necessary fallbacks.
3. Modern Angular: standalone, signals, `input()`/`output()`/`model()`, OnPush,
   zoneless-compatible, SSR/hydration-safe; no direct `window`/`document` globals. Prefer
   attribute directives on native elements where they preserve native semantics.
4. Accessibility: WAI-ARIA APG, full keyboard support, `:focus-visible`, reduced motion,
   sufficient contrast, and axe checks are mandatory.
5. Portable CSS: no `:host` or dependency on ViewEncapsulation. Stable markup and `data-*`
   state must let all adapters reuse styles. Complex logic (select, tabs, dialog, menu) is
   pure TypeScript with zero Angular imports; adapters bind signals, DI, and forms. Simple
   components remain native Angular. Do not freeze the core API before two adapters exist.
6. No external runtime assets: self-hosted fonts and an own SVG set, no font links/icon CDNs.

## Design system

Inspired by the feel of nestjs.com with an independent identity: no copied logo,
illustrations, or exact brand color. Dark-first, light derived from semantic tokens.
Three layers: primitives → semantic → component. Themes change only semantic tokens.
Use `oklch()` and a single accent hue variable, `--vd-hue-accent`.

Bold typography, generous whitespace, thin translucent borders, subtle interaction glow,
restrained shadows, and first-class code/monospace. Density and radius are tokens.
Define every relevant default, hover, focus-visible, active, disabled, loading, invalid,
and empty state. Use `@layer`, `color-mix()`, container queries, `:has()`, and logical
properties. Motion is short, purposeful, and fully disabled under reduced motion.

### Signature moves: proposed, pending confirmation

Choose 3–4 and apply consistently through tokens; never stack all effects everywhere:
tinted neutrals, concentric radii, a 1px inner top highlight on dark surfaces, and
cursor-following glow on interactive cards.

### Typography

- Manrope variable for UI/headings and JetBrains Mono variable for code, both OFL.
  Verify current versions and licenses; include license files.
- Verify Cyrillic including і, ї, є, ґ and tabular figures. Subset Latin + Cyrillic into
  woff2 with `unicode-range`, `font-display: swap`; preload only the critical file.
- Token stacks: `--vd-font-sans` and `--vd-font-mono` with real system fallbacks.
  Tune fallback `size-adjust` and `ascent-override` to reduce layout shift.
- Manrope is wide: tune tracking by size, roughly -0.02em on large headings and slightly
  positive on small uppercase labels; inspect the scale in the gallery.
- Balanced headings, pretty paragraphs with fallback, tabular numbers for tables/prices/
  counters, and fluid `clamp()` sizes on a clear 1.2 or 1.25 modular scale.

### Color, depth, and shape

- Tinted neutrals: accent-related hue, chroma roughly 0.005–0.02; no pure black or white.
  Perceptually even accent and success/warning/danger/info ramps. Accent roughly 60–30–10.
- Dark elevation uses increasing surface lightness. Layer shadows (2–3 blurs/opacities),
  thin translucent borders, and low-alpha 1px inset top highlights on dark cards.
- Blur only for overlays/sticky headers, with solid fallback and performance awareness.
  Gradient borders/noise are optional and require a design review.
- Concentric radii: inner radius = outer radius minus padding. Optical icon alignment.
  One 4px spacing scale; no magic numbers. Evaluate squircle as progressive enhancement.

### Motion and micro-interactions

- Duration tokens: 100/200/300ms; custom easing, never default `ease`. Consider CSS
  `linear()` for spring-like dialog/popover behavior with fallback.
- Enter/exit through `@starting-style` and `transition-behavior: allow-discrete` where
  supported. Press feedback `scale(.98)`. Never animate layout-shifting properties.
  Disable all motion under `prefers-reduced-motion`, retaining understandable static states.
- Double focus ring: background-colored inner ring plus offset accent outer ring.
- Card glow uses `radial-gradient` with `--vd-x`/`--vd-y`, pointer interaction, no layout cost.
- Soft skeleton shimmer; loading buttons preserve width. Style selection, caret, native
  accent, scrollbar color, and width.

### Icons and content

- One own SVG set: 24px grid, 1.5px stroke, `currentColor`, rounded corners consistent
  with radius tokens. Do not mix icon sets.
- Design empty, error, loading, and success states with short human copy, not "No data".
- Test very long/short labels, many items, Ukrainian, and RTL; avoid lorem-only demos.
- Check hierarchy through squint and grayscale tests. Prefer a few polished variants.
- Composition demos: dashboard, settings form, login page.

## APIs and component contracts

Small API, sensible defaults, one obvious way. Consistent `variant`, `size`, `disabled`,
`invalid`, `loading`. Compositional complex APIs (`<vd-select><vd-option/></vd-select>`)
with shortcuts for common cases. Escape hatches: classes and CSS custom properties.
Forms: ControlValueAccessor now, ready for Signal Forms. Native Angular accessors already
used by existing native controls should be evaluated before duplicating them.

Every component has a framework-agnostic `specs/<component>.md`: props, events, slots,
states, keyboard map, and ARIA contract for future adapters.

## Repository and tooling

Angular workspace library plus demo app, prepared for later monorepo extraction:
`projects/ui/` with secondary entry points by component group, `projects/demo/` with gallery
and composition screens, `specs/`, `src/styles/`, `src/fonts/` with licenses,
root `CLAUDE.md`, `.claude/skills/`, and `DECISIONS.md`.

Add tooling incrementally: ESLint, Prettier, Vitest/Jasmine for logic, Playwright for
component/visual checks, axe for accessibility. Skip Chromatic, Changesets, a docs site,
and schematics for now.

## AI workflow

Keep `CLAUDE.md` short/stable, well under about 150 lines: naming, hard constraints, design,
API conventions, definition of done, and working agreement. Only 4–5 key polish principles
and chosen signatures belong there; detailed procedures/checklists belong in skills.
Link token definitions, decisions, and specs rather than duplicating them.

Before creating workflow files, verify current Claude Code documentation for format and
locations. Project skills: `.claude/skills/<skill-name>/SKILL.md`, precise `name` and
`description` frontmatter ("Use when ..."), short procedure and checklist, one job each.
Show the skill list for approval before writing skills:

- `vd-new-component`: library, secondary entry point, token CSS, all-state gallery, spec,
  minimal logic test, accessibility check, and design-principles pass.
- `vd-tokens`: token layers/naming, colors, themes, spacing/radius/motion, no component literals.
- `vd-design-principles`: full visual checklist and chosen token-based signatures.
- `vd-design-review`: dark/light screenshots, squint/grayscale, realistic/RTL content,
  designer critique and concrete fixes.
- `vd-component-spec`: framework-agnostic component contracts.
- `vd-a11y-check`: keyboard, focus, ARIA, axe, reduced motion, contrast.
- `vd-cdk-wrapper`: native-first evaluation, wrappers, no public CDK types.
- `vd-adapter`: later, when starting React/Vue; reuse spec, CSS, pure TS, idiomatic API.

Skills must agree with `CLAUDE.md`; shared rules win. Update conventions and affected skills
together. Propose a skill when a procedure repeats for the third time. Log structural
reasoning in `DECISIONS.md`. Existing skills remain in place; this save does not approve
creating missing skills or rewriting them.

## Roadmap order

1. Tokens/themes and their gallery; self-hosted fonts and icon foundation.
2. Button, input, checkbox, switch, badge, card; establish conventions/signatures.
3. Tabs, dialog, tooltip, toast; native APIs first.
4. Select/combobox and menu; pure-TS logic, wrapped CDK only if needed.
5. Dashboard, settings, login demos to check composition.
6. Then evaluate core extraction and a React adapter.

This is the intended order, not a request to re-scaffold the existing workspace.

## Definition of done per component

- Keyboard-only operation and passing axe checks.
- All relevant states in both gallery themes.
- Tokens only: no hard-coded colors, sizes, durations, or easings.
- Design-principles checklist and screenshot-based design review passed.
- Realistic long/short labels, Ukrainian, and RTL survive.
- Framework-agnostic spec and minimal meaningful logic test.
- Public API follows shared conventions and `vd` prefix.

## Known historical differences to revisit when relevant

Existing `CLAUDE.md`, skills, and decisions describe vendored Lucide geometry rather than
an own icon set, a fifth mono-eyebrow signature, and slowed continuous loading animation
under reduced motion. These are historical choices, not fresh approval under this brief.
Do not migrate them as part of saving memory. Evaluate with the user in the relevant task.

## Documentation consulted for this save

- [Claude Code memory](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)

Checked on 2026-10-02: root `CLAUDE.md` and project `.claude/skills/<name>/SKILL.md`
are documented locations; skills support YAML `name` and `description` fields.
