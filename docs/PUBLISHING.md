# Publishing @vadem/ui

The `Publish npm` GitHub Actions workflow builds the library from `main` and publishes
`dist/ui` using npm Trusted Publishing (OIDC). No npm token secret is required.

## One-time npm setup

Open https://www.npmjs.com/package/@vadem/ui/access while signed in as an owner.
In package settings, add a Trusted Publisher with these exact values:

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| Provider             | GitHub Actions                              |
| Organization or user | `Demchuk12`                                 |
| Repository           | `vadem-ui-angular`                          |
| Workflow filename    | `publish.yml`                               |
| Environment          | Leave empty                                 |
| Allowed actions      | Enable direct publishing with `npm publish` |

Save and complete npm's authentication prompt. A new connection must complete its first
successful publish within npm's two-day validation window; recreate it if it expires.
Do not configure an environment name: the workflow does not use a GitHub environment.

## Release

1. Update `version` in `projects/ui/package.json` to an unpublished stable version.
   The workspace root version does not control the library release. If `0.0.1` already
   exists on npm, the next patch is `0.0.2`.
2. Commit the version and desired package changes to `main`. Wait for the **CI** workflow
   to pass, including browser and visual checks.
3. Open https://github.com/Demchuk12/vadem-ui-angular/actions/workflows/publish.yml.
   Choose **Run workflow**, select `main`, and leave **dry_run** checked for validation.
4. After reviewing the run, start it again with **dry_run** unchecked to publish.
5. The workflow creates a matching GitHub Release and `v<version>` tag at the exact
   published commit after npm publication succeeds. Verify the npm page and GitHub Release.
   A dry run creates neither an npm version nor a GitHub Release.
6. Verify with `npm view @vadem/ui version repository.url` and check the README on npm.

The publish run checks the latest push-triggered CI run for the exact commit before
installing dependencies, linting, testing, building, and publishing. Dry runs skip that
CI gate and never publish. Both modes run only from `main`. Runs are serialized.

Publishing an existing name/version fails; a successful npm version cannot be overwritten.
Do not change files inside `dist/ui` manually: builds regenerate its README and metadata
from `projects/ui/`. A public npm package does not imply a project license grant; choose
and add a project license separately before representing it as open source.

## Troubleshooting

- Authentication errors: verify the exact owner, repository, filename, direct-publish
  permission, and publisher expiry in npm settings. OIDC requires GitHub-hosted runners
  and `id-token: write`; both are configured in the workflow.
- CI gate failure: inspect the CI run for the selected commit. Fix its failures before
  publishing; do not bypass the gate.
- README changes appear on npm only after a new package version is published.

References: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) and
[package README updates](https://docs.npmjs.com/about-package-readme-files/).

## How the repository and npm package are linked

- `projects/ui/package.json` declares the GitHub repository, source subdirectory, issue tracker,
  homepage, public npm registry, and package visibility. These fields reach npm with a new version.
- npm Trusted Publishing connects the exact GitHub workflow identity to `@vadem/ui`.
  npm automatically generates provenance for OIDC publication from this public repository.
- After successful publication, a separate job creates the matching GitHub tag and Release,
  linking the package version, source commit, usage guide, and publishing run.
- The repository homepage and README link to the package on npm.

The **Packages** sidebar on GitHub lists GitHub Packages, a separate registry at
`npm.pkg.github.com`. A package published to `registry.npmjs.org` is not listed there.
Publishing another package to GitHub Packages would be a separate distribution decision;
it is not needed for `npm install @vadem/ui`.

If npm publication succeeds but GitHub release creation fails, rerun only the failed
release job in Actions. Do not attempt to overwrite the already-published npm version.

References: [GitHub's npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
