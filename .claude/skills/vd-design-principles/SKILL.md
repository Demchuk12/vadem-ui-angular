---
name: vd-design-principles
description: Use when building or restyling any visual Vadem component, demo screen, or token - the full visual polish checklist (typography, color, depth, shape, motion, micro-interactions, icons, states, content) and how each signature move is implemented with tokens.
paths:
  - src/styles/**/*.css
  - projects/demo/**/*.css
---

# Vadem design principles

`CLAUDE.md` holds the top 5 principles and the signature moves; this is the full checklist.
Beauty comes from restraint and consistency. Never stack every effect on one component.

## Signature moves - how to implement

| Move | Implementation | Where |
| --- | --- | --- |
| Tinted neutrals | neutral ramp uses `--vd-hue-neutral` + `--vd-chroma-neutral` | all greys, borders, text |
| Concentric radii | inner = `calc(var(--vd-<c>-radius) - var(--vd-<c>-padding))`, clamp at `--vd-radius-xs` | anything nested in a rounded container |
| Top highlight | `box-shadow: var(--vd-highlight-top), <elevation shadow>`; token is transparent in light theme | raised surfaces (card, popover, dialog), primary button |
| Cursor glow | `radial-gradient(var(--vd-glow-size) circle at var(--vd-x) var(--vd-y), var(--vd-glow-color), transparent)` on a `::before`, opacity on hover; `--vd-x/y` set from `pointermove` | interactive cards only |
| Mono eyebrow | `.vd-eyebrow`: `--vd-font-mono`, `--vd-text-xs`, uppercase, `--vd-tracking-caps` | section labels, kbd, badges, metadata |

## Typography

- [ ] Manrope for UI/headings, JetBrains Mono for code/eyebrows; stacks from `--vd-font-sans/mono`
- [ ] Headings: negative tracking (`--vd-tracking-tight`), `text-wrap: balance`
- [ ] Paragraphs: `text-wrap: pretty`, max ~70ch
- [ ] Numbers in tables, prices, counters: `font-variant-numeric: tabular-nums`
- [ ] Sizes only from the type scale; fluid sizes come from tokens
- [ ] Small uppercase labels: positive tracking (`--vd-tracking-caps`)

## Color

- [ ] Accent used sparingly (60-30-10): one primary action per view
- [ ] Statuses come from the shared ramp curve; subtle bg + strong text pairs
- [ ] Dark elevation = lighter surface, not just a shadow
- [ ] AA contrast for text, 3:1 for UI boundaries and focus ring

## Depth and surfaces

- [ ] Elevation shadows are the layered tokens (`--vd-shadow-sm/md/lg`), never a single custom shadow
- [ ] Borders are translucent tokens (`--vd-color-border*`), not solid greys
- [ ] `backdrop-filter` only on overlays and sticky headers, with solid `@supports not` fallback

## Shape and rhythm

- [ ] Spacing only from `--vd-space-*` (4px base); no magic numbers
- [ ] Concentric radii on nested shapes
- [ ] Optical alignment: icons in buttons get a smaller gap on the icon side, centred visually
- [ ] `corner-shape: squircle` only inside `@supports (corner-shape: squircle)`

## Motion

- [ ] Durations/easings only from tokens; no `ease`, no `linear` for UI
- [ ] Only `opacity`, `transform`, `filter`, colors animate; never layout properties
- [ ] Enter/exit with `@starting-style` + `transition-behavior: allow-discrete`
- [ ] Open/closed states differ only in opacity/scale/translate/display; layout and geometry
      live on the base rule (never on `[open]`/`:popover-open` or UA `:modal` styles) - else
      the element jumps during its exit transition (DECISIONS D45)
- [ ] Nothing toggles `scrollbar-gutter` or the page width when overlays open
- [ ] Press feedback: `scale(var(--vd-press-scale))` on `:active`
- [ ] Reduced motion: durations come from tokens (zeroed); transforms guarded with
      `@media (prefers-reduced-motion: no-preference)` where they move things

## Micro-interactions

- [ ] Focus: `outline: var(--vd-focus-ring-width) solid var(--vd-color-focus); outline-offset: var(--vd-focus-ring-offset)` on `:focus-visible` only
- [ ] Loading keeps width (overlay spinner, label `visibility: hidden`)
- [ ] Skeleton shimmer uses motion tokens and stops under reduced motion
- [ ] `::selection`, `caret-color`, `accent-color`, scrollbars are set in `base.css` - don't override per component

## Icons

- [ ] Only `@vadem/ui/icon` icons (Lucide geometry, rendered at 1.5 stroke, round caps/joins,
      `currentColor`). Need a new one? Add it to `tools/icons.json`, run `npm run icons`
- [ ] Directional icons flip in RTL
- [ ] Decorative icons `aria-hidden`; standalone icons need a label

## States and content

- [ ] Default, hover, focus-visible, active, disabled, loading, invalid, empty where relevant
- [ ] Empty/error/loading/success copy is short and human ("Тут поки порожньо", not "No data")
- [ ] Tested with long and short labels, Ukrainian text, RTL
