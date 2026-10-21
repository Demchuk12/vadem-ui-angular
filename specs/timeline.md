# Timeline

Status: implemented · Pattern: native ordered list (`ol` / `li`) with native `time` metadata.

## Anatomy

```html
<ol class="vd-timeline" role="list" aria-label="Історія публікації">
  <li class="vd-timeline-item" data-status="success">
    <span class="vd-timeline-item__marker" aria-hidden="true"><svg></svg></span>
    <div class="vd-timeline-item__content">
      <div class="vd-timeline-item__meta">
        <time class="vd-timeline-item__time" datetime="2026-10-08T09:15:00+03:00">
          8 жовтня, 09:15
        </time>
        <span class="vd-timeline-item__status">Опубліковано</span>
      </div>
      <h3 class="vd-timeline-item__title">Оновлення доступне команді</h3>
      <p class="vd-timeline-item__description">Перевірки пройдено.</p>
      <!-- Optional native actions or additional content -->
    </div>
  </li>
</ol>
```

The consumer owns chronological order (ascending or descending), timestamps and content.
The last direct item has no trailing connector. A single event needs no special mode.
Below a 12rem container width, markers stack above content and connectors disappear to
preserve text width. Projected consumer actions must also wrap within their available width.

## Props

| Part | Name          | Type                                              | Default             | Notes                                                 |
| ---- | ------------- | ------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| List | `label`       | `string`                                          | `Activity timeline` | Accessible list name; localize                        |
| Item | `status`      | `neutral \| success \| warning \| danger \| info` | `neutral`           | Visual event category, independent of adjacent items  |
| Item | `statusLabel` | `string \| undefined`                             | By status           | Visible semantic text; localize for the event context |

Default status labels: Event, Completed, Attention required, Error, Update. Empty or
whitespace-only labels fall back to the corresponding default so color is never the only cue.
No selected value, current stage, disabled control, automatic completion or form accessor.

## Events

None. Actions are projected native buttons/links owned by the consumer. A status describes a
historical event; it does not initiate or validate a workflow.

## Slots / content

- Time: native `time`, optional. The consumer supplies a valid machine-readable `datetime`
  and localized text; the library does not parse, format or infer dates/timezones.
- Title: a native heading at the appropriate page level, recommended for each event. The
  styling directive preserves the chosen element and its accessible semantics.
- Description: optional paragraph or other descriptive content.
- Default item content: optional native actions or supporting content after the description.
  Do not nest another timeline inside an item in this first version.

## States

| State   | Reflection                                                              | Non-color cue                                 |
| ------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| Neutral | `data-status="neutral"`                                                 | Dot and visible status text                   |
| Success | `data-status="success"`                                                 | Check and visible status text                 |
| Warning | `data-status="warning"`                                                 | Alert triangle and visible status text        |
| Danger  | `data-status="danger"`                                                  | Cross and visible status text                 |
| Info    | `data-status="info"`                                                    | Information icon and visible status text      |
| Empty   | Consumer renders Empty state outside the list                           | No placeholder list items                     |
| Loading | Consumer sets `aria-busy` on a surrounding region and composes Skeleton | Announce loading outside decorative skeletons |

Items themselves have no hover, active or focus state. Projected actions retain their native
and Vadem control states; text enlargement and RTL must preserve content and action order.

## Keyboard

| Key                          | Action                                                                    |
| ---------------------------- | ------------------------------------------------------------------------- |
| Tab / Shift+Tab              | Native focus order through projected actions; list/items add no Tab stops |
| Enter / Space                | Native action behavior when an action is focused                          |
| Arrows / Home / End / Escape | Native page/control behavior; not intercepted                             |

## ARIA contract

Use a named native ordered list and direct native list items. The explicit list role preserves
list semantics when visual bullets are removed. Markers and connectors are decorative;
visible status text remains accessible. There is no `tablist`, `progressbar`, `log` or live
region by default, and no selection/expanded attributes on events. Consumer headings establish
the document hierarchy. The consumer opts into live announcements only when the application
needs them, rather than announcing an entire loaded history automatically.

## Component tokens

List tokens: `--vd-timeline-gap` (space-4), `--vd-timeline-item-gap` (space-6),
`--vd-timeline-marker-size` (space-8), `--vd-timeline-marker-radius` (radius-full),
`--vd-timeline-connector` (border-control), `--vd-timeline-title-size` (text-sm),
`--vd-timeline-description-size` (text-sm), `--vd-timeline-meta-size` (text-xs).
Marker defaults: `--vd-timeline-marker-bg` (surface-raised),
`--vd-timeline-marker-fg` (text-muted), `--vd-timeline-marker-border` (border-control).
Status pairs: `--vd-timeline-{success,warning,danger,info}-bg` map to the respective
semantic subtle color, and `--vd-timeline-{success,warning,danger,info}-fg` to text color.
No primitive or semantic token scale is added. CSS uses logical geometry, wrapping content
and system colors in forced-colors mode; the Timeline introduces no motion.

## Adapter notes

Angular: `VdTimeline` on `ol[vdTimeline]`, `VdTimelineItem` on `li[vdTimelineItem]`,
`VdTimelineTitle`, `VdTimelineDescription`, `VdTimelineTime` on `time[vdTimelineTime]`,
and `VD_TIMELINE` from `@vadem/ui/timeline`. The native-item component projects content
into stable markup. Standalone, OnPush, global CSS and no DOM controller or complex core.

References checked on 2026-10-08:
[W3C H48](https://www.w3.org/WAI/WCAG22/Techniques/html/H48),
[HTML time](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-time-element),
and [Angular Aria overview](https://angular.dev/guide/aria/overview). Native list semantics
are sufficient for this informational component; Angular Aria is not a dependency.

Optional composition: `time[vdTimelineTime][vdRelativeTime]` delegates formatting and native
datetime ownership to [Relative time](relative-time.md). Pass epoch milliseconds and an explicit
reference; do not also supply datetime or projected text. Timeline itself still owns no clock.
