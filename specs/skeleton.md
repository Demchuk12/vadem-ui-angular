# Skeleton

Status: implemented · Pattern: decorative placeholder on a native span or div

## Anatomy

`<span class="vd-skeleton" data-shape="text" data-size="md" data-animated aria-hidden="true"></span>`

## Props

| Name     | Type                             | Default | Notes                                                                                     |
| -------- | -------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| shape    | text / circle / rectangle / null | null    | Omitted shape retains the existing CSS-sized 1lh placeholder; explicit shapes add presets |
| size     | sm / md / lg                     | md      | Line height or avatar diameter; rectangles use independent geometry                       |
| animated | boolean                          | true    | Existing directional shimmer; disabled under reduced motion and forced colors             |

No events or projected content. Apply to empty, non-interactive span/div elements only; never
wrap real content, links or controls in a skeleton. Replace placeholders with actual content
when loading finishes. Loading lifecycle belongs to the consumer.

## States and keyboard

Default/animated/static presentation only. No hover, focus, active, disabled or invalid state;
placeholders are not controls, receive no tab stop and do not emulate buttons. No keyboard map.
Reduced motion and forced colors always remain static, regardless of animated.

## ARIA contract

The placeholder always sets aria-hidden=true. It does not report a percentage or act as a live
region. Consumer names the loading section, supplies aria-busy while fetching and provides one
localized status outside the busy subtree. Do not announce each line. Keep existing content
available during background refresh when appropriate; hiding it is not inherent to Skeleton.

## Table composition

Use Skeleton inside native Table td cells. Preserve caption, headers, column widths and row
heights; mark only the placeholder tbody aria-hidden. Put aria-busy on the table/container and
one status outside it. Replace the body with real rows and clear busy on completion. For narrow
screens use the existing Table scroll wrapper, named and keyboard-focusable when needed.
This composition supports application-specific checkbox/avatar/numeric/action columns without
a second table implementation. The gallery demonstrates standard and compact RTL tables,
plus a loading/loaded toggle with fixed column geometry.

## Component tokens

- --vd-skeleton-bg: color-fill-hover for legacy CSS sizing; color-fill-active for explicit shapes
- --vd-skeleton-radius: radius-sm for legacy sizing; text uses radius-xs, circle radius-full, rectangle radius-md
- --vd-skeleton-inline-size: 100% for text/rectangle; size-derived for circle
- --vd-skeleton-block-size: text-sm for text; space-24 for rectangle; circles preserve aspect ratio
- --vd-skeleton-duration: duration-shimmer

Sizes use existing type and spacing tokens. Width/height overrides belong to consumer CSS.
Existing shimmer only translates its decorative layer, does not move geometry, uses existing ease-in-out and stops entirely for reduced motion.
Forced colors uses a static Canvas background and GrayText border to keep outlines distinguishable.
Placeholder geometry is decorative and has no text-contrast requirement; actual loading status
and table labels retain the normal AA text contract.

## Usage

Import VdSkeleton with the existing Table directives. Match the placeholder row count and
column widths to the expected page. Localize loadingLabel in the consumer.

```html
<p role="status">{{ loading() ? loadingLabel : loadedLabel }}</p>
<div vdTableScroll aria-label="Projects">
  <table vdTable [attr.aria-busy]="loading()">
    <caption>
      Projects
    </caption>
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Owner</th>
      </tr>
    </thead>
    <tbody [attr.aria-hidden]="loading() ? 'true' : null">
      @if (loading()) { @for (row of placeholderRows; track row) {
      <tr>
        <td><span vdSkeleton shape="text"></span></td>
        <td><span vdSkeleton shape="text"></span></td>
      </tr>
      } } @else { @for (project of projects(); track project.id) {
      <tr>
        <td>{{ project.name }}</td>
        <td>{{ project.owner }}</td>
      </tr>
      } }
    </tbody>
  </table>
</div>
```

```css
.project-name-placeholder {
  --vd-skeleton-inline-size: 65%;
}
.project-media-placeholder {
  --vd-skeleton-block-size: var(--vd-space-24);
}
```

## Adapter notes

Angular exports VdSkeleton, VdSkeletonShape and VdSkeletonSize from @vadem/ui/skeleton.
Standalone [vdSkeleton] attribute directive, retaining its existing selector. Signals reflect data attributes;
booleanAttribute coerces animated. No forms, timers, browser globals, DOM reads or Angular core layer.
Styles are global token CSS. Consumers own data loading and composition.
