# Form and overlay contract review

Reviewed on 2026-10-21 against the source and existing Chromium tests. This is a bounded
review of Field/Input, Select/Combobox, and Dialog/Menu, not certification of every state,
browser, or assistive technology. Specs remain `draft` until the remaining evidence is complete.

## Contracts applications can follow

| Area     | Current contract                                                                                                                                                                                                                                 | Specification and implementation                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Field    | One registered control; label targets its focusable ID. Active hint/error and extra description IDs are deduplicated. An error message replaces the hint only while displayed invalid.                                                           | [Field](../specs/field.md), `projects/ui/field/src/field.ts`                     |
| Fieldset | Groups choices; invalid/required aggregate registered controls. Hint and error describe the native fieldset, not every child.                                                                                                                    | [Field](../specs/field.md), `projects/ui/field/src/fieldset.ts`                  |
| Input    | Native value accessors and keyboard behavior. Explicit invalid is gated by an explicitly false touched input; Reactive/Template form invalidity waits for form touch. Signal Forms may expose native ARIA invalidity earlier than visual errors. | [Input](../specs/input.md), `projects/ui/field/src/field-control-base.ts`        |
| Select   | Selection values are strings or null. Escape cancels pending navigation; Tab commits the active option and allows normal focus movement.                                                                                                         | [Select](../specs/select.md), `projects/ui/select/src/select.ts`                 |
| Combobox | Same selection values; query text only filters. Enter commits; Escape/Tab/blur restore the selected label without committing a different match.                                                                                                  | [Select](../specs/select.md), `projects/ui/select/src/combobox.ts`               |
| Dialog   | Native modal semantics; dismissible controls Escape/backdrop/swipe. Explicit close actions remain available. Each opening resets returnValue.                                                                                                    | [Dialog](../specs/dialog.md), `projects/ui/dialog/src/core/dialog-controller.ts` |
| Menu     | Actions rather than selection values; ArrowDown opens on the first item, then moves focus. Activation/Escape restore opener focus. Context menus preserve the originating region.                                                                | [Menu](../specs/menu.md), `projects/ui/menu/src/core/menu-controller.ts`         |

Both Select and Combobox are exported by `@vadem/ui/select`. Forward accessible naming to
its inner control using `aria-label` or `aria-labelledby`, or use a visible Field label.
Neither a placeholder nor text on the wrapper is a substitute for an accessible name.

## Corrections in this batch

- Remove the obsolete claim that Field integration with Select is future work.
- State the displayed-invalid gate and additional descriptive IDs precisely.
- Document locale-backed `select.emptyText` and naming/required attributes on inner controls.
- Explain Select versus Combobox Tab behavior and cover both with browser assertions.
- Separate Menu Enter/Space activation from ArrowDown navigation in the keyboard table.
- Clarify explicit versus implicit Dialog dismissal and return-value reset.

No public API, tokens, runtime dependencies, or component appearance changes in this batch.

## Evidence and remaining work

The targeted browser command is:

```sh
npx playwright test e2e/input.spec.ts e2e/select.spec.ts e2e/dialog.spec.ts e2e/context-menu.spec.ts --workers=2
```

Result: **40 passed**, no retries, in the pinned Playwright v1.63.0 Noble container.
ESLint, formatting, and this document's relative links also passed. No new full-library
visual or cross-browser audit was performed for this documentation/test-only batch.

It covers existing native-label/validation behavior, option keyboard/mouse interaction,
open-popup axe checks, modal focus/return values, and context-menu opening/focus recovery.
It also contains the two new Tab regression scenarios. This suite is Chromium-only.

Before changing these contracts to stable, extend evidence for:

- Programmatic disable/enable, validator changes, and option removal while popups are open.
- Standalone native disabled state versus Field label state, including disabled fieldsets.
- Signal Forms and Reactive Forms parity for complex controls and reset/touched behavior.
- Nested dialog/popover/menu flows, opener removal, and conditional title/description parts.
- SSR/hydration IDs and browser-only initialization; no hydration support claim from client tests.
- Supported Firefox/Safari behavior, manual screen-reader use, both-theme keyboard checks,
  forced colors, reduced motion, narrow/zoomed layouts, and realistic Ukrainian/RTL content.

These are review gaps, not confirmed runtime defects. Reproduce an issue before changing
shared behavior, and add focused regression coverage with any fix. The package readiness
policy remains [Compatibility](COMPATIBILITY.md); the wider scope is the [1.0 roadmap](ROADMAP_1_0.md).
