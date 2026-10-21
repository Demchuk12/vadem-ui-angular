# Command palette

Status: implemented · Pattern: searchable action picker using the
[APG editable combobox/listbox keyboard contract](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
Modal use composes with the existing native Dialog. This is an action picker, not a form
value control; accepting a result executes a consumer action rather than storing a value.

## Anatomy

```html
<div class="vd-command" data-open>
  <div class="vd-command__search">
    <svg aria-hidden="true"></svg>
    <input
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-label="Пошук дій"
      aria-expanded="true"
      aria-controls="commands"
      aria-activedescendant="command-projects"
    />
  </div>
  <div class="vd-command__list" id="commands" role="listbox" aria-label="Пошук дій">
    <div
      class="vd-command-item"
      role="option"
      id="command-projects"
      aria-label="Відкрити проєкти"
      aria-selected="true"
      data-active
    >
      <svg slot="start" aria-hidden="true"></svg>
      <span class="vd-command-item__content">
        <span class="vd-command-item__label">Відкрити проєкти</span>
        <span class="vd-command-item__description" id="description">Список проєктів</span>
      </span>
      <kbd class="vd-command-item__shortcut" aria-hidden="true">G P</kbd>
    </div>
  </div>
  <p class="vd-command__status" role="status"><!-- empty/loading copy --></p>
</div>
```

Options are projected in DOM order and hidden when filtered out. No nested interactive
elements inside options. Description and shortcut content are optional. A shortcut is a
display hint only; consumers own its actual binding.

## Props

| Part | Name          | Type                | Default             | Notes                                                               |
| ---- | ------------- | ------------------- | ------------------- | ------------------------------------------------------------------- |
| Root | `query`       | `string`            | `''`                | Two-way search text; no CVA or persistent selected value            |
| Root | `label`       | `string`            | `Search commands`   | Accessible name of search and results; localize                     |
| Root | `placeholder` | `string`            | `Search commands…`  | Localize; never replaces the accessible name                        |
| Root | `emptyText`   | `string`            | `No commands found` | Localize and offer useful recovery direction                        |
| Root | `loadingText` | `string`            | `Loading commands…` | Localize                                                            |
| Root | `disabled`    | `boolean`           | `false`             | Native disabled search and inactive actions                         |
| Root | `loading`     | `boolean`           | `false`             | Search remains editable, activation paused; existing actions hidden |
| Root | `autofocus`   | `boolean`           | `false`             | Forwarded to native search; useful inside Dialog, opt-in inline     |
| Item | `value`       | `string`            | required            | Stable action identifier; unique within a root                      |
| Item | `label`       | `string`            | required            | Visible primary text, accessible name and search text               |
| Item | `keywords`    | `readonly string[]` | `[]`                | Additional search aliases; no fuzzy ranking                         |
| Item | `disabled`    | `boolean`           | `false`             | Visible but unavailable; keyboard skips it                          |

## Events

| Part | Event         | Payload  | When                                                                              |
| ---- | ------------- | -------- | --------------------------------------------------------------------------------- |
| Root | `queryChange` | `string` | Search input changes                                                              |
| Root | `selected`    | `string` | Enabled visible action explicitly accepted by Enter/click                         |
| Root | `dismissed`   | none     | Escape collapses results; consumer may close its Dialog                           |
| Item | `selected`    | none     | That action is accepted; consumers may use item handlers instead of root dispatch |

Root method `focus()` focuses its search input. Consumers own action execution, routing,
dialog opening/closing, query reset on reopening, and Ctrl/Cmd+K scope. No global listener,
command registry, automatic navigation, or external search request is installed by the root.

## States

| State           | Reflection                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Results visible | `data-open`, input `aria-expanded="true"`                                                                 |
| Focused         | `data-focused`; input stays DOM focus target                                                              |
| Active action   | item `data-active`, `aria-selected="true"`; input `aria-activedescendant` only while focused and expanded |
| Disabled        | root `data-disabled`, native input disabled; item `aria-disabled="true"`, no active item                  |
| Loading         | root `data-loading`, results `aria-busy="true"`, actions hidden, localized polite status                  |
| Empty           | Expanded results contain no matches; localized polite status outside listbox                              |
| Filtered out    | item `hidden`, never active or activatable                                                                |
| Collapsed       | input `aria-expanded="false"`, results/status hidden                                                      |

The first enabled match is active by default; navigation only changes this transient active
action, never executes it. Typing resets to the first enabled match. If active content is
removed/disabled/filtered out, fall back to the first enabled visible action. All-disabled
results have no active descendant. Query text remains unchanged when an action is accepted.

## Keyboard

| Key                                             | Action                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| Printable characters, Space                     | Edit/filter using native input behavior                                 |
| ArrowDown / ArrowUp                             | Reveal results if collapsed; next/previous enabled action, no wrapping  |
| PageDown / PageUp                               | Move up to ten actions, skipping unavailable actions                    |
| Home / End, Ctrl/Cmd editing keys, Left / Right | Native text/caret editing; not intercepted                              |
| Enter                                           | Execute active enabled action once; prevent accidental form submission  |
| Escape                                          | Collapse results and emit `dismissed`; do not execute or clear query    |
| Tab / Shift+Tab                                 | Native focus order; options are not Tab stops and never execute on blur |
| IME composition keys                            | Never navigate, dismiss or execute while composing                      |

Focus/input reopens collapsed results. Native Dialog provides modality, focus trap and opener
restoration. Dialog consumers should close explicitly on `dismissed` and `selected`, and may
provide a separate close button. Inline use does not trap focus.

## ARIA contract

The search owns `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`,
`aria-expanded`, `aria-controls`, and the current valid `aria-activedescendant`. Results own
`role="listbox"`; actions own `role="option"`, `aria-selected`, and unavailable state.
An action's description is linked through `aria-describedby`; decorative icons/shortcut hints
stay out of its accessible name. Empty/loading status is outside the listbox with `role="status"`.

Results are displayed inline within the palette rather than a separate Popover. This adaptation
uses APG's focused-input navigation and explicit default-action acceptance; it is not a
select/combobox form-value accessor. Modal naming belongs to the surrounding Dialog contract.

## Component tokens

Root: `--vd-command-bg` (surface), `--vd-command-border` (border), `--vd-command-radius`
(surface radius), `--vd-command-padding` (space-2), `--vd-command-gap` (space-2),
`--vd-command-list-height` (space-16 × 4), `--vd-command-font-size` (text-sm).
Search: `--vd-command-search-height` (control-height-lg), `--vd-command-search-border`
(border-control), `--vd-command-search-bg` (field).
Items: `--vd-command-item-padding` (space-3), `--vd-command-item-gap` (space-3),
`--vd-command-item-height` (control-height-md), `--vd-command-item-active-bg` (fill-hover),
`--vd-command-item-active-border` (text-accent).

All sizing/color defaults reuse the current system. No new primitive/semantic scale.

## Adapter notes

Angular: `VdCommand`, `VdCommandItem`, `VdCommandDescription`, `VdCommandShortcut`, and
`VD_COMMAND` exported from `@vadem/ui/command`. Pure filtering/active-item reconciliation
lives under `core/`; keyboard matching is reused from `@vadem/ui/keyboard`.
Projected item queries follow DOM order. DOM focus and list scrolling occur only in the browser.
No Router, Forms or extra runtime package is required.

References checked on 2026-10-07: APG above and
[Angular Aria Combobox](https://angular.dev/api/aria/combobox/Combobox), used as a behavior
reference rather than a dependency.
