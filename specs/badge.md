# Badge

Status: draft · Pattern: static text (no role)

Short status or metadata label in the mono eyebrow style (JetBrains Mono, uppercase, xs).

## Anatomy

```html
<span class="vd-badge" data-variant="success" data-dot>Активний</span>
<span class="vd-badge"><vd-icon name="check" />Перевірено</span>
```

## Props

| Name      | Type | Default | Notes |
| --------- | ---- | ------- | ----- |
| `variant` | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `neutral` | Subtle fill + strong text from the status family. |
| `dot`     | `boolean` | `false` | Leading dot in the solid status color. |

One size. Works on any element (`span`, `li`, `td`...).

## States

`data-variant`, `data-dot`. Not interactive: no hover/focus. Put badges inside buttons or links
when they need to be actionable.

## ARIA contract

- Plain text; meaning must be in the text, never color alone (the dot is decorative).
- Counts that update live: the consumer adds a live region if the change matters.
- Uppercase is visual (`text-transform`); screen readers read the source text.

## Component tokens

`--vd-badge-bg`, `--vd-badge-fg`, `--vd-badge-border`, `--vd-badge-dot`, `--vd-badge-radius`.

## Adapter notes

Angular: `[vdBadge]` directive. React/Vue: `<Badge as="span">` rendering the same markup.
