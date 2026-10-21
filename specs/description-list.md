# Description list

Status: stable · Pattern: native `dl`, `dt`, `dd` (no interactive APG pattern).

## Anatomy

```html
<h2 id="details">Equipment details</h2>
<dl class="vd-description-list" data-layout="horizontal" aria-labelledby="details">
  <div>
    <dt>Name</dt>
    <dd>Cooling unit</dd>
  </div>
  <div>
    <dt>Owner</dt>
    <dd>Olena</dd>
    <dd>Marko</dd>
  </div>
</dl>
```

Each direct `div` groups one or more terms followed by one or more descriptions.
Do not mix grouped and ungrouped children. Nested lists retain independent styling.

## Props

| Name   | Type                     | Default      | Notes                                                                                                   |
| ------ | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| layout | `horizontal \| vertical` | `horizontal` | Horizontal terms occupy one third of the available row tracks; both layouts stack in narrow containers. |

## Events

None. Native actions within values keep their events.

## Slots / content

Consumer-authored native groups, terms and descriptions. Values accept text, links, badges,
buttons, lists and other flow content. Consumers supply localized visible text for absent
values (for example “Not specified”), and render an empty state outside an empty list.
Do not infer missing values from falsiness: zero and false can be meaningful data.

## States

| State                    | Contract                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Default                  | `data-layout="horizontal"`                                            |
| Vertical                 | `data-layout="vertical"`                                              |
| Narrow                   | Below 30rem container width, terms precede descriptions in one column |
| Empty / loading / error  | Consumer composition; no automatic placeholder or live region         |
| Hover / focus / disabled | Owned by nested interactive controls; the list is static              |

## Keyboard

Tab and Shift+Tab visit only native interactive content in DOM order. No list tab stop,
arrow navigation, focus management or keyboard handlers are added.

## ARIA contract

Preserve native semantics without list/listitem, term/definition overrides or redundant roles.
Use an adjacent heading and optional consumer `aria-labelledby`/`aria-label` to identify the
collection. Full text remains selectable and exposed; no truncation. Use `bdi` or `dir="auto"`
for mixed-direction identifiers. Status announcements belong to the application.

## Component tokens

| Token                             | Default                 |
| --------------------------------- | ----------------------- |
| `--vd-description-list-gap`       | `--vd-space-6`          |
| `--vd-description-list-value-gap` | `--vd-space-2`          |
| `--vd-description-list-padding`   | `--vd-space-4`          |
| `--vd-description-list-border`    | `--vd-color-border`     |
| `--vd-description-list-term`      | `--vd-color-text-muted` |
| `--vd-description-list-value`     | `--vd-color-text`       |
| `--vd-description-list-font-size` | `--vd-text-sm`          |

All spacing/type/color defaults reuse the existing system. The structural breakpoint is
not a new token scale. Container queries progressively enhance a safe stacked fallback.
No animation; native text and separators survive forced colors.

## Adapter notes

Angular: import `VdDescriptionList` from `@vadem/ui/description-list` and attach it to `dl`.
Only the root needs a directive; descendants use native HTML, avoiding part directives or
a record-array abstraction. Signal input reflects `data-layout`; no forms or DOM access.
