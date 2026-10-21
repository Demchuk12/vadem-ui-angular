# Accordion

Status: draft · Pattern: disclosure on native `<details>`/`<summary>`

Stacked sections whose bodies show and hide: FAQs, settings groups, long forms. Not tabs: all
headings stay visible and several sections may be open (unless `exclusive`).

## Anatomy

```html
<div class="vd-accordion">                                  <!-- [vdAccordion] -->
  <details class="vd-accordion__item" name="vd-accordion-3" open>   <!-- details[vdAccordionItem] -->
    <summary>Як змінити тарифний план?</summary>
    <div>...content...</div>
  </details>
</div>
```

## Props

| Part                       | Inputs | Notes |
| -------------------------- | ------ | ----- |
| `[vdAccordion]`            | `exclusive` | Items share a `name`: the browser keeps at most one open. |
| `details[vdAccordionItem]` | `open` (attribute or `[(open)]`), `(openChange)` | Mirrors native toggles (summary, find-in-page, exclusive siblings). |

An item works on its own (outside a group) and then draws its own box.

## Keyboard

Native: the summary is a button (Tab, Enter/Space). Find-in-page opens the item that contains the
match (where supported).

## States

| State         | Reflected as |
| ------------- | ------------ |
| open          | `[open]` - chevron rotated 180deg |
| hover         | summary fill |
| focus-visible | inset ring on the summary |
| motion        | height animates via `::details-content` + `interpolate-size` where supported; instant elsewhere and under reduced motion |

## ARIA contract

- Native disclosure semantics (summary exposes expanded/collapsed). Put a heading inside the
  summary only if the page outline needs it.

## Component tokens

`--vd-accordion-radius`, `--vd-accordion-border`, `--vd-accordion-bg`, `--vd-accordion-padding`.

## Adapter notes

Angular: two directives (`VD_ACCORDION`). React/Vue: same markup; sync `open` from the `toggle`
event.
