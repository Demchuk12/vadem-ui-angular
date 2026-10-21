# Splitter

Status: implemented · Pattern: adjustable focusable separator; [APG reference](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

## Anatomy

```html
<div
  class="vd-splitter"
  data-orientation="horizontal"
  style="--vd-splitter-first: 40fr; --vd-splitter-second: 60fr"
>
  <section class="vd-splitter__pane" id="files">...</section>
  <div
    class="vd-splitter__handle"
    role="separator"
    tabindex="0"
    aria-label="Files"
    aria-controls="files"
    aria-orientation="vertical"
    aria-valuenow="40"
    aria-valuemin="10"
    aria-valuemax="90"
  ></div>
  <section class="vd-splitter__pane">...</section>
</div>
```

Exactly two direct-child panes and one direct-child handle, in that order. The primary pane
is the first in DOM order (inline-start, including RTL; block-start in a vertical layout).
Nested independent splitters own their own panes and events. Handles contain no interactive
children. Panes have tabindex=0 for keyboard scrolling, with an inset focus outline.
Consumers own content, scrolling labels and regions; no content or pane roles are
invented. Overflow is contained inside panes. Stacked layout requires a definite block size;
side-by-side layout requires available inline size. CSS writing-mode must be horizontal-tb.

## Props and events

| Name         | Type                  | Default    | Meaning                                                                           |
| ------------ | --------------------- | ---------- | --------------------------------------------------------------------------------- |
| value        | number, two-way       | 50         | Primary pane percentage of pane space, excluding the handle                       |
| min / max    | number                | 10 / 90    | Allowed primary share; secondary share is 100 minus value                         |
| step         | number                | 1          | Arrow movement in percentage points                                               |
| orientation  | horizontal / vertical | horizontal | Side-by-side / stacked layout axis                                                |
| disabled     | boolean               | false      | Blocks all resize interaction                                                     |
| Handle label | string                | required   | Name matching the primary pane; aria-labelledby may reference its visible heading |
| Pane id      | string                | generated  | Stable native id for aria-controls; override if needed                            |

Value change carries the new number only on user resize; redundant boundary operations emit
nothing. External values/constraints update layout and ARIA without emitting or rewriting the
consumer's model. Values clamp to normalized bounds; nonfinite value uses 50, nonfinite min/max
use 10/90. Bounds clamp to 1..99 to keep both panels nonzero; reversed bounds become fixed at
the normalized minimum. Nonpositive/nonfinite step uses 1. Pointer movement is continuous,
rounded to four decimal places; it does not snap to the keyboard step. Fixed bounds, disabled
or missing panes disable the handle and remove its Tab stop. No persistence or forms accessor.

## Keyboard and pointer

| Input           | Action                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Tab / Shift+Tab | Native content and handle focus order; no trap                               |
| Left / Right    | Move a vertical separator physically left/right; primary share mirrors RTL   |
| Up / Down       | Move a horizontal separator up/down                                          |
| Home / End      | Minimum / maximum primary share                                              |
| Pointer drag    | Primary mouse/touch/pen moves the handle along its layout axis within limits |

Cross-axis, IME and modified keys remain untouched. Pointer capture retains drag outside the
rail; cancellation/lost capture/end/destroy clear dragging. Disabled/orientation/bounds changes
cancel an ongoing drag; direction changes cancel on its next move. Missing pointer-capture
support leaves keyboard resizing usable. Native pointer start focuses the handle without
scrolling the page. Dragging uses pane spans, excludes the handle, and is local to the owner.

## States and ARIA

Focusable handle role=separator has a name, primary pane aria-controls, current/min/max values,
and separator orientation perpendicular to layout. Disabled/fixed handle has aria-disabled
and tabindex=-1; pane content stays active. Root data-orientation/data-disabled/data-dragging
reflect layout and interaction. Hover/focus/drag accent the rail with a visible outline.
No loading, selection, invalid or empty behavior is introduced; consumers own pane content.
No live region announces every pointer sample.

The APG splitter page is marked unfinished and includes Enter collapse/restore. This bounded,
noncollapsing first version implements the approved resize scope, not the entire APG keyboard
map. Enter/F6, collapse, snapping, multiple panels and persisted layouts are outside the API.

## Component tokens

--vd-splitter-handle-size: space-6 (24px at the default root size);
--vd-splitter-rail: color-border-control; --vd-splitter-rail-active: color-focus;
--vd-splitter-handle-bg: color-surface; --vd-splitter-handle-hover: color-fill;
--vd-splitter-radius: radius-lg; --vd-splitter-border: color-border.
--vd-splitter-first/second are dynamic layout fractions, not a token scale.
No resize animation: geometry follows interaction immediately, also under reduced motion.
Forced colors preserve rail/border/focus through system colors.

## Adapter notes

Angular exports VD_SPLITTER, VdSplitter, VdSplitterPane and VdSplitterHandle from @vadem/ui/splitter.
Use div[vdSplitter], section[vdSplitterPane] and div[vdSplitterHandle]. value is a model;
consumers can bind [(value)] or (valueChange). Logic lives in pure TS; pointer DOM operations
run only in interaction handlers. No global listeners, ResizeObserver, CDK or Angular Aria
runtime dependency. SSR/hydration execution is not claimed without dedicated verification.
[Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)
is supported within the project's modern browser targets; keyboard is the graceful fallback.
[Angular Aria](https://angular.dev/guide/aria) was checked as a behavior reference.
