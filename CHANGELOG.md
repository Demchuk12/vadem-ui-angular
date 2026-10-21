# Changelog

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
