---
name: vd-tokens
description: Use when adding, renaming, or changing Vadem design tokens (color, type, spacing, radius, shadow, motion, density) or theme values, or when a component needs a value that has no token yet.
paths:
  - src/styles/tokens/**
  - src/styles/index.css
---

# Vadem tokens

Rules in `CLAUDE.md` (Styling architecture) win over this skill.

## Files

| File                               | Layer        | Contents                                               |
| ---------------------------------- | ------------ | ------------------------------------------------------ |
| `src/styles/tokens/primitives.css` | primitives   | raw scales: L/C curve, color ramps, space, type, radius, motion |
| `src/styles/tokens/semantic.css`   | semantic     | meaning: `--vd-color-surface`, `--vd-radius-control`, shadows, focus |
| `src/styles/components/<c>.css`    | component    | `--vd-<c>-*` tokens at the top of the component block  |

Themes swap **semantic only**. Components never read primitives directly.

## Procedure

1. Is there already a token that means this? Reuse it. Need a new *meaning*? Add a semantic
   token. Need a new *raw value*? Only then extend a primitive scale, and keep the scale regular.
2. Name: `--vd-<category>-<role>[-<variant>][-<state>]`, e.g. `--vd-color-text-muted`,
   `--vd-color-action-hover`, `--vd-radius-control`. Component tokens: `--vd-<component>-<prop>`.
3. Color:
   - Always `oklch()`. Ramps are built from the shared curve `--vd-l-<step>` / `--vd-c-<step>`
     times a family chroma and hue, so all families (accent, neutral, statuses) stay one family.
   - Neutrals are tinted: hue = `--vd-hue-neutral` (defaults to accent hue), low chroma. Never
     pure black/white; for translucent ink use tinted `oklch(... / alpha)`.
   - Light/dark pairs: `light-dark(<light>, <dark>)`. `light-dark()` only takes colors; for
     non-color differences (shadow strength) bake alpha into the colors.
   - Check contrast for every text/background pair you add (AA: 4.5:1 text, 3:1 large text and
     UI boundaries). Note the ratio in a comment if close to the limit.
4. Derived tokens that use `var()` (ramps, density) are declared in the
   `:where(:root, [data-theme], [data-density])` block so subtree overrides recompute.
5. Spacing: 4px base (`--vd-space-1` = 0.25rem). Type: 1.25 ratio, `clamp()` from `xl` up.
   Radius: `xs..2xl`, semantic `control/surface/overlay`. Motion: 100/200/300 ms + named
   easings; reduced motion zeroes durations in `semantic.css`.
6. Update the token gallery (`projects/demo/src/app/pages/tokens/`) so the new token is visible.
7. Breaking rename? Update every usage and note it in `DECISIONS.md`.

## Checklist

- [ ] Right layer (primitive / semantic / component)
- [ ] `oklch`, tinted, no pure black/white, contrast checked
- [ ] Works in dark, light, and `auto` theme
- [ ] Shows up in the gallery
- [ ] No hard-coded value left behind in component CSS (`grep -nE '#[0-9a-f]{3,8}|[0-9]+px|ms\b' src/styles/components`)
