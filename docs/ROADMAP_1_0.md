# Vadem UI: roadmap to 1.0

Status: roadmap proposal; the first package-foundation batch was approved on 2026-10-21.
This is not blanket approval to implement new features, dependencies,
architecture changes, token scales, or licensing choices. Prepared on 2026-10-21.
“First version” means the first stable release, `1.0.0`; `0.0.2` is already published.

## Product goal

A cohesive Angular UI library for application interfaces: forms, settings, administrative
workflows, and data-rich screens. Keep native semantics, plain token-based CSS, English and
Ukrainian strings, dark/light themes, and small compositional APIs. The first stable release
should let a developer build, ship, and maintain an application using the published package.

Use the current Angular-first architecture and identity. Future React/Vue/Svelte adapters
remain future work. Do not freeze the internal core API before a second adapter exists.

## Current baseline

Source inspection, not a new full technical or visual audit:

- Package: `@vadem/ui@0.0.2`; peer range `^22.2.0` for Angular common/core/forms.
- 68 secondary entry points, including utility/configuration foundations. This is not a count
  of 68 equally complete visual widgets. There are 68 specs and 73 demo routes.
- Spec labels: 35 `draft`, 13 `implemented`, 20 `stable`. These historical labels need a
  consistent readiness review; neither a label nor its absence proves implementation quality.
- Existing release evidence from this session: 405 unit tests, 601 Chromium browser scenarios,
  26 visual comparisons, library/demo/site builds, and strict compilation of usage examples.
  This evidence does not establish Firefox, Safari, physical assistive technology, or hydration coverage.
- Existing artifacts: component gallery, presentation site source, getting-started guide,
  compilable application examples, npm OIDC publishing, provenance, and matching GitHub releases.
- No root project LICENSE file was found. Font/icon/skill notices do not establish a license
  for Vadem's own code. The owner must select the intended distribution terms.

### Concrete issues to start with

| Priority | Finding                                                                                                                                   | Completion evidence                                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| P0       | `projects/ui/src/public-api.ts` exports `VD_VERSION = '0.0.1'` while the package is `0.0.2`.                                              | Published manifest and exported version agree; release checks detect future drift.                                            |
| P0       | `docs/GETTING_STARTED.md` lists `@vadem/ui/data-table`, which is not a package entry point. Data-table exports live in `@vadem/ui/table`. | Correct docs and a compiled consumer import from the packed package.                                                          |
| P0       | The workspace resolves most library imports to source paths; compiling the gallery alone cannot prove every npm export and asset works.   | An isolated consumer installs a packed tarball with no workspace path aliases and builds/runs successfully.                   |
| P0       | Root code licensing has not been chosen.                                                                                                  | Owner-approved license/terms, package metadata, and distribution notices agree.                                               |
| P1       | Chromium is the only browser configured in the current browser suite.                                                                     | Documented tests in other supported engines, with actual Safari testing for the Safari support claim.                         |
| P1       | SSR/hydration is an architectural requirement without an explicit CI consumer job.                                                        | A representative server-rendered consumer hydrates without mismatches or duplicate IDs and its controls work after hydration. |

The license is a release decision, not legal advice or permission to choose MIT automatically.
Consumer/SSR/browser tooling changes must be proposed before adding dependencies.

## Comparable libraries and useful lessons

Reviewed official documentation, not hands-on performance or accessibility benchmarks.
Counts, marketing claims, and different release numbers are not a quality ranking.

| Reference                                                                         | Documented approach                                                                                                                  | What Vadem should learn                                                                        | Keep Vadem's boundary                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [Angular Material / CDK](https://github.com/angular/components)                   | Official styled components and reusable interaction tools; component harnesses support testing without depending on internal markup. | Precise contracts, consistent interactions, robust testing boundaries, and upgrade guidance.   | Retain Vadem's visual identity; do not adopt Material styling or add CDK merely for parity.             |
| [PrimeNG](https://primeng.dev/theming) and its [Table](https://primeng.dev/table) | Broad application component catalogue, layered design tokens, and extensive data-table examples.                                     | Treat theming as a documented API; explain complete table/filter/pagination workflows.         | Preserve consumer-owned data operations. Vadem's selection/column controls are not a full grid engine.  |
| [NG-ZORRO](https://ng-zorro.github.io/docs/introduce/en/)                         | Ant Design-based enterprise UI, localization, configuration, and an explicit Angular compatibility policy.                           | Consistent forms, configuration rules, support matrix, and migration notes.                    | Vadem versions should describe Vadem API compatibility; they need not mirror Angular's major number.    |
| [Spartan](https://www.spartan.ng/documentation/introduction)                      | Accessible behavior primitives installed from npm plus copied Tailwind-based styled components.                                      | Composability, approachable examples, and a clear distinction between behavior and appearance. | Vadem remains an installable styled library with plain CSS, not a copied Tailwind component collection. |

[Angular Aria](https://angular.dev/guide/aria/overview) is an additional behavioral reference,
not a replacement design system. Angular's [v22 release page](https://angular.dev/events/v22)
states that Angular Aria and Signal Forms are stable. This does not authorize adopting a new
runtime dependency or replacing working Vadem controllers; evaluate concrete gaps first.

## What 1.0 promises

Following [Semantic Versioning](https://semver.org/spec/v2.0.0.html), 1.0 establishes the public
API and its compatibility policy. It is a support commitment, not a component-count milestone.

### Existing component scope

The proposal is to retain all currently published entry points and stabilize their documented,
bounded contracts. Do not remove shipped components just to make a smaller release checklist.
Review every entry; resolve an unfinished contract before 1.0, or explicitly agree a separate
experimental policy before making that promise. Do not silently rename existing imports.

| Group                | Existing scope to stabilize                                                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations          | Tokens, themes/density, typography/fonts, icons, locale, keyboard helpers.                                                                                                                                                        |
| Forms                | Field, Input/Textarea, Checkbox, Radio, Switch, Number/Password/Search/OTP inputs, Select/Combobox, Autocomplete, Multi-select, Tag input, date/range/time/color selection, sliders, Rating, Character count, Form error summary. |
| Overlays and actions | Button, Dialog/sheet placement, Alert dialog, Popover, Tooltip, Menu/context menu, Toast, Command.                                                                                                                                |
| Navigation           | Tabs, Accordion, Breadcrumbs, Sidebar, Navigation list, Pagination, Stepper, Toolbar, Tree, Scroll area, Splitter.                                                                                                                |
| Data and feedback    | Table sorting helpers and optional selection/column controls, Active filters, Chart, Stat, Timeline, Description list, Badge, Card, Alert, Avatar, Kbd, Empty state, Skeleton, Progress.                                          |
| Content/files        | Dropzone, Upload list, File preview/size, Copy button, Editable/Expandable text, Text highlight, Relative time, Reorder list.                                                                                                     |

List of secondary directories is the source of truth for import paths; several patterns share
one entry point. For example, data-table controls are exported by `@vadem/ui/table`, textarea
styling by `@vadem/ui/input`, and context menu by `@vadem/ui/menu`.

Applications continue to own fetching, sorting/filter semantics, uploads, authentication,
persistence, and business authorization. Document what each component does and does not do.

### Explicitly outside the initial stable release

No new Tree select, Transfer list, rich-text editor, scheduler, Gantt, spreadsheet/grid engine,
virtualization framework, generic query/data-source engine, theme marketplace, or additional
framework adapter is required to reach 1.0. Existing charts keep their existing bounded scope.
Do not add those features solely because a comparator offers them. Reconsider them later when
an application supplies a concrete requirement and the user approves the scope.

The plan does not authorize a token redesign, icon migration, new signature effects, new skills,
or a package split. Resolve the brief's existing icon/signature/reduced-motion discrepancies
explicitly before freezing the affected contracts.

## Delivery sequence

Version labels below are proposed milestones, not scheduled publication or calendar estimates.
Patches can ship between them; no release should be published merely to satisfy this sequence.

| Milestone                       | Work                                                                                                                                                                                           | Exit condition                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0.1` — dependable package      | Fix version/import drift; define public API and stability labels; choose licensing; add isolated tarball consumer checks; establish changelog and compatibility policy.                        | A new Angular consumer installs the package, compiles all documented entry points, loads styles/fonts, and renders a representative form without source aliases. |
| `0.2` — forms and overlays      | Audit/refine Field + forms integration, complex option controls, dates, dialog/popover/menu lifecycle, focus recovery, nested/disabled/dynamic states, Ukrainian/RTL.                          | Shared interaction contracts are documented and pass targeted tests in both themes; no confirmed blocking keyboard/form defects.                                 |
| `0.3` — real application use    | Build on the existing dashboard/settings/login compositions; document a complete table workflow, form validation, and file states; add API/examples/styling information for every entry point. | An external consumer implements a CRUD list, edit/validation flow, confirmation, and loading/error/empty feedback without patching library internals.            |
| `0.4` / beta — support evidence | Add browser/SSR/hydration coverage; measure packed-consumer JS/CSS/font cost; document granular CSS use; review screen readers, reduced motion, forced colors, narrow/zoomed layouts.          | The declared support matrix is backed by recorded checks; measured budgets are agreed; no critical unresolved issues.                                            |
| `1.0.0-rc.1` → `1.0.0`          | Freeze the reviewed contracts, use the candidate in at least one real application, verify an upgrade path, publish release/migration notes.                                                    | All release gates below pass; any changes after RC trigger the affected checks again.                                                                            |

### First implementation batch after plan approval

1. Fix the invalid Data table import in documentation and synchronize `VD_VERSION`.
2. Add a lightweight release check for version agreement, package exports, and copied assets.
3. Propose the isolated consumer-check approach, including any dependency needs, before adding it.
4. Present the project license decision separately with the owner's options.
5. Review Field/Input, Select/Combobox, and Dialog/Menu contracts first; these support the
   largest number of compositions and carry form/focus risk.

## Release gates

All are proposed acceptance criteria, not assertions about the current package.

- [ ] Every published entry point has reviewed imports/exports, API, behavior, and examples;
      each spec's status agrees with its review evidence. No unexplained `draft` contracts remain.
- [ ] Public selectors, inputs/outputs/models, documented CSS hooks/tokens/states, locale keys,
      and accessibility behavior have a compatibility policy. Internal core APIs remain private.
- [ ] Manifest version, `VD_VERSION`, npm tag, Git tag, GitHub Release, and provenance agree.
- [ ] A fresh consumer installs the packed artifact without workspace aliases; both application
      build and representative interactions work. Fonts/styles/notices are included and resolve.
- [ ] Angular 22.2 within major 22 is the tested starting range. Compatibility widening requires
      evidence. State Node/build/browser prerequisites; do not imply support for older Safari.
- [ ] Core user journeys are checked in Chromium, Firefox, and WebKit, plus actual supported
      Safari. Chromium coverage is not proof of Edge/Firefox/Safari behavior; WebKit is not Safari.
- [ ] Representative SSR/hydration checks cover deterministic IDs, overlays, initial locale,
      time-sensitive text, and browser-only lifecycle work.
- [ ] Keyboard/focus/ARIA and applicable axe checks pass; manual NVDA/VoiceOver review is recorded.
      Also verify both themes, long Ukrainian/RTL content, 320px layouts, 200% text/zoom,
      reduced motion, and forced colors. Automated axe results are not WCAG certification.
- [ ] JS/CSS/fonts are measured in a packed consumer, including a minimal page and an application
      composition; agree practical budgets from measurements rather than inventing token/size scales.
- [ ] Existing dashboard/settings/login demos exercise documented states. At least one external
      application completes the proposed list/edit/confirm workflows without private API patches.
- [ ] The owner-approved license/terms, changelog, support matrix, and migration guidance are present.
- [ ] Release CI is green, candidate issues are triaged, and no known critical accessibility,
      data-integrity, installability, or hydration issue is left open.

## Maintenance after 1.0

Use patches for compatible fixes and minors for compatible additions. Reserve breaking public
contract changes for a major release and document migration paths. Define deprecations before
removing APIs. Keep support status explicit per Angular version rather than promising an
unbounded range. A green release pipeline validates the configured checks; it does not replace
API review, real application usage, or manual accessibility evidence.

This plan assumes application/dashboard use as the first target, matching the current library
and compositions. A different primary target should change priorities before implementation.

## Unreleased foundation work

The first approved batch corrects the version constant and Data table documentation import,
adds built-package/export/asset checks, and installs the tarball into an independent Angular
consumer with strict compilation and browser checks. Compatibility/API policy and a changelog
are now documented. The owner selected MIT for Vadem's own code; LICENSE is included in the next packed artifact.
This batch does not by itself complete every `0.1` exit condition or change the published
`0.0.2` artifact.
