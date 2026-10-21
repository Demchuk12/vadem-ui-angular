# Text highlight

Status: stable · Pattern: inline text with native mark elements for search relevance.

## Anatomy

```html
<vd-text-highlight class="vd-text-highlight" data-state="matched"
  >Перевірте <mark class="vd-text-highlight__match">ЗВІТ</mark> за зміну.</vd-text-highlight
>
```

## Props

| Name  | Type   | Default  | Notes                                                                                       |
| ----- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| text  | string | required | Plain source text; exact spelling, case, spacing and order are preserved                    |
| query | string | empty    | One literal substring, Unicode case-insensitive; every non-overlapping occurrence is marked |

No outputs, slots or generated user-facing copy. The application owns search/filtering,
ordering and result announcements. No locale section is needed because all content is provided.

## Matching contract

One phrase, left to right, non-overlapping. Empty query marks nothing; no match renders plain
text; empty source renders nothing. Query whitespace is meaningful and not trimmed. Regex
metacharacters are literal data. Matching uses the platform's Unicode simple case folding
(RegExp iu), preserving indices in the original string: Ukrainian upper/lowercase works,
including Ґ/ґ, Є/є, І/і, Ї/ї. It is not locale-specific case conversion, accent folding,
transliteration, stemming, canonical Unicode normalization or multiple-word tokenization.
For example cafe does not match café; ss does not match ß. Overlapping matches are not layered.

Source fragments are rendered as text nodes through escaping/interpolation, never innerHTML.
Text that looks like markup remains visible text. No DOM rewriting of descendants or existing
rich content. Native whitespace rendering is inherited; use white-space:pre-wrap on an owning
container if line breaks/repeated spaces should remain visually expanded.

## States

| State            | Reflection         | Rendering                                              |
| ---------------- | ------------------ | ------------------------------------------------------ |
| Empty source     | data-state=empty   | No text or marks                                       |
| No query/matches | data-state=plain   | Exact original text                                    |
| Matches          | data-state=matched | Text fragments with native mark, same font and metrics |

Hover, focus, disabled, invalid and loading belong to the containing control or application.
The highlighter has no tab stop, focus handler or animation. It inherits font, line height and
text direction. Marks remain inline so wrapping and Arabic shaping are left to the browser.

## Keyboard and ARIA

No keyboard behavior. Links/buttons/options containing highlighted text keep their original
accessible name and semantics. There is no live region, role override, tabindex, aria-hidden
copy or extra speech per match. Mark relevance may not be announced by every screen reader;
consumers own any concise result-count announcement when necessary. Native text selection and
copy preserve the complete source string, including unmarked fragments.

In forced colors, marks gain an underline while system colors remain user-controlled. Regular
text/background contrast is checked in both themes. 320px/200% and RTL must preserve complete
text without clipping or additional bidi isolation of individual matches.

## Component tokens

`--vd-text-highlight-bg` → color-action-subtle; `fg` → color-action-text;
`radius` → radius-xs. Padding is zero so emphasis does not widen text or change line metrics.
Existing semantic tokens and typography are reused; no new scale, signature or motion.

## Autocomplete integration

Autocomplete gains optional highlightQuery (string, empty). When supplied it uses Text highlight
for option labels; descriptions, filtering, ordering, selection and option accessible names
remain owned by the existing contract. Disabled label marks inherit the muted/system foreground. With empty highlightQuery the original plain label DOM
is retained. Free-text input and form behavior do not change. Explicitly pass the same query
that the application wants to visualize; the highlighter does not adopt the filter's matching
algorithm (e.g. accent-insensitive filters can return unmarked results).

## Adapter notes

Angular: VdTextHighlight from @vadem/ui/text-highlight; required text and optional query inputs,
OnPush, encapsulation None, computed pure segmentation. No native DOM access, timers, browser
globals or dependency. Pure core remains internal; no new cross-adapter core API is frozen.
