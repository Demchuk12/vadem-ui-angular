// Exercise the production artifact on a plain static server, or the deployed public site.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { chromium, expect } from '@playwright/test';

const base = process.env.PAGES_BASE_PATH ?? '/vadem-ui-angular/';
const root = resolve('dist/pages');
const routes = JSON.parse(readFileSync('tools/gallery-routes.json', 'utf8'));
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};
let server;
let browser;
try {
  let url = process.env.PAGES_URL;
  if (!url) {
    server = createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (!pathname.startsWith(base)) {
        res.writeHead(404).end();
        return;
      }
      let file = resolve(root, pathname.slice(base.length));
      if (!(file === root || file.startsWith(`${root}${sep}`)) || !existsSync(file)) {
        res.writeHead(404).end();
        return;
      }
      if (statSync(file).isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { Location: `${pathname}/` }).end();
          return;
        }
        file = `${file}/index.html`;
      }
      if (!existsSync(file)) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    await new Promise((done) => server.listen(0, '127.0.0.1', done));
    url = `http://127.0.0.1:${server.address().port}${base}`;
  }
  assert(url.endsWith('/'), 'PAGES_URL must end with /');
  for (const route of ['', 'uk/', 'gallery/', ...routes.map((r) => `gallery/${r}/`)]) {
    const response = await fetch(new URL(route, url));
    assert.equal(response.status, 200, `HTTP status for ${route}`);
    assert((await response.text()).includes('<base href='), `Missing application shell: ${route}`);
  }
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    // Avatar deliberately demonstrates a missing image in the full gallery, not these routes.
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) =>
    errors.push(`${request.url()}: ${request.failure()?.errorText}`),
  );
  mkdirSync('screenshots/pages', { recursive: true });
  await page.goto(url);
  await expect(page.locator('h1')).toHaveText('Components that stay native.');
  await expect(page.locator('a[href*="localhost"]')).toHaveCount(0);
  const catalog = page.locator('a[lang="en"]').filter({ hasText: /^Button$/ });
  await expect(catalog).toHaveAttribute('href', new URL('gallery/button', url).href);
  await page.screenshot({ path: 'screenshots/pages/site-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Theme: dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: 'screenshots/pages/site-light.png', fullPage: true });
  await page.getByRole('link', { name: 'Українською', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await page.locator('.site-nav a').first().click();
  await expect(page).toHaveURL(/\/uk#components$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'Site overflows on mobile',
  );
  await page.screenshot({ path: 'screenshots/pages/site-uk-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(new URL('gallery/select/', url).href);
  const select = page.getByRole('combobox', { name: 'Місто', exact: true });
  await select.focus();
  await page.keyboard.press('ArrowDown');
  await expect(select).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(select).toBeFocused();
  await page.screenshot({ path: 'screenshots/pages/gallery-dark.png', fullPage: true });
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Select');
  await page.getByRole('radio', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: 'screenshots/pages/gallery-light.png', fullPage: true });
  await page.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Button');
  await page.goto(new URL('gallery/screens/dashboard/', url).href);
  await expect(page.locator('h1')).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  assert.deepEqual(errors, [], 'Browser errors or failed assets');
  console.log(
    `Pages checks passed: ${routes.length} direct gallery routes, EN/UK, reload, assets, themes, mobile, select keyboard.`,
  );
} finally {
  await browser?.close();
  if (server) await new Promise((done) => server.close(done));
}
