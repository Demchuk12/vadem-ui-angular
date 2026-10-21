# Avatar

Status: draft · Pattern: image (`role="img"`) or decorative

A person or team picture with an initials fallback, and an overlapping group.

## Anatomy

```html
<span class="vd-avatar" data-size="md" role="img" aria-label="Олена Коваленко">
  <span class="vd-avatar__initials" aria-hidden="true">ОК</span>
  <img class="vd-avatar__img" src="..." alt="" />
  <!-- removed if it fails to load -->
</span>

<div class="vd-avatar-group" role="group" aria-label="Учасники">
  <span class="vd-avatar">...</span> ...
</div>
```

## Props

| Name         | Type                           | Default  | Notes                                                      |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------- |
| `name`       | `string` (required)            | -        | Accessible name and source of the initials.                |
| `src`        | `string`                       | -        | Photo. On error the initials show; a new `src` retries.    |
| `size`       | `'sm' \| 'md' \| 'lg' \| 'xl'` | `md`     | 24 / 32 / 40 / 64 px.                                      |
| `initials`   | `string`                       | computed | Override, e.g. `+3` for an overflow counter.               |
| `decorative` | `boolean`                      | `false`  | `aria-hidden` when the name is already visible next to it. |

Initials (`vdInitials`, pure): first letters of the first and last word, grapheme-safe,
locale-aware uppercase; punctuation/emoji-only words are skipped.

## States

`data-size`. Photo vs initials. Not interactive; wrap in a button/link when it is.

## ARIA contract

- Default: `role="img"` + `aria-label` = name. The image has `alt=""` (the host is named).
- `decorative`: hidden from assistive tech - use when the name is rendered as text nearby.
- Group: `role="group"`; give it a name (`aria-label`) when it stands alone.
- Initials meet AA on their tinted background (`--vd-color-action-text` on `action-subtle`).

## Component tokens

`--vd-avatar-size`, `--vd-avatar-font-size`, `--vd-avatar-bg`, `--vd-avatar-fg`,
`--vd-avatar-radius`; group: `--vd-avatar-group-ring` (matches the surface behind; set
automatically inside `vdCard`), `--vd-avatar-group-overlap` (fraction of the size, default 0.15).

## Adapter notes

Angular: `vd-avatar` component (`linkedSignal` resets the error state per `src`) and
`[vdAvatarGroup]`. React/Vue: same markup; `vdInitials` is shared from core.
