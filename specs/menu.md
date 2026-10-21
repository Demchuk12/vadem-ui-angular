# Menu

Status: draft · Pattern: [APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

Actions, not values (use select for values). `popover="auto"` panel anchored to its trigger.

## Anatomy

```html
<button aria-haspopup="menu" aria-expanded="true" aria-controls="m" data-state="open">Дії</button>
<div class="vd-menu" id="m" role="menu" popover="auto" aria-labelledby="trigger">
  <div class="vd-menu__label" role="presentation">Проєкт</div>
  <button class="vd-menu__item" role="menuitem" tabindex="-1">
    <svg /> Редагувати <kbd slot="end">E</kbd>
  </button>
  <hr class="vd-menu__separator" role="separator" />
  <button class="vd-menu__item" role="menuitem" data-variant="danger">Видалити</button>
</div>
```

## Parts

| Part        | Selector                              | Props                                        |
| ----------- | ------------------------------------- | -------------------------------------------- |
| menu        | `[vdMenu]` (`exportAs: vdMenu`)       | -                                            |
| trigger     | `button[vdMenuTrigger]="menu"`        | combine with `vdButton`                      |
| item        | `button[vdMenuItem]`, `a[vdMenuItem]` | `variant: 'default' \| 'danger'`, `disabled` |
| separator   | `[vdMenuSeparator]`                   | -                                            |
| group label | `[vdMenuLabel]`                       | mono eyebrow (signature)                     |

Item slots: leading `vd-icon`, trailing `[slot="end"]` (shortcut/meta, mono).

## Keyboard

| Key               | Trigger                | Menu                                |
| ----------------- | ---------------------- | ----------------------------------- |
| `Enter` / `Space` | open, focus first item | activate item, close, focus trigger |
| `ArrowUp`         | open, focus last item  | previous (loops)                    |
| `ArrowDown`       | open, focus first item | next (loops), disabled skipped      |
| `Home` / `End`    |                        | first / last                        |
| printable         |                        | typeahead                           |
| `Escape`          |                        | close, focus trigger                |
| `Tab`             |                        | close, focus moves on               |

Pointer: hovering an item focuses it (one shared "current" item); click activates.

## States

`:popover-open` (fade + spring scale from the top), item `:focus` (fill), `data-variant="danger"`,
`aria-disabled`, trigger `aria-expanded` / `data-state`.

## ARIA contract

Trigger `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`; menu `role="menu"`,
`aria-labelledby` = trigger; items `role="menuitem"`, roving focus (`tabindex="-1"`, focus moved
programmatically); separators `role="separator"`; disabled items `aria-disabled`.

## Component tokens

`--vd-menu-padding`, `--vd-menu-radius` (items are concentric), `--vd-menu-min-width`.

## Core

`core/menu-controller.ts`: `new VdMenuController(trigger, menu, { items, onOpenChange })`.
Not yet: submenus, checkbox/radio items.

## Context menu

`[vdContextMenu]="menu"` on any region opens an existing `vdMenu` as a context menu. Several
regions may share one menu (one controller and one anchor per menu); `(opened)` fires before
opening so the consumer can point the menu at that region's item.

| Trigger                              | Opens at                                                |
| ------------------------------------ | ------------------------------------------------------- |
| Right-click (`contextmenu`)          | The pointer                                             |
| Touch long-press (500 ms, 10px slop) | The touch point (iOS Safari fires no `contextmenu`)     |
| `ContextMenu` key, `Shift+F10`       | The focused element's inline-start bottom corner        |
| `Shift` + right-click                | Not intercepted: the browser's own menu stays available |

A zero-size fixed anchor (`.vd-context-menu__anchor`) is placed at that point, measured and
corrected (transformed or container-query ancestors change the fixed containing block), and the
menu anchors to it, so the regular flip fallbacks keep it on screen. Logical insets: RTL opens
toward the inline end of the pointer.

| Prop  | Type   | Default                     | Notes                                         |
| ----- | ------ | --------------------------- | --------------------------------------------- |
| label | string | locale: `contextMenu.label` | Menu `aria-label` while this region opened it |

Keyboard inside the menu is identical to the menu button. Escape or activation returns focus to
the nearest focusable element of the region that opened it (or the region itself), never to the
anchor. The region (or an element inside it) must be focusable for keyboard access.

Discoverability: a context menu is invisible until you know it exists. Every action in it must
also be reachable another way (a row's own menu button, a toolbar); it is a shortcut, not the
only path. Do not share one `vdMenu` between a `vdMenuTrigger` and `vdContextMenu`.

For engines that fire `contextmenu` while the right button is still held, open after
its release so the opening gesture cannot immediately light-dismiss the popover. Retain
the original pointer position and opener. Cancel pending opening on pointer cancellation
or target destruction; keyboard context-menu opening remains immediate.
