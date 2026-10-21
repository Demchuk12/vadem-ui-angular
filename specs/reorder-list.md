# Reorder list

Status: stable · Pattern: native ordered list with native move buttons and optional pointer dragging.

## Props and events

| Name                                                          | Type                                                                    | Default                                 | Notes                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| items                                                         | readonly { id: string; label: string; description?: string }[], two-way | []                                      | Immutable array, unique nonempty stable IDs |
| disabled                                                      | boolean                                                                 | false                                   | Disables every movement                     |
| label, instructions, upText, downText, emptyText, invalidText | string                                                                  | locale: reorderList corresponding entry | UI copy                                     |
| movedText                                                     | (label, position, total) => string                                      | locale: reorderList.movedText           | One-based result announcement               |
| canceledText                                                  | (label) => string                                                       | locale: reorderList.canceledText        | Active drag cancellation announcement       |

itemsChange emits a new ordered array only on an actual move. reordered emits
{ id, fromIndex, toIndex, method: 'buttons' | 'pointer' }; indices are zero-based.
Original item records are preserved, never mutated. Application owns persistence and replacement.
No per-row locks, cross-list moves, rich item templates, sorting/filtering, form accessor or service.
Invalid duplicate/empty IDs show invalidText with no row actions; replacement fixes the state.

## Anatomy and states

`vd-reorder-list.vd-reorder-list` wraps an ol.vd-reorder-list__list and persistent polite status
outside the list. Native ordered semantics plus role=list preserve list exposure without CSS
markers. Each li has data-reorder-id, index, a decorative ordinal, plain label/description,
a pointer-only aria-hidden grip and native Up/Down buttons. No listbox/option selection,
aria-grabbed or aria-dropeffect. The pointer grip has no separate keyboard stop; buttons provide
all equivalent actions without dragging. Button accessible names include action text and label.

Host data-state: empty, invalid, idle, disabled, dragging. Row data-dragging marks the source;
data-drop before/after marks the proposed insertion boundary without changing row geometry/order.
Boundary buttons and global disabled use native disabled. Moving to a boundary keeps focus
on the same item, using its remaining available action. Empty/invalid lists have no move controls.

## Pointer interaction

Primary mouse/touch/pen begins only on the grip, with pointer capture and touch-action:none.
Other row content keeps native text selection and page scrolling. A 4 CSS-pixel dead zone
avoids accidental moves. Drag target follows existing row rectangles; same-row release is a no-op.
Rows stay stationary until drop. Release inside the list commits; outside release, Escape,
Tab, pointercancel, lost capture, external array replacement, disable or destruction cancel.
No model mutation or reordered event occurs on cancellation. Destruction is silent.
Changing the list in place is unsupported: supply a new immutable array to invalidate a drag.

One vertical list only. No edge auto-scroll, floating ghost or dragging across documents/lists.
Scroll the page before grabbing an offscreen item or use move buttons to reach any position.
Missing pointer capture leaves the complete button alternative usable.

## Keyboard, focus and accessibility

Tab/Shift+Tab follow native button order. Enter/Space activate Up/Down; no custom arrow-key mode.
Escape/Tab cancel an active pointer gesture; idle Escape and modified keys remain untouched.
RTL retains vertical meaning: Up is earlier, Down later. Grip does not intercept keyboard actions.
Stable IDs preserve row identity. After DOM moves, restore the same focused action when available, otherwise its sibling action on the same item. External removal selects the nearest remaining row action; empty or
globally disabled lists receive programmatic list focus (tabindex=-1). Outside focus is preserved. Keyboard move actions scroll the focused control into view with native instant nearest scrolling; pointer-drop recovery does not force page scrolling.

The list has a localized name and an instruction reference. Initial/render-only state is silent.
Actual moves announce label and new position through a persistent role=status, aria-atomic=true.
The status child is keyed per operation so identical messages can be inserted again. No focus
move accompanies announcements. Canceled active drags announce cancellation. No manual speech
support is implied by automated tests. Long labels/descriptions take full width in narrow containers; move buttons and the pointer grip reflow below them. Redundant action icons hide in that layout; text labels remain.

## Tokens and adapter notes

--vd-reorder-list-gap → space-3; padding → space-4; border → color-border;
fg → color-text; muted → color-text-muted; active-bg → color-action-subtle;
marker → color-focus; grip-size → control-height-lg; compact-action-padding → space-1; compact-grip-size → control-height-md. Existing Button/Icon tokens remain.
No new animation or token scale. Pure core validates IDs, calculates target and creates immutable
moves. Angular uses signals/OnPush, browser events and pointer capture on the grip, with cleanup;
no browser globals, document listeners, timers, CDK or runtime dependency are introduced.
