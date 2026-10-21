# Breadcrumbs

Status: stable · Pattern: APG breadcrumb (navigation landmark, ordered list, `aria-current="page"`)

Shows where the page sits in a hierarchy and links to its ancestors. Not a history trail.

## Anatomy

```html
<nav class="vd-breadcrumbs" aria-label="Навігаційний ланцюжок">
  <!-- nav[vdBreadcrumbs] -->
  <ol>
    <li><a href="/projects">Проєкти</a></li>
    <li><a href="/projects/payments">Платформа оплат</a></li>
    <li><span aria-current="page">Налаштування</span></li>
  </ol>
</nav>
```

## Props

| Name    | Type     | Default        | Notes                    |
| ------- | -------- | -------------- | ------------------------ |
| `label` | `string` | `'Breadcrumb'` | Landmark name; localize. |

Items are plain markup: links for ancestors, a non-link element with `aria-current="page"` for
the current page. An icon may lead the first item (`<vd-icon>` + text).

## States

| State         | Reflected as                                                                         |
| ------------- | ------------------------------------------------------------------------------------ |
| link          | muted text; hover: text color + underline                                            |
| current       | `aria-current="page"` - text color, semibold                                         |
| focus-visible | 2px ring on the link                                                                 |
| long names    | ancestors truncate at 16ch, the current page at 32ch (add `title` for the full name) |
| narrow        | the list wraps                                                                       |

Separators are CSS chevrons (mask, `--vd-color-text-subtle`), mirrored in RTL, invisible to AT.

## ARIA contract

- `nav` landmark with a unique name; `ol` conveys order; the current item has
  `aria-current="page"` and is not a link.
- Items remain within the navigation width under text enlargement; long links truncate inside
  the available space without pushing the document wider.

## Component tokens

`--vd-breadcrumbs-gap`, `--vd-breadcrumbs-fg`, `--vd-breadcrumbs-fg-current`,
`--vd-breadcrumbs-separator`, `--vd-breadcrumbs-icon`.

## Adapter notes

Angular: `nav[vdBreadcrumbs]` directive (works with `routerLink`). React/Vue: same markup.
