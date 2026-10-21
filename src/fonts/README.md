# Fonts

Self-hosted variable fonts, subset to Latin + Cyrillic (incl. Ukrainian і ї є ґ, ₴, №) as woff2.
Both are licensed under the SIL Open Font License 1.1 (see `OFL.txt` in each folder).

| Family         | Version | Axes        | Source                                                           |
| -------------- | ------- | ----------- | ---------------------------------------------------------------- |
| Manrope        | 4.505   | wght 200-800 | https://github.com/google/fonts/tree/main/ofl/manrope           |
| JetBrains Mono | 2.304   | wght 100-800 | https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304 |

All OpenType layout features are kept (`tnum`, `case`, `zero`, `ss*`, `cv*`...). Hinting is
dropped (variable woff2 on modern platforms doesn't use it).

## Regenerate

Requires `fonttools` + `brotli` (Python). Not a project dependency.

```sh
LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
CYR="U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+20B4,U+2116"
sub() { pyftsubset "$1" --unicodes="$2" --layout-features='*' --flavor=woff2 \
  --no-hinting --desubroutinize --output-file="$3"; }
sub 'Manrope[wght].ttf'        "$LATIN" manrope/manrope-latin.woff2
sub 'Manrope[wght].ttf'        "$CYR"   manrope/manrope-cyrillic.woff2
sub 'JetBrainsMono[wght].ttf'  "$LATIN" jetbrains-mono/jetbrains-mono-latin.woff2
sub 'JetBrainsMono[wght].ttf'  "$CYR"   jetbrains-mono/jetbrains-mono-cyrillic.woff2
```

The `unicode-range` values in `src/styles/fonts.css` must match these ranges.

## Fallback metrics

`Manrope Fallback` (Arial / Liberation Sans) uses `size-adjust: 103.5%`, the average of the
English (104.3%) and Ukrainian (102.9%) letter-frequency width ratios at wght 400.
`ascent-override`/`descent-override` are Manrope's hhea metrics divided by that factor.
JetBrains Mono advance is 0.6em, identical to Menlo / DejaVu Sans Mono / Courier New.

## Preloading (apps)

Preload only the critical file, usually `manrope-latin.woff2` (or `manrope-cyrillic.woff2`
for a Ukrainian-first app). The URL must match the file your build emits.
