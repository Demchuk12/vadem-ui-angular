# Public website and component gallery

The repository deploys the existing presentation site and interactive gallery together:

- [Presentation site](https://demchuk12.github.io/vadem-ui-angular/)
- [Ukrainian presentation](https://demchuk12.github.io/vadem-ui-angular/uk/)
- [Component gallery](https://demchuk12.github.io/vadem-ui-angular/gallery/)

## Build and deployment

`.github/workflows/pages.yml` builds production applications on pushes to `main` and manual
dispatches. It verifies the assembled artifact in Chromium before uploading it. A separate
job with `pages: write` and `id-token: write` deploys it to the `github-pages` environment.
Repository Settings → Pages must use GitHub Actions as the publishing source.

```sh
npm run build:pages
npm run check:pages
```

The check requires the Playwright Chromium revision matching the lockfile; CI uses the
same pinned container as the existing browser suite. No hosting dependency or token is added.
`check:pages` creates a temporary local static server and closes it after verification.
For a deployed-site check, set `PAGES_URL` to its full URL including the trailing slash.

`PAGES_BASE_PATH` defaults to `/vadem-ui-angular/`. The workflow supplies the path reported
by `configure-pages`. It must start and end with `/`; `/` is valid for a domain root.
`dist/pages` contains only public built assets, not the repository, credentials, or source maps.

## Routing

The presentation site is mounted at the base path and the gallery at `gallery/`.
Both use Angular's normal path routing. The build copies each application's HTML shell to
known route directories, including `uk/`, all routes from `tools/gallery-routes.json`, and
`gallery/screens/`. This lets a static server return real HTML on direct visits and reloads;
no server rewrite rule or 404 redirect script is needed. These shells are client-rendered,
not SSR or prerendered component content. Unknown paths receive a small genuine 404 page.

Production catalog links resolve relative to the site's base URL. Development keeps the
separate gallery server at `http://localhost:4200/`. Route lists must stay synchronized when
new gallery pages are added. The deployment check requests every known route and exercises
language switching/reload, themes, gallery navigation, select keyboard behavior, assets,
and a narrow presentation viewport.

## Relationship to npm

Pages publishes a browser preview of the current source. It does not publish `@vadem/ui` or
change npm tags. The gallery can therefore contain unreleased improvements. Stable library
artifacts continue to use the separate [npm publishing workflow](PUBLISHING.md).

## Official references

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Angular static deployment and base URLs](https://angular.dev/tools/cli/deployment)
