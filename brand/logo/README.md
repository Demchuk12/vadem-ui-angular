# Vadem logo

Concept: five rounded blocks form the letter V. Components stacking into a shape.

## Files

| File | Use |
|---|---|
| `vadem-mark-dark.svg` | Mark for dark backgrounds |
| `vadem-mark-light.svg` | Mark for light backgrounds |
| `vadem-mark-mono.svg` | One-color mark, inherits `currentColor` (print, embossing, README badges) |
| `vadem-logo-dark.svg` / `vadem-logo-light.svg` | Horizontal lockup: mark + wordmark |
| `favicon.svg` | 32px favicon, simplified to 3 larger blocks so it stays readable |

## Geometry (mark, 48 x 46 grid)

- Block size 14, corner radius 4 (radius is 2/7 of the block, keep the ratio when scaling).
- Row gap 2, rows offset by 8 horizontally. Bottom block is the accent.
- Opacity tiers: top row 50%, middle row 80%, bottom block solid accent.

## Colors

| Role | Dark bg | Light bg |
|---|---|---|
| Blocks | `#ECECF1` | `#14151A` |
| Accent | `#8472FE` | `#6855D6` |

The accent matches `--vd-hue-accent: 285`: `--vd-accent-500` on dark, `--vd-accent-600` (the action
color) on light, read as sRGB from the browser. If the hue changes, update all files and re-export.

## Rules

- Clear space around the mark: at least one block (14 units) on every side.
- Minimum size: mark 16px tall (use `favicon.svg` below 24px), lockup 80px wide.
- Do not recolor individual blocks, rotate, add shadows or gradients.
- The wordmark must always be Manrope 600, letter-spacing -0.04em, lowercase "vadem".

## Wordmark outlines

The lockup wordmark is outlined (no live `<text>`): Manrope 4.505 instanced at wght 600 with
fonttools, glyphs placed at the positions Chromium/HarfBuzz shapes for "vadem" at 40px with
letter-spacing -1.6 (kerning included). Verified against live text rendered with the
self-hosted font: every glyph's ink span matches within 0.25 units.

## Raster exports

`npm run brand:export` renders the SVGs in Chromium into `export/`: `vadem-avatar-512.png`,
`vadem-avatar-1024.png` (npm/GitHub), `vadem-social-1200x630.png` (social preview, with a mono
"Angular UI library" line) and `favicon.ico` (16/32/48 PNG frames from `favicon.svg`).

## Provenance metadata

Each SVG carries an embedded C2PA manifest from when it was generated. The accent update and
the outlined wordmark changed the files after signing, so the manifests no longer validate
against the current content. They are kept as-is (not stripped); re-sign or remove them
deliberately if needed.
