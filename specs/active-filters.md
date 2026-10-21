# Active filters

Status: stable · Pattern: named group, native list and remove buttons.

## API

filters: readonly { id: string; label: string; value: string }[], default [].
Stable nonempty unique IDs are required; duplicate/blank IDs show invalidText without actions.
Labels/values are plain text, including long strings and mixed directions.
disabled: boolean, default false, disables every action with native disabled.
label, clearText, emptyText, invalidText: optional strings, locale:activeFilters entries.
removeLabel: optional (label, value) => string, locale:activeFilters.removeLabel.
filterRemove emits the stable ID; clearAll emits void. These are requests only: no input mutation,
optimistic removal, filter evaluation, query serialization, router or persistence coupling.
Consumers supply new immutable arrays after accepting requests; rejected/delayed requests leave
controls and focus intact. There are no per-filter locks, editing controls or toggle selection.

## Anatomy and states

vd-active-filters.vd-active-filters is role=group, tabindex=-1, named by label. Nonempty valid
filters render ul.vd-active-filters__list role=list and keyed li.vd-active-filters__item.
Each button.vd-active-filters__remove contains label/value in bdi, separated by a colon, and
a decorative x icon. The whole chip is one removal action, not a checkbox or a nested button.
A separate native Clear all button follows the list. No clear action for an empty/invalid list.
Empty/invalid states show plain explanatory text. Host data-state: active, empty, invalid, disabled.

## Keyboard and focus

Tab/Shift+Tab follow native remove buttons, then Clear all. Enter/Space activate; no arrow-key,
Backspace or Escape override. If the focused filter is removed, focus the next item at the same
index, otherwise the previous item. If its ID survives replacement/reordering, retain that item.
If all controls disappear or become disabled, focus the stable group programmatically. External
focus is never stolen; unchanged enabled controls retain focus. No live region: the consumer owns
result counts and async status announcements. Focus recovery does not imply a persistence result.

Keep the component mounted for its empty/disabled focus fallback. If an application hides/removes
the whole component, that application owns fallback focus. The Table demo returns it to search
when the last filter is removed or all are cleared. It preserves selection and resets pagination.

## Styling and accessibility

All visible copy is included in removal button names through removeLabel. List semantics survive
list-style removal. Bdi isolates label and value separately. Buttons retain existing focus,
hover, disabled, reduced-motion and forced-colors behavior. Wrapping preserves full text without
ellipsis or horizontal page overflow. No custom animation.

Tokens: --vd-active-filters-gap → space-2; --vd-active-filters-muted → color-text-muted.
Existing Button tokens own geometry/colors; component gap and text color reference existing tokens.

## Adapter notes

VdActiveFilters and VdActiveFilter exported from @vadem/ui/active-filters. Signals/OnPush/None,
SSR-safe ElementRef ownership, no browser globals, timers or document listeners. Capture owned
focus before view updates and recover after rendering only if needed. Pure core validates IDs.
