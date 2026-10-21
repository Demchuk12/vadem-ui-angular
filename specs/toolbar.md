# Toolbar

Status: implemented · Pattern: [WAI-ARIA Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)

## Anatomy and content

`[vdToolbar]` is a named container of related native `button[vdButton][vdToolbarItem]`
actions. `[vdToolbarGroup]` names a subgroup; `[vdToolbarSeparator]` separates groups.
Use this pattern for three or more controls. Consumers own labels, click handlers, icons
and pressed states. First version supports buttons, including toggle buttons; text inputs,
sliders, radio groups, links and arbitrary composite widgets are outside this contract.
Nested independent toolbars own their own keyboard state.

## Props

| Target       | Name                                           | Type                   | Default           | Meaning                                             |
| ------------ | ---------------------------------------------- | ---------------------- | ----------------- | --------------------------------------------------- |
| Toolbar      | label                                          | string                 | Toolbar           | Accessible name, localize or supply aria-labelledby |
| Toolbar      | orientation                                    | horizontal or vertical | horizontal        | Layout and keyboard axis                            |
| Group        | label                                          | string                 | required          | Accessible group name                               |
| Group / item | hidden                                         | boolean                | false             | Native hidden state, skipped by navigation          |
| Button       | disabled / loading / variant / size / iconOnly | existing Button API    | existing defaults | Reuse Button behavior                               |

No selection model or toolbar-level disabled state is added. A fully unavailable or empty
panel has no Tab stop. Item availability follows Button disabled/loading and hidden group
ancestors. Use these bindings rather than hiding individual actions with CSS or replacing
native disabled through manual DOM mutations. All button actions must carry vdToolbarItem;
interactive descendants other than those specified above are unsupported.

## Events and states

Native click remains native; arrows do not invoke actions. Consumers bind aria-pressed for
persistent toggle buttons and expose confirmation/status where needed. Native disabled
buttons and loading buttons are skipped. The last focused enabled item remains the next Tab
entry. On removal/hiding/disabling/loading, focus recovers at the former position (next enabled
item, then previous); outside updates do not steal focus. DOM query order is visual order.

## Keyboard

| Key             | Action                                                         |
| --------------- | -------------------------------------------------------------- |
| Tab / Shift+Tab | Enter at first enabled or remembered control; exit in one step |
| Left / Right    | Navigate horizontal actions, mirrored in RTL; wrap at ends     |
| Up / Down       | Navigate vertical actions; wrap at ends                        |
| Home / End      | First / last available action                                  |
| Enter / Space   | Native button activation                                       |

Cross-axis arrows, IME and modified shortcuts remain untouched. Wrapping horizontal rows
keep logical DOM traversal; vertical arrow keys remain available to consumers. No global
shortcut, overflow menu, dropdown integration or automatic orientation breakpoint is added.

## ARIA

Root role=toolbar, aria-label or aria-labelledby, explicit aria-orientation. Groups have
role=group and a label. Separators have role=separator and the axis perpendicular to the
panel; no separator Tab stops. Button roles, names and pressed/busy states remain native or
consumer-owned. Exactly one available button has tabindex=0; all other actions have -1.
No aria-activedescendant, fake selected state or form value accessor.

## Component tokens

--vd-toolbar-gap: space-2; --vd-toolbar-padding: space-2; --vd-toolbar-radius: radius-lg;
--vd-toolbar-bg: color-surface; --vd-toolbar-border: color-border;
--vd-toolbar-separator: color-border-strong; --vd-toolbar-pressed-bg: color-fill;
--vd-toolbar-pressed-fg: color-text. Buttons retain their existing size/variant/focus tokens.
Logical layout and wrapping long labels support Ukrainian/RTL and narrow containers.
Inline padding caps at 3% of toolbar width and, below 30rem viewport width, 5% for text buttons, preserving label room
in small containers; icon-only buttons retain their existing geometry. Pressed
state has a border as well as a fill and survives forced colors; shared Button reduced-motion
behavior remains in use.

## Adapter notes

Angular exports VD_TOOLBAR, VdToolbar, VdToolbarItem, VdToolbarGroup and VdToolbarSeparator
from @vadem/ui/toolbar. Import VD_TOOLBAR and VdButton in standalone consumers. Signal queries
track projected actions and each button's disabled/loading state. The existing pure keyboard
helper handles navigation; a pure focus-entry helper handles recovery. Injected DOCUMENT
supports browser-only focus repair. After-render reconciliation confirms roving tabindex
beside Button host bindings; other Button behavior is unchanged. SSR/hydration is not claimed
as executed without dedicated validation.

```html
<div vdToolbar label="Document actions">
  <div vdToolbarGroup label="Editing">
    <button vdButton vdToolbarItem (click)="edit()">Edit</button>
    <button vdButton vdToolbarItem (click)="copy()">Copy</button>
  </div>
  <span vdToolbarSeparator></span>
  <button vdButton vdToolbarItem (click)="download()">Download</button>
</div>
```
