# Compatibility and public API policy

Current package line: `0.x`. This policy documents the current support boundary and the
proposed stability commitment for 1.0; it does not declare every component stable today.

## Supported environment

- Angular: `^22.2.0` for `@angular/common`, `@angular/core`, and `@angular/forms`.
  Do not force installation into a different major and assume compatibility.
- Development/release toolchain: Node.js 24 and the npm version in root `packageManager`.
  The isolated consumer uses the top-level Angular/build versions installed by the lockfile.
  This is a reproducible starting point, not proof of every version in the peer range.
- Intended browser targets: the last two Chrome/Edge/Firefox versions and Safari 26+.
  Current automated browser evidence is Chromium. Firefox, WebKit, actual Safari, manual
  screen readers, and SSR/hydration validation remain roadmap work.
- English is the default library locale; Ukrainian is included. Applications own their
  content, document language/direction, Angular locale configuration, and persistence.

## Public API

The package's documented export paths and the symbols they export are the consumer API.
For example, `VdDataTable` comes from `@vadem/ui/table`; `@vadem/ui/data-table` does not exist.
Documented selectors, inputs/outputs/models, CSS customization hooks and state attributes,
locale keys, and keyboard/accessibility contracts are also part of the intended stable API.

Unexported implementation files are private. Exported helpers need the same contract review
as components; placing their source in a `core/` directory does not make an exported symbol
private. Do not import source files or generated `fesm2022`/`types` paths directly.

## Version changes

Before 1.0, API changes may occur between minor releases. Keep release notes explicit and
avoid unrelated API churn in patches. After the 1.0 contract review, use compatible fixes for
patches, compatible additions for minors, and a major release for breaking public contracts.
Provide migration guidance and deprecations before removals where practicable.

The library package manifest is the release version source. Synchronize `VD_VERSION` with
it; `check:package` rejects mismatches. The workspace root's private package version does
not control the npm library version. Never overwrite or pretend to repair an existing npm
version: ship a new version through the publishing workflow.

See [the 1.0 roadmap](ROADMAP_1_0.md), [usage guide](GETTING_STARTED.md), and
[publishing checks](PUBLISHING.md) for scope, examples, and validation commands.

## License

The owner selected MIT for Vadem's own code on 2026-10-21. The root LICENSE and package
metadata record that choice, and the build copies it into the npm artifact. Third-party
fonts, icons, and vendored design skills retain their original licenses/notices. Older
npm versions are immutable and do not gain a LICENSE file from a later source change.
