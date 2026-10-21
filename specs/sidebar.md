# Sidebar

Status: draft · Pattern: app layout; drawer uses the [APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) through Dialog

Application shell with a side panel. Wide containers dock the panel beside the content and can
collapse it to an icon rail. Narrow viewports move the same content into a start-edge Dialog
drawer. The sidebar content is authored once; exactly one copy is rendered at any time.

## Anatomy

```html
<div class="vd-sidebar-layout" data-mode="docked" data-collapsed>
  <div class="vd-sidebar" id="vd-sidebar-1">
    <!-- consumer content, e.g. brand, nav.vd-navigation-list, footer -->
  </div>
  <div class="vd-sidebar-layout__body">
    <!-- consumer content: top bar with the toggle, main -->
    <button class="vd-sidebar-toggle" aria-expanded="false" aria-controls="vd-sidebar-1">…</button>
  </div>
</div>

<!-- data-mode="drawer": .vd-sidebar is absent from the layout; the same content renders in -->
<dialog class="vd-dialog vd-sidebar-drawer" data-placement="start">
  <header>title + close button</header>
  <div class="vd-sidebar">…</div>
</dialog>
```

## Props

| Part   | Name       | Type    | Default    | Notes                                                                  |
| ------ | ---------- | ------- | ---------- | ---------------------------------------------------------------------- |
| Layout | label      | string  | Navigation | Drawer dialog title; localize                                          |
| Layout | closeLabel | string  | Close      | Accessible name of the drawer close button; localize                   |
| Layout | collapsed  | boolean | false      | Two-way. Docked rail state; ignored (kept) while in drawer mode        |
| Toggle | —          | native  | —          | Consumer supplies the accessible name (e.g. "Навігація") and its icon |

Persisting `collapsed` (storage, cookies) is the application's choice.

## Events

| Name            | Payload | When                                  |
| --------------- | ------- | ------------------------------------- |
| collapsedChange | boolean | Toggle activated in docked mode       |

Drawer open/close is internal; no event is emitted.

## Slots / content

- Sidebar content (a template): any content. Navigation list links get rail treatment
  automatically. Other content opts out of the rail with `data-rail="hidden"`; the flag
  wins over consumer `display` rules.
- Body content: everything else (top bar, main). Place one or more toggles anywhere inside the
  layout, including inside the sidebar itself.

## States

| State           | Contract                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Docked          | `data-mode="docked"` at viewport width ≥ 64rem; sidebar sticky, full height, inline-start edge |
| Collapsed rail  | `data-collapsed`; rail width; navigation link text and metadata visually hidden, group labels become a hairline, `[data-rail="hidden"]` removed; rail tooltips show link text on hover/focus |
| Drawer          | `data-mode="drawer"` below 64rem; toggle opens a start-edge modal Dialog (bottom sheet below 40rem, as Dialog) |
| Drawer open     | Dialog open state; activating a link inside (without modifier keys) closes it                    |
| Toggle hover/focus | Consumer Button states                                                                        |

Collapse width changes are instant (no animated layout shift). Content never overflows the rail
horizontally.

## Keyboard

| Key               | Action                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Tab / Shift+Tab   | Native order: sidebar content first, then body                         |
| Enter / Space     | On a toggle: collapse/expand (docked) or open the drawer (drawer mode) |
| Escape            | Drawer: closes it, focus returns to the opening toggle (Dialog)        |
| Escape            | Rail tooltip: hides it (Tooltip)                                        |

No global shortcut is registered; a consumer may bind one and call the layout's toggle method.

## ARIA contract

- The layout and `.vd-sidebar` add no landmark; a consumer `nav` (Navigation list) provides it.
- Toggle (component): docked → `aria-expanded` reflects expanded rail state and `aria-controls`
  points at the sidebar; drawer → `aria-haspopup="dialog"` and `aria-expanded` reflects the drawer.
- Rail: link names stay in the accessibility tree (visually hidden, not `display: none`).
  Rail tooltips are visual duplicates and carry `aria-hidden="true"`; no `aria-describedby`.
- Drawer: Dialog's contract (modal, labelled by its title, focus trap, focus return).
- Switching modes while the drawer is open closes it; Dialog returns focus to the opening
  toggle, which is present in both modes.

## Component tokens

`--vd-sidebar-width` → 16rem; `--vd-sidebar-rail-width` → control-height-md + 2 × space-3 +
focus-ring room; `--vd-sidebar-padding` → space-3; `--vd-sidebar-gap` → space-6;
`--vd-sidebar-bg` → color-bg; `--vd-sidebar-border` → color-border;
`--vd-sidebar-block-size` → 100dvh (set a length to embed the layout in a bounded region).
Structural widths and the 64rem breakpoint are layout, as in Dialog. Logical properties;
RTL docks on the right. Forced colors keep the border. No motion.

## Adapter notes

Angular: `@vadem/ui/sidebar` exports `VdSidebarLayout` (`vd-sidebar-layout`, `collapsed` as
`model()`, `toggle()`), `VdSidebar` (structural `ng-template[vdSidebar]`), `VdSidebarToggle`
(`button[vdSidebarToggle]`) and `VD_SIDEBAR`. The mode is read from the CSS custom property
`--vd-sidebar-drawer` on the layout (set by the media query), re-checked by a ResizeObserver,
so the breakpoint lives only in CSS. Browser-only; SSR renders docked markup. Router is not
imported: link-click closing works with routerLink or plain href.
