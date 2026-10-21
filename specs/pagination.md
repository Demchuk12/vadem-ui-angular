# Pagination

Status: draft · Pattern: navigation landmark with buttons, `aria-current="page"`

Moves between pages of a list or table. Buttons, not links: the consumer loads the page (for
URL-addressable pages, sync `page` with a query param).

## Anatomy

```html
<nav class="vd-pagination" role="navigation" aria-label="Сторінки рахунків" data-size="md">
  <button class="vd-pagination__step" aria-label="Попередня сторінка" aria-disabled="true">
    ‹
  </button>
  <ul class="vd-pagination__pages">
    <li>
      <button class="vd-pagination__page" aria-label="Сторінка 1" aria-current="page">1</button>
    </li>
    <li><span class="vd-pagination__ellipsis" aria-hidden="true">…</span></li>
    ...
  </ul>
  <button class="vd-pagination__step" aria-label="Наступна сторінка">›</button>
</nav>
```

## Props

| Name                          | Type                | Default        | Notes                                                    |
| ----------------------------- | ------------------- | -------------- | -------------------------------------------------------- |
| `page`                        | `number`            | `1`            | Two-way, 1-based; clamped to `1..pageCount` for display. |
| `pageCount`                   | `number` (required) | -              | From `Math.ceil(total / pageSize)`.                      |
| `size`                        | `'sm' \| 'md'`      | `md`           | 32 / 24 px buttons.                                      |
| `siblings`                    | `number`            | `1`            | Pages on each side of the current one.                   |
| `compact`                     | `boolean`           | `false`        | "3 / 12" between the steps (phones, card footers).       |
| `label`                       | `string`            | `'Pagination'` | Landmark name. Different on each pagination of a page.   |
| `previousLabel` / `nextLabel` | `string`            | English        | Localize.                                                |
| `pageLabel`                   | `(page) => string`  | `Page ${page}` | Name of each page button.                                |

Range (`vdPageRange`, pure): first and last page, siblings around the current one, ellipses for
gaps; constant length while paging (no layout jump); an ellipsis never stands for one page.

## Keyboard

Tab through steps and page buttons; Enter/Space activates. Steps at the edges are
`aria-disabled` (not `disabled`) so focus stays put when you reach the last page.
At narrow widths, numbered pagination scrolls inside its named navigation area rather than
expanding the page. Tab brings each focused button into view. Numeric labels never wrap;
padding preserves the full focus outline. Compact mode remains an explicit consumer choice.

## States

| State                          | Reflected as                                                |
| ------------------------------ | ----------------------------------------------------------- |
| current page                   | `aria-current="page"` - raised surface, border, strong text |
| hover / focus-visible / active | fill, ring, press scale                                     |
| edge step                      | `aria-disabled="true"` - dimmed, click ignored              |

## ARIA contract

- `role="navigation"` with a unique `aria-label`.
- Page buttons are named "Page N" (localized via `pageLabel`); the current one has
  `aria-current="page"`. Ellipses are hidden from AT.
- After a page change, move focus or announce the new range if the content above changes a lot
  (consumer; e.g. focus the table caption or a `role="status"` "Показано 21-40 з 312").

## Component tokens

`--vd-pagination-size`, `--vd-pagination-radius`, `--vd-pagination-gap`, `--vd-pagination-fg`,
`--vd-pagination-fg-hover`, `--vd-pagination-bg-hover`, `--vd-pagination-bg-current`,
`--vd-pagination-border-current`.

## Adapter notes

Angular: `vd-pagination` with a `page` model. React/Vue: `<Pagination page onPageChange>`;
`vdPageRange` is shared core.
