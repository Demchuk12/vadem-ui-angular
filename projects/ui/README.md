# Vadem UI

[![npm](https://img.shields.io/npm/v/@vadem/ui)](https://www.npmjs.com/package/@vadem/ui)
[![CI](https://github.com/Demchuk12/vadem-ui-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/Demchuk12/vadem-ui-angular/actions/workflows/ci.yml)

A modern Angular component library for forms, dashboards, and data-rich applications.
Vadem combines a consistent visual language with native HTML semantics, reusable CSS
design tokens, and components built with standalone APIs, signals, and OnPush change detection.

## Features

- **Components for everyday product UI:** buttons, form controls, selects, calendars,
  dialogs, notifications, navigation, tables, charts, and file interactions.
- **Dark and light themes:** a shared token system for colors, typography, spacing,
  shape, and motion, customizable through CSS custom properties.
- **Accessibility-focused interactions:** keyboard navigation, focus management,
  ARIA semantics, and support for reduced motion and forced colors where applicable.
- **Localization:** English and Ukrainian locale packs, with RTL-aware layouts and controls.
- **Angular forms:** native controls and custom value accessors where appropriate,
  with Reactive Forms and Signal Forms examples in the gallery.
- **Plain CSS:** no Tailwind or third-party UI framework; shared styles are independent
  of Angular view encapsulation.
- **Bundled assets:** self-hosted Manrope and JetBrains Mono fonts, plus a vendored Lucide
  icon subset. No runtime font or icon CDN is required.
- **Separate entry points:** import the components you need from `@vadem/ui/button`,
  `@vadem/ui/dialog`, and other component-specific paths.

## Requirements

Angular **22.2 or later within major version 22**, matching the package's peer dependencies.
Browser targets: the last two Chrome, Edge, and Firefox versions, and Safari 26+.

## Installation

```sh
npm install @vadem/ui
```

Add the shared stylesheet to your application's global CSS:

```css
@import '@vadem/ui/styles.css';
```

## Quick start

```ts
import { Component } from '@angular/core';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'app-root',
  imports: [VdButton],
  template: `<button vdButton variant="primary">Save changes</button>`,
})
export class App {}
```

## Themes and customization

Apply a theme to the document or a section of your application:

```html
<html data-theme="dark"></html>
```

Use `data-theme="light"` for light mode or `data-theme="auto"` to follow the system preference.
Customize the accent through the shared token:

```css
:root {
  --vd-hue-accent: 270;
}
```

## Documentation and examples

- [Source repository](https://github.com/Demchuk12/vadem-ui-angular)
- [Component contracts](https://github.com/Demchuk12/vadem-ui-angular/tree/main/specs)
- [Demo gallery source](https://github.com/Demchuk12/vadem-ui-angular/tree/main/projects/demo)
- [Issues](https://github.com/Demchuk12/vadem-ui-angular/issues)

To explore the gallery locally, clone the repository, run `npm ci`, then `npm start`.

## Release status

Vadem UI is in early development. APIs may change between releases before version 1.0.

## Third-party assets

Manrope and JetBrains Mono are distributed under SIL OFL 1.1; their notices are included
in `fonts/`. Lucide icon geometry is distributed under ISC; see `LICENSE-lucide.txt`.

Getting started and copyable application examples: [usage guide](https://github.com/Demchuk12/vadem-ui-angular/blob/main/docs/GETTING_STARTED.md).
