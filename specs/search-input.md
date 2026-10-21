# Search input

Status: stable · Pattern: native `input[type=search]` in an input group

A search field with a decorative search icon, a clear action, Escape-to-clear and an optional
loading indicator. Value, forms accessor, autofill and the native `search` event stay native.
Filtering, debouncing and result announcements belong to the consumer.

## Anatomy

```html
<form role="search">                                   <!-- consumer: landmark when it is the page search -->
  <div class="vd-input-group vd-search-input" data-filled data-loading>
    <svg slot="start" aria-hidden="true" />            <!-- search icon -->
    <input type="search" class="vd-input vd-search-input__input" />
    <div class="vd-progress-ring" role="progressbar" aria-label="Searching" />   <!-- loading -->
    <button class="vd-button vd-search-input__clear" aria-label="Clear search"
            aria-controls="input-id" />                <!-- only when filled and editable -->
    <!-- else: consumer [slot=end] content, e.g. a vd-kbd shortcut hint -->
  </div>
</form>
```

## Props

| Part  | Name         | Type    | Default                       | Notes                                     |
| ----- | ------------ | ------- | ----------------------------- | ----------------------------------------- |
| Group | loading      | boolean | false                         | Shows a small spinner; field stays usable |
| Group | clearLabel   | string  | locale: `searchInput.clearLabel`   | Clear button name                    |
| Group | loadingLabel | string  | locale: `searchInput.loadingLabel` | Spinner name                         |
| Input | size, invalid, touched, required | | as Input                  | Inherited from `vdInput`                  |

## Events

| Name    | Payload | When                                                              |
| ------- | ------- | ----------------------------------------------------------------- |
| cleared | void    | After clearing by button or Escape                                |
| native  | —       | Clearing dispatches `input` and `search`, so forms and listeners update |

## Slots / content

`input[type=search][vdSearchInput]` (required) and optional `[slot=end]` content shown only while
the field is empty (a shortcut hint). The clear button replaces it when there is text.

## States

| State     | Contract                                                                  |
| --------- | ------------------------------------------------------------------------- |
| empty     | No clear button; `[slot=end]` content visible                             |
| filled    | `data-filled`; clear button visible when editable                         |
| loading   | `data-loading`; small progress ring (static dashed under reduced motion)  |
| read-only / disabled | Never clearable (no button, Escape ignored)                    |
| invalid, sizes, focus | As Input                                                      |

The engine's own cancel button is hidden so every browser shows the same control.

## Keyboard

| Key    | Action                                                                        |
| ------ | ----------------------------------------------------------------------------- |
| Escape | Filled: clear, keep focus, stop propagation. Empty: not handled, so an enclosing dialog or popup can close |
| Enter  | Native (form submit / `search` event)                                         |
| Tab    | Input, then clear button                                                      |

Clicking the clear button keeps focus in the field. The library binds no global shortcut; a
page that shows a hint such as `/` binds it and sets `aria-keyshortcuts` on the input.

## ARIA contract

Native `searchbox` role from `type=search`; a visible label via `vd-field` (placeholder is not a
label). Clear button: localized name and `aria-controls` → input. Spinner: progressbar with a
localized name. Result counts are announced by the consumer (e.g. a `role="status"` line).
Wrap the page's main search in `<form role="search">` or `<search>`.

## Component tokens

`--vd-search-input-gap` → space-2; `--vd-search-input-button-size` → input height − space-2.
Other tokens come from Input group. Forced colors keep the border.

## Adapter notes

Angular: `VD_SEARCH_INPUT` = `VdSearchInputGroup` (`vd-search-input`) + `VdSearchInput`
(`input[type=search][vdSearchInput]`, extends `VdInput`, `exportAs: vdSearchInput` with
`clear()`). Programmatic value changes are detected after render.
