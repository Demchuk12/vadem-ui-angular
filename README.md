# Vadem

[![npm](https://img.shields.io/npm/v/@vadem/ui)](https://www.npmjs.com/package/@vadem/ui)
[![CI](https://github.com/Demchuk12/vadem-ui-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/Demchuk12/vadem-ui-angular/actions/workflows/ci.yml)

Personal Angular UI component library (`@vadem/ui`) with framework-agnostic CSS,
layered design tokens, self-hosted fonts, and English/Ukrainian locale packs.
The workspace includes a component gallery and a separate presentation site.

## Getting started

Use Node.js 24 and npm 11.13.0 (the version pinned in `package.json`).

```sh
npm ci
npm start             # component gallery: http://localhost:4200
npm run start:site    # presentation site: http://localhost:4300
```

## Development commands

```sh
npm run lint
npm test
npm run build:ui      # library package, styles, fonts, and notices in dist/ui
npm run check:package # manifest/version, entry points, copied assets and notices
npm run check:consumer # independent tarball install, build and Chromium checks
npx ng build demo
npm run build:site
npx playwright install chromium  # first-time browser setup
npm run e2e          # keyboard, layout, and axe checks
npm run screenshots  # dark/light gallery captures
npm run visual       # Docker-based visual regression checks
```

Visual checks require Docker and use the Playwright image pinned in `tools/visual.sh`.
CI runs lint, unit tests, production builds, browser tests, and visual regression checks.

## Library usage

The package is under development; these examples assume it has been built and made
available to the consuming application. Building does not publish it to npm.

```css
@import '@vadem/ui/styles.css';
```

```ts
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
```

Import components from their secondary entry points. See the gallery for compositions
and [specs/](specs/) for individual APIs, keyboard behavior, and accessibility contracts.
Browser targets: the last two Chrome, Edge, and Firefox versions, and Safari 26+.

## Repository guide

| Path             | Contents                                                     |
| ---------------- | ------------------------------------------------------------ |
| `projects/ui/`   | Angular library and component entry points                   |
| `projects/demo/` | Interactive gallery and application compositions             |
| `projects/site/` | Presentation site                                            |
| `src/styles/`    | Shared CSS, token layers, and themes                         |
| `src/fonts/`     | Self-hosted Manrope and JetBrains Mono with OFL notices      |
| `specs/`         | Framework-independent component contracts                    |
| `tools/`         | Gallery screenshots, icons, brand export, and package assets |
| `brand/logo/`    | Logo assets and usage guidance                               |

Project rules: [CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md), and
[project brief](docs/PROJECT_BRIEF.md). Technical rationale: [DECISIONS.md](DECISIONS.md).
Design procedures: [design workflow](docs/DESIGN_WORKFLOW.md); vendored skill provenance:
[design skill sources](docs/DESIGN_SKILL_SOURCES.md).

## Third-party assets

Manrope and JetBrains Mono use SIL OFL 1.1; see [font documentation](src/fonts/README.md)
and the bundled license files. Icon geometry comes from [Lucide](https://lucide.dev)
under ISC; see [its license](projects/ui/icon/LICENSE-lucide.txt).
Vendored design skills retain their own licenses and notices.

Publishing releases: [npm publishing workflow](docs/PUBLISHING.md).

Getting started and copyable application examples: [usage guide](docs/GETTING_STARTED.md).

Roadmap to the first stable release (proposal): [1.0 plan](docs/ROADMAP_1_0.md).

Supported versions and public API policy: [compatibility](docs/COMPATIBILITY.md).
Release history: [CHANGELOG.md](CHANGELOG.md).

## License

Vadem's own code is licensed under the MIT License; see [LICENSE](LICENSE).
Third-party fonts, icon geometry, and vendored design skills retain their respective licenses
and notices; they are not relicensed by the Vadem license.
