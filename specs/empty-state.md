# Empty state

Status: draft · Pattern: static content

Shown instead of content when there is none: first run ("no projects yet"), no results ("nothing
matches"), or done ("inbox zero"). Says what happened and offers the next step.

## Anatomy

```html
<section class="vd-empty-state" data-size="md">
  <span class="vd-empty-state__icon"><vd-icon name="folder" /></span>
  <!-- optional -->
  <h3 class="vd-empty-state__title">Ще немає проєктів</h3>
  <p class="vd-empty-state__description">Створіть перший - це займе хвилину.</p>
  <div slot="actions"><button class="vd-button" data-variant="primary">Створити</button></div>
</section>
```

## Props

| Name   | Type                 | Default | Notes                                   |
| ------ | -------------------- | ------- | --------------------------------------- |
| `icon` | `VdIconName \| null` | `null`  | Decorative, in an accent-tinted circle. |
| `size` | `'sm' \| 'md'`       | `md`    | `sm` for table cells, cards, popovers.  |

Parts: `[vdEmptyStateTitle]` (use the right heading level for the page), `[vdEmptyStateDescription]`,
`[slot=actions]`.

Inside `td[vdTableEmpty]` the empty state drops its own padding.

## Content guidelines

- Title says what is (not) here, in plain words; no blame ("Нічого не знайдено", not "Помилка").
- One sentence on why or what to do. One primary action at most; a secondary ghost action is fine.
- No-results states offer to clear filters.

## ARIA contract

- Static content: headings and text. The icon is decorative.
- When it replaces results after a search, announce the change (e.g. a `role="status"` count
  near the search field), not the empty state itself.

## Component tokens

`--vd-empty-state-padding`, `--vd-empty-state-icon-size`, `--vd-empty-state-icon-bg`,
`--vd-empty-state-icon-fg`, `--vd-empty-state-title-size`.

## Adapter notes

Angular: `[vdEmptyState]` attribute component + part directives. React/Vue: `<EmptyState>` with
the same markup.
