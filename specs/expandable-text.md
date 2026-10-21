# Expandable text

Status: stable · Pattern: [disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

## Props and events

| Name          | Type             | Default                              | Meaning                                                                                  |
| ------------- | ---------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| text          | string           | required                             | Plain text description; never HTML or projected interactive content                      |
| previewLength | number           | 240                                  | Positive integer grapheme count; finite positive fractions floor, invalid values use 240 |
| expanded      | boolean, two-way | false                                | Requested expansion; retained across text/limit updates                                  |
| expandLabel   | string           | locale: expandableText.expandLabel   | Show more button text                                                                    |
| collapseLabel | string           | locale: expandableText.collapseLabel | Show less button text                                                                    |

expandedChange: boolean on user toggle. External updates follow normal model semantics.
Short/empty text renders completely with no toggle; it never rewrites expanded. A later long
source therefore follows the current model. The limit counts grapheme clusters, not UTF-16,
words, visual lines or bytes. A preview can end mid-word; original source is never trimmed,
normalized or rewritten. This is a length-based disclosure, not responsive line clamping.

## Anatomy and states

`vd-expandable-text.vd-expandable-text` contains a paragraph with an interpolated prefix and
`span.vd-expandable-text__rest` holding the exact remaining source once. The rest is hidden
with native hidden when collapsed, excluded from layout and the accessibility tree. A visual
ellipsis is aria-hidden and present only when collapsed. Button follows the text, uses
aria-expanded and aria-controls referencing the unique remaining-text span. Expanded text has
exact original textContent, including spaces/newlines; no duplicated full-text accessibility copy.

Host data-state: empty, plain, collapsed or expanded. The text uses pre-wrap and anywhere
wrapping, preserving content in narrow layouts. No disabled/loading/error states are needed.
No clipping of accessible-but-invisible text, innerHTML, line measurement, observers, timers,
find-in-page auto-expansion, word-boundary matching or selection/clipboard interception.
Browsers may exclude collapsed suffixes from find-in-page; expand first to search/copy all text.

## Keyboard and focus

Native button Enter/Space toggles; Tab exits normally. Focus stays on the same button when
its label/expanded state changes. No live region or focus move on ordinary expansion or
consumer state changes. If a focused toggle disappears because text/limit makes it unnecessary,
the paragraph receives programmatic focus (tabindex=-1); focus elsewhere is preserved.
aria-controls target exists for the entire component lifetime, including short and empty states.
Callers can give contextual expand/collapse labels when several descriptions appear together.

## Fallback and adapter notes

Intl.Segmenter with grapheme granularity is in the supported browser baseline. If absent,
show the entire text without a toggle; never substitute code-unit slicing or break graphemes.
Pure splitting works without DOM; Angular uses signals, OnPush and native hidden. SSR uses
the same segmentation capability as its runtime and creates no browser resources. Matching
server/client Intl capabilities are required for identical hydration markup.

## Component tokens

--vd-expandable-text-gap → space-2; --vd-expandable-text-fg → color-text.
Button inherits its existing ghost/small tokens. No component animation, fixed height,
fade overlay, new semantic token or scale. Native wrapping and default focus styles remain.
