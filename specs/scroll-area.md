# Scroll area

Status: stable · Pattern: native overflow container with a named region

## Anatomy

```html
<div class="vd-scroll-area" role="region" tabindex="0" aria-label="Activity">
  <!-- Consumer content remains in its original DOM. -->
</div>
```

One element is both the scroll viewport and the keyboard target. No extra wrappers,
synthetic scrollbar roles, scroll buttons or mirrored content. Use on a noninteractive
container, not a button, input or list element whose native semantics should be retained.

## Props

| Name             | Type   | Default  | Notes                                                           |
| ---------------- | ------ | -------- | --------------------------------------------------------------- |
| label            | string | required | Nonempty accessible region name; localized by the consumer.     |
| tabindex         | native | 0        | Consumer may set -1 when another composite owns keyboard entry. |
| aria-labelledby  | native | unset    | A visible heading can take precedence over the supplied label.  |
| aria-describedby | native | unset    | Optional consumer instructions.                                 |

Consumers provide dimensions through CSS; default max-block-size is none. A definite block
size or maximum is necessary for vertical scrolling. Content determines whether one or both
axes overflow; neither axis is hidden. Grid/flex parents must also permit their child to shrink.

## Events and content

Arbitrary native consumer content (text, lists, table, form controls, nested areas). Native
scroll/wheel/focus events and Element scrolling APIs remain available. No custom outputs,
position model, lifecycle observer or public scrolling method is added. Descendant controls
keep their own keyboard events and selection. Wheel/touch and scroll chaining are native.

## States

| State               | Reflection                                                                        |
| ------------------- | --------------------------------------------------------------------------------- |
| Default / overflow  | Native overflow:auto; OS/browser shows scrollbars when needed.                    |
| No overflow / empty | Content remains visible; keyboard region still has a stable Tab entry.            |
| Hover               | Native thumb interaction; no artificial animation or hover-only scrollbar hiding. |
| Keyboard focus      | :focus-visible token outline inset into the viewport boundary.                    |
| Forced colors       | System boundary/outline; native auto-colored scrollbars.                          |

No disabled, loading, invalid or selected state: this is a layout container, not an input.
Applications own empty/loading content and may use native hidden/inert where needed.

## Keyboard

| Key                                                  | Action                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Tab / Shift+Tab                                      | Enter/leave viewport and then visit native descendants in DOM order; no trap.              |
| Arrows, PageUp/PageDown, Home/End, Space/Shift+Space | Native browser scrolling when viewport is focused; exact axis/distance depends on browser. |
| Any key on descendants                               | Retained by the native control; no interception.                                           |

RTL is native, including scrollbar placement and signed scrollLeft. No custom RTL arithmetic.

## ARIA contract

The viewport is role=region with required nonempty label; aria-labelledby may name it from
visible text instead. No role=scrollbar, aria-valuenow or live region. Scroll positions are
not announced by application code. Focus remains where the consumer/browser places it.
Avoid unnecessary region nesting. When used on Splitter Pane, apply both directives to the
same element, with one tabindex/region, instead of adding a nested scroll viewport.

## Component tokens

| Token                           | Default                   |
| ------------------------------- | ------------------------- |
| --vd-scroll-area-bg             | --vd-color-surface        |
| --vd-scroll-area-border         | --vd-color-border-control |
| --vd-scroll-area-radius         | --vd-radius-md            |
| --vd-scroll-area-thumb          | --vd-color-border-control |
| --vd-scroll-area-track          | --vd-scroll-area-bg       |
| --vd-scroll-area-ring           | --vd-color-focus          |
| --vd-scroll-area-max-block-size | none                      |

No content padding is imposed; consumers provide inner spacing, including enough clearance
for descendant focus outlines. Both dimensions can shrink. Standard scrollbar-color and
scrollbar-gutter:stable progressively enhance native rendering; unsupported declarations
fall back to OS scrollbars. Overlay scrollbars need not reserve a gutter or be always visible.
scrollbar-width:auto retains OS width and user preference. Native thumb sizes/hit targets
remain OS-controlled. No fixed pixel thumb or thin/hidden variant.

## Adapter notes

Angular: `VdScrollArea` from `@vadem/ui/scroll-area`; attribute directive with required signal
label. No DOM globals, JS handlers, platform observers, value accessor or core state machine.
Native CSS handles resize, changing content, wheel/touch and browser scroll chaining.
Existing Table/Pane styles and consumers are preserved; the gallery demonstrates composition.

Sources: [MDN overflow accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility),
[scrollbar-color](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-color),
[scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter).
