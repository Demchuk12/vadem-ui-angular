# Using Vadem UI in an Angular application

Vadem UI is an early-release Angular component library. Component APIs may change before
1.0. The examples below use the published package; developing Vadem itself is covered in
the root README. Framework-independent contracts live in `specs/`.

## Install and import styles

Use an Angular 22 application with `@angular/core`, `@angular/common`, and `@angular/forms`
versions satisfying `^22.2.0`. Angular 21 and Angular 23 do not satisfy that peer range.
Use a Node.js version supported by your Angular CLI; this repository and CI use Node.js 24.

```sh
npm install @vadem/ui
```

In the application's global `src/styles.css`, import the shared stylesheet once:

```css
@import '@vadem/ui/styles.css';
```

The stylesheet includes reset/base styles, theme tokens, component CSS, and font declarations.
Manrope and JetBrains Mono WOFF2 files ship in the package. Do not add Google Fonts links
or copy library CSS into component stylesheets. Angular's build pipeline should resolve
package font URLs; check deployment paths if you change how static assets are served.

## First component

Copy [quick-start.ts](examples/quick-start.ts) into a standalone application's `src/main.ts`.
It contains a complete root component and bootstrap call. Its root selector is `app-root`;
keep a matching `<app-root></app-root>` in `src/index.html`.

Import components from their own entry points:

```ts
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
```

Add them to the standalone component's `imports`. There is no root `VademModule` to register.
Many controls enhance native elements: use `<button vdButton>` and `<input vdInput>`,
not `<vd-button>` or `<vd-input>`. Check each contract for its exact selector.

## Reactive Forms

[profile-form.ts](examples/profile-form.ts) is a standalone form component with name/email
validation, accessible field labels, hints, and a status message. Import `ProfileForm` into
an existing standalone root and render `<app-profile-form />`. It intentionally has no backend.

`vd-field` connects its label and hint/error to the enclosed Vadem control. Native inputs use
Angular's native value accessors. Validation messages appear after the field becomes touched;
the example calls `markAllAsTouched()` on submit so unvisited invalid fields also show feedback.
Always supply useful labels: a placeholder does not replace one. Set `type="submit"` explicitly
on submit buttons because `vdButton` defaults to `type="button"`.

Reactive Forms validators own validation. A Field's `error` supplies display text; it does not
create a validator. Use Angular's form APIs for disabled state rather than combining conflicting
`[disabled]` bindings and form-control state.

For Signal Forms examples, see the existing [Input gallery](../projects/demo/src/app/pages/input.ts)
and [Tag input gallery](../projects/demo/src/app/pages/tag-input.ts). The two form approaches
are alternatives: do not apply `[formControl]` and `[formField]` to the same control.

## Localization

English is the default. To use Ukrainian component text application-wide:

```ts
import { provideVdLocale, vdLocaleUk } from '@vadem/ui/locale';

// Merge into the providers of your existing ApplicationConfig or bootstrap call.
const providers = [provideVdLocale(vdLocaleUk)];
```

The complete bootstrap example is in `quick-start.ts`. For one component subtree, use
`providers: [vdLocaleProvider(vdLocaleUk)]` instead. Instance text inputs override locale
strings. Your application still owns its labels, hints, error messages, document language,
and text direction. Locale providers configure library strings; they do not translate your
application, set `<html lang="uk">`, or replace Angular's `LOCALE_ID`.

## Themes and customization

Set a theme on the document in `src/index.html`:

```html
<html lang="uk" data-theme="dark"></html>
```

Use `data-theme="light"` for light mode and `data-theme="auto"` for the system preference.
The default is dark. To isolate a theme or density to one region:

```html
<section data-theme="light" data-density="compact">
  <!-- Existing Vadem controls inherit the scoped theme and density. -->
</section>
```

Override accent hue in global CSS, after the library import:

```css
:root {
  --vd-hue-accent: 270;
}

.preview[data-theme] {
  --vd-hue-accent: 200;
}
```

Vadem styles use the `vd` CSS cascade layer; unlayered application rules take precedence.
Prefer semantic/component custom properties over copying internal selectors. Accent overrides
on a subtree should share an element with `data-theme` or `data-density` so derived tokens
are recalculated there. Check contrast in both themes after changing colors.

## Find a component

| Task                                 | Entry point                                   | Contract                                                                 |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------ |
| Buttons and loading actions          | `@vadem/ui/button`                            | [Button](../specs/button.md)                                             |
| Labels, hints, and errors            | `@vadem/ui/field`                             | [Field](../specs/field.md)                                               |
| Native text inputs                   | `@vadem/ui/input`                             | [Input](../specs/input.md)                                               |
| Choose from existing options         | `@vadem/ui/select`                            | [Select](../specs/select.md)                                             |
| Enter free text with suggestions     | `@vadem/ui/autocomplete`                      | [Autocomplete](../specs/autocomplete.md)                                 |
| Modal content and sheets             | `@vadem/ui/dialog`                            | [Dialog](../specs/dialog.md)                                             |
| Confirm an important action          | `@vadem/ui/alert-dialog`                      | [Alert dialog](../specs/alert-dialog.md)                                 |
| Table markup and row/column controls | `@vadem/ui/table`, `@vadem/ui/data-table`     | [Table](../specs/table.md), [Data table](../specs/data-table.md)         |
| File selection and upload state      | `@vadem/ui/dropzone`, `@vadem/ui/upload-list` | [Dropzone](../specs/dropzone.md), [Upload list](../specs/upload-list.md) |
| Component strings                    | `@vadem/ui/locale`                            | [Locale](../specs/locale.md)                                             |

Upload state components do not send files to a server. Applications own network requests,
authentication, persistence, and business decisions. Likewise, a dialog's presence does not
execute or authorize a destructive action.

## Common setup problems

- **Components look unstyled:** verify the global CSS import; importing a TypeScript entry
  point alone does not load the shared stylesheet.
- **Unknown element/property:** check the selector, secondary import path, and the component's
  standalone `imports` array.
- **Dependency resolution fails:** check the Angular peer ranges before forcing npm installation.
- **Errors never appear:** attach validators and ensure the form control has become touched.
- **A control has no accessible name:** wrap it in a labelled Field or provide the supported
  accessible-name input. Icon-only actions need an explicit action name.

For local examples, clone the repository, run `npm ci`, and start `npm start` on port 4200.
For maintainers publishing a new version, see [PUBLISHING.md](PUBLISHING.md).

## Maintaining the examples

After building the library, run `npm run check:examples`. Angular compiles the example
components with strict template checking against `dist/ui` declarations. CI runs this after
`npm run build:ui`; the check does not publish or start a separate application.
