# Leaderboard

Status: stable · Pattern: ordered list

Standings: rank, name, score, with room for status and per-row actions. Fits a phone and a stream
overlay alike.

## Anatomy

```html
<ol class="vd-leaderboard" role="list">
  <li class="vd-leaderboard__row" data-leader aria-current="true">
    <span class="vd-leaderboard__rank">1</span>
    <span class="vd-leaderboard__main">
      <bdi class="vd-leaderboard__name">Name</bdi>
      <!-- default content: badges, status -->
    </span>
    <bdi class="vd-leaderboard__score" dir="ltr">1 200</bdi>
    <!-- [slot=actions] -->
  </li>
</ol>
```

## Props

`li[vdLeaderboardRow]` (inside `ol[vdLeaderboard]`)

| Name       | Type      | Default  | Notes |
| ---------- | --------- | -------- | ----- |
| `rank`     | `number`  | required | Passed in, not derived: equal scores may share a rank. Rank 1 is marked as leader. |
| `name`     | `string`  | required | Isolated with `<bdi>`. |
| `score`    | `string`  | required | Formatted by the application (Intl). Stays left-to-right in RTL. |
| `negative` | `boolean` | `false`  | Danger color, in addition to the minus sign in `score`. |
| `current`  | `boolean` | `false`  | The viewer's own row: `aria-current="true"` and an accent border. |
| `inactive` | `boolean` | `false`  | Muted name. Say why in projected content. |

## Slots / content

| Slot              | Accepts                                  |
| ----------------- | ---------------------------------------- |
| default           | Status next to the name (badge, "offline") |
| `[slot="actions"]` | Controls at the row's end, e.g. a score correction button |

## States

`data-leader`, `data-negative`, `data-inactive`, `aria-current="true"`.

## Keyboard

The list is not interactive. Projected controls keep their own behavior.

## ARIA contract

- An explicit `role="list"` keeps list semantics in Safari, which drops them with `list-style: none`.
- Rank is visible text, so it is read even where list numbering is not.

## What the application owns

Sorting, ties, formatting numbers, and announcing changes.

## Component tokens

| Token                          | Default         |
| ------------------------------ | --------------- |
| `--vd-leaderboard-gap`         | `--vd-space-1`  |
| `--vd-leaderboard-row-padding` | `--vd-space-3`  |
| `--vd-leaderboard-score-size`  | `--vd-text-lg`  |

## Adapter notes

- Angular: import `VD_LEADERBOARD` (`VdLeaderboard`, `VdLeaderboardRow`).
- React/Vue: same markup on `ol` / `li`.
