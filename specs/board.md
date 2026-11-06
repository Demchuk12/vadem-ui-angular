# Board

Status: stable · Pattern: groups of native buttons

A grid of titled columns of value tiles, for quiz boards and similar pick-a-tile games. The same
tiles render as buttons for the person choosing and as plain elements for everyone watching.

## Anatomy

```html
<vd-board class="vd-board" role="group" aria-label="Round 1" style="--vd-board-columns: 6; --vd-board-rows: 5">
  <div class="vd-board__grid">
    <vd-board-column class="vd-board-column" role="group" aria-label="History">
      <div class="vd-board-column__heading" aria-hidden="true">History</div>
      <button class="vd-board-cell" data-state="open" type="button">
        <span class="vd-board-cell__value">200</span>
      </button>
    </vd-board-column>
  </div>
</vd-board>
```

## Props

`vd-board`

| Name    | Type     | Default  | Notes |
| ------- | -------- | -------- | ----- |
| `label` | `string` | required | Accessible name of the board. |
| `rows`  | `number` | `5`      | Tiles per column. The column count comes from the content. |

`vd-board-column`

| Name      | Type     | Default  | Notes |
| --------- | -------- | -------- | ----- |
| `heading` | `string` | required | Column title and its group name. |

`button[vdBoardCell]`, `div[vdBoardCell]`

| Name          | Type                             | Default | Notes |
| ------------- | -------------------------------- | ------- | ----- |
| `state`       | `'open' \| 'active' \| 'played'` | `open`  | See States. |
| `playedLabel` | `string`                         | locale  | Spoken for a played tile, whose value is hidden. |

## Events

Native `click` on `button[vdBoardCell]`.

## States

| State    | Meaning                 | Reflected as |
| -------- | ----------------------- | ------------ |
| `open`   | Can still be picked     | `data-state` |
| `active` | The tile in play        | `data-state`, `aria-current="true"`, accent fill |
| `played` | Done; keeps its place   | `data-state`, native `disabled` on buttons, sunken surface, value hidden |

## Layout

Columns use subgrid, so titles of different lengths share one row and tiles line up. Below `40rem`
of the board's own width (a container query, not the viewport) each column becomes a titled row of
tiles, so the board fits a phone without scrolling sideways.

## Keyboard

Native tab order and `Enter`/`Space` on buttons. Played buttons leave the tab order. `div` tiles are
not interactive.

## ARIA contract

- The board and each column are named groups; the visual title is hidden from the tree to avoid
  being read twice.
- Played tiles expose the locale's `board.playedLabel` instead of their value.

## Component tokens

| Token                        | Default                     |
| ---------------------------- | --------------------------- |
| `--vd-board-gap`             | `--vd-space-2`              |
| `--vd-board-cell-height`     | `--vd-space-16` (narrow: `--vd-space-12`) |
| `--vd-board-cell-font-size`  | `--vd-text-xl` (narrow: `--vd-text-sm`)   |
| `--vd-board-heading-fg`      | `--vd-color-text-muted`     |
| `--vd-board-cell-bg` / `-hover` | `--vd-color-surface-raised` / `--vd-color-fill-hover` |
| `--vd-board-cell-fg`         | `--vd-color-text`           |
| `--vd-board-cell-border`     | `--vd-color-border-strong`  |

## Adapter notes

- Angular: import `VD_BOARD` (`VdBoard`, `VdBoardColumn`, `VdBoardCell`).
- React/Vue: same markup; the column count and rows are custom properties on the board.
