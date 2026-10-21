# Table

Status: draft · Pattern: native `<table>`; APG sortable table

Tabular data with column headers, optional sorting and row selection. The consumer renders
rows; the library styles the table, owns the sort state and ships a pure sort helper.
Not a grid: cells are not focusable and there is no 2D keyboard navigation (use controls inside
cells instead). A data grid would be a separate component.

## Anatomy

```html
<div class="vd-table-scroll" role="region" tabindex="0" aria-label="Розгортання">
  <table class="vd-table" data-size="md" data-sticky-header>
    <caption>
      ...
    </caption>
    <!-- optional -->
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" class="vd-checkbox" aria-label="Вибрати всі" /></th>
        <th scope="col" aria-sort="ascending" data-sorted>
          <button type="button" class="vd-table__sort">Проєкт <vd-icon /></button>
        </th>
        <th scope="col" data-numeric>...</th>
      </tr>
    </thead>
    <tbody>
      <tr data-selected>
        ...
      </tr>
      <tr>
        <td class="vd-table__empty" colspan="5">Нічого не знайдено</td>
      </tr>
      <!-- empty -->
    </tbody>
  </table>
</div>
```

## API

| Part                     | Inputs                                                                        | Notes                                                                     |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `table[vdTable]`         | `size: 'sm' \| 'md'` (`md`), `stickyHeader`, `sort: VdSort \| null` (two-way) | `exportAs: 'vdTable'`.                                                    |
| `th[vdSortHeader]="key"` | -                                                                             | Renders a button; click toggles: new column ascending, same column flips. |
| `tr[vdRow]`              | `selected`                                                                    | `data-selected` styling only.                                             |
| `td[vdTableEmpty]`       | -                                                                             | Empty / no-results cell (`colspan` = column count).                       |
| `[vdTableScroll]`        | -                                                                             | Scroll container: `role="region"`, `tabindex="0"`; needs a name.          |

Cell attributes: `data-numeric` on `th`/`td` aligns to the end (tabular numerals are on for the
whole table). Row headers: `<th scope="row">`.

Core (`@vadem/ui/table`): `vdSortRows(rows, sort, { accessor?, locale? })` - stable copy;
numbers/dates by value, text with `Intl.Collator` (numeric, base sensitivity), empty values last
in both directions. `vdNextSort(current, key)`.

## Keyboard

Native: Tab reaches the scroll region (when it can scroll), sort buttons and controls in cells.
Enter/Space on a sort button sorts.

## States

| State                 | Reflected as                                                      |
| --------------------- | ----------------------------------------------------------------- |
| sorted column         | `aria-sort` + `data-sorted` on the `th`; arrow icon in accent     |
| unsorted, hover/focus | faint up-down icon on the button                                  |
| row hover             | `--vd-table-row-hover`                                            |
| selected row          | `data-selected` - accent-subtle background                        |
| empty                 | `.vd-table__empty` - centered muted text                          |
| sticky header         | `data-sticky-header` - header cells stick to the scroll container |

## ARIA contract

- Native table semantics; `scope="col"` on column headers (consumer).
- `aria-sort` only on the currently sorted column (APG); the button is the control, the `th`
  carries the state. The button's name is the column label.
- Selection: a labelled checkbox per row (`aria-label="Вибрати <row name>"`) and a select-all
  checkbox with the mixed state. `aria-selected` is not used (only valid in grids).
- The scroll region needs `aria-label`/`aria-labelledby` (e.g. the caption id).
- Announcing re-sorts is optional; `aria-sort` changes are exposed to AT.

## Component tokens

`--vd-table-font-size`, `--vd-table-cell-padding-block`, `--vd-table-cell-padding-inline`,
`--vd-table-border`, `--vd-table-header-fg`, `--vd-table-header-bg` (sticky header; card bg
inside cards), `--vd-table-row-hover`, `--vd-table-row-selected`.

A card whose only child is the table (or its scroll container) drops its padding and the
first/last cells take the card padding, so rows run edge to edge.

## Adapter notes

Angular: directives above, `VD_TABLE` bundle. React/Vue: same markup; `vdSortRows` and
`vdNextSort` are framework-agnostic.

## Optional Data table state

`VdDataTable` and `VdTableColumn` are opt-in exports from the same entry point.
See [Data table](data-table.md) for stable-ID selection and column-visibility composition.

The gallery optionally composes [Active filters](active-filters.md) from its search/status state.
Removal affects only the named condition; clear resets both. These actions reset pagination while
preserving selected IDs/column visibility. The application restores search focus if it unmounts
the filter group after removing the final condition. No new Table API or filtering engine.
