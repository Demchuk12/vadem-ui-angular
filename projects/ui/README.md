# @vadem/ui

Angular UI components with shared CSS tokens and self-hosted fonts. Requires Angular 22.2
compatible with the package's peer dependency ranges.

Import styles once in the consuming application's global stylesheet:

```css
@import '@vadem/ui/styles.css';
```

Import each component from its secondary entry point:

```ts
import { VdButton } from '@vadem/ui/button';
```

From the workspace root, run `npm run build:ui` to build `dist/ui` including CSS, fonts,
and third-party notices. The package is under development and is not published by this command.
See the repository README, interactive demo, and `specs/` for setup and component contracts.
