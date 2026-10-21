# Navigation list

Status: stable · Pattern: native navigation landmark, lists and links.

## Anatomy

```html
<nav class="vd-navigation-list" aria-label="Workspace">
  <section aria-labelledby="workspace-heading">
    <h3 class="vd-navigation-label" id="workspace-heading">Workspace</h3>
    <ul role="list">
      <li>
        <a class="vd-navigation-link" href="/projects" aria-current="page">
          <svg slot="start" aria-hidden="true"></svg>
          <span>Projects</span>
          <span slot="end">4<span class="vd-visually-hidden"> open projects</span></span>
        </a>
      </li>
    </ul>
  </section>
</nav>
```

A simple list may be a direct child of nav. Groups use consumer-owned sections/headings;
there is no additional group component, route model or hierarchy controller.

## Props

| Part | Name                        | Type   | Default    | Notes                                                                   |
| ---- | --------------------------- | ------ | ---------- | ----------------------------------------------------------------------- |
| Root | label                       | string | Navigation | Landmark name; localize and distinguish other navigation regions        |
| Link | href, target, rel, download | native | native     | Consumer owns destinations and browser behavior                         |
| Link | aria-current                | native | absent     | Consumer/router sets page, location or true for the current destination |

## Events

Native link events only. No selection output, click cancellation or keyboard handlers.

## Slots / content

`nav[vdNavigationList]`: native list(s) with `li` children. Include `role="list"` on styled ul
for explicit list semantics across browsers. `[vdNavigationLabel]`: consumer heading or label
with its chosen heading level/id. `a[vdNavigationLink]`: optional decorative `[slot="start"]`
icon, one un-slotted span for visible text, optional `[slot="end"]` metadata/Badge.
Labels wrap fully, never truncate. Do not nest buttons/links inside a link. Give counts context
(e.g. visually hidden “open projects”); include zero when meaningful. Native link text supplies
the accessible name. Route metadata belongs to the application, not a generic data renderer.

## States

| State                       | Contract                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| Default                     | Native link with full label                                                                      |
| Hover / active              | Semantic fill/text change; no layout movement                                                    |
| Focus-visible               | Existing 2px focus ring plus offset; list padding preserves room                                 |
| Current                     | aria-current page/location/true; tinted fill, stronger text and inline-start indicator           |
| aria-current false / absent | Default appearance                                                                               |
| Narrow container            | Metadata moves below text below 14rem; below 12rem decorative icons yield the full row to labels |
| Empty / loading / error     | Consumer composition outside the links; no automatic live region                                 |
| Unavailable destination     | Omit link or render explanatory non-interactive content; no fake disabled-anchor API             |

Keep current page unique in its relevant set. For on-page locations use aria-current="location"
and compare fragments deliberately; do not mark every link to the current route as the page.

## Keyboard

Tab/Shift+Tab visit each native link in DOM order. Enter follows its destination. Browser
modifier-click, context menu, new tabs and history remain native. Space/arrow keys keep native
page scrolling; no roving focus, selection model, menu roles or tree behavior is introduced.

## ARIA contract

Native nav, ul/li and a semantics remain. No menu/menuitem/option roles, tabindex rewriting,
aria-selected, automatic current state or focus moves. Root owns aria-label; a consumer
aria-labelledby may name it through an existing heading. Decorative icons are hidden by Icon.
A heading can name each optional section. Counts must not duplicate a link name through a
separate focus target. Unrelated navigation landmarks need distinct names.

## Component tokens

`--vd-navigation-list-*`: gap → space-1; group-gap → space-6; padding → space-3;
font-size → text-sm; label-size → text-xs; radius → radius-control; text → color-text-muted;
hover-text/current-text → color-text; hover-bg → color-fill-hover; active-bg → color-fill-active;
current-bg → color-action-subtle; current-indicator → color-text-accent; icon-size → space-5;
focus → color-focus. Existing border/focus widths, font weights, tracking-normal (labels opt out of heading
tracking) and motion tokens are reused.
Structural column fractions and 14rem/12rem breakpoints are layout, not a new token scale.
Logical properties and inherited direction support RTL. Forced colors keeps the current
indicator and focus outline. Existing transition tokens disable movement under reduced motion;
there is no animation or transform.

## Adapter notes

Angular exports VdNavigationList, VdNavigationLink, VdNavigationLabel and VD_NAVIGATION_LIST
from `@vadem/ui/navigation-list`. All are standalone attribute directives with native DOM;
root label is a signal input, and there is no DOM access or complex core logic.
Router integration is consumer-owned: use routerLink, routerLinkActive and
ariaCurrentWhenActive="page" with deliberate match options. The library does not import Router.
The demo changes query parameters within its own page to demonstrate actual route matching
without replacing the existing gallery/sidebar implementations.
