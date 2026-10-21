# Tree view

Status: implemented · Pattern: [WAI-ARIA tree view](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

## Anatomy and content

A native `ul[vdTree]` contains `li[vdTreeItem]`. Every item renders a row with a
chevron, visible text label and persistent selected check. Its projected `ul[vdTreeGroup]`
contains child items and is hidden while its parent is collapsed. Groups must be direct
content of their parent item; item labels are plain text, with no nested interactive controls.
Keys are unique, non-empty and stable within a tree. Consumers own navigation and content.
The full hierarchy stays mounted; no virtualization, async loading or forms binding.

## Props

| Target | Name     | Type           | Default  | Meaning                                                       |
| ------ | -------- | -------------- | -------- | ------------------------------------------------------------- |
| Tree   | value    | string or null | null     | Single selected key, two-way                                  |
| Tree   | label    | string         | Tree     | Accessible name; localize or provide aria-labelledby          |
| Tree   | disabled | boolean        | false    | Disables all actions; container remains discoverable with Tab |
| Item   | value    | string         | required | Unique item key                                               |
| Item   | label    | string         | required | Visible and accessible name, also used by typeahead           |
| Item   | expanded | boolean        | false    | Two-way expansion, meaningful only with children              |
| Item   | disabled | boolean        | false    | Focusable for discovery, cannot select or expand              |

## Events and states

`valueChange` reports selection; `expandedChange` reports expansion. Selection and focus
are independent. Hidden selection is preserved on collapse; focus returns to the visible
ancestor. Programmatic expansion/removal reconciles focus without moving focus from outside
the tree. Disabled nodes remain in the hierarchy and keyboard order, with aria-disabled.
Empty tree has no keyboard stop; consumers provide adjacent empty-state copy.

Tree: `data-disabled`, `aria-disabled`. Item: `data-selected`, `data-disabled`,
`data-expanded` (parents only), `aria-selected` (selectable nodes), `aria-disabled`.
Leaf nodes never receive aria-expanded. Selection has both a check and surface treatment.

## Keyboard

| Key                  | Action                                                              |
| -------------------- | ------------------------------------------------------------------- |
| Tab / Shift+Tab      | Enter at visible selection or first item; exit the tree in one step |
| Up / Down            | Previous / next visible node, no wrapping                           |
| Home / End           | First / last visible node                                           |
| Right (Left in RTL)  | Expand closed parent, otherwise focus first child                   |
| Left (Right in RTL)  | Collapse open parent, otherwise focus parent                        |
| Enter / Space        | Select focused enabled node, without toggling expansion             |
| Printable characters | Existing localized typeahead over visible nodes                     |
| *                    | Expand enabled sibling parents                                      |

IME composition and Ctrl/Meta/Alt-modified keys are not intercepted. Clicking a row
focuses and selects it; clicking its chevron focuses and toggles without selecting.

## ARIA and focus

Roles: tree, treeitem, group. Item name refers only to its own visible label via
aria-labelledby, excluding descendants. Explicit aria-level, aria-posinset and aria-setsize
reflect the actual sibling hierarchy including disabled nodes. Exactly one visible item has
roving tabindex=0; other items have -1. Disabled tree has only a container keyboard stop.
No aria-activedescendant, live-region announcements or automatic routing.

## Component tokens

`--vd-tree-gap`: space-1; `--vd-tree-indent`: space-4; `--vd-tree-padding`: space-2;
`--vd-tree-radius`: radius-sm; `--vd-tree-height`: control-height-md;
`--vd-tree-bg-hover`: color-fill-hover; `--vd-tree-bg-selected`: color-fill;
`--vd-tree-fg`: color-text; `--vd-tree-muted`: color-text-muted;
`--vd-tree-ring`: color-focus. Nested groups use logical indentation capped at 10% of their available width; long labels wrap.
Focus and selection remain visible in forced colors. Color transitions use shared reduced-motion tokens.

## Adapter notes

Angular exports VdTree, VdTreeItem, VdTreeGroup and VD_TREE from @vadem/ui/tree.
Standalone attribute directives/components preserve native list structure. Signals expose
value/expanded models; pure TS handles visibility and tree keyboard actions, with existing
@vadem/ui/keyboard typeahead. Document access is injected; browser-only focus reconciliation
runs after render. No SSR/hydration execution is claimed without dedicated verification.

### Angular example

```html
<ul vdTree label="Project files" [(value)]="selected">
  <li vdTreeItem value="docs" label="Documentation" [(expanded)]="docsOpen">
    <ul vdTreeGroup>
      <li vdTreeItem value="guide" label="User guide"></li>
    </ul>
  </li>
</ul>
```

Import `VD_TREE` in the consumer's standalone imports. `selected` starts at null or an
existing key; `docsOpen` is a boolean. Use explicit boolean bindings for expanded, such
as `[expanded]="true"`, and replace/update lists through normal consumer rendering.
