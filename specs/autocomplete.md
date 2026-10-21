# Autocomplete

Status: stable · Pattern: [editable combobox with manual list selection](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

## Anatomy

```html
<input
  class="vd-input vd-autocomplete-input"
  role="combobox"
  aria-autocomplete="list"
  aria-expanded="true"
  aria-controls="suggestions"
  aria-activedescendant="suggestion-1"
/>
<div
  class="vd-autocomplete__popup"
  popover="auto"
  data-open
  id="suggestions"
  role="listbox"
  aria-label="Suggestions"
  aria-busy="false"
>
  <div class="vd-autocomplete__option" id="suggestion-1" role="option" aria-selected="true">
    <span class="vd-autocomplete__label">Suggested text</span>
    <span class="vd-autocomplete__description">Optional context</span>
  </div>
</div>
<p class="vd-visually-hidden" role="status" aria-atomic="true">1 suggestion available.</p>
```

The scrollable popup itself is the controlled listbox. Loading, error and empty messages
are non-option text hidden from the listbox accessibility tree; the identical message is
exposed by the stable polite status region outside the hidden popup. This avoids invalid
listbox children and duplicate announcements. When no enabled options exist, arrows can
scroll a long visible message.

## Props

Optional panel `highlightQuery` (string, empty) highlights literal case-insensitive matches in
option labels with `@vadem/ui/text-highlight`. Descriptions, plain accessible names, filtering
and selection are unchanged; empty query preserves the original plain label DOM.

| Owner | Name                                                   | Type                     | Default                                      | Notes                                                                                   |
| ----- | ------------------------------------------------------ | ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Input | value, name, disabled, readonly, required, placeholder | native                   | native                                       | Normal text input; the value is always a string, not a selected id                      |
| Input | size, invalid, touched, id                             | Input contract           | Input defaults                               | Inherited styling and Field integration                                                 |
| Panel | options                                                | readonly option array    | []                                           | Consumer-filtered, in display order; unique stable ids required                         |
| Panel | loading                                                | boolean                  | false                                        | Suppresses stale options while a request runs                                           |
| Panel | errorText                                              | string                   | empty                                        | Non-empty suppresses options and presents a request error, independent of form validity |
| Panel | label                                                  | string                   | Suggestions                                  | Accessible listbox name                                                                 |
| Panel | loadingText                                            | string                   | Loading suggestions…                         | Localizable visible/live copy                                                           |
| Panel | emptyText                                              | string                   | No suggestions. You can enter your own text. | Localizable visible/live copy                                                           |
| Panel | resultsText                                            | function(count) → string | English count message                        | Localizable polite result count                                                         |

Option: `id: string`, `label: string` (inserted text), optional `description: string`,
optional `disabled: boolean`. Labels may repeat; ids must not. Do not nest interactive controls.

## Events

| Owner | Name                | Payload      | When                                                                                                             |
| ----- | ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Input | queryChange         | string       | User edits; once per completed IME composition; excludes suggestion acceptance, focus, reset and external writes |
| Input | input, change, blur | native Event | Normal typing uses native events; acceptance dispatches one bubbling input and change pair, blur stays native    |
| Panel | optionSelected      | option       | Explicit enabled option acceptance; native input value is updated first                                          |

Application owns fetching, filtering, debounce, cancellation, stale-response guards and selected
metadata. Library performs no requests. `queryChange` allows lookups without restarting them when
a suggestion is accepted. Native input events remain available for forms and other application logic.

## Content / slots

Native input and a separately referenced panel; one panel belongs to one input. The panel renders
plain option labels and optional descriptions, not arbitrary templates. Empty/loading/error copy
is configurable text. The field label/hint/error remain outside the panel through the Field contract.

## States

Closed initially. Focus/click or typing opens the popup without automatically activating a suggestion.
Loading takes precedence over error; error takes precedence over results. Disabled options remain visible when supplied, but are excluded from the enabled result count. Disabled/readonly native inputs cannot
open, navigate or accept; changing to either state closes an open popup. External value writes and
reset close it without querying. Late result changes cannot reopen a dismissed popup.

## Keyboard

| Key                                           | Action                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ArrowDown / ArrowUp                           | Open if needed; activate first/last enabled option or move without wrapping                 |
| Enter                                         | Accept active enabled option only; otherwise preserve native form submission and typed text |
| Escape                                        | Close and retain exact typed text; closed Escape adds no custom clearing                    |
| Tab / Shift+Tab                               | Close, retain typed text and follow native focus order; no acceptance                       |
| Alt+ArrowDown / Alt+ArrowUp                   | Open without activation / close                                                             |
| Home/End, Left/Right, modifiers, editing keys | Preserve native text editing and caret selection                                            |
| IME composing Enter/arrows                    | Do not intercept or accept                                                                  |

Typing clears active suggestion. Hover can activate an enabled option without moving DOM focus.
Pointer acceptance retains input focus; touch scrolling remains native. Changed options preserve an
active stable id only while it is still present and enabled; removed/disabled active options clear.
No stale `aria-activedescendant` references or automatic acceptance on blur.

## ARIA and focus

Input owns role, `aria-autocomplete=list`, `aria-haspopup=listbox`, `aria-expanded`, `aria-controls`
and an active descendant only while open and valid. Field or native label names the input. Native
required and inherited validation/hint wiring are retained. Panel listbox is named; options have
`aria-selected` following active navigation, explicit disabled state, and optional described-by
context. Popup/options add no Tab stops. Announce loading/error/empty/result count politely; do not
mark fetch errors as invalid text or reject arbitrary values.

## Component tokens

`--vd-autocomplete-*`: padding → space-1; option-padding → space-3; gap → space-1;
radius → radius-overlay; border → color-border-strong; background → color-surface-overlay;
text → color-text; muted → color-text-muted; active → color-fill-hover; ring → color-focus;
font-size → text-sm; max-height → 4 × space-20; shadow → shadow-lg.
Input reuses Input tokens. Popup text wraps completely, scrolls vertically and stays within the viewport.
No new token scale or animation. Forced-colors outlines expose active options.

## Adapter notes

Angular: `VD_AUTOCOMPLETE` imports `VdAutocompleteInput` and `VdAutocomplete`. Use
`<input [vdAutocomplete]="panel" [formControl]="text">` with `<vd-autocomplete #panel [options]="options" />`.
Input extends existing VdInput (do not also attach vdInput), retains the native accessor for Reactive,
Template and Signal Forms, and adds no CVA. Browser-only popup/geometry work is after-render; SSR renders
collapsed input and hidden popup. Native Popover API is used when available; a fixed-position fallback
supports Escape, outside dismissal and blur otherwise. Measured positioning flips/clamps to the viewport
without depending on CSS anchor positioning. Supported writing directions: horizontal LTR and RTL.
