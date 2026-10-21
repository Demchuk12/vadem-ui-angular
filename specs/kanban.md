# Kanban

Status: draft · Pattern: named groups of native lists; each card has a menu button
([APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)) and optional pointer dragging.

A board of columns with cards that the application owns: deal pipelines, task boards.

## Props and events

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| columns | readonly { id; title; cards: readonly { id; label }[] }[] | [] | Immutable; IDs unique across the board |
| disabled | boolean | false | Disables every move (menus and dragging); card content stays interactive |
| label, instructions, emptyText, invalidText, upText, downText, moveToText | string | locale: kanban.* | UI copy |
| countText | (count) => string | locale | Spoken column size, plural-aware |
| moveLabel | (card) => string | locale | Accessible name of each card's Move button |
| movedText, canceledText | functions | locale | Announcements |

`cardMove` emits `{ cardId, fromColumnId, toColumnId, fromIndex, toIndex, method: 'menu' |
'pointer' }`. `toIndex` is the card's index in the target column after the move. The board never
changes `columns`: the application applies the request (`vdKanbanApplyMove(columns, move)` returns
new columns, keeping untouched columns' identity) or ignores it to reject the move, for example
after a failed save. No-op moves are never emitted.

Templates: `ng-template[vdKanbanCard]` (context: `$implicit` card, `column`, `index`) replaces
the default card content (the label). `ng-template[vdKanbanColumnHeader]` (context: `$implicit`
column) adds content under the title, such as a total. Interactive content inside a card (links,
buttons, fields) keeps its own pointer behavior and never starts a drag.

Out of scope: column reordering, WIP limits, per-card locks, swimlanes, virtualization, edge
auto-scroll while dragging, cross-board dragging. Hundreds of cards per board are fine; every
card renders a small menu.

## Anatomy

`vd-kanban.vd-kanban` > visually hidden instructions, `div.vd-kanban__columns` (role=group,
named by `label`, described by the instructions, horizontally scrollable) > `section.vd-kanban__column`
(named by its title) > `header.vd-kanban__header` (title, visible count with a spoken
`countText`, optional header template) + `ul.vd-kanban__cards` (role=list) > `li.vd-kanban__card`
(tabindex=-1, focus target only) with `.vd-kanban__content` and an icon-only Move button that opens
a menu: Move up, Move down, separator, "Move to" label, one item per other column (appends at the
end). A persistent `role=status` outside the columns announces moves.

## States

| State | Reflected as |
| --- | --- |
| idle / disabled / dragging / invalid | host `data-state` |
| dragged card | card `data-dragging` (subtle action background) |
| drop position | `data-drop="before|after"` on the neighbouring card (a line in the gap, no geometry change) or `data-drop-target` on an empty column |
| boundary moves | Move up/down items `aria-disabled` at the column edges |
| empty column | `li.vd-kanban__empty` with `emptyText` |
| invalid IDs | `invalidText`, no cards or move controls |

## Keyboard and pointer

- Tab moves through card content and Move buttons in reading order. Enter/Space/ArrowDown open the
  menu (Menu Button pattern); activation moves the card and closes the menu.
- After a move, once the application renders the card in its new place, focus returns to that
  card's Move button (only if focus was lost or inside the board).
- Mouse/pen: press on the card (not on interactive content), move 4px to start. The drop target is
  the column under the pointer; the position is computed from the other cards' middles. Release
  inside a column requests the move; release outside, Escape, Tab, pointercancel, lost capture,
  disabling or replacing `columns` cancel. The card receives focus when a drag starts so Escape
  reaches the board.
- Touch: no dragging (native scrolling wins); use the Move menu.
- RTL: columns flow from the inline start; vertical meaning of up/down is unchanged.

## ARIA contract

- Board: role=group with `label` and `aria-describedby` instructions.
- Column: `section` labelled by its title, which includes the spoken count.
- Cards: `ul`/`li`; the Move button name is `moveLabel(card.label)`.
- Announcements: `movedText(card, column, position, total)` when a move is requested,
  `canceledText(card)` when an active drag is canceled. The request is announced at emit time; if
  the application rejects it, it should show its own feedback.

## Component tokens

`--vd-kanban-gap` (space-4), `--vd-kanban-column-width` (18rem), `--vd-kanban-column-padding`,
`--vd-kanban-column-radius` (radius-surface), `--vd-kanban-column-bg` (surface-sunken),
`--vd-kanban-column-border`, `--vd-kanban-card-gap`, `--vd-kanban-card-padding`,
`--vd-kanban-card-radius` (concentric), `--vd-kanban-card-bg` (surface-raised),
`--vd-kanban-card-border`, `--vd-kanban-card-shadow` (highlight-top), `--vd-kanban-muted`,
`--vd-kanban-active-bg`, `--vd-kanban-marker` (color-focus). Forced colors: system borders,
Highlight for the drop marker and dragged card.

## Adapter notes

Pure core (`core/kanban.ts`): ID validation, move requests with clamping, immutable apply, insert
index and column hit testing. Angular binds pointer capture on the card, signals and OnPush, menus
from `@vadem/ui/menu`; no document listeners, timers, CDK or runtime dependencies.
