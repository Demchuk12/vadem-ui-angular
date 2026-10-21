# Stat

Status: draft · Pattern: description list (`dl` / `dt` / `dd`)

One key figure: label, value, optional change and caption. Values and changes arrive formatted
by the application (`Intl.NumberFormat`, units, currency); the component never parses numbers.

## Anatomy

```html
<vd-stat class="vd-stat" data-size="md" data-sentiment="positive">
  <dl class="vd-stat__list">
    <dt class="vd-stat__label">Помилки 5xx</dt>
    <dd class="vd-stat__value"><bdi dir="ltr">0,21%</bdi></dd>
    <dd class="vd-stat__meta">
      <span class="vd-badge vd-stat__delta" data-variant="success">
        <vd-icon name="trending-down" />
        <span class="vd-visually-hidden">Падіння </span>
        <bdi class="vd-stat__delta-value" dir="ltr">−0,05</bdi>
      </span>
      <span class="vd-stat__caption">від усіх запитів</span>
    </dd>
  </dl>
  <!-- projected content, e.g. a sparkline -->
</vd-stat>
```

Wrap it in a Card (`<article vdCard>`) for a tile; the component itself has no surface.

## Props

| Name           | Type                                   | Default                     | Notes                                       |
| -------------- | -------------------------------------- | --------------------------- | ------------------------------------------- |
| label          | string                                 | required                    | The `dt`                                    |
| value          | string                                 | `''`                        | Formatted value                             |
| delta          | string                                 | —                           | Formatted change; omitted = no badge        |
| trend          | `'up' \| 'down' \| 'flat'`             | `up`                        | Arrow and spoken direction                  |
| sentiment      | `'positive' \| 'negative' \| 'neutral'` | from trend                  | Good news? Badge success / danger / neutral |
| caption        | string                                 | —                           | Comparison context ("vs last week")         |
| size           | `'sm' \| 'md'`                         | `md`                        | Value 3xl / xl                              |
| loading        | boolean                                | false                       | Skeletons for value and meta; label stays   |
| increaseLabel, decreaseLabel, unchangedLabel | string | locale: `stat.*`             | Spoken trend                                |

## States

| State      | Contract                                                                  |
| ---------- | ------------------------------------------------------------------------- |
| sentiment  | `data-sentiment` (only with a delta); Badge variant success/danger/neutral |
| loading    | `aria-busy="true"`; skeleton placeholders                                  |
| flat       | No arrow; spoken "No change"                                               |
| long text  | Label wraps; value balances its lines; meta wraps                          |

## Accessibility

- Direction is text ("Increase", "Decrease"); colour only marks good or bad news and the arrow is
  decorative, so falling errors can be green without misleading anyone.
- Values sit in `<bdi>` with `dir` chosen by content: numbers and currency signs have no strong
  direction and would inherit RTL and reverse ("920 48 ₴"); values containing Arabic or Hebrew
  letters stay RTL. Format with `Intl`: its non-breaking group separators keep digit groups
  together, while plain spaces split them in RTL text.
- A grid of stats is usually a labelled section (`aria-label="Ключові показники"`); stats are not
  headings.

## Component tokens

`--vd-stat-gap` → space-2 (sm: space-1); `--vd-stat-label` → color-text-muted;
`--vd-stat-value-size` → text-3xl (sm: text-xl); `--vd-stat-caption` → color-text-subtle.
The change reuses Badge tokens. Forced colors: Badge's border.

## Adapter notes

Angular: `<vd-stat>` from `@vadem/ui/stat`; the default slot accepts extra content (a chart).
