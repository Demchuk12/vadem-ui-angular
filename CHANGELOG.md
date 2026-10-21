# Changelog

## 0.1.0 - 2026-10-21

### Added

- Public API snapshot (`docs/api-surface.json`) with `npm run check:api` / `update:api`, run in CI
  and before publishing.
- Members demo screen (`screens/members`): a complete admin workflow made only of library
  components. List with search, sort and pages; create/edit in a modal form with validation and a
  server conflict; confirmed delete that survives a failure; loading, error and empty feedback;
  toasts. Browser tests cover the whole flow.

### Breaking (pre-1.0)

- `@vadem/ui/chart` core helpers now carry the library prefix, like `vdSortRows` and
  `vdPageRange`: `linearScale` -> `vdLinearScale`, `niceTicks` -> `vdNiceTicks`,
  `bands` -> `vdBands`, `nearestIndex` -> `vdNearestIndex`, `stack` -> `vdStack`,
  `extent` -> `vdExtent`, `barPath` -> `vdBarPath`, `linePath` -> `vdLinePath`,
  `areaPath` -> `vdAreaPath`.

### Fixed

- Announce validator-derived required state: Reactive/Template `Validators.required` and
  `requiredTrue` now set `aria-required="true"` on inputs, checkboxes and switches, and the
  native `required` attribute on radios. Previously only the `aria-hidden` `*` marker showed it.

- Slider: restore a visible keyboard focus indicator in forced-colors mode (the native control's
  own indicator was removed by `outline: none`).

### Changed

- Field, Input, Checkbox, Radio and Switch specs are now `stable`, backed by unit tests (Reactive
  and Signal Forms), browser checks at 320px, with long Ukrainian labels, forced colors, reduced
  motion and disabled states.
- Specs with dedicated browser tests and axe coverage are now `stable`: Alert, Calendar, Card,
  Accordion, Breadcrumbs, Button, Dialog, Kbd, Progress, Menu, Popover, Multi-select, Dropzone,
  Sidebar, Pagination, Segmented, Slider, Select, Stat, Toast, Table, Tabs, Search input, Upload
  list and Tooltip. Avatar, Badge, Empty state, Chart and Locale stay `draft`.
- Every gallery page is checked for 320px overflow (LTR/RTL), reduced motion and a visible
  forced-colors focus indicator on each tab stop; Select inside a modal dialog is covered.

## 0.0.3 - 2026-10-21

### Fixed

- Point the package `homepage` to the published component gallery site.
- Inset the file-preview surface and separate it from the dialog heading and actions.

- Close Select/Combobox lists when disabled and repair active option IDs after dynamic
  removal/disable without mutating the selected value; retain shared Multi-select behavior.
- Clear a pending Combobox query when Reactive/Template Forms writes a new value or resets.

- Clarify Field/Input, Select/Combobox, Dialog, and Menu contracts, including locale defaults
  and the distinct Tab selection behavior.

- Match the exported `VD_VERSION` to the library manifest (`0.0.3`).
- Correct the Data table import in the usage guide to `@vadem/ui/table`.

### Added

- Select and Combobox Tab regression scenarios and a bounded contract-review checklist.

- Owner-approved MIT licensing for Vadem's own code, included in the built package.

- Package checks for version agreement, secondary exports, CSS/fonts, README, and notices.
- An independent tarball consumer that compiles all entry points and exercises the documented
  form, dark/light themes, font loading, and axe in Chromium.
- A CI consumer job, release-time package verification, and compatibility/public API policy.

These changes are not included in the earlier npm `0.0.2` artifact.

## 0.0.2 — 2026-10-21

- Published through GitHub Actions OIDC with provenance and a matching GitHub Release.
- Included context-menu/focus fixes and expanded English documentation/examples.

[GitHub release](https://github.com/Demchuk12/vadem-ui-angular/releases/tag/v0.0.2).
