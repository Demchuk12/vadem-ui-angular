// Build both applications for a static host with real HTML entry files for known routes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = process.env.PAGES_BASE_PATH ?? '/vadem-ui-angular/';
assert(
  /^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(path),
  'PAGES_BASE_PATH must be a slash-delimited absolute path',
);
const build = (project, base, output) =>
  execFileSync(
    process.execPath,
    [
      'node_modules/@angular/cli/bin/ng.js',
      'build',
      project,
      '--configuration',
      'production',
      '--base-href',
      base,
      '--output-path',
      output,
    ],
    { stdio: 'inherit' },
  );

build('site', path, 'dist/pages-site');
build('demo', `${path}gallery/`, 'dist/pages-gallery');
const output = resolve('dist/pages');
rmSync(output, { recursive: true, force: true });
cpSync('dist/pages-site/browser', output, { recursive: true });
cpSync('dist/pages-gallery/browser', `${output}/gallery`, { recursive: true });
const entries = (app, routes) => {
  const html = readFileSync(`${app}/index.html`, 'utf8');
  for (const route of routes) {
    assert(/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(route), `Unsafe route: ${route}`);
    mkdirSync(`${app}/${route}`, { recursive: true });
    writeFileSync(`${app}/${route}/index.html`, html);
  }
};
const routes = JSON.parse(readFileSync('tools/gallery-routes.json', 'utf8'));
entries(output, ['uk']);
entries(`${output}/gallery`, [...routes, 'screens']);
writeFileSync(`${output}/.nojekyll`, '');
writeFileSync(
  `${output}/404.html`,
  `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · Vadem</title>
<h1>Page not found</h1><p><a href="${path}">Vadem home</a> · <a href="${path}gallery/">Component gallery</a></p></html>`,
);
console.log(`Static Pages artifact: ${output}; base ${path}; ${routes.length} gallery routes.`);
