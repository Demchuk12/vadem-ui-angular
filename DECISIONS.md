# Decisions

Non-obvious choices and why. Newest at the bottom of each section. Format: decision, why,
consequences.

## Platform and tooling

### D1. Angular 22.2, zoneless, Vitest (2026-10-02)

Latest stable. Zoneless and Vitest are the CLI defaults since v21, so nothing extra to maintain.

### D2. Browser targets: last 2 Chrome/Edge/Firefox + Safari 26+ (2026-10-02)

Makes CSS anchor positioning (Baseline Jan 2026), Popover API, `light-dark()`, `@starting-style`,
`linear()` native, so no JS positioning library or fallbacks for them.
Known gaps, handled as progressive enhancement:

- `corner-shape: squircle` - Chromium only; used only inside `@supports`. SVG `clip-path`
  polyfills are rejected: they clip borders, shadows and the focus outline.
- `text-wrap: pretty` - not in Firefox; falls back to normal wrapping.
- `overlay` (smooth top-layer exit) - Chromium only; dialog/popover exit is instant elsewhere.
  Firefox also has a `display` + `allow-discrete` transition bug (1882408).
- `popover="hint"` - no Safari yet; tooltips will use `popover="manual"`.

### D3. Own pure-TS core instead of `@angular/aria` (2026-10-02)

`@angular/aria` became stable in v22 and covers select/combobox/menu/tabs well, but it is
Angular-bound, which conflicts with the goal of sharing logic with React/Vue adapters. We use it
(and the APG) as a behavior reference. Revisit if the core turns out to cost more than it saves.

### D4. Angular CDK deferred (2026-10-02)

With native anchor positioning, overlay positioning may not need CDK at all. `vd-cdk-wrapper`
skill will be written when a component actually needs CDK (virtual scroll, likely).

### D5. Demo resolves `@vadem/ui/*` to source via tsconfig paths (2026-10-02)

Instant reload while developing. `npm run build:ui` still verifies the real package build
(partial compilation, secondary entry points).

### D6. Styles and fonts live in `src/`, copied into the package after build (2026-10-02)

They are framework-agnostic (future `@vadem/tokens`). ng-packagr refuses assets outside the
project root, so `tools/copy-styles.mjs` copies them into `dist/ui` after `ng build ui`.
The package exposes `@vadem/ui/styles.css`, `@vadem/ui/styles/*`, `@vadem/ui/fonts/*`.

### D7. ESLint enforces architecture, not only style (2026-10-02)

Selector prefixes, OnPush, no `window`/`document`/`localStorage`/`navigator` globals in the
library (SSR), and no `@angular/*`/`rxjs` imports under any `core/` folder (portability).

## Styling architecture

### D8. Component CSS is global, layered, framework-agnostic (2026-10-02)

Components use `ViewEncapsulation.None` and no component `styles`; CSS lives in
`src/styles/components/*.css` inside `@layer vd.components`. The same file must work for any
framework adapter, which rules out `:host` and Angular's emulated encapsulation.

### D9. Layer order `vd.reset, vd.tokens, vd.base, vd.components`, all nested in `vd` (2026-10-02)

Any unlayered consumer CSS beats the whole library without specificity fights. Consumers can
also put their own layers after `vd`.

### D10. Derived tokens are re-declared on scope elements (2026-10-02)

A custom property containing `var()` resolves on the element where it is declared, then
inherits as a final value. So ramps, density sizes and semantic colors are declared on
`:where(:root, [data-theme], [data-density])`. Overriding `--vd-hue-accent` or density on a
subtree works when that element also carries `data-theme` or `data-density`.

### D11. Dark by default; `data-theme="dark|light|auto"` (2026-10-02)

Dark-first identity. `auto` follows the OS via `color-scheme: light dark`. Colors are
`light-dark()` pairs, which only accept colors, so non-color differences (shadow strength) are
baked into alpha of the shadow ink colors.

### D12. One shared lightness/chroma curve for all chromatic ramps (2026-10-02)

`--vd-l-<step>` and `--vd-c-<step>` × family chroma × family hue. Accent and statuses are one
family by construction, and re-theming is one hue value. Trade-off: at some hues the light accent
steps exceed sRGB at chroma 0.2 (browsers gamut-map them; P3 screens show them richer).
Contrast was verified with a script for hue 285 (all text pairs pass AA; white on action 5.3:1).
Re-theming to a hue near a status hue (e.g. ~150 vs success) makes them look alike - pick
accents away from 25/75/150/240 or shift the status hue.

### D13. Warning solid uses step 400 with dark ink (2026-10-02)

Amber at the shared 600 step reads brown. A lighter solid with `--vd-warning-950` text (6.2:1)
looks like a warning and stays accessible.

### D14. Focus ring = `outline` with offset, not stacked `box-shadow` (2026-10-02)

The offset gap shows whatever background is behind, which gives the "double ring" look; it
follows `border-radius`, doesn't conflict with elevation shadows, and survives `forced-colors`
(box-shadow is removed there).

### D15. Reduced motion zeroes duration tokens (2026-10-02)

One switch in `semantic.css` covers every transition that uses tokens. Continuous indicators
(spinners) use `--vd-duration-spin` and slow down instead of stopping, so loading stays visible.

### D16. Fonts: two unicode-range subsets per family, fallback metrics averaged (2026-10-02)

Latin and Cyrillic files load independently. `size-adjust` for the Arial fallback is the
average of English (104.3%) and Ukrainian (102.9%) width ratios. Details: `src/fonts/README.md`.

### D17. Icons are path data in pure TS, rendered by a tiny component (2026-10-02)

(Superseded in part by D24: the geometry now comes from Lucide.)
`VD_ICONS` is framework-agnostic data (portable to other adapters), rendered as inline `<svg>`
without `innerHTML` (no sanitizer, SSR-safe, no HTTP). Decorative by default; `label` makes it
`role="img"`. Directional icons mirror via `:dir(rtl)`.

## AI workflow

### Design skill routing for Codex (2026-10-07)

The user authorized continuing Claude's existing work, adding useful Markdown files, and
connecting design skills. `docs/DESIGN_WORKFLOW.md` routes visual tasks through Codex's
`frontend-skill` and the existing Vadem design, accessibility, token, and component procedures.
App composition guidance is adapted to the library: preserve its fonts, tokens, components,
and native Angular/CSS behavior; marketing heroes, imagery, and motion quotas do not apply
to a gallery by default. No new skills or dependencies were added. Shared project rules and
the current user brief retain priority; this routing does not approve new token scales,
signature changes, or unspecified features.

### User brief persistence for Codex (2026-10-02)

The user requested saving their project instructions for future sessions. `AGENTS.md` is
the Codex entry point and points to shared rules in `CLAUDE.md`, the detailed user brief in
`docs/PROJECT_BRIEF.md`, existing task skills, and component specs. This avoids duplicating
the full checklist in every startup file. The saved brief explicitly distinguishes proposals
from approvals and takes precedence over conflicting historical records. Existing code and
skills were preserved; this documentation task does not authorize an implementation migration.
Claude Code memory/skill locations were checked against its official documentation before
writing. No dependencies were added.

### D18. Short `CLAUDE.md`, procedures in skills (2026-10-02)

`CLAUDE.md` holds rules that apply to every task and stays well under 150 lines. Procedures and
long checklists live in `.claude/skills/vd-*`. `vd-tokens` and `vd-design-principles` use the
`paths` frontmatter so they load automatically when editing CSS. `CLAUDE.md` wins on conflict;
convention changes update both in the same commit.

## Components

### D19. Button: four variants, `danger` included (2026-10-02)

"Fewer variants" argues for three, but destructive confirmations (dialogs, danger zones) need a
red solid, and faking it via class overrides would be worse. No `outline`/`link`/`soft`
variants: `secondary` covers outline, links stay links.

### D20. Button is an attribute component, not a directive (2026-10-02)

`button[vdButton], a[vdButton]` keeps native semantics but needs a template for the loading
spinner and icon slots. The ESLint component-selector rule is disabled on that line only.

### D21. Loading uses `aria-disabled` + capture-phase click blocking, never `disabled` (2026-10-02)

Native `disabled` drops focus to `<body>` mid-interaction. A capture listener on the element
runs before any bubble listener (spec: capture listeners at the target fire first), so it stops
consumer handlers, link navigation, and form submission. Label is hidden with `opacity` so the
accessible name stays intact and the width doesn't change.

### D22. Icon slots via `slot="start|end"` attributes (2026-10-02)

`:first-child` can't detect "icon before text" (text nodes are ignored), so optical padding needs
explicit slots. The `slot` attribute is a familiar web idiom and ports to any framework.

### D23. `type="button"` by default (2026-10-02)

Avoids accidental form submission; `type="submit"` is explicit. Documented in the spec.

### D24. Icon geometry vendored from Lucide (2026-10-02)

Hand-drawing a full set is slow and drifts in consistency. Lucide (ISC) uses the same 24px grid,
2px padding and round caps we wanted. `tools/icons.mjs` fetches an allowlist from a pinned
`lucide-static` release (unpkg), converts every element to path data and writes
`icon/src/core/icons.ts` (committed). No npm or runtime dependency; the ISC notice ships as an
`@license` comment and `LICENSE-lucide.txt`. We render at stroke 1.5 (Lucide default is 2) -
lighter, closer to the thin-border look, and a small step away from the shadcn default.
Our names stay stable (`alert-circle`) even when Lucide renames (`circle-alert`).

### D25. Input: no custom ControlValueAccessor (2026-10-02)

`vdInput` sits on the native element, so Angular's built-in accessors (`formControlName`,
`ngModel`) and Signal Forms' native binding (`[formField]`) already handle the value. A custom
CVA would duplicate them and break native features (autofill, IME). The directive only reads
validity. Custom CVAs come with controls that don't wrap a native value (select, combobox).

### D26. Errors show after touch (2026-10-02)

`invalid && touched` avoids yelling at users before they type. `invalid` can be forced (server
errors). Signal Forms binds `invalid`/`touched`/`required` into same-named directive inputs
(its FormUiControl contract), so the directive mirrors those names deliberately. Known quirk:
Signal Forms sets `aria-invalid` on native inputs immediately; our visual state still waits.

### D27. Field <-> control via a small DI contract (2026-10-02)

`vd-field` provides `VD_FIELD`; controls register `{ id, invalid, required, disabled }` and read
`describedBy`. Keeps label/hint/error wiring out of every control and ports to React context /
Vue provide-inject. Error replaces the hint (one message at a time). Not a live region: it is
announced via `aria-describedby` on focus.

### D28. `@angular/forms` is a peer dependency (2026-10-02)

Needed to read `NgControl` and Signal Forms state. Still "Angular only" at runtime.

### D29. Input focus ring sits on the border (outline-offset -1px) (2026-10-02)

For text fields an offset ring looks detached from the box; drawing the 2px outline over the
1px border reads as a crisp active edge, keeps `forced-colors` support (outline), and in a group
the ring moves to the group via `:has(:focus-visible)`.

### D30. Shared `VdFieldControlBase` for native form controls (2026-10-02)

Input, checkbox and switch share validity (NgControl / Signal Forms), `vd-field` registration
and ARIA/data attributes. One abstract `@Directive()` in `@vadem/ui/field`, extended by each
control; host bindings and inputs are inherited. Third repetition rule applied.

### D31. Checkbox and switch are directives on the native checkbox (2026-10-02)

Same reasoning as D25: native checked state, keyboard, forms (`CheckboxControlValueAccessor`,
Signal Forms) and indeterminate support for free. The mark is `::before` + `mask` with Lucide
geometry as an inline data URI (no network); switch = same element with `role="switch"`.
No `size` prop: one size each, tunable through component tokens.

### D32. `label[vdChoice]` wraps control + text (2026-10-02)

The whole label is the hit area (also satisfies target-size for the 18px box) and its text is
the accessible name. Descriptions go through `vd-field` hints (`aria-describedby`) rather than
inside the label, so names stay short.

### D33. Switch off-track uses the 3:1 control border color (2026-10-02)

Lighter tracks look softer but fail WCAG 1.4.11 against the page. The off state reads heavier
in the light theme; accepted for accessibility.

### D34. Badge = mono eyebrow, one size, six variants (2026-10-02)

Badges are the most frequent carrier of the "mono label" signature. Variants mirror the status
family plus `accent`/`neutral`; a decorative dot is optional. Accent text on subtle fills uses a
new semantic token `--vd-color-action-text` (accent 700 in light) - axe caught 600 failing AA on
a filled button background.

### D35. Card: directive + structural parts, stretched-link pattern (2026-10-02)

`[vdCard]` works on any host (`article`, `li`, `a`). Parts are tiny host-class directives,
exported together as `VD_CARD`. Clickable cards use either a native `<a vdCard>` or a stretched
`a[vdCardLink]` (one tab stop, short name, inner buttons stay above via z-index). The header is
flex-wrap: extras sit next to the title while it has 12rem, then wrap under it.

### D36. Cursor glow without change detection (2026-10-02)

`pointermove` (mouse only) writes `--vd-x/--vd-y` from a plain DOM listener registered in
`afterNextRender`, so it never schedules Angular change detection and never runs on the server.
The glow is a soft radial fill plus a masked border rim (`mask-composite: exclude`), both
fading in on hover; hidden in `forced-colors`; lift disabled under reduced motion.

### D37. Skeleton added with Card (2026-10-02)

Card needs a designed loading state and the polish brief asks for soft-shimmer skeletons.
`[vdSkeleton]` is aria-hidden, sized by the consumer, shimmer follows `dir` and is static under
reduced motion. The busy container carries `aria-busy`.

### D38. First pure-TS cores: roving keys and dialog controller (2026-10-02)

`tabs/src/core/roving-keys.ts` (APG arrow/Home/End logic with RTL and disabled skipping) and
`dialog/src/core/dialog-controller.ts` (open/close, Escape policy, light dismiss) have no Angular
imports (ESLint-enforced) and are unit-tested without TestBed. The Angular layer only binds
them to signals/DI. Not frozen: adjust when the first non-Angular adapter consumes them.

### D39. Dialog light dismiss in JS, not `closedby="any"` (2026-10-02)

`closedby` isn't in Safari yet. The controller closes on backdrop clicks only when the press
starts _and_ ends on the backdrop (drag-select out of the dialog stays open), and keyboard
"clicks" never count. Escape uses the native `cancel` event. Focus trap/return is native; Chrome
lets Tab step out to browser UI (never onto the inert page) - accepted platform behavior.

### D40. Dialog exit animation is progressive (2026-10-02)

`@starting-style` + `allow-discrete` for `display`/`overlay` gives enter + exit in Chromium; other
engines animate the entry and close instantly. Resets that zero margins break modal centering, so
the dialog sets `margin: auto` itself. Page scroll lock is pure CSS
(`:root:has(dialog:modal)` + `scrollbar-gutter: stable`).

### D41. Tabs indicator is per-tab, not anchor-positioned (2026-10-02)

A sliding indicator via anchor positioning needs `anchor-scope` per instance (not yet
cross-browser) or JS measuring. A per-tab `::after` that scales in with the spring easing is
robust, RTL-correct and cheap. Revisit when `anchor-scope` is Baseline.

### D42. `[hidden]` always hides (2026-10-02)

Any author `display` rule overrides the UA `[hidden]` style (bit us with tab panels). The reset
enforces `display: none !important` (except `until-found`); tabs repeat it for apps without the
reset layer.

### D43. Child directives register in `ngOnInit` when they expose required inputs (2026-10-02)

Registering in the constructor let the parent's computed state read `input.required()` before
dynamic bindings (`[value]` in `@for`) were set (NG0950). Rule for compositional components:
register after inputs exist.

### D44. Dialog becomes a bottom sheet below 40rem (2026-10-02)

Requested for phones: thumb-reachable actions, familiar platform pattern. Same component and
API, CSS-only switch (media query; 40rem is documented in the CSS since media queries can't read
tokens). Slide uses ease-out, not the spring (overshoot would detach the sheet from the edge).
No drag handle: a handle promises drag-to-dismiss, which isn't implemented (possible later).

### D45. Root of the "flash after close" (2026-10-02)

Two independent causes, both measured frame by frame:

1. The scroll lock toggled `scrollbar-gutter`, shifting the whole page by the scrollbar width
   on open and back on close (Chromium). Fix: base.css reserves the gutter permanently; the lock
   only sets `overflow: hidden`.
2. During the exit transition `[open]` is gone while `display` is still `flex`; `flex-direction`
   lived on the `[open]` rule, so the dialog re-laid out as a row and jumped. Fix: layout and
   geometry (`position: fixed; inset: 0; margin: auto; flex-direction`) live on the base rule and
   never depend on `[open]` or UA `:modal` styles. Regression tests cover both.
   General rule: only state-visual properties (opacity, scale, translate, display) may differ
   between `[open]` and closed.

### D46. Sheet swipe-to-dismiss with a grab handle (2026-10-02)

Requested after D44. Pure-TS `VdSheetDrag` drives two custom properties (`--vd-sheet-offset`,
`--vd-sheet-progress`) and `data-dragging`; CSS does the rest, so releasing simply lets the
normal transitions run from the current offset (to closed, or back to 0). Drag starts only from
the header (handle lives in its padding, `touch-action: none` there), never from the scrollable
body or the header's buttons; a 6px threshold keeps taps working. The handle appears only on
dismissible sheets - a handle on a sheet that can't be swiped would be a false affordance.
"Is a sheet" comes from CSS (`--vd-dialog-sheet: 1` inside the media query): one breakpoint.

### D47. Demo gallery is phone-friendly (2026-10-02)

Below 48rem the header collapses to two rows and isn't sticky; the nav becomes a sticky,
horizontally scrolling strip that keeps the current page in view; action rows share each line
evenly. Demo-only CSS; the library components were already responsive.

### D48. Tooltip: Popover API + anchor positioning, behavior in pure TS (2026-10-02)

`popover="manual"` (not `hint`: no Safari yet) in the top layer, placed with `position-area` and
flipped with `position-try-fallbacks` - no JS positioning. The element is created by the
directive after render and appended to `<body>`, or to the nearest `<dialog>` (outside a modal
everything is inert). `VdTooltipController` implements WCAG 1.4.13 (hoverable, dismissible with
Escape, persistent), a 500ms hover delay with "warm" instant follow-ups, immediate show on
keyboard focus, never on touch. Icon-only triggers are _labelled_ by the tooltip, others
_described_. Tooltips sit on a strong (always dark) surface - a new semantic token pair.

### D49. Toast: store in pure TS, outlet in the top layer (2026-10-02)

`VdToastStore` owns the queue, timers (paused on hover/focus, WCAG 2.2.1), a cap of three and a
two-phase exit. The Angular `VdToaster` service exposes it as a signal; `<vd-toaster>` renders a
named region whose list is a polite live region present before any toast; `danger` toasts are
`role="alert"`. Labels default to English and are inputs (localize per app). Toasts use the
overlay surface (like dialogs), with a status icon instead of colored bars.

### D50. Contrast checks skip `aria-disabled` controls (2026-10-02)

WCAG 1.4.3 exempts inactive components; axe only recognizes native `disabled`. The a11y test
excludes `[aria-disabled="true"]` from the scan instead of making disabled-looking controls
artificially high-contrast.

### D51. `@vadem/ui/keyboard`: one framework-agnostic keyboard package (2026-10-02)

Roving focus (tabs), list navigation (listbox, menu), typeahead and query matching are pure
functions/classes shared by several components, so they live in their own entry point instead
of one component's `core/`. The whole entry point is under the no-Angular ESLint rule.
Matching normalizes case and diacritics and unifies apostrophes, so Ukrainian input like
"кам'ян под" finds "Кам’янець-Подільський".

### D52. No Angular CDK for select, combobox or menu (2026-10-02)

CDK was planned for overlays and positioning. The Popover API (top layer, light dismiss,
Escape via close watchers, one-auto-popover-at-a-time) plus CSS anchor positioning
(`position-area`, `anchor-size()`, `position-try-fallbacks`) covers it natively for our
browser targets, and `showPopover({ source })` keeps clicks on the field from light-dismissing.
Keyboard logic is ours (D51). `vd-cdk-wrapper` stays unwritten; revisit for virtual scrolling.

### D53. Select/combobox: own ControlValueAccessor, focus never leaves the field (2026-10-02)

Unlike native-element controls (D25), these don't wrap a native value, so they implement CVA
and expose a `value` model (Signal Forms binds it). NgControl is resolved lazily in `ngOnInit`
(it depends on this accessor). Focus stays on the combobox element with
`aria-activedescendant`; options prevent mousedown so clicks don't steal focus.
`aria-label`/`aria-labelledby` on the host are forwarded to the inner combobox element - axe
caught unnamed triggers otherwise.

### D54. Menu moves focus into the menu (2026-10-02)

APG menu button: roving focus on items (unlike listbox), hover focuses the item so pointer and
keyboard share one "current" item, Escape/activation return focus to the trigger, Tab lets it
move on. Group labels use the mono eyebrow in the _muted_ tone - subtle failed AA on overlays.

### D55. Demo screens are full apps outside the gallery chrome (2026-10-02)

`/screens/*` (dashboard, settings, login) render without the gallery header/nav, so they test
the library the way a consumer app uses it: library components plus app-owned layout CSS, no
demo helpers. Dashboard and settings share an app frame (sidebar, top bar; on phones the
sidebar becomes a `vdDialog` sheet). Gaps found while composing - segmented control
(radiogroup), table, alert/callout, progress/meter, avatar - are built locally in the screens
and stay candidates until a second screen needs them. A period filter is not tabs (no panels),
so the dashboard uses a select rather than misusing `vd-tabs`.

### D56. `<form>` inside a dialog is first-class (2026-10-02)

Wrapping header/body/footer in a `<form>` is the usual submit pattern, but child combinators
(`.vd-dialog > .vd-dialog__header`) lost the sheet handle. `.vd-dialog > form` is now
`display: contents` and the handle selectors also match `form > .vd-dialog__header`.

### D57. Segmented control on native radios; Alert and Avatar stay simple (2026-10-02)

`vd-segmented` renders one native radio per segment (shared `name`), so arrow keys, Tab
entry, disabled skipping, RTL mirroring and radiogroup semantics come from the browser - no
roving-focus code. The component adds the `value` model + CVA. The radio covers the segment
and is named via `aria-labelledby` (it is not inside a `<label>`). `vd-field` can't name a
group, so segmented is named with `aria-label` or a fieldset legend. Alert has no live-region
role by default (static callouts must not announce); consumers add `role="alert"/"status"`.
Avatar initials are a pure function (`vdInitials`) for reuse by other adapters; a broken image
falls back to initials and `linkedSignal` resets that per `src`. Table and progress/meter
remain local to the demo screens for now (D55).

### D58. Table is a styled native table, not a data grid; progress/meter stay native (2026-10-02)

`vdTable` styles `<table>` and owns only the sort state (`[(sort)]`); the consumer renders and
sorts rows (`vdSortRows`: stable, `Intl.Collator` numeric/base so Ukrainian letters and
"file 2 < file 10" order correctly, empty values last both ways). APG sortable table: a button
in the `th`, `aria-sort` on the sorted column only, new column ascending, same column flips (no
"unsorted" third state: APG doesn't require it and a two-state toggle is more predictable). Selection is
checkboxes plus `data-selected` styling; `aria-selected` is grid-only. No cell focus / 2D
keyboard: that is a data grid, a different component if ever needed. A card whose only child
is the table goes edge to edge. `<progress>`/`<meter>` keep native roles and labelling; meter
colors come from native low/high/optimum; engine pseudo-elements live in separate rules (an
unknown pseudo drops the whole rule).

### D59. Drawer is a dialog placement; pagination and empty state (2026-10-02)

A drawer needs everything a modal dialog has (top layer, focus trap, Escape, form submit,
return value, sheet on phones), so it is `vdDialog placement="start|end"` rather than a new
component: full height, attached to the inline edge, ease-out slide (no spring), mirrored with
`:dir(rtl)`. Fixed/top-layer boxes stop at the root scrollbar gutter that `scrollbar-gutter:
stable` reserves (D45's no-jump fix), leaving a strip beside an end drawer with classic
scrollbars. The gutter side depends on the engine (Chromium: always right; Firefox: left in
RTL), so the controller measures it with a fixed probe on open and the drawer extends over it
with physical `left`/`right` - the one place physical sides are correct.
Pagination: buttons with `aria-current="page"`; edge steps are `aria-disabled` (not disabled)
so focus doesn't drop to the body on the last page; `vdPageRange` keeps a constant item count
(no jumping) and never uses an ellipsis for a single page. Empty state: icon + title + one
sentence + actions; `sm` drops into `vdTableEmpty`.

### D60. Brand assets: accent from tokens, outlined wordmark, Chromium-rendered rasters (2026-10-02)

The logo set lives in `brand/logo/` (its README is the source of truth; not redesigned). Accent
updated to the token ramp at hue 285: `#8472FE` (`--vd-accent-500`) on dark, `#6855D6`
(`--vd-accent-600`) on light - the closest steps to the placeholders, read as sRGB from the
browser. The lockup wordmark is outlined: fonttools instance of Manrope at wght 600, glyphs at
Chromium's shaped positions (HarfBuzz kerning + letter-spacing), checked glyph by glyph against
live text. Rasters come from `npm run brand:export` (Playwright, no image tooling); the ICO is
assembled from PNG frames by hand. The demo serves the SVGs straight from `brand/logo` and swaps
the dark/light lockup with the theme. The logo keeps its own fixed accent: the demo hue slider
does not recolor it. The embedded C2PA manifests were left in place; they no longer match the
edited content (documented in the logo README).

### D61. Radio, fieldset, slider, dropzone: native controls, thin directives (2026-10-02)

Radio is a styled native radio (like the checkbox); grouping, arrows and form values stay
native. `fieldset[vdFieldset]` is `vd-field` for groups: same `VD_FIELD` context but many
controls (invalid/required if any is), hint and error under the legend, and the description on
the fieldset rather than on each option (GOV.UK pattern) so it isn't repeated per option.
Slider is a native range; Blink/WebKit have no "filled" pseudo-element, so the directive writes
`--vd-slider-fill` on input and after every render (forms write `value` without an event);
Firefox uses `::-moz-range-progress`; forced colors fall back to the native control. Dropzone
wraps a native file input in its label (keyboard and picker native); dropped files bypass the
picker's `accept` filter, so `vdCheckFiles` (core) checks type/size/count and the accepted
files are written back to `input.files` for plain form submits. Uploading and the file list
stay with the consumer.

### D62. Breadcrumbs, accordion on `<details>`, popover (2026-10-02)

Breadcrumbs are plain markup on a named `nav` (ordered list, `aria-current="page"` on a
non-link); chevron separators are CSS masks, mirrored in RTL, absent from the accessibility tree.
Accordion uses native `<details>`: keyboard, state and find-in-page come free; exclusive groups
use the shared `name` attribute; height animates through `::details-content` +
`interpolate-size` only where supported (instant elsewhere and under reduced motion). `open` is a
boolean input + `openChange` (not `model()`), because `model()` can't transform the bare `open`
attribute that native `<details open>` usage expects - the demo failed to compile with it.
Popover is a non-modal `popover="auto"` dialog anchored like the menu; focus goes to
`[autofocus]`/first focusable on open and returns to the invoker on close (native). Some engines
light-dismiss on the trigger's pointerdown even with `source`, so the trigger records the state
at pointerdown - the same fix the menu controller already had (D54); a shared helper is a
candidate if a third trigger needs it.

### D63. Calendar and date picker on plain ISO dates (2026-10-02)

Dates are "YYYY-MM-DD" strings with UTC math in `core/date.ts` (pure, tested): no time zone,
so a date can't shift by a day between server, client or DST, and comparisons are string
compares. Locale data comes from `Intl`: names, month titles, digits (Arabic-Indic for `ar`),
numeric order for parsing and the placeholder; week start from `Intl.Locale#getWeekInfo` with a
region fallback (Firefox lacks it). Weekday headers use "short" names unless one is longer than
3 characters (Arabic short = full word), then "narrow". The grid follows APG (roving tabindex on
cells, full-date `aria-label`, `aria-current="date"`), always 6 weeks so the height never jumps,
and initial focus goes to the nearest available date. The date picker is an editable text field
(typed dates in the locale order, two-digit years, ISO) plus a calendar popover anchored to the
whole field; it reuses `vdInput` inside `vd-input-group`, so `vd-field` labelling and errors
work unchanged, and an unparsable or unavailable typed date keeps the last valid value and shows
invalid. Ranges, time and multi-month views are out of scope.

### D64. Multi-select extends the existing select group (2026-10-07)

`VdMultiSelect` is exported from `@vadem/ui/select` and uses the existing `vd-option`,
listbox registry, popover setup, keyboard helpers, and field/forms wiring. The internal
`VdListboxBase` now accepts a value type; concrete controls own their value model, selection
predicate, form-write normalization, and choice behavior. Select/Combobox retain single-value
behavior, while Multi-select toggles an immutable array and keeps the popup open. Selection
helpers live in pure TS under `select/src/core/`; no new runtime dependency or public registry.

The editable input owns focus and `aria-activedescendant`; the listbox is explicitly
`aria-multiselectable`. Space edits the query, Enter toggles, and Tab/Escape never select an
active option. Removal buttons have complete localized names; empty-query Backspace removes
the last value unless disabled. Unknown values remain visible, avoiding silent data loss when
options load later. Styling reuses existing field/listbox tokens with compact wrapping chips,
logical properties, reduced-motion handling, forced-color borders, and an unanchored CSS
fallback. New token scales and signature changes were not needed.

Signal Forms chooses the CVA integration when an accessor is present. Its current `required`
validator does not reject `[]`, unlike Reactive Forms: the demo uses `required` for metadata
and `minLength(..., 1)` for array validation. This was verified against installed Angular
22.2.1 sources and exercised in Chromium. See `specs/multi-select.md` for the public contract.

### D65. Stepper is ordered navigation, not tabs (2026-10-07)

`@vadem/ui/stepper` uses a native named `nav`, ordered list and buttons, following
[WAI ARIA26](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA26) for `aria-current="step"`.
Enabled stages participate in native Tab order; Enter/Space activate without moving focus.
No roving tabindex, tablist roles, automatic completion, or form-control accessor: consumers
own workflow validation, availability, content and focus when their Next/Back actions change
stages. The gallery demonstrates Reactive Forms, validation before completion, and focus on
the new stage heading.

Completion and errors are explicit, independent of the current stage. Errors take indicator
priority; the current title stays underlined so it remains identifiable in completed/error
states and grayscale. Localized descriptions expose completion/errors to assistive technology.
Omitted values display the first stage without emitting; explicit missing keys show no current
stage. Content queries keep numbering in DOM order. Horizontal navigation stacks below a
30rem container width, with logical connector geometry for RTL. Below 12rem, indicators sit
above labels without connectors so enlarged text retains usable width. Existing tokens, native
buttons and CSS container queries are sufficient; no new dependency or token scale.

### D66. Pinned external design skills with project-local routing (2026-10-07)

The user approved Impeccable and Anthropic frontend-design after reviewing the design skill
proposal. Install their reviewed revisions under the existing `.claude/skills/` location,
including references, licenses and notices. Keep upstream files unchanged, record provenance
and SHA-256 checksums, and apply Vadem overrides through `docs/DESIGN_WORKFLOW.md`. Codex
reads these project files explicitly rather than assuming Claude-specific automatic loading.

Use frontend-design for a requested surface's direction and Impeccable for focused review or
refinement, alongside Vadem's component and accessibility procedures. Preserve existing fonts,
token architecture and identity. Vendored launchers and browser helpers are source artifacts;
installation does not execute them or authorize binary downloads, hooks, delegated agents,
replacement context files, or the audit's proposed UI changes.

### D67. Contain demo layouts and scroll comparisons locally (2026-10-07)

The first implementation step after the design audit fixes the gallery shell and the Button,
Input, Select, Table and Dashboard demos. Grid tracks use a minimum capped at their available
width, single-column grids explicitly use `minmax(0, 1fr)`, and action rows wrap. Mobile
spacing overrides follow their shared rules so equal-specificity declarations do not cancel
them. Header controls wrap naturally when text grows; the gallery header scrolls with the page
while the navigation remains sticky, avoiding an assumed fixed header height.

The desktop gallery sidebar has a viewport-sized scroll area; phone navigation keeps its
native horizontal scrollbar. Route changes scroll only the navigation to reveal the active
link. A browser-only ResizeObserver watches navigation and active-link dimensions so breakpoint
and text-size changes preserve visibility, with disconnection on unmount/destruction and the
initial route centering as a fallback when the observer is unavailable.

Button comparison matrices and plain table samples intentionally preserve their columns in
named keyboard-accessible scroll regions. This keeps comparison/data semantics without making
the whole document overflow. The API-key input sample uses a named icon-only copy action to
leave space for the value. No library API, token scale, signature or dependency changed.

Verification scope is these five routes, not complete remediation of the design audit. Root
font size at 200% is text-enlargement stress rather than browser zoom; automated axe results
do not establish complete WCAG conformance. See the historical review (report omitted).

### D68. Command composes searchable actions with native Dialog (2026-10-07)

The user selected Command palette. `@vadem/ui/command` provides an inline searchable action
list with focused-input combobox/listbox navigation; modal use composes it with existing
Dialog. Actions emit explicit selections without persisting a selected form value. Consumers
own execution, navigation, shortcut bindings, modal dismissal and localization. Shortcut hints
are display-only. The gallery binds Ctrl/Cmd+K only while its route is mounted and demonstrates
real theme switching; navigation examples report intent.

Filtering reuses the pure keyboard query matcher (all normalized terms across label/aliases);
list navigation skips unavailable actions without wrapping. Active identity survives query
reconciliation; native caret keys, Tab and IME composition retain their behavior. Only the
results scroll to reveal keyboard activity. Required item signals are inspected after OnInit
registration, while content queries retain DOM order, avoiding uninitialized sibling inputs.

The modal consumer synchronizes its open model before calling close and queues immediate
reopen requests until the native close notification. The Dialog controller ignores obsolete
close events received after native reopening. Native Dialog keeps the background
inert and restores focus; browser chrome can remain a Tab stop. Existing tokens and vendored
icons suffice. No extra dependency, global command registry, Router coupling or token scale.

### D69. Timeline preserves a native informational event list (2026-10-08)

The user selected Timeline for event history and statuses. `@vadem/ui/timeline` enhances a
native named `ol` and native `li` items rather than introducing a selectable workflow widget.
Consumers own chronological order, timestamps, appropriate heading levels and any native
actions. Native `time` attributes/text stay untouched; the component never infers timezones
or automatically sorts events. It has no live region, focus controller, form accessor, current
stage, disabled event, animation or extra dependency.

Neutral/success/warning/danger/info categories reuse semantic status pairs and existing
vendored icons. Visible localized status text accompanies decorative markers; empty labels
fall back to the category's default, so status is not encoded only by color. Forced colors
retain distinct icon shapes and text. Empty and loading history compose existing Empty state
and Skeleton outside the list, without fake events or automatic announcements of all history.

Logical CSS places a connector between direct items and ends it before the last item. Below
a 12rem container width, markers stack above content and connectors disappear to retain
reading width under text enlargement. Consumer actions must also wrap within that width.
The gallery demonstrates a native details button with application-owned expanded state;
Timeline adds no keyboard handlers or Tab stops. No new primitive/semantic token scale.

### D70. Number input keeps native stepping and numeric forms (2026-10-08)

The user selected Number input with decrease/increase, min/max/step and forms integration.
`@vadem/ui/number-input` composes one native `input[type=number][vdNumberInput]` inside
`vd-number-input`. The directive extends Input and Field registration; the group adds no
value model or CVA. Reactive/Template Forms keep NumberValueAccessor and Signal Forms bind
to the native input. Empty remains distinct from zero and typed values are never auto-clamped.

Step availability probes a detached native clone, preserving decimal alignment and the step
base (including the original value attribute). Successful actions write the native value and
emit one bubbling input/change pair. They never reverse direction when correcting out-of-range
values. Invalid intermediate numeric entry, step="any", inconsistent bounds, disabled and
readonly states cannot step. Input events and browser-only afterEveryRender reconcile values
and constraints, including programmatic form writes, without DOM polling or server reads.

At a bound, buttons remain focusable with guarded aria-disabled activation; disabled/readonly
fields natively disable them. Native ArrowUp/Down and editing remain untouched. The first
browser review revealed that using VdButton introduced competing initial aria-disabled host
bindings. Step buttons therefore own their native attributes and reuse shared Button CSS,
without changing the existing Button API. Narrow/enlarged-text review found lg buttons could
overflow; token-derived spacing, a 20% width cap and icon containment preserve input room.
No new dependency, primitive/semantic scale, locale parser, currency mask or acceleration.

### D71. Tag input separates the draft from committed labels (2026-10-08)

The user approved Tag input after its concrete add/remove, duplicate and forms proposal.
`@vadem/ui/tag-input` owns a string-array model, a native draft textbox, a named native list
and explicit add/remove buttons. No suggestion/listbox/selection abstraction is added.
Input/Field/Button geometry and existing fonts/icons/tokens are reused. Tag labels wrap fully,
including unbroken identifiers, instead of hiding their meaning behind ellipsis.

User additions trim outer whitespace and normalize Unicode NFC. NFC/lowercase identifies
case-insensitive duplicates while preserving accents, internal spaces and first spelling/order.
The pure core never mutates consumer arrays. Draft text does not modify a form value; only
successful explicit add/remove actions do. Duplicate feedback retains the draft. Backspace
from an empty draft focuses the last remove button; Enter/Space removes explicitly, and Escape
returns to the textbox. IME and native editing remain intact. Enter never implicitly commits on
blur or submits the editable control's surrounding form.

This array-valued composite implements FormValueControl<string[]> only: Angular 22 connects
its value model/touch output directly to Reactive/Template Forms and Signal Forms. An explicit
CVA would take precedence for FormField and bypass the custom focus method, so no CVA/provider
is added. Unit/browser checks cover both form systems and Signal Forms focus forwarding.
NgControl state mirrors after init; whole widget exit emits touch, internal focus does not.
External model replacements clear pending editing after browser render. User commits record
the new reference first so that reconciliation preserves their addition/removal feedback.
Signal Forms required metadata alone does not invalidate an empty array in the installed
Angular; the demo combines required with minLength(1). Native draft required is intentionally
absent: committed tags can satisfy the form while the draft is empty.

Reset also clears the native textbox, covering input/reset in the same render interval when
Angular's cached value binding otherwise leaves stale text. A persistent status uses textContent
so empty feedback is actually empty (template whitespace previously reserved a blank line).
Repeated feedback clears and repopulates the status across render reconciliation; DOM mutation
checks verify those changes without claiming assistive-technology execution. Stable normalized
track keys preserve tag DOM identity through case changes. Disabled editors keep tag text at
full contrast while actions and the native input convey unavailability; fading the entire
shared Input group initially failed axe on informational tag labels. No timers, new dependency, token
scale, signature move, delimiter parser, remote suggestions or drag sorting were introduced.

### D72. Tree view separates branch expansion, selection and focus (2026-10-08)

The user approved a single-select Tree view with keyboard navigation and RTL. Native
`ul[vdTree]` / `li[vdTreeItem]` / `ul[vdTreeGroup]` preserve a mounted nested hierarchy.
Each item has a required stable key and plain-text label; aria-labelledby excludes descendant
names. Parent-only aria-expanded and explicit level/position/set-size reflect the hierarchy.
No router, form accessor, virtualized data model or new dependency is introduced. Angular
Aria's tree guide and the WAI-ARIA APG were checked as behavior references, not dependencies.

Arrow navigation never selects. Enter/Space or a row click selects; clicking a parent's
chevron expands without selecting. Branch keys mirror the computed reading direction.
Disabled items stay focusable for discovery but cannot select/expand; a disabled whole tree
has one container Tab stop. Typeahead reuses the existing keyboard helper, and * expands
enabled sibling parents. IME and modified shortcuts remain untouched.

Pure TS computes preorder visibility, keyboard actions and focus recovery. Collapsing an
ancestor preserves a selected descendant's value and moves DOM focus to the visible ancestor.
Removal falls back to visible selection or first item. Programmatic selection outside the
widget updates its next Tab entry; external updates do not steal outside focus. Immediate
child focus after expansion may precede DOM visibility, so a guarded afterNextRender retries
only while focus still belongs to this tree. No document/window globals or timeouts are used.

A narrow/enlarged-text review found that fixed nesting and an empty check slot could exhaust
label space. Logical group indentation is capped at 10% of available width, and unselected
rows omit the unused check slot. Long labels wrap; selected rows retain a check as well as
surface treatment. The gallery uses wider content columns and smaller state headings to
keep the component hierarchy legible. Existing tokens, fonts and Lucide paths are reused.
Contract: specs/tree.md. Validation and browser limitations: the historical review (report omitted).

### D73. Toolbar composes native buttons with one keyboard entry (2026-10-08)

The user approved Toolbar with native Button/Icon actions, named groups, separators, both
orientations and RTL navigation. `@vadem/ui/toolbar` provides standalone directives; consumers
retain click handlers, pressed state and localized labels. No selection model, form accessor,
links, text fields, overflow menu, global shortcuts or dependency is introduced.

The existing pure keyboard helper navigates available actions with wrapping arrows and
Home/End. Native Enter/Space activate Button. Disabled/loading and explicitly hidden items
or groups are skipped. A pure entry helper preserves the remembered action or recovers at
its former position. After-render reconciliation owns roving tabindex beside Button's host
bindings, repairs unavailable focused actions, and preserves external focus. Independent
nested toolbars are filtered by their nearest injected owner.

Groups and separators expose native accessible roles; separator orientation is perpendicular
to the action axis. Horizontal wrapping preserves DOM traversal rather than inventing visual
row navigation. Long Ukrainian/Arabic labels wrap using existing tokens and logical layout.
Pressed state combines neutral fill and a border; forced-color treatment preserves the
shared Button focus outline. Demo status spacing uses the existing space-3 token. Enlarged-text review found fixed
inline padding consumed label room: toolbar padding caps at 3% of available width; text-button padding caps at 5%
below a 30rem viewport, and demo panels at 5%, while retaining existing token maxima.

Contract: specs/toolbar.md. Evidence and execution limits: the historical review (report omitted).

### D74. Password input keeps native value and separate reveal state (2026-10-08)

The user approved a reusable Password input with accessible reveal, focus/selection
preservation, forms and disabled/readonly/error states. `@vadem/ui/password-input` composes
a native input extending VdInput with a named Button/Icon toggle. Standard text value
accessors remain on the input; no custom accessor, copied value or duplicate form state is
introduced. Consumers provide autocomplete/name and their own validation.

Reveal owns type=password/text. The button label stays constant and aria-pressed exposes
state; changing both label and pressed state would conflict with APG toggle-button guidance.
The native type update is synchronous, then selection range/direction and scroll are restored
without value events. Primary mouse activation while editing prevents focus transfer; keyboard
activation retains button focus. Native editing/IME and Enter in the input remain unchanged.

Readonly permits inspection because revealing does not edit a value. Disabled blocks reveal
and masks a previously visible password; after-render reconciliation observes native disabled
changes from Reactive/Signal Forms or attributes without server DOM execution. No password
contents are echoed in status/live regions. The gallery uses fictional values only.

Existing Input group/Button geometry, size/invalid tokens, fonts and icons are reused. The
reveal target caps at 25% of narrow container width. No dependency, strength meter, generator,
clipboard helper, Caps Lock detector, token scale or signature move is added. The existing
login composition is preserved; adopting this control there is a separate integration step.
Contract: specs/password-input.md. Evidence: the historical review (report omitted).

### D75. Splitter sizes two panes without collapsing their content (2026-10-08)

The user approved two-pane horizontal/vertical resizing with mouse/touch, keyboard, bounds
and RTL. `@vadem/ui/splitter` supplies native-container directives, a model percentage and
pure TS bounds/key/drag arithmetic. Layout orientation describes pane arrangement; the
separator's ARIA orientation is perpendicular. Its required name matches the primary pane,
with aria-labelledby supported for visible headings and aria-controls for the pane id.

Grid fractions share pane space after subtracting the handle. External models/constraints
produce a clamped display without emitting or rewriting the consumer's value. Bounds are
normalized to 1..99, retaining two nonzero panes; reversed/equal bounds lock resizing. This
first version deliberately has no collapsing, Enter toggle, persistence or multi-pane API.
The APG splitter pattern is still marked unfinished and includes collapse; it is a behavior
reference rather than a claim of complete implementation of that pattern.

Physical horizontal arrows mirror the share calculation in RTL; vertical arrows use block
order. Home/End use normalized limits. Pointer capture covers mouse/touch/pen; cancellation,
lost capture, destruction and configuration changes end dragging. Missing capture support
leaves keyboard resizing available. No global listeners, DOM observers or dependency is added.

Pane tabindex=0 and contained overflow preserve keyboard scrolling of narrow/long content.
Consumers supply pane labels/regions and a definite height for vertical layout; supported
writing mode is horizontal-tb. Very narrow horizontal layouts remain two scrollable panes;
applications can explicitly choose stacked orientation instead of an automatic breakpoint.

Existing tokens supply the 24px default handle target, neutral surfaces/rails and accent
focus. Resize has no transition and no speculative decorative treatment. Contract:
specs/splitter.md. Evidence and browser limits: the historical review (report omitted).

### D76. OTP input keeps the entire code in one native field (2026-10-08)

The user approved OTP input after Splitter. `@vadem/ui/otp-input` exposes `VdOtpInput`,
extending Input on a visible native text input. One labelled tab stop preserves native
selection, paste, undo, IME, leading zeros and form accessors. Mono tabular digits with
existing space tokens distinguish code entry without duplicating its value into visual slots.
No automatic focus movement or submission occurs when the expected length is reached.

The directive supplies numeric inputmode and one-time-code autocomplete as platform hints.
Native pattern requires an exact ASCII-digit length, while maxlength limits user entry.
Configured lengths normalize to 1..12, with six as the nonfinite fallback. Values are never
stripped, numerically parsed or silently truncated on external writes/configuration changes.
Nondigits and spaced clipboard text remain editable and fail validation. A numeric keyboard
hint does not itself restrict input. Digits stay LTR within RTL Field labels/descriptions.

Native pattern validity and Angular form model validation are separate contracts. Consumers
configure matching Reactive/Signal Forms validators; the gallery demonstrates both. No CVA,
validator provider or second value model is added. Native required/pattern submission gates
remain available. Unsupported OTP suggestions fall back to typing/paste; no WebOTP API,
SMS retrieval, resend flow, countdown or verification backend is added.

Existing Input boundaries, sizes, disabled/readonly/error/focus states and Field wiring are
reused. Width caps to the container; at very narrow widths and enlarged text the input retains
native internal scrolling so the caret remains reachable. No dependency, token scale or
signature move is added. Contract: specs/otp-input.md; evidence: the historical review (report omitted).

### D77. Scroll area delegates scrolling and thumb geometry to the platform (2026-10-08)

The user approved a reusable Scroll area with styled scrollbars, keyboard, touch and RTL.
`@vadem/ui/scroll-area` supplies `VdScrollArea` on an existing noninteractive container,
with a required localized region label, native tabindex=0 and overflow:auto on both axes.
Consumers choose dimensions/content; the directive does not generate inner DOM, intercept
keys/wheel/touch, measure overflow, mirror scroll positions or normalize RTL scrollLeft.
Native controls inside retain their editing/activation keys. Content remains in DOM order.

Standard scrollbar-color maps to existing control-boundary/background tokens; scrollbar-width
stays auto to preserve OS geometry/user preference. This user-requested local scrollbar styling
is scoped to Scroll area; it does not alter the global scrollbar convention. No thin/hidden
variant or synthetic scrollbar/ARIA state machine is added. scrollbar-gutter:stable reserves
classic scrollbar space where supported; overlay scrollbars remain OS-controlled. Unsupported
styling declarations retain functioning system scrollbars. Forced colors explicitly restores
auto scrollbar colors and a system focus outline. There is no component animation.

No content padding is imposed, so tables can remain edge-to-edge. Consumers supply content
spacing and clearance for descendant focus outlines. The viewport uses an inset focus outline
so its own overflow does not clip focus. min-inline/block-size:0 permits grid/flex shrinking;
CSS controls the maximum block size. Both axes stay reachable rather than silently clipping
long content. Tab entry remains stable when content no longer overflows; consumers may use
native tabindex=-1 when a composite already owns its keyboard entry.

The Splitter gallery composition applies Pane and Scroll area on the same element. This avoids
nested scrollports or duplicate region/Tab targets. Existing standalone Table and Splitter
implementations are preserved. No dependencies, observer abstraction, virtualization, custom
thumb drag engine, new scale or signature treatment are introduced.
Contract: specs/scroll-area.md; evidence: the historical review (report omitted).

### D78. Time input retains native time editing and string values (2026-10-08)

The user approved Time input with hours/minutes, min/max/step and forms.
`@vadem/ui/time-input` supplies `VdTimeInput` on `input[type=time]`, extending Input
and its existing Field contract. Native string values, browser/localized segments,
picker affordances and constraint validation remain platform owned. No CVA, parser,
clamping, timezone conversion or custom popup is added. Step is expressed in seconds;
the gallery uses 900 for quarter-hours and demonstrates reversed overnight bounds.

HTML constraints do not configure Angular model validators. Consumers configure matching
Reactive/Signal Forms rules; the gallery demonstrates required and quarter-hour working
hours with both. Existing sizes, boundaries, disabled/readonly and focus/error styling
are reused, with a component font token referencing the existing mono font.
min-inline-size:0 allows shrinking in constrained layouts. No dependency, scale or
signature change. Contract: specs/time-input.md; review: the historical review (report omitted).

The extra gallery route exposed a sidebar reveal edge case on phone-to-desktop resize:
the sidebar can extend below the viewport while the header remains visible. Its current-link
centering now uses the intersection with the viewport, preserving the existing navigation
contract in both directions. This is a gallery regression fix, not a component behavior.

### D79. Time input uses a themed selection popup on standard activation (2026-10-08)

The user requested Vadem styling for the time dropdown. This supersedes D78's native-popup
choice while retaining its native editor, string values, constraints and forms accessors.
Native picker contents are not reliably CSS-addressable. Click and Alt+ArrowDown now open
an internal Vadem Popover with a named listbox and minute-resolution choices.
Pure core logic matches inclusive/overnight bounds, seconds-based step and native initial
step base. Finer-precision values remain editable in the native field. Live constraints and
disabled/readonly properties are rechecked before committing; no available minute choices
produce localized empty feedback. Only selection dispatches native input/change.

ArrowUp/Down, Home/End and Enter/Space operate a roving option; Escape cancels and restores
input focus. Tab leaves the non-modal popup. The native time role is preserved; aria-expanded
is unsupported on that role, so the directive uses data-state with allowed aria-haspopup/
controls rather than imposing combobox semantics on browser-owned segments. Labels are
localizable inputs. Existing Popover tokens, semantic colors and Lucide check are reused.
No dependency, new scale, custom CVA or application migration.

### D80. Time picker separates hour and minute selection (2026-10-08)

The user requested two columns, hours/minutes, instead of complete time rows. The popup
now has two locally named listboxes derived from the same valid-time core. Hours are unique
valid hour parts; minutes depend on the draft hour. Selecting an hour moves focus to minutes
without changing the form value. It preserves a valid minute or uses the first valid draft
minute. Only explicit minute selection commits and closes; Escape discards the draft.
Native editor, accessors, min/max/step, live checks and overnight behavior are preserved.
Each column has independent roving focus; Tab follows column order and leaves the non-modal
popup. Existing selected/focus styling and tokens are reused. Compact spacing plus nowrap
prevents two-digit options breaking at 320px with 200% text.

### D81. Whole-star Rating uses a named radio group and the existing model contract (2026-10-08)

The user approved Rating for 1..5 stars, keyboard, readonly/disabled and forms.
`@vadem/ui/rating` supplies VdRating with a native fieldset/legend and five native buttons
with radio roles. 0 means unrated. Exactly one value is checked even though its preceding
stars are filled. Hover preview never writes the model or changes ARIA selection. Arrows
wrap/select, physical horizontal direction mirrors in RTL, Home/End select endpoints and
Space/Enter activate natively. One Tab stop enters at the current value or first star.

Rating owns its visible/localizable legend. Field wraps it without another label and supplies
hints/errors. Readonly group aria-readonly blocks editing and preserves inspection focus;
disabled uses native disabled buttons. The existing FormValueControl<number>/model/touch
contract integrates Angular 22 form APIs, with NgControl state mirrored using the existing
bridge. No custom CVA or Angular Aria dependency. 0 is nonempty for required alone, so required
ratings need min(1); gallery models also use max(5). External invalid values display unrated
without model mutation. Pure core owns normalization and key mapping.

The pinned Lucide icon generator adds star; styling reuses existing semantic colors, control
heights, spacing, radii and focus tokens. Solid/outline shape and numeric demo text preserve
meaning without color. Icons shrink within constrained hit areas at enlarged text. No new
dependency, scale, signature, half-star variant, variable maximum or automatic submit/clear.
Contract: specs/rating.md; evidence: the historical review (report omitted).

### D82. Color picker keeps HEX editing as a draft inside the existing Popover (2026-10-08)

The user approved Color picker with a palette, HEX editor, preview, keyboard, disabled/readonly
and forms, without dependencies. `@vadem/ui/color-picker` supplies VdColorPicker and named
VdColorSwatch application data. No default library palette or theme scale is added. Pure core
normalizes opaque 3/6 digit HEX, chooses contrasting data ink and maps palette navigation.
Invalid external values never become CSS data or silently rewrite the model. Duplicate palette
values keep the first name. Consumers supply validators and localized names.

The native trigger registers the Field control; the internal text editor reuses Input CSS
without its registration directive. Angular 22 model/touch FormValueControl<string> and the
existing NgControl bridge support Reactive/Signal Forms, without a custom CVA. Trigger readonly
is focusable and guarded; disabled is native. Buttons match CSS :read-only even when editable,
so trigger rules explicitly retain the normal Input boundary and invalid state.

Existing native Popover handles top-layer, outside dismissal and Escape. HEX editing and
radio-arrow selection update only the draft. Apply/HEX Enter or explicit swatch activation
commits uppercase #RRGGBB. Escape cancels; leaving the popup dismisses without stealing outside
focus. The popup has one roving palette Tab entry; horizontal arrows mirror RTL. External model
replacement or locking dismisses stale editing. Named swatches, textual HEX, checked marks,
neutral frame contrast and system-color focus make selection understandable beyond color.

Explicit CSS anchors reuse Popover positioning. A centered viewport position-try fallback
handles cases where neither side fits. A container query switches four columns to two on
narrow popup content, with scrolling for enlarged text. Chips and icons shrink inside their
frames; trigger ellipsis preserves control geometry while the HEX editor retains full text.
Forced colors preserves only color data chips, keeping system selection/boundaries. No alpha,
saturation surface, eyedropper, native OS picker, new dependency or shared Popover/Input rewrite.
Contract: specs/color-picker.md; review: the historical review (report omitted).

### D83. Date range picker commits complete ISO date pairs (2026-10-08)

The user approved Date range picker with two dates, interval highlighting, bounds, keyboard
and forms. `@vadem/ui/date-range-picker` exports VdDateRangePicker and VdDateRange. Values are
nullable complete `{ start, end }` ISO date pairs without time. Calendar selection sorts its
two endpoints; typed reversed ranges show an error. A repeated date permits a one-day range.

Angular 22 FormValueControl types min/max as the entire value. Date boundaries therefore use
minDate/maxDate, preserving typed Reactive/Signal Forms. transformedValue manages raw text,
parse errors and form resets; editing removes a stale committed range until both dates are
valid and committed. Arabic decimal digits normalize before locale parsing. Consumers validate
external values and dynamically changed limits without implicit model rewriting.

Existing Calendar gains opt-in range presentation and an activation output that emits even
for a repeated date. Its default single-date value contract remains unchanged. The non-modal
Popover owns outside/Escape dismissal; cancellation discards calendar drafts. The native
trigger anchors the popup and receives focus after selection. Labels, textual endpoints and
ARIA selection preserve meaning beyond color; forced colors uses system boundaries.

Scoped container queries stack fields and move the month title above navigation. Narrow
popovers use smaller existing text and spacing tokens, unbroken day numbers and reduced outer
insets so 320px/200% text retains usable cells. No dependency, new token scale, presets,
separate month grids or shared Popover redesign. Contract: specs/date-range-picker.md;
review: the historical review (report omitted).

### D84. Skeleton stays decorative and composes inside native tables (2026-10-08)

The user approved extending Skeleton for text, avatars, cards and explicitly tables. The existing
attribute directive in @vadem/ui/skeleton provides text/circle/rectangle shapes, sm/md/lg
text/avatar sizing and consumer CSS geometry. Placeholder elements are empty and always
aria-hidden, with no controls, events, timers or progress semantics. Consumers own fetching,
aria-busy and one localized status outside the busy subtree.

Table skeletons compose with existing VdTable/VdTableScroll, preserving actual caption,
headers and column geometry. Only the placeholder tbody is hidden; loaded rows replace it.
This supports each application's column content without a duplicate table API. The gallery
shows four project rows with avatars, two-line names, owner/status/numeric cells and a loading
switch, plus a compact Arabic RTL example. Fixed column widths and reserved text-line height
prevent geometry jumps in the demonstrated transition; variable real content still belongs
to the application. Native keyboard scrolling remains available on constrained screens.

Neutral fill, radii, spacing and duration reuse existing tokens. The existing directional shimmer
and generic selector are retained; omitted shape keeps the CSS-sized 1lh placeholder from Card.
Reduced motion and forced colors disable animation entirely. Forced colors uses system
outlines. No new effect, dependency, token scale, global state or artificial async delay.
Contract: specs/skeleton.md; evidence: the historical review (report omitted).

### D85. Copy button reports actual clipboard settlement (2026-10-08)

The user approved Copy button for text/icon presentation with success/error feedback and code/
table examples. @vadem/ui/copy-button composes existing VdButton/VdIcon; the consumer supplies
exact text and localized labels. A stable action-name prefix retains source context; text
buttons append their visible state label to meet label-in-name. One atomic polite status
sits outside the busy button. Reserved label slots keep geometry stable, while shape and text
communicate feedback beyond color. No new icons, dependencies, token scale or Button rewrite.

Clipboard writeText is invoked directly in activation without permission preflight or clipboard
reads. Missing/denied APIs produce retryable error, never simulated success. Source text remains
selectable in the gallery for manual copying. No execCommand fallback or global shortcut.
Clipboard browser policies remain authoritative; no browser-specific permission assumptions.

Pending writes prevent duplicates and keep keyboard focus. Input revisions discard stale UI
settlement after source replacement, while retaining the pending guard until the uncancellable
browser write finishes. DestroyRef suppresses late emissions after destruction. Success/error
persists until another activation or source replacement, without reset timers or copied payloads.
DOCUMENT.defaultView owns navigator access only at activation; construction/render has no writes.

The host positions its hidden status locally so table scroll clipping also contains that status.
Narrow text buttons wrap the icon and use existing small typography/spacing tokens; all state
labels reserve geometry. Forced colors retains system focus and result shapes; copy-specific
reduced-motion CSS stops the inherited loading spinner without changing shared Icon behavior.
Contract: specs/copy-button.md; review: the historical review (report omitted).

### D86 — Data table composes native Table (2026-10-08)

The approved first step adds VdDataTable and VdTableColumn to @vadem/ui/table, rather than a
second renderer or data engine. Consumers keep native markup, sort helpers, Pagination,
Checkbox and Popover. Selection uses immutable stable-ID Sets; select-all affects only the
current selectable page and preserves other pages. Required columns and at least one column
remain visible, including externally supplied invalid hidden state. Hidden columns retain
original aria-colindex values; the table exposes the full column count and empty colspan
uses visible count. The gallery chooser adds a centered CSS anchor fallback when enlarged
text cannot fit beside the trigger. No new dependencies, tokens or persistence.
Contract: specs/data-table.md; review: the historical review (report omitted).

### D87 — Data table status filters remain consumer composition (2026-10-08)

The user approved a status filter combined with search, matching count and reset. The gallery
uses existing VdSelect/VdOption with stable status keys. Status and text predicates combine
with AND before sorting/pagination; changing either resets page one. Reset preserves sort,
selection and hidden columns. Matching and selected counts have separate polite announcements.
The empty state resets both filters. Filtering belongs to the consumer's data schema; no
new generic engine, dependency or Table API is introduced. Controls and table actions use
two wrapping toolbar rows so the Columns action does not wrap alone at desktop width.

### D88 — Range slider uses a stable two-thumb APG control (2026-10-08)

The user approved a two-thumb Range slider with bounds, step, keyboard and forms. A separate
@vadem/ui/range-slider entry point keeps the existing native single Slider unchanged. Two
native buttons with role slider share one rail, preserve lower/upper tab order, expose dependent
ARIA bounds and cannot cross. Equal values remain separately keyboard editable. Pointer
capture provides mouse/touch dragging and cancellation; clicking the track chooses the nearest
thumb. Numeric snapping/key behavior stays pure TS. No new dependency or token scale.

Value is a nullable readonly tuple. Null form reset renders the full interval while retaining
null and required validation. Display normalization never writes back implicitly. The maximum
is the highest step-aligned value inside the supplied upper bound; labels/valueText localize
both visible values and ARIA. Numeric inputs are minValue/maxValue: Signal Forms reserves
min/max for validator metadata of the tuple itself, causing incompatible numeric bindings.

The component implements Angular 22 FormValueControl with a value model and touch output,
following existing Rating integration. No new CVA abstraction is required. Field wiring
registers the lower slider ID and applies hint/error descriptions to both thumbs. Disabled
opacity applies only to the rail: dimming the complete group failed light-theme text contrast.
Contract: specs/range-slider.md; review: the historical review (report omitted).

### D89 — Calendar synchronizes roving state from actual day focus (2026-10-16)

The October 16 audit exposed keyboard activation using today's stored date after DOM focus
had moved to another cell. Day focus now updates the roving date without selecting it.
The displayed month stays stable on focus alone so an adjacent-month pointer target survives
until click; selection/navigation then updates the visible grid. Keyboard/selection tests
pin October 16 as the initial date and explicitly focus October 8, preventing today's date
from concealing the regression. Local calendar scrolling preserves day target sizes under
text enlargement; focus reveals the current cell. No value/API changes.

### D90 — Constrain content at its layout source (2026-10-16)

The audit found page overflow on 17 enlarged-text routes and normal-width Pagination.
Demo grids use zero-minimum tracks or bounded track minimums; action rows wrap. Numbered
Pagination retains its full controls in a named local scroll area with focus-ring padding.
Native focus scrolling may leave a partially visible button clipped, so focus explicitly
reveals it using nearest alignment. Compact mode remains opt-in. Segmented controls and
vertical Tabs can wrap when target sizes cannot fit a single row. Calendar and the true-size
spacing specimens scroll locally; no global overflow hiding or token-scale change is used.
Responsive regression now visits every route in the gallery registry, in LTR/RTL and normal/
enlarged text. Existing explicit comparison/table scroll regions remain keyboard accessible.

### D91 — Chart fixtures expose exact values without implying a live source (2026-10-16)

Dashboard's chart is labelled as demo data. Its accessible summary includes every plotted
value; a native disclosure exposes a table for visual inspection. Existing sparse chart
labels are preserved, with numbered point names for unlabelled samples; no dates or sampling
intervals are invented. The original chart, data fixtures and period/loading behavior remain.

### D92 — Upload list presents consumer-owned transfers (2026-10-16)

The user selected File upload list as the next component. `@vadem/ui/upload-list` provides
`ul[vdUploadList]`, preserving native list/button/progress semantics. A controlled readonly
record array contains stable ids, filenames, statuses, optional size text, progress and message;
it never retains File objects or sends requests. Id-only cancel/retry/remove outputs let the
consumer own cancellation, persistence, server errors and stale callback protection. The
optional presentation complements Dropzone without replacing its existing contract or demo.

Primary action identity stays stable through cancel/retry/success transitions. An after-render
focus recovery moves from a removed action to the adjacent row or empty list, while preserving
outside control focus. Progress ticks stay outside per-file polite status regions. Unknown
progress is native indeterminate; 100 percent does not imply success. Status text and shape
supplement color. Native controls suffice; Angular Aria was checked as a reference and no
runtime dependency or shared token scale is added. The gallery simulates transfers locally,
shows every state and includes disabled/empty/Arabic RTL examples.

### D93 — Description list preserves authored native term/value groups (2026-10-16)

The user selected Description list. A single `dl[vdDescriptionList]` directive reflects a
horizontal/vertical layout input; native direct `div` groups contain one or more `dt` terms
followed by one or more `dd` values. No record-array API, part directives, synthesized ARIA,
form integration or keyboard handlers are needed. Consumers retain links, badges, copy
buttons, zero values, localized missing-value text and empty-record composition.

CSS starts stacked; a named container query adds aligned one-third/two-thirds tracks from
30rem for horizontal layout. This responds to container width and enlarged text, with a
readable fallback if queries are unsupported. Explicit grid placement retains native term-
then-value DOM order for multiple terms/values. Styles target direct descendants so nested
content is not restyled. Existing palette/type/spacing tokens are reused; no dependency,
shared token scale, signature change or new platform requirement is introduced.

### D94 — Autocomplete retains native free text and consumer-owned suggestions (2026-10-16)

The user approved free-text Autocomplete with asynchronous suggestion states. A native
`input[vdAutocomplete]` extends existing Input and references a `vd-autocomplete` panel.
This preserves native text editing, Field integration, Reactive/Template/Signal Forms
accessors and form submission without changing the selected-value Combobox contract or
adding another CVA. Options carry stable ids, inserted labels, optional context and disabled
state; repeated labels remain independent. Manual selection never commits on blur or Tab.
`queryChange` emits completed user edits (IME buffered), while accepting a suggestion emits
native input/change plus a separate optionSelected event without starting another lookup.

Fetching, filtering, debounce and selected metadata remain application responsibilities.
The gallery honestly simulates latency/errors and guards responses with a generation id.
The library suppresses stale options while loading/error, clears invalid active descendants,
and cannot reopen a dismissed popup merely because results arrive. Native disabled/readonly,
external form writes and reset close the panel. Native form reset and Angular FormResetEvent
also dismiss an equal-value reset that a DOM value snapshot cannot detect. Signal Forms' NgControl
compatibility shim is not read for that subscription. Popup/options add no Tab stops.

The scroll container itself is the controlled listbox, allowing arrow-key navigation to reveal
options without a second keyboard entry. Visible non-option loading/error/empty copy is hidden
from that listbox's accessibility tree; the identical text is exposed by a stable polite status
outside the popup. This preserves required listbox children without fake selectable messages
or duplicate announcements. Arrows can scroll a long message when no enabled options exist.

Native Popover API is used with a measured fixed-position fallback, outside dismissal and
Escape/blur closure when unavailable. Positioning flips/clamps to the viewport using the root
content width: root clientWidth alone did not account for stable scrollbar gutter in RTL.
The popup inherits input direction and wraps full labels/descriptions. CSS anchor positioning
is not required. Existing token scales and identity are preserved; no new dependency is added.

### D95 — Navigation list preserves link and router semantics (2026-10-16)

The user selected Navigation list. `@vadem/ui/navigation-list` provides a named native nav,
link styling and a heading-label directive, with a convenience import array. Consumers author
native sections/lists and links; no route model, group component, state controller, selection
output or keyboard handling is needed. The library does not import Router. Consumer-owned
aria-current (page/location/true) drives a tinted current row, stronger text and an inline-start
indicator; RouterLinkActive can provide it without conflicting component state.

Native Tab/Enter, modifier-click, context menus, new tabs and browser history remain available.
Counts are ordinary optional metadata with consumer-provided accessible context, including zero.
Labels and unbroken identifiers wrap fully; metadata moves below the label in narrow containers.
At extreme text enlargement decorative icons yield their column to full-width labels. The current
indicator uses the existing text-accent color to retain at least 3:1 on its tinted surface.
Focus padding keeps the existing offset outline inside list bounds. Existing palette/type/spacing
scales and icons are reused. No dependency, shared token scale or signature change is introduced.
Empty/unavailable destinations are application composition rather than fake disabled anchors.

The demo uses real query-parameter navigation and router-owned current state inside the new page,
plus native fragment/target links, long Ukrainian content and an Arabic surface. Existing gallery
and screen sidebars remain intact; adopting the component there is a separate implementation task.

### D96 — Sidebar renders one copy of its content, docked or in a Dialog drawer (2026-10-16)

The user approved Sidebar with a collapsible rail in the first version. `@vadem/ui/sidebar`
takes the sidebar content as a template and renders it in exactly one place: a sticky docked
panel at viewport width ≥ 64rem, otherwise inside the existing start-edge Dialog (a bottom sheet
below 40rem). This removes the duplicated navigation markup the demo app frame needed and avoids
duplicate landmarks and ids. As with `--vd-dialog-sheet`, the breakpoint lives only in CSS: the
layout reads `--vd-sidebar-drawer` and re-checks it with a ResizeObserver. SSR renders docked
markup that CSS hides below the breakpoint until the browser switches modes.

The wrapper adds no landmark; a consumer Navigation list supplies `navigation`. One toggle
directive serves both modes: in docked mode it reflects the rail (`aria-expanded`,
`aria-controls`), in drawer mode it opens a dialog (`aria-haspopup="dialog"`). Following a link
in the drawer closes it; routerLink calls preventDefault, so the delegated handler checks only
the button and modifier keys. Changing modes with the drawer open closes it and Dialog returns
focus to the toggle, which exists in both modes; moving focus into the docked copy raced with
Dialog's own restoration and was dropped.

Rail mode visually hides link text, metadata and group labels but keeps them in the
accessibility tree; consumer content opts out with `data-rail="hidden"`. Rail tooltips reuse
`VdTooltipController` but are `aria-hidden` visual duplicates without `aria-describedby`, since
the link already has its name. Rail width changes are instant: animating the grid column would
shift layout. Persisting the collapsed state is the application's choice. `panel-left` was
added to the vendored Lucide subset (directional). Navigation list now moves metadata below the
label under 14rem instead of 16rem, so counts stay inline in a default 16rem sidebar.

Follow-up (2026-10-17): the demo app frame now uses `vd-sidebar-layout` and Navigation list,
replacing its hand-built aside, duplicated drawer navigation and Router-event subscription.
Adopting it exposed that the rail opt-out `[data-rail='hidden']` lost to consumers' unlayered
`display` rules (all Vadem CSS is layered, so any unlayered declaration wins). The flag now uses
a layered `!important`, which outranks unlayered normal declarations, the same mechanism the UA
uses for `[hidden]`. This is the only `!important` in component CSS and is limited to that flag.

### D97 — Project site is a separate app built on the library (2026-10-17)

The user asked for a project landing page with nestjs.com as a reference, in English and
Ukrainian. `projects/site` (`npm run start:site`, port 4300) is a separate Angular app that
consumes `@vadem/ui` like any application, so the page itself demonstrates the library. Its
hero specimen is made of real components, and a hue slider rewrites `--vd-hue-accent` on the
root to retheme the whole page live: the library's central theming idea shown in place.

Localization uses two routes (`/` English, `/uk` Ukrainian) and a typed copy object; the
Ukrainian object must match the English shape, so no key can be missed. `@angular/localize`
was not added (no new dependency for a single page). Nest's customer logos, statistics,
testimonials and sponsor tiers were deliberately not reproduced: Vadem has none, and invented
ones would be false. Component names in the catalog come from real gallery routes.

Manrope's space glyph is 0.2em wide (system sans is ~0.28em), so small text reads as
run-together words; the site adds a small `word-spacing`. A library-wide fix belongs in base
typography and needs the user's approval. The gallery URL is a constant in `landing.ts`
until the site and gallery have a deployment.

### D98 — Kbd formats shortcuts per platform; plain kbd stays for single keys (2026-10-17)

The base `kbd` style already covers one literal key, so `@vadem/ui/kbd` exists only for what
plain markup cannot do: platform-aware combinations (`Mod` is ⌘ on Apple and Ctrl elsewhere),
spoken names for symbols that screen readers otherwise read as "place of interest sign", and
HTML's nested-kbd semantics. Parsing lives in `core/shortcut.ts` (no Angular) for future
adapters. Server rendering uses the non-Apple form and the browser corrects it after render;
a `platform` input can pin one platform for documentation.

`vdShortcutAria` returns an empty string for sequences: in `aria-keyshortcuts` a space
separates alternatives, so "G D" would wrongly announce "G or D", and ARIA cannot express a
sequence. Shortcuts keep left-to-right order inside RTL text. Combinations wrap between keys
on narrow widths; a key cap never breaks. The demo app frame now shows the search shortcut
through Kbd and advertises it with `aria-keyshortcuts="Control+K Meta+K"`, matching its
handler.

### D99 — Component strings come from a locale; inputs override (2026-10-17)

73 English default strings were literal input defaults across 26 component classes, so a
Ukrainian app had to repeat translations on every instance. `@vadem/ui/locale` now holds one
`VdLocale` object with a section per component whose keys equal the component's text input
names, and packs for English (default) and Ukrainian. Components declare those inputs without a
default and resolve them with `vdTexts`: instance value first, then the active locale. Existing
code that passes strings keeps its behavior; only the fallback changed.

Count phrases are functions using `Intl.PluralRules` (`vdPlural`), because Ukrainian needs
one/few/many forms that the old English-only templates could not express. The locale is DI:
`provideVdLocale` for the app, `vdLocaleProvider` for a subtree, so one page can mix languages.
No i18n framework or dependency is introduced; `@angular/localize` remains the consumer's
choice for application text. Packs live in `core/` for future adapters. A new language is a
full `VdLocale` object, so the compiler reports any missing key.

The gallery keeps English as its default and adds a Localization page that renders the same
markup under both packs. Switching the whole gallery to Ukrainian would change accessible names
that many browser tests select by; that is a separate decision. Calendar month and weekday
names already come from `Intl` and are not part of the locale.

The Localization page exposed that Rating's star row did not wrap: `max-inline-size: 100%`
without `flex-wrap` let stars overflow their own box at 320px and 200% text. Stars now reflow to
a second row (WCAG 1.4.10); order and keyboard behavior are unchanged.

### D100 — CI and visual baselines run in the official Playwright image (2026-10-17)

GitHub Actions runs three jobs: lint + unit tests + library/demo/site builds; browser tests;
visual regression. Browser and visual jobs use `mcr.microsoft.com/playwright:v1.63.0-noble`,
and `npm run visual` (tools/visual.sh) runs the same image locally, because font rasterization
differs between hosts and pixel baselines from one machine fail on another. The image version
follows the installed `@playwright/test`; the workflow pins it explicitly and must be bumped
together with the dependency.

Baselines cover 13 pages in both themes (26 PNG, about 4 MB): the four token pages, common
components and the three demo screens. That catches most token-driven regressions without
committing every gallery route. Each page runs with a fixed clock, reduced motion, disabled
animations and loaded fonts; two consecutive runs matched, and a 1px change to one spacing
token failed 24 of 26 pages. Diff tolerance is 0.2% of pixels for antialiasing noise.

Five intermittent browser-test failures were test races, not component bugs: reading
`aria-activedescendant` before zoneless rendering, clicking outside a popup before it opened,
counting rows before render, and running axe on popups mid-fade (false contrast failures).
Every axe test now audits with reduced motion. On CI a test may retry once and is reported as
flaky rather than hidden; locally there are no retries.

### D101 — Progress ring is the spinner; loading motion stops under reduced motion (2026-10-17)

The user chose one component for both cases: `<vd-progress-ring>` without a value is the
indeterminate spinner, with a value it is circular progress (ARIA progressbar either way,
value attributes only when determinate). It lives in `@vadem/ui/progress` beside linear
progress and shares its variants. Size `lg` alone shows a centred percentage; the smaller rings
cannot fit it legibly.

This revisits D15. The brief requires disabling motion under `prefers-reduced-motion` while
keeping an understandable static state, and lists slowed spinners as a historical difference.
The user approved following the brief: the indeterminate ring stops and becomes a dashed,
half-strength circle (it reads as waiting and cannot be mistaken for 25% done), matching the
linear progress's steady half-strength bar. The Button loader icon now stops as well; its
static glyph still reads as loading. Other D15 rules (zeroed duration tokens) are unchanged.

### D102 — Context menu reuses Menu with a virtual anchor (2026-10-17)

`vdContextMenu` opens an ordinary `vdMenu`, so items, keyboard, typeahead and styling are the
menu button's. The menu controller gained one option, `returnFocusTo`, so focus returns to the
region that opened the menu rather than to a trigger. Regions sharing a menu share one controller
(registered per menu element); one controller per region would handle every key several times.

Positioning reuses CSS anchor positioning by placing a zero-size fixed anchor at the pointer or
the focused element. A fixed element's containing block is not always the viewport: the gallery's
container-query layout shifted it by its padding (15px in RTL). The anchor is therefore placed,
measured and corrected, which holds under any ancestor; RTL uses logical insets from the right edge.

Touch: iOS Safari fires no `contextmenu`, so a 500 ms long-press (10px slop) opens the menu, and a
second open from Android's own long-press event is ignored. Shift+right-click is not intercepted,
keeping the browser menu reachable. The demo pairs each row with its own visible menu button,
because a context menu must never be the only path to an action.

### D103 — Search input keeps the native field and owns only clearing (2026-10-17)

`@vadem/ui/search-input` follows the Password input pattern: a native `input[type=search]`
(extending `VdInput`, so validity and sizes are shared) inside an input group that adds a search
icon, a clear button and an optional spinner (Progress ring). Clearing sets the value and
dispatches native `input` and `search` events, so Reactive Forms and plain listeners update
without a custom accessor. The engine's cancel button is hidden for one cross-browser control.

Escape clears only a filled, editable field and then stops propagation; on an empty field it is
not handled, so an enclosing dialog or popup still closes on the next Escape. The clear button
keeps focus in the field. Filtering, debouncing and result announcements stay with the consumer,
and the library binds no global shortcut: the gallery binds `/` itself and declares it with
`aria-keyshortcuts`, showing the hint through the end slot while the field is empty.

### D104 — Banner is an Alert layout; Alert gains a built-in dismiss (2026-10-17)

A separate Banner would have duplicated Alert's variants, icon, title and end actions. Banner is
`layout="banner"` on Alert: edge to edge, one bottom rule, responsive inline padding. Below a
36rem container width it switches to a grid (icon, text and close on the first row, actions
below the text): flex wrapping alone squeezed the text into a one-word column on phones, with
the actions and close button still beside it.

`dismissible` adds a localized close button and a `dismiss` output; the application removes the
alert and remembers the choice. Before emitting, focus inside the alert moves to the next
tabbable element after it (or the previous one at the end of the page), because removing a
focused element sends keyboard users back to the top of the document. This also benefits inline
alerts, whose spec previously left focus handling to every consumer.

### D105 — Stat speaks its direction and isolates numbers (2026-10-17)

`@vadem/ui/stat` replaces the dashboard's hand-built KPI tiles. It is a description list, not a
heading per figure. The change is the library's Badge (an early version drew its own chip; the
visual baseline diff showed it looked weaker than the Badge it replaced). Direction is spoken
("Падіння"), and sentiment only chooses the Badge color, so a falling error rate is green.

Values sit in `<bdi>` whose `dir` comes from the content. `unicode-bidi: plaintext` fixed the
order of "₴ 48 920" in RTL but aligned the whole value left; a `<bdi>` without `dir` inherits RTL
in current Chrome when the text has no strong letters, reversing it again. Content without
Hebrew/Arabic letters is `ltr`, other content `rtl`. This resolves the reversed dashboard numbers
recorded as a known issue. Applications must format with `Intl`, whose non-breaking separators
keep digit groups together in RTL.

The visual baselines from D100 were never committed: the Angular CLI's `__screenshots__/`
ignore rule matched them, so CI's visual job would have failed on its first run. The rule now
excludes `e2e/visual/__screenshots__/`. `tools/visual.sh` forwards `DEMO_URL`, so baselines can
be compared against a server other than :4200.

### D106 — Charts: validated categorical palette, table twin, refetch keeps the frame (2026-10-17)

The user approved Bar, Line and Sparkline in one step and a palette of our own. Charts follow the
dataviz method: the form is chosen by the data's job, donuts are omitted (stacked bars carry
part-to-whole), and there is never a second value axis. `--vd-color-chart-1..8` are eight OKLCH
hues with slot 1 fixed to Vadem's violet; the other seven were ordered by enumerating all 5040
orders and keeping those that pass the six checks in both themes, then choosing the best worst-
case separation (CVD dE 12.1 light / 11.9 dark, normal vision 23.2 / 19.7; first three slots also
pass all-pairs). They are exact values rather than ramp-derived, independent of the accent hue,
so retheming cannot break separation. Amber is 2.3:1 on the light surface; every chart ships a
legend and a data table, which the method accepts as relief.

Every chart is one tab stop with arrow-key exploration, a visual tooltip and an accessible name
per category; the data table is the full equivalent. Missing data is a gap, never zero. Plot
geometry stays LTR in RTL pages. The dashboard's hand-built chart moved to `vd-bar-chart` with
`highlight="max"` (the emphasis form) and kept its look. Migrating it showed that swapping the
chart for a skeleton on refetch destroyed the open data table; charts now take `loading`, which
mutes the previous render and sets `aria-busy` instead. Stat values use proportional digits.

Process note: several "stale dev server" episodes were compile errors. The dev server keeps
serving the last good build after an error, so its log, not only `ng build`, has to be checked.

### D107 — Editable text: explicit edit session with application-owned persistence (2026-10-18)

The user approved inline text editing, Enter to save, Escape to cancel and retry without lost
text. `VdEditableText` owns the draft while its `value` model holds only committed text. The
optional `save(candidate)` callback resolves before a changed value is emitted; rejection
retains the draft and reports a localized generic error. Blur does not guess whether to save
or cancel. During persistence the input stays readonly and tabbable, cancel is disabled and
duplicate saves are ignored. The consumer owns cancellation/record identity. Late completion
cannot overwrite a newer bound value and does nothing after component destruction.

Native Button, Input and Field supply semantics; this edit session adds no CVA or FormField
contract. Text defaults are in the English/Ukrainian locale packs. Focus returns to the edit
button only when the user has not moved outside; the component query must explicitly read
ElementRef because the trigger is a Button component. Narrow error wrapping is scoped to this
component, preserving existing Field layouts. Contract and evidence:
[spec](specs/editable-text.md), review (historical report omitted).

### D108 — Form error summary: explicit submit focus, native field links (2026-10-18)

The user approved an error summary with field navigation, keyboard support, Ukrainian locale
and both themes. The application supplies ordered target/message pairs and invokes focus()
after invalid submission. The component does not discover errors, intercept forms, or move
focus on passive updates. Empty content is hidden; nonempty content is an h2-labelled region
with a native list of links. Explicit focus conveys context without a live alert reannouncing
the complete list on every edit. Applications retain matching inline errors with Field.

Target strings are raw document IDs, resolved with getElementById rather than CSS selectors.
Only ordinary unmodified activation is intercepted, focusing a visible/enabled target without
hash/history changes. Modified links keep native behavior. Unavailable targets do not redirect
to a guessed control or acquire synthetic tabindex. Hidden panels and validation remain the
application's responsibility. Existing semantic tokens provide the danger treatment; narrow
padding and a wrapping title prevent the icon column from fragmenting enlarged text.
[Contract](specs/form-error-summary.md), review (historical report omitted).

Focus refinement for D108: activeElement alone was insufficient evidence at 320px/200%. Layout
anchoring after inserting errors could leave the newly focused summary off-screen. Focus now
prevents implicit scrolling and schedules a coalesced next-frame instant scroll to the start,
only if focus still belongs to the summary. Destruction cancels the frame. Applications provide
scroll-margin-block-start for sticky chrome; the gallery does so without a library header offset.

### D109 — Character count: advisory UTF-16 length and quiet linked announcements (2026-10-18)

The user approved used/remaining counts, over-limit feedback and accessible announcements for
Input/Textarea. VdCharacterCount receives a controlled string and advisory maxLength. It counts
UTF-16 units like native maxlength/Angular validation, preserving spaces, emoji units and text
without trimming/truncation. Validation, error timing and hard restriction belong to the form.
English/Ukrainian locale functions own copy and plural rules; countText can override formatting.

The visible description and hidden polite status are siblings. Field gains optional deduplicated
descriptionIds so counter context remains associated beside hint/error without competing host
bindings. Initial output is silent. Only a focused editable native control schedules a 1000ms
quiet-period update; publication rechecks the same control and timers are cleaned up on changes
or destruction. No form accessor, focus move or document listener is added. IME uses the owning
form's committed value (the demo verifies Reactive Forms' native composition buffering).

Numeric used/maximum pairs are LTR-isolated with bdi: RTL screenshots exposed reversal without
it. Empty live regions must remain present; the demo hides only its empty result paragraph.
[Contract](specs/character-count.md), review (historical report omitted).

### D110 — Text highlight: native relevance marks and original text slices (2026-10-18)

The user approved all case-insensitive matches, Ukrainian/RTL and both themes for search
results, tables and Autocomplete. VdTextHighlight accepts plain text and one literal query.
Escaped Unicode regexp search yields non-overlapping spans in original coordinates; source
slices retain case, spaces and order. Lowercasing the source first would shift offsets for
length-changing case conversions. Native Unicode simple folding is explicit; accent folding,
stemming, canonical normalization and multi-term parsing remain outside this contract.

All fragments are interpolated text with native mark elements. No innerHTML, DOM rewriting,
events, focus target or per-match speech is introduced. Marks inherit metrics with zero padding;
existing action-subtle/action-text tokens provide contrast, and forced colors gains an underline.
Autocomplete opts in through highlightQuery and otherwise retains plain labels; its accessible
names, filtering, descriptions and keyboard selection keep their existing behavior. No generic
custom option renderer or new shared core API was added. Disabled option marks inherit the option foreground rather than
brightening an unavailable label, preserving muted/system foreground inheritance.
[Contract](specs/text-highlight.md), review (historical report omitted).

### D111 — File preview: owned Blob URLs and native PDF fallback (2026-10-18)

The user approved a Dialog-based image/PDF preview with filename, download and error state.
VdFilePreview accepts File/Blob rather than trusting remote resource URL strings. Browser-only
object URLs exist while open and are revoked on replacement, close and destruction. Image
nodes are keyed by URL and stale source events are ignored. The explicit image MIME allowlist
excludes SVG; unsupported formats stay download-only. MIME selects presentation, not malware
validation. The consumer owns acquisition, size/content limits and acceptance.

PDF is offered to a native object with application/pdf MIME, using a PDF-typed Blob copy.
Only that internally generated URL is marked as a trusted resource. No PDF parsing/runtime
library is added. Because plugin rendering cannot be reliably detected, pdf is not a loaded
state: the notice and download remain outside the object. Full Chromium rendered the demo;
Headless Shell exercised native fallback. Embedded viewer keyboard/accessibility is platform
and document-owned, with persistent Close and download outside it.

The full filename lives in the named keyboard-scrollable body, preserving the accessible
name while preventing long filenames from consuming the fixed Close header at 320px/200%.
No new dependency, token scale or signature. [Contract](specs/file-preview.md),
review (historical report omitted).

### D112 — Alert dialog: safe focus and explicit async decision sessions (2026-10-18)

The user approved consequential-action confirmation with Cancel-first focus, execution and
recoverable failure. VdAlertDialog composes native Dialog with role=alertdialog, aria-modal,
required title/description and a required application-owned action callback. Confirm defaults
to danger; primary is available for other important actions. UI defaults use both locale packs.
No service, transport, implicit Enter submission, new dependency or scale is added.

Escape cancels only idle/error sessions. Backdrop/swipe never dismiss the prompt. Pending
blocks reactivation/cancellation synchronously while both buttons remain focusable. Persistent
polite status is visually hidden when empty, never removed with display:none. Throws/rejections
retain the dialog and focus; success closes and emits once. Session generations suppress stale
results after a rendered close/reopen or destruction, without pretending to abort the operation.
The application owns changed targets, request lifetime and focus when its action removes the
opener. The gallery preserves its opener and makes local simulation explicit.

Title/consequence live in the named keyboard-scrollable body, leaving the footer reachable at
320px/200%. This component preserves Cancel → Confirm order on phones and resets inherited
Dialog description ordering so operation status follows the consequence. Existing Dialog
behavior and other compositions remain unchanged. [Contract](specs/alert-dialog.md),
review (historical report omitted).

### D113 — Expandable text: grapheme-safe length disclosure (2026-10-18)

The user approved long descriptions with Show more / Show less, no short-text toggle and
preserved source/focus. VdExpandableText accepts plain text, previewLength and an expanded model.
Intl.Segmenter yields original grapheme-boundary slices; no DOM line measurement, observer,
font timing or CSS-only visual clipping is needed. The display threshold differs deliberately
from Character count's native maxlength-compatible UTF-16 contract. Missing segmentation shows
the entire source rather than breaking emoji or combining sequences. No dependency or scale.

A prefix and native hidden suffix preserve the source once; a decorative aria-hidden ellipsis
exists only when collapsed. The native button controls that stable suffix ID with aria-expanded.
No innerHTML, rich-content renderer, extra speech or clipboard interception is introduced.
Expanded text and native selection preserve exact source spaces/newlines. Short/empty sources
remove the toggle while retaining the requested model for later content changes.

Ordinary toggles retain button focus. If it disappears while focused, capture focus before
rendering and recover to the paragraph after removal, only when focus otherwise fell to body.
A post-removal blur-only strategy lost this information in Chromium. External textarea focus
is preserved. Gallery-only padding adapts to 320px/200% through existing tokens.
[Contract](specs/expandable-text.md), review (historical report omitted).

### D114 — Reorder list: native move alternatives and drop-only mutation (2026-10-18)

The user approved one vertical reorderable list with pointer dragging, Up/Down buttons, focus
preservation and announcements. Native ordered semantics and buttons provide all operations
without dragging; no selection/listbox contract, deprecated grabbed state or CDK dependency.
Immutable items require unique stable IDs; movement preserves record identity and the application
owns persistence. Invalid IDs expose an explanatory state without ambiguous controls.

Pointer capture, a four-pixel dead zone and stationary rows allow a stable insertion preview.
Only release inside commits; cancellation, replacement, disable and destruction clean up without
model mutation. No cross-list moves, ghost or edge auto-scroll. Buttons reach any position.
Boundary controls are native disabled; focus follows the item to its available action. Capture
before render and recover after render, preserving outside focus. Keyboard movement scrolls the
focused control into view. Narrow containers give text full width and reflow controls beneath,
using existing semantic tokens. [Contract](specs/reorder-list.md),
review (historical report omitted).

### D115 — File size: pure formatter and pipe, inherited presentation (2026-10-18)

The user approved byte formatting in decimal/binary units, localized labels and robust zero/
unknown handling, reused in file components. A plain string formatter plus pure Angular pipe
preserves native text semantics without a wrapper component, extra roles or a CSS token surface.
Intl.NumberFormat owns numbers and decimal unit labels; IEC symbols identify binary powers
unambiguously. Only safe nonnegative integer byte counts are accepted. Rounded boundary values
promote to the next unit; invalid precision and malformed locale have documented fallbacks.

Pipe defaults come from VD_LOCALE; the framework-independent function defaults to English.
Upload list adds optional numeric size while keeping nonempty sizeText as the explicit override;
omitted size stays hidden and null is unknown. File preview displays actual Blob.size, independently
of preview MIME support. Both isolate metadata with bdi. Existing styles, dependencies, scales
and focus contracts are preserved. [Contract](specs/file-size.md),
review (historical report omitted).

### D116 — Relative time: explicit reference clock and native time (2026-10-18)

The user approved localized relative event timestamps with exact native datetime metadata and
controlled refresh. Require epoch milliseconds and an explicit reference timestamp; never read
Date.now or create timers per row. A pure formatter, pure pipe and component on native time let
applications share one clock, retain SSR determinism and compose with existing vdTimelineTime.
No live region, hidden duplicate speech, focus stop, service or new dependency.

Choose whole elapsed units without early rounding. Past values below five seconds use localized
just-now copy; future values remain future-tense. Days/weeks are elapsed 24-hour multiples;
months and years deliberately approximate 30/365 days, not calendar/DST scheduling. Input validation
accepts safe integer epochs within years 0001–9999; invalid values remove datetime and show unknown.
A valid source retains metadata even when the reference is invalid. Bdi isolates localized text.
Typography inherits from its containing component, requiring no new CSS or token scale.
[Contract](specs/relative-time.md), review (historical report omitted).

### D117 — Demo initial budget: defer the global toaster immediately (2026-10-18)

The demo's initial bundle reached 503.36 kB, exceeding its existing 500 kB warning budget.
Keep that budget and all library APIs unchanged. Wrap only the demo root toaster in Angular's
native `@defer (on immediate)`, loading it immediately after the initial non-deferred render.
No idle/interaction condition, placeholder, new service or dependency. The outlet stays once
at root across routes; toast store, timers, actions and live-region semantics remain library-owned.

Production stats verify 489.76 kB initial total (13,602 fewer JS bytes; CSS unchanged). This is
initial-bundle separation, not removal of toast code or a claim of measured faster total load.
The deferred chunk is still fetched immediately. Validate production chunks, first user-triggered
toast, SPA continuity, localization and existing visual baselines. A trial split of locale files
alone did not change the graph and was fully removed. No library or locale migration retained.
Validation (historical report omitted).

### D118 — Active filters: controlled removal requests and native buttons (2026-10-18)

The user approved a visible list of applied conditions, removal/clear actions and focus recovery,
with Ukrainian/RTL and both themes. Use a named group containing a native list and one full-chip
button per condition; no selection/listbox/toolbar mode or nested remove target. Existing Button
and Icon own controls and their states. Label/value are isolated plain text. Stable unique IDs
are required; invalid IDs expose explanatory text without ambiguous actions.

filterRemove and clearAll are requests only. The application owns array replacement, filtering,
persistence, result announcements and rejected/delayed requests. Capture owned button focus before
render and recover after removal to the same surviving ID or nearest remaining filter; empty/
disabled controls fall back to the stable group. Preserve outside focus. If the consumer unmounts
the group, it owns recovery: the Table demo focuses search after final removal/clear. Table
selection persists and pagination resets; its initial unfiltered view stays unchanged.
No new dependency, scale, signature, service or document listener.
[Contract](specs/active-filters.md), review (historical report omitted).

### D119 — Repository documentation cleanup (2026-10-21)

For the single-commit GitHub import, remove dated review/audit execution reports and
completed proposal logs. Keep component contracts in `specs/`, durable technical decisions,
project instructions, design routing/provenance, and asset licenses. Historical validation
statements above describe their original runs; they are not current validation claims.
Replace the generated library README with package-specific setup and usage guidance.
The local development Git history is preserved separately from the new import history.

### D120 — npm publishing through GitHub OIDC (2026-10-21)

Use a manually dispatched `publish.yml` workflow on main, with dry-run enabled by default.
Direct publication requires a successful push-triggered CI run for the exact commit.
Build and publish only `dist/ui`; authenticate with npm Trusted Publishing rather than
a stored npm token. Keep the library version consumer-controlled in its package manifest.
One-time npm trust configuration is documented in `docs/PUBLISHING.md`.

### D121 — Context menu release timing and deterministic focus checks (2026-10-21)

In Chromium used by CI, right-click dispatches contextmenu before pointerup; opening an
auto popover inside that event lets the same gesture immediately light-dismiss it. Wait
for right-button release when buttons reports it held, preserving the original point and
opener. Cancel the pending listener on pointer cancellation/destruction. Keyboard and
after-release contextmenu events remain immediate. Keep native popover light dismiss.
Focus tests wait for the specific rendered trigger or enabled/roving action before the
next key, rather than relying on scheduling between Angular renders and Playwright input.

### D122 — Link npm publication to GitHub Releases (2026-10-21)

Keep registry.npmjs.org as the distribution registry for @vadem/ui. Publish metadata
links to the GitHub source, docs and issues. A successful OIDC publish is followed by
a separate minimally permissioned job creating v<version> and its GitHub Release at
the exact workflow commit. Dry runs never create a tag or release. GitHub Packages
is a different registry and is not required to make an npm package repository-linked.

### D123 — Validate the npm artifact outside the workspace (2026-10-21)

The gallery resolves library imports to source, so a green gallery build cannot validate
npm export paths or asset copying. Check the built VD_VERSION against the manifest and
verify secondary targets, CSS/fonts, README and third-party notices. Pack and independently
install the tarball into a temporary Angular application with no source aliases or symlinks;
use the workspace-installed top-level tool versions without adding project dependencies.
Compile every typed entry point and exercise the documentation form, themes, fonts and axe
in Chromium. Run this consumer as a CI job and check package consistency again on publish.
The manifest and public version constant must be updated together; the release guard fails
on drift rather than introducing version generation. Existing published artifacts are immutable.

### D124 — MIT licensing for Vadem-owned code (2026-10-21)

The owner explicitly selected MIT. Add the standard license with Vasyl Demchuk's copyright,
record MIT in workspace/library metadata, and copy LICENSE into dist/ui. Artifact checks
verify the copied license. Font OFL notices, Lucide ISC, and vendored skill notices remain
unchanged. Published versions are immutable; distribution changes require a new release.

### D125 — Publish the site and gallery together on GitHub Pages (2026-10-21)

The user requested public web previews of both existing applications. Build the presentation
site at the repository base path and the gallery under gallery/. Keep path routing and emit
an HTML shell at each known route so direct visits and reloads work on a static server with
real 200 responses. Avoid hash routing because the landing page already uses section anchors.
This is not SSR/prerendering. Resolve production catalog links against the document base;
retain the separate localhost gallery in development. Verify the production artifact before
Pages deployment. The separate npm publishing workflow and registry remain unchanged.

### D126 — Repair dynamic option navigation without changing selection (2026-10-21)

Tests reproduced stale active IDs and open disabled popovers in Select/Combobox. Move the
existing Multi-select lifecycle guard into the existing shared listbox base: close on disable,
and fall back to the first visible enabled option when the active target becomes unavailable.
Clear the active ID when none remains. This is navigation repair, not an implicit user choice;
keep consumer-owned values even when option data temporarily disappears. Do not mark controls
touched while disabled. Combobox CVA writes also discard the pending query, so reset/writeValue
reflects the form model rather than stale search text. No dependencies or public inputs added.

### D127 — Announce validator-derived required with aria-required, radios with `required` (2026-10-21)

The Field contract says the control announces `required` while the `*` marker is `aria-hidden`,
but a Reactive/Template `Validators.required` never set any attribute on the control. The shared
control base now sets `aria-required="true"` when the state comes only from a validator. Not the
native `required` attribute: on checkboxes and text inputs it would add native constraint
validation beside Angular's own. Radios get the native attribute instead, because `aria-required`
is not supported on `role=radio`. Explicit `required` input and Signal Forms keep the native
attribute. Field, Input, Checkbox, Radio and Switch specs move to `stable`; evidence is Chromium,
unit tests and axe. Firefox/WebKit and screen-reader passes remain deferred for 1.0 per the
lightweight personal-use plan.
