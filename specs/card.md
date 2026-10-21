# Card

Status: draft · Pattern: container; interactive variant = one link/button target

## Anatomy

```html
<article class="vd-card" data-variant="default" [data-interactive]>
  <header class="vd-card__header">
    <h3 class="vd-card__title"><a class="vd-card__link" href="...">Title</a></h3>
    <p class="vd-card__description">Description</p>
    <span class="vd-badge">...</span>            <!-- extra header content: end column -->
  </header>
  ...content...
  <footer class="vd-card__footer">...</footer>   <!-- pushed to the bottom -->
</article>
```

## Props

| Name          | Type | Default | Notes |
| ------------- | ---- | ------- | ----- |
| `variant`     | `'default' \| 'raised'` | `default` | `raised`: lighter surface + medium shadow. |
| `interactive` | `boolean` | `false` | Glow + hover treatment. Automatic on `<a>`/`<button>` hosts. |

Parts (structure only, no props): header, title, description, footer, link.

## Interactive cards: two patterns

1. Whole card is the element: `<a vdCard href>` - simple; the full card text becomes the link
   name, so keep content short.
2. Stretched link: `<article vdCard interactive>` with `<a vdCardLink>` in the title - one tab
   stop with a short name; the link's `::after` covers the card. Other buttons/links inside stay
   clickable above it.

## States

| State         | Reflected as |
| ------------- | ------------ |
| interactive   | `data-interactive` |
| hover         | stronger border, larger shadow, 2px lift (no lift under reduced motion), glow fades in |
| glow          | `--vd-x` / `--vd-y` set from `pointermove` (mouse only) on the host |
| focus-visible | outline on the card (host focus, or `:has(.vd-card__link:focus-visible)`) |
| active        | press scale |
| loading       | consumer: `aria-busy="true"` on the card + `vdSkeleton` placeholders |
| empty         | consumer content; see gallery for the pattern |

## Keyboard

Native for the host/link. Stretched link: `Tab` reaches the link; `Enter` follows it.

## ARIA contract

- Use semantic hosts (`article`, `li`, `section`) as appropriate.
- Loading: `aria-busy="true"` on the card; skeletons are `aria-hidden`.

## Component tokens

`--vd-card-padding` (space-6; space-4 in containers < 24rem), `--vd-card-gap`,
`--vd-card-radius` (`--vd-radius-surface`), `--vd-card-inner-radius` (concentric, for nested
media), `--vd-card-bg`, `--vd-card-border`, `--vd-card-shadow`. Glow: `--vd-glow-size`,
`--vd-glow-color`, `--vd-glow-border`.

## Adapter notes

- Pointer tracking writes two custom properties directly on the element, outside the framework's
  render cycle (Angular: plain listener, no change detection; React: ref + listener, no state).
- The glow is two pseudo-elements: a soft radial fill and a border rim (masked). Hidden in
  `forced-colors`.
