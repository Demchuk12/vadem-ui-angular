# Data table

Status: stable · Pattern: native table and checkbox controls.

A compositional extension of Table, exported from `@vadem/ui/table`. The consumer renders
native rows, cells, toolbar, pagination and the column chooser using existing components.
No fetching, persistence, filtering or sorting engine is added.

## Props and events

| Property      | Default   | Contract                                                     |
| ------------- | --------- | ------------------------------------------------------------ |
| rowIds        | []        | Unique selectable IDs on the current page; string or number  |
| selected      | empty Set | Two-way immutable selection; off-page IDs are retained       |
| columns       | []        | Unique keys and optional `required` flag                     |
| hiddenColumns | empty Set | Two-way hidden keys; required/unknown keys cannot hide cells |

`selectedChange` and `hiddenColumnsChange` emit new Sets on user actions.
`allSelected`, `someSelected`, `visibleColumns` are derived state.
`setSelected(id, checked)` ignores IDs outside rowIds. `selectAll(checked)` changes only
rowIds. `clearSelection()` clears all pages. `setColumnVisible(key, visible)` refuses to
hide required columns or the last visible column. `canHideColumn(key)` supports disabling
chooser controls. `resetColumns()` restores all columns.

## Anatomy, states and keyboard

`[vdDataTable]` is a nonvisual ancestor with no extra role or focus stop. Native checkboxes
carry checked/mixed selection and use Space; Tab visits controls in DOM order.
`th[vdTableColumn]` / `td[vdTableColumn]` share a key, reflect native `hidden`, and set
`aria-colindex` to their original 1-based index plus `columnOffset` (default 0).
`columnCount` includes that offset; the consumer binds it to the native table's
`aria-colcount`. Offset accounts for leading unconfigured columns such as selection.
Consumers update empty-state colspan to visibleColumns.length + columnOffset.
Hidden cells leave layout and the accessibility tree. Rows use existing vdRow styling;
selection is announced by the row checkbox, never aria-selected on a plain table row.

The optional chooser uses existing Popover, a named dialog, labeled native checkboxes,
Escape/light dismiss, and native invoker focus restoration. Required columns stay checked
and disabled with a visible explanation. No new visual tokens: Table, Checkbox, Button,
Choice and Popover retain their existing CSS contracts. Disabled/mixed/empty/focus states
come from those components. Selection survives changing pages or filtering; consumers
explicitly remove obsolete selected IDs when data is deleted.

## Adapter notes

Angular exports VdDataTable and VdTableColumn separately from VD_TABLE for opt-in use.
`#data="vdDataTable"` exposes the controller. Set inputs are readonly and never mutated.
Consumers must supply unique column keys and unique row IDs. Controlled invalid hidden
values cannot hide required columns or every column; the first column is kept visible.

## Filter composition

The gallery composes existing Select with search: status and text are combined with AND.
“All statuses” removes the categorical constraint. Each filter edit and reset returns to
page one without clearing selection or hidden columns. A separate polite result count
announces the number of matching invoices out of the total; selection count is independent.
Reset clears search and status only, and is disabled when neither is active. The empty-state
“Show all invoices” action resets both. Filtering stays consumer-owned because row schemas
and predicate semantics belong to the application; no generic query engine is added.
